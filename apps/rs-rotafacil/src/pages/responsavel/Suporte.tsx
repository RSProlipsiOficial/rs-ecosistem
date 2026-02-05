import { useState, useEffect } from "react";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle, Phone, Mail, HelpCircle, ExternalLink, MessageSquare, ChevronDown, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

interface Contact {
    role: 'dono' | 'motorista' | 'monitora';
    name: string;
    phone: string;
}

export default function ResponsavelSuporte() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [userEmail, setUserEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSupportData() {
            try {
                setLoading(true);

                // 1. Buscar dados do perfil (e-mail)
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('email')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    setUserEmail(profile?.email || user.email || "");
                }

                // 2. Buscar alunos para pegar o van_id e os contatos
                const { data: students } = await supabase.rpc('get_my_students' as any);
                if (students && (students as any[]).length > 0) {
                    const vanId = (students as any[])[0].van_id;
                    if (vanId) {
                        const { data: rpcData } = await supabase.rpc('get_van_contacts' as any, {
                            p_van_id: vanId
                        });

                        if (rpcData && (rpcData as any[]).length > 0) {
                            setContacts(rpcData as any);
                        } else {
                            // Fallback para o dono da van se o RPC falhar
                            const { data: van } = await supabase
                                .from('vans')
                                .select('user_id')
                                .eq('id', vanId)
                                .single();

                            if (van) {
                                const { data: owner } = await supabase
                                    .from('user_profiles')
                                    .select('nome_completo, telefone')
                                    .eq('user_id', van.user_id)
                                    .maybeSingle();

                                if (owner) {
                                    setContacts([{
                                        role: 'dono',
                                        name: owner.nome_completo || 'Dono da Empresa',
                                        phone: owner.telefone || ''
                                    }]);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar suporte:", error);
            } finally {
                setLoading(false);
            }
        }

        loadSupportData();
    }, []);

    const handleWhatsApp = (phone: string, role: string) => {
        const msg = `Olá! Sou responsável e preciso de suporte sobre o transporte escolar (${role}).`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    const faqItems = [
        {
            q: "Como vejo a localização em tempo real?",
            a: "Você pode acompanhar o trajeto clicando em 'Presenças' no menu lateral. O status é atualizado pela monitora conforme a rota avança."
        },
        {
            q: "Como gerar o boleto/PIX?",
            a: "Acesse a aba 'Mensalidades & PIX'. Lá você encontrará todos os meses em aberto e o botão para gerar o QR Code instantâneo."
        },
        {
            q: "Posso avisar se meu filho não for hoje?",
            a: "Sim! Entre em contato direto com a Monitora da van pelo canal de WhatsApp disponível abaixo."
        },
        {
            q: "Como altero meus dados de cadastro?",
            a: "Para trocar e-mail ou telefone, fale com o suporte do Dono da Empresa de transporte através do canal de atendimento."
        }
    ];

    return (
        <ResponsavelLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                            <MessageCircle className="w-6 h-6 text-black-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Suporte</h1>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Estamos aqui para ajudar. Entre em contato pelos nossos canais oficiais.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Canais de Atendimento */}
                    <div className="lg:col-span-12">
                        <h2 className="text-sm font-black text-gold uppercase tracking-[0.3em] mb-4 italic ml-1">Canais de Atendimento Direto</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-32 bg-black-secondary animate-pulse rounded-2xl border border-gold/10" />)
                            ) : (
                                contacts.map((contact, index) => (
                                    <Card key={index} className="bg-black-secondary border-gold/20 hover:border-gold/40 transition-all shadow-elegant relative overflow-hidden group">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge className={cn(
                                                    "font-black text-[9px] tracking-widest uppercase",
                                                    contact.role === 'dono' ? "bg-gold text-black-primary" : "bg-white/10 text-white"
                                                )}>
                                                    {contact.role === 'dono' ? 'Proprietário' : contact.role}
                                                </Badge>
                                                {contact.role === 'dono' ? <ShieldCheck className="w-4 h-4 text-gold/40" /> : <User className="w-4 h-4 text-white/20" />}
                                            </div>
                                            <CardTitle className="text-white text-lg font-black truncate italic uppercase">
                                                {contact.name || 'Nome não disponível'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={() => handleWhatsApp(contact.phone, contact.role)}
                                                className="w-full bg-black-primary border border-gold/30 hover:bg-gold/10 text-gold font-black uppercase text-[10px] tracking-widest gap-2 h-10"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Chamar no WhatsApp
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* FAQ & Perfil Info */}
                    <div className="lg:col-span-8">
                        <Card className="bg-black-secondary border-gold/10 h-full shadow-elegant overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <CardTitle className="text-white flex items-center gap-2 italic uppercase font-black">
                                    <HelpCircle className="w-5 h-5 text-gold" />
                                    Dúvidas Frequentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqItems.map((item, i) => (
                                        <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                                            <AccordionTrigger className="text-white hover:text-gold text-left font-bold italic py-4">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-400 font-medium leading-relaxed pb-4">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dados de Cadastro */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="bg-black-secondary border-gold/10 shadow-elegant">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Seu E-mail Cadastrado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gold" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-white font-black truncate italic">{userEmail || 'Carregando...'}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Login da Área da Família</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-gold/5 to-transparent border-gold/20 shadow-elegant relative overflow-hidden p-6">
                            <h3 className="text-white font-black italic uppercase mb-2">Precisa alterar o e-mail?</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                Por segurança, a alteração de dados sensíveis deve ser solicitada ao administrador da sua van no canal do Proprietário.
                            </p>
                            <Button variant="ghost" className="text-[10px] font-black text-gold uppercase p-0 h-auto hover:bg-transparent" onClick={() => {
                                const owner = contacts.find(c => c.role === 'dono');
                                if (owner) handleWhatsApp(owner.phone, 'Dono');
                            }}>
                                Solicitar alteração <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </ResponsavelLayout>
    );
}
