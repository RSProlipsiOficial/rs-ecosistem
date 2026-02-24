import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Zap, MessageSquare, Workflow, Terminal, Sparkles, Loader2, AlertCircle, Settings2, Globe, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'workflow' | 'status';
    data?: any;
}

export function AIFlowOrchestrator() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Olá! Eu sou o Orquestrador IA do Rota Fácil. Como posso te ajudar a automatizar seu WhatsApp ou n8n hoje?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [n8nUrl, setN8nUrl] = useState('');
    const [n8nApiKey, setN8nApiKey] = useState('');
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('company_settings')
                .select('n8n_url, n8n_api_key')
                .single();

            if (data) {
                setN8nUrl((data as any).n8n_url || '');
                setN8nApiKey((data as any).n8n_api_key || '');
            }
        } catch (error) {
            console.error('Erro ao buscar configs:', error);
        }
    };

    const handleSaveConfigs = async () => {
        setIsSavingConfig(true);
        try {
            const { error } = await (supabase as any)
                .from('company_settings')
                .update({
                    n8n_url: n8nUrl,
                    n8n_api_key: n8nApiKey,
                    updated_at: new Date().toISOString()
                })
                .not('id', 'is', null); // Update o único registro existente

            if (error) throw error;
            toast.success("Configurações do n8n salvas!");
            setIsConfigOpen(false);
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setIsSavingConfig(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Chamada para a Cloud Function do Orquestrador
            const { data, error } = await supabase.functions.invoke('ai-flow-orchestrator', {
                body: {
                    prompt: userMessage,
                    n8n_url: n8nUrl,
                    n8n_api_key: n8nApiKey
                }
            });

            if (error) throw error;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || "Compreendido. Estou processando sua solicitação.",
                type: data.type || 'text',
                data: data.data
            }]);

        } catch (error: any) {
            console.error('Erro no Orquestrador IA:', error);
            toast.error("O Orquestrador está ocupado agora. Tente em alguns instantes.");
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Desculpe, tive um problema de conexão com meus módulos de automação. Você pode tentar repetir o comando?"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-black/40 border-gold/30 flex flex-col h-[500px] md:h-[700px]">
            <CardHeader className="border-b border-gold/30 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 md:p-2 bg-gold/10 rounded-lg">
                            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                        </div>
                        <div>
                            <CardTitle className="text-sm md:text-lg text-gold font-black uppercase tracking-tight">Cérebro IA</CardTitle>
                            <CardDescription className="text-[10px] md:text-sm">Automações inteligentes via chat.</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gold/60 hover:text-gold hover:bg-gold/10">
                                    <Settings2 className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-gold/30 text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-gold flex items-center gap-2">
                                        <Workflow className="w-5 h-5" />
                                        Conexão Direta n8n
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Configure sua API para que o Agente crie os fluxos automaticamente para você.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="url" className="text-gold/80 flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> URL do n8n
                                        </Label>
                                        <Input
                                            id="url"
                                            placeholder="https://seu-n8n.com"
                                            className="bg-black border-gold/20 text-white"
                                            value={n8nUrl}
                                            onChange={(e) => setN8nUrl(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="key" className="text-gold/80 flex items-center gap-2">
                                            <Key className="w-4 h-4" /> API Key
                                        </Label>
                                        <Input
                                            id="key"
                                            type="password"
                                            placeholder="n8n_api_..."
                                            className="bg-black border-gold/20 text-white"
                                            value={n8nApiKey}
                                            onChange={(e) => setN8nApiKey(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleSaveConfigs}
                                        disabled={isSavingConfig}
                                        className="bg-gold text-black hover:bg-gold/80 w-full"
                                    >
                                        {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                                        Salvar e Ativar Agente
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Badge variant="outline" className="border-gold/30 text-gold flex gap-1">
                            <Zap className="w-3 h-3" />
                            Agente Autônomo Ativo
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4 pr-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-4 py-2.5 md:px-5 md:py-3.5 flex gap-2 md:gap-3 shadow-xl ${msg.role === 'user'
                                    ? 'bg-gold text-black ml-4 md:ml-12 font-bold'
                                    : 'bg-zinc-900 border border-gold/40 text-white mr-4 md:mr-12'
                                    }`}>
                                    {msg.role === 'assistant' && <Bot className="w-5 h-5 mt-1 text-gold flex-shrink-0" />}
                                    <div className="space-y-2 w-full">
                                        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                        {msg.type === 'workflow' && (
                                            <div className="mt-3 p-3 bg-black/50 rounded-lg border border-gold/20 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gold font-bold">
                                                    <Workflow className="w-3 h-3" />
                                                    FLUXO GERADO (n8n JSON)
                                                </div>
                                                <code className="block text-[10px] text-green-400 overflow-x-auto max-h-32">
                                                    {JSON.stringify(msg.data, null, 2)}
                                                </code>
                                                <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-gold/30 hover:bg-gold/10 text-gold">
                                                    <Terminal className="w-3 h-3 mr-2" />
                                                    Copiar e Abrir n8n
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-gold/10 rounded-2xl px-4 py-3 flex gap-3 mr-12">
                                    <Loader2 className="w-5 h-5 text-gold animate-spin" />
                                    <p className="text-sm italic text-gray-400">Processando intenção de automação...</p>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-gold/30 bg-black/20">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .ai-input-selection::selection {
                            background-color: #EAB308 !important;
                            color: #000000 !important;
                        }
                        .ai-input-selection {
                            caret-color: #EAB308 !important;
                            background-color: #000000 !important;
                            color: #FFFFFF !important;
                            border-color: rgba(234, 179, 8, 0.5) !important;
                        }
                    `}} />
                    <div className="flex gap-2 relative">
                        <Input
                            placeholder="Digite sua necessidade..."
                            className="bg-black/80 border-gold/50 text-white pr-12 h-11 md:h-14 text-sm md:text-base focus:ring-2 focus:ring-gold focus:border-transparent placeholder:text-gray-500 ai-input-selection"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                            className="absolute right-1 top-1 h-9 w-9 md:h-12 md:w-12 bg-gold hover:bg-gold/80 text-black p-0 shadow-lg shadow-gold/20"
                            onClick={handleSendMessage}
                            disabled={isLoading}
                        >
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </div>
                    <div className="flex gap-4 mt-3 px-2">
                        <button className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 transition-colors">
                            <MessageSquare className="w-3 h-3" />
                            Avisar Novo Lead
                        </button>
                        <button className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 transition-colors">
                            <Zap className="w-3 h-3" />
                            Gatilho Financeiro
                        </button>
                        <button className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 transition-colors">
                            <AlertCircle className="w-3 h-3" />
                            Logs de Erro
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
