import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Monitor
} from "lucide-react";

const menuItems = [
  { id: "alunos", label: "Alunos", icon: Users, hasSubmenu: false, path: "/alunos" },
  { id: "ia", label: "Inteligência Artificial (RSA)", icon: Brain, hasSubmenu: false, path: "/ia" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, hasSubmenu: false, path: "/financeiro" },
  { id: "mensalidades", label: "Mensalidades", icon: CreditCard, hasSubmenu: false, path: "/mensalidades" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, hasSubmenu: false, path: "/whatsapp" },
  { id: "motorista", label: "Motorista", icon: Car, hasSubmenu: false, path: "/motorista" },
  { id: "monitora", label: "Monitora", icon: UserCheck, hasSubmenu: false, path: "/monitora" },
  { id: "educacao", label: "Educação Financeira", icon: GraduationCap, hasSubmenu: false, path: "/educacao-financeira" },
  { id: "upgrade", label: "Upgrade de Plano", icon: Crown, hasSubmenu: false, path: "/upgrade" },
  { id: "importar", label: "Importar/Exportar", icon: Upload, hasSubmenu: false, path: "/importar" },
  { id: "indicacao", label: "Ganhar com Indicação", icon: Gift, hasSubmenu: false, path: "/indicacao" },
  { id: "suporte", label: "Suporte", icon: Headphones, hasSubmenu: false, path: "/suporte" },
  { id: "perfil", label: "Perfil", icon: User, hasSubmenu: false, path: "/perfil" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: any, subItem?: any) => {
    if (subItem) {
      navigate(subItem.path);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={cn(
      "bg-gradient-black border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-elegant",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-black-primary" />
            </div>
            <span className="font-bold text-xl text-gold">RotaFácil</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="hover:bg-sidebar-accent"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent text-sidebar-foreground transition-smooth group",
                collapsed && "justify-center px-2",
                location.pathname === item.path && "bg-sidebar-accent text-gold"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-gold transition-colors" />
              {!collapsed && <span className="ml-3 text-left">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}