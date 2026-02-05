import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlunoComPagamento {
  id: string;
  nome_completo: string;
  nome_responsavel: string;
  whatsapp_responsavel: string;
  valor_mensalidade: number;
  nome_colegio: string;
  van_nome?: string;
  ativo: boolean;
  pagamento_id?: string;
  status_pagamento?: 'pago' | 'nao_pago';
  data_vencimento?: string;
  data_pagamento?: string;
  pagamento_vencido: boolean;
  turno?: string;
}

export function usePagamentosManager(mesAno: string) {
  const [alunos, setAlunos] = useState<AlunoComPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [ano, mes] = mesAno.split('-').map(Number);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar todos os alunos ativos do usuário
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select(`
          id,
          nome_completo,
          nome_responsavel,
          whatsapp_responsavel,
          valor_mensalidade,
          valor_letalidade,
          nome_colegio,
          van_id,
          ativo,
          turno,
          vans:van_id (nome)
        `)
        .eq('user_id', user.id);

      if (alunosError) throw alunosError;

      // Buscar pagamentos do mês do usuário
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('pagamentos_mensais')
        .select('*')
        .eq('user_id', user.id)
        .eq('mes', mes)
        .eq('ano', ano);

      if (pagamentosError) throw pagamentosError;

      // Combinar dados
      const alunosComPagamentos: AlunoComPagamento[] = (alunosData || []).map((aluno) => {
        const pagamento = (pagamentosData || []).find((p) => p.aluno_id === aluno.id);
        const dataVencimento = pagamento?.data_vencimento ? new Date(pagamento.data_vencimento) : null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return {
          id: aluno.id,
          nome_completo: aluno.nome_completo,
          nome_responsavel: aluno.nome_responsavel,
          whatsapp_responsavel: aluno.whatsapp_responsavel,
          valor_mensalidade: (Number(aluno.valor_mensalidade) || 0) + (Number((aluno as any).valor_letalidade) || 0),
          nome_colegio: aluno.nome_colegio || 'Colégio Não Informado',
          van_nome: aluno.vans?.nome,
          ativo: aluno.ativo,
          pagamento_id: pagamento?.id,
          status_pagamento: (pagamento?.status as 'pago' | 'nao_pago') || 'nao_pago',
          data_vencimento: pagamento?.data_vencimento,
          data_pagamento: pagamento?.data_pagamento,
          pagamento_vencido: dataVencimento ? (dataVencimento < hoje && (pagamento?.status) !== 'pago') : false,
          turno: aluno.turno
        };
      });

      setAlunos(alunosComPagamentos);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos alunos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualiza status a partir do ID do aluno. Se não houver pagamento do mês, cria e atualiza.
  const atualizarStatusPagamento = async (alunoId: string, novoStatus: 'pago' | 'nao_pago') => {
    try {
      // Verifica se já existe pagamento do mês/ano para o aluno
      const { data: pagamentoExistente, error: erroBusca } = await supabase
        .from('pagamentos_mensais')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();

      if (erroBusca) throw erroBusca;

      let pagamentoId = pagamentoExistente?.id as string | undefined;

      const hojeStr = new Date().toISOString().split('T')[0];

      if (!pagamentoId) {
        const aluno = alunos.find((a) => a.id === alunoId);
        if (!aluno) throw new Error('Aluno não encontrado');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: novoPagamento, error: errorCriar } = await supabase
          .from('pagamentos_mensais')
          .insert({
            aluno_id: alunoId,
            mes,
            ano,
            valor: aluno.valor_mensalidade,
            status: novoStatus,
            data_pagamento: novoStatus === 'pago' ? hojeStr : null,
            user_id: user.id,
          })
          .select('id')
          .single();

        if (errorCriar) throw errorCriar;
        pagamentoId = novoPagamento?.id;
      } else {
        const updateData: any = {
          status: novoStatus,
          data_pagamento: novoStatus === 'pago' ? hojeStr : null,
        };

        const { error } = await supabase
          .from('pagamentos_mensais')
          .update(updateData)
          .eq('id', pagamentoId);
        if (error) throw error;
      }

      // Atualiza estado local
      setAlunos((prev) =>
        prev.map((aluno) =>
          aluno.id === alunoId
            ? {
              ...aluno,
              pagamento_id: pagamentoId,
              status_pagamento: novoStatus,
              data_pagamento: novoStatus === 'pago' ? hojeStr : undefined,
            }
            : aluno
        )
      );

      toast({
        title: 'Sucesso',
        description: `Pagamento marcado como ${novoStatus === 'pago' ? 'pago' : 'pendente'}!`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar o status do pagamento: ${error?.message || String(error)}`,
        variant: 'destructive',
      });
    }
  };

  const desativarAluno = async (alunoId: string) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ ativo: false })
        .eq('id', alunoId);

      if (error) throw error;

      setAlunos((prev) => prev.map((aluno) => (aluno.id === alunoId ? { ...aluno, ativo: false } : aluno)));

      toast({
        title: 'Sucesso',
        description: 'Aluno desativado por pagamento em atraso.',
      });
    } catch (error) {
      console.error('Erro ao desativar aluno:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o aluno.',
        variant: 'destructive',
      });
    }
  };

  const openWhatsApp = (phone: string, studentName: string) => {
    const message = `Olá! Estou entrando em contato sobre a mensalidade. Podemos conversar?`;
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    fetchAlunos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes]);

  return {
    alunos,
    loading,
    atualizarStatusPagamento,
    desativarAluno,
    openWhatsApp,
    refetch: fetchAlunos,
  };
}
