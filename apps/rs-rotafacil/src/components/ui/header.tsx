import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Crown, User, Shield, Settings, ArrowLeft, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncService } from "@/services/syncService";
import { RefreshCw } from "lucide-react";

interface UserProfile {
  avatar_url?: string;
  nome_completo?: string;
}

interface UserPack {
  nome: string;
  tipo: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPack, setUserPack] = useState<UserPack | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [branding, setBranding] = useState<{ logo_url?: string; company_name: string }>(() => {
    const cached = localStorage.getItem('app_branding');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) { }
    }
    return { company_name: "" };
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadBranding = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'branding')
        .maybeSingle();

      if (data?.value) {
        const brandingData = data.value as any;
        setBranding(brandingData);
        localStorage.setItem('app_branding', JSON.stringify(brandingData));
      }
    };

    const loadUserData = async () => {
      try {
        const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';

        if (isDemoMode) {
          setUserName('Empresário VIP');
          setUserEmail('contato@rotafacil.com.br');
          setUserPack({ nome: "Plano Black 4.0", tipo: "vip" });
          setIsAdmin(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');

        // Verificar se é admin através da tabela admin_emails
        const { data: adminEmails, error } = await supabase
          .from('admin_emails')
          .select('email')
          .eq('email', user.email);

        const isUserAdmin = !!adminEmails && adminEmails.length > 0;
        setIsAdmin(isUserAdmin);

        // Tentar obter o nome do perfil ou usar o email
        let displayName = user.email?.split('@')[0] || 'Usuário';

        // Carregar perfil do usuário (se existir)
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('avatar_url, nome_completo')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData?.nome_completo) {
          displayName = profileData.nome_completo;
          setUserProfile(profileData);
        }

        setUserName(displayName);

        const authMeta = user.user_metadata;
        const role = (authMeta?.tipo_usuario || authMeta?.user_type || 'usuario').toLowerCase();

        if (isUserAdmin) {
          setUserPack({ nome: "Administrador", tipo: "admin" });
        } else if (role === 'motorista') {
          setUserPack({ nome: "Motorista", tipo: "motorista" });
        } else if (role === 'monitora') {
          setUserPack({ nome: "Monitora", tipo: "monitora" });
        } else if (authMeta?.plan) {
          setUserPack({ nome: authMeta.plan, tipo: authMeta.tier || 'custom' });
        } else {
          setUserPack({ nome: "Plano Básico", tipo: "basico" });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
    loadBranding();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
      if (isDemoMode) {
        localStorage.removeItem('rs_demo_mode');
        navigate("/demonstracao");
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      navigate("/auth");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      const result = await syncService.syncProfile(user.id);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        // Recarregar dados do perfil se necessário
        window.location.reload(); // Forma simples de atualizar o estado global
      } else {
        toast({
          title: "Atenção",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      toast({
        title: "Erro técnico",
        description: "Falha ao conectar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Gerar iniciais do nome ou email
  const getUserInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="h-14 md:h-20 bg-black/80 backdrop-blur-xl border-b border-gold/15 flex items-center justify-between px-mobile-padding-x md:px-8 shadow-2xl sticky top-0 z-50 transition-all duration-300">
      {/* Seção Esquerda: Menu & Voltar */}
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-gold/60 hover:text-gold hover:bg-gold/10 transition-all rounded-xl h-10 w-10 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-gold/60 hover:text-gold hover:bg-gold/10 transition-all rounded-xl h-10 w-10 shrink-0"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Seção Central: Logo */}
      <div className="flex items-center justify-center shrink-0">
        <div
          className="px-2 md:px-4 py-1 rounded-xl transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: (branding as any).logo_show_bg === true ? ((branding as any).logo_bg_color || '#ffffff') : 'transparent',
            border: (branding as any).logo_show_bg === true ? '1px solid rgba(212,175,55,0.2)' : 'none'
          }}
        >
          <img
            src={branding.logo_url || "/assets/branding/logo-horizontal.png"}
            alt={branding.company_name || "Logo"}
            style={{
              height: window.innerWidth < 768
                ? '28px'
                : `${(branding as any).logo_height || 40}px`
            }}
            className="w-auto object-contain"
          />
        </div>
      </div>

      {/* Seção Direita: Avatar/Menu */}
      <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
        {/* Upgrade Button - Hidden for Team Members, Admin Area, and Guardian Panel */}
        {!(
          userPack?.tipo === 'motorista' ||
          userPack?.tipo === 'monitora' ||
          location.pathname.startsWith('/admin') ||
          location.pathname.startsWith('/responsavel') ||
          isAdmin
        ) && (
            <Button
              variant="outline"
              size="sm"
              className="border-gold text-gold hover:bg-gold hover:text-black-primary"
              asChild
            >
              <Link to="/upgrade">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Link>
            </Button>
          )}

        {/* Sync Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncData}
          disabled={isSyncing}
          className="hidden md:flex border-gold text-gold hover:bg-gold hover:text-black-primary gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:h-12 md:w-12 rounded-full p-0.5 bg-gradient-gold shadow-gold/10 hover:shadow-gold/30 transition-all duration-300">
              <Avatar className="h-full w-full border-2 border-black-primary">
                <AvatarImage src={userProfile?.avatar_url} alt="Avatar do usuário" className="object-cover" />
                <AvatarFallback className="bg-black-secondary text-gold font-black text-[10px] md:text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover border-sidebar-border" align="end" forceMount>
            <div className="px-2 py-1.5 text-sm text-muted-foreground border-b border-sidebar-border">
              <div className="font-medium text-foreground">{userName}</div>
              <div className="text-xs">{userEmail}</div>
              {userPack && (
                <div className="text-xs text-gold font-bold">{userPack.nome}</div>
              )}
            </div>
            <DropdownMenuItem className="hover:bg-sidebar-accent" asChild>
              <Link to="/perfil">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-sidebar-accent text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}