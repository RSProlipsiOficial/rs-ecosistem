import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  CreditCard,
  Edit2,
  User,
  QrCode
} from "lucide-react";
import { PagamentoComAluno } from "@/types/mensalidades";
import { calcularJuros } from "@/utils/calcularJuros";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editandoData, setEditandoData] = useState<string | null>(null);
  const [novaData, setNovaData] = useState<string>("");
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoComAluno | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Carregar configurações de juros do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_profiles')
            .select('juros_tipo, juros_valor_multa, juros_valor_dia, juros_percentual_multa, juros_percentual_mes')
            .eq('user_id', user.id)
            .maybeSingle();
          if (data) setProfile(data);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };
    loadProfile();
  }, []);

  const handleCobrar = (pagamento: PagamentoComAluno) => {
    setSelectedPagamento(pagamento);
    setDetailsOpen(true);
  };

  const _gerarPix = async (pagamentoId: string) => {
    const { data, error } = await supabase.functions.invoke('mercado-pago-pix', {
      body: { pagamentoId }
    });

    if (error) throw error;
    if (data && !data.success && data.error) throw new Error(data.error);
    if (!data?.qr_code) throw new Error("Código PIX não retornado pelo Mercado Pago.");
    return data;
  };

  const handleGerarPix = async (pagamento: PagamentoComAluno) => {
    try {
      setLoadingAction('pix');
      setPixData(null); // Limpar dados anteriores
      const data = await _gerarPix(pagamento.id);

      if (data) {
        setPixData(data);
        setDetailsOpen(false);
        setPixOpen(true);
        toast({
          title: "PIX Gerado!",
          description: "QR Code criado com sucesso.",
        });
      }
      return data;
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Não foi possível gerar o PIX.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGerarCheckout = async (pagamento: PagamentoComAluno) => {
    try {
      setLoadingAction('checkout');

      const { data, error } = await supabase.functions.invoke('mercado-pago-checkout', {
        body: { pagamentoId: pagamento.id }
      });

      if (error) throw error;

      if (!data?.success && data?.error) throw new Error(data.error);

      if (data?.init_point) {
        window.open(data.init_point, '_blank');
        toast({
          title: "Checkout aberto!",
          description: "Janela de pagamento foi aberta.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao gerar Checkout:', error);
      toast({
        title: "Erro ao gerar Checkout",
        description: error.message || "Não foi possível gerar o checkout.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEnviarWhatsApp = async (pagamento: PagamentoComAluno) => {
    try {
      setLoadingAction('whatsapp');

      // Calcular juros
      const { diasAtraso, juros, multa, valorTotal } = calcularJuros(
        Number(pagamento.valor),
        pagamento.data_vencimento,
        (pagamento.aluno as any)?.dia_vencimento,
        profile
      );

      // Gerar PIX com valor atualizado chamando a função base
      const data = await _gerarPix(pagamento.id);

      if (!data?.qr_code) {
        throw new Error("Erro ao gerar código PIX");
      }

      const nomeAluno = pagamento.aluno?.nome_completo || "Aluno";
      const whatsapp = pagamento.aluno?.whatsapp_responsavel;

      if (!whatsapp) {
        toast({
          title: "WhatsApp não encontrado",
          description: `O aluno ${nomeAluno} não possui WhatsApp cadastrado.`,
          variant: "destructive"
        });
        return;
      }

      // Formatar mensagem
      const dataVenc = pagamento.data_vencimento ? new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR') : '-';
      const valorOriginalFmt = formatCurrency(pagamento.valor);
      const multaFmt = formatCurrency(multa);
      const jurosFmt = formatCurrency(juros);
      const valorTotalFmt = formatCurrency(valorTotal);

      const labelJuros = profile?.juros_tipo === 'percentual'
        ? `Juros (${profile.juros_percentual_mes}%/mês)`
        : `Juros (R$ ${profile?.juros_valor_dia || 2}/dia)`;

      const mensagem = diasAtraso > 0
        ? `Olá! 👋\n\nIdentificamos pendência na mensalidade de *${nomeAluno}*.\n\n📅 *Vencimento:* ${dataVenc}\n💰 *Valor Original:* ${valorOriginalFmt}\n⏰ *Dias de Atraso:* ${diasAtraso} dias\n💸 *Multa:* ${multaFmt}\n📊 *${labelJuros}:* ${jurosFmt}\n💳 *VALOR TOTAL:* ${valorTotalFmt}\n\n🔗 *Link de Pagamento PIX (Copie e Cole):*\n${data.qr_code}\n\nQualquer dúvida, estamos à disposição! 🚐`
        : `Olá! 👋\n\nLembrete de mensalidade de *${nomeAluno}*.\n\n📅 *Vencimento:* ${dataVenc}\n💰 *Valor:* ${valorOriginalFmt}\n\n🔗 *Link de Pagamento PIX (Copie e Cole):*\n${data.qr_code}\n\nObrigado! 🚐`;

      // Limpar e formatar WhatsApp
      const whatsappLimpo = whatsapp.replace(/\D/g, '');
      const whatsappFormatado = whatsappLimpo.startsWith('55') ? whatsappLimpo : `55${whatsappLimpo}`;

      // Abrir WhatsApp
      const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, '_blank');

      toast({
        title: "WhatsApp aberto!",
        description: diasAtraso > 0
          ? `Cobrança com juros de ${jurosFmt} calculada.`
          : "Mensagem de cobrança preparada."
      });

      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro ao enviar WhatsApp",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingAction(null);
    }
  };

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
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-black-primary" />
            </div>
            Histórico de Renda
          </CardTitle>
          <CardDescription>Visualize o histórico de todos os recebimentos</CardDescription>
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
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleCobrar(pagamento)}
                          className="bg-gradient-gold text-black-primary hover:opacity-90"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Cobrar</span>
                          <span className="sm:hidden">💰</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMarcarComoPago(pagamento.id)}
                          className="text-green-500 hover:text-green-600 border-green-500/20"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Marcar como Pago</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                      </>
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

      {/* Dialog de Detalhes do Recebimento */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl">
          <div className="h-2 bg-gold w-full" />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black italic flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                DETALHES DO RECEBIMENTO
              </DialogTitle>
            </DialogHeader>
            {selectedPagamento ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Valor do Título</p>
                    <p className="text-xl font-black text-gold tracking-tighter">{formatCurrency(selectedPagamento.valor)}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Status Atual</p>
                    <Badge className={`h-6 px-3 text-[10px] font-black uppercase ${selectedPagamento.status === 'pago' ? "bg-green-500" : "bg-yellow-500"}`}>
                      {selectedPagamento.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted/10 p-4 rounded-2xl border border-border/30 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">Vencimento</span>
                    <span className="font-black">{formatDate(selectedPagamento.data_vencimento)}</span>
                  </div>
                  {selectedPagamento.aluno && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-tighter">Aluno Principal</span>
                      <span className="font-black text-gold">{selectedPagamento.aluno.nome_completo}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start text-xs pt-2 border-t border-border/30">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">Descrição</span>
                    <span className="font-medium text-right max-w-[200px]">Mensalidade - {selectedPagamento.aluno?.nome_completo}</span>
                  </div>
                </div>

                {/* Cálculo de Juros */}
                {(() => {
                  const { diasAtraso, multa, juros, valorTotal } = calcularJuros(
                    Number(selectedPagamento.valor),
                    selectedPagamento.data_vencimento,
                    (selectedPagamento.aluno as any)?.dia_vencimento,
                    profile
                  );

                  if (diasAtraso <= 0) return null;

                  return (
                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20 space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-red-400">
                        <span>Dias de Atraso</span>
                        <span>{diasAtraso} dias</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground">Multa por Atraso</span>
                        <span className="text-red-400">{formatCurrency(multa)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground">
                          {profile?.juros_tipo === 'percentual'
                            ? `Juros (${profile.juros_percentual_mes}%/mês)`
                            : `Juros (R$ ${profile?.juros_valor_dia || 2}/dia)`}
                        </span>
                        <span className="text-red-400">{formatCurrency(juros)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-red-500/20">
                        <span className="text-[10px] uppercase font-black tracking-widest text-red-400">VALOR TOTAL</span>
                        <span className="text-lg font-black text-red-500 tracking-tighter">{formatCurrency(valorTotal)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col gap-3">
                  {selectedPagamento.status === 'nao_pago' && (
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        className="bg-gold text-black hover:bg-gold/90 h-12 rounded-xl font-black shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                        onClick={() => handleGerarPix(selectedPagamento)}
                        disabled={!!loadingAction}
                      >
                        <QrCode className="w-5 h-5" />
                        PIX
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        onClick={() => handleGerarCheckout(selectedPagamento)}
                        disabled={!!loadingAction}
                      >
                        <CreditCard className="w-5 h-5" />
                        CARD
                      </Button>
                      <Button
                        className="bg-[#25D366] hover:bg-[#1fb855] text-white h-12 rounded-xl font-black shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        onClick={() => handleEnviarWhatsApp(selectedPagamento)}
                        disabled={!!loadingAction}
                      >
                        <MessageSquare className="w-5 h-5" />
                        ZAP
                      </Button>
                    </div>
                  )}
                  <Button
                    className="flex-1 h-12 rounded-xl font-black shadow-lg bg-green-600 hover:bg-green-700 shadow-green-500/20"
                    onClick={() => {
                      onMarcarComoPago(selectedPagamento.id);
                      setDetailsOpen(false);
                    }}
                  >
                    ✅ MARCAR COMO PAGO
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de PIX */}
      <Dialog open={pixOpen} onOpenChange={setPixOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl">
          <div className="h-2 bg-gold w-full" />
          <div className="p-8 flex flex-col items-center">
            <DialogHeader className="w-full mb-8">
              <DialogTitle className="text-xl font-black italic flex items-center justify-center gap-3">
                <QrCode className="w-6 h-6 text-gold" />
                COBRANÇA VIA PIX
              </DialogTitle>
            </DialogHeader>

            {pixData?.qr_code_base64 && (
              <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl border-4 border-gold/10">
                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            )}

            <div className="w-full space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase text-center font-black tracking-[0.3em]">Copia e Cola</p>
              <div className="flex gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                <Input
                  readOnly
                  value={pixData?.qr_code || ""}
                  className="bg-black/20 border-gold/20 font-mono text-[10px] h-10 focus-visible:ring-0 text-white placeholder:text-muted-foreground"
                />
                <Button
                  className="bg-gold text-black hover:bg-gold/90 h-10 px-4 font-black text-[10px] rounded-xl shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData?.qr_code || "");
                    toast({ title: "Código PIX copiado!", description: "Envie para o cliente." });
                  }}
                >
                  COPIAR
                </Button>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-muted-foreground italic text-center opacity-60 font-medium">
              O status será atualizado instantaneamente após a confirmação do Banco Central.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}