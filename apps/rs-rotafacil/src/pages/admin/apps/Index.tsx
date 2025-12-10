import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Users, CheckCircle, XCircle, DollarSign, Edit, KeyRound, RotateCcw, Crown, Zap, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    user_type?: string;
  };
  app_data?: {
    status: string;
    valor_pago: number;
    data_compra?: string;
  };
  subscription?: {
    id: string;
    plan_id: string;
    status: string;
    plan_name: string;
    plan_price?: number;
    expires_at?: string;
  };
  all_subscriptions?: Array<{
    id: string;
    plan_id: string;
    status: string;
    created_at: string;
    subscription_plans?: {
      name: string;
      price: number;
    };
  }>;
  ai_credits?: {
    creditos_usados: number;
    limite_mensal: number;
    mes: number;
    ano: number;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  plan_type: string;
  description: string;
}

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  user_type?: string;
}

export default function AdminAppsIndex() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isCreditsDialogOpen, setIsCreditsDialogOpen] = useState(false);
  const [selectedCreditsPackage, setSelectedCreditsPackage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [newCreditsLimit, setNewCreditsLimit] = useState("");
  const [iaRevenue, setIaRevenue] = useState(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    user_type: "user"
  });

  const [editFormData, setEditFormData] = useState<Partial<CreateUserData>>({
    name: "",
    phone: "",
    user_type: "user"
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadUsers();
    loadPlans();
    loadIaRevenue();
  }, []);

  useEffect(() => {
    let filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.user_metadata?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (statusFilter !== "todos") {
      if (statusFilter === "ativo") {
        filtered = filtered.filter(user => user.app_data?.status === "ativo");
      } else if (statusFilter === "inativo") {
        filtered = filtered.filter(user => user.app_data?.status === "inativo" || !user.app_data);
      }
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, users, statusFilter]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET'
      });

      if (error) throw error;
      
      // Combinar dados dos usuários com dados de apps vendidos e subscriptions
      const usersWithAppData = await Promise.all(
        (data.users || []).map(async (user: any) => {
          // Buscar apps vendidos por email
          const { data: appData } = await supabase
            .from('apps_vendidos')
            .select('*')
            .eq('email_cliente', user.email)
            .maybeSingle();

          // Buscar subscription ativa
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select(`
              id,
              plan_id,
              status,
              expires_at,
              subscription_plans(name, price)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .maybeSingle();

          // Buscar TODAS as subscriptions pagas (históricas) para somar
          const { data: allSubscriptions } = await supabase
            .from('user_subscriptions')
            .select(`
              id,
              plan_id,
              status,
              created_at,
              subscription_plans(name, price)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          const { data: aiCreditsData } = await supabase
            .from('user_ai_credits')
            .select('*')
            .eq('user_id', user.id)
            .eq('mes', new Date().getMonth() + 1)
            .eq('ano', new Date().getFullYear())
            .maybeSingle();

          return {
            ...user,
            app_data: appData ? {
              status: appData.status,
              valor_pago: appData.valor_pago,
              data_compra: appData.created_at
            } : null,
            subscription: subscriptionData ? {
              id: subscriptionData.id,
              plan_id: subscriptionData.plan_id,
              status: subscriptionData.status,
              plan_name: subscriptionData.subscription_plans?.name || 'Plano Desconhecido',
              plan_price: subscriptionData.subscription_plans?.price ?? undefined,
              expires_at: subscriptionData.expires_at
            } : null,
            all_subscriptions: allSubscriptions || [],
            ai_credits: aiCreditsData || null
          };
        })
      );

      setUsers(usersWithAppData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };
  
  const loadIaRevenue = async () => {
    try {
      const start = new Date();
      start.setDate(1); start.setHours(0,0,0,0);
      const startISO = start.toISOString();
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1); end.setDate(0); end.setHours(23,59,59,999);
      const endISO = end.toISOString();

      const { data: subs, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          created_at,
          payment_method,
          subscription_plans(name, price, plan_type)
        `)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (error) throw error;

      const iaSum = (subs || []).filter((s: any) => s.payment_method === 'mercadopago')
        .reduce((sum: number, s: any) => {
          const name = (s.subscription_plans?.name || '').toLowerCase();
          const type = (s.subscription_plans?.plan_type || '').toLowerCase();
          const isIa = type.includes('ia') || type.includes('credit') || name.includes('crédito') || name.includes('credito') || name.includes('ia');
          return sum + (isIa ? (s.subscription_plans?.price || 0) : 0);
        }, 0);

      setIaRevenue(iaSum);
    } catch (error) {
      console.error('Erro ao calcular receita de IA:', error);
      setIaRevenue(0);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: {
          email: formData.email,
          password: formData.password,
          metadata: {
            name: formData.name,
            phone: formData.phone,
            user_type: formData.user_type
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });

      setIsDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        user_type: "user"
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.user_metadata?.name || "",
      phone: user.user_metadata?.phone || "",
      user_type: user.user_metadata?.user_type || "user"
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'PUT',
        body: {
          userId: editingUser.id,
          metadata: {
            name: editFormData.name,
            phone: editFormData.phone,
            user_type: editFormData.user_type
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditFormData({
        name: "",
        phone: "",
        user_type: "user"
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'PUT',
        body: {
          userId: selectedUser.id,
          password: newPassword
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha resetada com sucesso!",
      });

      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar a senha.",
        variant: "destructive",
      });
    }
  };

  const handleActivateUpgrade = async () => {
    if (!selectedUser || !selectedPlanId) return;

    try {
      // Primeiro, desativar todas as subscriptions existentes do usuário
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', selectedUser.id);

      if (updateError) throw updateError;

      // Criar nova subscription ativa
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: selectedUser.id,
          plan_id: selectedPlanId,
          status: 'active',
          payment_method: 'admin_activation',
          expires_at: null // Ilimitado quando ativado pelo admin
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Upgrade ativado com sucesso!",
      });

      setIsUpgradeDialogOpen(false);
      setSelectedUser(null);
      setSelectedPlanId("");
      loadUsers();
    } catch (error) {
      console.error('Erro ao ativar upgrade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o upgrade.",
        variant: "destructive",
      });
    }
  };

  const creditPackages = [
    { value: "50", label: "Pacote Básico - 50 créditos" },
    { value: "100", label: "Pacote Padrão - 100 créditos" },
    { value: "200", label: "Pacote Premium - 200 créditos" },
    { value: "500", label: "Pacote Profissional - 500 créditos" },
    { value: "1000", label: "Pacote Empresarial - 1000 créditos" },
    { value: "-1", label: "Ilimitado - Sem limite" }
  ];

  const handleUpdateCredits = async () => {
    if (!selectedUser || !selectedCreditsPackage) return;

    try {
      // Buscar ou criar registro de créditos para o mês atual
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Buscar registro atual
      const { data: current, error: fetchErr } = await supabase
        .from('user_ai_credits')
        .select('*')
        .eq('user_id', selectedUser.id)
        .eq('mes', currentMonth)
        .eq('ano', currentYear)
        .maybeSingle();

      if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

      const packValue = parseInt(selectedCreditsPackage);
      let newLimit = packValue;
      const used = current?.creditos_usados || 0;

      if (packValue === -1) {
        newLimit = -1; // Força ilimitado
      } else if (current) {
        newLimit = current.limite_mensal === -1 ? -1 : (current.limite_mensal || 0) + packValue; // Soma ao limite atual
      }

      const { error: upsertError } = await supabase
        .from('user_ai_credits')
        .upsert({
          user_id: selectedUser.id,
          mes: currentMonth,
          ano: currentYear,
          limite_mensal: newLimit,
          creditos_usados: used
        }, {
          onConflict: 'user_id,mes,ano'
        });

      if (upsertError) throw upsertError;

      toast({
        title: "Sucesso",
        description: "Créditos de IA atualizados com sucesso!",
      });

      setIsCreditsDialogOpen(false);
      setSelectedUser(null);
      setSelectedCreditsPackage("");
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os créditos.",
        variant: "destructive",
      });
    }
  };

  // Estatísticas calculadas
  const getValorPago = (user: User) => {
    let valor = 0;
    
    // 1. Valor de apps vendidos (compras reais)
    if (user.app_data?.valor_pago && user.app_data.valor_pago > 0) {
      valor += user.app_data.valor_pago;
    }
    
    // 2. Apenas subscription ativa atual (não somar histórico)
    if (user.subscription?.status === 'active' && user.subscription?.plan_price && user.subscription.plan_price > 0) {
      valor += user.subscription.plan_price;
    }
    
    console.log(`Valor calculado para ${user.email}:`, {
      app_vendido: user.app_data?.valor_pago || 0,
      subscription_ativa: (user.subscription?.status === 'active' ? user.subscription?.plan_price : 0) || 0,
      total: valor
    });
    
    return valor;
  };

  const aiStats = {
    totalUsers: users.filter(user => user.ai_credits).length,
    totalCreditsUsed: users.reduce((sum, user) => sum + (user.ai_credits?.creditos_usados || 0), 0),
    totalCreditsLimit: users.reduce((sum, user) => {
      const limit = user.ai_credits?.limite_mensal || 0;
      return sum + (limit === -1 ? 0 : limit);
    }, 0),
    unlimitedUsers: users.filter(user => user.ai_credits?.limite_mensal === -1).length
  };

  const stats = {
    total: users.length,
    ativos: users.filter(user => user.subscription?.status === 'active').length,
    inativos: users.length - users.filter(user => user.subscription?.status === 'active').length,
    receita: users.reduce((sum, user) => {
      const valorUsuario = getValorPago(user);
      return sum + valorUsuario;
    }, 0),
  };

  console.log('Stats finais:', stats);
  console.log('Detalhes dos usuários:', users.map(u => ({
    email: u.email,
    subscription_status: u.subscription?.status,
    subscription_price: u.subscription?.plan_price,
    app_valor: u.app_data?.valor_pago,
    all_subscriptions_count: u.all_subscriptions?.length || 0,
    valor_calculado: getValorPago(u)
  })));

  const getStatusBadge = (user: User) => {
    if (!user.app_data) {
      return <Badge variant="secondary">Sem App</Badge>;
    }
    
    switch (user.app_data.status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="destructive">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{user.app_data.status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Painel completo de gestão de usuários e controle de aplicativos
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setFormData({
                email: "",
                password: "",
                name: "",
                phone: "",
                user_type: "user"
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="user_type">Tipo de Usuário</Label>
                  <Select value={formData.user_type} onValueChange={(value) => setFormData(prev => ({ ...prev, user_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">
                  Criar Usuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total} usuários cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apps Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.ativos / stats.total) * 100 || 0).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apps Inativos</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inativos}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.inativos / stats.total) * 100 || 0).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">R$ {iaRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Receita de créditos IA vendidos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(stats.receita + iaRevenue).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Valor total (Apps + Créditos IA)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo/Sem App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando usuários...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                     <TableHead>E-mail</TableHead>
                     <TableHead>Status App</TableHead>
                     <TableHead>Plano Atual</TableHead>
                     <TableHead>Créditos IA</TableHead>
                     <TableHead>Valor Pago</TableHead>
                     <TableHead>Data Cadastro</TableHead>
                     <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                           Nenhum usuário encontrado
                         </TableCell>
                       </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.user_metadata?.name || 'Não informado'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                         <TableCell>
                           {getStatusBadge(user)}
                         </TableCell>
                         <TableCell>
                           {user.subscription ? (
                             <Badge variant="default" className="bg-blue-600">
                               {user.subscription.plan_name}
                             </Badge>
                           ) : (
                             <span className="text-muted-foreground">Sem plano</span>
                           )}
                         </TableCell>
                         <TableCell>
                           {user.ai_credits ? (
                             <div className="text-sm">
                               <div className="text-blue-600 font-medium">
                                 {user.ai_credits.creditos_usados}/{user.ai_credits.limite_mensal === -1 ? "∞" : user.ai_credits.limite_mensal}
                               </div>
                               <div className="text-muted-foreground">
                                 {user.ai_credits.mes}/{user.ai_credits.ano}
                               </div>
                             </div>
                           ) : (
                             <span className="text-muted-foreground">Não configurado</span>
                           )}
                         </TableCell>
                          <TableCell>
                           {getValorPago(user) > 0 ? (
                             <span className="text-green-600 font-medium">
                               R$ {getValorPago(user).toFixed(2)}
                             </span>
                           ) : (
                             <span className="text-muted-foreground">-</span>
                           )}
                         </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setSelectedUser(user);
                                 setIsResetPasswordDialogOpen(true);
                               }}
                             >
                               <KeyRound className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditUser(user)}
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setSelectedUser(user);
                                 setIsUpgradeDialogOpen(true);
                               }}
                             >
                               <Crown className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedCreditsPackage(user.ai_credits?.limite_mensal?.toString() || "100");
                                  setIsCreditsDialogOpen(true);
                                }}
                             >
                               <Zap className="w-4 h-4" />
                             </Button>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Editar Usuário */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label>E-mail</Label>
                <Input 
                  value={editingUser?.email || ''} 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="editName">Nome</Label>
                <Input
                  id="editName"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Telefone</Label>
                <Input
                  id="editPhone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editUserType">Tipo de Usuário</Label>
                <Select value={editFormData.user_type} onValueChange={(value) => setEditFormData(prev => ({ ...prev, user_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Salvar Alterações
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    setEditFormData({
                      name: "",
                      phone: "",
                      user_type: "user"
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Reset de Senha */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetar Senha do Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Usuário</Label>
                <Input 
                  value={selectedUser?.email || ''} 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleResetPassword}
                  disabled={!newPassword}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar Senha
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsResetPasswordDialogOpen(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Ativar Upgrade */}
        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ativar Upgrade Manual</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Usuário</Label>
                <Input 
                  value={selectedUser?.email || ''} 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="planSelect">Selecionar Plano</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleActivateUpgrade}
                  disabled={!selectedPlanId}
                  className="flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ativar Upgrade
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsUpgradeDialogOpen(false);
                    setSelectedUser(null);
                    setSelectedPlanId("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Gerenciar Créditos IA */}
        <Dialog open={isCreditsDialogOpen} onOpenChange={setIsCreditsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Créditos de IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Usuário</Label>
                <Input 
                  value={selectedUser?.email || ''} 
                  disabled 
                />
              </div>
              <div>
                <Label>Créditos Atuais</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedUser?.ai_credits ? (
                    `${selectedUser.ai_credits.creditos_usados}/${selectedUser.ai_credits.limite_mensal === -1 ? "Ilimitado" : selectedUser.ai_credits.limite_mensal} créditos usados em ${selectedUser.ai_credits.mes}/${selectedUser.ai_credits.ano}`
                  ) : (
                    "Nenhum crédito configurado"
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="creditsPackage">Selecionar Pacote de Créditos</Label>
                <Select 
                  value={selectedCreditsPackage} 
                  onValueChange={setSelectedCreditsPackage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um pacote de créditos" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditPackages.map((pack) => (
                      <SelectItem key={pack.value} value={pack.value}>
                        {pack.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateCredits}
                  disabled={!selectedCreditsPackage}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Atualizar Créditos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreditsDialogOpen(false);
                    setSelectedUser(null);
                    setSelectedCreditsPackage("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}