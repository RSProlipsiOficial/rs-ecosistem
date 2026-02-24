import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, CreditCard, Save, Lock, Key, Upload, X, Image as ImageIcon, Sparkles, Layout, Palette, Phone, Mail, MapPin, Type, Info, CheckCircle, Smartphone, Plus, Trash2, Globe, ExternalLink, Monitor, PlayCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface SiteConfig {
    id?: string;
    site_url: string;
    descricao: string | null;
    ativo: boolean;
}

interface LandingBanner {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    link_url: string | null;
    order_index?: number;
    active?: boolean;
}

export default function AdminConfiguracoesIndex() {
    const [loading, setLoading] = useState(false);
    const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
        access_token: "",
        public_key: ""
    });
    const [brandingConfig, setBrandingConfig] = useState({
        logo_url: "",
        falcon_url: "",
        company_name: "RS Prólipsi",
        logo_show_bg: true,
        logo_bg_color: "#ffffff",
        logo_height: 48
    });
    const [landingConfig, setLandingConfig] = useState<Record<string, string>>({
        'footer.phone': '',
        'footer.email': '',
        'footer.address': ''
    });
    const [siteConfig, setSiteConfig] = useState<SiteConfig>({
        site_url: "",
        descricao: "",
        ativo: true
    });
    const [banners, setBanners] = useState<LandingBanner[]>([]);
    const [newBanner, setNewBanner] = useState({
        title: "",
        description: "",
        image_url: "",
        link_url: "",
        active: true
    });
    const [demoConfig, setDemoConfig] = useState({
        key: "DEMO-RS",
        enabled: true,
        video_url: ""
    });
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .eq('key', 'mercado_pago')
                .maybeSingle();

            if (error) throw error;

            if (data && data.value) {
                setMercadoPagoConfig({
                    access_token: (data.value as any).access_token || "",
                    public_key: (data.value as any).public_key || ""
                });
            }

            const { data: brandingData } = await supabase
                .from('app_settings')
                .select('*')
                .eq('key', 'branding')
                .maybeSingle();

            if (brandingData && brandingData.value) {
                setBrandingConfig(brandingData.value as any);
            }

            const { data: demoData } = await supabase
                .from('app_settings')
                .select('*')
                .eq('key', 'demo_config')
                .maybeSingle();

            if (demoData && demoData.value) {
                setDemoConfig(demoData.value as any);
            }

            // Load Landing Content
            const { data: landingData } = await supabase
                .from('landing_content')
                .select('*');

            if (landingData) {
                const config: Record<string, string> = {};
                landingData.forEach(item => {
                    config[`${item.section}.${item.content_key}`] = item.content_value || "";
                });
                setLandingConfig(config);
            }

            // Load Site Config
            const { data: siteData } = await supabase
                .from('site_config')
                .select('*')
                .maybeSingle();

            if (siteData) {
                setSiteConfig(siteData);
            }

            // Load Banners
            const { data: bannerData } = await supabase
                .from('landing_banners')
                .select('*')
                .order('order_index', { ascending: true });

            if (bannerData) {
                setBanners(bannerData);
            }
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as configurações.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'mercado_pago',
                    value: mercadoPagoConfig,
                    updated_by: user?.id
                });

            const { error: brandingError } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'branding',
                    value: brandingConfig,
                    updated_by: user?.id
                });

            const { error: demoError } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'demo_config',
                    value: demoConfig,
                    updated_by: user?.id
                });

            // Save Landing Content
            const landingUpdates = Object.entries(landingConfig).map(([key, value]) => {
                const [section, content_key] = key.split('.');
                return {
                    section,
                    content_key,
                    content_value: typeof value === 'string' ? value.trim() : value,
                    content_type: 'text'
                };
            });

            for (const update of landingUpdates) {
                await supabase
                    .from('landing_content')
                    .upsert(update, { onConflict: 'section,content_key' });
            }

            // Save Site Config
            const { error: siteError } = await supabase
                .from('site_config')
                .upsert({
                    ...siteConfig,
                    updated_at: new Date().toISOString()
                });

            if (error || brandingError || siteError) throw error || brandingError || siteError;

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Configurações salvas com sucesso!",
            });
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            toast({
                title: "Erro",
                description: error.message || "Erro ao salvar configurações",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUploadAware = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'falcon' | 'banner') => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('branding')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('branding')
                .getPublicUrl(filePath);

            if (type === 'banner') {
                setNewBanner(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                setBrandingConfig(prev => ({
                    ...prev,
                    [type === 'logo' ? 'logo_url' : 'falcon_url']: publicUrl
                }));
            }

            toast({
                title: "Sucesso",
                description: "Imagem carregada com sucesso! Não esqueça de salvar as alterações.",
            });
        } catch (error: any) {
            console.error("Erro no upload:", error);
            toast({
                title: "Erro no upload",
                description: error.message || "Não foi possível enviar a imagem",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addBanner = async () => {
        if (!newBanner.title || !newBanner.image_url) {
            toast({
                title: "Campos obrigatórios",
                description: "Título e imagem são necessários.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('landing_banners')
                .insert([{
                    ...newBanner,
                    order_index: banners.length
                }]);

            if (error) throw error;

            setNewBanner({
                title: "",
                description: "",
                image_url: "",
                link_url: "",
                active: true
            });

            const { data } = await supabase
                .from('landing_banners')
                .select('*')
                .order('order_index', { ascending: true });

            if (data) setBanners(data);

            toast({
                title: "Sucesso",
                description: "Banner adicionado!",
            });
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteBanner = async (id: string) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('landing_banners')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setBanners(prev => prev.filter(b => b.id !== id));
            toast({
                title: "Removido",
                description: "Banner excluído com sucesso."
            });
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2 uppercase italic">
                        <Settings className="h-6 w-6 md:h-8 md:w-8 text-gold animate-pulse" />
                        Configurações do Sistema
                    </h1>
                    <p className="text-[10px] md:text-base text-muted-foreground font-bold uppercase tracking-widest mt-1">Gerencie as integrações, branding e o site principal</p>
                </div>

                <Tabs defaultValue="branding" className="w-full">

                    <TabsList className="flex w-full overflow-x-auto !bg-black border border-gold/40 p-1 mb-8 custom-scrollbar">
                        <TabsTrigger value="branding" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Identidade
                        </TabsTrigger>
                        <TabsTrigger value="landing" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                            <Layout className="h-3.5 w-3.5" />
                            Landing
                        </TabsTrigger>
                        <TabsTrigger value="demo" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                            <Monitor className="h-3.5 w-3.5" />
                            Demo
                        </TabsTrigger>
                        <TabsTrigger value="integracoes" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            Pagamentos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="branding">
                        <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant overflow-hidden">
                            <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Sparkles className="h-5 w-5 text-gold" />
                                    Identidade Visual do Sistema
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Personalize a logo principal e do aplicativo Falcon.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase text-white/90 tracking-widest">Nome da Empresa</Label>
                                    <Input
                                        value={brandingConfig.company_name}
                                        onChange={(e) => setBrandingConfig({ ...brandingConfig, company_name: e.target.value })}
                                        placeholder="Ex: RotaFácil"
                                        className="!bg-black border-gold/40 !text-white h-11 md:h-12 focus:border-gold text-base md:text-lg"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Logo Principal */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold text-gray-300">Logo Principal (Painéis/Login)</Label>
                                        </div>
                                        <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-gold/20 rounded-2xl bg-black/20 group hover:border-gold/50 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gold/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            {brandingConfig.logo_url ? (
                                                <div className="relative group/img flex flex-col items-center gap-6 z-10">
                                                    <div
                                                        className="p-6 rounded-2xl shadow-gold transition-all duration-500 transform group-hover:scale-105"
                                                        style={{
                                                            backgroundColor: brandingConfig.logo_show_bg ? brandingConfig.logo_bg_color : 'transparent',
                                                            border: brandingConfig.logo_show_bg ? '1px solid rgba(212,175,55,0.2)' : 'none'
                                                        }}
                                                    >
                                                        <img
                                                            src={brandingConfig.logo_url}
                                                            alt="Logo Preview"
                                                            style={{ height: `${brandingConfig.logo_height}px` }}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setBrandingConfig(prev => ({ ...prev, logo_url: "" }))}
                                                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-all duration-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="h-32 w-full flex flex-col items-center justify-center border border-gold/10 bg-gold/5 rounded-2xl">
                                                    <ImageIcon className="h-10 w-10 mb-2 text-gold opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gold/30">Logo Não Definida</span>
                                                </div>
                                            )}

                                            <div className="w-full space-y-6 z-10">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-3 p-4 bg-black rounded-xl border border-gold/20">
                                                        <Label className="text-[11px] uppercase font-black text-white/90 tracking-widest">Exibição</Label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={brandingConfig.logo_show_bg}
                                                                onChange={(e) => setBrandingConfig({ ...brandingConfig, logo_show_bg: e.target.checked })}
                                                                className="w-5 h-5 accent-gold cursor-pointer"
                                                            />
                                                            <span className="text-xs text-white/80 font-bold uppercase">Ativar Fundo</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 p-4 bg-black rounded-xl border border-gold/20">
                                                        <Label className="text-[11px] uppercase font-black text-white/90 tracking-widest">Cor do Fundo</Label>
                                                        <input
                                                            type="color"
                                                            value={brandingConfig.logo_bg_color}
                                                            onChange={(e) => setBrandingConfig({ ...brandingConfig, logo_bg_color: e.target.value })}
                                                            className="w-full h-8 bg-transparent rounded cursor-pointer border-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 p-4 bg-black rounded-xl border border-gold/20">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <Label className="text-[11px] uppercase font-black text-white/90 tracking-widest">Tamanho da Logo</Label>
                                                        <span className="text-xs font-black text-gold">{brandingConfig.logo_height}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="30"
                                                        max="150"
                                                        value={brandingConfig.logo_height}
                                                        onChange={(e) => setBrandingConfig({ ...brandingConfig, logo_height: parseInt(e.target.value) })}
                                                        className="w-full h-1.5 bg-gold/10 rounded-lg appearance-none cursor-pointer accent-gold"
                                                    />
                                                </div>

                                                <Label
                                                    htmlFor="logo-upload"
                                                    className="flex items-center justify-center gap-2 w-full h-12 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-xl cursor-pointer transition-all font-black text-xs uppercase tracking-widest shadow-gold-sm"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Selecionar Arquivo
                                                </Label>
                                                <Input
                                                    id="logo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUploadAware(e, 'logo')}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo Falcon */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-300">Logo App Falcon</Label>
                                        <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-gold/20 rounded-2xl bg-black/20 group hover:border-gold/50 transition-all duration-500 relative overflow-hidden h-full">
                                            <div className="absolute inset-0 bg-gold/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            {brandingConfig.falcon_url ? (
                                                <div className="relative group/img z-10">
                                                    <img src={brandingConfig.falcon_url} alt="Falcon" className="h-32 object-contain rounded-2xl shadow-gold" />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setBrandingConfig(prev => ({ ...prev, falcon_url: "" }))}
                                                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-all duration-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="h-32 w-full flex flex-col items-center justify-center border border-gold/10 bg-gold/5 rounded-2xl">
                                                    <Smartphone className="h-10 w-10 mb-2 text-gold opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gold/30">Ícone Não Definido</span>
                                                </div>
                                            )}

                                            <div className="w-full mt-auto z-10">
                                                <Label
                                                    htmlFor="falcon-upload"
                                                    className="flex items-center justify-center gap-2 w-full h-12 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-xl cursor-pointer transition-all font-black text-xs uppercase tracking-widest shadow-gold-sm"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Carregar Ícone
                                                </Label>
                                                <Input
                                                    id="falcon-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUploadAware(e, 'falcon')}
                                                    disabled={loading}
                                                />
                                                <p className="text-[9px] text-center mt-3 text-gold/40 font-black uppercase tracking-tight">
                                                    Ideal: 512x512px • Formato Quadrado
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full md:w-auto gap-2 bg-gold hover:bg-gold/90 text-black px-10 py-4 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                    >
                                        <Save className="h-5 w-5" />
                                        {loading ? "Gravando..." : "Salvar Identidade"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="landing">
                        <div className="grid gap-8">
                            {/* Header e Estratégia */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <Globe className="h-5 w-5 text-gold" />
                                        Configurações do Header e Estratégia
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Defina o destino principal, rótulos do menu superior e visibilidade.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Rótulo Botão Header</Label>
                                            <Input
                                                value={landingConfig['header.cta_label'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'header.cta_label': e.target.value })}
                                                placeholder="Ex: Acesso Painel"
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Link Botão Header</Label>
                                            <Input
                                                value={landingConfig['header.cta_link'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'header.cta_link': e.target.value })}
                                                placeholder="/auth"
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">URL do Site Principal</Label>
                                            <Input
                                                value={siteConfig.site_url}
                                                onChange={(e) => setSiteConfig({ ...siteConfig, site_url: e.target.value })}
                                                placeholder="https://seusite.com.br"
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[11px] font-black uppercase text-white/90 tracking-widest block">Status do Site</Label>
                                            <div className="flex items-center gap-3 p-3 bg-black border border-gold/20 rounded-xl">
                                                <Switch
                                                    checked={siteConfig.ativo}
                                                    onCheckedChange={(checked) => setSiteConfig({ ...siteConfig, ativo: checked })}
                                                />
                                                <span className="text-sm font-bold text-white uppercase italic">
                                                    {siteConfig.ativo ? "Site Ativo" : "Site em Manutenção"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aparência do Site */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <Palette className="h-5 w-5 text-gold" />
                                        Design e Estética Global
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-4 gap-6 pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Cor de Fundo</Label>
                                        <div className="flex items-center gap-2 p-3 !bg-black border border-gold/40 rounded-xl">
                                            <input
                                                type="color"
                                                value={landingConfig['appearance.background_color'] || '#000000'}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'appearance.background_color': e.target.value })}
                                                className="h-10 w-full bg-transparent border-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Cor do Texto</Label>
                                        <div className="flex items-center gap-2 p-3 !bg-black border border-gold/40 rounded-xl">
                                            <input
                                                type="color"
                                                value={landingConfig['appearance.text_color'] || '#f3f4f6'}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'appearance.text_color': e.target.value })}
                                                className="h-10 w-full bg-transparent border-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Cor Principal (Ouro)</Label>
                                        <div className="flex items-center gap-2 p-3 !bg-black border border-gold/40 rounded-xl">
                                            <input
                                                type="color"
                                                value={landingConfig['appearance.primary_color'] || '#ffd700'}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'appearance.primary_color': e.target.value })}
                                                className="h-10 w-full bg-transparent border-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Fonte do Site</Label>
                                        <Select
                                            value={landingConfig['appearance.font_family'] || 'Inter'}
                                            onValueChange={(value) => setLandingConfig({ ...landingConfig, 'appearance.font_family': value })}
                                        >
                                            <SelectTrigger className="h-16 !bg-black border-gold/40 !text-white focus:border-gold text-lg font-bold">
                                                <SelectValue placeholder="Selecione a fonte" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-black border-gold/30 text-white">
                                                <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                                                <SelectItem value="Poppins">Poppins</SelectItem>
                                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                                <SelectItem value="Playfair Display">Playfair Display (Luxo)</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gestão de Banners */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <ImageIcon className="h-5 w-5 text-gold" />
                                        Gestão de Banners do Site
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    {/* Add New Banner */}
                                    <div className="p-6 bg-gold/5 border border-gold/10 rounded-2xl space-y-4">
                                        <h3 className="text-xs font-black uppercase text-gold tracking-widest flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Novo Banner
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título</Label>
                                                <Input
                                                    value={newBanner.title}
                                                    onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                                                    className="!bg-black border-gold/40 !text-white h-12 placeholder:text-gray-500 focus-visible:ring-gold/30 text-lg"
                                                    placeholder="Digite o título do banner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Link de Destino</Label>
                                                <Input
                                                    value={newBanner.link_url}
                                                    onChange={(e) => setNewBanner(prev => ({ ...prev, link_url: e.target.value }))}
                                                    placeholder="https://..."
                                                    className="!bg-black border-gold/40 !text-white h-12 placeholder:text-gray-500 focus-visible:ring-gold/30 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">URL da Imagem</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newBanner.image_url}
                                                        onChange={(e) => setNewBanner(prev => ({ ...prev, image_url: e.target.value }))}
                                                        className="!bg-black border-gold/40 !text-white h-12 placeholder:text-gray-500 flex-1 text-lg"
                                                        placeholder="Cole a URL ou carregue o arquivo"
                                                    />
                                                    <Label
                                                        htmlFor="banner-upload"
                                                        className="px-4 h-12 bg-gold/10 text-gold border border-gold/30 rounded-lg cursor-pointer hover:bg-gold/20 transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                    </Label>
                                                    <Input
                                                        id="banner-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUploadAware(e, 'banner')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    onClick={addBanner}
                                                    className="w-full bg-gold hover:bg-gold/90 text-black h-12 font-black uppercase text-[11px] tracking-widest shadow-gold-sm hover:scale-[1.02] transition-all"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Banner
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Banner List */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {banners.map((banner) => (
                                            <div key={banner.id} className="group relative overflow-hidden rounded-2xl border border-gold/10 bg-black/40 aspect-video shadow-lg">
                                                <img src={banner.image_url} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                                                    <h4 className="text-white font-bold uppercase text-xs tracking-widest truncate">{banner.title}</h4>
                                                    <p className="text-gold/80 text-xs truncate">{banner.link_url}</p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteBanner(banner.id)}
                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conteúdo Hero */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <Sparkles className="h-5 w-5 text-gold" />
                                        Seção de Destaque (Hero)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título (Parte 1)</Label>
                                            <Input
                                                value={landingConfig['hero.title'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.title': e.target.value })}
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título (Destaque Ouro)</Label>
                                            <Input
                                                value={landingConfig['hero.title_gold'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.title_gold': e.target.value })}
                                                className="!bg-black border-gold/40 !text-gold font-bold h-12 text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título (Parte 3 - Final)</Label>
                                        <Input
                                            value={landingConfig['hero.title_end'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.title_end': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Descrição do Sistema</Label>
                                        <Textarea
                                            value={landingConfig['hero.description'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.description': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white min-h-[120px] text-lg"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Botão 1 (Rótulo)</Label>
                                                <Input
                                                    value={landingConfig['hero.cta1_text'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.cta1_text': e.target.value })}
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Botão 1 (Link)</Label>
                                                <Input
                                                    value={landingConfig['hero.cta1_link'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.cta1_link': e.target.value })}
                                                    placeholder="/consultor/cadastro?ref=rsprolipsi"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Botão 2 (Rótulo)</Label>
                                                <Input
                                                    value={landingConfig['hero.cta2_text'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.cta2_text': e.target.value })}
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Botão 2 (Link)</Label>
                                                <Input
                                                    value={landingConfig['hero.cta2_link'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.cta2_link': e.target.value })}
                                                    placeholder="/demonstracao"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Prova Social (Texto)</Label>
                                        <Input
                                            value={landingConfig['hero.social_proof'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'hero.social_proof': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Funcionalidades */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <Info className="h-5 w-5 text-gold" />
                                        Funcionalidades Principais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    <div className="p-6 bg-gold/5 border border-gold/40 rounded-2xl mb-8 space-y-6">
                                        <h3 className="text-xs font-black uppercase text-gold tracking-widest mb-4 italic">Chamada para Ação nos Benefícios</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Rótulo do Botão</Label>
                                                <Input
                                                    value={landingConfig['benefits.cta'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'benefits.cta': e.target.value })}
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Link do Botão</Label>
                                                <Input
                                                    value={landingConfig['benefits.cta_link'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'benefits.cta_link': e.target.value })}
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                                        <div key={idx} className="p-6 bg-black border border-gold/10 rounded-2xl space-y-4 hover:border-gold/30 transition-all">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-black">
                                                    {idx}
                                                </div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Funcionalidade {idx}</h4>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título do Card</Label>
                                                    <Input
                                                        value={landingConfig[`features.f${idx}_title`] || ""}
                                                        onChange={(e) => setLandingConfig({ ...landingConfig, [`features.f${idx}_title`]: e.target.value })}
                                                        className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Descrição curta</Label>
                                                    <Input
                                                        value={landingConfig[`features.f${idx}_desc`] || ""}
                                                        onChange={(e) => setLandingConfig({ ...landingConfig, [`features.f${idx}_desc`]: e.target.value })}
                                                        className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </CardContent>
                            </Card>

                            {/* Rodapé Dinâmico */}

                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <MapPin className="h-5 w-5 text-gold" />
                                        Informações de Contato e Rodapé
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Descrição do Rodapé</Label>
                                        <Textarea
                                            value={landingConfig['footer.description'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.description': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white min-h-[120px] text-lg"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">WhatsApp / Telefone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gold/50" />
                                                <Input
                                                    value={landingConfig['footer.phone'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.phone': e.target.value })}
                                                    className="pl-10 !bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">E-mail de Suporte</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gold/50" />
                                                <Input
                                                    value={landingConfig['footer.email'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.email': e.target.value })}
                                                    className="pl-10 !bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Localização/Endereço</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gold/50" />
                                                <Input
                                                    value={landingConfig['footer.address'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.address': e.target.value })}
                                                    className="pl-10 !bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legal and Copyright */}
                                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gold/10">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Texto de Copyright</Label>
                                            <Input
                                                value={landingConfig['footer.copyright'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.copyright': e.target.value })}
                                                placeholder="© 2026 RS Prólipsi. Todos os direitos reservados."
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Rótulo: Termos de Uso</Label>
                                                <Input
                                                    value={landingConfig['footer.terms_label'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.terms_label': e.target.value })}
                                                    placeholder="Termos de Uso"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">URL: Termos de Uso</Label>
                                                <Input
                                                    value={landingConfig['footer.terms_url'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.terms_url': e.target.value })}
                                                    placeholder="/termos-de-uso"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Rótulo: Política de Privacidade</Label>
                                                <Input
                                                    value={landingConfig['footer.privacy_label'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.privacy_label': e.target.value })}
                                                    placeholder="Política de Privacidade"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">URL: Política de Privacidade</Label>
                                                <Input
                                                    value={landingConfig['footer.privacy_url'] || ""}
                                                    onChange={(e) => setLandingConfig({ ...landingConfig, 'footer.privacy_url': e.target.value })}
                                                    placeholder="/politica-privacidade"
                                                    className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CTA Final */}
                            <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant">
                                <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white italic">
                                        <Sparkles className="h-5 w-5 text-gold" />
                                        Seção de CTA Final
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Título do CTA</Label>
                                        <Input
                                            value={landingConfig['cta.title'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'cta.title': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Descrição do CTA</Label>
                                        <Textarea
                                            value={landingConfig['cta.description'] || ""}
                                            onChange={(e) => setLandingConfig({ ...landingConfig, 'cta.description': e.target.value })}
                                            className="!bg-black border-gold/40 !text-white min-h-[100px] text-lg"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Rótulo do Botão</Label>
                                            <Input
                                                value={landingConfig['cta.button_text'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'cta.button_text': e.target.value })}
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Link do Botão</Label>
                                            <Input
                                                value={landingConfig['cta.button_link'] || ""}
                                                onChange={(e) => setLandingConfig({ ...landingConfig, 'cta.button_link': e.target.value })}
                                                placeholder="/consultor/cadastro?ref=rsprolipsi"
                                                className="!bg-black border-gold/40 !text-white h-12 text-lg"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center pb-12">
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full md:w-auto gap-3 bg-gold hover:bg-gold/90 text-black px-12 py-5 h-auto text-sm md:text-xl font-black shadow-gold-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    <Save className="h-5 w-5 md:h-6 md:w-6" />
                                    {loading ? "Processando..." : "Publicar Alterações"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="demo">
                        <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant overflow-hidden">
                            <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-white italic">
                                    <Key className="h-5 w-5 text-gold" />
                                    Configuração de Acesso Demo
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Defina a chave secreta que libera o acesso ao Escritório Virtual de demonstração.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Chave Demo VIP</Label>
                                        <div className="relative group">
                                            <Key className="absolute left-4 top-4.5 h-5 w-5 text-gold/50 group-hover:text-gold transition-colors" />
                                            <Input
                                                value={demoConfig.key}
                                                onChange={(e) => setDemoConfig({ ...demoConfig, key: e.target.value.toUpperCase() })}
                                                placeholder="DEMO-RS"
                                                className="pl-12 h-14 !bg-black border-gold/40 focus:border-gold !text-white font-black tracking-widest text-lg uppercase"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold uppercase italic">Dica: Recomendamos usar letras maiúsculas e traços.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Link do Vídeo do App (YouTube)</Label>
                                        <div className="relative group">
                                            <PlayCircle className="absolute left-4 top-4.5 h-5 w-5 text-gold/50 group-hover:text-gold transition-colors" />
                                            <Input
                                                value={demoConfig.video_url}
                                                onChange={(e) => setDemoConfig({ ...demoConfig, video_url: e.target.value })}
                                                placeholder="https://youtube.com/..."
                                                className="pl-12 h-14 !bg-black border-gold/40 focus:border-gold !text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Status do Acesso Demo</Label>
                                        <div className="flex items-center gap-4 p-4 bg-black border border-gold/20 rounded-xl">
                                            <Switch
                                                checked={demoConfig.enabled !== false}
                                                onCheckedChange={(checked) => setDemoConfig({ ...demoConfig, enabled: checked })}
                                            />
                                            <span className="text-sm font-bold text-white uppercase italic">
                                                {demoConfig.enabled !== false ? "Acesso Liberado" : "Acesso Bloqueado"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gold/5 border border-gold/10 rounded-2xl space-y-4">
                                    <h3 className="text-sm font-black uppercase text-gold flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Como funciona?
                                    </h3>
                                    <p className="text-xs text-white/60 leading-relaxed font-medium">
                                        Ao digitar esta chave na página de demonstração, o visitante terá acesso visual completo ao Escritório Virtual.
                                        Isso permite que ele experimente a interface e sinta o poder da gestão inteligente antes mesmo de se cadastrar.
                                    </p>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full md:w-auto gap-2 bg-gold hover:bg-gold/90 text-black px-10 py-5 md:py-7 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                    >
                                        <Save className="h-5 w-5" />
                                        {loading ? "Salvando..." : "Salvar Configuração"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="integracoes">
                        <Card className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant overflow-hidden">
                            <CardHeader className="border-b border-gold/10 bg-gold/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-white italic">
                                    <CreditCard className="h-5 w-5 text-gold" />
                                    Mercado Pago (Checkout VIP)
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Configure as credenciais para recebimento de assinaturas e upgrades.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Public Key (Frontend)</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-4.5 h-5 w-5 text-gold/50 group-hover:text-gold transition-colors" />
                                        <Input
                                            id="public_key"
                                            placeholder="APP_USR-..."
                                            value={mercadoPagoConfig.public_key}
                                            onChange={(e) => setMercadoPagoConfig({ ...mercadoPagoConfig, public_key: e.target.value })}
                                            className="pl-12 h-14 !bg-black border-gold/40 focus:border-gold !text-white font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase text-white/90 tracking-widest">Access Token (Backend)</Label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-4.5 h-5 w-5 text-gold/50 group-hover:text-gold transition-colors" />
                                        <Input
                                            id="access_token"
                                            type="password"
                                            placeholder="APP_USR-..."
                                            value={mercadoPagoConfig.access_token}
                                            onChange={(e) => setMercadoPagoConfig({ ...mercadoPagoConfig, access_token: e.target.value })}
                                            className="pl-12 h-14 !bg-black border-gold/40 focus:border-gold !text-white font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full md:w-auto gap-2 bg-gold hover:bg-gold/90 text-black px-10 py-5 md:py-7 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                    >
                                        <Save className="h-5 w-5" />
                                        {loading ? "Salvando..." : "Salvar Integrações"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
