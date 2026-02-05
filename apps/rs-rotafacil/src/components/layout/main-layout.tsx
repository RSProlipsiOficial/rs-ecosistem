
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TrialCountdownBanner } from "@/components/trial/trial-countdown-banner";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingChat } from "@/components/ai/floating-chat";
import { cn } from "@/lib/utils";


interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed_main');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed_main', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';

        if (!session && !isDemoMode) {
          navigate("/auth");
          return;
        }

        if (isDemoMode) {
          setUserRole('demo');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check both 'tipo_usuario' (new format) and 'user_type' (legacy/auth)
        const tipoUsuario = session.user.user_metadata?.tipo_usuario;
        const userType = session.user.user_metadata?.user_type || 'usuario';

        // Determine effective role
        const effectiveRole = tipoUsuario || userType;
        setUserRole(effectiveRole);

        // Bypass checks for Admin and Team Members
        // Fix: Check for 'colaborador' OR specific roles
        const isAdmin = userType === 'admin' || userType === 'master';
        const isTeam = effectiveRole === 'motorista' || effectiveRole === 'monitora' || userType === 'colaborador';

        if (isAdmin || isTeam) {
          setIsAuthenticated(true);
          setIsLoading(false);

          // Redirect if accessing restricted areas
          if (!isAdmin) {
            const isMonitorPage = location.pathname.startsWith('/monitora');
            const isDriverPage = location.pathname.startsWith('/motorista');
            const isProfilePage = location.pathname.startsWith('/perfil');
            const isSupportPage = location.pathname.startsWith('/suporte');

            if (effectiveRole === 'motorista' && !isDriverPage && !isProfilePage && !isSupportPage) {
              if (location.pathname !== '/motorista') navigate('/motorista');
            } else if (effectiveRole === 'monitora' && !isMonitorPage && !isProfilePage && !isSupportPage) {
              if (location.pathname !== '/monitora') navigate('/monitora');
            } else if (userType === 'colaborador' && !isMonitorPage && !isDriverPage && !isProfilePage && !isSupportPage) {
              // Generic collaborator fallback
              const dest = effectiveRole === 'monitora' ? '/monitora' : (effectiveRole === 'motorista' ? '/motorista' : '/app');
              if (location.pathname !== dest) navigate(dest);
            } else if (!isTeam && (location.pathname === '/upgrade' || location.pathname === '/app')) {
              // Already handled by isActive/isConsultor below, but keeping for safety
              const dest = effectiveRole === 'motorista' ? '/motorista' : (effectiveRole === 'monitora' ? '/monitora' : '/app');
              if (dest !== location.pathname) navigate(dest);
            }
          }
          return;
        }

        // Check Subscription for standard users
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status, expires_at')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const isActive = (subscription?.status === 'active' || subscription?.status === 'trial') &&
          (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

        if (!isActive && location.pathname !== '/upgrade') {
          console.log("Subscription inactive, redirecting to upgrade");
          navigate("/upgrade");
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check profile completeness for consultores
        const isConsultor = effectiveRole === 'consultor';

        if (isConsultor) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('perfil_completo')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!(profile as any)?.perfil_completo && location.pathname !== '/perfil' && location.pathname !== '/upgrade') {
            toast({
              title: "Perfil Incompleto",
              description: "Você precisa completar seu cadastro para liberar o sistema.",
              variant: "destructive"
            });
            navigate("/perfil");
            return;
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
      if ((event === 'SIGNED_OUT' || !session) && !isDemoMode) {
        setIsAuthenticated(false);
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session) {
        checkAuthAndSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
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



  // Otherwise (Owner/Admin), ALWAYS show the full Admin Dashboard.
  return (
    <div className="min-h-screen bg-black-primary text-foreground flex flex-col overflow-hidden">
      <TrialCountdownBanner />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Desktop */}
        <div className="hidden md:block h-full sticky top-0 shrink-0">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Sidebar Mobile (Drawer) */}
        <div
          className={cn(
            "fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300",
            !sidebarCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarCollapsed(true)}
        />
        <div className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[320px] max-w-[85vw] md:hidden transition-transform duration-300 transform shadow-elegant",
          !sidebarCollapsed ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar collapsed={false} onToggle={() => setSidebarCollapsed(true)} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {/* Header Fixo */}
          <div className="sticky top-0 z-50 w-full bg-black-primary border-b border-border/50">
            <Header onMenuClick={() => setSidebarCollapsed(false)} />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-6 custom-scrollbar scroll-smooth pb-[calc(1rem+var(--safe-area-bottom))]">
            <div className="max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
              {children}
            </div>
          </main>

          <FloatingChat />
        </div>
      </div>
    </div>
  );
}