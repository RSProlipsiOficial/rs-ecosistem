import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Home,
    Users,
    DollarSign,
    FileText,
    CalendarCheck,
    Bell,
    MessageCircle,
    Menu,
    Baby
} from "lucide-react";

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/responsavel" },
    { id: "filhos", label: "Meus Filhos", icon: Baby, path: "/responsavel/filhos" },
    { id: "financeiro", label: "Mensalidades & PIX", icon: DollarSign, path: "/responsavel/financeiro" },
    { id: "presencas", label: "Presenças", icon: CalendarCheck, path: "/responsavel/presencas" },
    { id: "comunicados", label: "Comunicados", icon: Bell, path: "/responsavel/comunicados" },
    { id: "suporte", label: "Suporte", icon: MessageCircle, path: "/responsavel/suporte" },
];

interface ResponsavelSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function ResponsavelSidebar({ collapsed, onToggle }: ResponsavelSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleItemClick = (item: any) => {
        navigate(item.path);
    };

    return (
        <div className={cn(
            "bg-gradient-black border-r border-gold/20 flex flex-col transition-all duration-300 shadow-elegant h-screen sticky top-0 overflow-hidden",
            collapsed ? "w-16" : "w-72"
        )}>
            {/* Logo and Toggle */}
            <div className="p-4 border-b border-gold/10 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-black-primary" />
                        </div>
                        <span className="font-bold text-xl text-gold">Área da Família</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="hover:bg-gold/10 text-gold"
                >
                    <Menu className="w-4 h-4" />
                </Button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent hover:scrollbar-thumb-gold/40 transition-colors">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Button
                            key={item.id}
                            variant="ghost"
                            onClick={() => handleItemClick(item)}
                            className={cn(
                                "w-full justify-start hover:bg-gold/10 text-gray-300 transition-smooth group",
                                collapsed && "justify-center px-2",
                                location.pathname === item.path && "bg-gold/10 text-gold border-r-2 border-gold"
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-gold transition-colors" />
                            {!collapsed && <span className="ml-3 text-left font-medium">{item.label}</span>}
                        </Button>
                    );
                })}
            </nav>

            {/* Footer Info */}
            {!collapsed && (
                <div className="p-4 border-t border-gold/10 text-xs text-center text-muted-foreground">
                    <p>RotaFácil Família</p>
                    <p>© 2025</p>
                </div>
            )}
        </div>
    );
}
