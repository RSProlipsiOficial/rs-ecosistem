import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, MessageSquare, Save, Sparkles, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WhatsAppPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [config, setConfig] = useState({
    system_prompt: '',
    ai_memory: ''
  });

  const rsAutoUrl = "http://localhost:5007?view=simple";

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ai_configuration')
        .select('system_prompt, ai_memory')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setConfig({
          system_prompt: data.system_prompt || '',
          ai_memory: data.ai_memory || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
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
        description: "Configurações de mensagem salvas com sucesso!",
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

  if (loading) return null;

  return (
    <MainLayout>
      <div className="space-y-6 h-[calc(100vh-100px)]">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gold">WhatsApp & Automação</h1>
          <p className="text-muted-foreground italic">
            Gerencie sua conexão e mensagens inteligentes via RS Auto.
          </p>
        </div>

        <Tabs defaultValue="manager" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-black-lighter border border-gold/20">
            <TabsTrigger value="manager" className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-black">
              <Smartphone className="w-4 h-4" />
              Conectar (RS Auto)
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-black">
              <MessageSquare className="w-4 h-4" />
              Configurar Mensagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manager" className="mt-6 flex-1 min-h-0">
            <div className="border border-gold/10 rounded-xl overflow-hidden bg-black-lighter w-full h-full min-h-[600px] flex flex-col">
              <div className="bg-black/40 border-b border-gold/10 p-2 flex justify-end">
                <Button variant="ghost" size="sm" className="text-gold text-xs" onClick={() => window.open(rsAutoUrl, '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-2" /> Abrir em nova aba
                </Button>
              </div>
              <iframe src={rsAutoUrl} className="w-full flex-1 border-none" title="RS Auto Credentials" />
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="grid gap-6">
              <div className="bg-black-lighter border border-gold/10 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gold flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Instruções para o Robô
                  </h2>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="bg-gold text-black hover:bg-gold/80"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Mensagem"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gold/80">
                      Descreva como você quer que as mensagens sejam enviadas
                    </label>
                    <Textarea
                      placeholder="Ex: Olá [NOME], passando para lembrar do vencimento da mensalidade amanhã dia [DATA]. Meu PIX é 11999999999."
                      value={config.ai_memory}
                      onChange={(e) => setConfig(prev => ({ ...prev, ai_memory: e.target.value }))}
                      className="min-h-[200px] bg-black/40 border-gold/20 focus:border-gold resize-none"
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Dica: Use colchetes para indicar onde a IA deve inserir informações como [NOME] ou [DATA].
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gold/80">
                      Personalidade do Robô (Opcional)
                    </label>
                    <Textarea
                      placeholder="Ex: Seja bem educado, use emojis e chame os pais pelo nome."
                      value={config.system_prompt}
                      onChange={(e) => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                      className="min-h-[100px] bg-black/40 border-gold/20 focus:border-gold resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default WhatsAppPage;
