import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PagamentoMensal, GanhoExtra, Gasto, ResumoFinanceiro, GanhoExtraFormData, GastoFormData } from '@/types/financeiro';
import { useToast } from '@/hooks/use-toast';

export function useFinanceiro(mes?: number, ano?: number) {
  const [pagamentosMensais, setPagamentosMensais] = useState<PagamentoMensal[]>([]);
  const [ganhosExtras, setGanhosExtras] = useState<GanhoExtra[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    totalGanhos: 0,
    totalGastos: 0,
    saldoFinal: 0,
    totalGanhosMensalidades: 0,
    totalGanhosExtras: 0,
    totalGastosPagos: 0,
    totalGastosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mesAtual = mes || new Date().getMonth() + 1;
  const anoAtual = ano || new Date().getFullYear();

  const fetchPagamentosMensais = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos_mensais')
        .select(`
          *,
          alunos:aluno_id (
            nome_completo,
            van_id
          )
        `)
        .eq('mes', mesAtual)
        .eq('ano', anoAtual)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPagamentosMensais((data || []).map(item => ({
        ...item,
        aluno: item.alunos || undefined
      })) as PagamentoMensal[]);
    } catch (error) {
      console.error('Erro ao buscar pagamentos mensais:', error);
    }
  };

  const fetchGanhosExtras = async () => {
    try {
      const { data, error } = await supabase
        .from('ganhos_extras')
        .select('*')
        .gte('data_ganho', `${anoAtual}-${mesAtual.toString().padStart(2, '0')}-01`)
        .lt('data_ganho', `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}-01`)
        .order('data_ganho', { ascending: false });

      if (error) throw error;
      setGanhosExtras(data as GanhoExtra[] || []);
    } catch (error) {
      console.error('Erro ao buscar ganhos extras:', error);
    }
  };

  const fetchGastos = async () => {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('mes', mesAtual)
        .eq('ano', anoAtual)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGastos(data as Gasto[] || []);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
    }
  };

  const calcularResumo = () => {
    const totalGanhosMensalidades = pagamentosMensais
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + Number(p.valor), 0);

    const totalGanhosExtras = ganhosExtras
      .reduce((sum, g) => sum + Number(g.valor), 0);

    const totalGastosPagos = gastos
      .filter(g => g.status === 'pago')
      .reduce((sum, g) => sum + Number(g.valor), 0);

    const totalGastosPendentes = gastos
      .filter(g => g.status === 'nao_pago')
      .reduce((sum, g) => sum + Number(g.valor), 0);

    const totalGanhos = totalGanhosMensalidades + totalGanhosExtras;
    const totalGastos = totalGastosPagos + totalGastosPendentes;
    const saldoFinal = totalGanhos - totalGastos;

    setResumo({
      totalGanhos,
      totalGastos,
      saldoFinal,
      totalGanhosMensalidades,
      totalGanhosExtras,
      totalGastosPagos,
      totalGastosPendentes,
    });
  };

  const fetchDados = async () => {
    setLoading(true);
    await Promise.all([
      fetchPagamentosMensais(),
      fetchGanhosExtras(),
      fetchGastos(),
    ]);
    setLoading(false);
  };

  const marcarPagamentoComoPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos_mensais')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      setPagamentosMensais(prev =>
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

  const marcarGastoComoPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gastos')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      setGastos(prev =>
        prev.map(g => g.id === id ? {
          ...g,
          status: 'pago' as const,
          data_pagamento: new Date().toISOString().split('T')[0]
        } : g)
      );

      toast({
        title: "Sucesso",
        description: "Gasto marcado como pago!",
      });
    } catch (error) {
      console.error('Erro ao marcar gasto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o gasto.",
        variant: "destructive",
      });
    }
  };

  const criarGanhoExtra = async (data: GanhoExtraFormData) => {
    try {
      const { data: ganho, error } = await supabase
        .from('ganhos_extras')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setGanhosExtras(prev => [ganho as GanhoExtra, ...prev]);
      toast({
        title: "Sucesso",
        description: "Ganho extra adicionado!",
      });
      return ganho;
    } catch (error) {
      console.error('Erro ao criar ganho extra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ganho extra.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const criarGasto = async (data: GastoFormData) => {
    try {
      const gastoData = {
        ...data,
        mes: mesAtual,
        ano: anoAtual,
      };

      const { data: gasto, error } = await supabase
        .from('gastos')
        .insert([gastoData])
        .select()
        .single();

      if (error) throw error;

      setGastos(prev => [gasto as Gasto, ...prev]);
      toast({
        title: "Sucesso",
        description: "Gasto adicionado!",
      });
      return gasto;
    } catch (error) {
      console.error('Erro ao criar gasto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o gasto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const editarGasto = async (id: string, data: Partial<GastoFormData>) => {
    try {
      const { data: gasto, error } = await supabase
        .from('gastos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGastos(prev => prev.map(g => g.id === id ? gasto as Gasto : g));
      toast({
        title: "Sucesso",
        description: "Gasto atualizado!",
      });
      return gasto;
    } catch (error) {
      console.error('Erro ao editar gasto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar o gasto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDados();
  }, [mesAtual, anoAtual]);

  useEffect(() => {
    calcularResumo();
  }, [pagamentosMensais, ganhosExtras, gastos]);

  return {
    pagamentosMensais,
    ganhosExtras,
    gastos,
    resumo,
    loading,
    marcarPagamentoComoPago,
    marcarGastoComoPago,
    criarGanhoExtra,
    criarGasto,
    editarGasto,
    refetch: fetchDados,
  };
}