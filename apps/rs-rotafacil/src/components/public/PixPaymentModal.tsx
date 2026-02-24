import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    Copy,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw,
    QrCode,
    Loader2
} from "lucide-react";
import QRCode from "qrcode";

interface PixPaymentModalProps {
    open: boolean;
    onClose: () => void;
    alunoId: string;
    tenantId: string;
    valorMatricula: number;
    nomeAluno: string;
}

export function PixPaymentModal({
    open,
    onClose,
    alunoId,
    tenantId,
    valorMatricula,
    nomeAluno
}: PixPaymentModalProps) {
    const [loading, setLoading] = useState(true);
    const [pixData, setPixData] = useState<{
        brcode?: string;
        pix_key?: string;
        pix_type?: string;
        status: string;
        amount: number;
        expires_at?: string;
    } | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (open && alunoId && tenantId) {
            loadPixCharge();
        }
    }, [open, alunoId, tenantId]);

    const loadPixCharge = async () => {
        setLoading(true);
        try {
            // Primeiro verificar se já existe cobrança pendente
            const { data: existingCharge } = await (supabase.rpc as any)('get_aluno_pix_status', {
                p_aluno_id: alunoId
            });

            if (existingCharge?.found && existingCharge.status === 'PENDING') {
                // Usar cobrança existente
                setPixData({
                    brcode: existingCharge.brcode,
                    status: existingCharge.status,
                    amount: existingCharge.amount,
                    expires_at: existingCharge.expires_at
                });

                if (existingCharge.brcode) {
                    const qrUrl = await QRCode.toDataURL(existingCharge.brcode, {
                        width: 256,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    setQrCodeUrl(qrUrl);
                }
            } else if (existingCharge?.found && existingCharge.status === 'PAID') {
                // Já foi pago
                setPixData({
                    status: 'PAID',
                    amount: existingCharge.amount
                });
            } else {
                // Gerar novo PIX via Edge Function (integração real com Mercado Pago)
                const { data, error } = await supabase.functions.invoke('matricula-pix', {
                    body: {
                        aluno_id: alunoId,
                        tenant_id: tenantId,
                        amount: valorMatricula
                    }
                });

                if (error) throw error;
                if (!data.success) throw new Error(data.error);

                setPixData({
                    brcode: data.brcode,
                    pix_key: data.pix_key,
                    pix_type: data.pix_type,
                    status: 'PENDING',
                    amount: data.amount,
                    expires_at: data.expires_at
                });

                // Gerar QR Code
                const codeText = data.brcode || data.pix_key;
                if (codeText) {
                    // Se veio qr_code_base64 do MP, usar direto
                    if (data.qr_code_base64) {
                        setQrCodeUrl(`data:image/png;base64,${data.qr_code_base64}`);
                    } else {
                        const qrUrl = await QRCode.toDataURL(codeText, {
                            width: 256,
                            margin: 2,
                            color: { dark: '#000000', light: '#ffffff' }
                        });
                        setQrCodeUrl(qrUrl);
                    }
                }
            }
        } catch (error: any) {
            console.error("Erro ao carregar PIX:", error);
            // Verificar se é erro de PIX não configurado
            if (error.message?.includes('não configurado') || error.message?.includes('not configured')) {
                setPixData(null);
            } else {
                toast({
                    title: "Erro ao gerar PIX",
                    description: error.message,
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshStatus = async () => {
        setRefreshing(true);
        try {
            const { data, error } = await (supabase.rpc as any)('get_aluno_pix_status', {
                p_aluno_id: alunoId
            });

            if (error) throw error;

            if (data.found) {
                setPixData(prev => prev ? { ...prev, status: data.status, paid_at: data.paid_at } : null);
            }

            if (data.status === 'PAID') {
                toast({
                    title: "Pagamento Confirmado!",
                    description: "Seu pagamento foi recebido com sucesso.",
                    className: "bg-green-500 text-white"
                });
            }
        } catch (error: any) {
            console.error("Erro ao verificar status:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const copyToClipboard = async () => {
        const textToCopy = pixData?.brcode || pixData?.pix_key;
        if (textToCopy) {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast({
                title: "Copiado!",
                description: "Chave PIX copiada para a área de transferência."
            });
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const getStatusBadge = () => {
        switch (pixData?.status) {
            case 'PAID':
                return <Badge className="bg-green-500 text-white gap-1"><CheckCircle2 className="w-3 h-3" /> PAGO</Badge>;
            case 'EXPIRED':
                return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> EXPIRADO</Badge>;
            default:
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500 gap-1"><Clock className="w-3 h-3" /> PENDENTE</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-black-secondary border-gold/30 max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-gold" />
                        Pagamento via PIX
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 text-gold animate-spin" />
                        <p className="text-muted-foreground">Gerando cobrança PIX...</p>
                    </div>
                ) : pixData?.status === 'PAID' ? (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-500">Pagamento Confirmado!</h3>
                        <p className="text-muted-foreground text-center">
                            O pagamento da matrícula foi recebido com sucesso.
                        </p>
                        <Button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white">
                            Fechar
                        </Button>
                    </div>
                ) : !pixData?.pix_key && !pixData?.brcode ? (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-500">PIX Não Configurado</h3>
                        <p className="text-muted-foreground text-center text-sm">
                            O transportador ainda não configurou sua chave PIX.
                            Entre em contato diretamente para realizar o pagamento.
                        </p>
                        <Button onClick={onClose} variant="outline" className="border-gold text-gold">
                            Entendido
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            {getStatusBadge()}
                        </div>

                        {/* Valor */}
                        {valorMatricula > 0 && (
                            <div className="p-4 bg-gold/10 rounded-xl border border-gold/20 text-center">
                                <p className="text-sm text-gold mb-1">Valor da Matrícula</p>
                                <p className="text-3xl font-black text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMatricula)}
                                </p>
                            </div>
                        )}

                        {/* QR Code */}
                        {qrCodeUrl && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-white rounded-2xl shadow-lg">
                                    <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
                                </div>
                                <p className="text-xs text-muted-foreground">Escaneie com o app do seu banco</p>
                            </div>
                        )}

                        {/* Copia e Cola */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gold">PIX Copia e Cola:</p>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-black rounded-lg border border-gold/20 text-sm font-mono text-white break-all">
                                    {pixData?.brcode || pixData?.pix_key}
                                </div>
                                <Button
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    className={`border-gold ${copied ? 'bg-green-500 border-green-500 text-white' : 'text-gold hover:bg-gold/10'}`}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Identificação */}
                        <div className="p-3 bg-muted/20 rounded-lg text-sm">
                            <p className="text-muted-foreground">Identificação: <span className="text-white">{nomeAluno}</span></p>
                        </div>

                        {/* Botão Já Paguei */}
                        <Button
                            onClick={refreshStatus}
                            disabled={refreshing}
                            variant="outline"
                            className="w-full border-gold text-gold hover:bg-gold/10"
                        >
                            {refreshing ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
                            ) : (
                                <><RefreshCw className="w-4 h-4 mr-2" /> Já Paguei - Verificar Status</>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
