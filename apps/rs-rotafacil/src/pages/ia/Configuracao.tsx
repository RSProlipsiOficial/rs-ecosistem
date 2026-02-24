import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Save, ArrowLeft, Sparkles, MessageSquare, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AIConfigPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        system_prompt: '',
        ai_memory: '',
        ai_voice_tone: 'profissional e amigável',
        custom_instructions: '',
        auto_greeting_enabled: false,
        holiday_messages_enabled: false,
        ecosystem_billing_active: false,
        ecosystem_auto_reply_active: false,
        auto_reply_enabled: false,
        ecosystem_last_scan: null as string | null
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('ai_configuration')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setConfig({
                    system_prompt: data.system_prompt || '',
                    ai_memory: data.ai_memory || '',
                    ai_voice_tone: data.ai_voice_tone || 'profissional e amigável',
                    custom_instructions: data.custom_instructions || '',
                    auto_greeting_enabled: data.auto_greeting_enabled || false,
                    holiday_messages_enabled: data.holiday_messages_enabled || false,
                    ecosystem_billing_active: data.ecosystem_billing_active || false,
                    ecosystem_auto_reply_active: data.ecosystem_auto_reply_active || false,
                    auto_reply_enabled: data.auto_reply_enabled || false,
                    ecosystem_last_scan: data.ecosystem_last_scan || null
                });
            }
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as configurações da IA.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('ai_configuration')
                .upsert({
                    user_id: user.id,
                    ...config,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Configurações da IA salvas com sucesso!",
            });
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar as configurações.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/ia')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Brain className="h-8 w-8 text-primary" />
                                Cérebro da RS-IA
                            </h1>
                            <p className="text-muted-foreground">
                                Personalize como a sua inteligência artificial se comporta e o que ela lembra
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                Personalidade e Instruções
                            </CardTitle>
                            <CardDescription>
                                Defina o tom de voz e as regras gerais que a IA deve seguir
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="voice_tone">Tom de Voz</Label>
                                    <Input
                                        id="voice_tone"
                                        placeholder="Ex: Profissional, amigável, direto..."
                                        value={config.ai_voice_tone}
                                        onChange={(e) => setConfig(prev => ({ ...prev, ai_voice_tone: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prompt">Identidade da IA (O que eu sou?)</Label>
                                    <Input
                                        id="prompt"
                                        placeholder="Ex: Assistente da Van do Tio João"
                                        value={config.system_prompt}
                                        onChange={(e) => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="custom_instructions">Instruções Customizadas (Contexto do Robô)</Label>
                                <Textarea
                                    id="custom_instructions"
                                    placeholder="Ex: Nunca dê descontos sem autorização. Sempre peça para confirmar o recebimento do boleto."
                                    value={config.custom_instructions}
                                    onChange={(e) => setConfig(prev => ({ ...prev, custom_instructions: e.target.value }))}
                                    className="min-h-[100px] resize-none"
                                />
                                <p className="text-xs text-muted-foreground italic">
                                    Instruções específicas para o comportamento do robô com seus clientes.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="memory">Memória da IA (Informações Fixas do Seu Negócio)</Label>
                                <Textarea
                                    id="memory"
                                    placeholder="Ex: Minha chave PIX é o celular 11999999999. Atendo as escolas Objetivo e Anglo."
                                    value={config.ai_memory}
                                    onChange={(e) => setConfig(prev => ({ ...prev, ai_memory: e.target.value }))}
                                    className="min-h-[120px] resize-none"
                                />
                                <p className="text-xs text-muted-foreground italic">
                                    Informações importantes que a IA deve sempre saber.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                Automações Inteligentes
                            </CardTitle>
                            <CardDescription>
                                Configure envios automáticos baseados em IA
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-base font-semibold">Saudações Automáticas</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enviar Bom dia/Boa tarde personalizado para os pais
                                    </p>
                                </div>
                                <Switch
                                    checked={config.auto_greeting_enabled}
                                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_greeting_enabled: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-base font-semibold">Datas Festivas</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        A IA enviará mensagens em aniversários, Natal, Páscoa, etc.
                                    </p>
                                </div>
                                <Switch
                                    checked={config.holiday_messages_enabled}
                                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, holiday_messages_enabled: checked }))}
                                />
                            </div>

                            <div className="border-t border-primary/10 pt-6">
                                <h3 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Ecossistema RS-IA (Cobrança & Resposta)
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base font-semibold">Cobrança Automática Ativa</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                O robô enviará cobranças com PIX automaticamente via WhatsApp.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={config.ecosystem_billing_active}
                                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ecosystem_billing_active: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base font-semibold">Resposta Automática Inteligente</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                A IA responderá dúvidas de pais no WhatsApp usando os dados do sistema.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={config.auto_reply_enabled}
                                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_reply_enabled: checked, ecosystem_auto_reply_active: checked }))}
                                        />
                                    </div>

                                    {config.ecosystem_last_scan && (
                                        <p className="text-[10px] text-muted-foreground text-right italic">
                                            Última varredura: {new Date(config.ecosystem_last_scan).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                    <Brain className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <strong>Dica:</strong> Quanto mais detalhes você colocar na "Memória da IA", mais precisas e humanas serão as respostas. Você pode incluir horários, regras de cobrança e até curiosidades sobre as rotas.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConfigPage;
