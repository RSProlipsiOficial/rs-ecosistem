import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <Card className="bg-card border-border shadow-xl rounded-2xl border-l-4 border-l-gold overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Entradas Totais</CardTitle>
          <div className="bg-gold/10 p-2 rounded-lg border border-gold/20">
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-foreground tracking-tighter">
            {formatCurrency(resumo.totalGanhos)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-[8px] font-bold text-muted-foreground uppercase bg-muted/50 px-1.5 rounded border border-border/50">
              {resumo.totalGanhosMensalidades > 0 ? Math.round((resumo.totalGanhosMensalidades / resumo.totalGanhos) * 100) : 0}% Alunos
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xl rounded-2xl border-l-4 border-l-red-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Saídas Totais</CardTitle>
          <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-foreground tracking-tighter">
            {formatCurrency(resumo.totalGastos)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-[8px] font-bold text-muted-foreground uppercase bg-muted/50 px-1.5 rounded border border-border/50">
              Pagas: {formatCurrency(resumo.totalGastosPagos)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xl rounded-2xl border-l-4 border-l-blue-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Pagamentos Alunos</CardTitle>
          <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
            <PieChart className="w-4 h-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-foreground tracking-tighter">
            {formatCurrency(resumo.totalGanhosMensalidades)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Pendentes:</span>
            <span className="text-[8px] font-black text-yellow-500">{formatCurrency(resumo.totalMensalidadesPendentes)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xl rounded-2xl border-l-4 border-l-green-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Saldo Disponível</CardTitle>
          <div className={`p-2 rounded-lg border ${resumo.saldoFinal >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <Wallet className={`w-4 h-4 ${resumo.saldoFinal >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-black tracking-tighter ${resumo.saldoFinal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(resumo.saldoFinal)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`text-[8px] font-bold uppercase px-1.5 rounded border ${resumo.saldoFinal >= 0 ? 'bg-green-500/5 text-green-500/70 border-green-500/20' : 'bg-red-500/5 text-red-500/70 border-red-500/20'}`}>
              Fluxo de Caixa Positivo
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}