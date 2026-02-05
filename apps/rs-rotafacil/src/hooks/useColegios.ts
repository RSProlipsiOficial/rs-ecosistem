import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Colegio, ColegioFormData, VanColegio } from '@/types/colegios';
import { useToast } from '@/hooks/use-toast';

export function useColegios() {
    const [colegios, setColegios] = useState<Colegio[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchColegios = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('colegios')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('ativo', true)
                .order('nome');

            if (error) throw error;
            setColegios(data as Colegio[] || []);
        } catch (error) {
            console.error('Erro ao buscar colégios:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os colégios.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getColegiosByVan = async (vanId: string): Promise<Colegio[]> => {
        try {
            const { data, error } = await supabase
                .from('van_colegios')
                .select(`
          colegio_id,
          colegios (*)
        `)
                .eq('van_id', vanId);

            if (error) throw error;

            return (data || [])
                .map((item: any) => item.colegios)
                .filter(Boolean) as Colegio[];
        } catch (error) {
            console.error('Erro ao buscar colégios da van:', error);
            return [];
        }
    };

    const createColegio = async (colegioData: ColegioFormData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Usuário não autenticado.");
            }

            // Criar colégio
            const { data: colegio, error: colegioError } = await supabase
                .from('colegios')
                .insert([{
                    nome: colegioData.nome,
                    user_id: session.user.id
                }])
                .select()
                .single();

            if (colegioError) throw colegioError;

            // Associar com vans se fornecido
            if (colegioData.van_ids && colegioData.van_ids.length > 0) {
                const vanAssociations = colegioData.van_ids.map(vanId => ({
                    van_id: vanId,
                    colegio_id: colegio.id
                }));

                const { error: vanError } = await supabase
                    .from('van_colegios')
                    .insert(vanAssociations);

                if (vanError) console.error('Erro ao associar vans:', vanError);
            }

            setColegios(prev => [...prev, colegio as Colegio]);
            toast({
                title: "Sucesso",
                description: "Colégio adicionado com sucesso!",
            });
            return colegio;
        } catch (error: any) {
            console.error('Erro ao criar colégio:', error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível adicionar o colégio.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const updateColegio = async (id: string, colegioData: Partial<ColegioFormData>) => {
        try {
            const { data, error } = await supabase
                .from('colegios')
                .update({ nome: colegioData.nome })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Atualizar associações de vans se fornecido
            if (colegioData.van_ids !== undefined) {
                // Remover associações antigas
                await supabase
                    .from('van_colegios')
                    .delete()
                    .eq('colegio_id', id);

                // Adicionar novas apenas se houver
                if (colegioData.van_ids.length > 0) {
                    const vanAssociations = colegioData.van_ids.map(vanId => ({
                        van_id: vanId,
                        colegio_id: id
                    }));

                    await supabase
                        .from('van_colegios')
                        .insert(vanAssociations);
                }
            }

            setColegios(prev => prev.map(colegio => colegio.id === id ? data as Colegio : colegio));
            toast({
                title: "Sucesso",
                description: "Colégio atualizado com sucesso!",
            });
            return data;
        } catch (error) {
            console.error('Erro ao atualizar colégio:', error);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o colégio.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const deleteColegio = async (id: string) => {
        try {
            const { error } = await supabase
                .from('colegios')
                .update({ ativo: false })
                .eq('id', id);

            if (error) throw error;

            setColegios(prev => prev.filter(colegio => colegio.id !== id));
            toast({
                title: "Sucesso",
                description: "Colégio removido com sucesso!",
            });
        } catch (error) {
            console.error('Erro ao remover colégio:', error);
            toast({
                title: "Erro",
                description: "Não foi possível remover o colégio.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const getVansByColegio = async (colegioId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('van_colegios')
                .select('van_id')
                .eq('colegio_id', colegioId);

            if (error) throw error;
            return (data || []).map(item => item.van_id);
        } catch (error) {
            console.error('Erro ao buscar vans do colégio:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchColegios();
    }, []);

    return {
        colegios,
        loading,
        createColegio,
        updateColegio,
        deleteColegio,
        getColegiosByVan,
        getVansByColegio,
        refetch: fetchColegios,
    };
}
