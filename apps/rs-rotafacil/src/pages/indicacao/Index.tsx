import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Gift, 
  Share2, 
  Copy,
  TrendingUp,
  Target,
  ExternalLink,
  Building2,
  Link as LinkIcon,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function IndicacaoIndex() {
  const [codigoRef, setCodigoRef] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDadosConsultor();
  }, []);

  useEffect(() => {
    if (codigoRef) {
      setLinkGerado(`https://rotafacil.app/cadastro?ref=${codigoRef}`);
    } else {
      setLinkGerado('');
    }
  }, [codigoRef]);

  const carregarDadosConsultor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: consultor } = await supabase
        .from('consultores')
        .select('uid, username, email')
        .eq('uid', user.id)
        .maybeSingle();

      if (consultor) {
        const codigo = consultor.username || consultor.email.split('@')[0];
        setCodigoRef(codigo);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarCodigoRef = async () => {
    if (!codigoRef || codigoRef.length < 3) {
      toast({
        title: "Código inválido",
        description: "O código deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('consultores')
        .update({ username: codigoRef })
        .eq('uid', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu código de indicação foi salvo.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar código:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o código.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const copiarLink = () => {
    if (!linkGerado) {
      toast({
        title: "Aviso",
        description: "Digite um código primeiro para gerar o link.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(linkGerado);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  const compartilharWhatsApp = () => {
    if (!linkGerado) {
      toast({
        title: "Aviso",
        description: "Digite um código primeiro para gerar o link.",
        variant: "destructive",
      });
      return;
    }

    const mensagem = `🚌 *Conheça o RotaFácil*\n\nSistema completo para gestão de transporte escolar!\n\n✅ Controle de alunos e mensalidades\n✅ Gestão financeira\n✅ Checklist de segurança\n✅ Integração WhatsApp\n✅ E muito mais!\n\n🎁 Cadastre-se usando meu link:\n${linkGerado}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const redirecionarRSProlipsi = () => {
    const codigo = codigoRef || 'ROTAFACIL';
    const linkRSProlipsi = `https://rsprolipsi.com/cadastro?ref=${codigo}`;
    window.open(linkRSProlipsi, '_blank');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Gift className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">Ganhe com Indicação</h1>
            </div>
            <p className="text-white/90 text-lg max-w-2xl">
              Compartilhe o RotaFácil e ganhe comissões. Personalize seu link de indicação e comece agora!
            </p>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card: Criar Link */}
          <Card className="border-2">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Seu Link de Indicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-base font-semibold">
                  Defina seu código personalizado:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="codigo"
                    value={codigoRef}
                    onChange={(e) => setCodigoRef(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="ex: joao123"
                    className="text-lg"
                    maxLength={20}
                  />
                  <Button 
                    onClick={salvarCodigoRef}
                    disabled={salvando || !codigoRef}
                    className="shrink-0"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use apenas letras minúsculas e números (mínimo 3 caracteres)
                </p>
              </div>

              {linkGerado && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Link gerado com sucesso!</span>
                  </div>
                  <div className="bg-muted rounded-lg p-4 border">
                    <p className="text-sm font-mono break-all">{linkGerado}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Ações */}
          <Card className="border-2">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Compartilhar Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Button 
                onClick={copiarLink}
                className="w-full h-12 text-base"
                variant="outline"
                disabled={!linkGerado}
              >
                <Copy className="h-5 w-5 mr-2" />
                Copiar Link
              </Button>
              
              <Button 
                onClick={compartilharWhatsApp}
                className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
                disabled={!linkGerado}
              >
                <Share2 className="h-5 w-5 mr-2" />
                Compartilhar no WhatsApp
              </Button>

              <div className="pt-4 border-t">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                        Como funciona?
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Compartilhe seu link e receba comissões quando alguém se cadastrar através dele.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card: Programa de Afiliados */}
        <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Programa de Afiliados RS Prólipsi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Maximize seus ganhos!</h3>
                <p className="text-muted-foreground mb-4">
                  O RotaFácil é parte do ecossistema RS Prólipsi. Torne-se um afiliado oficial 
                  e ganhe comissões com todos os nossos produtos e serviços.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    <span>Sistema de afiliados completo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    <span>Múltiplos produtos para indicar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    <span>Comissões recorrentes atrativas</span>
                  </div>
                </div>
                <Button 
                  onClick={redirecionarRSProlipsi}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Virar Afiliado RS Prólipsi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Informações */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Dicas para aumentar suas indicações</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold mb-2">📱 Redes Sociais</p>
                  <p className="text-muted-foreground">
                    Compartilhe seu link em grupos e páginas relacionadas ao transporte escolar
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold mb-2">💬 WhatsApp</p>
                  <p className="text-muted-foreground">
                    Envie para contatos que trabalham com transporte ou educação
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold mb-2">🤝 Networking</p>
                  <p className="text-muted-foreground">
                    Indique em eventos e reuniões com profissionais da área
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
