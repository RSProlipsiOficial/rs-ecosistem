import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Eye, Calendar, MapPin } from 'lucide-react';
import { ChecklistMotorista } from '@/types/motorista';
import { useVans } from '@/hooks/useVans';

interface ChecklistHistoricoProps {
  checklists: ChecklistMotorista[];
  onViewDetails: (checklist: ChecklistMotorista) => void;
}

export function ChecklistHistorico({ checklists, onViewDetails }: ChecklistHistoricoProps) {
  const { vans } = useVans();

  const getVanNome = (vanId: string) => {
    const van = vans.find(v => v.id === vanId);
    return van?.nome || 'Van não encontrada';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const getStatusBadge = (checklist: ChecklistMotorista) => {
    if (checklist.status === 'revisado') {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Revisado
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Não Revisado
        </Badge>
      );
    }
  };

  if (checklists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Checklists
          </CardTitle>
          <CardDescription>
            Nenhum checklist foi realizado ainda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Comece realizando seu primeiro checklist diário</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Checklists
        </CardTitle>
        <CardDescription>
          {checklists.length} checklist(s) realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Van</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Quilometragem</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell className="font-medium">
                    {formatDate(checklist.data)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {getVanNome(checklist.van_id)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(checklist)}
                      {checklist.fora_horario && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Fora do horário
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatTime(checklist.horario_preenchimento)}
                  </TableCell>
                  <TableCell>
                    {checklist.quilometragem.toLocaleString()} km
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(checklist)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
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