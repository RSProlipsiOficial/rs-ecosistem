import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send, X, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function FloatingChat() {
    const [branding, setBranding] = useState({ logo_url: "", company_name: "" });
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadBranding = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'branding')
                .maybeSingle();

            if (data?.value) {
                setBranding(data.value as any);
            }
        };
        loadBranding();
    }, []);

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const meta = user.user_metadata;
                const role = meta?.tipo_usuario || meta?.user_type || 'usuario';
                setUserRole(role);
            }
        };
        checkRole();

        if (isOpen) {
            fetchCredits();
            // Load initial greeting if empty
            if (messages.length === 0) {
                setMessages([{
                    id: 'welcome',
                    role: 'assistant',
                    content: `Olá! Sou o assistente virtual da ${branding.company_name}. Como posso ajudar com sua rota ou financeiro hoje?`
                }]);
            }
        }
    }, [isOpen, branding.company_name]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchCredits = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch credits for current month
        const date = new Date();
        const { data } = await supabase
            .from('user_ai_credits')
            .select('creditos_usados, limite_mensal')
            .eq('user_id', user.id)
            .eq('mes', date.getMonth() + 1)
            .eq('ano', date.getFullYear())
            .single();

        if (data) {
            // Se o limite for -1, significa ilimitado
            if (data.limite_mensal === -1) {
                setCredits(-1);
            } else {
                setCredits(data.limite_mensal - data.creditos_usados);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
                return;
            }

            // Check local credit estimation (only if not unlimited)
            if (credits !== null && credits !== -1 && credits <= 0) {
                toast({ title: "Sem créditos", description: "Você atingiu seu limite mensal de IA.", variant: "destructive" });
                setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: '⚠️ Seus créditos de IA acabaram. Recarregue para continuar.' }]);
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openrouter-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    model: 'openai/gpt-3.5-turbo' // or standard model
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar mensagem');
            }

            const aiMsg: Message = { id: Date.now().toString(), role: 'assistant', content: data.message };
            setMessages(prev => [...prev, aiMsg]);

            // Update credits locally
            fetchCredits();

        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao conectar com a IA.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render for team members
    if (userRole === 'motorista' || userRole === 'monitora') return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] shadow-2xl border-gold/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="bg-gradient-gold p-4 rounded-t-lg flex flex-row justify-between items-center space-y-0 text-black">
                        <div className="flex items-center gap-2 text-primary-foreground font-bold">
                            <Bot className="w-6 h-6 text-black" />
                            <span className="text-black">{branding.company_name} IA</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-black hover:bg-black/10" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                                ? 'bg-gold text-black-primary px-4 py-2 shadow-sm'
                                                : 'bg-muted text-foreground px-4 py-2 border border-border/50 shadow-sm'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-3 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-muted/20">
                        <form
                            className="flex w-full gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                        >
                            <Input
                                placeholder={credits !== null && credits !== -1 && credits <= 0 ? "Sem créditos..." : "Digite sua mensagem..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading || (credits !== null && credits !== -1 && credits <= 0)}
                                className="flex-1 text-sm bg-background border-gold/20 focus-visible:ring-gold/30"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || (credits !== null && credits !== -1 && credits <= 0)} className="bg-gold text-black-primary hover:bg-gold/90 transition-colors">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>

                    {credits !== null && (
                        <div className="px-4 py-1 text-[10px] text-center text-muted-foreground bg-background/50 rounded-b-lg border-t border-border/5">
                            Créditos restantes: {credits === -1 ? "Ilimitado" : credits}
                        </div>
                    )}
                </Card>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-gold shadow-lg hover:scale-110 transition-transform duration-200 p-0 border-2 border-white/20 flex items-center justify-center"
                >
                    <Bot className="w-8 h-8 text-black-primary" />
                </Button>
            )}
        </div>
    );
}
