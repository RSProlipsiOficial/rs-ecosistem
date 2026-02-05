import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlunoComPresenca } from '@/types/presenca';
import { AlertCircle, History, Send, MessageSquare, Search, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OcorrenciasManagerProps {
    alunos: AlunoComPresenca[];
    loadingAlunos: boolean;
}

export function OcorrenciasManager({ alunos, loadingAlunos }: OcorrenciasManagerProps) {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [alunoId, setAlunoId] = useState<string | null>(null);
    const [alunoId2, setAlunoId2] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchHistorico = async () => {
        try {
            setLoadingHistorico(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('ocorrencias')
                .select(`
          *,
          aluno:alunos!aluno_id(nome_completo),
          aluno2:alunos!aluno_id_2(nome_completo)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOcorrencias(data || []);
        } catch (error) {
            console.error('Erro ao buscar histórico de ocorrências:', error);
        } finally {
            setLoadingHistorico(false);
        }
    };

    useEffect(() => {
        fetchHistorico();
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const role = user.user_metadata?.tipo_usuario || user.user_metadata?.user_type || 'usuario';
                setUserRole(role);
            }
        };
        getUser();
    }, []);

    const filteredOcorrencias = useMemo(() => {
        return ocorrencias.filter(oc => {
            const text = (oc.titulo || '') + (oc.descricao || '') +
                (oc.aluno?.nome_completo || '') + (oc.aluno2?.nome_completo || '');
            return text.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [ocorrencias, searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo || !descricao) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha o título e a descrição da ocorrência.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const meta = user.user_metadata;
            const sponsorId = meta?.sponsor_id || meta?.boss_id;

            if (!sponsorId) {
                toast({
                    title: "Erro de Configuração",
                    description: "Não foi possível identificar o gestor da sua conta. Contate o suporte.",
                    variant: "destructive",
                });
                return;
            }

            const { error } = await supabase
                .from('ocorrencias')
                .insert([{
                    user_id: user.id,
                    sponsor_id: sponsorId,
                    aluno_id: alunoId === 'none' ? null : alunoId,
                    aluno_id_2: alunoId2 === 'none' ? null : alunoId2,
                    titulo,
                    descricao,
                    status: 'pendente'
                }]);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Sua reclamação foi enviada com sucesso ao gestor.",
            });

            setTitulo('');
            setDescricao('');
            setAlunoId(null);
            setAlunoId2(null);
            fetchHistorico();
        } catch (error: any) {
            console.error('Erro ao enviar ocorrência:', error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível enviar a ocorrência.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('ocorrencias')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast({
                title: "Sucesso",
                description: `Ocorrência ${newStatus === 'visto' ? 'marcada como vista' : 'resolvida'} com sucesso.`
            });
            fetchHistorico();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolvido': return 'bg-green-500';
            case 'visto': return 'bg-gray-500';
            case 'em_analise': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Envio */}
            <Card className="lg:col-span-1 bg-black/20 border-white/5 h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white italic uppercase">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        Nova Reclamação
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Relate qualquer briga, reclamação de pais ou incidentes na rota.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="titulo" className="text-gray-300">Título / Assunto</Label>
                            <Input
                                id="titulo"
                                placeholder="Ex: Briga no banco de trás"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="bg-black-secondary border-gold/20 text-gold placeholder:text-gold/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aluno" className="text-gray-300">Aluno Envolvido (Opcional)</Label>
                            <Select onValueChange={setAlunoId} value={alunoId || undefined}>
                                <SelectTrigger className="bg-black-secondary border-gold/20 text-gold text-xs">
                                    <SelectValue placeholder="Selecione o 1º aluno..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="none">Nenhum aluno específico</SelectItem>
                                    {(alunos || []).map((aluno) => (
                                        <SelectItem key={aluno.id} value={aluno.id}>
                                            {aluno.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aluno2" className="text-gray-300">Aluno Envolvido 2 (Opcional)</Label>
                            <Select onValueChange={setAlunoId2} value={alunoId2 || undefined}>
                                <SelectTrigger className="bg-black-secondary border-gold/20 text-gold text-xs">
                                    <SelectValue placeholder="Selecione o 2º aluno..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="none">Nenhum aluno específico</SelectItem>
                                    {(alunos || []).map((aluno) => (
                                        <SelectItem key={aluno.id} value={aluno.id}>
                                            {aluno.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao" className="text-gray-300">Relato Detalhado</Label>
                            <Textarea
                                id="descricao"
                                placeholder="Descreva o que aconteceu..."
                                rows={5}
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="bg-black-secondary border-gold/20 text-gold placeholder:text-gold/40"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold uppercase gap-2 py-6"
                        >
                            <Send className="h-4 w-4" />
                            {loading ? 'Enviando...' : 'Enviar ao Gestor'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Histórico Recente */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-black/20 border-white/10 overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
                        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
                            <History className="h-4 w-4 text-gold" />
                            Controles de Histórico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 bg-black/40">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-9 space-y-2">
                                <Label htmlFor="busca-ocorrencia" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Buscar no Histórico</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                                    <Input
                                        id="busca-ocorrencia"
                                        placeholder="Busque por título, descrição ou nome do aluno..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 bg-black-secondary border-gold/20 text-gold placeholder:text-gold/20 text-xs focus:border-gold/50 transition-all pl-9"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <Button
                                    onClick={fetchHistorico}
                                    disabled={loadingHistorico}
                                    className="w-full h-10 gap-2 bg-gold hover:bg-gold/90 text-black font-black uppercase text-[10px] tracking-widest shadow-gold-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loadingHistorico ? 'animate-spin' : ''}`} />
                                    Atualizar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white italic uppercase">
                            <MessageSquare className="h-5 w-5 text-yellow-500" />
                            Minhas Reclamações Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loadingHistorico ? (
                                <p className="text-center text-gray-500 py-8">Carregando histórico...</p>
                            ) : filteredOcorrencias.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                                    <p className="text-gray-500">Nenhuma reclamação encontrada.</p>
                                </div>
                            ) : (
                                filteredOcorrencias.map((oc) => (
                                    <div key={oc.id} className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white uppercase tracking-tight">{oc.titulo}</h3>
                                            <Badge className={`${getStatusColor(oc.status)} text-white border-0`}>
                                                {oc.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">{oc.descricao}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 uppercase font-bold">
                                                <span>📅 {format(new Date(oc.created_at), "dd 'de' MMMM", { locale: ptBR })}</span>
                                                {oc.aluno && <span className="text-yellow-500/80">👤 Aluno 1: {oc.aluno.nome_completo}</span>}
                                                {oc.aluno2 && <span className="text-orange-500/80">👤 Aluno 2: {oc.aluno2.nome_completo}</span>}
                                            </div>

                                            {(userRole === 'admin' || userRole === 'usuario') && oc.status !== 'resolvido' && (
                                                <div className="flex gap-2">
                                                    {oc.status !== 'visto' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(oc.id, 'visto')}
                                                            className="h-7 text-[9px] border-gold/20 text-gold hover:bg-gold/10 font-black uppercase"
                                                        >
                                                            Marcar como Visto
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateStatus(oc.id, 'resolvido')}
                                                        className="h-7 text-[9px] border-green-500/20 text-green-500 hover:bg-green-500/10 font-black uppercase flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                        Dar Baixa / Resolver
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
