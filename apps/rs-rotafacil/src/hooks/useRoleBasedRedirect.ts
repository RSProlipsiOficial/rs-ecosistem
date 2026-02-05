import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para redirecionar usuários para seus dashboards corretos baseado no role
 */
export const useRoleBasedRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectBasedOnRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) return;

            const user = session.user;

            // Obter role do usuário (prioridade: user_metadata > profile > owner_empresas)
            let userRole = user.user_metadata?.user_type;

            // Se não tiver no metadata, buscar do perfil
            if (!userRole) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('user_type')
                    .eq('id', user.id)
                    .single();

                userRole = profile?.user_type;
            }

            // Se ainda não tiver, verificar se é owner
            if (!userRole) {
                const { data: ownerData } = await supabase
                    .from('owner_empresas')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (ownerData) {
                    userRole = 'owner';
                }
            }

            // Redirecionar baseado no role
            const currentPath = window.location.pathname;
            console.log('🔍 useRoleBasedRedirect - Verificando:', {
                userRole,
                currentPath,
                willRedirect: false
            });

            switch (userRole) {
                case 'consultor':
                    if (!currentPath.startsWith('/consultor')) {
                        navigate('/consultor/indicacao', { replace: true });
                    }
                    break;

                case 'owner':
                case 'admin':
                case 'master':
                    // Admins, masters e owners podem acessar qualquer área do sistema
                    // Não forçar redirecionamento automático
                    break;

                case 'motorista':
                    if (!currentPath.startsWith('/motorista')) {
                        navigate('/motorista', { replace: true });
                    }
                    break;

                case 'monitora':
                    if (!currentPath.startsWith('/monitora')) {
                        navigate('/monitora', { replace: true });
                    }
                    break;

                case 'responsavel':
                    if (!currentPath.startsWith('/responsavel') && !currentPath.startsWith('/familia')) {
                        navigate('/responsavel', { replace: true });
                    }
                    break;

                default:
                    // Se não tiver role definido, redirecionar para landing
                    if (currentPath.startsWith('/painel') || currentPath.startsWith('/admin') || currentPath.startsWith('/consultor')) {
                        navigate('/', { replace: true });
                    }
            }
        };

        redirectBasedOnRole();

        // Observar mudanças na sessão
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            redirectBasedOnRole();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);
};

/**
 * Função helper para obter o role do usuário
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Prioridade: metadata > profile > owner_empresas
    let role = user.user_metadata?.user_type;

    if (!role) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', userId)
            .single();

        role = profile?.user_type;
    }

    if (!role) {
        const { data: ownerData } = await supabase
            .from('owner_empresas')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (ownerData) {
            role = 'owner';
        }
    }

    return role;
};
