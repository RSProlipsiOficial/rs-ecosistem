import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Check,
    Eye,
    Loader2,
    Upload,
    AlertCircle,
    FileCheck
} from "lucide-react";

interface ContractTemplate {
    id: string;
    name: string;
    content_preview: string;
    version: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Variáveis disponíveis para inserir no contrato
const AVAILABLE_VARIABLES = [
    { key: '{{ALUNO_NOME}}', label: 'Nome do Aluno' },
    { key: '{{RESPONSAVEL_NOME}}', label: 'Nome do Responsável' },
    { key: '{{RESPONSAVEL_CPF}}', label: 'CPF do Responsável' },
    { key: '{{ENDERECO}}', label: 'Endereço' },
    { key: '{{VALOR_MENSALIDADE}}', label: 'Valor da Mensalidade' },
    { key: '{{DATA_ATUAL}}', label: 'Data Atual' },
    { key: '{{DIA_VENCIMENTO}}', label: 'Dia de Vencimento' },
    { key: '{{COLEGIO}}', label: 'Nome do Colégio' },
    { key: '{{EMPRESA_NOME}}', label: 'Nome da Empresa' },
    { key: '{{EMPRESA_TELEFONE}}', label: 'Telefone da Empresa' },
];

export function ContractManager() {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<{
        id?: string;
        name: string;
        content: string;
    } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState("");

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.rpc as any)('get_contract_templates');
            if (error) throw error;
            setTemplates(data || []);
        } catch (error: any) {
            console.error("Erro ao carregar templates:", error);
            toast({
                title: "Erro ao carregar templates",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTemplateForEdit = async (templateId: string) => {
        try {
            const { data, error } = await (supabase.rpc as any)('get_contract_template', {
                p_template_id: templateId
            });
            if (error) throw error;
            setEditingTemplate({
                id: data.id,
                name: data.name,
                content: data.content
            });
            setShowEditor(true);
        } catch (error: any) {
            console.error("Erro ao carregar template:", error);
            toast({
                title: "Erro ao carregar template",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const saveTemplate = async () => {
        if (!editingTemplate) return;
        setSaving(true);
        try {
            const { data, error } = await (supabase.rpc as any)('save_contract_template', {
                p_id: editingTemplate.id || null,
                p_name: editingTemplate.name,
                p_content: editingTemplate.content
            });
            if (error) throw error;

            toast({
                title: "Template salvo!",
                description: `Versão ${data.version} salva com sucesso.`,
                className: "bg-green-500 text-white"
            });

            setShowEditor(false);
            setEditingTemplate(null);
            loadTemplates();
        } catch (error: any) {
            console.error("Erro ao salvar template:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const activateTemplate = async (templateId: string) => {
        try {
            const { error } = await (supabase.rpc as any)('activate_contract_template', {
                p_template_id: templateId
            });
            if (error) throw error;

            toast({
                title: "Template ativado!",
                description: "Este template será usado no cadastro público.",
                className: "bg-green-500 text-white"
            });

            loadTemplates();
        } catch (error: any) {
            toast({
                title: "Erro ao ativar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!confirm("Tem certeza que deseja excluir este template?")) return;

        try {
            const { error } = await (supabase.rpc as any)('delete_contract_template', {
                p_template_id: templateId
            });
            if (error) throw error;

            toast({ title: "Template excluído!" });
            loadTemplates();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const openPreview = (content: string) => {
        // Substituir variáveis por dados fictícios
        let preview = content;
        preview = preview.replace(/{{ALUNO_NOME}}/gi, 'João da Silva');
        preview = preview.replace(/{{RESPONSAVEL_NOME}}/gi, 'Maria da Silva');
        preview = preview.replace(/{{RESPONSAVEL_CPF}}/gi, '123.456.789-00');
        preview = preview.replace(/{{ENDERECO}}/gi, 'Rua Exemplo, 100 - Centro, São Paulo/SP');
        preview = preview.replace(/{{VALOR_MENSALIDADE}}/gi, '300,00');
        preview = preview.replace(/{{DATA_ATUAL}}/gi, new Date().toLocaleDateString('pt-BR'));
        preview = preview.replace(/{{DIA_VENCIMENTO}}/gi, '10');
        preview = preview.replace(/{{COLEGIO}}/gi, 'Colégio Exemplo');
        preview = preview.replace(/{{EMPRESA_NOME}}/gi, 'Transportadora Rota Fácil');
        preview = preview.replace(/{{EMPRESA_TELEFONE}}/gi, '(11) 99999-9999');

        setPreviewContent(preview);
        setShowPreview(true);
    };

    const insertVariable = (variable: string) => {
        if (!editingTemplate) return;
        setEditingTemplate(prev => prev ? {
            ...prev,
            content: prev.content + ' ' + variable
        } : null);
    };

    const createNewTemplate = () => {
        setEditingTemplate({
            name: 'Novo Contrato',
            content: getDefaultContractTemplate()
        });
        setShowEditor(true);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gold">Templates de Contrato</h2>
                    <p className="text-muted-foreground text-sm">
                        Gerencie os modelos de contrato usados no cadastro público
                    </p>
                </div>
                <Button
                    onClick={createNewTemplate}
                    className="bg-gradient-gold text-black font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" /> Novo Template
                </Button>
            </div>

            {/* Info se não houver templates */}
            {templates.length === 0 && (
                <Card className="border-gold/30 bg-gold/5">
                    <CardContent className="p-6 text-center">
                        <FileText className="w-12 h-12 text-gold mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-gold mb-2">Nenhum template criado</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Crie um template de contrato para usar no cadastro de alunos.
                        </p>
                        <Button onClick={createNewTemplate} className="bg-gold text-black font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Template
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Lista de templates */}
            <div className="grid gap-4">
                {templates.map(template => (
                    <Card
                        key={template.id}
                        className={`border ${template.is_active ? 'border-green-500/50 bg-green-500/5' : 'border-border'}`}
                    >
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${template.is_active ? 'bg-green-500/20' : 'bg-muted'}`}>
                                        <FileText className={`w-5 h-5 ${template.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{template.name}</h3>
                                            <Badge variant="outline" className="text-xs">v{template.version}</Badge>
                                            {template.is_active && (
                                                <Badge className="bg-green-500 text-white text-xs">
                                                    <Check className="w-3 h-3 mr-1" /> Ativo
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {template.content_preview}...
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Atualizado em {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadTemplateForEdit(template.id)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        title="Pré-visualizar Contrato Completo"
                                        onClick={async () => {
                                            try {
                                                const { data, error } = await (supabase.rpc as any)('get_contract_template', {
                                                    p_template_id: template.id
                                                });
                                                if (error) throw error;
                                                openPreview(data.content);
                                            } catch (error: any) {
                                                toast({ title: "Erro ao abrir preview", description: error.message, variant: "destructive" });
                                            }
                                        }}
                                    >
                                        <Eye className="w-4 h-4 text-gold" />
                                    </Button>
                                    {!template.is_active && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-green-500 text-green-500 hover:bg-green-500/10"
                                                onClick={() => activateTemplate(template.id)}
                                            >
                                                <FileCheck className="w-4 h-4 mr-1" /> Ativar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-500 text-red-500 hover:bg-red-500/10"
                                                onClick={() => deleteTemplate(template.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Editor */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black-secondary border-gold/30">
                    <DialogHeader>
                        <DialogTitle className="text-gold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {editingTemplate?.id ? 'Editar Template' : 'Novo Template'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome do Template</Label>
                            <Input
                                value={editingTemplate?.name || ''}
                                onChange={e => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                                placeholder="Ex: Contrato Padrão 2024"
                                className="bg-background border-gold/30"
                            />
                        </div>

                        {/* Variáveis disponíveis */}
                        <div className="p-3 bg-gold/10 rounded-lg border border-gold/20">
                            <p className="text-sm font-medium text-gold mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Variáveis Dinâmicas (clique para inserir)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_VARIABLES.map(v => (
                                    <Button
                                        key={v.key}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-gold/30 text-gold hover:bg-gold/10"
                                        onClick={() => insertVariable(v.key)}
                                    >
                                        {v.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Conteúdo do Contrato</Label>
                            <Textarea
                                value={editingTemplate?.content || ''}
                                onChange={e => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                                placeholder="Digite o texto do contrato..."
                                className="min-h-[400px] font-mono text-sm bg-background border-gold/30"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowEditor(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => openPreview(editingTemplate?.content || '')}
                        >
                            <Eye className="w-4 h-4 mr-2" /> Pré-visualizar
                        </Button>
                        <Button
                            onClick={saveTemplate}
                            disabled={saving}
                            className="bg-gradient-gold text-black font-bold"
                        >
                            {saving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                            ) : (
                                <><Check className="w-4 h-4 mr-2" /> Salvar Template</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Preview Profissional */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-stone-100 border-none p-0 flex flex-col">
                    <DialogHeader className="p-6 bg-stone-200/50 border-b border-stone-300">
                        <DialogTitle className="text-stone-800 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Pré-visualização do Documento
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-stone-100">
                        {/* Papel do Contrato */}
                        <Card className="max-w-[800px] mx-auto bg-white shadow-2xl border border-stone-300 rounded-none p-12 min-h-[1000px]">
                            <div className="prose prose-stone max-w-none">
                                <div
                                    className="whitespace-pre-wrap text-stone-900 leading-relaxed text-justify"
                                    style={{
                                        fontFamily: "'Crimson Pro', serif",
                                        fontSize: '16px'
                                    }}
                                >
                                    {previewContent}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <DialogFooter className="p-4 bg-stone-200/50 border-t border-stone-300">
                        <Button
                            onClick={() => setShowPreview(false)}
                            className="bg-stone-800 hover:bg-stone-900 text-white font-bold px-8"
                        >
                            Fechar Visualização
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
