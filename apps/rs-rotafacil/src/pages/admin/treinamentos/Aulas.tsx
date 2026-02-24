import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Plus,
    Search,
    ArrowLeft,
    Edit,
    Trash2,
    Play,
    Video,
    Layout,
    Settings,
    Wand2,
    Link as LinkIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Aula {
    id: string;
    modulo_id: string;
    titulo: string;
    descricao?: string | null;
    link_video: string;
    ordem: number;
    ativo: boolean;
    material_complementar?: string | null;
    created_at: string;
}

interface Modulo {
    id: string;
    titulo: string;
}

export default function AdminTreinamentoAulas() {
    const { moduloId } = useParams<{ moduloId: string }>();
    const navigate = useNavigate();
    const [modulo, setModulo] = useState<Modulo | null>(null);
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAula, setEditingAula] = useState<Aula | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingIA, setIsGeneratingIA] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        link_video: "",
        ordem: 0,
        ativo: true,
        material_complementar: ""
    });

    useEffect(() => {
        if (moduloId) {
            loadModulo();
            loadAulas();
        }
    }, [moduloId]);

    const loadModulo = async () => {
        const { data } = await supabase.from('treinamento_modulos').select('id, titulo').eq('id', moduloId).single();
        if (data) setModulo(data);
    };

    const loadAulas = async () => {
        try {
            const { data, error } = await supabase
                .from('treinamento_aulas')
                .select('*')
                .eq('modulo_id', moduloId)
                .order('ordem', { ascending: true });

            if (error) throw error;
            setAulas(data || []);
        } catch (error) {
            console.error('Erro ao carregar aulas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAulas = aulas.filter(a =>
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const saveAula = async () => {
        setLoading(true);
        try {
            if (editingAula) {
                const { error } = await supabase
                    .from('treinamento_aulas')
                    .update({
                        titulo: formData.titulo,
                        descricao: formData.descricao || null,
                        link_video: formData.link_video,
                        ordem: formData.ordem,
                        ativo: formData.ativo,
                        material_complementar: formData.material_complementar || null
                    })
                    .eq('id', editingAula.id);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Aula atualizada com sucesso!" });
            } else {
                const { error } = await supabase
                    .from('treinamento_aulas')
                    .insert([{
                        ...formData,
                        descricao: formData.descricao || null,
                        material_complementar: formData.material_complementar || null,
                        modulo_id: moduloId
                    }]);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Aula criada com sucesso!" });
            }

            setIsDialogOpen(false);
            resetForm();
            loadAulas();
        } catch (error: any) {
            console.error('Erro ao salvar aula:', error);
            toast({
                title: "Erro",
                description: `Não foi possível salvar a aula: ${error.message || 'Erro de permissão ou conexão'}`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (aula: Aula) => {
        setEditingAula(aula);
        setFormData({
            titulo: aula.titulo,
            descricao: aula.descricao || "",
            link_video: aula.link_video,
            ordem: aula.ordem,
            ativo: aula.ativo,
            material_complementar: aula.material_complementar || ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
        try {
            const { error } = await supabase.from('treinamento_aulas').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Sucesso", description: "Aula excluída!" });
            loadAulas();
        } catch (error) {
            console.error(error);
        }
    };

    const gerarDescricaoIA = async () => {
        if (!formData.titulo) {
            toast({
                title: "Aviso",
                description: "Digite um título para que a IA possa gerar a descrição.",
                variant: "destructive"
            });
            return;
        }

        setIsGeneratingIA(true);
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
                        { role: 'system', content: 'Você é um redator especialista em treinamentos. Escreva uma descrição curta (máximo 200 caracteres) para uma aula de vídeo, destacando o que o aluno vai aprender.' },
                        { role: 'user', content: `Gere uma descrição para a aula: "${formData.titulo}" do módulo "${modulo?.titulo}"` }
                    ]
                })
            });

            const data = await response.json();
            if (data.message) {
                setFormData(prev => ({ ...prev, descricao: data.message }));
                toast({ title: "Sucesso", description: "Descrição gerada com IA!" });
            }
        } catch (error: any) {
            console.error('Erro ao gerar descrição:', error);

            // Fallback Local (Robustez)
            const fallbackDesc = `Nesta aula sobre "${formData.titulo}", você aprenderá os conceitos essenciais e como aplicar esse conhecimento na prática para alavancar seus resultados.`;

            setFormData(prev => ({ ...prev, descricao: fallbackDesc }));

            toast({
                title: "IA Offline (Modo Local)",
                description: "Não foi possível conectar à IA, mas geramos uma descrição padrão para você.",
                variant: "default"
            });

        } finally {
            setIsGeneratingIA(false);
        }
    };

    const resetForm = () => {
        setEditingAula(null);
        setFormData({
            titulo: "",
            descricao: "",
            link_video: "",
            ordem: aulas.length + 1,
            ativo: true,
            material_complementar: ""
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/admin/treinamentos')}
                            className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-12 w-12"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-black text-white flex items-center gap-3">
                                Gestão de <span className="text-gold">{modulo?.titulo}</span>
                            </h1>
                            <p className="text-zinc-500 mt-1">Organize e gerencie as aulas deste módulo.</p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gold text-black font-black hover:bg-gold/90 h-14 px-8 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all active:scale-95">
                                <Plus className="w-5 h-5 mr-2" />
                                Nova Aula
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-[#121212] text-white border-zinc-800 p-0 rounded-[24px] overflow-hidden">
                            <DialogHeader className="p-8 pb-0">
                                <DialogTitle className="text-2xl font-black">{editingAula ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue="conteudo" className="w-full">
                                <div className="px-8 mt-4">
                                    <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full justify-start gap-2">
                                        <TabsTrigger value="conteudo" className="data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-bold transition-all">
                                            <Layout className="w-4 h-4" /> Conteúdo
                                        </TabsTrigger>
                                        <TabsTrigger value="ajustes" className="data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-bold transition-all">
                                            <Settings className="w-4 h-4" /> Configurações
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-8">
                                    <TabsContent value="conteudo" className="space-y-6 mt-0">
                                        <div className="space-y-2">
                                            <Label className="text-white font-bold text-sm">Título da Aula</Label>
                                            <Input
                                                value={formData.titulo}
                                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                                placeholder="Ex: Introdução ao Dashboard"
                                                className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white font-bold text-sm">Link do Vídeo (YouTube)</Label>
                                            <div className="relative">
                                                <Video className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
                                                <Input
                                                    value={formData.link_video}
                                                    onChange={(e) => setFormData({ ...formData, link_video: e.target.value })}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white pl-12"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 relative">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-white font-bold text-sm">Descrição / Resumo</Label>
                                                <button
                                                    onClick={gerarDescricaoIA}
                                                    disabled={isGeneratingIA}
                                                    className="text-gold flex items-center gap-1.5 text-xs font-black hover:opacity-80 transition-all uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    <Wand2 className={`w-3.5 h-3.5 ${isGeneratingIA ? 'animate-pulse' : ''}`} />
                                                    {isGeneratingIA ? 'Gerando...' : 'Gerar com IA'}
                                                </button>
                                            </div>
                                            <Textarea
                                                value={formData.descricao}
                                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                                placeholder="O que será abordado nesta aula..."
                                                className="bg-zinc-900/50 border-zinc-800 min-h-[120px] rounded-xl focus-visible:ring-gold text-white resize-none p-4"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="ajustes" className="space-y-6 mt-0">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Ordem de Exibição</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.ordem}
                                                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                                    className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Status</Label>
                                                <div className="flex items-center h-14 px-4 bg-zinc-900/30 border border-zinc-800 rounded-xl justify-between">
                                                    <span className="text-xs text-zinc-400">Aula Ativa</span>
                                                    <Switch
                                                        checked={formData.ativo}
                                                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                                        className="data-[state=checked]:bg-gold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white font-bold text-sm">Material Complementar (Link)</Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
                                                <Input
                                                    value={formData.material_complementar}
                                                    onChange={(e) => setFormData({ ...formData, material_complementar: e.target.value })}
                                                    placeholder="Ex: Link para PDF ou Drive"
                                                    className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white pl-12"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>

                            <div className="p-8 pt-0 flex gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 h-14 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl font-black text-lg"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={saveAula}
                                    disabled={loading}
                                    className="flex-1 h-14 bg-gold text-black hover:bg-gold/90 rounded-xl shadow-lg shadow-gold/10 font-black text-lg transition-all active:scale-95"
                                >
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2 w-full max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar aulas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 rounded-xl"
                    />
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <p className="text-zinc-500 animate-pulse">Carregando trilha...</p>
                    ) : filteredAulas.map((aula) => (
                        <Card key={aula.id} className="bg-[#121212] border-none group hover:ring-1 hover:ring-gold/30 transition-all rounded-[20px] overflow-hidden p-1 shadow-xl">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gold/5 rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                                        <Play className="w-6 h-6 fill-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white group-hover:text-gold transition-colors tracking-tight">{aula.titulo}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Aula #{aula.ordem}</span>
                                            {aula.material_complementar && (
                                                <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                                                    <LinkIcon className="w-3 h-3" /> Material
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${aula.ativo ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>
                                        {aula.ativo ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(aula)} className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(aula.id)} className="h-10 w-10 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
