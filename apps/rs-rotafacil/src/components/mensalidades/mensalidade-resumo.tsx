import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { MensalidadeResumo } from "@/types/mensalidades";

interface MensalidadeResumoProps {
  resumo: MensalidadeResumo;
}

export function MensalidadeResumoCard({ resumo }: MensalidadeResumoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Alunos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{resumo.totalAlunos}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pagamentos Recebidos
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{resumo.totalPagos}</div>
          <p className="text-xs text-muted-foreground">
            {resumo.totalAlunos > 0 ? Math.round((resumo.totalPagos / resumo.totalAlunos) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pagamentos Pendentes
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{resumo.totalPendentes}</div>
          <p className="text-xs text-muted-foreground">
            {resumo.totalAlunos > 0 ? Math.round((resumo.totalPendentes / resumo.totalAlunos) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-500">
            {formatCurrency(resumo.valorRecebido)}
          </div>
          <div className="text-sm text-red-500">
            Pendente: {formatCurrency(resumo.valorPendente)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}