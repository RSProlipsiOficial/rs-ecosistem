import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    Zap,
    Copy,
    Check,
    QrCode,
    Send,
    Loader2,
    DollarSign,
    Calendar,
    User as UserIcon
} from "lucide-react";

interface User {
    id: string;
    email: string;
    user_metadata?: {
        name?: string;
        phone?: string;
    };
    subscription?: {
        status: string;
        plan_name: string;
        plan_price: number;
        expires_at: string;
    };
}

interface CobrarModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CobrarModal({ user, isOpen, onClose }: CobrarModalProps) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [pixData, setPixData] = useState<{
        qr_code: string;
        qr_code_base64: string;
        ticket_url: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleGeneratePix = async () => {
        if (!user || !amount) return;

        setLoading(true);
        try {
            // 1. Criar um registro em payment_history (ou similar para rastrear)
            // Para simplicidade inicial, vamos usar a função mercado-pago-pix 
            // que já lida com o gateway. Precisamos garantir que ela suporte
            // o fluxo de cobrança de app.

            // Nota: No sistema atual, as assinaturas de app são gerenciadas de forma 
            // um pouco diferente das mensalidades dos alunos. 
            // Para este MVP, vamos criar uma cobrança avulsa.

            const { data, error } = await supabase.functions.invoke('mercado-pago-pix', {
                body: {
                    amount: parseFloat(amount),
                    userId: user.id || user.email, // Garantir algum identificador
                    description: `Assinatura: ${user.subscription?.plan_name || 'Personalizada'}`,
                    type: 'app_subscription'
                }
            });

            if (error) throw error;

            if (data.success) {
                setPixData({
                    qr_code: data.qr_code,
                    qr_code_base64: data.qr_code_base64,
                    ticket_url: data.ticket_url
                });
                toast({
                    title: "PIX Gerado!",
                    description: "A cobrança foi criada com sucesso.",
                });
            } else {
                throw new Error(data.error || "Erro ao gerar PIX");
            }
        } catch (error: any) {
            console.error("Erro ao gerar PIX:", error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível gerar o PIX.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (pixData?.qr_code) {
            navigator.clipboard.writeText(pixData.qr_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "Copiado!",
                description: "Código PIX copiado para a área de transferência.",
            });
        }
    };

    const sendToWhatsApp = () => {
        if (!user?.user_metadata?.phone || !pixData) return;

        const phone = user.user_metadata.phone.replace(/\D/g, "");
        const message = encodeURIComponent(
            `Olá ${user.user_metadata.name || 'Cliente'}! 🚀\n\n` +
            `Sua fatura da RotaFácil está disponível.\n` +
            `Valor: R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
            `Utilize o código abaixo para pagar via PIX Copia e Cola:\n\n` +
            `${pixData.qr_code}\n\n` +
            `Ou acesse o link do comprovante: ${pixData.ticket_url}`
        );

        window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-gold/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-gold flex items-center gap-2 uppercase font-black">
                        <Zap className="w-5 h-5" />
                        Cobrar Agora
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Gere uma cobrança PIX para o proprietário do aplicativo.
                    </DialogDescription>
                </DialogHeader>

                {!pixData ? (
                    <div className="space-y-6 py-4">
                        <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                                    <UserIcon className="w-5 h-5 text-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{user.user_metadata?.name || user.email}</p>
                                    <Badge variant="outline" className="text-xs border-gold/20 text-gold uppercase mt-0.5">
                                        {user.subscription?.plan_name || 'Sem Plano'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gold/5">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-black">Valor do Plano</p>
                                    <p className="text-sm font-bold text-white">
                                        R$ {user.subscription?.plan_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-black">Vencimento</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gold" />
                                        {user.subscription?.expires_at ? new Date(user.subscription.expires_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-black uppercase text-gold">Valor da Cobrança</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gold" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0,00"
                                    className="bg-black/40 border-gold/10 pl-10 h-10 text-white font-bold"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-gold/10 bg-gold/5 text-gold hover:bg-gold/10"
                                    onClick={() => setAmount(user.subscription?.plan_price?.toString() || "")}
                                >
                                    Usar valor do plano
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-gold hover:bg-gold/90 text-black font-black uppercase h-12 shadow-lg shadow-gold/20"
                            onClick={handleGeneratePix}
                            disabled={loading || !amount}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 mr-2" />
                                    Gerar Cobrança PIX Agora
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 text-center">
                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-2xl relative group">
                                <img
                                    src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                    <QrCode className="w-12 h-12 text-gold animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    readOnly
                                    className="bg-black/40 border-gold/10 text-xs pr-20 h-12 font-mono text-slate-300"
                                    value={pixData.qr_code}
                                />
                                <Button
                                    size="sm"
                                    className="absolute right-1 top-1 h-10 bg-gold text-black hover:bg-gold/80"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="border-green-500/30 text-green-500 hover:bg-green-500/10 font-black uppercase"
                                    onClick={sendToWhatsApp}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gold/30 text-gold hover:bg-gold/10 font-black uppercase"
                                    onClick={() => window.open(pixData.ticket_url, "_blank")}
                                >
                                    Link
                                </Button>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="text-slate-500 text-xs hover:text-white"
                            onClick={() => setPixData(null)}
                        >
                            Gerar novo valor
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
