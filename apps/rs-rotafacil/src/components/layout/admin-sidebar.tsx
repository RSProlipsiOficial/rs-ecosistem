import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  Shield,
  Home,
  Package,
  DollarSign,
  GraduationCap,
  Users,
  Zap,
  Target
} from "lucide-react";

const adminMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, path: "/admin/financeiro" },
  { id: "auditoria", label: "Auditoria", icon: Shield, path: "/admin/auditoria" },
  { id: "apps", label: "Apps Vendidos", icon: BarChart3, path: "/admin/apps" },
  { id: "pixels", label: "Pixels & Rastreamento", icon: Target, path: "/admin/pixels" },
  { id: "treinamentos", label: "Central de Treinamentos", icon: GraduationCap, path: "/admin/treinamentos" },
  { id: "suporte", label: "Suporte", icon: MessageSquare, path: "/admin/suporte" },
  { id: "packs", label: "Gerenciar Packs", icon: Package, path: "/admin/packs" },
  { id: "usuarios", label: "Gerenciar Usuários", icon: Users, path: "/admin/usuarios" },
  { id: "multi_agente", label: "Multi-Agente & Robôs", icon: Zap, path: "/admin/whatsapp" },
  { id: "configuracoes", label: "Configurações", icon: Settings, path: "/admin/configuracoes" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item: any) => {
    navigate(item.path);
    if (window.innerWidth < 768) {
      onToggle(); // Fecha o menu no mobile ao clicar
    }
  };

  return (
    <div className={cn(
      "bg-gradient-black border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-elegant h-screen sticky top-0 overflow-hidden",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black-primary" />
            </div>
            <span className="font-bold text-xl text-gold">Admin Panel</span>
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent hover:scrollbar-thumb-gold/40 transition-colors">
        {adminMenuItems.map((item) => {
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