import { AlertCircle, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PlanLimitWarningProps {
    type: 'van' | 'student' | 'expense';
    current: number;
    max: number;
    planName: string;
    className?: string;
}

export function PlanLimitWarning({ type, current, max, planName, className }: PlanLimitWarningProps) {
    const navigate = useNavigate();
    const currentVal = Number(current) || 0;
    const maxVal = Number(max) || 1; // Avoid division by zero
    const percentage = (currentVal / maxVal) * 100;

    // Only show warning if above 80%
    if (percentage < 80) return null;

    const labels = {
        van: { singular: 'van', plural: 'vans', icon: '🚐' },
        student: { singular: 'aluno', plural: 'alunos', icon: '👨‍🎓' },
        expense: { singular: 'gasto', plural: 'gastos', icon: '💰' }
    };

    const label = labels[type];
    const isNearLimit = percentage >= 90;

    return (
        <div className={cn(`rounded-lg p-4 mb-4 border ${isNearLimit
            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500'
            : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
            }`, className)}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full flex-shrink-0 ${isNearLimit
                    ? 'bg-orange-500/10'
                    : 'bg-yellow-500/10'
                    }`}>
                    <AlertCircle className={`h-5 w-5 ${isNearLimit ? 'text-orange-600' : 'text-yellow-600'
                        }`} />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${isNearLimit
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-yellow-900 dark:text-yellow-100'
                            }`}>
                            {label.icon} {isNearLimit ? 'Atenção!' : 'Aviso:'} Você está próximo do limite
                        </p>
                        <span className={`text-xs font-bold ${isNearLimit ? 'text-orange-700' : 'text-yellow-700'
                            }`}>
                            {percentage.toFixed(0)}%
                        </span>
                    </div>

                    <Progress value={percentage} className="h-2" />

                    <p className={`text-xs ${isNearLimit
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                        {current} de {max} {current === 1 ? label.singular : label.plural} utilizados no plano <span className="font-semibold">{planName}</span>
                    </p>

                    <div className="flex gap-2 pt-1">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/upgrade')}
                            className={`text-xs ${isNearLimit
                                ? 'border-orange-500 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                                : 'border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'
                                }`}
                        >
                            <Crown className="h-3 w-3 mr-1" />
                            Ver Planos
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate('/upgrade')}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Fazer Upgrade
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
