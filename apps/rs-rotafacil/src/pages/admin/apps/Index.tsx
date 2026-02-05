import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  Brain,
  DollarSign,
  Zap,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { SalesFunnel } from "@/components/admin/apps/SalesFunnel";
import { CobrarModal } from "@/components/admin/apps/CobrarModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, LineChart, Line
} from 'recharts';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, isSameMonth, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    user_type?: string;
  };
  subscription?: {
    status: string;
    plan_name: string;
    plan_price: number;
    expires_at: string;
  };
  app_data?: {
    status: string;
    valor_pago: number;
  };
}

export default function AdminAppsIndex() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [iaRevenue, setIaRevenue] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    diff: 0
  });
  const [salesGrowth, setSalesGrowth] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserForCobrar, setSelectedUserForCobrar] = useState<any>(null);
  const [isCobrarModalOpen, setIsCobrarModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: usersList, error: rpcError } = await (supabase.rpc as any)('get_admin_users_list');

      let rawUsers: any[] = [];
      if (rpcError) {
        console.error("Erro RPC ao carregar usuários:", rpcError);
      } else {
        // A RPC get_admin_users_list retorna o resultado de get_admin_users_v2
        rawUsers = Array.isArray(usersList) ? usersList : [];
      }

      // Fetch plans to map prices
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('id, name, price');

      const plansMap = (plansData || []).reduce((acc: any, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Filter and map to common structure
      const formattedUsers = rawUsers
        .filter(u => {
          const uTipo = (u.tipo_usuario || u.tipo || '').toLowerCase();
          const uApp = u.app || null;

          // Regra Sênior: Apenas owners/masters do app rotafacil
          // Contas oficiais passam sempre
          return ['master', 'owner'].includes(uTipo) && uApp === 'rotafacil';
        })
        .map(u => {
          const plan = plansMap[u.plan_id];

          const isOfficial = u.nome?.toLowerCase().includes('rota fácil') ||
            u.nome?.toLowerCase().includes('rota facil');

          // Regra Flexibilizada: Ativo se o status for active, ativo ou TRIAL
          const isActive = (u.status === 'active' || u.status === 'ativo' || u.status === 'trial') || isOfficial;

          return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            user_metadata: {
              name: u.nome || u.name || 'Cliente Sem Nome',
              phone: u.telefone || u.phone || '',
              user_type: u.tipo_usuario
            },
            subscription: {
              status: isActive ? 'active' : 'inactive',
              plan_name: plan?.name || 'Sem Plano',
              plan_price: Number(plan?.price) || 0,
              expires_at: u.expires_at
            },
            app_data: {
              status: isActive ? 'active' : 'inactive',
              valor_pago: 0
            }
          };
        })
        .filter(u => u.subscription.status === 'active'); // Somente ativos aparecem no dashboard de vendas/cobrança conforme áudio

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados das vendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await (supabase as any)
        .from('payment_history')
        .select('*')
        .eq('status', 'confirmed');

      const data = response.data;
      const error = response.error;

      if (error) throw error;

      const payments = (data || []) as any[];

      // Receita total de IA
      const iaSum = payments
        .filter(p => p.description === 'Créditos RS-IA')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setIaRevenue(iaSum);

      // Processar dados para os gráficos (Últimos 6 meses)
      const now = new Date();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i);
        return {
          month: format(d, 'MMM', { locale: ptBR }),
          revenue: 0,
          sales: 0,
          rawDate: d
        };
      });

      payments.forEach(p => {
        const pDate = parseISO(p.created_at);
        const monthIndex = last6Months.findIndex(m => isSameMonth(m.rawDate, pDate));
        if (monthIndex > -1) {
          last6Months[monthIndex].revenue += Number(p.amount) || 0;
          last6Months[monthIndex].sales += 1;
        }
      });

      setChartData(last6Months);

      // Calcular estatísticas mensais (Este mês vs Mês passado)
      const thisMonth = startOfMonth(now);
      const lastMonth = startOfMonth(subMonths(now, 1));

      const thisMonthRevenue = payments
        .filter(p => isSameMonth(parseISO(p.created_at), thisMonth))
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      const lastMonthRevenue = payments
        .filter(p => isSameMonth(parseISO(p.created_at), lastMonth))
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      const diff = lastMonthRevenue === 0 ? 100 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      setMonthlyStats({
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        diff
      });

      // Dados de crescimento diário (Últimos 30 dias)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = subDays(now, 29 - i);
        return {
          day: format(d, 'dd/MM'),
          revenue: 0,
          rawDate: d
        };
      });

      payments.forEach(p => {
        const pDate = parseISO(p.created_at);
        const dayIndex = last30Days.findIndex(d =>
          format(d.rawDate, 'yyyy-MM-dd') === format(pDate, 'yyyy-MM-dd')
        );
        if (dayIndex > -1) {
          last30Days[dayIndex].revenue += Number(p.amount) || 0;
        }
      });

      setSalesGrowth(last30Days);
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  const stats = {
    total: users.length,
    ativos: users.filter(user => user.subscription?.status === 'active').length,
    receita: 0,
  };

  // Recalcular receita com base nos planos reais carregados
  stats.receita = users.reduce((sum, user) => {
    let valor = 0;
    // O status 'active' aqui já reflete (plan_id || official) do mapeamento acima
    if (user.subscription?.status === 'active' && user.subscription.plan_price) {
      valor += user.subscription.plan_price;
    }
    return sum + valor;
  }, 0);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-4 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase italic leading-tight">
              Dashboard de <span className="text-gold">Vendas</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gold font-bold uppercase tracking-widest mt-0.5">
              Performance Comercial e Gestão de Assinaturas
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto h-9 border-gold/30 text-gold hover:bg-gold/10 font-black uppercase text-[10px] tracking-widest"
            onClick={() => navigate('/admin/pixels')}
          >
            <Search className="w-3.5 h-3.5 mr-2" />
            Configurar Pixels
          </Button>
        </div>

        <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border-gold/20 bg-black-secondary overflow-hidden group hover:border-gold/40 transition-all duration-300 shadow-lg">
            <CardHeader className="p-3 md:p-4 pb-0.5">
              <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Clientes</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-black text-white tabular-nums">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-black-secondary overflow-hidden group hover:border-green-500/40 transition-all duration-300 shadow-lg">
            <CardHeader className="p-3 md:p-4 pb-0.5">
              <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-black text-white tabular-nums">{stats.ativos}</div>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-black-secondary overflow-hidden group hover:border-gold/40 transition-all duration-300 shadow-lg">
            <CardHeader className="p-3 md:p-4 pb-0.5">
              <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Receita</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-black text-gold tabular-nums">R$ {monthlyStats.thisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-black-secondary overflow-hidden group hover:border-gold/40 transition-all duration-300 shadow-lg">
            <CardHeader className="p-3 md:p-4 pb-0.5">
              <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className={cn(
                "text-2xl md:text-3xl font-black tabular-nums",
                monthlyStats.diff >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {monthlyStats.diff >= 0 ? '+' : ''}{monthlyStats.diff.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-gold/20 bg-black-secondary shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-gold/10 bg-black/40 p-3 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
                    <TrendingUp className="w-3 h-3 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-2xl text-gold font-black uppercase tracking-tight italic leading-tight">
                      Funil de Cobrança
                    </CardTitle>
                    <p className="text-[8px] md:text-xs text-gold font-bold uppercase tracking-widest mt-0.5 opacity-60">Gestão de adimplência e vencimentos</p>
                  </div>
                </div>

                <div className="relative w-full md:w-[350px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/40" />
                  <Input
                    placeholder="BUSCAR CLIENTE..."
                    className="w-full h-9 pl-10 bg-black-lighter border-gold/20 text-[10px] text-white rounded-lg focus:border-gold/50 shadow-inner transition-all font-bold uppercase placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-black/20">
              {loading ? (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-gold/20" />
                    <p className="text-xs font-black uppercase tracking-widest text-gold/20">Carregando dados do funil...</p>
                  </div>
                </div>
              ) : (
                <SalesFunnel
                  users={users.filter(u =>
                    u.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.user_metadata?.phone?.includes(searchTerm)
                  )}
                  onCobrar={(user) => {
                    setSelectedUserForCobrar(user);
                    setIsCobrarModalOpen(true);
                  }}
                  onFeedback={(userId) => {
                    navigate(`/admin/suporte?tab=suggestions&userId=${userId}`);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gold/20 bg-black-secondary shadow-xl overflow-hidden p-0">
              <CardHeader className="border-b border-gold/10 bg-black/20 pt-4 pb-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-gold flex items-center gap-2 font-black uppercase tracking-tight">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    Performance de Vendas
                  </CardTitle>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Volume de transações nos últimos 6 meses</p>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="h-[150px] md:h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #c5a447', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#c5a447' }}
                      />
                      <Bar dataKey="sales" fill="#c5a447" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-black-secondary shadow-xl overflow-hidden p-0">
              <CardHeader className="border-b border-gold/10 bg-black/20 pt-4 pb-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-gold flex items-center gap-2 font-black uppercase tracking-tight">
                    <DollarSign className="w-4 h-4 text-gold" />
                    Evolução da Receita
                  </CardTitle>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Faturamento bruto mensal consolidado</p>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="h-[150px] md:h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c5a447" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#c5a447" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `R$${value}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #c5a447', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#c5a447' }}
                        formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#c5a447" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CobrarModal
        user={selectedUserForCobrar}
        isOpen={isCobrarModalOpen}
        onClose={() => {
          setIsCobrarModalOpen(false);
          setSelectedUserForCobrar(null);
        }}
      />
    </AdminLayout>
  );
}
