import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notificacao {
    tipo: 'mensalidade' | 'despesa';
    quantidade: number;
    valorTotal: number;
}

interface NotificacoesFinanceiras {
    mensalidadesAtrasadas: any[];
    despesasVencidas: any[];
    ocorrenciasPendentes: any[];
    total: number;
    detalhes: Notificacao[];
}

export function useNotificacoes() {
    const [notificacoes, setNotificacoes] = useState<NotificacoesFinanceiras>({
        mensalidadesAtrasadas: [],
        despesasVencidas: [],
        ocorrenciasPendentes: [],
        total: 0,
        detalhes: []
    });
    const [loading, setLoading] = useState(true);

    const fetchNotificacoes = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const hoje = new Date().toISOString().split('T')[0];
            const mesAtual = new Date().toISOString().substring(0, 7);

            // Buscar lançamentos pendentes vencidos com dados do aluno
            const { data: lancamentos, error } = await supabase
                .from('lancamentos_financeiros')
                .select(`
                    *,
                    aluno:alunos (
                        nome_completo,
                        whatsapp_responsavel,
                        ativo
                    )
                `)
                .eq('user_id', user.id)
                .eq('competencia', mesAtual)
                .eq('pagamento_status', 'pendente')
                .lte('data_evento', hoje);

            if (error) throw error;

            // Filtrar apenas lançamentos com alunos válidos (não excluídos e ativos)
            const lancamentosValidos = (lancamentos || []).filter(l =>
                l.aluno !== null && l.aluno.ativo === true
            );

            const mensalidadesAtrasadas = lancamentosValidos.filter(l =>
                l.tipo === 'receita' && l.origem === 'mensalidade'
            );

            const despesasVencidas = lancamentosValidos.filter(l =>
                l.tipo === 'despesa'
            );

            // Buscar ocorrências pendentes (status = 'pendente' ou 'em_analise')
            const { data: ocorrencias, error: ocorrenciasError } = await supabase
                .from('ocorrencias')
                .select(`
                    *,
                    aluno:alunos(nome_completo)
                `)
                .eq('sponsor_id', user.id)
                .in('status', ['pendente', 'em_analise']);

            if (ocorrenciasError) {
                console.error("Erro ao buscar ocorrências no hook:", ocorrenciasError);
            }

            const ocorrenciasPendentes = ocorrencias || [];

            setNotificacoes({
                mensalidadesAtrasadas,
                despesasVencidas,
                ocorrenciasPendentes,
                total: mensalidadesAtrasadas.length + despesasVencidas.length + ocorrenciasPendentes.length,
                detalhes: [
                    {
                        tipo: 'mensalidade',
                        quantidade: mensalidadesAtrasadas.length,
                        valorTotal: mensalidadesAtrasadas.reduce((sum, l) => sum + (Number(l.valor) || 0), 0)
                    },
                    {
                        tipo: 'despesa',
                        quantidade: despesasVencidas.length,
                        valorTotal: despesasVencidas.reduce((sum, l) => sum + (Number(l.valor) || 0), 0)
                    }
                ]
            });
        } catch (error: any) {
            console.error('Erro ao buscar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificacoes();

        // Atualizar a cada 5 minutos
        const interval = setInterval(fetchNotificacoes, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { notificacoes, loading, refetch: fetchNotificacoes };
}
