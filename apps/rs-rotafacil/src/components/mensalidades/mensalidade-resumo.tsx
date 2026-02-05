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
      <Card className="bg-black/20 border-white/5 shadow-elegant overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/[0.02]">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gold/60">
            Total de Alunos
          </CardTitle>
          <Users className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-white italic">{resumo.totalAlunos}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/5 shadow-elegant overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-500/[0.02]">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-green-500/60">
            Pagamentos Recebidos
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-green-500 italic">{resumo.totalPagos}</div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
            {resumo.totalAlunos > 0 ? Math.round((resumo.totalPagos / resumo.totalAlunos) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/5 shadow-elegant overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-red-500/[0.02]">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-500/60">
            Pagamentos Pendentes
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-red-500 italic">{resumo.totalPendentes}</div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
            {resumo.totalAlunos > 0 ? Math.round((resumo.totalPendentes / resumo.totalAlunos) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10 shadow-gold-sm overflow-hidden border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gold/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gold">
            Resumo Financeiro
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Recebido</span>
            <span className="text-xl font-black text-green-500 italic">
              {formatCurrency(resumo.valorRecebido)}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">A Receber</span>
            <span className="text-sm font-black text-red-500 italic">
              {formatCurrency(resumo.valorPendente)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}