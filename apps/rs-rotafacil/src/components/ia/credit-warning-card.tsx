import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CreditCard,
  Clock,
  Zap,
  Brain,
  ShoppingCart,
  Check,
  Star,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserCredits {
  creditos_usados: number;
  limite_mensal: number;
  mes: number;
  ano: number;
  expires_at?: string;
}

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  validity_days: number;
  billing_cycle: 'monthly' | 'annual';
  is_popular: boolean;
}

export function CreditWarningCard() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  const { toast } = useToast();

  useEffect(() => {
    loadUserCredits();
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_credit_packs')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      setPacks(data || []);
    } catch (error) {
      console.error('Erro ao carregar packs:', error);
    }
  };

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();

      const { data, error } = await supabase
        .from('user_ai_credits')
        .select('*')
        .eq('user_id', user.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCredits({
          creditos_usados: data.creditos_usados,
          limite_mensal: data.limite_mensal,
          mes: data.mes,
          ano: data.ano
        });
      } else {
        const { error: consumeError } = await supabase.rpc('consume_ai_credit', {
          p_user_id: user.id,
          p_credits: 0
        });

        if (!consumeError) {
          const { data: newData } = await supabase
            .from('user_ai_credits')
            .select('*')
            .eq('user_id', user.id)
            .eq('mes', mes)
            .eq('ano', ano)
            .single();

          if (newData) {
            setCredits({
              creditos_usados: newData.creditos_usados,
              limite_mensal: newData.limite_mensal,
              mes: newData.mes,
              ano: newData.ano
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPack) return;
    setPurchasing(true);
    try {
      toast({
        title: "Iniciando pagamento",
        description: `Método escolhido: ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}.`,
      });

      // Aqui chamaria o edge function mercado-pago-payment
      // await supabase.functions.invoke('mercado-pago-payment', { ... })

      setTimeout(() => {
        window.open("https://www.mercadopago.com.br", "_blank");
        setPurchasing(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Erro ao processar compra:', error);
      setPurchasing(false);
    }
  };

  if (loading || !credits) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-muted-foreground">Carregando créditos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnlimited = credits.limite_mensal === -1;
  const creditsRemaining = isUnlimited ? "Ilimitado" : credits.limite_mensal - credits.creditos_usados;
  const usagePercentage = isUnlimited ? 0 : (credits.creditos_usados / credits.limite_mensal) * 100;
  const isLowCredits = !isUnlimited && (Number(creditsRemaining) <= 15);
  const isExpiringSoon = credits.expires_at && new Date(credits.expires_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const getExpirationDays = () => {
    if (!credits.expires_at) return null;
    const now = new Date();
    const expirationDate = new Date(credits.expires_at);
    const diffTime = expirationDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expirationDays = getExpirationDays();

  const renderContent = () => {
    if (!isLowCredits && !isExpiringSoon) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Créditos RS-IA</p>
                  <p className="text-sm text-muted-foreground">
                    {isUnlimited ? "Uso Ilimitado" : `${creditsRemaining} de ${credits.limite_mensal} disponíveis`}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                Ativo
              </Badge>
            </div>

            {!isUnlimited && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uso mensal</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs h-8 border border-dashed hover:bg-accent">
                  <Plus className="w-3 h-3 mr-1" /> Recarregar Créditos
                </Button>
              </DialogTrigger>
              {renderModalContent()}
            </Dialog>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200 text-base">
            <AlertTriangle className="w-5 h-5" />
            {isLowCredits && isExpiringSoon ? "Créditos acabando e expirando!" :
              isLowCredits ? "Créditos acabando!" : "Créditos expirando!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background border rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="font-semibold text-lg">{creditsRemaining}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Créditos Restantes</p>
            </div>

            {isExpiringSoon && expirationDays !== null && (
              <div className="text-center p-3 bg-background border rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-lg">{expirationDays}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  {expirationDays === 1 ? "Dia restante" : "Dias restantes"}
                </p>
              </div>
            )}
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Recarregar Agora
              </Button>
            </DialogTrigger>
            {renderModalContent()}
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  const renderModalContent = () => (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Brain className="w-6 h-6 text-primary" />
          Recarga de Créditos RS-IA
        </DialogTitle>
        <DialogDescription>
          Escolha o pacote que melhor atende suas necessidades.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-6">
        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center">
          <div className="bg-muted p-1 rounded-lg inline-flex items-center gap-1 border border-border shadow-sm">
            <Button
              variant={billingCycle === 'monthly' ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
              className="px-6 h-8 text-xs"
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === 'annual' ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle('annual')}
              className="px-6 h-8 text-xs relative"
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] px-1 rounded-full">OFF</span>
            </Button>
          </div>
        </div>

        {/* Lista de Packs */}
        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {packs
            .filter(p => p.billing_cycle === billingCycle)
            .map(pack => (
              <div
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${selectedPack?.id === pack.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50 bg-card'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedPack?.id === pack.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {pack.is_popular ? <Star className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      {pack.name}
                      {pack.is_popular && <Badge className="h-4 text-[9px] bg-yellow-500">POPULAR</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{pack.credits} créditos</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">R$ {pack.price.toFixed(2).replace('.', ',')}</div>
                  <div className="text-[10px] text-muted-foreground">Ciclo {billingCycle === 'annual' ? 'Anual' : 'Mensal'}</div>
                </div>
              </div>
            ))}
        </div>

        {/* Método de Pagamento */}
        {selectedPack && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Forma de Pagamento
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 font-bold shadow-sm' : 'hover:bg-muted opacity-70'
                  }`}
              >
                <span>PIX (Instantâneo)</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 font-bold shadow-sm' : 'hover:bg-muted opacity-70'
                  }`}
              >
                <span>Cartão de Crédito</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          onClick={() => setIsModalOpen(false)}
          className="text-xs"
        >
          Cancelar
        </Button>
        <Button
          onClick={handlePurchase}
          disabled={!selectedPack || purchasing}
          className="bg-primary text-white px-8 h-10 shadow-lg hover:shadow-xl transition-all"
        >
          {purchasing ? "Processando..." : (
            <div className="flex items-center">
              Pagar R$ {selectedPack?.price.toFixed(2).replace('.', ',')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </div>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return renderContent();
}