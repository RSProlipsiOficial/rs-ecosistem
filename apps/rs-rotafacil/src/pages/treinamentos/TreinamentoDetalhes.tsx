import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    HelpCircle,
    Sparkles,
    Send,
    Loader2,
    PlayCircle,
    Download,
    Wand2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Aula {
    id: string;
    titulo: string;
    descricao?: string | null;
    link_video: string;
    ordem: number;
    material_complementar?: string | null;
}

interface Modulo {
    id: string;
    titulo: string;
    descricao?: string | null;
}

export default function TreinamentoDetalhes() {
    const { moduloId } = useParams<{ moduloId: string }>();
    const navigate = useNavigate();
    const [modulo, setModulo] = useState<Modulo | null>(null);
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);
    const [progresso, setProgresso] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [enviandoMensagem, setEnviandoMensagem] = useState(false);
    const [mensagemIA, setMensagemIA] = useState("");
    const [chatIA, setChatIA] = useState<{ role: 'user' | 'ia', content: string }[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (moduloId) {
            loadData();
        }
    }, [moduloId]);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: mData } = await supabase.from('treinamento_modulos').select('*').eq('id', moduloId).single();
            setModulo(mData);

            const { data: aData } = await supabase
                .from('treinamento_aulas')
                .select('*')
                .eq('modulo_id', moduloId)
                .eq('ativo', true)
                .order('ordem', { ascending: true });

            setAulas(aData || []);
            if (aData && aData.length > 0) setAulaAtiva(aData[0]);

            const { data: pData } = await supabase
                .from('treinamento_progresso')
                .select('aula_id')
                .eq('user_id', user.id);
            setProgresso(pData?.map(p => p.aula_id) || []);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleConcluir = async (aulaId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const jaConcluida = progresso.includes(aulaId);

            if (jaConcluida) {
                await supabase.from('treinamento_progresso').delete().eq('user_id', user.id).eq('aula_id', aulaId);
                setProgresso(prev => prev.filter(id => id !== aulaId));
            } else {
                await supabase.from('treinamento_progresso').insert({ user_id: user.id, aula_id: aulaId });
                setProgresso(prev => [...prev, aulaId]);
                toast({ title: "Aula concluída!", description: "Progresso salvo.", variant: "default" });
            }
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        let videoId = "";
        if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const enviarParaIA = async (customPrompt?: string) => {
        const textToSend = customPrompt || mensagemIA;
        if (!textToSend.trim()) return;

        setEnviandoMensagem(true);
        if (!customPrompt) {
            setChatIA(p => [...p, { role: 'user', content: textToSend }]);
            setMensagemIA("");
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openrouter-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `Você é o Assistente IA da plataforma de treinamentos.
                            Contexto atual:
                            Aula: "${aulaAtiva?.titulo}"
                            Módulo: "${modulo?.titulo}"
                            Descrição da Aula: "${aulaAtiva?.descricao || 'Sem descrição'}"
                            
                            Responda de forma prestativa, curta e focada no conteúdo. 
                            Se o usuário pedir um RESUMO, liste os pontos principais baseando-se na descrição fornecida.`
                        },
                        { role: 'user', content: textToSend }
                    ]
                })
            });

            const data = await response.json();
            if (data.message) {
                setChatIA(p => [...p, { role: 'ia', content: data.message }]);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erro na IA", description: "Não foi possível conectar ao assistente.", variant: "destructive" });
        } finally {
            setEnviandoMensagem(false);
        }
    };

    const percentualConclusao = aulas.length > 0 ? (progresso.length / aulas.length) * 100 : 0;

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/treinamentos')} className="text-zinc-400 gap-2 p-0 hover:bg-transparent hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Voltar
                    </Button>
                    <div className="flex items-center gap-4 w-72">
                        <div className="flex-1 text-right">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Seu Progresso</span>
                            <div className="flex items-center gap-3">
                                <Progress value={percentualConclusao} className="h-2 bg-zinc-800" />
                                <span className="text-gold font-bold text-sm">{Math.round(percentualConclusao)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
                    <div className="lg:col-span-2 flex flex-col h-full gap-4">
                        <Card className="bg-black border-zinc-800 overflow-hidden shadow-2xl rounded-2xl flex-shrink-0">
                            <div className="aspect-video relative bg-zinc-900 flex items-center justify-center">
                                {aulaAtiva ? (
                                    <iframe
                                        src={getEmbedUrl(aulaAtiva.link_video)}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <div className="text-center text-zinc-600">
                                        <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto" />
                                        <p>Carregando vídeo...</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="flex-1 bg-[#121212] border border-zinc-800 rounded-2xl p-6 overflow-hidden flex flex-col">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-black text-white mb-1">{aulaAtiva?.titulo}</h1>
                                    <p className="text-zinc-500 text-sm">Aula {aulaAtiva?.ordem} • {modulo?.titulo}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => aulaAtiva && toggleConcluir(aulaAtiva.id)}
                                    className={`h-10 px-6 rounded-xl font-bold transition-all ${progresso.includes(aulaAtiva?.id || '')
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-gold text-black hover:bg-gold/90"
                                        }`}
                                >
                                    {progresso.includes(aulaAtiva?.id || '') ? (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Concluída</>
                                    ) : (
                                        "Marcar como Concluída"
                                    )}
                                </Button>
                            </div>

                            <Tabs defaultValue="visao-geral" className="flex-1 flex flex-col">
                                <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 w-full justify-start rounded-xl mb-4">
                                    <TabsTrigger value="visao-geral" className="data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg font-bold px-6">
                                        Visão Geral
                                    </TabsTrigger>
                                    <TabsTrigger value="materiais" className="data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg font-bold px-6">
                                        Materiais
                                    </TabsTrigger>
                                    <TabsTrigger value="ia" className="data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg font-bold px-6 flex gap-2">
                                        <Sparkles className="w-4 h-4" /> Assistente IA
                                    </TabsTrigger>
                                </TabsList>

                                <ScrollArea className="flex-1 pr-4">
                                    <TabsContent value="visao-geral" className="mt-0 text-zinc-400 space-y-4">
                                        <p className="leading-relaxed">
                                            {aulaAtiva?.descricao || "Sem descrição disponível para esta aula."}
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="materiais" className="mt-0">
                                        {aulaAtiva?.material_complementar ? (
                                            <a
                                                href={aulaAtiva.material_complementar}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-gold/50 transition-all group"
                                            >
                                                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-gold transition-colors">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white group-hover:text-gold transition-colors">Material Complementar</h4>
                                                    <p className="text-zinc-500 text-sm">Clique para acessar o arquivo/link</p>
                                                </div>
                                                <Download className="w-5 h-5 text-zinc-500 group-hover:text-gold transition-colors" />
                                            </a>
                                        ) : (
                                            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                                                Nenhum material complementar anexado a esta aula.
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="ia" className="mt-0 h-full flex flex-col">
                                        <div className="flex-1 bg-zinc-900/30 rounded-xl p-4 mb-4 min-h-[200px] space-y-4">
                                            {chatIA.length === 0 && (
                                                <div className="text-center text-zinc-500 py-8">
                                                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gold opacity-50 animate-pulse" />
                                                    <h4 className="text-white font-bold mb-2">Assistente de Aprendizagem</h4>
                                                    <p className="text-sm max-w-[200px] mx-auto mb-6">Eu li o conteúdo desta aula e posso te ajudar com um resumo ou dúvidas.</p>

                                                    <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
                                                        <Button
                                                            onClick={() => enviarParaIA("Pode fazer um resumo estruturado dos pontos principais desta aula para mim?")}
                                                            disabled={enviandoMensagem}
                                                            className="bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20 rounded-xl justify-start h-auto py-3 px-4"
                                                        >
                                                            {enviandoMensagem ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Wand2 className="w-4 h-4 mr-3" />}
                                                            <span className="text-left text-xs line-clamp-1">Gerar Resumo da Aula</span>
                                                        </Button>

                                                        <Button
                                                            onClick={() => enviarParaIA("Quais são os conceitos chave que eu devo dominar após esta aula?")}
                                                            disabled={enviandoMensagem}
                                                            variant="outline"
                                                            className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl justify-start h-auto py-3 px-4 text-xs"
                                                        >
                                                            <HelpCircle className="w-4 h-4 mr-3" />
                                                            Conceitos Chave
                                                        </Button>

                                                        <Button
                                                            onClick={() => enviarParaIA("Como posso aplicar o que aprendi nesta aula na prática?")}
                                                            disabled={enviandoMensagem}
                                                            variant="outline"
                                                            className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl justify-start h-auto py-3 px-4 text-xs"
                                                        >
                                                            <Send className="w-4 h-4 mr-3" />
                                                            Aplicação Prática
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {chatIA.map((msg, i) => (
                                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-gold text-black font-medium' : 'bg-zinc-800 text-zinc-300'}`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-gold"
                                                placeholder="Digite sua dúvida..."
                                                value={mensagemIA}
                                                onChange={(e) => setMensagemIA(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && enviarParaIA()}
                                            />
                                            <Button size="icon" className="bg-gold text-black hover:bg-gold/90" onClick={enviarParaIA} disabled={enviandoMensagem}>
                                                {enviandoMensagem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </div>

                    </div>

                    <div className="bg-[#121212] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-full">
                        <div className="p-6 border-b border-zinc-800 bg-[#1a1a1a]">
                            <h3 className="font-bold text-lg text-white">Conteúdo do Módulo</h3>
                            <p className="text-zinc-500 text-xs mt-1">{aulas.length} Aulas disponíveis</p>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="divide-y divide-zinc-800/50">
                                {aulas.map((aula, idx) => {
                                    const isAtiva = aulaAtiva?.id === aula.id;
                                    const isConcluida = progresso.includes(aula.id);

                                    return (
                                        <button
                                            key={aula.id}
                                            onClick={() => setAulaAtiva(aula)}
                                            className={`w-full flex items-center gap-4 p-5 transition-all hover:bg-zinc-900/50 text-left ${isAtiva ? 'bg-zinc-900 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="flex-shrink-0">
                                                {isConcluida ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : isAtiva ? (
                                                    <PlayCircle className="w-5 h-5 text-gold" />
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full border border-zinc-700 block text-[10px] text-center leading-[18px] text-zinc-500">
                                                        {idx + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${isAtiva ? 'text-white' : 'text-zinc-400'}`}>
                                                    {aula.titulo}
                                                </p>
                                                <span className="text-[10px] text-zinc-600 block mt-0.5">
                                                    Vídeo • 10 min
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </MainLayout >
    );
}
