import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/header";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsavelSidebar } from "./responsavel-sidebar";

interface ResponsavelLayoutProps {
    children: React.ReactNode;
}

export function ResponsavelLayout({ children }: ResponsavelLayoutProps) {
    // Estado da sidebar (desktop)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed_responsavel');
        return saved === 'true';
    });

    // Estado do menu mobile
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed_responsavel', sidebarCollapsed.toString());
    }, [sidebarCollapsed]);

    // Fechar menu mobile ao redimensionar para desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        let mounted = true;

        const verifyAccess = async (session: any) => {
            try {
                if (!session?.user) {
                    navigate('/familia/login');
                    return;
                }

                console.log('[ResponsavelLayout] Verificando acesso para usuário:', session.user.email);

                // Verificar se o usuário tem filhos vinculados
                const { data: hasKids, error: vinculoError } = await supabase
                    .rpc('check_user_has_students', { p_user_id: session.user.id });

                console.log('[ResponsavelLayout] Tem filhos?', hasKids, 'Erro:', vinculoError);

                if (vinculoError) {
                    console.error('[ResponsavelLayout] Erro ao verificar vínculos:', vinculoError);
                }

                // Se não tem filhos vinculados, bloquear acesso
                if (!hasKids) {
                    toast({
                        title: 'Acesso restrito',
                        description: 'Você não possui filhos cadastrados no sistema. Entre em contato com o transporte escolar.',
                        variant: 'destructive',
                    });
                    setIsAuthenticated(false);
                    await supabase.auth.signOut();
                    navigate('/familia/login');
                    return;
                }

                console.log('[ResponsavelLayout] Acesso permitido!');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('[ResponsavelLayout] Erro ao verificar acesso:', error);
                navigate('/familia/login');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        // Configuração do listener de autenticação
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
    }, [navigate, toast]);

    // Toggle sidebar desktop
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Toggle menu mobile
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
                    <p className="text-muted-foreground">Carregando Área da Família...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black-primary flex">
            {/* Overlay para fechar menu mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar com classe mobile-open quando aberta */}
            <div className={`
                fixed md:relative z-50
                transition-transform duration-300
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <ResponsavelSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={toggleSidebar}
                />
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header com callback para abrir menu mobile - Sticky e fixo no topo */}
                <div className="fixed top-0 left-0 right-0 z-[40]">
                    <Header onMenuClick={toggleMobileMenu} />
                </div>

                <main className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gold/20 pt-[calc(var(--mobile-header-height)+var(--mobile-safe-area))] md:pt-0">
                    <div className="p-mobile-padding-x md:p-10 max-w-7xl mx-auto pb-32 md:pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
