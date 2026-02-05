import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LancamentoFinanceiro } from "@/types/financeiro";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Wallet, Briefcase, Zap, User, Wrench, Car, Package } from "lucide-react";

interface GastosAnalyticsProps {
    gastos: LancamentoFinanceiro[];
    totalGanhos?: number;
    totalGlobalEmpresa?: number;
    totalGlobalDono?: number;
    selectedCategory?: string | null;
    onCategorySelect?: (category: string | null) => void;
}

export function GastosAnalytics({
    gastos,
    totalGanhos,
    totalGlobalEmpresa,
    totalGlobalDono,
    selectedCategory,
    onCategorySelect
}: GastosAnalyticsProps) {
    const stats = useMemo(() => {
        let totalEmpresa = 0;
        let totalDono = 0;

        const categories: Record<string, number> = {};

        gastos.forEach(g => {
            const valor = Number(g.valor) || 0;
            const cat = (g.categoria || "").toUpperCase();
            const sub = (g.subcategoria || "").toUpperCase();

            let finalCategory = "Outros";
            const catUpper = cat.toUpperCase();
            const subUpper = sub.toUpperCase();
            const descUpper = (g.descricao || "").toUpperCase();

            if (g.alocacao === 'dono' || catUpper.includes("RETIRADA") || catUpper.includes("PRÓ-LABORE") || catUpper.includes("PRO-LABORE")) {
                totalDono += valor;

                // Mapeamento Granular Dono (Estilo Banco)
                if (catUpper.includes("INV") || descUpper.includes("INV") || subUpper.includes("INV")) {
                    finalCategory = "Investimentos (Pessoal)";
                } else if (catUpper.includes("CONTAS") || catUpper.includes("FIXO") ||
                    descUpper.includes("ALUGUEL") || descUpper.includes("LUZ") ||
                    descUpper.includes("ÁGUA") || descUpper.includes("INTERNET") ||
                    descUpper.includes("CONDOMÍNIO")) {
                    finalCategory = "Contas Fixas (Casa)";
                } else if (descUpper.includes("FATURA") || descUpper.includes("CARTÃO") ||
                    catUpper.includes("CARTÃO") || descUpper.includes("NUBANK") ||
                    descUpper.includes("INTER") || descUpper.includes("MASTERCARD") ||
                    descUpper.includes("VISA")) {
                    finalCategory = "Cartão de Crédito";
                } else if (catUpper.includes("ALIMENTAÇÃO") || descUpper.includes("COMIDA") ||
                    descUpper.includes("IFOOD") || descUpper.includes("MERCADO") ||
                    descUpper.includes("LANCHE") || descUpper.includes("ALMOÇO")) {
                    finalCategory = "Alimentação (Pessoal)";
                } else if (catUpper.includes("LAZER") || catUpper.includes("SAÍDA") ||
                    descUpper.includes("VIAGEM") || descUpper.includes("CINEMA") ||
                    descUpper.includes("BAR")) {
                    finalCategory = "Lazer";
                } else if (catUpper.includes("SAÚDE") || descUpper.includes("FARMÁCIA") ||
                    descUpper.includes("MÉDICO") || descUpper.includes("ACADEMIA")) {
                    finalCategory = "Saúde & Bem-estar";
                } else {
                    finalCategory = "Retirada Pessoal";
                }
            } else {
                totalEmpresa += valor;

                // Mapeamento Granular Empresa Refinado (Estilo Banco)
                if (catUpper.includes("SALÁRIO") || catUpper.includes("DIÁRIA") ||
                    subUpper.includes("MOTORISTA") || subUpper.includes("MONITORA") ||
                    descUpper.includes("MOTORISTA") || descUpper.includes("MONITORA") ||
                    descUpper.includes("SALÁRIO") || descUpper.includes("DIÁRIA")) {
                    finalCategory = "Colaboradores";
                } else if (catUpper.includes("MANUTENÇÃO") || subUpper.includes("PEÇAS") ||
                    descUpper.includes("OFICINA") || descUpper.includes("MECÂNICA") ||
                    descUpper.includes("PEÇAS") || descUpper.includes("VAN") ||
                    descUpper.includes("GASOLINA") || descUpper.includes("PARCELA") ||
                    catUpper.includes("PNEUS")) {
                    finalCategory = "Manutenção";
                } else if (catUpper.includes("INVESTIMENT") || descUpper.includes("APORTE") ||
                    subUpper.includes("INVESTIMENT") || descUpper.includes("INVESTIMENT")) {
                    finalCategory = "Investimentos (Empresa)";
                } else if (descUpper.includes("CHATGPT") || descUpper.includes("MERCADO PAGO") ||
                    descUpper.includes("SOFTWARES") || descUpper.includes("SYSTEM") ||
                    descUpper.includes("WIFI") || descUpper.includes("INTERNET") ||
                    descUpper.includes("TAXA") ||
                    subUpper.includes("GESTÃO") || descUpper.includes("GESTÃO")) {
                    finalCategory = "Gestão & Ferramentas";
                } else if (catUpper.includes("MÓVEL") || catUpper.includes("CADEIRA") ||
                    descUpper.includes("ESCRITÓRIO") || descUpper.includes("MÓVEIS") ||
                    descUpper.includes("MESA") || descUpper.includes("CADEIRA")) {
                    finalCategory = "Móveis & Equipamentos";
                } else if (catUpper.includes("COMBUSTÍVEL") || descUpper.includes("POSTO") ||
                    subUpper.includes("COMBUSTÍVEL")) {
                    finalCategory = "Combustível";
                } else if (catUpper.includes("ALIMENTAÇÃO") || descUpper.includes("COMIDA") ||
                    descUpper.includes("LANCHE") || descUpper.includes("ALMOÇO") ||
                    catUpper.includes("COMIDA")) {
                    finalCategory = "Alimentação (Empresa)";
                } else if (catUpper.includes("CELULAR") || catUpper.includes("TELEFONE")) {
                    finalCategory = "Celular";
                } else {
                    finalCategory = g.categoria || "Outros";
                }
            }

            categories[finalCategory] = (categories[finalCategory] || 0) + valor;
        });

        const CATEGORY_COLORS: Record<string, string> = {
            // Empresa
            "Pró-labore": "#3b82f6", // Azul
            "Combustível": "#f59e0b", // Âmbar
            "Manutenção": "#ef4444", // Vermelho
            "Colaboradores": "#8b5cf6", // Violeta
            "Investimentos (Empresa)": "#10b981", // Esmeralda
            "Alimentação (Empresa)": "#78350f", // Marrom
            "Celular": "#22c55e", // Verde
            "Gestão & Ferramentas": "#0ea5e9", // Céu
            "Móveis & Equipamentos": "#6366f1", // Indigo
            "Outros": "#94a3b8", // Slate Light

            // Dono (Pró-labore)
            "Investimentos (Pessoal)": "#10b981", // Esmeralda
            "Contas Fixas (Casa)": "#f59e0b", // Âmbar
            "Cartão de Crédito": "#ef4444", // Vermelho
            "Alimentação (Pessoal)": "#78350f", // Marrom
            "Lazer": "#ec4899", // Rosa (Pink)
            "Saúde & Bem-estar": "#8b5cf6", // Violeta
            "Retirada Pessoal": "#3b82f6"  // Azul
        };

        const chartData = Object.entries(categories)
            .filter(([_, value]) => value > 0)
            .sort((a, b) => b[1] - a[1]) // Maiores primeiro
            .map(([name, value]) => ({
                name,
                value,
                color: CATEGORY_COLORS[name] || "#" + Math.floor(Math.random() * 16777215).toString(16)
            }));

        return { totalEmpresa, totalDono, chartData };
    }, [gastos]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Coluna de Totais */}
            <div className="md:col-span-1 space-y-4">
                {totalGanhos !== undefined && (
                    <Card className="bg-card/50 border-border/40 overflow-hidden relative group border-l-4 border-l-green-500">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-10 h-10 text-green-500" />
                        </div>
                        <CardContent className="p-4">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Ganhos</p>
                            <p className="text-lg font-black text-green-500 tracking-tighter">
                                {formatCurrency(totalGanhos)}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-card/50 border-border/40 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Custos Empresa</p>
                        <p className="text-lg font-black text-foreground tracking-tighter">
                            {formatCurrency(totalGlobalEmpresa ?? stats.totalEmpresa)}
                        </p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gold transition-all duration-1000" style={{ width: '100%' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/40 overflow-hidden relative group border-l-4 border-l-red-500/30">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="w-10 h-10" />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pró-labore (Retiradas)</p>
                        <p className="text-lg font-black text-red-500 tracking-tighter">
                            {formatCurrency(totalGlobalDono ?? stats.totalDono)}
                        </p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 transition-all duration-1000"
                                style={{ width: `${((totalGlobalDono ?? stats.totalDono) / ((totalGlobalEmpresa ?? stats.totalEmpresa) + (totalGlobalDono ?? stats.totalDono) || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Pizza */}
            <Card className="md:col-span-3 bg-card/40 border-border/40">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                    dataKey="value"
                                    onClick={(data) => {
                                        if (data && data.name) {
                                            onCategorySelect?.(selectedCategory === data.name ? null : data.name);
                                        }
                                    }}
                                >
                                    {stats.chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{
                                                filter: selectedCategory && selectedCategory !== entry.name ? 'grayscale(0.8) opacity(0.3)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            className="hover:opacity-80 transition-all cursor-pointer outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Distribuição de Saídas</p>
                            <p className="text-[9px] font-black text-gold uppercase tracking-widest italic">{stats.chartData.length} CATEGORIAS</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                            {stats.chartData.map((item, index) => (
                                <div
                                    key={item.name}
                                    onClick={() => onCategorySelect?.(selectedCategory === item.name ? null : item.name)}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group ${selectedCategory === item.name ? 'bg-gold/10 border-gold/40 shadow-sm' : 'bg-muted/10 border-border/20 hover:bg-muted/20'}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                                        <span className={`text-[10px] font-bold truncate transition-colors ${selectedCategory === item.name ? 'text-gold' : 'text-foreground group-hover:text-gold'}`}>{item.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-black transition-colors ${selectedCategory === item.name ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'}`}>{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                        {selectedCategory && (
                            <div className="pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCategorySelect?.(null)}
                                    className="w-full h-7 text-[9px] font-black uppercase text-gold hover:text-gold/80 hover:bg-gold/5"
                                >
                                    LIMPAR FILTRO
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
