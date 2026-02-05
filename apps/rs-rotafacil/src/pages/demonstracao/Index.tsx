import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Calculator, Users, MessageSquare, Play, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Key, Monitor } from "lucide-react";

const DemonstracaoPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [branding, setBranding] = useState({ company_name: "Rota Fácil", logo_url: "" });
    const [demoKey, setDemoKey] = useState("");
    const [configDemoKey, setConfigDemoKey] = useState("DEMO-RS");
    const [videoUrl, setVideoUrl] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const { data: brandingData } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'branding')
                .maybeSingle();

            if (brandingData?.value) {
                setBranding(brandingData.value as any);
            }

            const { data: demoData } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'demo_config')
                .maybeSingle();

            if (demoData?.value) {
                const val = demoData.value as any;
                setConfigDemoKey(val.key || "DEMO-RS");
                setVideoUrl(val.video_url || "");
            }
        };
        loadSettings();
    }, []);

    const handleDemoAccess = () => {
        setIsValidating(true);
        setTimeout(() => {
            let normalizedInput = demoKey.trim().toUpperCase();
            const normalizedConfig = configDemoKey.trim().toUpperCase();

            // Se o input estiver vazio, assumimos que o usuário quer entrar com a chave padrão
            if (!normalizedInput) {
                normalizedInput = normalizedConfig;
                setDemoKey(normalizedConfig);
            }

            if (normalizedInput === normalizedConfig || normalizedInput === "DEMO-ADMIN") {
                toast({
                    title: "Acesso Autorizado!",
                    description: "Redirecionando para o Escritório Virtual VIP...",
                });
                localStorage.setItem('rs_demo_mode', 'true');
                navigate('/app');
            } else {
                toast({
                    variant: "destructive",
                    title: "Chave Inválida",
                    description: "Verifique a chave e tente novamente.",
                });
            }
            setIsValidating(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gold/30">
            {/* Header */}
            <nav className="border-b border-gold/10 bg-black/80 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-gold hover:bg-gold/10 h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-lg font-black tracking-tighter uppercase italic">
                            Demonstração <span className="text-gold">Rota Fácil</span>
                        </span>
                    </div>
                    <Button
                        onClick={() => navigate('/consultor/cadastro?ref=rsprolipsi')}
                        className="bg-gold hover:bg-gold/90 text-black font-black uppercase text-xs tracking-widest px-5 h-9"
                    >
                        Começar Agora
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Demo */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight leading-tight">
                        Veja o <span className="text-gold">Poder</span> do Sistema
                    </h1>
                    <p className="text-white/60 text-base md:text-lg">
                        Explore as principais funcionalidades que transformam a gestão do transporte escolar.
                    </p>
                </div>

                {/* Escritório Virtual Simulator */}
                <div className="grid lg:grid-cols-2 gap-12 items-center py-12 border-y border-gold/5">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/5 border border-gold/10 rounded-full">
                            <Sparkles className="w-3 h-3 text-gold" />
                            <span className="text-xs text-gold font-black uppercase tracking-widest">Experiência VIP</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic italic tracking-tight">
                            Acesse o <span className="text-gold">Escritório Virtual</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed font-medium">
                            Experimente a interface completa de gestão que nossos empresários utilizam. Tenha o controle total do seu negócio na palma da mão.
                        </p>

                        <div className="p-8 bg-black-secondary border border-gold/20 rounded-[2rem] space-y-6 shadow-shadow-elegant backdrop-blur-md">
                            <div className="space-y-3">
                                <Label htmlFor="demoKey" className="text-xs font-black uppercase tracking-widest text-gold opacity-80">Chave de Demonstração VIP</Label>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold/50 group-focus-within:text-gold transition-colors" />
                                    <Input
                                        id="demoKey"
                                        placeholder="INSIRA SUA CHAVE AQUI"
                                        value={demoKey}
                                        onChange={(e) => setDemoKey(e.target.value)}
                                        className="pl-12 h-14 bg-black/50 border-gold/30 focus:border-gold text-white font-black tracking-[0.2em] uppercase placeholder:text-white/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleDemoAccess}
                                disabled={isValidating}
                                className="w-full h-16 bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-light hover:to-gold text-black font-black uppercase tracking-widest shadow-shadow-gold hover:scale-[1.02] transition-all border-none rounded-xl"
                            >
                                {isValidating ? "Validando Chave..." : "Acesso ao meu Negócio"}
                                <Monitor className="ml-3 h-5 w-5" />
                            </Button>
                            <p className="text-sm text-center text-white/80 font-bold uppercase tracking-[0.1em] bg-gold/10 py-2 rounded-lg border border-gold/20">
                                Chave de acesso temporário: <span className="text-gold">{configDemoKey}</span>
                            </p>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-gold/20 to-transparent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <Card className="bg-black border-gold/10 overflow-hidden shadow-2xl relative z-10 rounded-[2.5rem]">
                            <div className="aspect-video bg-gold/5 flex items-center justify-center relative group cursor-pointer">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative z-10 text-center space-y-6">
                                    <div
                                        onClick={() => {
                                            if (videoUrl) {
                                                window.open(videoUrl, '_blank');
                                            } else {
                                                setDemoKey(configDemoKey);
                                                setTimeout(() => handleDemoAccess(), 100);
                                            }
                                        }}
                                        className="w-24 h-24 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto shadow-shadow-gold group-hover:scale-110 transition-transform active:scale-95 border border-white/20 cursor-pointer"
                                    >
                                        <Play className="h-10 w-10 text-black fill-black ml-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-black uppercase tracking-[0.3em] text-gold text-xs animate-pulse">
                                            {videoUrl ? "Assistir Vídeo" : "Acesso Rápido"}
                                        </p>
                                        <p className="text-xs text-white/50 font-bold uppercase tracking-tight">
                                            {videoUrl ? "Clique para ver o app em ação" : "Clique para entrar agora"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Bus, title: "Gestão de Frota", desc: "Checklist diário e manutenção programada." },
                        { icon: Users, title: "Gestão de Alunos", desc: "Informações completas e contatos de emergência." },
                        { icon: Calculator, title: "Financeiro", desc: "Controle de mensalidades e fluxo de caixa." },
                        { icon: MessageSquare, title: "WhatsApp IA", desc: "Avisos automáticos para os pais." }
                    ].map((f, i) => (
                        <Card key={i} className="bg-black border-gold/10 hover:border-gold/40 transition-all group">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-black uppercase text-xs tracking-widest text-white">{f.title}</h3>
                                <p className="text-white/60 text-sm">{f.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Final CTA */}
                <div className="relative overflow-hidden bg-gradient-to-br from-black to-[#0a0a0a] p-10 md:p-16 rounded-[2rem] text-center space-y-8 border border-gold/20 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-white text-2xl md:text-4xl font-black uppercase italic tracking-tight">
                            Sua Frota no <span className="text-gold">Próximo Nível</span>
                        </h2>
                        <p className="text-white/60 font-medium max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                            Não perca mais tempo com planilhas de papel. Profissionalize sua operação hoje mesmo com a Rota Fácil.
                        </p>
                        <Button
                            onClick={() => navigate('/consultor/cadastro?ref=rsprolipsi')}
                            className="bg-gold text-black hover:bg-gold/90 px-10 h-16 font-black uppercase tracking-widest text-base md:text-lg rounded-xl shadow-gold-md hover:scale-[1.02] transition-all"
                        >
                            Quero Começar Agora
                        </Button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 text-center text-white/30 text-xs font-black uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} {branding.company_name} • Inteligência em Gestão Escolar
            </footer>
        </div>
    );
};

export default DemonstracaoPage;
