import { useEffect, useState } from "react";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comunicado {
    id: string;
    titulo: string;
    conteudo: string;
    tipo: 'EVENTO' | 'AVISO' | 'SISTEMA';
    data_publicacao: string;
    van_id: string | null;
    lido?: boolean;
}

export default function ResponsavelComunicados() {
    const [comunicados, setComunicados] = useState<Comunicado[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchComunicados();
    }, []);

    async function fetchComunicados() {
        try {
            setLoading(true);

            // 1. Buscar os estudantes do responsável para obter owner_id e van_ids
            const { data: students, error: studentsError } = await supabase
                .rpc('get_my_students' as any);

            if (studentsError) throw studentsError;

            if (!students || students.length === 0) {
                setComunicados([]);
                return;
            }

            // Extrair owner_id e van_ids únicos
            const ownerIds = [...new Set(students.map((s: any) => s.user_id).filter(Boolean))];
            const vanIds = [...new Set(students.map((s: any) => s.van_id).filter(Boolean))];

            // 2. Buscar comunicados
            let query = supabase
                .from('comunicados')
                .select('*')
                .eq('ativo', true)
                .order('data_publicacao', { ascending: false });

            // Filtrar por owner_id OU comunicados gerais (van_id null)
            if (ownerIds.length > 0) {
                query = query.or(`owner_id.in.(${ownerIds.join(',')}),van_id.is.null`);
            }

            const { data: comunicadosData, error: comunicadosError } = await query;

            if (comunicadosError) throw comunicadosError;

            // 3. Buscar quais comunicados já foram lidos
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: lidos } = await supabase
                .from('comunicados_lidos')
                .select('comunicado_id')
                .eq('user_id', user.id);

            const comunicadosLidosIds = new Set(lidos?.map(l => l.comunicado_id) || []);

            // 4. Filtrar comunicados por van do responsável
            const comunicadosFiltrados = comunicadosData?.filter(c => {
                // Inclui se for comunicado geral (sem van) ou se a van do comunicado está na lista de vans do responsável
                return c.van_id === null || vanIds.includes(c.van_id);
            }) || [];

            // 5. Marcar quais já foram lidos
            const comunicadosComStatus = comunicadosFiltrados.map(c => ({
                ...c,
                lido: comunicadosLidosIds.has(c.id)
            }));

            setComunicados(comunicadosComStatus);
        } catch (error: any) {
            console.error("Erro ao carregar comunicados:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar comunicados",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    async function marcarComoLido(comunicadoId: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('comunicados_lidos')
                .insert({
                    comunicado_id: comunicadoId,
                    user_id: user.id
                });

            if (error && error.code !== '23505') { // Ignora erro de duplicata
                throw error;
            }

            // Atualizar estado local
            setComunicados(prev =>
                prev.map(c => c.id === comunicadoId ? { ...c, lido: true } : c)
            );
        } catch (error) {
            console.error("Erro ao marcar como lido:", error);
        }
    }

    const tipoCores = {
        'EVENTO': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'AVISO': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'SISTEMA': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };

    return (
        <ResponsavelLayout>
            <div className="space-y-mobile-gap md:space-y-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
                            <Bell className="w-6 h-6 text-black-primary" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase italic">Comunicados</h1>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base ml-1">
                        Últimas notícias e avisos importantes.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    </div>
                ) : comunicados.length === 0 ? (
                    <Card className="bg-black-secondary border-gold/10">
                        <CardContent className="py-12 text-center">
                            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">Nenhum comunicado disponível no momento.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {comunicados.map((item) => (
                            <Card
                                key={item.id}
                                className="bg-black-secondary border-gold/10 hover:border-gold/30 transition-all cursor-pointer group shadow-elegant"
                                onClick={() => marcarComoLido(item.id)}
                            >
                                <CardHeader className="p-mobile-padding-x md:p-6 flex flex-row items-center justify-between space-y-0 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        {!item.lido && (
                                            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shrink-0" />
                                        )}
                                        <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-none ${tipoCores[item.tipo]}`}>
                                            {item.tipo}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.data_publicacao).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </CardHeader>
                                <CardContent className="p-mobile-padding-x md:p-6 pb-6">
                                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-gold transition-colors italic uppercase leading-tight">
                                        {item.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                        {item.conteudo}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ResponsavelLayout>
    );
}
