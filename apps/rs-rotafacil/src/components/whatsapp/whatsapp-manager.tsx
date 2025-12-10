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
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`} />
                        <span className="font-medium">{instance.instance_name}</span>
                      </div>
                      <Badge variant="outline">
                        {getStatusText(instance.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {instance.status === 'awaiting_scan' && (
                      <Dialog open={qrModalId === instance.id} onOpenChange={(open) => {
                          setQrModalId(open ? instance.id : null);
                          if (open) pollUpdateQr(instance.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setQrModalId(instance.id);
                                pollUpdateQr(instance.id);
                              }}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Escaneie o QR Code</DialogTitle>
                              <DialogDescription>
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
                                  className="rounded-md"
                                />
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  {qrLoading ? 'Carregando QR Code...' : 'QR ainda não disponível. Clique em atualizar.'}
                                </div>
                              )}

                              {qrError && (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{qrError}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex gap-2">
                                {instance.qr_code && (
                                  <Button asChild variant="outline" size="sm">
                                    <a href={instance.qr_code} download={`whatsapp-qr-${instance.id}.svg`}>
                                      Baixar QR
                                    </a>
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => pollUpdateQr(instance.id)} disabled={qrLoading}>
                                  {qrLoading ? 'Atualizando...' : 'Atualizar QR'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInstance(instance.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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