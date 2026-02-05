import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    GraduationCap, TrendingUp, Users, ShieldCheck, Brain, CheckCircle2,
    Plus, Lock, Crown, Zap, Layout, PlayCircle, FolderOpen, ChevronLeft,
    ChevronRight, Settings, School, Library, Languages, History, Globe,
    Calculator, Wallet, Banknote, CreditCard, Coins, BarChart3, PieChart,
    Receipt, DollarSign, Laptop, Code2, Database, Network, Cpu, Smartphone,
    Briefcase, Calendar, ClipboardList, Target, Award, Search, FileText,
    Handshake, Video, Image, Music, Mic, Headphones, Key, AlertTriangle,
    Lightbulb, Rocket, Truck, Car, Bus, MapPin, Navigation, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";

interface Curso {
    id: string;
    titulo: string;
    descricao?: string | null;
    icone: string;
    ordem: number;
}

interface Modulo {
    id: string;
    titulo: string;
    descricao?: string | null;
    icone: string;
    ordem: number;
    curso_id?: string | null;
}

interface ModuloComProgresso extends Modulo {
    totalAulas: number;
    aulasConcluidas: number;
    progresso: number;
}

const ICONS: Record<string, any> = {
    GraduationCap, TrendingUp, Users, ShieldCheck, Brain, Layout, PlayCircle,
    FolderOpen, School, Library, Languages, History, Globe, Calculator, Wallet,
    Banknote, CreditCard, Coins, BarChart3, PieChart, Receipt, DollarSign,
    Laptop, Code2, Database, Network, Cpu, Smartphone, Briefcase, Calendar,
    ClipboardList, Target, Award, Search, FileText, Handshake, Video, Image,
    Music, Mic, Headphones, Lock, Key, AlertTriangle, Lightbulb, Zap, Rocket,
    Truck, Car, Bus, MapPin, Navigation, Check
};

