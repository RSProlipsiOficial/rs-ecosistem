import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed_admin');
    return saved === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed_admin', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async (session: any) => {
      try {
        // Verificar se é admin através da tabela admin_emails (RLS permite o próprio email)
        const { data: adminEmails, error } = await supabase
          .from('admin_emails')
          .select('email')
          .ilike('email', session.user.email);

        if (error) {
          console.error('Erro ao verificar status de admin:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao verificar permissões de acesso.',
            variant: 'destructive',
          });
          navigate('/app');
          return;
        }

        const userIsAdmin = !!adminEmails && adminEmails.length > 0;
        if (!userIsAdmin) {
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar o painel administrativo.',
            variant: 'destructive',
          });
          setIsAuthenticated(false);
          setIsAdmin(false);
          navigate('/app');
          return;
        }

        setIsAuthenticated(true);
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/admin/login');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Listener de auth: apenas atualiza estado e delega verificação (evita deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        navigate('/admin/login');
        return;
      }
      // Deferir chamada ao Supabase fora do callback
      setTimeout(() => {
        if (mounted) verifyAdmin(session);
      }, 0);
    });

    // Inicialização: obter sessão atual após registrar listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setIsLoading(false);
        navigate('/admin/login');
        return;
      }
      verifyAdmin(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden max-w-full">
      {/* Sidebar Desktop */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Sidebar Mobile Overlay (Drawer) */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={cn(
        "fixed inset-y-0 left-0 z-[70] w-[280px] max-w-[85vw] md:hidden transition-transform duration-300 transform shadow-elegant",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <AdminSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Fixo / Sticky */}
        <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        {/* Conteúdo Principal com Scroll Próprio */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
          <div className="p-2 md:p-10 max-w-7xl mx-auto w-full space-y-4 md:space-y-6 pb-32">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}