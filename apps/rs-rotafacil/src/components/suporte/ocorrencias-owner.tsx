import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { History, MessageSquare, Search, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function OcorrenciasOwner() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchOcorrencias = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from('ocorrencias')
                .select(`
                    *,
                    aluno:aluno_id(nome_completo),
                    aluno2:aluno_id_2(nome_completo)
                `)
                .eq('sponsor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOcorrencias(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar ocorrências:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as ocorrências.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOcorrencias();
    }, []);

    const filteredOcorrencias = useMemo(() => {
        return ocorrencias.filter(oc => {
            const text = (oc.titulo || '') + (oc.descricao || '') +
                (oc.aluno?.nome_completo || '') + (oc.aluno2?.nome_completo || '') +
                (oc.monitora?.nome_completo || '');
            return text.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [ocorrencias, searchTerm]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await (supabase as any)
                .from('ocorrencias')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast({
                title: "Sucesso",
                description: `Ocorrência marcada como ${newStatus === 'resolvido' ? 'resolvida' : 'vista'}.`,
            });
            fetchOcorrencias();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteOcorrencia = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta ocorrência permanentemente?")) return;

        try {
            const { error } = await (supabase as any)
                .from('ocorrencias')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({
                title: "Sucesso",
                description: "Ocorrência excluída com sucesso.",
            });
            fetchOcorrencias();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolvido':
                return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">RESOLVIDO</Badge>;
            case 'visto':
                return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">VISTO</Badge>;
            default:
                return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">PENDENTE</Badge>;
        }
    };

    return (
        <Card className="bg-[#121212] border-white/5 rounded-[24px] overflow-hidden shadow-2xl mt-6">
            <CardHeader className="bg-white/5 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-white uppercase tracking-wider text-base italic font-black">
                            <History className="w-5 h-5 text-gold" />
                            Gestão de Ocorrências da Rede
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1">
                            Acompanhe e resolva as reclamações enviadas pelas suas monitoras.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por título, monitora ou aluno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border-white/10 text-white pl-10 h-12 focus:border-gold/50 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={fetchOcorrencias}
                        disabled={loading}
                        variant="outline"
                        className="bg-gold/10 hover:bg-gold/20 text-gold border-gold/20 uppercase font-black text-[10px] tracking-widest h-12 rounded-xl"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-gold" />
                            <p>Buscando incidentes...</p>
                        </div>
                    ) : filteredOcorrencias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-[24px]">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p>Tudo limpo! Nenhuma ocorrência encontrada.</p>
                        </div>
                    ) : (
                        filteredOcorrencias.map((oc) => (
                            <div key={oc.id} className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-gold/20 transition-all flex flex-col md:flex-row justify-between gap-6 group">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(oc.status)}
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                            {format(new Date(oc.created_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">{oc.titulo}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed mt-1">{oc.descricao}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] uppercase font-black tracking-widest">
                                        <span className="text-gold/60">Monitora: {oc.monitora?.nome_completo || 'N/A'}</span>
                                        {oc.aluno && <span className="text-teal-500/60">Aluno: {oc.aluno.nome_completo}</span>}
                                    </div>
                                </div>
                                <div className="flex md:flex-col gap-2 justify-center shrink-0">
                                    {oc.status !== 'resolvido' ? (
                                        <div className="flex gap-2">
                                            {oc.status !== 'visto' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleUpdateStatus(oc.id, 'visto')}
                                                    className="text-blue-500 hover:bg-blue-500/10 font-bold uppercase text-[10px] tracking-tighter italic"
                                                >
                                                    Marcar como Visto
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(oc.id, 'resolvido')}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-[10px] tracking-tighter italic shadow-lg shadow-green-900/20 rounded-xl px-4"
                                            >
                                                Dar Baixa / Resolver
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Resolvido
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteOcorrencia(oc.id)}
                                                className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
    );
}
