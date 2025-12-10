import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Save, ExternalLink, Edit3, Image, Type, Palette, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface SiteConfig {
  id: string;
  site_url: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface LandingContent {
  id: string;
  section: string;
  content_key: string;
  content_type: string;
  content_value: string | null;
  image_url: string | null;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LandingBanner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSiteIndex() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [content, setContent] = useState<LandingContent[]>([]);
  const [banners, setBanners] = useState<LandingBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    site_url: "",
    descricao: "",
    ativo: true
  });

  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    active: true
  });

  useEffect(() => {
    loadConfig();
    loadLandingContent();
    loadBanners();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('ativo', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setConfig(data);
        setFormData({
          site_url: data.site_url || "",
          descricao: data.descricao || "",
          ativo: data.ativo
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do site:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do site.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLandingContent = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo da landing:', error);
    }
  };

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_banners')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const dataToSave = {
        site_url: formData.site_url || "",
        descricao: formData.descricao || null,
        ativo: formData.ativo
      };

      if (config) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('site_config')
          .update(dataToSave)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('site_config')
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });

      setEditing(false);
      loadConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContent = async (section: string, key: string, value: string, type: string = 'text') => {
    try {
      const { error } = await supabase
        .from('landing_content')
        .upsert({
          section,
          content_key: key,
          content_value: value,
          content_type: type,
          active: true
        }, {
          onConflict: 'section,content_key'
        });

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado!",
      });
      
      loadLandingContent();
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conteúdo.",
        variant: "destructive",
      });
    }
  };

  const addBanner = async () => {
    if (!newBanner.title || !newBanner.image_url) {
      toast({
        title: "Erro",
        description: "Título e URL da imagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
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
      
      toast({
        title: "Sucesso",
        description: "Banner adicionado!",
      });
      
      loadBanners();
    } catch (error) {
      console.error('Erro ao adicionar banner:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar banner.",
        variant: "destructive",
      });
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('landing_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Banner removido!",
      });
      
      loadBanners();
    } catch (error) {
      console.error('Erro ao remover banner:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover banner.",
        variant: "destructive",
      });
    }
  };

  const getContentValue = (section: string, key: string, defaultValue: string = '') => {
    const item = content.find(c => c.section === section && c.content_key === key);
    return item?.content_value || defaultValue;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Carregando informações do site...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Landing Page</h1>
            <p className="text-muted-foreground">
              Edite completamente a página inicial do seu site
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config">
              <Globe className="w-4 h-4 mr-2" />
              Config Site
            </TabsTrigger>
            <TabsTrigger value="content">
              <Type className="w-4 h-4 mr-2" />
              Textos
            </TabsTrigger>
            <TabsTrigger value="banners">
              <Image className="w-4 h-4 mr-2" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="preview">
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Config Site Tab */}
          <TabsContent value="config" className="space-y-6">

            {!config && !editing ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Site não configurado</h3>
                  <p className="text-muted-foreground mb-4">
                    O site principal ainda não foi configurado pelo administrador.
                  </p>
                  <Button onClick={() => setEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Configurar Agora
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {/* Formulário de Edição */}
                {editing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Edit3 className="w-5 h-5" />
                          Editando Configurações
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setEditing(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSave} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="site_url">URL do Site Principal</Label>
                        <Input
                          id="site_url"
                          type="url"
                          value={formData.site_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                          placeholder="https://www.seusite.com.br"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição do site que aparecerá nos apps"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ativo"
                          checked={formData.ativo}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                        />
                        <Label htmlFor="ativo">Site ativo nos aplicativos</Label>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex justify-end">
                    <Button onClick={() => setEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar Configurações
                    </Button>
                  </div>
                )}

                {/* Preview nos Apps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Preview nos Apps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Como aparecerá nos apps:</h3>
                      
                      <div className="bg-background border rounded-lg p-4 max-w-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Site Oficial</h4>
                            <p className="text-sm text-muted-foreground">
                              {(editing ? formData.descricao : config?.descricao) || 
                               (editing ? formData.site_url : config?.site_url)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {editing ? formData.site_url : config?.site_url}
                            </p>
                          </div>
                          <Button size="sm">
                            Acessar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Textos da Landing Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seção Hero</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Título Principal</Label>
                      <Input
                        value={getContentValue('hero', 'title', 'Gerencie sua')}
                        onChange={(e) => updateContent('hero', 'title', e.target.value)}
                        placeholder="Gerencie sua"
                      />
                    </div>
                    <div>
                      <Label>Subtítulo (colorido)</Label>
                      <Input
                        value={getContentValue('hero', 'subtitle', 'Frota Escolar')}
                        onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                        placeholder="Frota Escolar"
                      />
                    </div>
                    <div>
                      <Label>Final do título</Label>
                      <Input
                        value={getContentValue('hero', 'title_end', 'de forma Inteligente')}
                        onChange={(e) => updateContent('hero', 'title_end', e.target.value)}
                        placeholder="de forma Inteligente"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={getContentValue('hero', 'description', 'O sistema completo para motoristas e monitoras de transporte escolar. Controle financeiro, segurança, comunicação automática e muito mais.')}
                        onChange={(e) => updateContent('hero', 'description', e.target.value)}
                        placeholder="Descrição do hero"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seção Recursos</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Título dos Recursos</Label>
                      <Input
                        value={getContentValue('features', 'title', 'Tudo que você precisa em um só lugar')}
                        onChange={(e) => updateContent('features', 'title', e.target.value)}
                        placeholder="Título da seção de recursos"
                      />
                    </div>
                    <div>
                      <Label>Descrição dos Recursos</Label>
                      <Textarea
                        value={getContentValue('features', 'description', 'O RotaFácil oferece todas as ferramentas necessárias para gerenciar seu transporte escolar de forma profissional e eficiente.')}
                        onChange={(e) => updateContent('features', 'description', e.target.value)}
                        placeholder="Descrição da seção de recursos"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seção Call-to-Action</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Título do CTA</Label>
                      <Input
                        value={getContentValue('cta', 'title', 'Pronto para revolucionar seu transporte escolar?')}
                        onChange={(e) => updateContent('cta', 'title', e.target.value)}
                        placeholder="Título do call-to-action"
                      />
                    </div>
                    <div>
                      <Label>Descrição do CTA</Label>
                      <Textarea
                        value={getContentValue('cta', 'description', 'Junte-se a centenas de motoristas que já transformaram seus negócios com o RotaFácil. Comece hoje mesmo, é grátis!')}
                        onChange={(e) => updateContent('cta', 'description', e.target.value)}
                        placeholder="Descrição do call-to-action"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={getContentValue('cta', 'button_text', 'Cadastrar Agora - É Gratuito')}
                        onChange={(e) => updateContent('cta', 'button_text', e.target.value)}
                        placeholder="Texto do botão principal"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Banners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Banner */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adicionar Novo Banner</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Título do Banner</Label>
                      <Input
                        value={newBanner.title}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título do banner"
                      />
                    </div>
                    <div>
                      <Label>Descrição (opcional)</Label>
                      <Input
                        value={newBanner.description}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do banner"
                      />
                    </div>
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input
                        value={newBanner.image_url}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <Label>Link do Banner (opcional)</Label>
                      <Input
                        value={newBanner.link_url}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, link_url: e.target.value }))}
                        placeholder="https://exemplo.com"
                      />
                    </div>
                    <Button onClick={addBanner} className="w-fit">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Banner
                    </Button>
                  </div>
                </div>

                {/* Existing Banners */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Banners Existentes</h3>
                  {banners.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum banner cadastrado.</p>
                  ) : (
                    <div className="grid gap-4">
                      {banners.map((banner) => (
                        <Card key={banner.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img 
                                src={banner.image_url} 
                                alt={banner.title}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{banner.title}</h4>
                                {banner.description && (
                                  <p className="text-sm text-muted-foreground">{banner.description}</p>
                                )}
                                {banner.link_url && (
                                  <p className="text-xs text-blue-600">{banner.link_url}</p>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteBanner(banner.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aparência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cores</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Cor de Fundo</Label>
                      <Input
                        type="color"
                        value={getContentValue('appearance', 'background_color', '#0a0a0a')}
                        onChange={(e) => updateContent('appearance', 'background_color', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Cor do Texto</Label>
                      <Input
                        type="color"
                        value={getContentValue('appearance', 'text_color', '#f7f7f7')}
                        onChange={(e) => updateContent('appearance', 'text_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipografia</h3>
                  <div>
                    <Label>Fonte Principal</Label>
                    <Select 
                      value={getContentValue('appearance', 'font_family', 'Inter')}
                      onValueChange={(value) => updateContent('appearance', 'font_family', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Lora">Lora</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview da Landing Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Button 
                    onClick={() => window.open('/landing', '_blank')}
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Landing Page em Nova Aba
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visualize como a landing page aparecerá para os visitantes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  );
}