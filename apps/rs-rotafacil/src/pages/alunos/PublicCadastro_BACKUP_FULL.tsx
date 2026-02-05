import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Phone, CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Bus, X, QrCode, FileText, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatToPascalCase } from "@/lib/utils";
import { Header } from "@/components/ui/header";
import { PixPaymentModal } from "@/components/public/PixPaymentModal";
import { ContractModal } from "@/components/public/ContractModal";
import { SignatureModal } from "@/components/public/SignatureModal";

interface RegistrationData {
    user: {
        id: string;
        nome: string;
        avatar_url?: string;
        telefone?: string;
        empresa?: string;
    };
    vans: Array<{
        id: string;
        nome: string;
    }>;
}

export default function PublicCadastro() {
    const { identifier } = useParams();
    const navigate = useNavigate();

    const [fetchingData, setFetchingData] = useState(true);
    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [createdAlunoId, setCreatedAlunoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    // Estados dos modais
    const [showPixModal, setShowPixModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [processedContract, setProcessedContract] = useState("");

    const [formData, setFormData] = useState({
        nome_completo: "",
        nome_responsavel: "",
        cpf: "",
        email: "",
        turno: "manha",
        serie: "",
        sala: "", // Novo campo
        nome_colegio: "",
        endereco_rua: "",
        endereco_numero: "",
        endereco_bairro: "",
        endereco_cidade: "",
        endereco_estado: "",
        endereco_cep: "",
        tipo_residencia: "casa",
        whatsapp_responsavel: "",
        valor_mensalidade: 0,
        dia_vencimento: 10,
        van_id: ""
    });

    const [isCustomSerie, setIsCustomSerie] = useState(false);
    const [isCustomSala, setIsCustomSala] = useState(false);


    useEffect(() => {
        async function loadRegistrationData() {
            if (!identifier) return;

            try {
                setFetchingData(true);
                setError(null);

                const { data, error } = await (supabase.rpc as any)('get_public_registration_data', {
                    p_identifier: identifier
                });

                if (error) throw error;
                if ((data as any).error) throw new Error((data as any).error);

                const user = (data as any).user;
                const vans = (data as any).vans || [];

                setRegistrationData({ user, vans });

                if (vans.length === 1) {
                    setFormData(prev => ({ ...prev, van_id: vans[0].id }));
                }
            } catch (err: any) {
                console.error("Erro ao carregar dados:", err);
                setError(err.message || "Erro ao carregar dados do transportador.");
            } finally {
                setFetchingData(false);
            }
        }

        loadRegistrationData();
    }, [identifier]);

    // Carregar e processar contrato
    useEffect(() => {
        if (success && registrationData) {
            loadAndProcessContract();
        }
    }, [success, registrationData]);

    const loadAndProcessContract = async () => {
        if (!registrationData) return;

        try {
            const { data, error } = await (supabase.rpc as any)('get_tenant_config_public', {
                p_tenant_id: registrationData.user.id
            });

            let template = "";
            if ((data as any)?.contract_template) {
                template = (data as any).contract_template;
            } else {
                template = getDefaultContractTemplate();
            }

            const processed = processContractVariables(template);
            setProcessedContract(processed);
        } catch (err) {
            console.error("Erro ao carregar contrato:", err);
            setProcessedContract(processContractVariables(getDefaultContractTemplate()));
        }
    };

    const processContractVariables = (template: string) => {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const enderecoCompleto = `${formData.endereco_rua}, ${formData.endereco_numero} - ${formData.endereco_bairro}, ${formData.endereco_cidade}/${formData.endereco_estado}`;

        return template
            .replace(/{{EMPRESA_NOME}}/gi, registrationData?.user.empresa || registrationData?.user.nome || 'Transportador')
            .replace(/{{EMPRESA_TELEFONE}}/gi, registrationData?.user.telefone || 'Não informado')
            .replace(/{{RESPONSAVEL_NOME}}/gi, formData.nome_responsavel)
            .replace(/{{RESPONSAVEL_CPF}}/gi, formData.cpf)
            .replace(/{{ENDERECO}}/gi, enderecoCompleto)
            .replace(/{{ALUNO_NOME}}/gi, formData.nome_completo)
            .replace(/{{COLEGIO}}/gi, formData.nome_colegio)
            .replace(/{{VALOR_MENSALIDADE}}/gi, formData.valor_mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
            .replace(/{{DIA_VENCIMENTO}}/gi, formData.dia_vencimento.toString())
            .replace(/{{DATA_ATUAL}}/gi, hoje);
    };

    const getDefaultContractTemplate = () => {
        return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE ESCOLAR

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
CONTRATANTE: {{RESPONSAVEL_NOME}}


_________________________________
CONTRATADA: {{EMPRESA_NOME}}`;
    };

    const handleCepBlur = async () => {
        const cep = formData.endereco_cep.replace(/\D/g, "");
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco_rua: data.logradouro,
                        endereco_bairro: data.bairro,
                        endereco_cidade: data.localidade,
                        endereco_estado: data.uf
                    }));
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.van_id) {
            toast({
                title: "Selecione uma van",
                description: "É necessário selecionar para qual van o aluno será cadastrado.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await (supabase.rpc as any)('create_aluno_public', {
                p_aluno_data: formData
            });

            if (error) throw error;

            if (data && (data as any).success) {
                setCreatedAlunoId((data as any).aluno_id || "ID Pendente");

                // Gerar senha e criar conta do responsável
                const password = Math.random().toString(36).slice(-8);
                setGeneratedPassword(password);

                try {
                    await supabase.functions.invoke('create-responsavel-account', {
                        body: {
                            email: formData.email,
                            password: password,
                            nome: formData.nome_responsavel,
                            aluno_id: (data as any).aluno_id,
                            cpf: formData.cpf
                        }
                    });
                } catch (accErr) {
                    console.error("Erro ao criar conta do responsável:", accErr);
                    // Não bloqueia o sucesso do aluno, mas logamos o erro
                }

                setSuccess(true);
                toast({
                    title: "Cadastro realizado!",
                    description: "Seu cadastro foi enviado com sucesso.",
                    className: "bg-green-500 text-white"
                });
            } else {
                throw new Error((data as any)?.message || "Erro ao processar cadastro.");
            }
        } catch (err: any) {
            console.error("Erro ao cadastrar:", err);
            toast({
                title: "Erro no cadastro",
                description: err.message || "Não foi possível completar o cadastro. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gold font-medium">Carregando formulário...</p>
                </div>
            </div>
        );
    }

    if (error || !registrationData) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-500/50 bg-black-secondary shadow-2xl shadow-red-500/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-red-500">Link Inválido ou Expirado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-muted-foreground">
                            {error || "O link que você seguiu pode estar incorreto ou não existe mais."}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-500 hover:bg-red-600 font-semibold"
                        >
                            Tentar Novamente
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        const enderecoCompleto = `${formData.endereco_rua}, ${formData.endereco_numero} - ${formData.endereco_bairro}, ${formData.endereco_cidade}/${formData.endereco_estado}`;

        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-gold/50 bg-black-secondary shadow-2xl shadow-gold/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-gold" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent italic">
                            Cadastro Finalizado!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 bg-gold/5 rounded-2xl border border-gold/20 text-center space-y-4 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] opacity-70">Responsável</p>
                                <p className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                    {formData.nome_responsavel}
                                </p>
                            </div>

                            <div className="w-16 h-[2px] bg-gold/20 mx-auto rounded-full" />

                            <div className="space-y-1">
                                <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] opacity-70">Aluno(a)</p>
                                <p className="text-2xl font-black text-gold italic uppercase tracking-tighter">
                                    {formData.nome_completo}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                            <p className="text-white font-bold text-lg">Cadastro realizado com sucesso!</p>
                            <p className="text-muted-foreground text-sm">
                                Os dados foram enviados para o transportador <strong>{registrationData?.user.nome}</strong>.
                            </p>
                        </div>

                        {/* Dados de Acesso ao Escritório do Pai */}
                        <div className="p-5 bg-black-primary/50 rounded-2xl border border-gold/30 space-y-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <User className="w-12 h-12 text-gold" />
                            </div>
                            <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Dados do Escritório Virtual
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">E-mail:</span>
                                    <span className="text-white font-mono font-bold select-all">{formData.email}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Senha:</span>
                                    <span className="text-gold font-mono font-bold text-lg select-all bg-gold/10 px-2 rounded-md border border-gold/20">
                                        {generatedPassword || "••••••••"}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic mt-2">
                                * Guarde sua senha para acessar seu painel financeiro e de presenças futuramente.
                            </p>
                        </div>

                        {/* Botão Acessar Escritório Virtual */}
                        <Button
                            onClick={() => window.location.href = "/responsavel/login"}
                            className="w-full h-14 bg-black-secondary border-2 border-gold text-gold hover:bg-gold hover:text-black font-black text-lg transition-all shadow-xl shadow-gold/10"
                        >
                            <Bus className="w-6 h-6 mr-3" />
                            Acessar Meu Painel (Escritório)
                        </Button>

                        {/* Seção: Próximos Passos */}
                        <div className="space-y-3 pt-4 border-t border-gold/20">
                            <h3 className="text-lg font-bold text-gold text-center uppercase tracking-wide">
                                Próximos Passos
                            </h3>

                            {/* Botão PIX */}
                            <Button
                                onClick={() => setShowPixModal(true)}
                                className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-lg"
                            >
                                <QrCode className="w-6 h-6 mr-3" />
                                Pagar com PIX
                            </Button>

                            {/* Botão Contrato */}
                            <Button
                                onClick={() => setShowContractModal(true)}
                                variant="outline"
                                className="w-full h-14 border-2 border-gold text-gold hover:bg-gold/10 font-bold text-lg"
                            >
                                <FileText className="w-6 h-6 mr-3" />
                                Imprimir Contrato
                            </Button>

                            {/* Botão Assinatura */}
                            <Button
                                onClick={() => setShowSignatureModal(true)}
                                variant="outline"
                                className={cn(
                                    "w-full h-14 font-bold text-lg",
                                    isSigned
                                        ? "border-2 border-green-500 text-green-500 bg-green-500/10"
                                        : "border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                )}
                            >
                                <PenTool className="w-6 h-6 mr-3" />
                                {isSigned ? "✓ Contrato Assinado" : "Assinar Digitalmente"}
                            </Button>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-white"
                        >
                            Nova Matrícula
                        </Button>
                    </CardContent>
                </Card>

                {/* Modais */}
                {createdAlunoId && registrationData && (
                    <>
                        <PixPaymentModal
                            open={showPixModal}
                            onClose={() => setShowPixModal(false)}
                            alunoId={createdAlunoId}
                            tenantId={registrationData.user.id}
                            valorMatricula={formData.valor_mensalidade}
                            nomeAluno={formData.nome_completo}
                        />

                        <ContractModal
                            open={showContractModal}
                            onClose={() => setShowContractModal(false)}
                            tenantId={registrationData.user.id}
                            alunoId={createdAlunoId || undefined}
                            alunoData={{
                                nome_completo: formData.nome_completo,
                                nome_responsavel: formData.nome_responsavel,
                                cpf: formData.cpf,
                                endereco: enderecoCompleto,
                                valor_mensalidade: formData.valor_mensalidade,
                                dia_vencimento: formData.dia_vencimento,
                                nome_colegio: formData.nome_colegio
                            }}
                            tenantData={{
                                nome: registrationData.user.nome,
                                telefone: registrationData.user.telefone,
                                empresa: registrationData.user.empresa
                            }}
                            processedContent={processedContract}
                        />

                        <SignatureModal
                            open={showSignatureModal}
                            onClose={() => setShowSignatureModal(false)}
                            alunoId={createdAlunoId}
                            nomeAluno={formData.nome_responsavel}
                            contractContent={processedContract}
                            onSigned={() => setIsSigned(true)}
                        />
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black-primary pb-12">
            <Header />

            <div className="max-w-4xl mx-auto px-4 pt-12">
                {/* Header do Transportador */}
                <div className="mb-8 flex items-center gap-6 p-6 rounded-3xl bg-black-secondary border border-gold/20 shadow-xl">
                    {registrationData.user.avatar_url ? (
                        <img
                            src={registrationData.user.avatar_url}
                            alt={registrationData.user.nome}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-gold shadow-lg"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-lg">
                            <User className="w-10 h-10 text-black" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight">
                            {registrationData.user.nome}
                        </h2>
                        <p className="text-gold font-medium flex items-center gap-1 opacity-80 mt-1 uppercase text-xs tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> Transportador Verificado
                        </p>
                    </div>
                </div>

                <Card className="border-gold/20 bg-black-secondary overflow-hidden rounded-3xl shadow-2xl">
                    <CardHeader className="bg-gradient-gold p-6 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black hover:bg-black/10 transition-all"
                            title="Voltar"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle className="text-black flex items-center gap-3">
                            <div className="p-2 bg-black/10 rounded-lg">
                                <User className="w-6 h-6 text-black" />
                            </div>
                            Matrícula Escolar Online
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="divide-y divide-border/30">
                            {/* Seleção de Van */}
                            <div className="p-8 space-y-4 bg-gold/5 border-b border-gold/10">
                                <Label htmlFor="van_id" className="text-xl font-black text-gold flex items-center gap-3 uppercase tracking-tighter">
                                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                                        <Bus className="w-6 h-6 text-gold" />
                                    </div>
                                    Selecione seu Motorista *
                                </Label>

                                {registrationData.vans.length > 0 ? (
                                    <select
                                        id="van_id"
                                        required
                                        className="flex h-12 w-full items-center justify-between rounded-xl border-2 border-gold/30 bg-black-secondary px-4 py-2 text-lg ring-offset-background focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold shadow-lg transition-all"
                                        value={formData.van_id}
                                        onChange={(e) => setFormData({ ...formData, van_id: e.target.value })}
                                        style={{
                                            background: '#1a1b23',
                                            color: '#ffffff',
                                            appearance: 'auto'
                                        }}
                                    >
                                        <option value="" disabled style={{ background: '#1a1b23', color: '#9ca3af' }}>Selecione uma van</option>
                                        {registrationData.vans.map(van => (
                                            <option key={van.id} value={van.id} style={{ background: '#1a1b23', color: '#ffffff' }}>
                                                {van.nome}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-6 rounded-2xl border-2 border-dashed border-red-500/30 bg-red-500/5 flex flex-col items-center gap-3 text-center animate-in fade-in">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                        <div>
                                            <p className="text-red-500 font-bold uppercase text-xs tracking-widest">Atenção</p>
                                            <p className="text-muted-foreground text-sm">Nenhum veículo disponível para cadastro no momento.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-6">
                                    {/* Seção 1: Dados do Aluno */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-l-4 border-gold pl-3">
                                            <User className="w-4 h-4 text-gold" /> Dados do Aluno
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nome_completo">Nome Completo do Aluno *</Label>
                                                <Input
                                                    id="nome_completo"
                                                    required
                                                    value={formData.nome_completo}
                                                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, nome_completo: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="serie">Série *</Label>
                                                {!isCustomSerie ? (
                                                    <select
                                                        id="serie"
                                                        required
                                                        className="flex h-10 w-full items-center justify-between rounded-md border border-gold/30 bg-dark-lighter px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium"
                                                        style={{
                                                            background: '#1a1b23',
                                                            color: '#ffffff'
                                                        }}
                                                        value={formData.serie}
                                                        onChange={(e) => {
                                                            if (e.target.value === "custom") {
                                                                setIsCustomSerie(true);
                                                                setFormData({ ...formData, serie: "" });
                                                            } else {
                                                                setFormData({ ...formData, serie: e.target.value });
                                                            }
                                                        }}
                                                    >
                                                        <option value="" disabled style={{ background: '#1a1b23', color: '#9ca3af' }}>Selecione a série</option>
                                                        <optgroup label="Educação Infantil" style={{ background: '#1a1b23', color: '#fbbf24', fontWeight: 'bold' }}>
                                                            <option value="Berçário" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Berçário</option>
                                                            <option value="Maternal" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Maternal</option>
                                                            <option value="Infantil 2" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 2</option>
                                                            <option value="Infantil 3" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 3</option>
                                                            <option value="Infantil 4" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 4</option>
                                                            <option value="Infantil 5" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 5</option>
                                                            <option value="Jardim" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Jardim</option>
                                                        </optgroup>
                                                        <optgroup label="Ensino Fundamental" style={{ background: '#1a1b23', color: '#60a5fa', fontWeight: 'bold' }}>
                                                            <option value="1º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>1º Ano</option>
                                                            <option value="2º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>2º Ano</option>
                                                            <option value="3º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>3º Ano</option>
                                                            <option value="4º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>4º Ano</option>
                                                            <option value="5º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>5º Ano</option>
                                                            <option value="6º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>6º Ano</option>
                                                            <option value="7º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>7º Ano</option>
                                                            <option value="8º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>8º Ano</option>
                                                            <option value="9º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>9º Ano</option>
                                                        </optgroup>
                                                        <optgroup label="Ensino Médio" style={{ background: '#1a1b23', color: '#34d399', fontWeight: 'bold' }}>
                                                            <option value="1º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>1º Médio</option>
                                                            <option value="2º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>2º Médio</option>
                                                            <option value="3º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>3º Médio</option>
                                                        </optgroup>
                                                        <option value="custom" style={{ background: '#1a1b23', color: '#gold', fontWeight: 'bold' }}>➕ Outra (Digitar)</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Digite a série..."
                                                            value={formData.serie}
                                                            onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                                                            className="bg-background/50 border-gold focus:border-gold animate-in fade-in slide-in-from-left-2"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setIsCustomSerie(false);
                                                                setFormData({ ...formData, serie: "" });
                                                            }}
                                                            className="text-gold hover:bg-gold/10"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="sala">Sala / Turma *</Label>
                                                {!isCustomSala ? (
                                                    <select
                                                        id="sala"
                                                        required
                                                        className="flex h-10 w-full items-center justify-between rounded-md border border-gold/30 bg-dark-lighter px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium shadow-sm transition-all"
                                                        style={{
                                                            background: '#1a1b23',
                                                            color: '#ffffff'
                                                        }}
                                                        value={formData.sala}
                                                        onChange={(e) => {
                                                            if (e.target.value === "custom") {
                                                                setIsCustomSala(true);
                                                                setFormData({ ...formData, sala: "" });
                                                            } else {
                                                                setFormData({ ...formData, sala: e.target.value });
                                                            }
                                                        }}
                                                    >
                                                        <option value="" disabled style={{ background: '#1a1b23', color: '#9ca3af' }}>Selecione a sala</option>
                                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(letra => (
                                                            <option key={letra} value={letra} style={{ background: '#1a1b23', color: '#ffffff' }}>Sala {letra}</option>
                                                        ))}
                                                        <option value="custom" style={{ background: '#1a1b23', color: '#gold', fontWeight: 'bold' }}>➕ Digitar Sala</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Ex: Sala 202, Turma B4..."
                                                            value={formData.sala}
                                                            onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                                                            className="bg-background/50 border-gold focus:border-gold animate-in fade-in slide-in-from-left-2"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setIsCustomSala(false);
                                                                setFormData({ ...formData, sala: "" });
                                                            }}
                                                            className="text-gold hover:bg-gold/10"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nome_colegio">Nome do Colégio *</Label>
                                                <Input
                                                    id="nome_colegio"
                                                    required
                                                    placeholder="Ex: Colégio São Lucas, Escola ABC"
                                                    value={formData.nome_colegio}
                                                    onChange={(e) => setFormData({ ...formData, nome_colegio: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, nome_colegio: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="turno">Turno *</Label>
                                                <select
                                                    id="turno"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-gold/30 bg-dark-lighter px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium"
                                                    style={{
                                                        background: '#1a1b23',
                                                        color: '#ffffff'
                                                    }}
                                                    value={formData.turno}
                                                    onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                                                    required
                                                >
                                                    <option value="manha" style={{ background: '#1a1b23', color: '#ffffff' }}>Manhã</option>
                                                    <option value="tarde" style={{ background: '#1a1b23', color: '#ffffff' }}>Tarde</option>
                                                    <option value="integral" style={{ background: '#1a1b23', color: '#ffffff' }}>Integral</option>
                                                    <option value="noite" style={{ background: '#1a1b23', color: '#ffffff' }}>Noite</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção 2: Endereço */}
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-l-4 border-gold pl-3">
                                            <MapPin className="w-4 h-4 text-gold" /> Endereço Residencial
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="rua">Rua *</Label>
                                                <Input
                                                    id="rua"
                                                    required
                                                    value={formData.endereco_rua}
                                                    onChange={(e) => setFormData({ ...formData, endereco_rua: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, endereco_rua: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="numero">Número *</Label>
                                                <Input
                                                    id="numero"
                                                    required
                                                    value={formData.endereco_numero}
                                                    onChange={(e) => setFormData({ ...formData, endereco_numero: e.target.value })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bairro">Bairro *</Label>
                                                <Input
                                                    id="bairro"
                                                    required
                                                    value={formData.endereco_bairro}
                                                    onChange={(e) => setFormData({ ...formData, endereco_bairro: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, endereco_bairro: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="cidade">Cidade *</Label>
                                                <Input
                                                    id="cidade"
                                                    required
                                                    value={formData.endereco_cidade}
                                                    onChange={(e) => setFormData({ ...formData, endereco_cidade: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, endereco_cidade: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="estado">Estado *</Label>
                                                <Input
                                                    id="estado"
                                                    required
                                                    placeholder="Ex: SP, RJ, MG"
                                                    value={formData.endereco_estado}
                                                    onChange={(e) => setFormData({ ...formData, endereco_estado: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, endereco_estado: e.target.value.toUpperCase() })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="cep">CEP *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="cep"
                                                        required
                                                        placeholder="00000-000"
                                                        value={formData.endereco_cep}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, "");
                                                            const formatted = value.replace(/^(\d{5})(\d{3})/, "$1-$2");
                                                            setFormData({ ...formData, endereco_cep: formatted });
                                                        }}
                                                        onBlur={handleCepBlur}
                                                        maxLength={9}
                                                        className={cn("bg-background/50 border-gold/30 focus:border-gold", cepLoading && "opacity-50")}
                                                    />
                                                    {cepLoading && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="tipo_residencia">Tipo de Residência</Label>
                                                <select
                                                    id="tipo_residencia"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-gold/30 bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                                    value={formData.tipo_residencia}
                                                    onChange={(e) => setFormData({ ...formData, tipo_residencia: e.target.value })}
                                                >
                                                    <option value="casa">Casa</option>
                                                    <option value="apartamento">Apartamento</option>
                                                    <option value="outro">Outro</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção 3: Responsável */}
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-l-4 border-gold pl-3">
                                            <Phone className="w-4 h-4 text-gold" /> Dados do Responsável
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                                                <Input
                                                    id="nome_responsavel"
                                                    required
                                                    value={formData.nome_responsavel}
                                                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                                                    onBlur={(e) => setFormData({ ...formData, nome_responsavel: formatToPascalCase(e.target.value) })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cpf">CPF do Responsável *</Label>
                                                <Input
                                                    id="cpf"
                                                    required
                                                    placeholder="000.000.000-00"
                                                    value={formData.cpf}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, "");
                                                        const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
                                                        setFormData({ ...formData, cpf: formatted });
                                                    }}
                                                    maxLength={14}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email do Responsável *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="exemplo@email.com"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="whatsapp">WhatsApp do Responsável *</Label>
                                                <Input
                                                    id="whatsapp"
                                                    required
                                                    type="tel"
                                                    placeholder="(00) 00000-0000"
                                                    value={formData.whatsapp_responsavel}
                                                    onChange={(e) => setFormData({ ...formData, whatsapp_responsavel: e.target.value })}
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção 4: Financeiro */}
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-l-4 border-gold pl-3">
                                            <CreditCard className="w-4 h-4 text-gold" /> Contato e Financeiro
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="valor_mensalidade">Valor da Mensalidade *</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <Input
                                                        id="valor_mensalidade"
                                                        className="pl-9 bg-background/50 border-gold/30 focus:border-gold"
                                                        value={formData.valor_mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, "");
                                                            const numberValue = parseFloat(value) / 100;
                                                            setFormData({ ...formData, valor_mensalidade: numberValue });
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                                                <Input
                                                    id="dia_vencimento"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={formData.dia_vencimento || ""}
                                                    onChange={(e) => setFormData({ ...formData, dia_vencimento: parseInt(e.target.value) || 0 })}
                                                    placeholder="Dia (1-31)"
                                                    required
                                                    className="bg-background/50 border-gold/30 focus:border-gold"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">Dia do mês para vencimento da fatura</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg bg-gradient-gold text-black-primary font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-gold/20"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    Processando Cadastro...
                                                </span>
                                            ) : (
                                                "Confirmar Cadastro"
                                            )}
                                        </Button>
                                        <p className="text-center text-xs text-muted-foreground mt-4">
                                            Ao confirmar, você concorda com o envio destes dados para o responsável pelo transporte escolar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
