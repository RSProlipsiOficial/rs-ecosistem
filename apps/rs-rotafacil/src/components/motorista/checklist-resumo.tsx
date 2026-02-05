import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

interface ChecklistResumoProps {
  resumo: {
    realizadoHoje: boolean;
    statusHoje: string | null;
    foraHorario: boolean;
    totalRealizados: number;
    totalNaoRealizados: number;
    sequenciaConsecutiva: number;
  };
}

export function ChecklistResumo({ resumo }: ChecklistResumoProps) {
  const {
    realizadoHoje,
    statusHoje,
    foraHorario,
    totalRealizados,
    totalNaoRealizados,
    sequenciaConsecutiva
  } = resumo;

  const hoje = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-black text-gold uppercase tracking-tight">Vistorias</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status de Hoje */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Checklist de Hoje</CardTitle>
            <Calendar className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <p className="text-sm font-bold text-zinc-400">{hoje}</p>
              {realizadoHoje ? (
                <div className="flex flex-wrap gap-2">
                  {statusHoje === 'revisado' ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 rounded-lg gap-2">
                      <CheckCircle className="h-3 w-3" />
                      REALIZADO
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 rounded-lg gap-2">
                      <XCircle className="h-3 w-3" />
                      INCOMPLETO
                    </Badge>
                  )}
                  {foraHorario && (
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 rounded-lg gap-2">
                      <Clock className="h-3 w-3" />
                      FORA DO HORÁRIO
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/5 px-3 py-1 rounded-lg gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    NÃO REALIZADO
                  </Badge>
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-tighter">
                    ⚠️ Realize antes das 07:00
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Realizados */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Realizados</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-white mb-1">{totalRealizados}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Checklists completos
            </p>
          </CardContent>
        </Card>

        {/* Total Não Realizados */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Pendentes</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-xl">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-white mb-1">{totalNaoRealizados}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Faltantes ou incompletos
            </p>
          </CardContent>
        </Card>

        {/* Sequência Consecutiva */}
        <Card className="bg-black-secondary border-sidebar-border hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Sequência</CardTitle>
            <div className="p-2 bg-gold/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-gold mb-1">{sequenciaConsecutiva}</div>
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {sequenciaConsecutiva === 1 ? 'dia consecutivo' : 'dias consecutivos'}
              </p>
              {sequenciaConsecutiva >= 7 && (
                <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] w-fit font-black px-2 mt-1">
                  🔥 SEMANAL!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}