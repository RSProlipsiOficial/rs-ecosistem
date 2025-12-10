import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, XCircle, Clock, CreditCard, Edit } from "lucide-react";
import { Gasto } from "@/types/financeiro";
import { GastoForm } from "./gasto-form";

interface GastosSectionProps {
  gastos: Gasto[];
  onMarcarGasto: (id: string) => void;
  onCriarGasto: (data: any) => Promise<any>;
  onEditarGasto: (id: string, data: any) => Promise<any>;
}

export function GastosSection({ gastos, onMarcarGasto, onCriarGasto, onEditarGasto }: GastosSectionProps) {
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'nao_pago':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'em_aberto':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'nao_pago':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'em_aberto':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'nao_pago':
        return 'Não Pago';
      case 'em_aberto':
        return 'Em Aberto';
      default:
        return status;
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'fixo' 
      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      : 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  };

  const getTipoText = (tipo: string) => {
    return tipo === 'fixo' ? 'Fixo' : 'Variável';
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-black-primary" />
            </div>
            Gastos Mensais
          </div>
          <Button
            onClick={() => setShowGastoForm(true)}
            className="bg-gradient-gold text-black-primary hover:opacity-90"
            size="sm"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Adicionar Gasto</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gastos.length > 0 ? (
          <div className="space-y-4">
            {gastos.map((gasto) => (
              <div
                key={gasto.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg bg-background/50 gap-4"
              >
                 <div className="flex items-center gap-4 flex-1">
                   {getStatusIcon(gasto.status)}
                   <div className="flex-1">
                     <h4 className="font-medium text-foreground">{gasto.descricao}</h4>
                     <p className="text-sm text-muted-foreground">
                       {formatCurrency(gasto.valor)}
                       {gasto.data_vencimento && (
                         <span className="ml-2">
                           • Venc: {new Date(gasto.data_vencimento).toLocaleDateString('pt-BR')}
                         </span>
                       )}
                     </p>
                     {gasto.observacoes && (
                       <p className="text-xs text-muted-foreground mt-1">
                         {gasto.observacoes}
                       </p>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                   <Badge className={getTipoColor(gasto.tipo)}>
                     {getTipoText(gasto.tipo)}
                   </Badge>
                   <Badge className={getStatusColor(gasto.status)}>
                     {getStatusText(gasto.status)}
                   </Badge>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => setEditingGasto(gasto)}
                     className="text-muted-foreground hover:text-foreground shrink-0"
                   >
                     <Edit className="w-3 h-3 sm:mr-1" />
                     <span className="hidden sm:inline">Editar</span>
                   </Button>
                   {gasto.status === 'nao_pago' && (
                     <Button
                       size="sm"
                       onClick={() => onMarcarGasto(gasto.id)}
                       className="bg-gradient-gold text-black-primary hover:opacity-90 shrink-0"
                     >
                       <span className="hidden sm:inline">Marcar como Pago</span>
                       <span className="sm:hidden">Pagar</span>
                     </Button>
                   )}
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum gasto registrado para este mês.
          </p>
        )}
      </CardContent>

      <GastoForm
        open={showGastoForm}
        onClose={() => setShowGastoForm(false)}
        onSubmit={onCriarGasto}
      />

      <GastoForm
        open={!!editingGasto}
        onClose={() => setEditingGasto(null)}
        onSubmit={(data) => editingGasto ? onEditarGasto(editingGasto.id, data) : Promise.resolve()}
        initialData={editingGasto || undefined}
        isEditing={!!editingGasto}
      />
    </Card>
  );
}