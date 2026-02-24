import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWhatsAppBaileys } from "@/hooks/useWhatsAppBaileys";
import { MessageCircle, QrCode, Trash2, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function WhatsAppSettings() {
    const { toast } = useToast();
    const {
        instances,
        loading,
        createInstance,
        deleteInstance,
        fetchInstances,
    } = useWhatsAppBaileys();

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [creatingInstance, setCreatingInstance] = useState(false);

    const handleCreateInstance = async () => {
        setCreatingInstance(true);
        try {
            const result = await createInstance();
            if (result?.qr_code) {
                setQrCode(result.qr_code);
                toast({
                    title: "QR Code gerado!",
                    description: "Escaneie com seu WhatsApp para conectar",
                });
            }
        } catch (error: any) {
            toast({
                title: "Erro ao criar instância",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setCreatingInstance(false);
        }
    };

    const handleDeleteInstance = async (instanceId: string) => {
        try {
            await deleteInstance(instanceId);
            toast({
                title: "Instância removida",
                description: "WhatsApp desconectado com sucesso",
            });
            await fetchInstances();
        } catch (error: any) {
            toast({
                title: "Erro ao remover instância",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Conectado</Badge>;
            case 'connecting':
                return <Badge className="bg-yellow-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Conectando</Badge>;
            default:
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Desconectado</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Configurações do WhatsApp</h1>
                    <p className="text-muted-foreground">Conecte sua conta do WhatsApp para enviar mensagens automáticas</p>
                </div>
                <Button onClick={fetchInstances} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* QR Code Section */}
            {qrCode && (
                <Card className="border-green-500/50 bg-green-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Escaneie o QR Code
                        </CardTitle>
                        <CardDescription>
                            Abra o WhatsApp no seu celular, vá em Configurações → WhatsApp Web → Escanear código QR
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Connected Instances */}
            <Card>
                <CardHeader>
                    <CardTitle>Instâncias Conectadas</CardTitle>
                    <CardDescription>
                        Gerencie suas conexões do WhatsApp
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : instances.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">Nenhuma instância conectada</p>
                            <Button onClick={handleCreateInstance} disabled={creatingInstance}>
                                {creatingInstance ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Gerando QR Code...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Conectar WhatsApp
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {instances.map((instance) => (
                                <div
                                    key={instance.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <MessageCircle className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className="font-medium">{instance.name || 'WhatsApp Business'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ID: {instance.instance_id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(instance.status)}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Desconectar WhatsApp?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Isso irá remover a conexão com esta instância do WhatsApp. Você precisará escanear o QR Code novamente para reconectar.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteInstance(instance.id)}
                                                        className="bg-destructive text-destructive-foreground"
                                                    >
                                                        Desconectar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}

                            <Button onClick={handleCreateInstance} variant="outline" className="w-full" disabled={creatingInstance}>
                                {creatingInstance ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Gerando QR Code...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Adicionar Nova Instância
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Como Conectar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Clique em "Conectar WhatsApp" para gerar um QR Code</p>
                    <p>2. Abra o WhatsApp no seu celular</p>
                    <p>3. Vá em Configurações → WhatsApp Web</p>
                    <p>4. Toque em "Escanear código QR"</p>
                    <p>5. Escaneie o QR Code exibido na tela</p>
                    <p className="text-green-600 font-medium pt-2">✓ Pronto! Seu WhatsApp estará conectado e pronto para enviar mensagens automáticas</p>
                </CardContent>
            </Card>
        </div>
    );
}
