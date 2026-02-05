import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Monitor,
    Shield,
    User,
    Headphones,
    Menu,
    LogOut,
    Users
} from "lucide-react";

const menuItems = [
    { id: "monitora", label: "Lista de Presença", icon: Users, path: "/monitora" },
    { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
    { id: "suporte", label: "Suporte", icon: Headphones, path: "/suporte" },
];

interface MonitoraSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function MonitoraSidebar({ collapsed, onToggle }: MonitoraSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('nome_completo')
                .eq('user_id', user.id)
                .maybeSingle();

            const name = profile?.nome_completo || user.email?.split('@')[0] || 'Monitora';
            setUserName(name);
        };
        getUserData();
    }, []);

    const handleItemClick = (item: any) => {
        if (item.path) {
            navigate(item.path);
        }

        // Auto-close sidebar on mobile
        if (window.innerWidth < 1024 && !collapsed) {
            onToggle();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
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
                {/* Header */}
                <div className={cn(
                    "h-20 border-b border-sidebar-border flex items-center flex-shrink-0 transition-all duration-300",
                    collapsed ? "justify-center px-0" : "justify-between px-6"
                )}>
                    {!collapsed ? (
                        <div className="flex items-center gap-3 animate-in fade-in duration-500">
                            <div className="relative flex items-center gap-3 px-3 py-2 bg-gold/10 rounded-xl bordered border-gold/20 shadow-sm w-full">
                                <div className="p-1.5 bg-gold/10 rounded-lg">
                                    <Monitor className="h-4 w-4 text-gold" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-black text-white uppercase tracking-tighter italic leading-none truncate">{userName}</span>
                                    <span className="text-[8px] text-gold font-bold uppercase tracking-widest mt-1 leading-none truncate">
                                        Monitora
                                    </span>
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
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
                    {!collapsed && menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <div key={item.id} className="relative animate-in slide-in-from-left duration-300">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleItemClick(item)}
                                    className={cn(
                                        "w-full justify-start hover:bg-gold/5 text-sidebar-foreground transition-smooth group",
                                        isActive && "bg-gold/10 text-gold shadow-[inset_0_0_10px_rgba(255,215,0,0.05)] border-l-2 border-gold"
                                    )}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-gold transition-colors" />
                                    <span className="ml-3 text-left">{item.label}</span>
                                </Button>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className="mt-auto border-t border-border/50 p-4 bg-black/20 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gold/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold border border-gold/20 shrink-0">
                                {userName?.[0] || 'M'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                    {userName || 'Monitora'}
                                </p>
                                <p className="text-[10px] text-gold uppercase font-black tracking-widest">
                                    Monitora
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full justify-start px-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = '/auth';
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
