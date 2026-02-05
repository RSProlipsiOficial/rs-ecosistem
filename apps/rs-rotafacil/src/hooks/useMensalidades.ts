import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  PagamentoComAluno,
  MensalidadeResumo,
  MensalidadeFiltros,
  MensalidadeConfig,
  MensalidadeConfigFormData,
  EnviarMensagemData
} from '@/types/mensalidades';

export function useMensalidades(filtros: MensalidadeFiltros) {
  const [pagamentos, setPagamentos] = useState<PagamentoComAluno[]>([]);
  const [resumo, setResumo] = useState<MensalidadeResumo>({
    totalAlunos: 0,
    totalPagos: 0,
    totalPendentes: 0,
    valorRecebido: 0,
    valorPendente: 0,
  });
  const [config, setConfig] = useState<MensalidadeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPagamentos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('pagamentos_mensais')
        .select(`
          *,
          alunos:aluno_id (
            nome_completo,
            nome_responsavel,
            whatsapp_responsavel,
            nome_colegio,
            van_id,
            dia_vencimento,
            turno,
            ativo,
            vans (
              nome
            )
          )
        `)
        .eq('user_id', session.user.id)
        .eq('mes', filtros.mes)
        .eq('ano', filtros.ano)
        .order('created_at', { ascending: false });

      // Aplicar filtro de status
      // Aplicar filtro de status inicial (se não for array)
      if (typeof filtros.status === 'string') {
        if (filtros.status === 'pagos') {
          query = query.eq('status', 'pago');
        } else if (filtros.status === 'pendentes') {
          query = query.eq('status', 'nao_pago');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      let pagamentosComAluno = (data || []).map(item => {
        const studentRaw = item.alunos;
        const student = Array.isArray(studentRaw) ? studentRaw[0] : studentRaw;
        return {
          ...item,
          aluno: student || undefined
        };
      }) as PagamentoComAluno[];

      // Filtrar apenas pagamentos de alunos ativos
      pagamentosComAluno = pagamentosComAluno.filter(p =>
        p.aluno && p.aluno.ativo === true
      );

      // Aplicar filtro de van
      if (filtros.van_id) {
        pagamentosComAluno = pagamentosComAluno.filter(p =>
          p.aluno?.van_id === filtros.van_id
        );
      }

      // Aplicar filtro de aluno específico
      if (filtros.aluno_id) {
        pagamentosComAluno = pagamentosComAluno.filter(p =>
          p.aluno_id === filtros.aluno_id
        );
      }

      // Aplicar termo de busca
      if (filtros.searchTerm) {
        const term = filtros.searchTerm.toLowerCase();
        pagamentosComAluno = pagamentosComAluno.filter(p =>
          p.aluno?.nome_completo.toLowerCase().includes(term) ||
          p.aluno?.nome_responsavel.toLowerCase().includes(term) ||
          p.aluno?.nome_colegio?.toLowerCase().includes(term) ||
          (p.aluno?.vans as any)?.nome?.toLowerCase().includes(term)
        );
      }

      // Aplicar filtro de colégios (multi-seleção)
      if (filtros.colegios && filtros.colegios.length > 0) {
        pagamentosComAluno = pagamentosComAluno.filter(p =>
          p.aluno?.nome_colegio && filtros.colegios?.includes(p.aluno.nome_colegio)
        );
      }

      // Aplicar filtro de turnos (multi-seleção)
      if (filtros.turnos && filtros.turnos.length > 0) {
        pagamentosComAluno = pagamentosComAluno.filter(p =>
          p.aluno?.turno && filtros.turnos?.includes(p.aluno.turno)
        );
      }

      // Aplicar filtro de status (multi-seleção se for array)
      if (Array.isArray(filtros.status) && filtros.status.length > 0) {
        pagamentosComAluno = pagamentosComAluno.filter(p => {
          const statusMap: Record<string, string> = {
            'pagos': 'pago',
            'pendentes': 'nao_pago'
          };
          const dbStatus = statusMap[p.status] || p.status;
          return filtros.status?.includes(p.status === 'pago' ? 'pagos' : 'pendentes');
        });
      }

      setPagamentos(pagamentosComAluno);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    }
  };

  const fetchConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('mensalidades_config')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setConfig(data);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  const calcularResumo = () => {
    // Contar apenas alunos únicos (não duplicar se houver múltiplos pagamentos do mesmo aluno)
    const alunosUnicos = new Set(pagamentos.map(p => p.aluno_id).filter(Boolean));
    const totalAlunos = alunosUnicos.size;

    const totalPagos = pagamentos.filter(p => p.status === 'pago').length;
    const totalPendentes = pagamentos.filter(p => p.status === 'nao_pago').length;
    const valorRecebido = pagamentos
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + Number(p.valor), 0);
    const valorPendente = pagamentos
      .filter(p => p.status === 'nao_pago')
      .reduce((sum, p) => sum + Number(p.valor), 0);

    setResumo({
      totalAlunos,
      totalPagos,
      totalPendentes,
      valorRecebido,
      valorPendente,
    });
  };

  const fetchDados = async () => {
    setLoading(true);
    await Promise.all([
      fetchPagamentos(),
      fetchConfig(),
    ]);
    setLoading(false);
  };

  const marcarComoPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos_mensais')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      console.info(`[AUDITORIA FINANCEIRA] Baixa manual de mensalidade: ID ${id} pelo usuário.`);

      if (error) throw error;

      setPagamentos(prev =>
        prev.map(p => p.id === id ? {
          ...p,
          status: 'pago' as const,
          data_pagamento: new Date().toISOString().split('T')[0]
        } : p)
      );

      toast({
        title: "Sucesso",
        description: "Pagamento marcado como pago!",
      });
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const marcarStatusPagamento = async (id: string, status: 'pago' | 'nao_pago' | 'pendente') => {
    try {
      const updateData: any = { status };

      if (status === 'pago') {
        updateData.data_pagamento = new Date().toISOString().split('T')[0];
      } else {
        updateData.data_pagamento = null;
      }

      const { error } = await supabase
        .from('pagamentos_mensais')
        .update(updateData)
        .eq('id', id);

      if (status === 'pago') {
        console.info(`[AUDITORIA FINANCEIRA] Mudança de status para PAGO (manual): ID ${id}.`);
      }

      if (error) throw error;

      setPagamentos(prev =>
        prev.map(p => p.id === id ? {
          ...p,
          status: status as any,
          data_pagamento: status === 'pago' ? new Date().toISOString().split('T')[0] : null
        } : p)
      );

      toast({
        title: "Sucesso",
        description: `Pagamento marcado como ${status === 'pago' ? 'pago' : status === 'nao_pago' ? 'não pago' : 'pendente'}!`,
      });
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      });
    }
  };

  const atualizarDataVencimento = async (id: string, dataVencimento: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos_mensais')
        .update({ data_vencimento: dataVencimento })
        .eq('id', id);

      if (error) throw error;

      setPagamentos(prev =>
        prev.map(p => p.id === id ? {
          ...p,
          data_vencimento: dataVencimento
        } : p)
      );

      toast({
        title: "Sucesso",
        description: "Data de vencimento atualizada!",
      });
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a data de vencimento.",
        variant: "destructive",
      });
    }
  };

  const salvarConfig = async (configData: MensalidadeConfigFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('mensalidades_config')
        .upsert({
          ...configData,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração salva!",
      });
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const enviarMensagem = async (dados: EnviarMensagemData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('mensalidades_mensagens')
        .insert([{ ...dados, user_id: session.user.id }]); // Add user_id just in case

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mensagem enviada!",
      });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const gerarMensagemPersonalizada = (
    template: string,
    aluno: string,
    valor: number,
    diasVencimento?: number,
    chavePix?: string
  ): string => {
    return template
      .replace('{aluno}', aluno)
      .replace('{valor}', new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor))
      .replace('{dias}', diasVencimento?.toString() || '0')
      .replace('{pix}', chavePix || 'Consulte a chave Pix');
  };

  useEffect(() => {
    fetchDados();
  }, [
    filtros.mes,
    filtros.ano,
    filtros.status,
    filtros.van_id,
    filtros.searchTerm,
    filtros.aluno_id,
    filtros.colegios,
    filtros.turnos
  ]);

  useEffect(() => {
    calcularResumo();
  }, [pagamentos]);

  return {
    pagamentos,
    resumo,
    config,
    loading,
    marcarComoPago,
    marcarStatusPagamento,
    atualizarDataVencimento,
    salvarConfig,
    enviarMensagem,
    gerarMensagemPersonalizada,
    refetch: fetchDados,
  };
}