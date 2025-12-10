import { ChecklistMotorista } from '@/types/motorista';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistTableProps {
  checklists: ChecklistMotorista[];
  onViewDetails: (checklist: ChecklistMotorista) => void;
  loading?: boolean;
}

export function ChecklistTable({ checklists, onViewDetails, loading }: ChecklistTableProps) {
  const getStatusBadge = (checklist: ChecklistMotorista) => {
    if (checklist.status === 'revisado') {
      return (
        <Badge variant="default" className="bg-yellow-500 text-white">
          <Clock className="w-3 h-3 mr-1" />
          Revisado
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Não Revisado
      </Badge>
    );
  };

  const getHorarioStatus = (checklist: ChecklistMotorista) => {
    if (checklist.fora_horario) {
      return (
        <Badge variant="destructive" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Fora do horário
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checklists</CardTitle>
          <CardDescription>Histórico de checklists realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando checklists...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (checklists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checklists</CardTitle>
          <CardDescription>Histórico de checklists realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
            <p className="text-muted-foreground text-center">
              Quando você realizar checklists, eles aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklists</CardTitle>
        <CardDescription>Histórico de checklists realizados</CardDescription>
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell className="font-medium">
                    {format(new Date(checklist.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {checklist.van_id ? `Van ${checklist.van_id.slice(0, 8)}...` : 'Van não encontrada'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(checklist)}
                      {getHorarioStatus(checklist)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {checklist.horario_preenchimento}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {checklist.quilometragem ? `${checklist.quilometragem} km` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(checklist)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
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