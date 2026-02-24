import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/header";
import { MotoristaSidebar } from "./motorista-sidebar";
import { Loader2 } from "lucide-react";

interface MotoristaLayoutProps {
    children: React.ReactNode;
}

export function MotoristaLayout({ children }: MotoristaLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed_motorista');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed_motorista', sidebarCollapsed.toString());
    }, [sidebarCollapsed]);

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const verifyAccess = async (session: any) => {
            try {
                if (!session?.user) {
                    navigate('/auth');
                    return;
                }

                const userType = session.user.user_metadata?.user_type;
                const tipoUsuario = session.user.user_metadata?.tipo_usuario;
                const effectiveRole = tipoUsuario || userType;

                // Apenas motoristas podem acessar
                if (effectiveRole !== 'motorista' && userType !== 'admin' && userType !== 'master') {
                    navigate('/auth');
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('[MotoristaLayout] Erro ao verificar acesso:', error);
                navigate('/auth');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        const setupAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            verifyAccess(session);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!mounted) return;
                verifyAccess(session);
            });

            return () => subscription.unsubscribe();
        };

        const cleanupPromise = setupAuth();

        return () => {
            mounted = false;
            cleanupPromise.then(cleanup => cleanup());
        };
    }, [navigate]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black-primary text-foreground">
            <div className="flex relative">
                <MotoristaSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 w-full relative">
                    <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full custom-scrollbar scroll-smooth">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
