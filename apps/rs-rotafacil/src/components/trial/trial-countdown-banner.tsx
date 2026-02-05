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

        if (!subscription) {
          setIsTrialUser(false);
          setLoading(false);
          return;
        }

        const planData = subscription.plan as any;
        const planType = planData?.plan_type as string;

        // Metadata override
        const meta = user.user_metadata;
        const isMetaUnlimited = meta?.plan === 'Ilimitado' || meta?.plan === 'Rota Fácil Ilimitado' || meta?.tier === 'unlimited';

        if (isMetaUnlimited) {
          setIsTrialUser(false);
          setLoading(false);
          return;
        }

        if (subscription.status === 'trial' || planType === 'gratis' || planType === 'free') {
          setIsTrialUser(true);
          const createdAt = new Date(subscription.created_at);
          const trialDays = planData?.limitations?.trial_days || 7;
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

  /* Exibição contínua conforme solicitado */


  const isUrgent = timeLeft.days <= 1;
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className={`w-full ${isUrgent ?
      'bg-gradient-to-r from-black-primary via-black-secondary to-gold/20' :
      'bg-gradient-to-r from-black-primary via-black-secondary to-gold/10'
      } text-gold shadow-lg relative overflow-hidden border-b border-gold/20`}>
      <style>
        {`
          @keyframes pulse-gentle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          .animate-pulse-gentle {
            animation: pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}
      </style>
      {/* Animação de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUrgent ? 'bg-gold/20' : 'bg-gold/10'
                }`}>
                <Clock className="w-4 h-4 text-gold animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">
                    {isExpired ? "PERÍODO GRATUITO EXPIRADO!" : "SEU PERÍODO GRATUITO EXPIRA EM:"}
                  </span>
                  <Badge variant="secondary" className="bg-gold text-black-primary border-none font-black">
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
                      <div className="text-xl font-bold text-gold">{timeLeft.days}</div>
                      <div className="text-xs text-muted-foreground">DIAS</div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-xl font-bold text-gold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground">HORAS</div>
                  </div>

                  <div className="text-lg font-bold text-gold/50">:</div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-gold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground">MIN</div>
                  </div>

                  <div className="text-lg font-bold text-gold/50">:</div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-gold animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground">SEG</div>
                  </div>
                </div>

                {/* Texto motivacional */}
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {isUrgent ?
                      "⚠️ ÚLTIMO DIA! Não perca o acesso!" :
                      "🚀 Aproveite ATÉ 2 MESES GRÁTIS no plano anual!"
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
              className="font-black px-8 py-2 rounded-lg transition-all duration-300 hover:scale-105 bg-gold text-black-primary hover:bg-gold/90 shadow-gold border-none uppercase tracking-tighter"
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
                className={`h-1.5 rounded-full transition-all duration-300 ${isUrgent ? 'bg-red-300' : 'bg-yellow-300'
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