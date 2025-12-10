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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Manutenções */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumo.total}</div>
          <p className="text-xs text-muted-foreground">
            Problemas reportados
          </p>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{resumo.pendentes}</div>
          <p className="text-xs text-muted-foreground">
            Aguardando reparo
          </p>
        </CardContent>
      </Card>

      {/* Em Andamento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{resumo.emAndamento}</div>
          <p className="text-xs text-muted-foreground">
            Sendo reparadas
          </p>
        </CardContent>
      </Card>

      {/* Concluídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{resumo.concluidas}</div>
          <p className="text-xs text-muted-foreground">
            Problemas resolvidos
          </p>
        </CardContent>
      </Card>

      {/* Alerta de Urgentes */}
      {resumo.urgentes > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Atenção: Problemas Urgentes
            </CardTitle>
            <CardDescription>
              Existem problemas com prioridade urgente que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {resumo.urgentes} problema{resumo.urgentes > 1 ? 's' : ''} urgente{resumo.urgentes > 1 ? 's' : ''}
              </Badge>
              <span className="text-sm text-red-700">
                Podem comprometer a segurança ou operação das vans
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}