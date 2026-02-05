import { useState, useEffect } from "react";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ResumoVan {
    total_alunos: number;
    presentes: number;
    ausentes: number;
    vencimento_checklist?: string;
    van_id: string;
}

export default function ResponsavelPresencas() {
    const [loading, setLoading] = useState(true);
    const [resumos, setResumos] = useState<ResumoVan[]>([]);
    const [dataSelected] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        async function loadPresencas() {
            try {
                setLoading(true);

                // 1. Buscar meus alunos para pegar os van_ids
                const { data: students, error: studentsError } = await supabase
                    .rpc('get_my_students' as any);

                if (studentsError) throw studentsError;

                const vanIds = Array.from(new Set(students?.map((s: any) => s.van_id).filter(Boolean)));

                if (vanIds.length === 0) {
                    setResumos([]);
                    return;
                }

                // 2. Para cada van, calcular o resumo de hoje
                const resumosData: ResumoVan[] = [];

                for (const vanId of vanIds as string[]) {
                    // Buscar todos os alunos desta van
                    const { data: allStudentsInVan } = await supabase
                        .from('alunos')
                        .select('id')
                        .eq('van_id', vanId)
                        .eq('ativo', true);

                    const studentIds = allStudentsInVan?.map(s => s.id) || [];

                    if (studentIds.length === 0) continue;

                    // Buscar presenças de hoje para estes alunos
                    const { data: presencas } = await supabase
                        .from('lista_presenca')
                        .select('status')
                        .in('aluno_id', studentIds)
                        .eq('data', dataSelected);

                    const presentes = presencas?.filter(p => p.status === 'presente').length || 0;
                    const ausentes = presencas?.filter(p => p.status === 'ausente').length || 0;

                    resumosData.push({
                        van_id: vanId,
                        total_alunos: studentIds.length,
                        presentes,
                        ausentes
                    });
                }

                setResumos(resumosData);
            } catch (error) {
                console.error("Erro ao carregar presenças:", error);
            } finally {
                setLoading(false);
            }
        }

        loadPresencas();
    }, [dataSelected]);

    return (
        <ResponsavelLayout>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                            <Calendar className="w-6 h-6 text-black-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Presenças</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Acompanhe em tempo real o resumo de presença da van do seu filho.
                    </p>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-48 bg-black-secondary animate-pulse rounded-2xl border border-gold/10" />
                        ))}
                    </div>
                ) : resumos.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {resumos.map((resumo, index) => (
                            <Card key={index} className="bg-black-secondary border-gold/20 overflow-hidden shadow-elegant group hover:border-gold/40 transition-all">
                                <CardHeader className="border-b border-gold/10 bg-black/40">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-gold font-bold flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            Resumo da Rota
                                        </CardTitle>
                                        <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
                                            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-gray-400">
                                        Status consolidado de todos os alunos da van
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                                            <div className="flex justify-center mb-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="text-2xl font-black text-white">{resumo.total_alunos}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total</div>
                                        </div>

                                        <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10 text-center">
                                            <div className="flex justify-center mb-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                            <div className="text-2xl font-black text-green-500">{resumo.presentes}</div>
                                            <div className="text-[10px] text-green-500/40 uppercase font-bold tracking-widest">Pres.</div>
                                        </div>

                                        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 text-center">
                                            <div className="flex justify-center mb-1">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            </div>
                                            <div className="text-2xl font-black text-red-500">{resumo.ausentes}</div>
                                            <div className="text-[10px] text-red-500/40 uppercase font-bold tracking-widest">Aus.</div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/10">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gold" />
                                            <span className="text-xs text-gold/80 font-medium">Tempo real</span>
                                        </div>
                                        <span className="text-[10px] text-gold/40 font-bold uppercase tracking-tighter italic">
                                            Sincronizado com a monitora
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-black-secondary border-dashed border-gold/20 p-12 text-center">
                        <Calendar className="w-12 h-12 text-gold/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma atividade no momento</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            O monitoramento da rota ainda não foi iniciado ou não há dados de presença para hoje.
                        </p>
                    </Card>
                )}
            </div>
        </ResponsavelLayout>
    );
}
