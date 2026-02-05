import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Aluno, AlunoFormData } from '@/types/alunos';
import { useToast } from '@/hooks/use-toast';
import { usePlanLimits } from '@/hooks/usePlanLimits';

export function useAlunos(vanId?: string) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { limits, refetch: refetchLimits } = usePlanLimits();

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('alunos')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('ativo', true)
        .order('nome_completo');

      if (vanId) {
        query = query.eq('van_id', vanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlunos(data as Aluno[] || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (alunoData: AlunoFormData) => {
    try {
      // Check plan limits BEFORE creating student
      if (limits && !limits.canAddStudent) {
        toast({
          variant: "destructive",
          title: "Limite Atingido",
          description: `Você atingiu o limite de ${limits.max_alunos} alunos do plano ${limits.planName}. Faça upgrade para adicionar mais alunos.`,
        });
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para adicionar alunos.");
      }

      // Separar senha do payload do aluno
      const { cpf, email, senha_responsavel, dia_vencimento, ...restData } = alunoData;

      const payload = {
        ...restData,
        cpf: cpf || null,
        email: email || null,
        dia_vencimento: dia_vencimento || 10,
        van_id: alunoData.van_id || null,
        user_id: session.user.id
      };

      const { data, error } = await supabase
        .from('alunos')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => [...prev, data as Aluno]);

      // ========================================
      // CRIAR CONTA DO RESPONSÁVEL AUTOMATICAMENTE
      // ========================================
      if (email && senha_responsavel) {
        try {
          // Invocar Edge Function para criar usuário (requer service_role)
          const { data: createUserResult, error: createUserError } = await supabase.functions.invoke('create-responsavel-account', {
            body: {
              email: email,
              password: senha_responsavel,
              nome: alunoData.nome_responsavel,
              aluno_id: data.id,
              cpf: cpf
            }
          });

          if (createUserError) {
            console.error('Erro ao criar conta do responsável:', createUserError);
            toast({
              title: "Aviso",
              description: "Aluno cadastrado, mas houve problema ao criar acesso do responsável. Tente novamente ou crie manualmente.",
              variant: "default",
            });
          } else if (createUserResult?.success) {
            toast({
              title: "Acesso Criado!",
              description: `Login criado para ${email}. O responsável pode acessar em /familia/login`,
            });
          }
        } catch (respError) {
          console.error('Erro ao criar acesso do responsável:', respError);
        }
      }


      // Auto-generate payment for current month
      try {
        const today = new Date();
        const mesAtual = today.getMonth() + 1;
        const anoAtual = today.getFullYear();

        // Calculate due date (day from form or default 10)
        const diaVencimento = payload.dia_vencimento || 10;
        const dataVencimento = new Date(anoAtual, mesAtual - 1, diaVencimento);

        const totalValor = Number(payload.valor_mensalidade) + Number(payload.valor_letalidade || 0);

        await supabase.from('pagamentos_mensais').insert({
          aluno_id: data.id,
          mes: mesAtual,
          ano: anoAtual,
          valor: totalValor,
          status: 'nao_pago',
          user_id: session.user.id,
          data_vencimento: dataVencimento.toISOString().split('T')[0]
        });

        toast({
          title: "Financeiro",
          description: "Mensalidade do mês atual gerada automaticamente!",
        });
      } catch (finError) {
        console.error("Erro ao gerar mensalidade inicial:", finError);
        // Don't throw logic error here to not block student creation
      }

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao criar aluno:', error);
      const detail = error.message || error.error_description || "Não foi possível adicionar o aluno.";
      toast({
        title: "Erro de Cadastro",
        description: detail,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAluno = async (id: string, alunoData: Partial<AlunoFormData>) => {
    try {
      // Remover campos que não devem ir para o update
      const { cpf, email, senha_responsavel, ...safeData } = alunoData;

      // Incluir cpf e email se forem fornecidos (agora existem na tabela)
      const payload = {
        ...safeData,
        ...(cpf && { cpf }),
        ...(email && { email }),
      };

      const { data, error } = await supabase
        .from('alunos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If fee was updated, propagate to unpaid monthly payments
      if (alunoData.valor_mensalidade !== undefined || alunoData.valor_letalidade !== undefined) {
        const totalNovo = Number(data.valor_mensalidade || 0) + Number(data.valor_letalidade || 0);

        await supabase
          .from('pagamentos_mensais')
          .update({ valor: totalNovo })
          .eq('aluno_id', id)
          .neq('status', 'pago');
        // Trigger tr_sync_payment_to_ledger will handle lancamentos_financeiros
      }

      setAlunos(prev => prev.map(aluno => aluno.id === id ? data as Aluno : aluno));
      toast({
        title: "Sucesso",
        description: "Aluno e pagamentos pendentes atualizados!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      // 1. Desativar o aluno (Soft delete)
      const { error: errorAluno } = await supabase
        .from('alunos')
        .update({ ativo: false })
        .eq('id', id);

      if (errorAluno) throw errorAluno;

      // 2. Limpar pendências financeiras (Pagamentos Mensais não pagos)
      const { error: errorPagos } = await supabase
        .from('pagamentos_mensais')
        .delete()
        .eq('aluno_id', id)
        .neq('status', 'pago');

      if (errorPagos) console.error('Erro ao limpar pagamentos_mensais:', errorPagos);

      // 3. Limpar lançamentos financeiros pendentes
      const { error: errorLanc } = await supabase
        .from('lancamentos_financeiros')
        .delete()
        .eq('aluno_id', id)
        .eq('pagamento_status', 'pendente');

      if (errorLanc) console.error('Erro ao limpar lancamentos_financeiros:', errorLanc);

      setAlunos(prev => prev.filter(aluno => aluno.id !== id));
      toast({
        title: "Sucesso",
        description: "Aluno e pendências financeiras removidos com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [vanId]);

  return {
    alunos,
    loading,
    createAluno,
    updateAluno,
    deleteAluno,
    refetch: fetchAlunos,
  };
}