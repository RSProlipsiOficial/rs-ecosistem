import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Calendar,
  CreditCard,
  Edit2
} from "lucide-react";
import { PagamentoComAluno } from "@/types/mensalidades";

interface MensalidadeTabelaProps {
  pagamentos: PagamentoComAluno[];
  onMarcarComoPago: (id: string) => void;
  onEnviarMensagem: (pagamento: PagamentoComAluno) => void;
  onAtualizarDataVencimento: (id: string, data: string) => void;
}

export function MensalidadeTabela({ 
  pagamentos, 
  onMarcarComoPago, 
  onEnviarMensagem,
  onAtualizarDataVencimento
}: MensalidadeTabelaProps) {
  const [editandoData, setEditandoData] = useState<string | null>(null);
  const [novaData, setNovaData] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    return status === 'pago' 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'pago'
      ? 'bg-green-500/10 text-green-500 border-green-500/20'
      : 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  const getStatusText = (status: string) => {
    return status === 'pago' ? 'Pago' : 'Não Pago';
  };

  const iniciarEdicaoData = (id: string, dataAtual?: string) => {
    setEditandoData(id);
    setNovaData(dataAtual || '');
  };

  const salvarData = async (id: string) => {
    if (novaData) {
      await onAtualizarDataVencimento(id, novaData);
    }
    setEditandoData(null);
    setNovaData('');
  };

  const cancelarEdicao = () => {
    setEditandoData(null);
    setNovaData('');
  };

  if (pagamentos.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum pagamento encontrado para os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-black-primary" />
          </div>
          Controle de Mensalidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-border rounded-lg bg-background/50 gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                {getStatusIcon(pagamento.status)}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    {pagamento.aluno?.nome_completo || 'Nome não informado'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Responsável: {pagamento.aluno?.nome_responsavel || 'Não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp: {pagamento.aluno?.whatsapp_responsavel || 'Não informado'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(pagamento.valor)}
                    </span>
                    <Badge className={getStatusColor(pagamento.status)}>
                      {getStatusText(pagamento.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Data de Vencimento */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {editandoData === pagamento.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={novaData}
                        onChange={(e) => setNovaData(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        size="sm"
                        onClick={() => salvarData(pagamento.id)}
                        className="bg-gradient-gold text-black-primary hover:opacity-90"
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelarEdicao}
                      >
                        ✗
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Venc: {formatDate(pagamento.data_vencimento)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => iniciarEdicaoData(pagamento.id, pagamento.data_vencimento)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 flex-wrap">
                  {pagamento.status === 'nao_pago' && (
                    <Button
                      size="sm"
                      onClick={() => onMarcarComoPago(pagamento.id)}
                      className="bg-gradient-gold text-black-primary hover:opacity-90"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Marcar como Pago</span>
                      <span className="sm:hidden">Pago</span>
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEnviarMensagem(pagamento)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Enviar Mensagem</span>
                    <span className="sm:hidden">Msg</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}