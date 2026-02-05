import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Bot, Calendar, DollarSign, Settings, PlayCircle, PauseCircle, Download, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: 'pix' | 'billing' | 'festivities';
    is_active: boolean;
    required_credentials: string[];
    n8n_workflow_id?: string;
}

interface WorkflowStats {
    total_executions: number;
    success_rate: number;
    last_execution?: string;
}

export default function AutomacoesIndex() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [stats, setStats] = useState<Record<string, WorkflowStats>>({
        billing: { total_executions: 0, success_rate: 0 },
        festivities: { total_executions: 0, success_rate: 0 },
        pix: { total_executions: 0, success_rate: 0 }
    });

    useEffect(() => {
        loadTemplates();
        loadStats();
    }, []);

    const loadTemplates = async () => {
        try {
            // Por enquanto, retorna array vazio até a migração ser aplicada
            // Depois da migração, isso vai buscar do banco
            setTemplates([]);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Mock de stats até integração completa
            setStats({
                billing: { total_executions: 0, success_rate: 0 },
                festivities: { total_executions: 0, success_rate: 0 },
                pix: { total_executions: 0, success_rate: 0 }
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setStats({
                billing: { total_executions: 0, success_rate: 0 },
                festivities: { total_executions: 0, success_rate: 0 },
                pix: { total_executions: 0, success_rate: 0 }
            });
        }
    };

    const installWorkflow = async (template: WorkflowTemplate) => {
        setInstallingId(template.id);
        try {
            toast({
                title: "Funcionalidade em Desenvolvimento",
                description: "Primeiro aplique a migração SQL. Depois essa função instalará os workflows no n8n automaticamente.",
                variant: "default"
            });
        } catch (error) {
            console.error('Erro ao instalar workflow:', error);
            toast({
                title: "Erro na Instalação",
                description: "Verifique se o n8n está rodando na porta 5678.",
                variant: "destructive"
            });
        } finally {
            setInstallingId(null);
        }
    };

    const toggleWorkflow = async (template: WorkflowTemplate) => {
        try {
            toast({
                title: "Funcionalidade em Desenvolvimento",
                description: "Após aplicar a migração, você poderá ativar/desativar workflows.",
                variant: "default"
            });
        } catch (error) {
            console.error('Erro ao alternar workflow:', error);
            toast({
                title: "Erro",
                description: "Não foi possível alterar o status do workflow.",
                variant: "destructive"
            });
        }
    };

    const getTemplateFileName = (category: string): string => {
        switch (category) {
            case 'pix': return 'pix-confirmacao-automatica';
            case 'billing': return 'cobrancas-automaticas';
            case 'festivities': return 'festividades-automaticas';
            default: return '';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'pix': return <DollarSign className="w-5 h-5" />;
            case 'billing': return <Calendar className="w-5 h-5" />;
            case 'festivities': return <Bot className="w-5 h-5" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'pix': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'billing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'festivities': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gold flex items-center gap-2">
                        <Zap className="w-8 h-8" />
                        Automações Inteligentes
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Workflows n8n integrados com WhatsApp e Sistema de Pagamentos
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                    onClick={() => window.open('http://localhost:5007', '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir RS Auto
                </Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-dark-lighter border-gold/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Total de Envios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gold">
                            {(stats.billing?.total_executions || 0) + (stats.festivities?.total_executions || 0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                    </CardContent>
                </Card>

                <Card className="bg-dark-lighter border-gold/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Taxa de Sucesso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">
                            {Math.round(((stats.billing?.success_rate || 0) + (stats.festivities?.success_rate || 0)) / 2)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Média geral</p>
                    </CardContent>
                </Card>

                <Card className="bg-dark-lighter border-gold/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Workflows Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">
                            {templates.filter(t => t.is_active).length}/{templates.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Automações funcionando</p>
                    </CardContent>
                </Card>
            </div>

            {/* Workflows Grid */}
            {templates.length === 0 ? (
                <Card className="bg-dark-lighter border-gold/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gold">
                            <AlertCircle className="w-6 h-6" />
                            Configuração Inicial Necessária
                        </CardTitle>
                        <CardDescription>
                            Para usar as automações, você precisa aplicar a migração do banco de dados primeiro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                            <p className="text-sm text-white font-semibold">Passo 1: Aplicar Migração SQL</p>
                            <p className="text-xs text-gray-400">
                                Abra o Supabase Dashboard e execute o arquivo:
                            </p>
                            <code className="block bg-black/50 p-2 rounded text-xs text-green-400">
                                supabase/migrations/20260106_automation_system.sql
                            </code>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-white font-semibold">Passo 2: Recarregar Página</p>
                            <p className="text-xs text-gray-400">
                                Após aplicar a migração, recarregue esta página e os workflows aparecerão automaticamente.
                            </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1 bg-gold hover:bg-gold/80 text-black"
                                onClick={() => window.location.reload()}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Recarregar Página
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gold/30 text-gold hover:bg-gold/10"
                                onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir Supabase
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="bg-dark-lighter border-gold/20 hover:border-gold/40 transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-lg ${getCategoryColor(template.category)}`}>
                                        {getCategoryIcon(template.category)}
                                    </div>
                                    <Badge
                                        variant={template.is_active ? "default" : "secondary"}
                                        className={template.is_active ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}
                                    >
                                        {template.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl mt-4">{template.name}</CardTitle>
                                <CardDescription className="text-gray-400">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Estatísticas */}
                                {stats[template.category] && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {stats[template.category].total_executions} envios
                                        </div>
                                        <div className="text-green-500">
                                            {Math.round(stats[template.category].success_rate)}% sucesso
                                        </div>
                                    </div>
                                )}

                                {/* Credenciais necessárias */}
                                <div className="flex flex-wrap gap-2">
                                    {template.required_credentials.map((cred) => (
                                        <Badge key={cred} variant="outline" className="text-xs">
                                            {cred === 'whatsapp' ? '📱 WhatsApp' :
                                                cred === 'supabase' ? '🗄️ Database' :
                                                    cred === 'bank_api' ? '🏦 API Banco' : cred}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    {!template.n8n_workflow_id ? (
                                        <Button
                                            className="flex-1 bg-gold hover:bg-gold/80 text-black"
                                            onClick={() => installWorkflow(template)}
                                            disabled={installingId === template.id}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            {installingId === template.id ? 'Instalando...' : 'Instalar'}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => toggleWorkflow(template)}
                                            >
                                                {template.is_active ? (
                                                    <><PauseCircle className="w-4 h-4 mr-2" /> Pausar</>
                                                ) : (
                                                    <><PlayCircle className="w-4 h-4 mr-2" /> Ativar</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(`http://localhost:5678/workflow/${template.n8n_workflow_id}`, '_blank')}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Informações */}
            <Card className="bg-dark-lighter border-blue-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-500">
                        <AlertCircle className="w-5 h-5" />
                        Como Funciona
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-400">
                    <p>
                        <strong className="text-white">1. Instalar:</strong> Clique em "Instalar" para importar o workflow para o n8n (porta 5678)
                    </p>
                    <p>
                        <strong className="text-white">2. Configurar:</strong> As automações usam sua conexão WhatsApp existente e dados do Supabase
                    </p>
                    <p>
                        <strong className="text-white">3. Ativar:</strong> Após instalar, ative o workflow e ele rodará automaticamente
                    </p>
                    <p>
                        <strong className="text-white">4. Monitorar:</strong> Acompanhe execuções e logs no editor n8n
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
