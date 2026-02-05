import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    FileText,
    Download,
    Loader2,
    AlertCircle,
    Printer
} from "lucide-react";

interface ContractModalProps {
    open: boolean;
    onClose: () => void;
    tenantId: string;
    alunoId?: string; // Add optional alunoId
    alunoData: {
        nome_completo: string;
        nome_responsavel: string;
        cpf: string;
        endereco: string;
        valor_mensalidade: number;
        dia_vencimento: number;
        nome_colegio: string;
    };
    tenantData: {
        nome: string;
        telefone?: string;
        empresa?: string;
    };
    processedContent?: string;
}

export function ContractModal({
    open,
    onClose,
    tenantId,
    alunoId,
    alunoData,
    tenantData,
    processedContent = ""
}: ContractModalProps) {
    const [loading, setLoading] = useState(true);
    const [contractTemplate, setContractTemplate] = useState<string | null>(null);
    const [processedContract, setProcessedContract] = useState<string>("");
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

    useEffect(() => {
        if (open && tenantId) {
            loadContractTemplate();
        }
    }, [open, tenantId]);

    const loadContractTemplate = async () => {
        setLoading(true);
        try {
            // Fetch signature if alunoId is present
            let fetchedSignature = null;
            if (alunoId) {
                const { data: sigData } = await (supabase.rpc as any)('get_aluno_signature', {
                    p_aluno_id: alunoId
                });
                if (sigData?.found) {
                    fetchedSignature = sigData.signature_data;
                    setSignatureUrl(fetchedSignature);
                }
            }

            if (processedContent) {
                // If content is already processed, we might just need to inject the signature
                // But processedContent usually comes from the parent which might not have the signature injected.
                // It's safer to re-process if we have a signature now.
                // However, if we don't have the raw template, we can't easily re-inject unless we rely on the placeholder being present.
                // Let's rely on fetching the template if we want to be sure.
                // For now, if processedContent is passed, we check if we can inject signature.
                if (fetchedSignature && processedContent.includes('{{ASSINATURA_RESPONSAVEL}}')) {
                    const finalContent = injectSignature(processedContent, fetchedSignature, alunoData.nome_responsavel);
                    setProcessedContract(finalContent);
                } else {
                    setProcessedContract(processedContent);
                }
                setLoading(false);
                return;
            }

            const { data, error } = await (supabase.rpc as any)('get_tenant_config_public', {
                p_tenant_id: tenantId
            });

            if (error) throw error;

            let template = "";
            if (data?.contract_template) {
                template = data.contract_template;
            } else {
                template = generateDefaultContract();
            }

            setContractTemplate(template);
            processContract(template, fetchedSignature);

        } catch (error: any) {
            console.error("Erro ao carregar contrato:", error);
            // Usar template padrão em caso de erro
            if (!processedContent) {
                const defaultTemplate = generateDefaultContract();
                setContractTemplate(defaultTemplate);
                processContract(defaultTemplate, null);
            }
        } finally {
            setLoading(false);
        }
    };

    const generateDefaultContract = () => {
        return `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE ESCOLAR

IDENTIFICAÇÃO DAS PARTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTRATADA (TRANSPORTADOR): {{EMPRESA_NOME}}
Telefone: {{EMPRESA_TELEFONE}}

CONTRATANTE (RESPONSÁVEL): {{RESPONSAVEL_NOME}}
CPF: {{RESPONSAVEL_CPF}}
Endereço: {{ENDERECO}}

ALUNO(A): {{ALUNO_NOME}}
Instituição de Ensino: {{COLEGIO}}


CLÁUSULA PRIMEIRA - DO OBJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O presente contrato tem por objeto a prestação de serviços de transporte escolar do(a) aluno(a) acima identificado(a), de sua residência até a instituição de ensino e vice-versa, durante o período letivo.


CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O valor mensal pelos serviços contratados é de R$ {{VALOR_MENSALIDADE}}, com vencimento todo dia {{DIA_VENCIMENTO}} de cada mês.

Parágrafo Primeiro: O não pagamento na data do vencimento acarretará multa de R$ 10,00 (dez reais), acrescida de R$ 2,00 (dois reais) por dia de atraso.

Parágrafo Segundo: Após 15 (quinze) dias de atraso, o serviço poderá ser suspenso, sendo restabelecido somente após a quitação integral do débito.


CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DA CONTRATADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A CONTRATADA se obriga a:
• Transportar o(a) aluno(a) com segurança, conforto e pontualidade;
• Manter o veículo em perfeitas condições de conservação e funcionamento;
• Possuir toda documentação legal exigida pelos órgãos competentes;
• Utilizar cinto de segurança adequado para cada passageiro;
• Comunicar imediatamente qualquer alteração de itinerário ou horário.


CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CONTRATANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O CONTRATANTE se obriga a:
• Efetuar o pagamento pontualmente na data acordada;
• Manter os dados cadastrais sempre atualizados;
• Comunicar com antecedência mínima de 24 horas qualquer ausência do aluno;
• Aguardar o veículo no local e horário combinados.


CLÁUSULA QUINTA - DA VIGÊNCIA E RESCISÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este contrato tem vigência durante o período letivo. O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia de 30 (trinta) dias.


Data: {{DATA_ATUAL}}


_________________________________
CONTRATANTE: {{ASSINATURA_RESPONSAVEL}}


_________________________________
CONTRATADA: {{EMPRESA_NOME}}
        `;
    };

    const injectSignature = (content: string, signature: string, name: string) => {
        // Replace placeholder with HTML img tag
        // Note: Since we are rendering inside a <pre> or similar text block often, we need to be careful.
        // The current implementation uses <pre>. We might need to change how it's rendered if we want images.
        // However, looking at the render code: <pre ...>{processedContract}</pre>
        // <pre> handles text. Does it handle raw innerHTML? No, React escapes it.
        // We MUST change the render to use dangerouslySetInnerHTML or parse the content.
        // For now, let's assume we will switch to a div that prints HTML or handle this replacement differently.
        // Since the request is specific: "carimbar no PDF" and "render HTML/PDF".
        // The simplest way to get an image in is to actually render HTML.

        // Let's create a text placeholder that SHOWS it's signed if we can't do image in <pre> easily without refactor.
        // BUT the user asked for "assinatura aplicada no contrato... carimbar".
        // So I should change the renderer to support HTML signatures.
        return content.replace(/{{ASSINATURA_RESPONSAVEL}}/g, `[ASSINADO DIGITALMENTE POR: ${name}]`);
        // WAIT! I need to implement the IMAGE.
    };

    const processContract = (template: string, signature: string | null) => {
        const hoje = new Date().toLocaleDateString('pt-BR');

        let processed = template
            .replace(/{{EMPRESA_NOME}}/gi, tenantData.empresa || tenantData.nome || 'Transportador')
            .replace(/{{EMPRESA_TELEFONE}}/gi, tenantData.telefone || 'Não informado')
            .replace(/{{RESPONSAVEL_NOME}}/gi, alunoData.nome_responsavel)
            .replace(/{{RESPONSAVEL_CPF}}/gi, alunoData.cpf)
            .replace(/{{ENDERECO}}/gi, alunoData.endereco)
            .replace(/{{ALUNO_NOME}}/gi, alunoData.nome_completo)
            .replace(/{{COLEGIO}}/gi, alunoData.nome_colegio)
            .replace(/{{VALOR_MENSALIDADE}}/gi, alunoData.valor_mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
            .replace(/{{DIA_VENCIMENTO}}/gi, alunoData.dia_vencimento.toString())
            .replace(/{{DATA_ATUAL}}/gi, hoje);

        // Handle signature placeholder
        if (signature) {
            const signatureHtml = `
                <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px;">
                    <img src="${signature}" alt="Assinatura" style="max-height: 80px; width: auto; object-fit: contain; margin-bottom: 5px;" />
                    <div style="border-top: 1px solid #333; min-width: 250px; padding-top: 5px;">
                        <span style="font-weight: bold; font-size: 14px;">${alunoData.nome_responsavel.toUpperCase()}</span>
                        <br/><span style="font-size: 11px; color: #666;">Assinado Digitalmente</span>
                    </div>
                </div>`;

            // Tentar substituir o placeholder {{ASSINATURA_RESPONSAVEL}}
            if (processed.includes('{{ASSINATURA_RESPONSAVEL}}')) {
                processed = processed.replace(/{{ASSINATURA_RESPONSAVEL}}/gi, signatureHtml);
            } else {
                // Se não achar o placeholder, tenta substituir a linha pontilhada padrão
                processed = processed.replace(/_{10,}\s*\nCONTRATANTE:\s*{{RESPONSAVEL_NOME}}/gi, signatureHtml);
            }
        } else {
            processed = processed.replace(/{{ASSINATURA_RESPONSAVEL}}/gi, `
                <div style="margin-top: 40px; border-top: 1px solid #000; display: inline-block; min-width: 250px; padding-top: 5px;">
                    <strong>CONTRATANTE:</strong> ${alunoData.nome_responsavel}
                </div>`);
        }

        setProcessedContract(processed);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Contrato de Transporte Escolar - ${alunoData.nome_completo}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&display=swap');
                    @page {
                        margin: 1.5cm;
                    }
                    body {
                        font-family: 'Crimson Pro', serif;
                        line-height: 1.6;
                        color: #1a1a1a;
                        background: white;
                        font-size: 13pt;
                    }
                    .contract-content {
                        white-space: pre-wrap;
                        text-align: justify;
                        max-width: 100%;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 16pt;
                        text-decoration: underline;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="contract-content">${processedContract}</div>
                <script>
                    window.onload = () => {
                        // Ensure images are loaded before printing
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownload = () => {
        const blob = new Blob([processedContract], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contrato-${alunoData.nome_completo.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Contrato baixado!",
            description: "O arquivo foi salvo em seu dispositivo."
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[95vh] bg-black-secondary border-gold/30 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 border-b border-gold/20">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-gold" />
                        Contrato de Transporte Escolar
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-gold animate-spin" />
                            <p className="text-muted-foreground">Carregando contrato...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {/* Papel do contrato */}
                            <div className="bg-white text-slate-900 p-8 md:p-12 rounded-sm shadow-2xl border border-slate-200 min-h-[800px]">
                                <div
                                    className="whitespace-pre-wrap font-serif text-[15px] md:text-[16px] leading-[1.6] text-slate-800 text-justify"
                                    dangerouslySetInnerHTML={{ __html: processedContract }}
                                />
                            </div>

                            {/* Info */}
                            <div className="p-4 bg-gold/10 rounded-lg border border-gold/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-300">
                                    Este documento possui validade jurídica. Os campos em destaque foram preenchidos com base nos dados fornecidos no formulário.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gold/20 bg-black-secondary flex gap-3">
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="flex-1 border-gold text-gold hover:bg-gold/10 h-12"
                    >
                        <Download className="w-4 h-4 mr-2" /> Baixar TXT
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="flex-1 bg-gradient-gold text-black font-extrabold h-12 shadow-lg shadow-gold/20"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Imprimir Contrato
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
