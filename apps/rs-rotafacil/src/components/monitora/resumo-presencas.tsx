import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
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
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Resumo Geral - {formatDate(dataSelected)}
          </CardTitle>
          <CardDescription>
            Visão geral da presença dos alunos e status do checklist do motorista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total de Alunos</span>
              </div>
              <div className="text-2xl font-bold">{resumo.total_alunos}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Presentes</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {resumo.total_presentes}
              </div>
              <div className="text-xs text-muted-foreground">
                {getPercentualPresenca()}% do total
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Ausentes</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {resumo.total_ausentes}
              </div>
              <div className="text-xs text-muted-foreground">
                {getPercentualAusencia()}% do total
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Checklist Motorista</span>
              </div>
              {resumo.checklist_motorista_feito ? (
                <div>
                  <Badge variant="default" className="bg-green-500">
                    ✅ Feito
                  </Badge>
                  {resumo.horario_checklist && (
                    <div className="text-xs text-muted-foreground mt-1">
                      às {formatTime(resumo.horario_checklist)}
                    </div>
                  )}
                </div>
              ) : (
                <Badge variant="destructive">
                  ❌ Pendente
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Colégio e Turno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Resumo por Colégio
          </CardTitle>
          <CardDescription>
            Detalhamento da presença por colégio e turno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumo.por_colegio_turno.map((grupo) => (
              <div
                key={grupo.nome_completo}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{grupo.nome_completo}</h4>
                  <p className="text-sm text-muted-foreground">
                    {grupo.total_alunos} alunos transportados
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">
                      {grupo.presentes}
                    </div>
                    <div className="text-xs text-muted-foreground">Presentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600">
                      {grupo.ausentes}
                    </div>
                    <div className="text-xs text-muted-foreground">Ausentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {grupo.total_alunos - grupo.presentes - grupo.ausentes}
                    </div>
                    <div className="text-xs text-muted-foreground">Não marcados</div>
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