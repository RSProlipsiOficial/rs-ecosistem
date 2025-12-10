import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
          .eq('email', session.user.email);

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
    setSidebarCollapsed(!sidebarCollapsed);
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
    <div className="min-h-screen bg-background flex">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}