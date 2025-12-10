import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, X, Send, Smartphone, Bot } from "lucide-react";
import { PagamentoComAluno, MensalidadeConfig } from "@/types/mensalidades";
import { useWhatsAppBaileys } from "@/hooks/useWhatsAppBaileys";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface EnviarMensagemModalProps {
  open: boolean;
  onClose: () => void;
  pagamento: PagamentoComAluno | null;
  config: MensalidadeConfig | null;
  onEnviar: (conteudo: string, whatsapp: string) => Promise<void>;
  onGerarMensagem: (template: string, aluno: string, valor: number, dias?: number, pix?: string) => string;
}

export function EnviarMensagemModal({
  open,
  onClose,
  pagamento,
  config,
  onEnviar,
  onGerarMensagem
}: EnviarMensagemModalProps) {
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<string>("personalizada");
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  
  const { instances, sendAIMessage, credits } = useWhatsAppBaileys();

  useEffect(() => {
    if (open && pagamento && config && tipoMensagem !== "personalizada") {
      const template = getTipoMensagemTemplate(tipoMensagem);
      if (template) {
        const diasVencimento = calcularDiasVencimento(pagamento.data_vencimento);
        const mensagemGerada = onGerarMensagem(
          template,
          pagamento.aluno?.nome_completo || 'Aluno',
          pagamento.valor,
          Math.abs(diasVencimento),
          config.chave_pix
        );
        setMensagem(mensagemGerada);
      }
    }
  }, [open, pagamento, config, tipoMensagem, onGerarMensagem]);

  const getTipoMensagemTemplate = (tipo: string): string | null => {
    if (!config) return null;
    
    switch (tipo) {
      case 'antes_vencimento':
        return config.mensagem_antes_vencimento;
      case 'no_vencimento':
        return config.mensagem_no_vencimento;
      case 'apos_vencimento':
        return config.mensagem_apos_vencimento;
      default:
        return null;
    }
  };

  const calcularDiasVencimento = (dataVencimento?: string): number => {
    if (!dataVencimento) return 0;
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleEnviar = async () => {
    if (!pagamento?.aluno?.whatsapp_responsavel) {
      return;
    }

    setLoading(true);
    try {
      if (useAI && selectedInstance) {
        // Enviar via IA + WhatsApp Baileys
        const context = {
          tipo: tipoMensagem,
          aluno_nome: pagamento.aluno.nome_completo,
          valor: pagamento.valor,
          dias_vencimento: calcularDiasVencimento(pagamento.data_vencimento),
          chave_pix: config?.chave_pix || 'Não informada'
        };
        
        await sendAIMessage(
          selectedInstance,
          pagamento.aluno.whatsapp_responsavel,
          context
        );
      } else {
        // Método tradicional
        if (!mensagem.trim()) return;
        await onEnviar(mensagem, pagamento.aluno.whatsapp_responsavel);
      }
      
      onClose();
      setMensagem("");
      setTipoMensagem("personalizada");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirWhatsApp = () => {
    if (!pagamento?.aluno?.whatsapp_responsavel || !mensagem.trim()) {
      return;
    }

    const numeroLimpo = pagamento.aluno.whatsapp_responsavel.replace(/\D/g, '');
    const mensagemCodificada = encodeURIComponent(mensagem);
    const url = `https://api.whatsapp.com/send?phone=55${numeroLimpo}&text=${mensagemCodificada}`;
    
    window.open(url, '_blank');
  };

  if (!pagamento) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-black-primary" />
            </div>
            Enviar Mensagem - {pagamento.aluno?.nome_completo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Responsável: {pagamento.aluno?.nome_responsavel}</Label>
            <p className="text-sm text-muted-foreground">
              WhatsApp: {pagamento.aluno?.whatsapp_responsavel || 'Não informado'}
            </p>
          </div>

          {/* Seletor de Método */}
          <div>
            <Label htmlFor="metodo-envio">Método de Envio</Label>
            <Select value={useAI ? "ai" : "manual"} onValueChange={(value) => setUseAI(value === "ai")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    IA + WhatsApp Automático
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Manual (WhatsApp Web)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instância WhatsApp (apenas para IA) */}
          {useAI && (
            <div>
              <Label htmlFor="instancia-whatsapp">Instância WhatsApp</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma instância conectada" />
                </SelectTrigger>
                <SelectContent>
                  {instances
                    .filter(instance => instance.status === 'connected')
                    .map(instance => (
                      <SelectItem key={instance.id} value={instance.id}>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>{instance.instance_name}</span>
                          <Badge variant="outline" className="text-xs">
                            Conectado
                          </Badge>
                          {instance.phone_number && (
                            <span className="text-muted-foreground text-xs">
                              ({instance.phone_number})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {instances.filter(i => i.status === 'connected').length === 0 && (
                <Alert className="mt-2">
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma instância WhatsApp conectada. Configure uma instância na seção WhatsApp.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Créditos IA */}
          {useAI && credits && (
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Créditos IA: {credits.creditos_usados}/{credits.limite_mensal === -1 ? '∞' : credits.limite_mensal}</span>
                  {credits.limite_mensal !== -1 && credits.creditos_usados >= credits.limite_mensal && (
                    <Badge variant="destructive" className="text-xs">
                      Limite atingido!
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="tipo-mensagem">
              {useAI ? 'Tipo de Mensagem IA' : 'Tipo de Mensagem'}
            </Label>
            <Select value={tipoMensagem} onValueChange={setTipoMensagem}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personalizada">Mensagem Personalizada</SelectItem>
                {config && (
                  <>
                    <SelectItem value="antes_vencimento">Antes do Vencimento</SelectItem>
                    <SelectItem value="no_vencimento">No Vencimento</SelectItem>
                    <SelectItem value="apos_vencimento">Após Vencimento</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem (apenas para modo manual) */}
          {!useAI && (
            <div>
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você pode usar as variáveis: {'{aluno}'}, {'{valor}'}, {'{dias}'}, {'{pix}'}
              </p>
            </div>
          )}

          {/* Preview IA */}
          {useAI && tipoMensagem && tipoMensagem !== 'personalizada' && (
            <div>
              <Label>Preview da Mensagem IA</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4" />
                  <span className="font-medium">A IA gerará uma mensagem personalizada baseada em:</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Aluno: {pagamento.aluno?.nome_completo}</li>
                  <li>• Valor: R$ {pagamento.valor}</li>
                  <li>• Tipo: {tipoMensagem.replace('_', ' ')}</li>
                  <li>• PIX: {config?.chave_pix || 'Não configurado'}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            {!useAI && (
              <Button
                type="button"
                variant="outline"
                onClick={abrirWhatsApp}
                disabled={loading || !mensagem.trim() || !pagamento.aluno?.whatsapp_responsavel}
                className="text-green-600 hover:text-green-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Abrir WhatsApp
              </Button>
            )}

            <Button
              onClick={handleEnviar}
              disabled={
                loading || 
                (!useAI && !mensagem.trim()) || 
                (useAI && (!selectedInstance || !tipoMensagem)) ||
                !pagamento.aluno?.whatsapp_responsavel
              }
              className="bg-gradient-gold text-black-primary hover:opacity-90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {useAI ? <Bot className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {useAI ? 'Enviar via IA' : 'Registrar Envio'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}