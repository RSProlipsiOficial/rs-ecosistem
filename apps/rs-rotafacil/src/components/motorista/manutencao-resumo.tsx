import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResumoManutencao {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  urgentes: number;
}

interface ManutencaoResumoProps {
  resumo: ResumoManutencao;
}

export function ManutencaoResumo({ resumo }: ManutencaoResumoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-black text-gold uppercase tracking-tight">Manutenção</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Manutenções */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Total</CardTitle>
            <div className="p-2 bg-zinc-800 rounded-xl">
              <Wrench className="h-5 w-5 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-white mb-1">{resumo.total}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Reportados
            </p>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Aguardando</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-orange-500 mb-1">{resumo.pendentes}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Em fila
            </p>
          </CardContent>
        </Card>

        {/* Em Andamento */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Ativos</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Wrench className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-blue-500 mb-1">{resumo.emAndamento}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Sendo reparados
            </p>
          </CardContent>
        </Card>

        {/* Concluídas */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Resolvidos</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-green-500 mb-1">{resumo.concluidas}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Total solucionado
            </p>
          </CardContent>
        </Card>

        {/* Alerta de Urgentes */}
        {resumo.urgentes > 0 && (
          <Card className="sm:col-span-2 lg:col-span-4 bg-red-500/5 border-red-500/20 rounded-[28px] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black flex items-center gap-2 text-red-500 uppercase tracking-tighter">
                <AlertTriangle className="h-6 w-6" />
                Atenção: Problemas Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Badge variant="destructive" className="bg-red-500 text-white font-black px-4 py-1.5 rounded-xl shadow-lg shadow-red-500/20">
                  {resumo.urgentes} ALERTA{resumo.urgentes > 1 ? 'S' : ''} ATIVO{resumo.urgentes > 1 ? 'S' : ''}
                </Badge>
                <span className="text-sm font-bold text-red-300/80 leading-snug">
                  Existem itens que podem comprometer a segurança da operação. Verifique imediatamente.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}