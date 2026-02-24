import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LancamentoFinanceiro, ResumoFinanceiro } from "@/types/financeiro";
import { Bus, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface RelatorioVansSectionProps {
    lancamentos: LancamentoFinanceiro[];
    resumo: ResumoFinanceiro;
}

export function RelatorioVansSection({ lancamentos, resumo }: RelatorioVansSectionProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const relatorioPorVan = useMemo(() => {
        const relatorio: {
            [van: string]: {
                receitaPrevista: number,
                receitaRealizada: number,
                despesas: number,
                inadimplencia: number,
                lucro: number,
                alunosCount: number
            }
        } = {};

        lancamentos.forEach(l => {
            const vanNome = l.aluno?.vans?.nome || l.van_id || 'Sem Van';
            if (!relatorio[vanNome]) {
                relatorio[vanNome] = {
                    receitaPrevista: 0,
                    receitaRealizada: 0,
                    despesas: 0,
                    inadimplencia: 0,
                    lucro: 0,
                    alunosCount: 0
                };
            }

            const valor = Number(l.valor) || 0;
            if (l.tipo === 'receita') {
                relatorio[vanNome].receitaPrevista += valor;
                if (l.pagamento_status === 'pago') {
                    relatorio[vanNome].receitaRealizada += valor;
                } else {
                    relatorio[vanNome].inadimplencia += valor;
                }
                if (l.origem === 'mensalidade' && l.aluno_id) {
                    // Not accurate for counts but we just need a rough idea or we can track IDs
                }
            } else {
                relatorio[vanNome].despesas += valor;
            }
        });

        Object.keys(relatorio).forEach(van => {
            relatorio[van].lucro = relatorio[van].receitaRealizada - relatorio[van].despesas;
        });

        return relatorio;
    }, [lancamentos]);

    return (
        <div className="space-y-6">
            {/* Resumo da Frota */}
            <div className="bg-card/40 border border-border/40 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-32 h-32 text-gold" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black text-foreground italic flex items-center gap-3 mb-1">
                            <TrendingUp className="w-6 h-6 text-gold" />
                            DESEMPENHO GLOBAL DA FROTA
                        </h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Análise consolidada de rentabilidade por unidade</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right border-r border-border/50 pr-4">
                            <p className="text-[9px] font-black text-muted-foreground uppercase">Lucro Operacional</p>
                            <p className="text-xl font-black text-gold tracking-tighter">{formatCurrency(resumo.lucroOperacional)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-muted-foreground uppercase">Eficiência Média</p>
                            <p className="text-xl font-black text-green-500 tracking-tighter">
                                {resumo.totalGanhos > 0 ? Math.round((resumo.lucroOperacional / resumo.totalGanhos) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(relatorioPorVan).map(([van, dados]) => (
                    <Card key={van} className="bg-card border-border shadow-xl rounded-2xl overflow-hidden border-b-4 border-b-gold/30 hover:shadow-gold/5 transition-all group">
                        <CardHeader className="pb-4 bg-muted/20 border-b border-border/50 group-hover:bg-gold/[0.03] transition-colors">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform">
                                        <Bus className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{van}</h4>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Unidade de Negócio</p>
                                    </div>
                                </div>
                                <Badge className={dados.receitaPrevista > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground"}>
                                    {dados.receitaPrevista > 0 ? 'OPERACIONAL' : 'INATIVO'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/10 p-3 rounded-xl border border-border/30 group-hover:border-gold/20 transition-colors">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 tracking-tighter">Previsão Bruta</p>
                                    <p className="text-sm font-black text-foreground">{formatCurrency(dados.receitaPrevista)}</p>
                                </div>
                                <div className="bg-muted/10 p-3 rounded-xl border border-border/30 group-hover:border-gold/20 transition-colors">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 tracking-tighter">Liquidez Real</p>
                                    <p className="text-sm font-black text-green-500">{formatCurrency(dados.receitaRealizada)}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 shadow-sm shadow-red-500/5">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Inadimplência</span>
                                    </div>
                                    <span className="text-xs font-black text-red-500">{formatCurrency(dados.inadimplencia)}</span>
                                </div>

                                <div className="flex justify-between items-center bg-gold/5 p-2.5 rounded-xl border border-gold/10 shadow-inner">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gold/20 rounded flex items-center justify-center">
                                            <TrendingUp className="w-3 h-3 text-gold" />
                                        </div>
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">Resultado Líquido</span>
                                    </div>
                                    <span className={`text-sm font-black ${dados.lucro >= 0 ? 'text-gold' : 'text-red-500'}`}>
                                        {formatCurrency(dados.lucro)}
                                    </span>
                                </div>
                            </div>

                            {dados.receitaPrevista > 0 && (
                                <div className="pt-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 px-0.5">
                                        <span className="text-muted-foreground tracking-widest">Saúde Financeira</span>
                                        <span className="text-gold tracking-tighter">{Math.round((dados.receitaRealizada / dados.receitaPrevista) * 100)}% Coleta</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20 p-[1px]">
                                        <div
                                            className="h-full bg-gold rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,184,0,0.4)]"
                                            style={{ width: `${(dados.receitaRealizada / dados.receitaPrevista) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(relatorioPorVan).length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-border/30">
                        <Bus className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground font-black uppercase tracking-widest italic opacity-40">Nenhuma Van com dados financeiros registrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
