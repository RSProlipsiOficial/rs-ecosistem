import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, MapPin, Gauge, Fuel, FileText } from 'lucide-react';
import { ChecklistMotorista } from '@/types/motorista';
import { useVans } from '@/hooks/useVans';
import { useChecklistItems } from '@/hooks/useChecklistItems';

interface ChecklistDetalhesModalProps {
  checklist: ChecklistMotorista | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChecklistDetalhesModal({ checklist, open, onOpenChange }: ChecklistDetalhesModalProps) {
  const { vans } = useVans();
  const { items: checklistItems } = useChecklistItems();

  if (!checklist) return null;

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

  const getStatusBadge = (status: string) => {
    if (status === 'revisado') {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Detalhes do Checklist - {formatDate(checklist.data)}
          </DialogTitle>
          <DialogDescription>
            Informações completas do checklist realizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Van</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getVanNome(checklist.van_id)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>
                    {getStatusBadge(checklist.status)}
                    {checklist.fora_horario && (
                      <Badge variant="outline" className="gap-1 ml-2">
                        <Clock className="h-3 w-3" />
                        Fora do horário
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatTime(checklist.horario_preenchimento)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quilometragem</p>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{checklist.quilometragem.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
              
              {checklist.combustivel && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Combustível:</span>
                    <span className="font-medium">{checklist.combustivel}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens do Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens Verificados</CardTitle>
              <CardDescription>
                Status de cada item do checklist de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistItems.map((item) => {
                  const fieldKey = item.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                  const valor = (checklist as any)[fieldKey];
                  
                  let isChecked = false;
                  let displayValue = '';
                  
                  if (item.tipo === 'boolean') {
                    isChecked = Boolean(valor);
                    displayValue = isChecked ? 'Sim' : 'Não';
                  } else if (item.tipo === 'number') {
                    isChecked = Boolean(valor && valor > 0);
                    displayValue = valor ? valor.toString() : 'Não informado';
                  } else if (item.tipo === 'text') {
                    isChecked = Boolean(valor);
                    displayValue = valor || 'Não informado';
                  }
                  
                  return (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {isChecked ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        {item.tipo !== 'boolean' && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Valor:</span> {displayValue}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {checklist.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{checklist.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}