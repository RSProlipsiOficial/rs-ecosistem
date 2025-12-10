import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { ResumoFinanceiro } from "@/types/financeiro";

interface ResumoCardProps {
  resumo: ResumoFinanceiro;
}

export function ResumoCard({ resumo }: ResumoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return 'text-green-500';
    if (saldo < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getSaldoIcon = (saldo: number) => {
    if (saldo > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (saldo < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <DollarSign className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Ganhos
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(resumo.totalGanhos)}
          </div>
          <p className="text-xs text-muted-foreground">
            Mensalidades: {formatCurrency(resumo.totalGanhosMensalidades)} |
            Extras: {formatCurrency(resumo.totalGanhosExtras)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Gastos
          </CardTitle>
          <TrendingDown className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(resumo.totalGastos)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagos: {formatCurrency(resumo.totalGastosPagos)} |
            Pendentes: {formatCurrency(resumo.totalGastosPendentes)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Final
          </CardTitle>
          {getSaldoIcon(resumo.saldoFinal)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getSaldoColor(resumo.saldoFinal)}`}>
            {formatCurrency(resumo.saldoFinal)}
          </div>
          <p className="text-xs text-muted-foreground">
            {resumo.saldoFinal > 0 ? 'Lucro' : resumo.saldoFinal < 0 ? 'Prejuízo' : 'Equilibrado'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}