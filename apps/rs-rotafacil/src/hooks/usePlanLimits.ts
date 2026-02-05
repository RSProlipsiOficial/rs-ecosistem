import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlanLimits {
    max_vans: number | null;
    max_alunos: number | null;
    max_expenses: number | null;
    canAddVan: boolean;
    canAddStudent: boolean;
    canAddExpense: boolean;
    nearVanLimit: boolean;
    nearStudentLimit: boolean;
    nearExpenseLimit: boolean;
    currentPlan: string;
    planName: string;
    isUnlimited: boolean;
    currentUsage: {
        vans: number;
        students: number;
        expenses: number;
    };
}

export function usePlanLimits() {
    const [limits, setLimits] = useState<PlanLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const checkLimits = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Get current subscription with plan details
            const { data: subscription, error: subError } = await supabase
                .from('user_subscriptions')
                .select(`
          *,
          plan:subscription_plans(*)
        `)
                .eq('user_id', user.id)
                .in('status', ['active', 'trial'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (subError) {
                console.error('Error fetching subscription:', subError);
            }

            // Default to free plan if no active subscription
            let planLimits: any = {
                max_vans: 1,
                max_alunos: 15,
                max_expenses: 10
            };
            let planType = 'free';
            let planName = 'Grátis';

            if (subscription?.plan) {
                planLimits = subscription.plan.limitations || planLimits;
                planType = subscription.plan.plan_type || 'free';
                planName = subscription.plan.name || 'Grátis';
            }

            // Count current usage
            const { count: vanCount } = await supabase
                .from('vans')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: studentCount } = await supabase
                .from('alunos')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('ativo', true);

            // Count expenses for current month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const { count: expenseCount } = await supabase
                .from('gastos')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', firstDayOfMonth.toISOString());

            const currentVans = vanCount || 0;
            const currentStudents = studentCount || 0;
            const currentExpenses = expenseCount || 0;

            const maxVans = planLimits.max_vans;
            const maxStudents = planLimits.max_alunos;
            const maxExpenses = planLimits.max_expenses;


            // Trial expiration check
            let isTrialExpired = false;
            let daysRemaining = null;

            // Check if user is in trial period
            const isTrial = subscription?.status === 'trial' || planType === 'gratis';

            if (isTrial) {
                const createdAt = new Date(subscription?.created_at || user.created_at);
                const trialDays = planLimits.trial_days || 7;
                const endDate = new Date(createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
                const now = new Date();
                isTrialExpired = now > endDate;
                daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            }

            const isUnlimited = planType === 'unlimited' || planType === 'custom' || planType === 'ilimitado' || planType === 'enterprise' ||
                user.user_metadata?.plan === 'Ilimitado' || user.user_metadata?.plan === 'Rota Fácil Ilimitado' ||
                user.user_metadata?.tier === 'unlimited' || user.user_metadata?.tier === 'ilimitado';
            // Removido (isTrial && !isTrialExpired) - Trial deve ter limites conforme o Kit 0 ou plano ativo.


            setLimits({
                max_vans: maxVans,
                max_alunos: maxStudents,
                max_expenses: maxExpenses,
                canAddVan: !isTrialExpired && (isUnlimited || maxVans === null || currentVans < maxVans),
                canAddStudent: !isTrialExpired && (isUnlimited || maxStudents === null || currentStudents < maxStudents),
                canAddExpense: !isTrialExpired && (isUnlimited || maxExpenses === null || currentExpenses < maxExpenses),
                nearVanLimit: !isTrialExpired && !isUnlimited && maxVans !== null && currentVans >= maxVans * 0.8,
                nearStudentLimit: !isTrialExpired && !isUnlimited && maxStudents !== null && currentStudents >= maxStudents * 0.8,
                nearExpenseLimit: !isTrialExpired && !isUnlimited && maxExpenses !== null && currentExpenses >= maxExpenses * 0.8,
                currentPlan: planType,
                planName: planName,
                isUnlimited: isUnlimited,
                currentUsage: {
                    vans: currentVans,
                    students: currentStudents,
                    expenses: currentExpenses
                }
            });

        } catch (error) {
            console.error('Error checking plan limits:', error);
            toast({
                variant: "destructive",
                title: "Erro ao verificar limites",
                description: "Não foi possível carregar os limites do seu plano.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLimits();

        // Refresh limits every 5 minutes
        const interval = setInterval(checkLimits, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { limits, loading, refetch: checkLimits };
}
