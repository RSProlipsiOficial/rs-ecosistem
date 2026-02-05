import { AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface PlanLimitBlockerProps {
    limitType: 'van' | 'student' | 'expense';
    currentCount: number;
    maxCount: number;
    planName: string;
}

export function PlanLimitBlocker({ limitType, currentCount, maxCount, planName }: PlanLimitBlockerProps) {
    const navigate = useNavigate();

    const messages = {
        van: {
            title: '🚐 Limite de Vans Atingido',
            description: `Você atingiu o limite de ${maxCount} van(s) do plano ${planName}.`,
            action: 'Para adicionar mais vans, faça upgrade do seu plano.'
        },
        student: {
            title: '👨‍🎓 Limite de Alunos Atingido',
            description: `Você atingiu o limite de ${maxCount} aluno(s) do plano ${planName}.`,
            action: 'Para cadastrar mais alunos, faça upgrade do seu plano.'
        },
        expense: {
            title: '💰 Limite de Gastos Atingido',
            description: `Você atingiu o limite de ${maxCount} lançamento(s) de gastos este mês no plano ${planName}.`,
            action: 'Para lançar mais gastos, faça upgrade do seu plano.'
        }
    };

    const message = messages[limitType];

    return (
        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">
                                {message.title}
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                {message.description}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {message.action}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/upgrade')}
                                className="bg-gold text-black hover:bg-gold/90 font-semibold"
                            >
                                <Crown className="h-4 w-4 mr-2" />
                                Ver Planos e Fazer Upgrade
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="border-red-500 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
