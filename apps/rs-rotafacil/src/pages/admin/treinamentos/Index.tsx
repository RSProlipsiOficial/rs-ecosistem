import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Plus, Search, Edit, Trash2, ArrowLeft, GraduationCap,
    Play, BookOpen, Brain, Sparkles, ChevronRight, Save,
    X, Check, Layout, Settings, Wand2, TrendingUp, Users, ShieldCheck, PlayCircle,
    School, Library, Languages, History, Globe, Calculator, Wallet, Banknote, CreditCard, Coins,
    BarChart3, PieChart, Receipt, DollarSign, Laptop, Code2, Database, Network, Cpu, Smartphone,
    Briefcase, Calendar, ClipboardList, Target, Award, FileText, Handshake, Video, Image, Music,
    Mic, Headphones, Lock, Key, AlertTriangle, Lightbulb, Zap, Rocket, Truck, Car, Bus, MapPin, Navigation,
    FolderOpen, Package as PackageIcon, Layers, ChevronLeft, Link as LinkIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Curso {
    id: string;
    titulo: string;
    descricao?: string | null;
    icone: string;
    ativo: boolean;
    ordem: number;
    created_at: string;
}

interface Modulo {
    id: string;
    titulo: string;
    descricao?: string | null;
    icone: string;
    ativo: boolean;
    ordem: number;
    curso_id?: string | null;
    created_at: string;
}

const ICONS = [
    { name: 'GraduationCap', icon: GraduationCap, label: 'Graduação' },
    { name: 'BookOpen', icon: BookOpen, label: 'Livro/Leitura' },
    { name: 'School', icon: School, label: 'Escola' },
    { name: 'Library', icon: Library, label: 'Biblioteca' },
    { name: 'Languages', icon: Languages, label: 'Idiomas' },
    { name: 'History', icon: History, label: 'Histórico' },
    { name: 'Globe', icon: Globe, label: 'Mundo' },
    { name: 'TrendingUp', icon: TrendingUp, label: 'Crescimento' },
    { name: 'Calculator', icon: Calculator, label: 'Calculadora' },
    { name: 'Wallet', icon: Wallet, label: 'Carteira' },
    { name: 'Banknote', icon: Banknote, label: 'Dinheiro' },
    { name: 'CreditCard', icon: CreditCard, label: 'Cartão' },
    { name: 'Coins', icon: Coins, label: 'Moedas' },
    { name: 'BarChart3', icon: BarChart3, label: 'Gráfico' },
    { name: 'PieChart', icon: PieChart, label: 'Setores' },
    { name: 'Receipt', icon: Receipt, label: 'Recibo' },
    { name: 'DollarSign', icon: DollarSign, label: 'Cifrão' },
    { name: 'Laptop', icon: Laptop, label: 'Computador' },
    { name: 'Code2', icon: Code2, label: 'Código' },
    { name: 'Database', icon: Database, label: 'Banco de Dados' },
    { name: 'Network', icon: Network, label: 'Rede/Conexão' },
    { name: 'Cpu', icon: Cpu, label: 'Processamento' },
    { name: 'Smartphone', icon: Smartphone, label: 'Celular' },
    { name: 'Layout', icon: Layout, label: 'Layout' },
    { name: 'Settings', icon: Settings, label: 'Ajustes' },
    { name: 'Users', icon: Users, label: 'Equipe' },
    { name: 'Briefcase', icon: Briefcase, label: 'Trabalho' },
    { name: 'Calendar', icon: Calendar, label: 'Calendário' },
    { name: 'ClipboardList', icon: ClipboardList, label: 'Lista/Checklist' },
    { name: 'Target', icon: Target, label: 'Objetivo/Meta' },
    { name: 'Award', icon: Award, label: 'Prêmio/Reconhecimento' },
    { name: 'Search', icon: Search, label: 'Busca' },
    { name: 'FileText', icon: FileText, label: 'Documento' },
    { name: 'Handshake', icon: Handshake, label: 'Parceria' },
    { name: 'PlayCircle', icon: PlayCircle, label: 'Vídeo/Play' },
    { name: 'Video', icon: Video, label: 'Câmera' },
    { name: 'Image', icon: Image, label: 'Imagem' },
    { name: 'Music', icon: Music, label: 'Som' },
    { name: 'Mic', icon: Mic, label: 'Microfone' },
    { name: 'Headphones', icon: Headphones, label: 'Fone' },
    { name: 'ShieldCheck', icon: ShieldCheck, label: 'Segurança OK' },
    { name: 'Lock', icon: Lock, label: 'Cadeado' },
    { name: 'Key', icon: Key, label: 'Chave' },
    { name: 'AlertTriangle', icon: AlertTriangle, label: 'Alerta' },
    { name: 'Sparkles', icon: Sparkles, label: 'Especial' },
    { name: 'Brain', icon: Brain, label: 'Inteligência' },
    { name: 'Lightbulb', icon: Lightbulb, label: 'Ideia' },
    { name: 'Zap', icon: Zap, label: 'Energia/Rápido' },
    { name: 'Rocket', icon: Rocket, label: 'Foguete' },
    { name: 'Truck', icon: Truck, label: 'Caminhão' },
    { name: 'Car', icon: Car, label: 'Carro/Van' },
    { name: 'Bus', icon: Bus, label: 'Ônibus' },
    { name: 'MapPin', icon: MapPin, label: 'Localização' },
    { name: 'Navigation', icon: Navigation, label: 'Navegação' }
];

