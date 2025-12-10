import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Video, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Menu,
  Shield,
  Home,
  Package,
  Users,
  Brain
} from "lucide-react";

const adminMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
  { id: "apps", label: "Apps Vendidos", icon: BarChart3, path: "/admin/apps" },
  { id: "videos", label: "Vídeos Educacionais", icon: Video, path: "/admin/videos" },
  { id: "tutoriais", label: "Tutoriais", icon: BookOpen, path: "/admin/tutoriais" },
  { id: "suporte", label: "Configurações de Suporte", icon: MessageSquare, path: "/admin/suporte" },
  { id: "site", label: "Site Principal", icon: Settings, path: "/admin/site" },
  { id: "packs", label: "Gerenciar Packs", icon: Package, path: "/admin/packs" },
  { id: "creditos-ia", label: "Créditos RS-IA", icon: Brain, path: "/admin/creditos-ia" },
  { id: "usuarios", label: "Gerenciar Usuários", icon: Users, path: "/admin/usuarios" },
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
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">Admin Panel</span>
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
                location.pathname === item.path && "bg-sidebar-accent text-primary"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
              {!collapsed && <span className="ml-3 text-left">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}