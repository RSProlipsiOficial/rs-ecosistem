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
  ShoppingCart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserCredits {
  creditos_usados: number;
  limite_mensal: number;
  mes: number;
  ano: number;
  expires_at?: string;
}

export function CreditWarningCard() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserCredits();
  }, []);

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Real user credits query would go here
      // For now, showing no credits available
      setCredits(null);
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    setPurchasing(true);
    try {
      // Integração com Mercado Pago seria feita aqui
      // Por enquanto, simular compra
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o Mercado Pago.",
      });
      
      // Simular redirecionamento
      setTimeout(() => {
        window.open("https://mercadopago.com.br", "_blank");
        setPurchasing(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao processar compra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
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

  const creditsRemaining = credits.limite_mensal - credits.creditos_usados;
  const usagePercentage = (credits.creditos_usados / credits.limite_mensal) * 100;
  const isLowCredits = creditsRemaining <= 15;
  const isExpiringSoon = credits.expires_at && new Date(credits.expires_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const getExpirationDays = () => {
    if (!credits.expires_at) return null;
    const now = new Date();
    const expirationDate = new Date(credits.expires_at);
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const expirationDays = getExpirationDays();

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
                  {creditsRemaining} de {credits.limite_mensal} disponíveis
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-700">
              Ativo
            </Badge>
          </div>
          
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="w-5 h-5" />
          {isLowCredits && isExpiringSoon ? "Créditos Acabando e Expirando!" : 
           isLowCredits ? "Créditos Acabando!" : "Créditos Expirando!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background rounded-lg">
            <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="font-semibold text-lg">{creditsRemaining}</p>
            <p className="text-xs text-muted-foreground">Créditos restantes</p>
          </div>
          
          {isExpiringSoon && expirationDays !== null && (
            <div className="text-center p-3 bg-background rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="font-semibold text-lg">{expirationDays}</p>
              <p className="text-xs text-muted-foreground">
                {expirationDays === 1 ? "dia restante" : "dias restantes"}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Uso mensal</span>
            <span>{usagePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage > 85 ? "bg-red-500" : 
                usagePercentage > 70 ? "bg-orange-500" : "bg-green-500"
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            {isLowCredits && "Você está ficando sem créditos RS-IA. "}
            {isExpiringSoon && `Seus créditos expiram em ${expirationDays} ${expirationDays === 1 ? "dia" : "dias"}. `}
            Recarregue agora para continuar usando a IA sem interrupções.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePurchaseCredits}
              disabled={purchasing}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {purchasing ? "Processando..." : "Recarregar Créditos"}
            </Button>
            
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Mercado Pago
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-background p-2 rounded">
          💡 <strong>Dica:</strong> Compre packs maiores e economize! Os créditos não utilizados são transferidos para o próximo período.
        </div>
      </CardContent>
    </Card>
  );
}