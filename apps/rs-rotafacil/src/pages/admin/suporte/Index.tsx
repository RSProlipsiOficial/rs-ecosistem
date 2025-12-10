import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Phone, Mail, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface SuporteConfig {
  id: string;
  whatsapp_suporte: string | null;
  mensagem_suporte: string;
  email_suporte: string | null;
  horario_atendimento: string | null;
  link_video_principal: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminSuporteIndex() {
  const [config, setConfig] = useState<SuporteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    whatsapp_suporte: "",
    mensagem_suporte: "",
    email_suporte: "",
    horario_atendimento: "",
    link_video_principal: ""
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('suporte_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setConfig(data);
        setFormData({
          whatsapp_suporte: data.whatsapp_suporte || "",
          mensagem_suporte: data.mensagem_suporte || "",
          email_suporte: data.email_suporte || "",
          horario_atendimento: data.horario_atendimento || "",
          link_video_principal: data.link_video_principal || ""
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de suporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const dataToSave = {
        whatsapp_suporte: formData.whatsapp_suporte || null,
        mensagem_suporte: formData.mensagem_suporte || "Olá! Preciso de ajuda com o aplicativo RotaFácil.",
        email_suporte: formData.email_suporte || null,
        horario_atendimento: formData.horario_atendimento || null,
        link_video_principal: formData.link_video_principal || null
      };

      if (config) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('suporte_config')
          .update(dataToSave)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('suporte_config')
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações de suporte salvas com sucesso!",
      });

      loadConfig(); // Recarregar para obter dados atualizados
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">Carregando configurações...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Suporte</h1>
            <p className="text-muted-foreground">
              Configure as informações de contato e mensagens de suporte
            </p>
          </div>
          
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* WhatsApp Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp_suporte">Número do WhatsApp</Label>
                <Input
                  id="whatsapp_suporte"
                  value={formData.whatsapp_suporte}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_suporte: e.target.value }))}
                  placeholder="5511999999999"
                  type="tel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite apenas números (código do país + DDD + número)
                </p>
              </div>
              
              <div>
                <Label htmlFor="mensagem_suporte">Mensagem Padrão do WhatsApp</Label>
                <Textarea
                  id="mensagem_suporte"
                  value={formData.mensagem_suporte}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem_suporte: e.target.value }))}
                  placeholder="Olá! Preciso de ajuda com o aplicativo RotaFácil..."
                  rows={3}
                />
              </div>
              
              {formData.whatsapp_suporte && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Preview do link:</p>
                  <code className="text-xs text-muted-foreground break-all">
                    https://wa.me/{formData.whatsapp_suporte}
                    {formData.mensagem_suporte && `?text=${encodeURIComponent(formData.mensagem_suporte)}`}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                E-mail de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email_suporte">E-mail de Suporte</Label>
                <Input
                  id="email_suporte"
                  type="email"
                  value={formData.email_suporte}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_suporte: e.target.value }))}
                  placeholder="suporte@rotafacil.com"
                />
              </div>
              
              <div>
                <Label htmlFor="horario_atendimento">Horário de Atendimento</Label>
                <Input
                  id="horario_atendimento"
                  value={formData.horario_atendimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_atendimento: e.target.value }))}
                  placeholder="Segunda a Sexta, 9h às 18h"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutorial Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Tutorial Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="link_video_principal">Link do Tutorial Principal</Label>
              <Input
                id="link_video_principal"
                type="url"
                value={formData.link_video_principal}
                onChange={(e) => setFormData(prev => ({ ...prev, link_video_principal: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este será o tutorial principal exibido na tela de ajuda dos apps
              </p>
            </div>
            
            {formData.link_video_principal && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(formData.link_video_principal, '_blank')}
                >
                  Visualizar Tutorial
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview das Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Preview das Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">WhatsApp</h4>
                  {formData.whatsapp_suporte ? (
                    <div className="space-y-2">
                      <p className="text-sm">Número: +{formData.whatsapp_suporte}</p>
                      {formData.mensagem_suporte && (
                        <p className="text-sm text-muted-foreground">
                          Mensagem: {formData.mensagem_suporte}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não configurado</p>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">E-mail</h4>
                  {formData.email_suporte ? (
                    <div className="space-y-2">
                      <p className="text-sm">{formData.email_suporte}</p>
                      {formData.horario_atendimento && (
                        <p className="text-sm text-muted-foreground">
                          Horário: {formData.horario_atendimento}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não configurado</p>
                  )}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Tutorial Principal</h4>
                {formData.link_video_principal ? (
                  <p className="text-sm break-all">{formData.link_video_principal}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Não configurado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}