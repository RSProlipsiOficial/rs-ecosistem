import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Crown, 
  Zap,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  plan: {
    plan_type: string;
    features: any;
  };
}

export function TrialCountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar dados reais do usuário
  useEffect(() => {
    const checkUserSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Buscar assinatura do usuário
        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar assinatura:', error);
          setLoading(false);
          return;
        }

        if (subscription && subscription.status === 'trial') {
          setIsTrialUser(true);
          
          // Calcular data de fim do trial baseado na data de criação da assinatura
          const createdAt = new Date(subscription.created_at);
          const features = subscription.plan?.features as any;
          const trialDays = features?.trial_days || 7;
          const endDate = new Date(createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
          
          setTrialEndDate(endDate);
        } else {
          setIsTrialUser(false);
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSubscription();
  }, []);

  useEffect(() => {
    if (!isTrialUser || !isVisible || !trialEndDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = trialEndDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calcular imediatamente
    calculateTimeLeft();

    // Atualizar a cada segundo
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isTrialUser, isVisible, trialEndDate]);

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Não mostrar se carregando, não for usuário trial ou se foi fechado
  if (loading || !isTrialUser || !isVisible || !trialEndDate) {
    return null;
  }

  // Não mostrar se ainda tem mais de 3 dias
  if (timeLeft.days > 3) {
    return null;
  }

  const isUrgent = timeLeft.days <= 1;
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className={`w-full ${
      isUrgent ? 
        'bg-gradient-to-r from-red-600 via-red-500 to-orange-500' : 
        'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
    } text-white shadow-lg relative overflow-hidden`}>
      {/* Animação de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isUrgent ? 'bg-red-700' : 'bg-orange-600'
              }`}>
                <Clock className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {isExpired ? "PERÍODO GRATUITO EXPIRADO!" : "SEU PERÍODO GRATUITO EXPIRA EM:"}
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    GRÁTIS
                  </Badge>
                </div>
              </div>
            </div>

            {!isExpired && (
              <div className="flex items-center gap-4">
                {/* Cronômetro */}
                <div className="flex items-center gap-2">
                  {timeLeft.days > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-bold">{timeLeft.days}</div>
                      <div className="text-xs opacity-90">DIAS</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs opacity-90">HORAS</div>
                  </div>
                  
                  <div className="text-lg font-bold opacity-60">:</div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs opacity-90">MIN</div>
                  </div>
                  
                  <div className="text-lg font-bold opacity-60">:</div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs opacity-90">SEG</div>
                  </div>
                </div>

                {/* Texto motivacional */}
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {isUrgent ? 
                      "⚠️ ÚLTIMO DIA! Não perca o acesso!" : 
                      "🚀 Aproveite 50% OFF no upgrade!"
                    }
                  </p>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  ⚠️ Faça upgrade agora para continuar usando o sistema!
                </span>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleUpgrade}
              className={`font-bold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isUrgent ? 
                  'bg-white text-red-600 hover:bg-red-50' : 
                  'bg-white text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Crown className="w-4 h-4 mr-2" />
              {isExpired ? "REATIVAR AGORA" : "FAZER UPGRADE"}
            </Button>

            {!isExpired && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        {!isExpired && (
          <div className="mt-2">
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isUrgent ? 'bg-red-300' : 'bg-yellow-300'
                }`}
                style={{ 
                  width: `${Math.max(10, (timeLeft.days * 24 + timeLeft.hours) / (7 * 24) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}