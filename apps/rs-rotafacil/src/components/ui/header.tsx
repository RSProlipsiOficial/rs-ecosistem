import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Crown, User, Shield, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  avatar_url?: string;
  nome_completo?: string;
}

interface UserPack {
  nome: string;
  tipo: string;
}

export function Header() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPack, setUserPack] = useState<UserPack | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');
        
        // Verificar se é admin através da tabela admin_emails
        const { data: adminEmails, error } = await supabase
          .from('admin_emails')
          .select('email')
          .eq('email', user.email);

        if (error) {
          console.error('Erro ao verificar status de admin:', error);
          setIsAdmin(false);
        } else {
          const isUserAdmin = adminEmails && adminEmails.length > 0;
          setIsAdmin(isUserAdmin);
        }

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

        // Simular carregamento do pacote do usuário
        // Aqui você pode implementar a lógica real para buscar o pacote
        if (isAdmin) {
          setUserPack({ nome: "Admin", tipo: "administrador" });
        } else {
          // Exemplo de pack padrão - implementar lógica real
          setUserPack({ nome: "Pack Básico", tipo: "basico" });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
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
    <header className="h-16 bg-gradient-black border-b border-sidebar-border flex items-center justify-between px-6 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
          <Shield className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">{userName}</span>
            {userPack && (
              <span className="text-xs text-primary/70">{userPack.nome}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Upgrade Button */}
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

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-gold">
                <AvatarImage src={userProfile?.avatar_url} alt="Avatar do usuário" />
                <AvatarFallback className="bg-gold text-black-primary font-semibold">
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
                <div className="text-xs text-primary font-medium">{userPack.nome}</div>
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