import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LancamentoFinanceiro, ResumoFinanceiro } from '@/types/financeiro';
import { useToast } from '@/hooks/use-toast';

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    totalGanhos: 0,
    totalGastos: 0,
    saldoFinal: 0,
    totalGanhosMensalidades: 0,
    totalMensalidadesPendentes: 0,
    totalMensalidadesPrevistas: 0,
    totalGanhosExtras: 0,
    totalGastosPagos: 0,
    totalGastosPendentes: 0,
    totalGastosEmpresa: 0,
    totalRetiradaDono: 0,
    lucroOperacional: 0,
    lucroLiquido: 0,
    metaProLabore: 6000,
  });
  const [metaProLabore, setMetaProLabore] = useState(() => {
    const saved = localStorage.getItem('meta_pro_labore');
    return saved ? Number(saved) : 6000;
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDados = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM

      const { data, error } = await (supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          aluno:alunos (
            nome_completo,
            turno,
            whatsapp_responsavel,
            dia_vencimento,
            vans (
              nome
            )
          )
        `) as any)
        .eq('user_id', user.id) // FILTRO CRÍTICO: Isolar dados por usuário
        .eq('competencia', mesAtual)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      // REMOVER DUPLICADOS POR ID (Garantia Extra)
      let uniqueData = (data as LancamentoFinanceiro[] || []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

      // DEDUPLICAÇÃO INTELIGENTE DE MENSALIDADES (Pelo mesmo aluno e competência)
      const mensalidadesSet = new Set();
      uniqueData = uniqueData.filter(item => {
        if (item.tipo === 'receita' && item.origem === 'mensalidade' && item.aluno_id) {
          const key = `${item.aluno_id}-${item.competencia}`;
          if (mensalidadesSet.has(key)) {
            // Se já vimos essa mensalidade, priorizar a que tem referencia_id oficial
            const existing = uniqueData.find(u => `${u.aluno_id}-${u.competencia}` === key && u.id !== item.id);
            if (existing && existing.referencia_id?.startsWith('mensalidade-')) return false;
            // Se o atual for o oficial, ele deve ter passado antes ou passará depois. 
            // Para simplificar: se já tem, remove o atual a menos que o atual seja o "melhor".
            return false;
          }
          mensalidadesSet.add(key);
        }
        return true;
      });

      setLancamentos(uniqueData as LancamentoFinanceiro[]);
      calcularResumo(uniqueData as LancamentoFinanceiro[]);
    } catch (error: any) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro ao buscar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularResumo = (dados: LancamentoFinanceiro[]) => {
    const r: ResumoFinanceiro = {
      totalGanhos: 0,
      totalGastos: 0,
      saldoFinal: 0,
      totalGanhosMensalidades: 0,
      totalMensalidadesPendentes: 0,
      totalMensalidadesPrevistas: 0,
      totalGanhosExtras: 0,
      totalGastosPagos: 0,
      totalGastosPendentes: 0,
      totalGastosEmpresa: 0,
      totalRetiradaDono: 0,
      lucroOperacional: 0,
      lucroLiquido: 0,
      metaProLabore: metaProLabore,
    };

    dados.forEach(l => {
      const valor = Number(l.valor) || 0;
      if (l.tipo === 'receita') {
        r.totalGanhos += valor;
        if (l.origem === 'mensalidade') {
          r.totalMensalidadesPrevistas += valor;
          if (l.pagamento_status === 'pago') {
            r.totalGanhosMensalidades += valor;
          } else {
            r.totalMensalidadesPendentes += valor;
          }
        } else {
          r.totalGanhosExtras += valor;
        }
      } else {
        r.totalGastos += valor;
        if (l.pagamento_status === 'pago') {
          r.totalGastosPagos += valor;
        } else {
          r.totalGastosPendentes += valor;
        }

        if (l.alocacao === 'empresa') r.totalGastosEmpresa += valor;
        if (l.alocacao === 'dono') r.totalRetiradaDono += valor;
      }
    });

    r.saldoFinal = r.totalGanhos - r.totalGastos;
    r.lucroOperacional = r.totalGanhos - r.totalGastosEmpresa;
    r.lucroLiquido = r.lucroOperacional - r.totalRetiradaDono;

    setResumo(r);
  };

  const marcarRealizado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lancamentos_financeiros')
        .update({
          pagamento_status: 'pago',
          status: 'realizado',
          data_evento: new Date().toISOString()
        })
        .eq('id', id);

      console.info(`[AUDITORIA FINANCEIRA] Lançamento marcado como pago: ID ${id}.`);

      if (error) throw error;
      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const atualizarStatus = async (id: string, novoStatus: 'pago' | 'pendente') => {
    try {
      const { error } = await supabase
        .from('lancamentos_financeiros')
        .update({
          pagamento_status: novoStatus,
          status: novoStatus === 'pago' ? 'realizado' : 'previsto'
        })
        .eq('id', id);

      if (novoStatus === 'pago') {
        console.info(`[AUDITORIA FINANCEIRA] Status atualizado para PAGO: ID ${id}.`);
      }

      if (error) throw error;
      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const criarLancamento = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Você precisa estar logado para realizar esta ação. Sua sessão pode ter expirado.");
      }

      console.log('Tentando criar lançamento:', { ...data, user_id: user.id });

      const { data: record, error } = await (supabase
        .from('lancamentos_financeiros')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single() as any);

      if (error) {
        console.error('Erro Supabase (criarLancamento):', error);
        throw error;
      }

      fetchDados();
      return record;
    } catch (error: any) {
      console.error('Erro em criarLancamento:', error);
      toast({
        title: "Erro ao criar",
        description: error.message || "Não foi possível salvar o registro.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteLancamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lancamentos_financeiros')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const gerarMensalidades = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const mesAtual = new Date().toISOString().substring(0, 7);
      const [ano, mes] = mesAtual.split('-').map(Number);

      // Buscar alunos ativos
      const { data: alunos, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user?.id)
        .eq('ativo', true);

      if (errorAlunos) throw errorAlunos;

      const novosLancamentos = (alunos || []).map(aluno => {
        return {
          user_id: user?.id,
          tipo: 'receita',
          origem: 'mensalidade',
          categoria: 'OUTROS',
          aluno_id: aluno.id,
          van_id: aluno.van_id,
          descricao: `Mensalidade - ${aluno.nome_completo}`,
          valor: (Number(aluno.valor_mensalidade) || 0) + (Number((aluno as any).valor_letalidade) || 0),
          competencia: mesAtual,
          data_evento: `${mesAtual}-${((aluno as any).dia_vencimento || 10).toString().padStart(2, '0')}`,
          status: 'previsto',
          pagamento_status: 'pendente',
          alocacao: 'empresa',
          referencia_id: `mensalidade-${aluno.id}-${mesAtual}`
        };
      });

      // BUSCAR EQUIPE PARA GERAR SALÁRIOS
      try {
        const { data: teamData } = await supabase.functions.invoke('admin-users-v3', {
          method: 'GET'
        });

        const colaboradores = teamData?.users || [];
        colaboradores.forEach((colab: any) => {
          if (colab.status === 'ativo' && Number(colab.salario) > 0) {
            novosLancamentos.push({
              user_id: user?.id,
              tipo: 'despesa',
              origem: 'manual', // Usar 'manual' para salários
              categoria: 'SALÁRIOS', // Categoria correta no DB
              descricao: `Salário - ${colab.nome}`,
              valor: Number(colab.salario),
              competencia: mesAtual,
              data_evento: `${mesAtual}-01`,
              status: 'previsto',
              pagamento_status: 'pendente',
              alocacao: 'empresa',
              referencia_id: `salario-${colab.id}-${mesAtual}`
            } as any);
          }
        });
      } catch (err) {
        console.error('Erro ao gerar salários:', err);
      }

      // Inserir ou Atualizar no Financeiro Geral
      const { error: errorInsertFinanceiro } = await supabase
        .from('lancamentos_financeiros')
        .upsert(novosLancamentos, { onConflict: 'referencia_id' });

      if (errorInsertFinanceiro) {
        console.error('Erro CRÍTICO em lancamentos_financeiros:', errorInsertFinanceiro);
        throw errorInsertFinanceiro;
      }

      // Inserir ou Atualizar na Gestão de Mensalidades (pagamentos_mensais)
      const novosPagamentosMensais = (alunos || []).map(aluno => ({
        user_id: user?.id,
        aluno_id: aluno.id,
        valor: (Number(aluno.valor_mensalidade) || 0) + (Number((aluno as any).valor_letalidade) || 0),
        mes: mes,
        ano: ano,
        data_vencimento: `${mesAtual}-${((aluno as any).dia_vencimento || 10).toString().padStart(2, '0')}`,
        status: 'nao_pago'
      }));

      const { error: errorInsertPagamentos } = await supabase
        .from('pagamentos_mensais')
        .upsert(novosPagamentosMensais, { onConflict: 'aluno_id,mes,ano' });

      if (errorInsertPagamentos) {
        console.error('Erro CRÍTICO em pagamentos_mensais:', errorInsertPagamentos);
      }

      toast({
        title: "Sucesso",
        description: `Processamento concluído para ${mesAtual}: ${alunos?.length || 0} mensalidades e lançamentos de salários atualizados.`
      });
      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const gerarPix = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-pix', {
        body: { pagamentoId: id }
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro PIX:', error);
      throw error;
    }
  };

  const gerarCheckout = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-checkout', {
        body: { pagamentoId: id }
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro Checkout:', error);
      throw error;
    }
  };



  const limparPendencias = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const mesAtual = new Date().toISOString().substring(0, 7);

      const { error } = await supabase
        .from('lancamentos_financeiros')
        .delete()
        .eq('user_id', user?.id)
        .eq('competencia', mesAtual)
        .eq('pagamento_status', 'pendente')
        .eq('origem', 'mensalidade');

      if (error) throw error;

      toast({
        title: "Pendências Removidas",
        description: "Todas as mensalidades pendentes deste mês foram excluídas."
      });
      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const editarLancamento = async (id: string, updates: any) => {
    try {
      // Buscar registro atual para verificar se é mensalidade
      const { data: existing, error: fetchError } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Sanitizar updates para enviar apenas colunas válidas
      const allowedColumns = [
        'valor', 'data_evento', 'categoria', 'alocacao',
        'pagamento_status', 'status', 'descricao', 'observacoes',
        'competencia', 'tipo', 'origem', 'van_id', 'aluno_id', 'referencia_id'
      ];

      const sanitizedUpdates: any = {};
      allowedColumns.forEach(col => {
        if (updates[col] !== undefined) {
          sanitizedUpdates[col] = updates[col];
        }
      });

      // Atualizar o lançamento
      const { error: updateError } = await supabase
        .from('lancamentos_financeiros')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Se for mensalidade (referencia_id formatado), sincronizar com pagamentos_mensais
      if (existing.referencia_id && existing.referencia_id.startsWith('mensalidade-')) {
        const syncUpdates: any = {};
        if (updates.valor !== undefined) syncUpdates.valor = updates.valor;
        if (updates.data_evento !== undefined) syncUpdates.data_vencimento = updates.data_evento;

        if (Object.keys(syncUpdates).length > 0) {
          await supabase
            .from('pagamentos_mensais')
            .update(syncUpdates)
            .eq('referencia_id', existing.referencia_id as string);
        }
      }

      fetchDados();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  return {
    lancamentos,
    resumo,
    loading,
    onMarcarRealizado: marcarRealizado,
    onCriarLancamento: criarLancamento,
    onEditarLancamento: editarLancamento,
    onDeleteLancamento: deleteLancamento,
    onGerarMensalidades: gerarMensalidades,
    onGerarPix: gerarPix,
    onGerarCheckout: gerarCheckout,
    onLimparPendencias: limparPendencias,
    onAtualizarStatus: atualizarStatus,
    onUpdateMeta: (novaMeta: number) => {
      setMetaProLabore(novaMeta);
      localStorage.setItem('meta_pro_labore', novaMeta.toString());
      fetchDados();
    },
    refetch: fetchDados
  };
}