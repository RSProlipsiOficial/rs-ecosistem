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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status de Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Checklist de Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{hoje}</p>
            {realizadoHoje ? (
              <div className="space-y-1">
                {statusHoje === 'revisado' ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Realizado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Incompleto
                  </Badge>
                )}
                {foraHorario && (
                  <Badge variant="outline" className="gap-1 block w-fit">
                    <Clock className="h-3 w-3" />
                    Fora do horário
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Não realizado
                </Badge>
                <p className="text-xs text-orange-600">
                  Realize antes das 07:00
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Realizados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Checklists Realizados</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalRealizados}</div>
          <p className="text-xs text-muted-foreground">
            Total de checklists completos
          </p>
        </CardContent>
      </Card>

      {/* Total Não Realizados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Checklists Incompletos</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{totalNaoRealizados}</div>
          <p className="text-xs text-muted-foreground">
            Checklists não realizados ou incompletos
          </p>
        </CardContent>
      </Card>

      {/* Sequência Consecutiva */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dias Consecutivos</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{sequenciaConsecutiva}</div>
          <p className="text-xs text-muted-foreground">
            {sequenciaConsecutiva === 1 ? 'dia consecutivo' : 'dias consecutivos'}
          </p>
          {sequenciaConsecutiva >= 7 && (
            <Badge variant="outline" className="mt-1">
              🔥 Sequência semanal!
            </Badge>
          )}
          {sequenciaConsecutiva >= 30 && (
            <Badge variant="default" className="mt-1">
              🏆 Sequência mensal!
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}