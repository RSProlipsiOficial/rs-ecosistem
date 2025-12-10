import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Wrench, MapPin, AlertTriangle, CheckCircle, DollarSign, FileText } from 'lucide-react';
import { ManutencaoVan, TIPOS_PROBLEMA, PRIORIDADES, STATUS_MANUTENCAO } from '@/types/manutencao';
import { useVans } from '@/hooks/useVans';

interface ManutencaoDetalhesModalProps {
  manutencao: ManutencaoVan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManutencaoDetalhesModal({ manutencao, open, onOpenChange }: ManutencaoDetalhesModalProps) {
  const { vans } = useVans();

  if (!manutencao) return null;

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Detalhes da Manutenção - {formatDate(manutencao.data_relato)}
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o problema reportado
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
                    <span className="font-medium">{getVanNome(manutencao.van_id)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo do Problema</p>
                  <span className="font-medium">{getTipoLabel(manutencao.tipo_problema)}</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Prioridade</p>
                  {getPrioridadeBadge(manutencao.prioridade)}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(manutencao.status)}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data do Relato:</span>
                  <span className="font-medium">{formatDate(manutencao.data_relato)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição do Problema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Descrição do Problema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {manutencao.descricao_problema}
              </p>
            </CardContent>
          </Card>

          {/* Informações da Solução (se houver) */}
          {(manutencao.status === 'concluido' || manutencao.observacoes_solucao || manutencao.custo_reparo) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Informações da Solução
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {manutencao.data_solucao && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Data da Solução:</span>
                    <span className="font-medium">{formatDate(manutencao.data_solucao)}</span>
                  </div>
                )}

                {manutencao.custo_reparo && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Custo do Reparo:</span>
                    <span className="font-medium">{formatCurrency(manutencao.custo_reparo)}</span>
                  </div>
                )}

                {manutencao.observacoes_solucao && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Observações da Solução:</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap bg-green-50 border border-green-200 p-3 rounded-lg">
                      {manutencao.observacoes_solucao}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}