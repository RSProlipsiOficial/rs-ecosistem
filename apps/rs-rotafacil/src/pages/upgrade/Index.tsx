import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Clock, CreditCard, Star, Shield, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";

export default function UpgradeIndex() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
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
        toast({
          title: "Erro ao carregar planos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Planos carregados:', data?.length);

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
      console.log('Assinatura atual:', data?.plan?.name);
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
        throw new Error(response.error.message || "Erro desconhecido ao processar pagamento");
      }

      if (response.data?.init_point) {
        window.location.href = response.data.init_point;
      } else {
        throw new Error("Link de pagamento não retornado pelo sistema.");
      }


    } catch (error: any) {
      console.error('Erro no upgrade:', error);

      toast({
        title: "Redirecionando para Manual",
        description: "Houve um erro no processamento automático. Abrindo WhatsApp para finalizar...",
      });

      // Fallback para WhatsApp
      // Fallback para WhatsApp REMOVIDO PARA TESTE
      // const planName = plans.find(p => p.id === planId)?.name || "Plano";
      // const message = `Olá, tentei assinar o plano *${planName}* pelo sistema mas ocorreu um erro técnico. Gostaria de finalizar manualmente.`;
      // window.open(`https://wa.me/5541992863922?text=${encodeURIComponent(message)}`, '_blank');
      console.error('Erro no upgrade:', error);
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadPlans(), loadCurrentSubscription()]);
    setLoading(false);
  };

  useEffect(() => {
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
        <div className="bg-gradient-black border border-gold/20 rounded-xl p-8 text-foreground relative overflow-hidden shadow-gold">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gold/10 rounded-xl">
                <Crown className="h-8 w-8 text-gold" />
              </div>
              <h1 className="text-4xl font-bold text-gold">Planos Premium</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              🚀 Escolha o plano ideal para o seu negócio de transporte escolar e tenha acesso a
              <span className="font-semibold text-gold"> todas as funcionalidades premium</span> para gerenciar suas rotas com eficiência e tecnologia de ponta.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center text-gold text-sm bg-gold/5 px-3 py-2 rounded-lg border border-gold/10">
                <Shield className="h-4 w-4 mr-2" />
                Segurança Total
                <div className="w-4 h-4 mr-2 ml-4" />
                <Brain className="h-4 w-4 mr-2" />
                Inteligência Artificial
              </div>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        {/* Toggle de Ciclo de Cobrança */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted p-1 rounded-lg inline-flex items-center gap-1 border border-border shadow-sm">
            <Button
              variant={billingCycle === 'monthly' ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
              className="px-6"
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === 'annual' ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle('annual')}
              className={cn("px-6", billingCycle === 'annual' && "bg-gold text-black-primary hover:bg-gold/90")}
            >
              Economia
              <Badge className="ml-2 bg-black-primary text-gold hover:bg-black-primary border-gold/30 px-1 h-4 text-[10px]">
                2 Meses Off
              </Badge>
            </Button>
          </div>
        </div>

        {/* Comparativo de Planos */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.status === 'active';

            // Map inconsistent plan_types to UI categories
            const isFree = ['free', 'gratis'].includes(plan.plan_type || '');
            const isInitial = ['inicial', 'basic'].includes(plan.plan_type || '');
            const isCrescimento = ['crescimento', 'growth'].includes(plan.plan_type || '');
            const isProfessionalPlan = ['professional', 'empresarial', 'profissional'].includes(plan.plan_type || '');
            const isEnterprisePlan = ['unlimited', 'enterprise', 'empresarial_top', 'ilimitado'].includes(plan.plan_type || '');

            const isHighlighted = isCrescimento || isProfessionalPlan || isEnterprisePlan;

            // Normalize features to array
            let featuresList: string[] = [];
            if (Array.isArray(plan.features)) {
              featuresList = plan.features
                .map(f => {
                  const text = String(f).trim();
                  const lower = text.toLowerCase();

                  // Substituir QUALQUER variação de WhatsApp
                  if (lower === 'por') return 'Suporte via WhatsApp';
                  if (lower.includes('whatsapp')) return 'Suporte via WhatsApp';
                  if (lower.startsWith('r ')) return 'Suporte via WhatsApp';

                  return text;
                })
                .filter(f => {
                  const cleaned = f.trim().toLowerCase();
                  // Filtro IMEDIATO - remove palavras proibidas logo de cara
                  if (cleaned.length <= 3) return false;
                  if (['r', 'e', 'de', 'em', 'com', 'para', 'até'].includes(cleaned)) return false;
                  return true;
                });
            } else if (typeof plan.features === 'object' && plan.features !== null) {
              featuresList = Object.entries(plan.features)
                .filter(([_, value]) => value === true)
                .map(([key]) => {
                  // Mapeamento de features conhecidas
                  const featureMap: Record<string, string> = {
                    'whatsapp_integration': 'Integração WhatsApp',
                    'ai_assistant': 'Assistente RS-IA Incluso',
                    'financial_management': 'Gestão Financeira',
                    'expense_tracking': 'Caderno de Gastos',
                    'priority_support': 'Suporte Prioritário',
                  };

                  return featureMap[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
                })
                .filter(f => f.length > 2); // Remove features muito curtas (provavelmente quebradas)
            }


            // SOLUÇÃO LIMPA: Se for plano grátis, substituir features quebradas
            if (isFree) {
              featuresList = [
                '7 dias de acesso total',
                'Assistente RS-IA Incluso',
                'Suporte via WhatsApp',
                '1 Van (julgamento após)',
                '15 alunos (ensaio após)',
                '10 gastos também'
              ];
            }


            const basePrice = typeof (plan as any)?.price === 'number' ? (plan as any).price : Number((plan as any)?.price) || 0;
            const limitations = (plan as any)?.limitations || {};

            // Definir desconto em meses conforme tipo de plano
            let discountMonths = 0;
            if (!isFree) {
              if (plan.plan_type === 'inicial') discountMonths = 0.5;
              else if (plan.plan_type === 'crescimento') discountMonths = 1.0;
              else if (plan.plan_type === 'profissional') discountMonths = 1.5;
              else if (plan.plan_type === 'ilimitado') discountMonths = 2.0;
            }

            // Calcular preços corretamente
            const monthlyPrice = basePrice;
            const annualPrice = basePrice * (12 - discountMonths);

            // LÓGICA CORRETA: Economia = annual, então mostra annualPrice
            const displayPrice = billingCycle === 'annual' ? annualPrice : monthlyPrice;
            const displayLabel = billingCycle === 'annual' ? '/ ano' : '/ mês';

            // Extract limits from features strings if columns/JSON are missing
            // Example: "1 Van", "15 alunos"
            let maxVansOverride = null;
            let maxStudentsOverride = null;

            featuresList.forEach(f => {
              const lower = f.toLowerCase();
              if (lower.includes('van')) {
                const match = lower.match(/^(\d+)\s+van/);
                if (match) maxVansOverride = parseInt(match[1]);
                if (lower.includes('ilimitada')) maxVansOverride = 9999;
              }
              if (lower.includes('aluno')) {
                const match = lower.match(/^(\d+)\s+aluno/);
                if (match) maxStudentsOverride = parseInt(match[1]);
                if (lower.includes('ilimitado')) maxStudentsOverride = 9999;
              }
            });

            // Ensure AI Assistant is clearly visible if included in limitations
            if (limitations.ai_assistant_included && !featuresList.some(f =>
              f.toLowerCase().includes('ia') || f.toLowerCase().includes('assistente')
            )) {
              featuresList.push("Assistente RS-IA Incluso");
            }

            // Priority: limitations JSON > extracted from strings > legacy columns
            const maxVans = limitations.max_vans ?? maxVansOverride ?? (plan as any)?.max_vans;
            const maxStudents = limitations.max_alunos ?? limitations.max_students ?? maxStudentsOverride ?? (plan as any)?.max_students;
            const maxExpenses = limitations.max_expenses ?? (plan as any)?.max_expenses;
            const trialDays = limitations.trial_days ?? (plan as any)?.trial_days ?? 0;

            const displayVans = maxVans === 9999 || maxVans === null || maxVans === undefined ? 'Ilimitadas' : `Até ${maxVans}`;
            const displayStudents = maxStudents === 9999 || maxStudents === null || maxStudents === undefined ? 'Ilimitados' : `Até ${maxStudents}`;

            return (
              <Card
                key={`${plan.id}-${billingCycle}-${featuresList.length}`}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-102 flex flex-col h-full ${isHighlighted
                  ? 'border-2 border-primary shadow-xl bg-card ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 hover:shadow-lg'
                  }`}
              >
                {isProfessionalPlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg uppercase tracking-wider">
                    <Star className="h-3 w-3 inline mr-1" />
                    Mais Popular
                  </div>
                )}
                {isEnterprisePlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg uppercase tracking-wider">
                    <Crown className="h-3 w-3 inline mr-1" />
                    Recomendado
                  </div>
                )}

                <CardHeader className={`pb-6 ${isHighlighted ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20' : ''}`}>
                  {/* Nome do Plano Centralizado */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {/* Show icons based on loose matching */}
                      {(isEnterprisePlan) && <Crown className="h-5 w-5 text-primary" />}
                      {(isProfessionalPlan) && <Star className="h-5 w-5 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  </div>

                  {/* Preço Centralizado */}
                  <div className="text-center">
                    {!isFree ? (
                      plan.plan_type === 'ilimitado' || plan.plan_type === 'unlimited' ? (
                        <>
                          <div className="text-5xl font-black text-gold mb-1">
                            A tratar
                          </div>
                          <div className="text-lg font-medium text-muted-foreground">
                            Valor sob consulta
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-black text-gold mb-1">
                            R$ {displayPrice.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-lg font-medium text-muted-foreground">
                            {displayLabel}
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="text-5xl font-black text-gold/80 uppercase">Grátis</div>
                        <div className="text-lg font-medium text-muted-foreground">Período de Teste</div>
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
                        {displayVans}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                        Alunos:
                      </span>
                      <span className="font-medium text-foreground">
                        {displayStudents}
                      </span>
                    </div>
                    {maxExpenses && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                          Gastos Mensais:
                        </span>
                        <span className="font-medium text-foreground">
                          Até {maxExpenses} lançamentos
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col flex-1 min-h-0">
                  {/* Recursos */}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-3 text-foreground">Recursos Inclusos:</h4>
                    <ul className="space-y-2">
                      {featuresList.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm group">
                          <div className="p-1 bg-gold/10 rounded-full mr-3 flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-gold" />
                          </div>
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {/* Capitalize first letter */}
                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                          </span>
                        </li>
                      )
                      )}
                    </ul>
                  </div>

                  {/* Período de teste para plano grátis */}
                  {isFree && trialDays > 0 && (
                    <div className="bg-gradient-black border border-gold/20 p-4 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-1 bg-gold/20 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-gold" />
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
                  <div className="pt-4 mt-auto">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full bg-gold/10 text-gold border-gold/20 hover:bg-gold/10" variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Plano Atual
                      </Button>
                    ) : (plan.plan_type === 'ilimitado' || plan.plan_type === 'unlimited') ? (
                      <Button
                        onClick={() => window.open(`https://wa.me/5541992863922?text=Olá,%20tenho%20interesse%20no%20plano%20Ilimitado%20da%20RS%20Prólipsi`, '_blank')}
                        className="w-full bg-gold hover:bg-gold/90 text-black-primary font-bold shadow-gold"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    ) : !isFree ? (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading}
                        className={`w-full transition-all duration-300 font-bold ${isHighlighted
                          ? 'bg-gold text-black-primary hover:bg-gold/90 shadow-gold'
                          : 'border-gold text-gold hover:bg-gold/10'
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


        {/* Políticas Gerais */}
        <Card className="bg-black-secondary border-gold/20 shadow-gold">
          <CardHeader className="bg-gold/5 border-b border-gold/10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Shield className="h-5 w-5 text-gold" />
              </div>
              <span className="text-gold">Políticas e Garantias</span>
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