import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import {
  Users,
  Brain,
  DollarSign,
  CreditCard,
  Car,
  UserCheck,
  GraduationCap,
  PlayCircle,
  MessageSquare,
  Upload,
  Gift,
  Crown,
  Headphones,
  User,
  ChevronDown,
  Menu,
  Bus,
  Monitor,
  Bell,
  Smartphone,
  Shield,
  LogOut,
  Baby
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Brain, hasSubmenu: false, path: "/app" },
  { id: "alunos", label: "Alunos", icon: Users, hasSubmenu: false, path: "/alunos" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, hasSubmenu: false, path: "/financeiro" },
  { id: "mensalidades", label: "Mensalidades", icon: CreditCard, hasSubmenu: false, path: "/mensalidades" },
  { id: "equipe", label: "Colaboradores", icon: UserCheck, hasSubmenu: false, path: "/equipe" },
  { id: "motorista", label: "Motorista", icon: Car, hasSubmenu: false, path: "/motorista" },
  { id: "monitora", label: "Monitora", icon: Monitor, hasSubmenu: false, path: "/monitora" },
  { id: "responsavel", label: "Área da Família", icon: Baby, hasSubmenu: false, path: "/responsavel" },
  { id: "whatsapp", label: "Multi-Agente", icon: Smartphone, hasSubmenu: false, path: "/whatsapp" },
  { id: "central_treinamentos", label: "Central de Treinamentos", icon: GraduationCap, hasSubmenu: false, path: "/treinamentos" },

  { id: "upgrade", label: "Upgrade de Plano", icon: Crown, hasSubmenu: false, path: "/upgrade" },
  { id: "importar", label: "Importar/Exportar", icon: Upload, hasSubmenu: false, path: "/importar" },
  { id: "indicacao", label: "Ganhar com Indicação", icon: Gift, hasSubmenu: false, path: "/indicacao" },
  { id: "suporte", label: "Suporte", icon: Headphones, hasSubmenu: false, path: "/suporte" }, // Renamed per user request
  { id: "perfil", label: "Perfil", icon: User, hasSubmenu: false, path: "/perfil" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { notificacoes } = useNotificacoes();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [falconUrl, setFalconUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState('');
  const [userPack, setUserPack] = useState<{ nome: string; tipo: string } | null>(null);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        console.log("Sidebar: Carregando branding...");
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'branding')
          .maybeSingle();

        if (error) {
          console.error("Sidebar: Erro ao carregar branding:", error);
          return;
        }

        if (data && data.value) {
          const val = data.value as any;
          console.log("Sidebar: Branding carregado:", val);
          if (val.logo_url) setLogoUrl(val.logo_url);
          if (val.falcon_url) setFalconUrl(val.falcon_url);
          if (val.company_name) setCompanyName(val.company_name);
        }
      } catch (err) {
        console.error("Sidebar: Erro inesperado:", err);
      }
    };
    loadBranding();
  }, [location.pathname]); // Re-carregar ao mudar de página para garantir sinc

  useEffect(() => {
    const getUserData = async () => {
      const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';

      if (isDemoMode) {
        setUserName('Empresário VIP');
        setUserRole('demo');
        setUserPack({ nome: "Plano Black 4.0", tipo: "vip" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('nome_completo')
        .eq('user_id', user.id)
        .maybeSingle();

      const name = profile?.nome_completo || user.email?.split('@')[0] || 'Usuário';
      setUserName(name);

      const meta = user.user_metadata;
      const type = meta?.tipo_usuario || meta?.user_type || 'usuario';

      setUserRole(type);

      if (type === 'admin') {
        setUserPack({ nome: "Administrador", tipo: "admin" });
      } else if (type === 'motorista') {
        setUserPack({ nome: "Motorista", tipo: "motorista" });
      } else if (type === 'monitora') {
        setUserPack({ nome: "Monitora", tipo: "monitora" });
      } else {
        // Buscar plano real da assinatura
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(name)')
          .eq('user_id', user.id)
          .in('status', ['active', 'trial'])
          .maybeSingle();

        const planName = (sub as any)?.plan?.name || meta?.plan || "Plano Básico";
        const planTier = (sub as any)?.status === 'trial' ? 'trial' : (meta?.tier || "basico");

        setUserPack({
          nome: planName,
          tipo: planTier
        });
      }

    };
    getUserData();
  }, []);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: any, subItem?: any) => {
    let targetPath = subItem ? subItem.path : item.path;

    // Se for consultor acessando indicação, redirecionar para rota correta
    if (userRole?.toLowerCase() === 'consultor' && item.id === 'indicacao') {
      targetPath = '/consultor/indicacao';
    }

    if (targetPath) {
      navigate(targetPath);
    }

    // Auto-close sidebar on mobile/smaller screens or if requested by user for all screens
    // User requested "feche na hora que eu clicar" specifically to clear the view
    // Auto-close sidebar on mobile only
    if (window.innerWidth < 1024) {
      if (!collapsed) {
        onToggle();
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const role = userRole ? userRole.toLowerCase() : '';

    if (!role) return true;
    if (role === 'admin' || role === 'master') return true;

    // STRICT RULES for Motorista and Monitora
    if (role === 'motorista') {
      // Motorista access: Motorista Dashboard, Monitora Panel (Check-in), Profile, Support
      return ['motorista', 'monitora', 'perfil', 'suporte'].includes(item.id);
    }

    if (role === 'monitora') {
      // Monitora access: Monitora Panel (Check-in), Profile, Support
      return ['monitora', 'perfil', 'suporte'].includes(item.id);
    }

    // STRICT RULES for Consultor - Apenas Indicação, Perfil e Suporte
    if (role === 'consultor') {
      return ['indicacao', 'perfil', 'suporte'].includes(item.id);
    }

    // Default fallback (e.g. Plan Owners) - Show everything except Admin Only
    // This duplicates the user behavior but acts as a catch-all
    return !['admin_only'].includes(item.id);
  });

  return (
    <>
      {/* Overlay para mobile quando sidebar está aberta */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "bg-gradient-black border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-elegant h-screen sticky top-0 z-50",
        "lg:translate-x-0 lg:relative lg:z-auto",
        "fixed inset-y-0 left-0",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-[70px]" : "translate-x-0 w-80 max-w-[85vw]",
        !collapsed && "lg:w-80"
      )}>
        {/* Logo and Toggle */}
        <div className={cn(
          "h-20 border-b border-sidebar-border flex items-center flex-shrink-0 transition-all duration-300",
          collapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="relative flex items-center gap-3 px-3 py-2 bg-gold/10 rounded-xl border border-gold/20 shadow-sm w-full">
                <div className="p-1.5 bg-gold/10 rounded-lg">
                  <Shield className="h-4 w-4 text-gold" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-white uppercase tracking-tighter italic leading-none truncate">{userName}</span>
                  {userPack && (
                    <span className="text-[8px] text-gold/80 font-bold uppercase tracking-widest mt-1 leading-none truncate">
                      {userPack.nome.replace(/Rota\s?Fácil/gi, companyName)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-12 h-12 text-gold hover:bg-gold/10 animate-in zoom-in duration-300"
            >
              <Menu className="w-8 h-8" />
            </Button>
          )}
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-gold hover:bg-gold/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent" translate="no">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div key={item.id} className="relative animate-in slide-in-from-left duration-300">
                <Button
                  variant="ghost"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full transition-all duration-300 group",
                    collapsed ? "justify-center px-0 h-12" : "justify-start px-3",
                    isActive && "bg-gold/10 text-gold shadow-[inset_0_0_10px_rgba(255,215,0,0.05)] border-l-2 border-gold"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors group-hover:text-gold",
                    isActive ? "text-gold" : "text-sidebar-foreground"
                  )} />
                  {!collapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-left truncate">{item.label}</span>
                      {item.id === 'indicacao' && (
                        <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded border border-gold/30 font-bold shrink-0">
                          NOVO
                        </span>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            );
          })}
        </nav>

        {/* Custom Footer Profile - Hidden when collapsed */}
        {!collapsed && (
          <div className="mt-auto border-t border-border/50 p-4 bg-black/20 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gold/5">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black-primary font-bold border border-gold/20 shrink-0">
                {userName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {userName || 'Usuário'}
                </p>
                <p className="text-[10px] text-gold uppercase font-black tracking-widest">
                  {userPack?.nome || 'Basico'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/consultor/login';
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sair do Sistema</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
