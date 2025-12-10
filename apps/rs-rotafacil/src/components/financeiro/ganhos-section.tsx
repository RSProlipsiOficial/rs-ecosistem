import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { PagamentoMensal, GanhoExtra } from "@/types/financeiro";
import { GanhoExtraForm } from "./ganho-extra-form";

interface GanhosSectionProps {
  pagamentosMensais: PagamentoMensal[];
  ganhosExtras: GanhoExtra[];
  onMarcarPagamento: (id: string) => void;
  onCriarGanhoExtra: (data: any) => Promise<any>;
}

export function GanhosSection({ 
  pagamentosMensais, 
  ganhosExtras, 
  onMarcarPagamento, 
  onCriarGanhoExtra 
}: GanhosSectionProps) {
  const [showGanhoExtraForm, setShowGanhoExtraForm] = useState(false);

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

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'frete':
        return 'Frete';
      case 'excursao':
        return 'Excursão';
      case 'ajuda':
        return 'Ajuda';
      case 'presente':
        return 'Presente';
      case 'outro':
        return 'Outro';
      default:
        return tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Ganhos com Alunos */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-black-primary" />
            </div>
            Ganhos com Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentosMensais.length > 0 ? (
            <div className="space-y-4">
              {pagamentosMensais.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(pagamento.status)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {pagamento.aluno?.nome_completo || 'Aluno não encontrado'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Mensalidade - {formatCurrency(pagamento.valor)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(pagamento.status)}>
                      {getStatusText(pagamento.status)}
                    </Badge>
                    {pagamento.status === 'nao_pago' && (
                      <Button
                        size="sm"
                        onClick={() => onMarcarPagamento(pagamento.id)}
                        className="bg-gradient-gold text-black-primary hover:opacity-90"
                      >
                        Marcar como Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pagamento de mensalidade registrado para este mês.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ganhos Extras */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-black-primary" />
              </div>
              Ganhos Extras
            </div>
            <Button
              onClick={() => setShowGanhoExtraForm(true)}
              className="bg-gradient-gold text-black-primary hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ganho Extra
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ganhosExtras.length > 0 ? (
            <div className="space-y-4">
              {ganhosExtras.map((ganho) => (
                <div
                  key={ganho.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50"
                >
                  <div>
                    <h4 className="font-medium text-foreground">{ganho.descricao}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getTipoText(ganho.tipo)} - {new Date(ganho.data_ganho).toLocaleDateString('pt-BR')}
                    </p>
                    {ganho.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ganho.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-500">
                      {formatCurrency(ganho.valor)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTipoText(ganho.tipo)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum ganho extra registrado para este mês.
            </p>
          )}
        </CardContent>
      </Card>

      <GanhoExtraForm
        open={showGanhoExtraForm}
        onClose={() => setShowGanhoExtraForm(false)}
        onSubmit={onCriarGanhoExtra}
      />
    </div>
  );
}