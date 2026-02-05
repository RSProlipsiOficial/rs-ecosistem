
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Bus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function TeamLayout({ children, title }: TeamLayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [branding, setBranding] = useState<{ falcon_url: string; company_name: string; logo_url?: string }>(() => {
        const cached = localStorage.getItem('app_branding');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) { }
        }
        return { falcon_url: "", company_name: "RotaFácil" };
    });

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
        loadBranding();
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    navigate("/auth");
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error checking auth:", error);
                navigate("/auth");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-500" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black-primary text-white flex flex-col">
            {/* Header de Luxo Simplificado */}
            <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gold/15 px-6 h-20 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="relative group flex items-center justify-center">
                        {/* Glow Mist Effect */}
                        <div className="absolute w-64 h-32 bg-gold/10 blur-[80px] rounded-full opacity-40 pointer-events-none" />
                        <div className="absolute w-48 h-24 bg-white/5 blur-[50px] rounded-full opacity-30 pointer-events-none" />
                        <div className="relative">
                            {((branding as any).logo_url || branding.falcon_url) ? (
                                <div
                                    className="px-4 py-2 rounded-xl transition-all duration-300"
                                    style={{
                                        backgroundColor: (branding as any).logo_show_bg === true ? ((branding as any).logo_bg_color || '#ffffff') : 'transparent',
                                        border: (branding as any).logo_show_bg === true ? '1px solid rgba(212,175,55,0.2)' : 'none',
                                        boxShadow: (branding as any).logo_show_bg === true ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    <img
                                        src={(branding as any).logo_url || branding.falcon_url || "/assets/branding/logo-horizontal.png"}
                                        alt={branding.company_name || "Logo"}
                                        style={{ height: `${(branding as any).logo_height || 40}px` }}
                                        className="w-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center border border-gold/30">
                                    <img src="/logo-rotafacil.png" alt="Logo" className="w-7 h-7 object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {branding.company_name && branding.company_name.trim() !== '' && (
                            <span className="font-black text-xl text-gold uppercase tracking-tighter italic leading-none">{branding.company_name}</span>
                        )}
                        {title && <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em] mt-1">{title}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-white/60 hover:text-gold hover:bg-gold/5 uppercase text-[10px] font-bold tracking-widest border border-transparent hover:border-gold/20 rounded-full px-4 transition-all"
                    >
                        <LogOut className="h-3 w-3 mr-2" />
                        Sair
                    </Button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-4 overflow-auto">
                <div className="max-w-xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Footer Mobile (Opcional) */}
            <footer className="p-4 text-center text-xs text-white/20 flex flex-col gap-2">
                <p>{branding.company_name} &copy; {new Date().getFullYear()} - Sistema de Gestão</p>
                <div className="flex justify-center gap-4">
                    <a href="/termos-de-uso" className="hover:text-white/40 transition-colors">Termos</a>
                    <a href="/politica-privacidade" className="hover:text-white/40 transition-colors">Privacidade</a>
                </div>
            </footer>
        </div>
    );
}
