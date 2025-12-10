import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Calendar, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { ManutencaoVan, TIPOS_PROBLEMA, PRIORIDADES, STATUS_MANUTENCAO } from '@/types/manutencao';
import { useVans } from '@/hooks/useVans';

interface ManutencaoHistoricoProps {
  manutencoes: ManutencaoVan[];
  onViewDetails: (manutencao: ManutencaoVan) => void;
  onMarkCompleted?: (id: string) => void;
  loading?: boolean;
}

export function ManutencaoHistorico({ manutencoes, onViewDetails, onMarkCompleted, loading }: ManutencaoHistoricoProps) {
  const { vans } = useVans();

  const getVanNome = (vanId: string) => {
    const van = vans.find(v => v.id === vanId);
    return van?.nome || 'Van não encontrada';
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = TIPOS_PROBLEMA.find(t => t.value === tipo);
    return tipoObj?.label || tipo;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeObj = PRIORIDADES.find(p => p.value === prioridade);
    if (!prioridadeObj) return null;

    return (
      <Badge variant="outline" className="gap-1">
        <div className={`w-2 h-2 rounded-full ${prioridadeObj.color}`}></div>
        {prioridadeObj.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusObj = STATUS_MANUTENCAO.find(s => s.value === status);
    if (!statusObj) return null;

    const variant = status === 'concluido' ? 'default' : 
                   status === 'cancelado' ? 'destructive' : 'secondary';

    return (
      <Badge variant={variant} className="gap-1">
        <div className={`w-2 h-2 rounded-full ${statusObj.color}`}></div>
        {statusObj.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (manutencoes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Nenhuma manutenção reportada
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Quando você reportar problemas nas vans, eles aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Histórico de Manutenções
        </CardTitle>
        <CardDescription>
          Todos os problemas reportados nas vans e seu status atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Van</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manutencoes.map((manutencao) => (
                <TableRow key={manutencao.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(manutencao.data_relato)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getVanNome(manutencao.van_id)}
                  </TableCell>
                  <TableCell>
                    {getTipoLabel(manutencao.tipo_problema)}
                  </TableCell>
                  <TableCell>
                    {getPrioridadeBadge(manutencao.prioridade)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(manutencao.status)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {manutencao.descricao_problema}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {manutencao.status !== 'concluido' && onMarkCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkCompleted(manutencao.id)}
                          disabled={loading}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Concluir
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(manutencao)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}