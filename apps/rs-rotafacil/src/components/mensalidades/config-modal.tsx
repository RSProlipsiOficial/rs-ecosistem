import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, X, Save } from "lucide-react";
import { MensalidadeConfig, MensalidadeConfigFormData } from "@/types/mensalidades";

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: MensalidadeConfig | null;
  onSalvar: (config: MensalidadeConfigFormData) => Promise<void>;
}

export function ConfigModal({ open, onClose, config, onSalvar }: ConfigModalProps) {
  const [formData, setFormData] = useState<MensalidadeConfigFormData>({
    dias_antes_vencimento: 3,
    dias_apos_vencimento: 3,
    envio_automatico_ativo: false,
    mensagem_antes_vencimento: 'Olá! A mensalidade de {aluno} vence em {dias} dias. Valor: {valor}. Pague via Pix: {pix}',
    mensagem_no_vencimento: 'Olá! A mensalidade de {aluno} vence hoje. Valor: {valor}. Pague via Pix: {pix}',
    mensagem_apos_vencimento: 'Atenção! A mensalidade de {aluno} está em atraso desde {dias} dias. Valor: {valor}. Regularize via Pix: {pix}',
    chave_pix: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        dias_antes_vencimento: config.dias_antes_vencimento,
        dias_apos_vencimento: config.dias_apos_vencimento,
        envio_automatico_ativo: config.envio_automatico_ativo,
        mensagem_antes_vencimento: config.mensagem_antes_vencimento,
        mensagem_no_vencimento: config.mensagem_no_vencimento,
        mensagem_apos_vencimento: config.mensagem_apos_vencimento,
        chave_pix: config.chave_pix || '',
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSalvar(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-black-primary" />
            </div>
            Configurações de Mensalidades
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações de Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configurações de Envio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dias_antes">Dias antes do vencimento</Label>
                <Input
                  id="dias_antes"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.dias_antes_vencimento}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dias_antes_vencimento: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="dias_apos">Dias após o vencimento</Label>
                <Input
                  id="dias_apos"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.dias_apos_vencimento}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dias_apos_vencimento: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="envio_automatico"
                checked={formData.envio_automatico_ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  envio_automatico_ativo: checked 
                }))}
              />
              <Label htmlFor="envio_automatico">Ativar envio automático de mensagens</Label>
            </div>
          </div>

          {/* Chave PIX */}
          <div>
            <Label htmlFor="chave_pix">Chave PIX</Label>
            <Input
              id="chave_pix"
              value={formData.chave_pix}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                chave_pix: e.target.value 
              }))}
              placeholder="Digite sua chave PIX"
            />
          </div>

          {/* Templates de Mensagens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Templates de Mensagens</h3>
            <p className="text-sm text-muted-foreground">
              Use as variáveis: {'{aluno}'}, {'{valor}'}, {'{dias}'}, {'{pix}'}
            </p>

            <div>
              <Label htmlFor="msg_antes">Mensagem antes do vencimento</Label>
              <Textarea
                id="msg_antes"
                value={formData.mensagem_antes_vencimento}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mensagem_antes_vencimento: e.target.value 
                }))}
                placeholder="Mensagem enviada antes do vencimento"
                className="min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="msg_vencimento">Mensagem no vencimento</Label>
              <Textarea
                id="msg_vencimento"
                value={formData.mensagem_no_vencimento}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mensagem_no_vencimento: e.target.value 
                }))}
                placeholder="Mensagem enviada no dia do vencimento"
                className="min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="msg_apos">Mensagem após vencimento</Label>
              <Textarea
                id="msg_apos"
                value={formData.mensagem_apos_vencimento}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mensagem_apos_vencimento: e.target.value 
                }))}
                placeholder="Mensagem enviada após o vencimento"
                className="min-h-20"
              />
            </div>
          </div>

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
            
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-gold text-black-primary hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}