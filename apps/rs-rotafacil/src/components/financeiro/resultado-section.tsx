import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumoFinanceiro } from "@/types/financeiro";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface ResultadoSectionProps {
    resumo: ResumoFinanceiro;
}

export function ResultadoSection({ resumo }: ResultadoSectionProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden border-t-4 border-t-gold/40">
            <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
                <CardTitle className="text-foreground flex items-center gap-2 text-base font-black italic">
                    <TrendingUp className="w-5 h-5 text-gold" />
                    ANÁLISE DE RESULTADO
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Lucro Operacional</p>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-black text-foreground tracking-tighter">
                                {formatCurrency(resumo.lucroOperacional)}
                            </p>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Ativo</Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold italic">Saldo antes das retiradas</p>
                    </div>

                    <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Pró-labore / Retiradas</p>
                        <p className="text-xl font-black text-gold tracking-tighter">
                            - {formatCurrency(resumo.totalRetiradaDono)}
                        </p>
                        <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-gold"
                                style={{ width: `${Math.min((resumo.totalRetiradaDono / (resumo.lucroOperacional || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <div className={`p-5 rounded-2xl border-2 ${resumo.lucroLiquido >= 0 ? 'bg-gold/5 border-gold/20' : 'bg-red-500/5 border-red-500/20 shadow-none'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${resumo.lucroLiquido >= 0 ? 'bg-gold text-black' : 'bg-red-500 text-white'}`}>
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <p className="text-[11px] uppercase font-black text-foreground tracking-widest">Lucro Líquido Real</p>
                            </div>
                            <p className={`text-3xl font-black tracking-tighter ${resumo.lucroLiquido >= 0 ? 'text-gold' : 'text-red-500'}`}>
                                {formatCurrency(resumo.lucroLiquido)}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold leading-tight opacity-70">
                                Este é o valor que sobra no caixa após todas as despesas e retiradas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/10 rounded-xl border border-border/30">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Margem</p>
                        <p className="text-sm font-black text-foreground">
                            {resumo.totalGanhos > 0 ? ((resumo.lucroOperacional / resumo.totalGanhos) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div className="p-3 bg-muted/10 rounded-xl border border-border/30">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Eficiência</p>
                        <p className="text-sm font-black text-foreground">
                            {resumo.totalGanhos > 0 ? ((resumo.lucroLiquido / resumo.totalGanhos) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${className}`}>
            {children}
        </span>
    );
}
