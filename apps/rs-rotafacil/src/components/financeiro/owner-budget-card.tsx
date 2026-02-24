import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Target, TrendingUp, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { ResumoFinanceiro } from "@/types/financeiro";

interface OwnerBudgetCardProps {
    resumo: ResumoFinanceiro;
    onUpdateMeta: (novaMeta: number) => void;
}

export function OwnerBudgetCard({ resumo, onUpdateMeta }: OwnerBudgetCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempMeta, setTempMeta] = useState(resumo.metaProLabore.toString());

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const percentualRetirado = Math.min((resumo.totalRetiradaDono / (resumo.metaProLabore || 1)) * 100, 100);
    const saldoMeta = resumo.metaProLabore - resumo.totalRetiradaDono;
    const reservaEmpresa = resumo.lucroOperacional - resumo.totalRetiradaDono;

    const handleSave = () => {
        const val = parseFloat(tempMeta.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(val)) {
            onUpdateMeta(val);
            setIsEditing(false);
        }
    };

    return (
        <Card className="bg-card border-gold/20 shadow-2xl rounded-2xl overflow-hidden border-t-4 border-t-gold">
            <CardContent className="p-0">
                <div className="bg-gold/5 p-6 border-b border-gold/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/20">
                                <Target className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gold uppercase tracking-widest">Planejamento Pessoal</p>
                                <h3 className="text-sm font-black text-foreground italic">META DE PRÓ-LABORE</h3>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                <Input
                                    value={tempMeta}
                                    onChange={(e) => setTempMeta(e.target.value)}
                                    className="h-8 w-24 text-xs bg-background border-gold/30 text-gold font-bold"
                                    autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={handleSave}>
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px] font-black text-gold hover:bg-gold/10 gap-1.5"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="w-3 h-3" />
                                ALTERAR META
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Meta Definida</p>
                            <p className="text-xl font-black text-foreground">{formatCurrency(resumo.metaProLabore)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Já Retirado</p>
                            <p className="text-xl font-black text-gold">{formatCurrency(resumo.totalRetiradaDono)}</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-muted-foreground">Saúde do Orçamento</span>
                            <span className={percentualRetirado > 90 ? "text-red-500" : "text-gold"}>{percentualRetirado.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentualRetirado} className="h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                            <div
                                className={`h-full transition-all ${percentualRetirado > 90 ? 'bg-red-500' : 'bg-gold shadow-[0_0_10px_rgba(218,165,32,0.3)]'}`}
                                style={{ width: `${percentualRetirado}%` }}
                            />
                        </Progress>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-black uppercase">Saldo p/ Retirar</p>
                                <p className={`text-lg font-black ${saldoMeta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(saldoMeta)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gold/5 border border-gold/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                <PiggyBank className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gold font-black uppercase tracking-tighter">Reserva Líquida p/ Empresa</p>
                                <p className="text-lg font-black text-foreground">
                                    {formatCurrency(reservaEmpresa)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
