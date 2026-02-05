import { useState, useEffect, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    PenTool,
    CheckCircle2,
    RotateCcw,
    Loader2,
    AlertCircle,
    Eraser
} from "lucide-react";

interface SignatureModalProps {
    open: boolean;
    onClose: () => void;
    alunoId: string;
    nomeAluno: string;
    contractContent?: string;
    onSigned?: () => void;
}

export function SignatureModal({
    open,
    onClose,
    alunoId,
    nomeAluno,
    contractContent = "",
    onSigned
}: SignatureModalProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [hasSignature, setHasSignature] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [existingSignature, setExistingSignature] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            checkExistingSignature();
        }
    }, [open]);

    // Reset canvas when opening
    useEffect(() => {
        if (open && !existingSignature && sigCanvas.current) {
            sigCanvas.current.clear();
            setHasSignature(false);
        }
    }, [open, existingSignature]);

    const checkExistingSignature = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.rpc as any)('get_aluno_signature', {
                p_aluno_id: alunoId
            });

            if (error) throw error;

            if (data.found) {
                setExistingSignature(data.signature_data);
            } else {
                setExistingSignature(null);
            }
        } catch (error) {
            console.error("Erro ao verificar assinatura:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearCanvas = () => {
        sigCanvas.current?.clear();
        setHasSignature(false);
    };

    const saveSignature = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;

        setSaving(true);
        try {
            // Get base64 PNG data
            const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

            const { error } = await (supabase.rpc as any)('save_aluno_signature', {
                p_aluno_id: alunoId,
                p_signature_data: signatureData,
                p_ip_address: null,
                p_user_agent: navigator.userAgent
            });

            if (error) throw error;

            toast({
                title: "Assinatura Salva!",
                description: "Sua assinatura digital foi registrada com sucesso.",
                className: "bg-green-500 text-white"
            });

            setExistingSignature(signatureData);
            onSigned?.();
        } catch (error: any) {
            console.error("Erro ao salvar assinatura:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const redoSignature = () => {
        setExistingSignature(null);
        setHasSignature(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-black-secondary border-gold/30 max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-gold" />
                        Assinatura Digital
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 text-gold animate-spin" />
                        <p className="text-muted-foreground">Carregando...</p>
                    </div>
                ) : existingSignature ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-green-500">Contrato Assinado!</h3>
                        </div>

                        <div className="p-8 bg-white rounded-xl border-2 border-green-500/20 flex justify-center">
                            <img
                                src={existingSignature}
                                alt="Sua assinatura"
                                className="max-w-full h-auto max-h-[150px]"
                            />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Assinatura eletrônica registrada</p>
                            <p className="text-xs mt-1">Responsável: {nomeAluno}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={redoSignature}
                                variant="outline"
                                className="flex-1 border-gold text-gold hover:bg-gold/10"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" /> Refazer Assinatura
                            </Button>
                            <Button
                                onClick={onClose}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Concluir
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                            <h4 className="flex items-center gap-2 text-gold font-bold mb-2">
                                <AlertCircle className="w-5 h-5" />
                                Instruções
                            </h4>
                            <p className="text-sm text-gray-300">
                                Por favor, assine no quadro branco abaixo usando o mouse ou o dedo (se estiver no celular).
                                Esta assinatura será vinculada legalmente ao contrato.
                            </p>
                            <div className="max-h-[150px] overflow-y-auto mt-3 p-3 bg-black/20 rounded border border-white/5">
                                <p className="text-xs text-muted-foreground font-mono">
                                    Resumo do Contrato: {contractContent.substring(0, 150)}...
                                </p>
                            </div>
                        </div>

                        {/* Área de Assinatura */}
                        <div className="relative">
                            <div className="border-2 border-gold/50 rounded-xl overflow-hidden bg-white shadow-inner relative group">
                                {/* Guia visual */}
                                <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-8 opacity-20">
                                    <span className="text-3xl font-handwriting text-slate-400 select-none">Assine aqui</span>
                                </div>
                                <div className="absolute inset-x-8 bottom-8 border-b-2 border-slate-200 pointer-events-none opacity-50"></div>

                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor="black"
                                    backgroundColor="transparent"
                                    canvasProps={{
                                        className: 'w-full h-[250px] cursor-crosshair touch-none',
                                        style: { width: '100%', height: '250px' }
                                    }}
                                    onEnd={() => setHasSignature(true)}
                                />
                            </div>

                            {/* Dica mobile */}
                            <p className="text-[10px] text-center text-muted-foreground mt-2 md:hidden">
                                Dica: Gire o celular para ter mais espaço
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={clearCanvas}
                                variant="destructive"
                                className="flex-[1] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            >
                                <Eraser className="w-4 h-4 mr-2" /> Limpar
                            </Button>
                            <Button
                                onClick={saveSignature}
                                disabled={!hasSignature || saving}
                                className="flex-[2] bg-gradient-gold text-black font-extrabold shadow-lg shadow-gold/20"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar e Assinar Contrato</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
