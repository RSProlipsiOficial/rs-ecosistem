import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseAuthOptions {
    requireAuth?: boolean;
    redirectTo?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

/**
 * Hook de autenticação com controle de acesso
 * 
 * @param options - Opções de configuração
 * @param options.requireAuth - Se true, redireciona para login se não autenticado
 * @param options.redirectTo - Rota para redirecionar após autenticação (padrão: /login)
 * 
 * @example
 * // Proteção de rota - redireciona se não autenticado
 * const { user, loading } = useAuth({ requireAuth: true });
 * 
 * // Sem proteção - apenas verifica estado
 * const { user, isAuthenticated } = useAuth({ requireAuth: false });
 */
export const useAuth = (options: UseAuthOptions = {}): AuthState => {
    const {
        requireAuth = false,
        redirectTo = '/auth',
    } = options;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        // Verificar sessão atual
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.error('Erro ao verificar sessão:', error);
                    setUser(null);
                } else {
                    const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
                    if (isDemoMode) {
                        // Mock user for demo mode
                        setUser({
                            id: 'demo-user-id',
                            email: 'demo@rsprolipsi.com.br',
                            user_metadata: {
                                name: 'Empresário VIP (Demo)',
                                user_type: 'usuario',
                                tipo_usuario: 'usuario',
                                plan: 'Plano Black Gold',
                                tier: 'black'
                            }
                        } as any);
                    } else {
                        setUser(session?.user ?? null);
                    }
                }

                // Redirecionar se necessário
                const isDemoModeNow = localStorage.getItem('rs_demo_mode') === 'true';
                if (requireAuth && !session && !isDemoModeNow) {
                    // Salvar rota atual para redirecionar após login
                    const from = location.pathname + location.search;
                    navigate(redirectTo, {
                        state: { from },
                        replace: true,
                    });
                }
            } catch (error) {
                console.error('Erro na autenticação:', error);
                setUser(null);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        // Listener de mudanças de autenticação
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth event:', event);

            const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
            if (isDemoMode && !session) {
                setUser({
                    id: 'demo-user-id',
                    email: 'demo@rsprolipsi.com.br',
                    user_metadata: {
                        name: 'Empresário VIP (Demo)',
                        user_type: 'usuario',
                        tipo_usuario: 'usuario'
                    }
                } as any);
            } else {
                setUser(session?.user ?? null);
            }

            // Redirecionar após logout
            const isDemoActive = localStorage.getItem('rs_demo_mode') === 'true';
            if (event === 'SIGNED_OUT' && requireAuth && !isDemoActive) {
                navigate(redirectTo, { replace: true });
            }

            // Redirecionar após login
            if (event === 'SIGNED_IN' && location.pathname === redirectTo) {
                const from = (location.state as any)?.from || '/app';
                navigate(from, { replace: true });
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [requireAuth, redirectTo, navigate, location]);

    return {
        user,
        loading,
        isAuthenticated: !!user,
    };
};

/**
 * Hook para pegar dados do usuário do banco
 */
export const useUserData = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setUserData(data);
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    return { userData, loading };
};

/**
 * Hook para logout
 */
export const useSignOut = () => {
    const navigate = useNavigate();

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return { signOut };
};
