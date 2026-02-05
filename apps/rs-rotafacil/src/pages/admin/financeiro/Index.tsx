// Trigger deploy: Corrected dash stats and names
import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminFinanceiroIndex() {
    const [summary, setSummary] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadBillingSummary();
    }, []);

    const loadBillingSummary = async () => {
        try {
            const { data, error } = await (supabase.rpc as any)('get_admin_billing_summary');
            if (error) throw error;
            setSummary(data);

            // Carregar últimas assinaturas
            const { data: subData, error: subError } = await supabase
                .from('user_subscriptions')
                .select(`
                    id,
                    status,
                    created_at,
                    expires_at,
                    user_id,
                    plan:subscription_plans(name, price)
                `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (subError) throw subError;

            // Buscar perfis dos usuários e consultores
            const { data: userData } = await supabase
                .from('user_profiles')
                .select('user_id, nome_completo') as any;

            const { data: consultorData } = await supabase
                .from('consultores')
                .select('user_id, nome, email') as any;

            // Buscar metadados dos usuários via RPC (mesma fonte do Gerenciar Usuários) para garantir nomes corretos
            const { data: authUsers, error: authError } = await (supabase.rpc as any)('get_admin_users_list');

            const userMetaMap = (authUsers || []).reduce((acc: any, u: any) => {
                acc[u.id] = {
                    tipo: u.tipo_usuario || 'usuario',
                    nome: u.nome
                };
                return acc;
            }, {});

            const subsWithUsers = subData
                .map(s => {
                    const profile = userData?.find(u => u.user_id === s.user_id);
                    const consultor = consultorData?.find(u => u.user_id === s.user_id);
                    const meta = userMetaMap[s.user_id];
                    const userType = meta?.tipo || 'usuario';

                    // Prioridade: Profile > Consultor > Metadata > ID
                    const name = profile?.nome_completo || consultor?.nome || meta?.nome || `Usuário (${s.user_id.substring(0, 5)})`;

                    let displayStatus: any = s.status;
                    if (displayStatus === 'trial') displayStatus = 'degustação';
                    if (displayStatus === 'active') displayStatus = 'ativo';

                    return {
                        ...s,
                        user_name: name,
                        user_type: userType,
                        displayStatus: displayStatus
                    };
                })
                .filter(s => !['motorista', 'monitora', 'aluno'].includes(s.user_type));

            setSubscriptions(subsWithUsers);
        } catch (error) {
            console.error("Erro ao carregar faturamento:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar o resumo financeiro.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout>Carregando...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase italic">Faturamento e Assinaturas</h1>
                    <p className="text-[10px] md:text-base text-muted-foreground font-bold uppercase tracking-widest mt-1">Gestão financeira centralizada do ecossistema</p>
                </div>

                <div className="grid gap-mobile-gap sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="p-3 md:p-6 border-gold/20 bg-black-secondary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                            <CardTitle className="text-[8px] md:text-sm font-black uppercase tracking-widest text-slate-400">MRR</CardTitle>
                            <DollarSign className="h-3 w-3 text-green-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-black text-gold tabular-nums">R$ {summary?.mrr?.toFixed(0) || "0"}</div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 md:p-6 border-gold/20 bg-black-secondary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                            <CardTitle className="text-[8px] md:text-sm font-black uppercase tracking-widest text-slate-400">Packs</CardTitle>
                            <TrendingUp className="h-3 w-3 text-purple-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-black text-gold tabular-nums">{summary?.top_pack || "-"}</div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 md:p-6 border-gold/20 bg-black-secondary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                            <CardTitle className="text-[8px] md:text-sm font-black uppercase tracking-widest text-slate-400">Ativas</CardTitle>
                            <Users className="h-3 w-3 text-blue-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-black text-gold tabular-nums">{summary?.active_subscriptions || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="p-3 md:p-6 border-gold/20 bg-black-secondary border-l-red-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                            <CardTitle className="text-[8px] md:text-sm font-black uppercase tracking-widest text-slate-400">Churn</CardTitle>
                            <Activity className="h-3 w-3 text-red-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-black text-red-500 tabular-nums">{summary?.churn_rate?.toFixed(1) || 0}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimas Assinaturas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Plano</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscriptions.length > 0 ? (
                                        subscriptions.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">{sub.user_name}</TableCell>
                                                <TableCell>{sub.plan?.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={sub.status === 'active' ? "default" : "secondary"} className={sub.status === 'trial' ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : ""}>
                                                        {sub.displayStatus.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(sub.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell className="text-right">
                                                    R$ {sub.plan?.price?.toFixed(2) || "0,00"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                Nenhuma assinatura encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout >
    );
}