export default function TreinamentosIndex() {
    const [modulos, setModulos] = useState<ModuloComProgresso[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const { limits, loading: limitsLoading } = usePlanLimits();
    const navigate = useNavigate();

    const selectedCourse = cursos.find(c => c.id === selectedCourseId);

    useEffect(() => {
        loadModulosComProgresso();
        getUserRole();
    }, []);

    const getUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUserRole(user?.user_metadata?.user_type || 'usuario');
    };

    const loadModulosComProgresso = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Carregar Cursos (Pacotes)
            const { data: cursosData, error: cursosError } = await supabase
                .from('treinamento_cursos')
                .select('*')
                .eq('ativo', true)
                .order('ordem', { ascending: true });

            if (cursosError) throw cursosError;
            setCursos(cursosData || []);

            // 2. Carregar módulos
            const { data: modulosData, error: modulosError } = await supabase
                .from('treinamento_modulos')
                .select('*')
                .eq('ativo', true)
                .order('ordem', { ascending: true });

            if (modulosError) throw modulosError;

            // 3. Carregar aulas para contagem
            const { data: aulasData, error: aulasError } = await supabase
                .from('treinamento_aulas')
                .select('id, modulo_id')
                .eq('ativo', true);

            if (aulasError) throw aulasError;

            // 4. Carregar progresso do usuário
            const { data: progressoData, error: progressoError } = await supabase
                .from('treinamento_progresso')
                .select('aula_id')
                .eq('user_id', user.id);

            if (progressoError) throw progressoError;

            // 5. Mapear dados
            const mComProgresso = modulosData.map(m => {
                const aulasDoModulo = aulasData.filter(a => a.modulo_id === m.id);
                const totalAulas = aulasDoModulo.length;
                const aulasConcluidas = progressoData.filter(p =>
                    aulasDoModulo.some(a => a.id === p.aula_id)
                ).length;
                const progresso = totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0;

                return {
                    ...m,
                    totalAulas,
                    aulasConcluidas,
                    progresso
                };
            });

            setModulos(mComProgresso);
        } catch (error) {
            console.error('Erro ao carregar treinamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name: string) => {
        const IconComponent = ICONS[name] || GraduationCap;
        return <IconComponent className="w-8 h-8" />;
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                {selectedCourseId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedCourseId(null)}
                                        className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>
                                )}
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    {selectedCourse ? selectedCourse.titulo : "Central de Treinamentos"}
                                </h1>
                            </div>
                            <p className="text-zinc-400">
                                {selectedCourse ? selectedCourse.descricao : "Capacite-se e impulsione seus resultados com nossos treinamentos exclusivos."}
                            </p>
                        </div>
                        {userRole === 'admin' && (
                            <Button
                                onClick={() => navigate('/admin/treinamentos')}
                                className="bg-gold text-black-primary font-black hover:bg-gold/90 transition-all gap-2 rounded-xl h-12 px-6"
                            >
                                <Settings className="w-4 h-4" />
                                Gerenciar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading || limitsLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse h-64 rounded-3xl" />
                        ))
                    ) : (limits?.currentPlan === 'free' || limits?.currentPlan === 'basico' || limits?.currentPlan === 'inicial') && userRole !== 'admin' ? (
                        <Card className="col-span-full bg-[#121212] border-2 border-dashed border-gold/20 p-12 text-center rounded-[40px] overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-gold/5">
                                    <Lock className="w-10 h-10 text-gold" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Acesso Restrito</h3>
                                <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg leading-relaxed">
                                    A Central de Treinamentos está disponível exclusivamente para usuários dos planos <span className="text-gold font-bold">Profissional, Empresarial e Ilimitado</span>.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => navigate('/upgrade')}
                                        className="bg-gold text-black-primary font-black hover:bg-gold/90 transition-all h-14 px-8 rounded-2xl text-lg shadow-xl shadow-gold/20 flex gap-3 items-center"
                                    >
                                        <Crown className="w-6 h-6" />
                                        Fazer Upgrade Agora
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open('https://wa.me/5541992863922', '_blank')}
                                        className="border-zinc-800 text-white hover:bg-zinc-800 h-14 px-8 rounded-2xl text-lg flex gap-3 items-center"
                                    >
                                        <Zap className="w-6 h-6 text-gold" />
                                        Falar com Suporte
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {/* Renderizar Pastas (Cursos) somente se nenhum curso estiver selecionado */}
                            {!selectedCourseId && cursos.map((curso) => (
                                <Card
                                    key={curso.id}
                                    onClick={() => setSelectedCourseId(curso.id)}
                                    className="bg-[#121212] border-none hover:ring-2 hover:ring-gold/50 transition-all group relative overflow-hidden flex flex-col rounded-[24px] p-2 cursor-pointer"
                                >
                                    <CardHeader className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                                {getIcon(curso.icone)}
                                            </div>
                                            <FolderOpen className="w-6 h-6 text-zinc-700 group-hover:text-gold transition-colors" />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-gold transition-colors">
                                            {curso.titulo}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-6">
                                            {curso.descricao || "Pacote completo com diversos módulos de conhecimento."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 mt-auto">
                                        <div className="flex items-center justify-between py-4 border-t border-zinc-900">
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                                                {modulos.filter(m => m.curso_id === curso.id).length} Módulos
                                            </span>
                                            <span className="text-gold font-black text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Abrir <ChevronRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Renderizar Módulos filtrados */}
                            {modulos
                                .filter(m => selectedCourseId ? m.curso_id === selectedCourseId : !m.curso_id)
                                .map((modulo) => (
                                    <Card
                                        key={modulo.id}
                                        className="bg-[#121212] border-none hover:ring-2 hover:ring-gold/50 transition-all group relative overflow-hidden flex flex-col rounded-[24px] p-2"
                                    >
                                        <CardHeader className="p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="text-gold">
                                                    {getIcon(modulo.icone)}
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-gold transition-colors">
                                                {modulo.titulo}
                                            </CardTitle>
                                            <CardDescription className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-6">
                                                {modulo.descricao || "Domine novas habilidades e escale seu negócio."}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-8 pt-0 mt-auto flex flex-col gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                                                    <span>Progresso</span>
                                                    <span className="text-zinc-400">{Math.round(modulo.progresso)}%</span>
                                                </div>
                                                <Progress value={modulo.progresso} className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gold transition-all" style={{ width: `${modulo.progresso}%` }} />
                                                </Progress>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                className={modulo.progresso === 100
                                                    ? "w-full bg-zinc-900 text-gold hover:bg-zinc-800 h-14 rounded-2xl text-lg font-black border border-gold/20"
                                                    : "w-full bg-[#1a1a1a] text-white hover:bg-gold hover:text-black transition-all h-14 rounded-2xl text-lg font-black shadow-lg"
                                                }
                                                onClick={() => navigate(`/treinamentos/${modulo.id}`)}
                                            >
                                                {modulo.progresso === 100 ? (
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        Concluir
                                                    </span>
                                                ) : (
                                                    "Acessar Aula"
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            }

                            {(!selectedCourseId && modulos.length === 0 && cursos.length === 0) || (selectedCourseId && modulos.filter(m => m.curso_id === selectedCourseId).length === 0) ? (
                                <div className="col-span-full py-20 text-center bg-[#121212] border-2 border-dashed border-zinc-900 rounded-[40px]">
                                    <GraduationCap className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                                    <p className="text-zinc-500 text-lg font-bold">Nenhum treinamento disponível nesta pasta.</p>
                                    {selectedCourseId && (
                                        <Button variant="link" onClick={() => setSelectedCourseId(null)} className="text-gold mt-4 font-black">
                                            Voltar para a raiz
                                        </Button>
                                    )}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
