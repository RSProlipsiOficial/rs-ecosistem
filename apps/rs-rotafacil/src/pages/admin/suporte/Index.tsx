import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Save, Loader2, Bot, Type, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSuggestionManager } from "@/components/admin/suggestions/AdminSuggestionManager";


export default function SupportIndex() {
  const [whatsapp, setWhatsapp] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [supportName, setSupportName] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'support_config')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const config = data.value as any;
        setWhatsapp(config.whatsapp || "");
        setAiPrompt(config.ai_prompt || "");
        setSupportName(config.support_name || "Suporte Rota Fácil");
        setWhatsappMessage(config.whatsapp_message || "Olá! Gostaria de falar com o suporte.");
      } else {
        setAiPrompt("Você é o assistente inteligente da plataforma Rota Fácil. Sua missão é ajudar os usuários (transportadores escolares) com dúvidas sobre alunos, vans e financeiro. Seja cordial, direto e use os dados do sistema para dar respostas precisas.");
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const config = {
        whatsapp,
        ai_prompt: aiPrompt,
        support_name: supportName,
        whatsapp_message: whatsappMessage
      };

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'support_config',
          value: config as any
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      console.error('CRITICAL SAVE ERROR:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl p-4 md:p-6 mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gold/10 rounded-xl border border-gold/20">
            <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gold" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight italic">Suporte & IA</h1>
            <p className="text-muted-foreground font-black uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
              Portal de Gestão de Contato e Inteligência
            </p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-black-lighter border border-gold/40 p-1 flex gap-1 overflow-x-auto custom-scrollbar mb-8">
            <TabsTrigger value="config" className="flex-1 min-w-[120px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
              <Bot className="h-3.5 w-3.5" />
              IA & Contato
            </TabsTrigger>
            <TabsTrigger value="sugestoes" className="flex-1 min-w-[120px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Sugestões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6 outline-none">
            <div className="grid gap-6">

              <Card className="bg-black-secondary border border-gold/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-black border-b border-gold/10">
                  <CardTitle className="flex items-center gap-2 text-gold uppercase tracking-tight italic font-black text-sm md:text-base">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gold animate-pulse" />
                    WhatsApp do Suporte Central
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="supportName" className="text-[10px] md:text-xs font-black text-gold/60 uppercase tracking-widest">Nome de Exibição</Label>
                      <Input
                        id="supportName"
                        placeholder="Ex: Roberto - Rota Fácil"
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        className="bg-black-lighter border-gold/20 text-white h-11 md:h-12 focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-[10px] md:text-xs font-black text-gold/60 uppercase tracking-widest">Número do WhatsApp (com DDD)</Label>
                      <Input
                        id="whatsapp"
                        placeholder="5511999999999"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="bg-black-lighter border-gold/20 text-white h-11 md:h-12 focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappMessage" className="text-slate-200">Mensagem Inicial</Label>
                    <Input
                      id="whatsappMessage"
                      placeholder="Olá! Como posso ajudar?"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black-secondary border border-gold/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-black border-b border-gold/10">
                  <CardTitle className="flex items-center gap-2 text-gold uppercase tracking-tight italic font-black text-sm md:text-base">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-gold animate-pulse" />
                    Regras de Inteligência (Core)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="bg-black-lighter p-4 rounded-lg border border-gold/10 font-mono text-[9px] md:text-[10px] leading-relaxed text-gold/80 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <p>VOCÊ É O CÉREBRO SUPREMO E CONSULTOR ESTRATÉGICO DA PLATAFORMA ROTA FÁCIL.</p>
                    <br />
                    <p>DIFERENCIAÇÃO CONCEITUAL:</p>
                    <p>- ALUNOS: São seus CLIENTES (Fonte de Renda).</p>
                    <p>- COLABORADORES: São seus FUNCIONÁRIOS (Motoristas/Monitoras).</p>
                    <br />
                    <p>MAPA DO ECOSSISTEMA (12 MÓDULOS):</p>
                    <p>1. Painel | 2. Alunos | 3. Financeiro | 4. Mensalidades | 5. Colaboradores | 6. Frota/Vans | 7. Treinamentos | 8. Upgrade | 9. Importar | 10. Indicações | 11. Suporte | 12. Perfil</p>
                    <br />
                    <p>REGRAS DE FERRAMENTAS (SUPER IA):</p>
                    <p>- Alunos/Mensalidades/Inadimplentes: 'get_student_info', 'get_overdue_analysis'</p>
                    <p>- Fluxo de Caixa Diário: 'get_daily_cashflow'</p>
                    <p>- Frota (Vans, Manutenções, Checklists): 'get_fleet_details'</p>
                    <p>- Treinamentos (Vídeos, Módulos): 'get_training_status'</p>
                    <p>- Planos & Upgrade: 'get_plans_and_billing'</p>
                    <p>- Colaboradores (Motoristas/Monitoras): 'get_team_members'</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black-secondary border border-gold/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-black border-b border-gold/10">
                  <CardTitle className="flex items-center gap-2 text-gold uppercase tracking-tight italic font-black text-sm md:text-base">
                    <Type className="w-4 h-4 md:w-5 md:h-5 text-gold animate-pulse" />
                    Instrução Personalizada
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-[10px] font-black text-gold/60 uppercase tracking-widest italic tracking-tighter">O "Toque Final": Defina a personalidade ou gírias</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Ex: Responda de forma alegre e chame os alunos de 'passageiros mirins'..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[150px] md:min-h-[200px] bg-black-lighter border-gold/20 text-white font-mono text-xs md:text-sm leading-relaxed focus:border-gold/50"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4" key={saving ? 'saving' : 'idle'}>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto min-w-[200px] bg-gold hover:bg-gold/90 text-black px-10 py-4 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Gravando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Salvar Suporte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sugestoes" className="outline-none">
            <AdminSuggestionManager />
          </TabsContent>
        </Tabs>

      </div>
    </AdminLayout>
  );
}