import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResumoGeralPresenca } from '@/types/presenca';

interface ResumoPresencasProps {
  resumo: ResumoGeralPresenca;
  dataSelected: string;
  loading: boolean;
}

export function ResumoPresencas({ resumo, dataSelected, loading }: ResumoPresencasProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPercentualPresenca = () => {
    if (resumo.total_alunos === 0) return 0;
    return Math.round((resumo.total_presentes / resumo.total_alunos) * 100);
  };

  const getPercentualAusencia = () => {
    if (resumo.total_alunos === 0) return 0;
    return Math.round((resumo.total_ausentes / resumo.total_alunos) * 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
            <BarChart3 className="h-4 w-4 text-gold" />
            Controles de Resumo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 bg-black/40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-12 space-y-2">
              <Label htmlFor="data-resumo" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Data de Referência</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                <Input
                  id="data-resumo"
                  type="date"
                  value={dataSelected}
                  readOnly
                  className="h-10 bg-black-secondary border-gold/20 text-gold text-xs focus:border-gold/50 transition-all pl-9 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card className="bg-black/20 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gold italic uppercase">
            <BarChart3 className="h-5 w-5 text-gold" />
            Resumo Geral - {formatDate(dataSelected)}
          </CardTitle>
          <CardDescription>
            Visão geral da presença dos alunos e status do checklist do motorista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-gold/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</span>
              </div>
              <div className="text-xl font-black text-white italic">{resumo.total_alunos}</div>
            </div>

            <div className="space-y-1 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500/60">PRES.</span>
              </div>
              <div className="text-xl font-black text-green-500 italic">
                {resumo.total_presentes}
              </div>
              <div className="text-[9px] text-green-500/40 font-bold">
                {getPercentualPresenca()}%
              </div>
            </div>

            <div className="space-y-1 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              <div className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">AUS.</span>
              </div>
              <div className="text-xl font-black text-red-500 italic">
                {resumo.total_ausentes}
              </div>
              <div className="text-[9px] text-red-500/40 font-bold">
                {getPercentualAusencia()}%
              </div>
            </div>

            <div className="space-y-1 bg-gold/5 p-3 rounded-lg border border-gold/10">
              <div className="flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gold/60">Check</span>
              </div>
              {resumo.checklist_motorista_feito ? (
                <div>
                  <Badge variant="default" className="bg-green-500 text-[9px] h-4 px-1 font-black">
                    OK
                  </Badge>
                  {resumo.horario_checklist && (
                    <div className="text-[9px] text-gold/40 mt-0.5">
                      {formatTime(resumo.horario_checklist)}
                    </div>
                  )}
                </div>
              ) : (
                <Badge variant="destructive" className="text-[9px] h-4 px-1 font-black">
                  PEND
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Colégio e Turno */}
      <Card className="bg-black/20 border-white/5 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
            <Users className="h-4 w-4 text-gold" />
            Resumo por Colégio
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Detalhamento da presença por colégio e turno
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {resumo.por_colegio_turno.map((grupo) => (
              <div
                key={grupo.nome_completo}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-white/5 transition-colors gap-4"
              >
                <div className="max-w-full overflow-hidden">
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm truncate">{grupo.nome_completo}</h4>
                  <p className="text-[10px] text-gold/60 font-medium uppercase tracking-widest leading-none mt-1">
                    {grupo.total_alunos} alunos
                  </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                  <div className="text-center">
                    <div className="text-xs font-black text-green-500 uppercase">
                      {grupo.presentes}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">PRESENTES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-red-500 uppercase">
                      {grupo.ausentes}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">AUSENTES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-white/40 uppercase">
                      {grupo.total_alunos - grupo.presentes - grupo.ausentes}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">FALTAM</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}