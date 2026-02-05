import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompetenciaFechada {
    id: string;
    competencia: string;
    fechado_em: string;
    motivo?: string;
}

export function useFecharCompetencia() {
    const [competenciasFechadas, setCompetenciasFechadas] = useState<CompetenciaFechada[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchCompetenciasFechadas = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('competencias_fechadas')
                .select('*')
                .eq('user_id', user.id)
                .order('competencia', { ascending: false });

            if (error) throw error;
            setCompetenciasFechadas(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar competências fechadas:', error);
        }
    };

    useEffect(() => {
        fetchCompetenciasFechadas();
    }, []);

    const verificarCompetenciaFechada = async (competencia: string): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data } = await supabase
                .from('competencias_fechadas')
                .select('*')
                .eq('user_id', user.id)
                .eq('competencia', competencia)
                .maybeSingle();

            return !!data;
        } catch (error: any) {
            console.error('Erro ao verificar competência:', error);
            return false;
        }
    };

    const fecharCompetencia = async (competencia: string, motivo?: string) => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Não autenticado');

            // Verificar se já está fechada
            const jaFechada = await verificarCompetenciaFechada(competencia);
            if (jaFechada) {
                toast({
                    title: "Atenção",
                    description: "Esta competência já está fechada.",
                    variant: "destructive"
                });
                return;
            }

            const { error } = await supabase
                .from('competencias_fechadas')
                .insert([{
                    competencia,
                    user_id: session.user.id,
                    motivo: motivo || 'Fechamento mensal de rotina'
                }]);

            if (error) throw error;

            toast({
                title: "✅ Competência Fechada",
                description: `Mês ${competencia} foi fechado. Edições requerem permissão especial.`,
            });

            await fetchCompetenciasFechadas();
        } catch (error: any) {
            console.error('Erro ao fechar competência:', error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível fechar a competência.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const reabrirCompetencia = async (competencia: string) => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Não autenticado');

            const { error } = await supabase
                .from('competencias_fechadas')
                .delete()
                .eq('competencia', competencia)
                .eq('user_id', session.user.id);

            if (error) throw error;

            toast({
                title: "✅ Competência Reaberta",
                description: `Mês ${competencia} está novamente disponível para edições.`,
            });

            await fetchCompetenciasFechadas();
        } catch (error: any) {
            console.error('Erro ao reabrir competência:', error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível reabrir a competência.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        competenciasFechadas,
        loading,
        verificarCompetenciaFechada,
        fecharCompetencia,
        reabrirCompetencia,
        refetch: fetchCompetenciasFechadas
    };
}
