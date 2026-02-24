import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { Baby, CalendarCheck, DollarSign, Bell, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ResponsavelIndex() {
    const [loading, setLoading] = useState(true);
    const [childrenCount, setChildrenCount] = useState(0);
    const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                // Busca filhos vinculados via RPC para evitar RLS e detectar usuário automaticamente
                const { data: students, error } = await supabase
                    .rpc('get_my_students' as any);

                if (error) throw error;
                const studentList = students || [];
                setChildrenCount(studentList.length);

                // Buscar link de WhatsApp da Van
                if (studentList.length > 0) {
                    const firstVanId = studentList[0].van_id;
                    if (firstVanId) {
                        const { data: vanData } = await supabase
                            .from('vans')
                            .select('whatsapp_group_link')
                            .eq('id', firstVanId)
                            .maybeSingle();

                        setWhatsappLink(vanData?.whatsapp_group_link || null);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const openWhatsAppGroup = () => {
        if (whatsappLink) {
            window.open(whatsappLink, '_blank');
        } else {
            window.location.href = "/responsavel/filhos?openContacts=true";
        }
    };

    return (
        <ResponsavelLayout>
            <div className="space-y-mobile-gap md:space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase italic">Dashboard Família</h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1 font-bold uppercase tracking-widest opacity-70">
                        Controle de rotina e pagamentos
                    </p>
                </div>

                {/* Quick Stats / Shortcuts */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-mobile-gap md:gap-6">
                    {/* Filhos */}
                    <Link to="/responsavel/filhos" className="block">
                        <Card className="bg-black-secondary border-gold/20 hover:border-gold/50 transition-all cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                                <CardTitle className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Filhos</CardTitle>
                                <Baby className="h-4 w-4 text-gold" />
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                <div className="text-2xl font-black text-white italic tracking-tighter">{childrenCount}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Cadastrados</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Próxima Mensalidade */}
                    <Link to="/responsavel/financeiro" className="block">
                        <Card className="bg-black-secondary border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                                <CardTitle className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-500 group-hover:text-green-500 transition-colors">Financeiro</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                <div className="text-2xl font-black text-white italic tracking-tighter">Em dia</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Status atual</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Presença Recente */}
                    <Link to="/responsavel/presencas" className="block">
                        <Card className="bg-black-secondary border-gold/20 hover:border-gold/50 transition-all cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                                <CardTitle className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Presenças</CardTitle>
                                <CalendarCheck className="h-4 w-4 text-gold" />
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                <div className="text-2xl font-black text-white italic tracking-tighter">Hoje</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Ver status</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Grupo da Van (Substituindo Avisos) */}
                    <div className="block cursor-pointer" onClick={openWhatsAppGroup}>
                        <Card className="bg-green-600/10 border-green-500/30 hover:border-green-500 transition-all group h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                                <CardTitle className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-green-500">Grupo da Van</CardTitle>
                                <MessageCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                <div className="text-2xl font-black text-white italic tracking-tighter uppercase transition-colors group-hover:text-green-400">Suporte</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Acessar WhatsApp</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>


                {/* Promo / Info Section */}
                <div className="rounded-2xl md:rounded-[32px] bg-gradient-gold p-6 md:p-10 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-xl md:text-3xl font-black text-black mb-2 italic uppercase">Transporte Inteligente</h2>
                        <p className="text-black/80 font-bold text-sm md:text-lg mb-6 leading-tight">
                            Receba notificações em tempo real quando o transporte chegar ao colégio ou em sua residência.
                        </p>
                        <Button className="w-full md:w-auto h-12 md:h-14 bg-black text-white hover:bg-black/80 border-none font-black uppercase text-xs tracking-widest">
                            Baixar Aplicativo <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    {/* Background Decoration */}
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                            <path fill="#000" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.1C93.5,9,82.2,22.4,70.6,33.2C59,44,47.1,52.2,35.2,59.3C23.3,66.4,11.4,72.4,-1.8,75.5C-15,78.6,-27.2,78.8,-37.9,73.1C-48.6,67.4,-57.8,55.8,-66.3,43.2C-74.8,30.6,-82.6,17,-82.8,3.2C-83,-10.6,-75.6,-24.6,-66.1,-36.8C-56.6,-49,-45,-59.4,-32.4,-67.2C-19.8,-75,-6.2,-80.2,3.9,-86.9L14,-93.6Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>
            </div>
        </ResponsavelLayout>
    );
}
