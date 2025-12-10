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

export function FinancialSummary() {
  // Empty data state - will be populated with real data
  const currentMonth = {
    earnings: 0,
    expenses: 0,
    profit: 0,
  };
  const previousMonth = {
    earnings: 0,
    expenses: 0,
    profit: 0,
  };
  
  const earningsChange = ((currentMonth.earnings - previousMonth.earnings) / previousMonth.earnings) * 100;
  const expensesChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
  const profitChange = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-black-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Resumo Financeiro</h2>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-card hover:shadow-gold transition-all duration-300">
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

        <Card className="bg-card border-border shadow-card hover:shadow-gold transition-all duration-300">
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

        <Card className="bg-card border-border shadow-card hover:shadow-gold transition-all duration-300">
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
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
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