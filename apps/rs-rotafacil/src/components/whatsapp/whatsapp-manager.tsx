import React, { useState } from 'react';
import { Plus, MessageCircle, Trash2, QrCode, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppBaileys } from '@/hooks/useWhatsAppBaileys';
import { supabase } from '@/integrations/supabase/client';
export const WhatsAppManager = () => {
  const {
    instances,
    credits,
    loading,
    createInstance,
    deleteInstance,
    fetchInstances,
    updateQRCode
  } = useWhatsAppBaileys();

  const [instanceName, setInstanceName] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalId, setQrModalId] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) return;

    const instance = await createInstance(instanceName);
    if (instance) {
      setInstanceName('');
      setCreateModalOpen(false);
    }
  };

  // Polling do QR por até 30s
  const pollUpdateQr = async (instanceId: string) => {
    try {
      setQrError(null);
      setQrLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const deadline = Date.now() + 30_000; // 30 segundos
      while (Date.now() < deadline) {
        const response = await supabase.functions.invoke('whatsapp-baileys', {
          body: {
            action: 'update_qr',
            payload: { user_id: user.id, instance_id: instanceId }
          }
        });

        if (response.error) {
          const serverMsg = (response.data as any)?.error;
          throw new Error(serverMsg || response.error.message || 'Erro ao atualizar QR');
        }

        if (response.data?.success) {
          await fetchInstances();
          const updated = response.data.instance;
          if (updated?.qr_code) break;
        }

        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (err: any) {
      setQrError(err.message || 'Erro ao obter QR Code');
    } finally {
      setQrLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'awaiting_scan': return 'bg-yellow-500';
      case 'creating': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'awaiting_scan': return 'Aguardando QR';
      case 'creating': return 'Criando';
      default: return 'Desconectado';
    }
  };

  const creditsPercentage = credits ? (credits.creditos_usados / credits.limite_mensal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Painel de Créditos IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Créditos IA - Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {credits ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Usados: {credits.creditos_usados}</span>
                <span>Limite: {credits.limite_mensal === -1 ? 'Ilimitado' : credits.limite_mensal}</span>
              </div>

              {credits.limite_mensal !== -1 && (
                <Progress value={creditsPercentage} className="h-2" />
              )}

              {creditsPercentage > 80 && credits.limite_mensal !== -1 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você está próximo do limite mensal. Considere fazer upgrade do seu plano.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Carregando informações de créditos...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Instâncias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm md:text-lg font-black uppercase tracking-tight text-white">
              <Smartphone className="h-4 w-4 md:h-5 md:w-5 text-gold" />
              Instâncias WhatsApp
            </CardTitle>

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Instância
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Instância WhatsApp</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instance-name">Nome da Instância</Label>
                    <Input
                      id="instance-name"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      placeholder="Ex: Escola Principal"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateInstance}
                      disabled={loading || !instanceName.trim()}
                    >
                      {loading ? 'Criando...' : 'Criar Instância'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma instância WhatsApp configurada</p>
              <p className="text-sm">Crie uma instância para começar a enviar mensagens</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {instances.map((instance) => (
                <div key={instance.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(instance.status)}`} />
                        <span className="font-black text-xs md:text-sm uppercase tracking-tight text-white">{instance.instance_name}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] h-5 border-gold/30 text-gold/80">
                        {getStatusText(instance.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      {instance.status === 'awaiting_scan' && (
                        <Dialog open={qrModalId === instance.id} onOpenChange={(open) => {
                          setQrModalId(open ? instance.id : null);
                          if (open) pollUpdateQr(instance.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-[10px] font-bold border-gold/30 text-gold hover:bg-gold/10 uppercase tracking-widest"
                              onClick={() => {
                                setQrModalId(instance.id);
                                pollUpdateQr(instance.id);
                              }}
                            >
                              <QrCode className="h-3 w-3 mr-1.5" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-gold italic uppercase">Escaneie o QR Code</DialogTitle>
                              <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">
                                Abra o WhatsApp no seu telefone e escaneie o código abaixo
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4">
                              {instance.qr_code ? (
                                <img
                                  src={instance.qr_code}
                                  alt="QR Code WhatsApp"
                                  width={256}
                                  height={256}
                                  className="rounded-md w-full max-w-[200px] h-auto"
                                />
                              ) : (
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                  {qrLoading ? 'Gerando QR...' : 'QR indisponível'}
                                </div>
                              )}

                              {qrError && (
                                <Alert className="py-2">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <AlertDescription className="text-[9px] uppercase">{qrError}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex gap-2 w-full">
                                <Button variant="outline" size="sm" onClick={() => pollUpdateQr(instance.id)} disabled={qrLoading} className="flex-1 text-[10px] font-bold uppercase">
                                  {qrLoading ? 'Aguarde...' : 'Atualizar'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteInstance(instance.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {instance.phone_number && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Telefone: {instance.phone_number}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};