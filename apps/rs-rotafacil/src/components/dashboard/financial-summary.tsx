import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialData {
  currentMonth: {
    earnings: number;
    expenses: number;
    profit: number;
  };
  previousMonth: {
    earnings: number;
    expenses: number;
    profit: number;
  };
}

import { useFinanceiro } from "@/hooks/useFinanceiro";

export function FinancialSummary() {
  const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
  const { resumo: realResumo, loading } = useFinanceiro();

  const mockResumo = {
    totalGanhos: 15780.00,
    totalGastosEmpresa: 4250.50,
    lucroOperacional: 11529.50
  };

  const resumo = isDemoMode ? mockResumo : realResumo;

  const calculateChange = (current: number, previous: number) => {
    if (isDemoMode) return 12.5; // Valor estético para demo
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentMonth = {
    earnings: resumo.totalGanhos,
    expenses: resumo.totalGastos,
    profit: resumo.saldoFinal,
  };

  // Note: previousMonth logic can be added later if needed, currently using 0
  const previousMonth = {
    earnings: 0,
    expenses: 0,
    profit: 0,
  };

  const earningsChange = calculateChange(currentMonth.earnings, previousMonth.earnings);
  const expensesChange = calculateChange(currentMonth.expenses, previousMonth.expenses);
  const profitChange = calculateChange(currentMonth.profit, previousMonth.profit);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold animate-glow">
          <DollarSign className="w-7 h-7 text-black-primary" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Resumo <span className="text-gold">Financeiro</span></h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">Visão geral dos seus rendimentos</p>
        </div>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant hover:border-gold/40 hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-500 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentMonth.earnings)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {earningsChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-gold" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm ${earningsChange >= 0 ? 'text-gold' : 'text-destructive'}`}>
                {earningsChange > 0 ? '+' : ''}{earningsChange.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black-secondary border border-sidebar-border shadow-card hover:border-gold/30 hover:shadow-gold/5 transition-all duration-500 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentMonth.expenses)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {expensesChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-gold" />
              )}
              <span className={`text-sm ${expensesChange >= 0 ? 'text-destructive' : 'text-gold'}`}>
                {expensesChange > 0 ? '+' : ''}{expensesChange.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black-secondary border border-sidebar-border shadow-card hover:border-gold/30 hover:shadow-gold/5 transition-all duration-500 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">
              {formatCurrency(currentMonth.profit)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {profitChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-gold" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm ${profitChange >= 0 ? 'text-gold' : 'text-destructive'}`}>
                {profitChange > 0 ? '+' : ''}{profitChange.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant overflow-hidden">
        <CardHeader className="border-b border-sidebar-border/50">
          <CardTitle className="text-foreground">Comparativo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Gráfico de barras será implementado aqui</p>
              <p className="text-sm text-muted-foreground mt-1">Comparativo: Mês Atual vs Anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}