export default function AdminTreinamentosIndex() {
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [selectedAdminCourseId, setSelectedAdminCourseId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("pacotes");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [selectedToLink, setSelectedToLink] = useState<string[]>([]);
    const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
    const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingIA, setIsGeneratingIA] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        icone: "GraduationCap",
        ativo: true,
        ordem: 0,
        curso_id: "none"
    });

    const [courseFormData, setCourseFormData] = useState({
        titulo: "",
        descricao: "",
        icone: "PackageIcon",
        ativo: true,
        ordem: 0
    });

    const selectedAdminCourse = cursos.find(c => c.id === selectedAdminCourseId);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([loadModulos(), loadCursos()]);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCursos = async () => {
        try {
            const { data, error } = await (supabase
                .from('treinamento_cursos' as any)
                .select('*')
                .order('ordem', { ascending: true }) as any);

            if (error) throw error;
            setCursos(data || []);
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    };

    const loadModulos = async () => {
        try {
            const { data, error } = await (supabase
                .from('treinamento_modulos' as any)
                .select('*')
                .order('ordem', { ascending: true }) as any);

            if (error) throw error;
            setModulos(data || []);
        } catch (error) {
            console.error('Erro ao carregar módulos:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os módulos.",
                variant: "destructive",
            });
        }
    };

    const filteredModulos = modulos.filter(m => {
        const search = searchTerm.toLowerCase();
        const titleMatch = (m.titulo || "").toLowerCase().includes(search);
        const descMatch = (m.descricao || "").toLowerCase().includes(search);

        const matchesSearch = titleMatch || descMatch;
        const courseMatch = selectedAdminCourseId
            ? m.curso_id === selectedAdminCourseId
            : true;

        return matchesSearch && courseMatch;
    });

    const saveModulo = async () => {
        setLoading(true);
        try {
            const payload: any = {
                titulo: formData.titulo,
                descricao: formData.descricao || null,
                icone: formData.icone,
                ativo: formData.ativo,
                ordem: formData.ordem,
                curso_id: formData.curso_id === "none" ? null : formData.curso_id
            };

            if (editingModulo) {
                const { error } = await supabase
                    .from('treinamento_modulos' as any)
                    .update(payload)
                    .eq('id', editingModulo.id);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Módulo atualizado com sucesso!" });
            } else {
                const { error } = await supabase
                    .from('treinamento_modulos' as any)
                    .insert([payload]);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Módulo criado com sucesso!" });
            }

            setIsDialogOpen(false);
            resetForm();
            loadModulos();
        } catch (error: any) {
            console.error('Erro ao salvar módulo:', error);
            toast({
                title: "Erro",
                description: `Não foi possível salvar o módulo: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (modulo: Modulo) => {
        setEditingModulo(modulo);
        setFormData({
            titulo: modulo.titulo,
            descricao: modulo.descricao || "",
            icone: modulo.icone,
            ativo: modulo.ativo,
            ordem: modulo.ordem,
            curso_id: modulo.curso_id || "none"
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas vinculadas também serão removidas.')) return;

        try {
            const { error } = await supabase
                .from('treinamento_modulos' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Sucesso", description: "Módulo excluído com sucesso!" });
            loadModulos();
        } catch (error) {
            console.error('Erro ao excluir módulo:', error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir o módulo.",
                variant: "destructive",
            });
        }
    };

    const quickAssignPackage = async (moduloId: string, courseId: string | null) => {
        try {
            const { error } = await supabase
                .from('treinamento_modulos' as any)
                .update({ curso_id: courseId })
                .eq('id', moduloId);

            if (error) throw error;
            toast({ title: "Sucesso", description: "Vínculo atualizado!" });
            loadModulos();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const linkSelectedModules = async () => {
        if (selectedToLink.length === 0) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('treinamento_modulos' as any)
                .update({ curso_id: selectedAdminCourseId })
                .in('id', selectedToLink);

            if (error) throw error;
            toast({ title: "Sucesso", description: `${selectedToLink.length} módulos vinculados!` });
            setIsLinkDialogOpen(false);
            setSelectedToLink([]);
            loadModulos();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
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
                        { role: 'system', content: 'Você é um redator especialista em treinamentos para consultores. Escreva uma descrição curta, impactante e vendedora para um módulo de treinamento. Máximo 150 caracteres.' },
                        { role: 'user', content: `Gere uma descrição para o módulo de treinamento intitulado: "${formData.titulo}"` }
                    ]
                })
            });

            const data = await response.json();
            if (data.message) {
                setFormData(prev => ({ ...prev, descricao: data.message }));
                toast({ title: "Sucesso", description: "Descrição gerada com IA!" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingIA(false);
        }
    };

    const resetForm = () => {
        setEditingModulo(null);
        setFormData({
            titulo: "",
            descricao: "",
            icone: "GraduationCap",
            ativo: true,
            ordem: 0,
            curso_id: selectedAdminCourseId || "none"
        });
    };

    const resetCourseForm = () => {
        setEditingCurso(null);
        setCourseFormData({
            titulo: "",
            descricao: "",
            icone: "PackageIcon",
            ativo: true,
            ordem: 0
        });
    };

    const saveCurso = async () => {
        setLoading(true);
        try {
            const payload: any = {
                titulo: courseFormData.titulo,
                descricao: courseFormData.descricao || null,
                icone: courseFormData.icone,
                ativo: courseFormData.ativo,
                ordem: courseFormData.ordem
            };

            if (editingCurso) {
                const { error } = await supabase
                    .from('treinamento_cursos' as any)
                    .update(payload)
                    .eq('id', editingCurso.id);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Pacote atualizado com sucesso!" });
            } else {
                const { error } = await supabase
                    .from('treinamento_cursos' as any)
                    .insert([payload]);

                if (error) throw error;
                toast({ title: "Sucesso", description: "Pacote criado com sucesso!" });
            }

            setIsCourseDialogOpen(false);
            resetCourseForm();
            loadCursos();
        } catch (error: any) {
            console.error('Erro ao salvar curso:', error);
            toast({
                title: "Erro",
                description: `Não foi possível salvar o pacote: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditCurso = (curso: Curso) => {
        setEditingCurso(curso);
        setCourseFormData({
            titulo: curso.titulo,
            descricao: curso.descricao || "",
            icone: curso.icone,
            ativo: curso.ativo,
            ordem: curso.ordem
        });
        setIsCourseDialogOpen(true);
    };

    const handleDeleteCurso = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este pacote? Os módulos vinculados não serão excluídos, mas ficarão sem pacote.')) return;

        try {
            const { error } = await supabase
                .from('treinamento_cursos' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Sucesso", description: "Pacote excluído com sucesso!" });
            loadCursos();
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
        }
    };

    const getIcon = (name: string, isBig: boolean = false) => {
        const iconObj = ICONS.find(i => i.name === name);
        const IconComponent = iconObj?.icon || GraduationCap;
        return <IconComponent className={isBig ? "w-8 h-8" : "w-5 h-5"} />;
    };

    return (
        <AdminLayout>
            <div className="space-y-mobile-gap md:space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            {selectedAdminCourseId && (
                                <button
                                    onClick={() => setSelectedAdminCourseId(null)}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white">
                                {selectedAdminCourse ? selectedAdminCourse.titulo : "Treinamentos"}
                            </h1>
                        </div>
                        <p className="text-zinc-500 text-sm md:text-lg">
                            {selectedAdminCourse ? `Gerenciando módulos do pacote "${selectedAdminCourse.titulo}"` : "Capacite sua equipe com trilhas de conhecimento organizadas por pacotes."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {!selectedAdminCourseId && (
                            <Dialog open={isCourseDialogOpen} onOpenChange={(open) => {
                                setIsCourseDialogOpen(open);
                                if (!open) resetCourseForm();
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-zinc-800 text-white font-black hover:bg-zinc-700 h-12 md:h-14 px-6 md:px-8 rounded-xl transition-all w-full sm:w-auto">
                                        <PackageIcon className="w-5 h-5 mr-2" />
                                        Novo Pacote
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-[#121212] text-white border-zinc-800 p-0 rounded-[24px] overflow-y-auto max-h-[90vh]">
                                    <DialogHeader className="p-8 pb-0">
                                        <DialogTitle className="text-2xl font-black">{editingCurso ? 'Editar Pacote' : 'Novo Pacote'}</DialogTitle>
                                    </DialogHeader>

                                    <div className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-white font-bold text-sm">Título do Pacote</Label>
                                            <Input
                                                value={courseFormData.titulo}
                                                onChange={(e) => setCourseFormData({ ...courseFormData, titulo: e.target.value })}
                                                placeholder="Ex: Formação em Educação Financeira"
                                                className="bg-zinc-900 shadow-inner border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white font-bold text-sm">Descrição</Label>
                                            <Textarea
                                                value={courseFormData.descricao || ""}
                                                onChange={(e) => setCourseFormData({ ...courseFormData, descricao: e.target.value })}
                                                placeholder="Descreva o que este pacote engloba..."
                                                className="bg-zinc-900 border-zinc-800 min-h-[120px] rounded-xl focus-visible:ring-gold text-white resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Ordem</Label>
                                                <Input
                                                    type="number"
                                                    value={courseFormData.ordem}
                                                    onChange={(e) => setCourseFormData({ ...courseFormData, ordem: parseInt(e.target.value) || 0 })}
                                                    className="bg-zinc-900 border-zinc-800 h-14 rounded-xl text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Ícone do Pacote</Label>
                                                <div className="grid grid-cols-8 gap-2 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 max-h-[200px] overflow-y-auto">
                                                    {ICONS.map((i) => (
                                                        <button
                                                            key={i.name}
                                                            type="button"
                                                            onClick={() => setCourseFormData({ ...courseFormData, icone: i.name })}
                                                            title={i.label}
                                                            className={cn(
                                                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all border-2",
                                                                courseFormData.icone === i.name
                                                                    ? "bg-gold/20 border-gold text-gold scale-110"
                                                                    : "bg-zinc-800 border-transparent text-zinc-500 hover:border-zinc-700 hover:text-white"
                                                            )}
                                                        >
                                                            <i.icon className="w-4 h-4" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 pt-0 flex gap-4">
                                        <Button variant="ghost" onClick={() => setIsCourseDialogOpen(false)} className="flex-1 h-14 rounded-xl font-black">Cancelar</Button>
                                        <Button onClick={saveCurso} disabled={loading} className="flex-1 h-14 bg-gold text-black hover:bg-gold/90 rounded-xl font-black">Salvar Pacote</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-gold text-black font-black hover:bg-gold/90 h-12 md:h-14 px-6 md:px-8 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all active:scale-95 w-full sm:w-auto">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Adicionar Módulo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-[#121212] text-white border-zinc-800 p-0 rounded-[24px] overflow-y-auto max-h-[90vh]">
                                <DialogHeader className="p-8 pb-0">
                                    <DialogTitle className="text-2xl font-black">{editingModulo ? 'Editar Módulo' : 'Novo Módulo'}</DialogTitle>
                                </DialogHeader>

                                <Tabs defaultValue="geral" className="w-full">
                                    <div className="px-8 mt-4">
                                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full justify-start gap-2 h-auto">
                                            <TabsTrigger
                                                value="geral"
                                                className="px-6 py-3 data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-black transition-all text-zinc-400 hover:text-white"
                                            >
                                                <Layout className="w-4 h-4" /> Conteúdo
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="ajustes"
                                                className="px-6 py-3 data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-black transition-all text-zinc-400 hover:text-white"
                                            >
                                                <Settings className="w-4 h-4" /> Configurações
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="p-8">
                                        <TabsContent value="geral" className="space-y-6 mt-0">
                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Título</Label>
                                                <Input
                                                    value={formData.titulo}
                                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                                    placeholder="Ex: Mestres do Tráfego Pago"
                                                    className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white"
                                                />
                                            </div>
                                            <div className="space-y-2 relative">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-white font-bold text-sm">Descrição</Label>
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
                                                    placeholder="Uma breve descrição sobre o que será aprendido neste módulo..."
                                                    className="bg-zinc-900/50 border-zinc-800 min-h-[160px] rounded-xl focus-visible:ring-gold text-white resize-none p-4"
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="ajustes" className="space-y-6 mt-0">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-white font-bold text-sm">Série/Pacote (Folder)</Label>
                                                    <Select
                                                        value={formData.curso_id}
                                                        onValueChange={(val) => setFormData({ ...formData, curso_id: val })}
                                                    >
                                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-14 rounded-xl text-white">
                                                            <SelectValue placeholder="Selecione um pacote" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectItem value="none">Nenhum (Módulo Avulso)</SelectItem>
                                                            {cursos.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white font-bold text-sm">Ordem</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.ordem}
                                                        onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                                        className="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-gold text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-white font-bold text-sm">Ícone do Módulo</Label>
                                                <div className="grid grid-cols-8 gap-2 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 max-h-[250px] overflow-y-auto">
                                                    {ICONS.map((i) => (
                                                        <button
                                                            key={i.name}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, icone: i.name })}
                                                            title={i.label}
                                                            className={cn(
                                                                "w-12 h-12 flex items-center justify-center rounded-xl transition-all border-2",
                                                                formData.icone === i.name
                                                                    ? "bg-gold/20 border-gold text-gold scale-110"
                                                                    : "bg-zinc-800 border-transparent text-zinc-500 hover:border-zinc-700 hover:text-white"
                                                            )}
                                                        >
                                                            <i.icon className="w-5 h-5" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                                                <div className="space-y-0.5">
                                                    <Label className="text-white font-bold text-sm">Módulo Ativo</Label>
                                                    <p className="text-zinc-500 text-xs text-muted-foreground leading-none">Define se o módulo aparece para os consultores</p>
                                                </div>
                                                <Switch
                                                    checked={formData.ativo}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                                    className="data-[state=checked]:bg-gold"
                                                />
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
                                        onClick={saveModulo}
                                        disabled={loading || !formData.titulo}
                                        className="flex-1 h-14 bg-gold text-black hover:bg-gold/90 rounded-xl shadow-lg shadow-gold/10 font-black text-lg transition-all active:scale-95"
                                    >
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-mobile-gap md:gap-4">
                    <div className="flex items-center space-x-2 w-full md:max-w-sm">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar Conteúdo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-zinc-900 border-zinc-800 h-12 rounded-xl"
                        />
                    </div>

                    {!selectedAdminCourseId && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            <TabsList className="bg-transparent gap-1 w-full md:w-auto">
                                <TabsTrigger value="pacotes" className="flex-1 md:flex-none data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-black px-4 md:px-6">
                                    <FolderOpen className="w-4 h-4" /> Pacotes
                                </TabsTrigger>
                                <TabsTrigger value="modulos" className="flex-1 md:flex-none data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg gap-2 font-black px-4 md:px-6">
                                    <Layers className="w-4 h-4" /> Ver Todos
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {selectedAdminCourseId && (
                        <div className="flex gap-2">
                            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 h-10 px-6 rounded-xl font-bold flex gap-2">
                                        <LinkIcon className="w-4 h-4" /> Vincular Módulos Existentes
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-[#121212] text-white border-zinc-800 p-8 rounded-[24px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                            <LinkIcon className="w-6 h-6 text-gold" />
                                            Vincular Módulos ao Pacote
                                        </DialogTitle>
                                        <DialogDescription className="text-zinc-500">
                                            Selecione módulos criados anteriormente que ainda não estão em nenhum pacote.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 my-6 max-h-[400px] overflow-y-auto pr-2">
                                        {modulos.filter(m => !m.curso_id).map(m => (
                                            <div key={m.id} className="flex items-center space-x-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-gold/30 transition-all">
                                                <Checkbox
                                                    id={`link-${m.id}`}
                                                    checked={selectedToLink.includes(m.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedToLink([...selectedToLink, m.id]);
                                                        else setSelectedToLink(selectedToLink.filter(id => id !== m.id));
                                                    }}
                                                    className="border-zinc-700 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                                                />
                                                <div className="text-gold bg-gold/5 p-2 rounded-lg">
                                                    {getIcon(m.icone)}
                                                </div>
                                                <label htmlFor={`link-${m.id}`} className="flex-1 font-bold cursor-pointer">{m.titulo}</label>
                                            </div>
                                        ))}
                                        {modulos.filter(m => !m.curso_id).length === 0 && (
                                            <div className="text-center py-12 text-zinc-500">
                                                Nenhum módulo órfão (sem pacote) encontrado.
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)} className="flex-1 h-14 rounded-xl font-black">Cancelar</Button>
                                        <Button
                                            onClick={linkSelectedModules}
                                            disabled={loading || selectedToLink.length === 0}
                                            className="flex-1 h-14 bg-gold text-black hover:bg-gold/90 rounded-xl font-black"
                                        >
                                            Vincular {selectedToLink.length} Módulos
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                <div className="grid gap-8">
                    {selectedAdminCourseId ? (
                        <div className="grid gap-mobile-gap md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredModulos.map((modulo) => (
                                <Card key={modulo.id} className="bg-[#121212] border-none hover:ring-2 hover:ring-gold/50 transition-all group relative overflow-hidden flex flex-col rounded-[24px] p-1 md:p-2">
                                    <CardHeader className="p-4 md:p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="text-gold">
                                                {getIcon(modulo.icone, true)}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(modulo)} className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(modulo.id)} className="h-10 w-10 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-gold transition-colors">{modulo.titulo}</CardTitle>
                                        <CardDescription className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                            {modulo.descricao || "Sem descrição disponível."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-8 pt-0 mt-auto flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${modulo.ativo ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>
                                                {modulo.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                className="text-gold p-0 h-auto font-black text-sm gap-2 hover:bg-transparent hover:text-white group/btn transition-colors"
                                                onClick={() => navigate(`/admin/treinamentos/${modulo.id}/aulas`)}
                                            >
                                                Gerenciar Aulas
                                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredModulos.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-zinc-900/10 border-2 border-dashed border-zinc-800 rounded-[40px]">
                                    <PackageIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                                    <p className="text-zinc-500 text-lg font-bold">Nenhum módulo vinculado a este pacote.</p>
                                    <div className="flex flex-col gap-3 mt-4">
                                        <Button
                                            variant="link"
                                            className="text-gold font-black"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, curso_id: selectedAdminCourseId }));
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Módulo
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl"
                                            onClick={() => setIsLinkDialogOpen(true)}
                                        >
                                            <LinkIcon className="w-4 h-4 mr-2" /> Vincular Módulos Existentes
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        activeTab === "pacotes" ? (
                            <div className="grid gap-mobile-gap md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {cursos.map((curso) => (
                                    <Card
                                        key={curso.id}
                                        onClick={() => setSelectedAdminCourseId(curso.id)}
                                        className="bg-[#121212] border-none hover:ring-2 hover:ring-gold/50 transition-all group relative overflow-hidden flex flex-col rounded-[24px] p-1 md:p-2 cursor-pointer"
                                    >
                                        <CardHeader className="p-4 md:p-8">
                                            <div className="flex items-center justify-between mb-8" onClick={(e) => e.stopPropagation()}>
                                                <div className="text-gold">
                                                    {getIcon(curso.icone, true)}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditCurso(curso)} className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCurso(curso.id)} className="h-10 w-10 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-gold transition-colors">{curso.titulo}</CardTitle>
                                            <p className="text-zinc-500 text-sm mb-4">
                                                {modulos.filter(m => m.curso_id === curso.id).length} Módulos Vinculados
                                            </p>
                                            <CardDescription className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                                {curso.descricao || "Sem descrição disponível."}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 md:p-8 pt-0 mt-auto flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${curso.ativo ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>
                                                    {curso.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                                <span className="text-gold font-black text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Gerenciar Módulos <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-mobile-gap md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredModulos.map((modulo) => (
                                    <Card key={modulo.id} className="bg-[#121212] border-none hover:ring-2 hover:ring-gold/50 transition-all group relative overflow-hidden flex flex-col rounded-[24px] p-1 md:p-2">
                                        <CardHeader className="p-4 md:p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="text-gold">
                                                    {getIcon(modulo.icone, true)}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(modulo)} className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(modulo.id)} className="h-10 w-10 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-gold transition-colors">{modulo.titulo}</CardTitle>
                                            <div className="flex flex-col gap-2 mt-2">
                                                <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Vincular a Pacote</Label>
                                                <Select
                                                    value={modulo.curso_id || "none"}
                                                    onValueChange={(val) => quickAssignPackage(modulo.id, val === "none" ? null : val)}
                                                >
                                                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-10 rounded-xl text-zinc-400 text-xs">
                                                        <SelectValue placeholder="Sem Pacote" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                        <SelectItem value="none">Sem Pacote</SelectItem>
                                                        {cursos.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <CardDescription className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mt-4">
                                                {modulo.descricao || "Sem descrição disponível."}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 md:p-8 pt-0 mt-auto flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${modulo.ativo ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>
                                                    {modulo.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    className="text-gold p-0 h-auto font-black text-sm gap-2 hover:bg-transparent hover:text-white group/btn transition-colors"
                                                    onClick={() => navigate(`/admin/treinamentos/${modulo.id}/aulas`)}
                                                >
                                                    Gerenciar Aulas
                                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
