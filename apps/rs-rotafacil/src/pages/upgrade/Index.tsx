import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Clock, CreditCard, Star, Shield, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function UpgradeIndex() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const { toast } = useToast();

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Erro ao carregar planos:', error);
        return;
      }
      
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setUpgrading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upgrade.",
          variant: "destructive",
        });
        return;
      }

      console.log('Iniciando pagamento para:', planId);
      
      const response = await supabase.functions.invoke('mercado-pago-payment', {
        body: { planId, userId: user.id, origin: window.location.origin }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.init_point) {
        window.location.href = response.data.init_point;
      }

    } catch (error) {
      console.error('Erro no upgrade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o upgrade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPlans(), loadCurrentSubscription()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando planos...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-yellow-400 rounded-xl p-8 text-blue-900 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-900/10 rounded-xl">
                <Crown className="h-8 w-8 text-blue-900" />
              </div>
              <h1 className="text-4xl font-bold text-blue-900">Planos RotaFácil</h1>
            </div>
            <p className="text-blue-900 text-lg max-w-2xl leading-relaxed">
              🚀 Escolha o plano ideal para o seu negócio de transporte escolar e tenha acesso a 
              <span className="font-semibold text-blue-900"> todas as funcionalidades necessárias</span> para gerenciar suas rotas com eficiência.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center text-blue-900 text-sm bg-blue-900/10 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4 mr-2" />
                Dados seguros
              </div>
              <div className="flex items-center text-blue-900 text-sm bg-blue-900/10 px-3 py-2 rounded-lg">
                <Star className="h-4 w-4 mr-2" />
                Suporte especializado
              </div>
            </div>
          </div>
        </div>

        {/* Comparativo de Planos */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.status === 'active';
            const isFree = plan.plan_type === 'free';
            const isPremiumPlan = plan.plan_type === 'premium';
            const isProfessionalPlan = plan.plan_type === 'professional';
            
            const isHighlighted = isPremiumPlan || isProfessionalPlan;

            // Derived fields from JSON columns (features/limitations) and fallbacks
            const features = (plan as any)?.features || {};
            const limitations = (plan as any)?.limitations || {};
            const price = typeof (plan as any)?.price === 'number' ? (plan as any).price : Number((plan as any)?.price) || 0;
            const trialDays = (features as any).trial_days ?? (plan as any)?.trial_days ?? 0;
            const maxVans = (plan as any)?.max_vans ?? (features as any).max_vans ?? (limitations as any).max_vans ?? ((features as any).vans_ilimitadas ? null : undefined);
            const maxStudents = (plan as any)?.max_students ?? (features as any).max_students ?? (features as any).max_alunos ?? ((features as any).alunos_ilimitados ? null : undefined);
            const maxExpenses = (plan as any)?.max_expenses ?? (limitations as any).max_expenses ?? (limitations as any).max_gastos;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-102 ${
                  isHighlighted 
                    ? 'border-2 border-primary shadow-xl bg-card ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:shadow-lg'
                }`}
              >
                {isPremiumPlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg uppercase tracking-wider">
                    <Star className="h-3 w-3 inline mr-1" />
                    Mais Popular
                  </div>
                )}
                {isProfessionalPlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg uppercase tracking-wider">
                    <Crown className="h-3 w-3 inline mr-1" />
                    Recomendado
                  </div>
                )}
                
                <CardHeader className={`pb-6 ${isHighlighted ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20' : ''}`}>
                  {/* Nome do Plano Centralizado */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {isProfessionalPlan && <Crown className="h-5 w-5 text-primary" />}
                      {isPremiumPlan && <Star className="h-5 w-5 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  </div>
                  
                  {/* Preço Centralizado */}
                  <div className="text-center">
                    {!isFree && (
                      <>
                        <div className="text-5xl font-black text-primary mb-1">
                          R$ {price.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-lg font-medium text-muted-foreground">/mês</div>
                      </>
                    )}
                    {isFree && (
                      <>
                        <div className="text-5xl font-black text-green-600">Grátis</div>
                        <div className="text-lg font-medium text-muted-foreground">Para sempre</div>
                      </>
                    )}
                  </div>
                  
                  {/* Resumo dos limites */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                        Vans:
                      </span>
                      <span className="font-medium text-foreground">
                        {maxVans ? `Até ${maxVans}` : 'Ilimitadas'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                        Alunos:
                      </span>
                      <span className="font-medium text-foreground">
                        {maxStudents ? `Até ${maxStudents}` : 'Ilimitados'}
                      </span>
                    </div>
                    {maxExpenses && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                          Gastos:
                        </span>
                        <span className="font-medium text-foreground">
                          Até {maxExpenses} lançamentos
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Recursos */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-foreground">Recursos Inclusos:</h4>
                    <ul className="space-y-2">
                      {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, value], index) => (
                        value === true && (
                          <li key={index} className="flex items-start text-sm group">
                            <div className="p-1 bg-green-500/10 rounded-full mr-3 flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                            </span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>

                  {/* Período de teste para plano grátis */}
                  {isFree && trialDays > 0 && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20 p-4 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-1 bg-blue-500/20 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {trialDays} dias de teste completo
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-7">
                        Acesso total por {trialDays} dias, depois limitado
                      </p>
                    </div>
                  )}

                  {/* Botão de Ação */}
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10" variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Plano Atual
                      </Button>
                    ) : !isFree ? (
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading}
                        className={`w-full transition-all duration-300 ${
                          isHighlighted 
                            ? 'bg-primary text-slate-900 hover:bg-primary/90 hover:text-slate-900' 
                            : 'border-primary text-primary hover:bg-primary hover:text-slate-900'
                        }`}
                        variant={isHighlighted ? 'default' : 'outline'}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {upgrading ? 'Processando...' : 'Fazer Upgrade'}
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-muted/50 text-muted-foreground" variant="outline">
                        Plano Gratuito
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Seção de Créditos RS-IA */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Créditos RS-IA</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Amplie seu sistema com inteligência artificial. Compre créditos para usar nosso assistente IA.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {/* Pack Básico */}
            <Card className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Pack Básico</CardTitle>
                <div className="text-3xl font-bold text-primary">R$ 9,90</div>
                <p className="text-sm text-muted-foreground">100 créditos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>100 consultas IA</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Válido por 30 dias</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>

            {/* Pack Premium */}
            <Card className="border-2 border-primary shadow-xl bg-primary/5 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                POPULAR
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Pack Premium</CardTitle>
                <div className="text-3xl font-bold text-primary">R$ 39,90</div>
                <p className="text-sm text-muted-foreground">500 créditos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>500 consultas IA</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Válido por 45 dias</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    <span>Melhor custo-benefício</span>
                  </div>
                </div>
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>

            {/* Pack Profissional */}
            <Card className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Pack Profissional</CardTitle>
                <div className="text-3xl font-bold text-primary">R$ 99,90</div>
                <p className="text-sm text-muted-foreground">1500 créditos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>1500 consultas IA</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Válido por 60 dias</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Crown className="w-4 h-4 text-purple-500 mr-2" />
                    <span>Para uso intensivo</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>

            {/* Pack Empresarial */}
            <Card className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Pack Empresarial</CardTitle>
                <div className="text-3xl font-bold text-primary">R$ 299,90</div>
                <p className="text-sm text-muted-foreground">5000 créditos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>5000 consultas IA</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Válido por 90 dias</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span>Solução empresarial</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Políticas Gerais */}
        <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Políticas e Garantias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xl">💼</div>
                  <h4 className="font-medium text-foreground">Assinaturas por CNPJ</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cada CNPJ deve ter sua própria assinatura. O sistema reconhece o plano ativo e bloqueia o acesso caso a mensalidade não seja paga.
                </p>
              </div>
              
              <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xl">🔄</div>
                  <h4 className="font-medium text-foreground">Renovação Automática</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A renovação é mensal com cobrança automática via Mercado Pago (cartão, PIX, etc.).
                </p>
              </div>
              
              <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xl">📱</div>
                  <h4 className="font-medium text-foreground">Avisos Automáticos</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sistema envia avisos por WhatsApp e e-mail: 2 dias antes, no vencimento e 1 dia após vencido.
                </p>
              </div>
              
              <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xl">🛡️</div>
                  <h4 className="font-medium text-foreground">Garantias</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dados seguros, suporte especializado, atualizações incluídas e possibilidade de cancelar a qualquer momento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}