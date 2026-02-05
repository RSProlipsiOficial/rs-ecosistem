import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Video, BookOpen, MessageSquare, BarChart3, Bot, Loader2, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin-layout";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminIndex() {
  const [stats, setStats] = useState({
    apps: 0,
    billing: { mrr: 0, total: 0, active_subscriptions: 0 }
  });
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Usar RPC para maior estabilidade e evitar erros 500 da Edge Function
        const { data: usersList, error: rpcError } = await (supabase.rpc as any)('get_admin_users_list');

        let finalUsersList: any[] = [];
        if (rpcError) {
          console.error("Erro RPC ao carregar usuários:", rpcError);
          // Fallback para invoke se o RPC falhar (migração pode não ter propagado)
          const { data: fallbackData } = await supabase.functions.invoke('admin-users-v3?all=true', {
            method: 'GET'
          });
          finalUsersList = fallbackData?.users || [];
        } else {
          finalUsersList = Array.isArray(usersList) ? usersList : [];
        }

        const { data: billingData } = await (supabase.rpc as any)('get_admin_billing_summary');
        const { data: growthResult } = await (supabase.rpc as any)('get_admin_growth_stats');

        setGrowthData(growthResult || []);
        const billing = billingData || { mrr: 0, total: 0, active_subscriptions: 0 };
        setStats({
          apps: billing.active_subscriptions || 0,
          billing: billing
        });
      } catch (error) {
        console.error("Erro ao carregar stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gerencie aplicativos, conteúdos e IA do sistema
            </p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard de Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Apps Vendidos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.apps}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de vendas realizadas
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/apps">
                  Ver Todos os Apps
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Faturamento Summary */}
          <Card className="bg-gradient-gold/5 border-gold/20 shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recorrência (MRR)</CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">
                R$ {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.billing.mrr.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ganhos recorrentes ativos</p>
              <Button className="w-full mt-4 bg-gold/10 hover:bg-gold/20 text-gold border-gold/20" variant="outline" asChild>
                <Link to="/admin/financeiro">Ver Detalhes</Link>
              </Button>
            </CardContent>
          </Card>


          {/* Chatbot / IA */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chatbot / IA
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure a Inteligência Artificial e Respostas
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/suporte">
                  Configurar IA
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Site Principal monolayer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Site Principal
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link exibido nos apps dos clientes
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/site">
                  Configurar Site
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Crescimento (BI) */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Crescimento (Novas Assinaturas 30d)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="new_activations"
                    stroke="#EAB308"
                    fillOpacity={1}
                    fill="url(#colorGrowth)"
                    strokeWidth={2}
                    name="Ativações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Saúde do Ecossistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assinaturas Ativas</span>
                <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                  {stats.billing.active_subscriptions || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ticket Médio (ARPU)</span>
                <span className="font-bold">
                  R$ {stats.billing.active_subscriptions > 0
                    ? (stats.billing.mrr / stats.billing.active_subscriptions).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-4">Ações Rápidas de Admin</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="border-gold/20 text-gold hover:bg-gold/10" asChild>
                    <Link to="/admin/suporte">Suporte IA</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="border-gold/20 text-gold hover:bg-gold/10" asChild>
                    <Link to="/admin/auditoria">Ver Logs</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}