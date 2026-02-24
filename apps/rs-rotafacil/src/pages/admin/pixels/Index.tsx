import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView } from "@/components/tracking/PixelManager";
import {
    Save,
    Loader2,
    Target,
    BarChart3,
    Activity,
    Code,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    TrendingUp,
    Eye,
    EyeOff,
    Copy,
    MousePointer,
    ShoppingCart,
    UserPlus,
    ArrowLeft,
    Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PixelConfig {
    facebook_pixel_id: string;
    facebook_pixel_enabled: boolean;
    facebook_conversions_api_token: string;
    facebook_test_event_code?: string;
    google_analytics_id: string;
    google_analytics_enabled: boolean;
    google_ads_id: string;
    google_ads_enabled: boolean;
    tiktok_pixel_id: string;
    tiktok_pixel_enabled: boolean;
    custom_head_scripts: string;
    custom_body_scripts: string;
    track_page_views: boolean;
    track_signups: boolean;
    track_purchases: boolean;
    track_button_clicks: boolean;
    auto_injection_enabled?: boolean;
}

export default function AdminPixelsIndex() {
    const [config, setConfig] = useState<PixelConfig>({
        facebook_pixel_id: "",
        facebook_pixel_enabled: false,
        facebook_conversions_api_token: "",
        facebook_test_event_code: "",
        google_analytics_id: "",
        google_analytics_enabled: false,
        google_ads_id: "",
        google_ads_enabled: false,
        tiktok_pixel_id: "",
        tiktok_pixel_enabled: false,
        custom_head_scripts: "",
        custom_body_scripts: "",
        track_page_views: true,
        track_signups: true,
        track_purchases: true,
        track_button_clicks: false,
        auto_injection_enabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .eq('key', 'pixels_config')
                .single();

            if (data?.value) {
                // Merge with default values to handle new fields
                setConfig(prev => ({ ...prev, ...data.value }));
            }
        } catch (error) {
            console.error("Erro ao carregar configuração de pixels:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'pixels_config',
                    value: config,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) throw error;

            toast({
                title: "Configuração Salva!",
                description: "Os pixels de rastreamento foram atualizados com sucesso.",
                className: "bg-green-500 text-white border-none"
            });
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
        toast({ title: "Copiado!", description: "Conteúdo copiado para a área de transferência." });
    };

    const handleNumericInput = (value: string, field: keyof PixelConfig) => {
        const numericValue = value.replace(/\D/g, "");
        setConfig(prev => ({ ...prev, [field]: numericValue }));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-10 h-10 animate-spin text-gold" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-6xl mx-auto pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full hover:bg-white/5"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                <Target className="w-8 h-8 text-gold" />
                                Rastreamento Inteligente
                            </h1>
                            <p className="text-muted-foreground mt-1 text-lg">
                                Gerencie seus Pixels e API de Conversões em um só lugar.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="text-sm font-medium text-muted-foreground">Auto-Injeção</span>
                            <Switch
                                checked={config.auto_injection_enabled !== false} // Default true
                                onCheckedChange={(v) => setConfig(prev => ({ ...prev, auto_injection_enabled: v }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Manual Installation Guide - Shows only when Auto-Injection is OFF */}
                {!config.auto_injection_enabled && (
                    <Card className="border-yellow-500/20 bg-yellow-500/5 animate-in fade-in slide-in-from-top-4 mb-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-yellow-500 flex items-center gap-2 text-lg">
                                <AlertCircle className="w-5 h-5" />
                                Instalação Manual Necessária
                            </CardTitle>
                            <CardDescription className="text-yellow-500/70">
                                Como a Auto-Injeção está desativada, você precisa instalar os códigos manualmente no seu site ou checkout externo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white text-sm">Código Base do Facebook Pixel</Label>
                                <div className="relative">
                                    <pre className="p-4 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                        {`<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.facebook_pixel_id || 'SEU_PIXEL_ID'}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${config.facebook_pixel_id || 'SEU_PIXEL_ID'}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`}
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2 text-xs h-8 bg-gold text-black hover:bg-gold/90"
                                        onClick={() => copyToClipboard(`<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.facebook_pixel_id || 'SEU_PIXEL_ID'}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${config.facebook_pixel_id || 'SEU_PIXEL_ID'}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`, 'manual_code')}
                                    >
                                        <Copy className="w-3 h-3 mr-1" /> Copiar Código
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="meta" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-4 md:w-[600px] bg-black-secondary border border-white/10 p-1 rounded-xl h-12">
                        <TabsTrigger value="meta" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold rounded-lg transition-all">Meta (Facebook)</TabsTrigger>
                        <TabsTrigger value="google" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold rounded-lg transition-all">Google</TabsTrigger>
                        <TabsTrigger value="tiktok" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold rounded-lg transition-all">TikTok</TabsTrigger>
                        <TabsTrigger value="advanced" className="data-[state=active]:bg-gold data-[state=active]:text-black font-bold rounded-lg transition-all">Avançado</TabsTrigger>
                    </TabsList>

                    {/* META (FACEBOOK) TAB */}
                    <TabsContent value="meta" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-gold/20 bg-black-secondary overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-900/20 to-transparent border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                            <Activity className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-white">Meta Pixel & CAPI</CardTitle>
                                            <CardDescription className="text-muted-foreground">Integração completa com Facebook e Instagram Ads</CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.facebook_pixel_enabled}
                                        onCheckedChange={(v) => setConfig(prev => ({ ...prev, facebook_pixel_enabled: v }))}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className={`p-6 space-y-6 transition-all duration-300 ${!config.facebook_pixel_enabled && 'opacity-50 grayscale pointer-events-none'}`}>
                                {/* Pixel ID */}
                                <div className="space-y-3">
                                    <Label className="text-base text-white font-medium">Pixel ID</Label>
                                    <div className="relative">
                                        <Input
                                            value={config.facebook_pixel_id}
                                            onChange={(e) => handleNumericInput(e.target.value, 'facebook_pixel_id')}
                                            placeholder="Ex: 123456789 (Apenas Números)"
                                            className="h-12 bg-black/40 border-white/10 text-lg font-mono pl-4 pr-12 focus:border-blue-500/50 transition-all"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-1 top-1 text-muted-foreground hover:text-white"
                                            onClick={() => copyToClipboard(config.facebook_pixel_id, 'fb_pixel')}
                                        >
                                            {copiedField === 'fb_pixel' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-blue-500" /> Utilize apenas os números do ID. Não cole o script inteiro aqui.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    {/* CAPI Token */}
                                    <div className="space-y-3">
                                        <Label className="text-base text-white font-medium flex items-center gap-2">
                                            Conversions API Token
                                            <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 bg-blue-500/10">Recomendado</Badge>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showToken ? "text" : "password"}
                                                value={config.facebook_conversions_api_token}
                                                onChange={(e) => setConfig(prev => ({ ...prev, facebook_conversions_api_token: e.target.value }))}
                                                placeholder="EAAG..."
                                                className="h-12 bg-black/40 border-white/10 text-sm font-mono pl-4 pr-20 focus:border-blue-500/50 transition-all"
                                            />
                                            <div className="absolute right-1 top-1 flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setShowToken(!showToken)}
                                                    className="text-muted-foreground hover:text-white"
                                                >
                                                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(config.facebook_conversions_api_token, 'capi_token')}
                                                    className="text-muted-foreground hover:text-white"
                                                >
                                                    {copiedField === 'capi_token' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Test Event Code */}
                                    <div className="space-y-3">
                                        <Label className="text-base text-white font-medium">Test Event Code</Label>
                                        <div className="relative">
                                            <Input
                                                value={config.facebook_test_event_code || ''}
                                                onChange={(e) => setConfig(prev => ({ ...prev, facebook_test_event_code: e.target.value }))}
                                                placeholder="TEST12345"
                                                className="h-12 bg-black/40 border-white/10 text-lg font-mono pl-4 uppercase focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Código para testar eventos no Gerenciador de Eventos (opcional).
                                        </p>
                                    </div>
                                </div>

                                {/* Test Section */}
                                <div className="pt-6 mt-6 border-t border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-gold" />
                                        Testar Integração
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                trackPageView();
                                                toast({ title: "Evento Enviado!", description: "Um evento de PageView foi enviado para o Facebook." });
                                            }}
                                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30"
                                        >
                                            Enviar PageView de Teste
                                        </Button>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/40 p-3 rounded-lg border border-white/5">
                                            <AlertCircle className="w-4 h-4 text-blue-500" />
                                            <span>
                                                Verifique o "Gerenciador de Eventos" do Facebook para confirmar o recebimento.
                                                Se usar o código de teste, o evento aparecerá na aba "Testar Eventos".
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* GOOGLE TAB */}
                    <TabsContent value="google" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* GA4 */}
                        <Card className="border-gold/20 bg-black-secondary">
                            <CardHeader className="bg-gradient-to-r from-green-900/20 to-transparent border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-600 rounded-xl shadow-lg shadow-green-600/20">
                                            <BarChart3 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-white">Google Analytics 4</CardTitle>
                                            <CardDescription className="text-muted-foreground">Métricas de tráfego e comportamento</CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.google_analytics_enabled}
                                        onCheckedChange={(v) => setConfig(prev => ({ ...prev, google_analytics_enabled: v }))}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className={`p-6 ${!config.google_analytics_enabled && 'opacity-50 grayscale pointer-events-none'}`}>
                                <Label className="text-base text-white font-medium mb-2 block">Measurement ID</Label>
                                <Input
                                    value={config.google_analytics_id}
                                    onChange={(e) => setConfig(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                                    placeholder="G-XXXXXXXXXX"
                                    className="h-12 bg-black/40 border-white/10 text-lg font-mono focus:border-green-500/50"
                                />
                            </CardContent>
                        </Card>

                        {/* Ads */}
                        <Card className="border-gold/20 bg-black-secondary">
                            <CardHeader className="bg-gradient-to-r from-red-900/20 to-transparent border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/20">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-white">Google Ads</CardTitle>
                                            <CardDescription className="text-muted-foreground">Conversões de campanhas Google</CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.google_ads_enabled}
                                        onCheckedChange={(v) => setConfig(prev => ({ ...prev, google_ads_enabled: v }))}
                                        className="data-[state=checked]:bg-red-600"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className={`p-6 ${!config.google_ads_enabled && 'opacity-50 grayscale pointer-events-none'}`}>
                                <Label className="text-base text-white font-medium mb-2 block">Conversion ID</Label>
                                <Input
                                    value={config.google_ads_id}
                                    onChange={(e) => setConfig(prev => ({ ...prev, google_ads_id: e.target.value }))}
                                    placeholder="AW-XXXXXXXXX"
                                    className="h-12 bg-black/40 border-white/10 text-lg font-mono focus:border-red-500/50"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TIKTOK TAB */}
                    <TabsContent value="tiktok" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-gold/20 bg-black-secondary">
                            <CardHeader className="bg-gradient-to-r from-pink-900/20 to-transparent border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-pink-600 rounded-xl shadow-lg shadow-pink-600/20">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-white">TikTok Pixel</CardTitle>
                                            <CardDescription className="text-muted-foreground">Rastreamento de campanhas TikTok</CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.tiktok_pixel_enabled}
                                        onCheckedChange={(v) => setConfig(prev => ({ ...prev, tiktok_pixel_enabled: v }))}
                                        className="data-[state=checked]:bg-pink-600"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className={`p-6 ${!config.tiktok_pixel_enabled && 'opacity-50 grayscale pointer-events-none'}`}>
                                <Label className="text-base text-white font-medium mb-2 block">Pixel ID</Label>
                                <Input
                                    value={config.tiktok_pixel_id}
                                    onChange={(e) => setConfig(prev => ({ ...prev, tiktok_pixel_id: e.target.value }))}
                                    placeholder="Ex: XXXXXXXXXXXXXXXXX"
                                    className="h-12 bg-black/40 border-white/10 text-lg font-mono focus:border-pink-500/50"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ADVANCED TAB */}
                    <TabsContent value="advanced" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Event Controls */}
                        <Card className="border-gold/20 bg-black-secondary">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-gold" />
                                    Controle de Eventos
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">Escolha quais eventos deseja rastrear globalmente</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Page Views', key: 'track_page_views', icon: Eye },
                                        { label: 'Cadastros', key: 'track_signups', icon: UserPlus },
                                        { label: 'Compras', key: 'track_purchases', icon: ShoppingCart },
                                        { label: 'Cliques', key: 'track_button_clicks', icon: MousePointer },
                                    ].map((item: any) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-black/40 rounded-lg">
                                                    <item.icon className="w-4 h-4 text-gold" />
                                                </div>
                                                <span className="text-sm font-medium text-white">{item.label}</span>
                                            </div>
                                            <Switch
                                                checked={(config as any)[item.key]}
                                                onCheckedChange={(v) => setConfig(prev => ({ ...prev, [item.key]: v }))}
                                                className="data-[state=checked]:bg-gold"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Scripts */}
                        <Card className="border-orange-500/20 bg-black-secondary">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Code className="w-5 h-5 text-orange-500" />
                                    Injeção de Código Personalizado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-white font-medium flex items-center gap-2">
                                        Head Scripts
                                        <Badge variant="outline" className="text-[10px]">&lt;head&gt;</Badge>
                                    </Label>
                                    <Textarea
                                        value={config.custom_head_scripts}
                                        onChange={(e) => setConfig(prev => ({ ...prev, custom_head_scripts: e.target.value }))}
                                        placeholder="<!-- Scripts para o header -->"
                                        className="font-mono text-sm min-h-[150px] bg-black/40 border-white/10 focus:border-orange-500/50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-white font-medium flex items-center gap-2">
                                        Body Scripts
                                        <Badge variant="outline" className="text-[10px]">&lt;/body&gt;</Badge>
                                    </Label>
                                    <Textarea
                                        value={config.custom_body_scripts}
                                        onChange={(e) => setConfig(prev => ({ ...prev, custom_body_scripts: e.target.value }))}
                                        placeholder="<!-- Scripts para o final do body -->"
                                        className="font-mono text-sm min-h-[150px] bg-black/40 border-white/10 focus:border-orange-500/50"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-orange-500" />
                                    <p>Cuidado ao adicionar scripts aqui. Erros de sintaxe podem quebrar o layout ou funcionalidade do site.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Floating Save Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={saveConfig}
                        disabled={saving}
                        className="h-14 px-8 rounded-full bg-gradient-gold text-black font-black text-lg shadow-2xl hover:scale-105 transition-all shadow-gold/20 flex items-center gap-3"
                    >
                        {saving ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                        ) : (
                            <><Save className="w-5 h-5" /> Salvar Alterações</>
                        )}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
