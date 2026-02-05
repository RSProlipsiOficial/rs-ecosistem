import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Sparkles,
  Crown,
  Mail,
  Gift,
  Share2,
  Copy,
  TrendingUp,
  Target,
  ExternalLink,
  Building2,
  Link as LinkIcon,
  CheckCircle2,
  Users,
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function IndicacaoIndex() {
  const [codigoRef, setCodigoRef] = useState('');
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [indicados, setIndicados] = useState<any[]>([]);
  const [branding, setBranding] = useState({ company_name: "RotaFácil", falcon_url: "" });
  const { toast } = useToast();

  useEffect(() => {
    carregarDadosConsultor();
    carregarBranding();
  }, []);

  const carregarBranding = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle();

    if (data?.value) {
      setBranding(data.value as any);
    }
  };

  useEffect(() => {
    if (codigoRef) {
      // Use the current domain or fallback to production
      const domain = typeof window !== 'undefined' ? window.location.origin : 'https://rotafacil.rsprolipsi.com.br';
      setLinkGerado(`${domain}/indicacao/${codigoRef}`);
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

      // 1. Carregar dados do consultor e perfil para sincronizar
      const [{ data: consultor }, { data: profile }] = await Promise.all([
        (supabase as any)
          .from('consultores')
          .select('username, nome')
          .eq('user_id', user.id)
          .maybeSingle(),
        (supabase as any)
          .from('user_profiles')
          .select('mmn_id, nome_completo')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      // Prioridade para o username do consultor, mas se o perfil tiver MMN_ID e consultor não, usa do perfil
      const codigoDefinitivo = (consultor as any)?.username || (profile as any)?.mmn_id || user.email?.split('@')[0] || '';
      setCodigoRef(codigoDefinitivo);
      setNomeExibicao((consultor as any)?.nome || (profile as any)?.nome_completo || user.user_metadata?.nome_completo || user.email?.split('@')[0] || '');

      // Se houver divergência, sincronizar no estado
      if ((consultor as any)?.username && (profile as any)?.mmn_id && (consultor as any).username !== (profile as any).mmn_id) {
        console.log('Sincronizando IDs divergentes...');
      }

      // 2. Carregar indicados (leads)
      const { data: leads, error: leadsError } = await (supabase as any)
        .from('indicados')
        .select('*')
        .eq('indicado_por_id', user.id)
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Erro ao carregar indicados:', leadsError);
      } else {
        setIndicados(leads || []);
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
    const formattedCode = codigoRef.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!formattedCode || formattedCode.length < 3) {
      toast({
        title: "Código inválido",
        description: "O código deve ter pelo menos 3 caracteres (apenas letras e números).",
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

      // 1. Atualizar ou Criar na tabela de consultores
      const { error: consultorError } = await (supabase as any)
        .from('consultores')
        .upsert({
          user_id: user.id,
          username: formattedCode,
          email: user.email,
          nome: nomeExibicao || user.user_metadata?.nome_completo || user.email?.split('@')[0]
        }, { onConflict: 'user_id' });

      if (consultorError) {
        if (consultorError.code === '23505') {
          throw new Error("Este código de link já está sendo usado por outro consultor. Tente um diferente.");
        }
        throw consultorError;
      }

      // 2. Sincronizar com user_profiles (Nome e MMN ID)
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update({
          mmn_id: formattedCode,
          nome_completo: nomeExibicao || user.user_metadata?.nome_completo || user.email?.split('@')[0]
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao sincronizar perfil:', profileError);
      }

      setCodigoRef(formattedCode);

      toast({
        title: "Sucesso!",
        description: "Seu código e nome de exibição foram salvos e sincronizados em todo o sistema.",
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

    const mensagem = `🚌 *Conheça o ${branding.company_name}*\n\nSistema completo para gestão de transporte escolar!\n\n✅ Controle de alunos e mensalidades\n✅ Gestão financeira\n✅ Checklist de segurança\n✅ Integração WhatsApp\n✅ E muito mais!\n\n🎁 Cadastre-se usando meu link:\n${linkGerado}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const redirecionarRSProlipsi = () => {
    const codigo = codigoRef || branding.company_name.toUpperCase().replace(/\s/g, '');
    const linkRSProlipsi = `https://rsprolipsi.com/cadastro?ref=${codigo}`;
    window.open(linkRSProlipsi, '_blank');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Carregando painel de indicações...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Section Compact (Style Print) */}
        <div className="bg-black-secondary border border-gold/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -mr-10 -mt-10 blur-2xl" />
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-lg">
              {branding.falcon_url ? (
                <img src={branding.falcon_url} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
              ) : (
                <Gift className="h-10 w-10 text-gold" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">Sistema de <span className="text-gold">Indicações</span></h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                Compartilhe o {branding.company_name} e acompanhe seus indicados
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid (Side-by-side on mobile per print) */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <div className="bg-black-secondary p-4 rounded-2xl text-center border border-gold/10 shadow-lg group hover:border-gold/30 transition-all">
            <p className="text-slate-500 text-[8px] md:text-[10px] uppercase font-black mb-1 tracking-widest">Total Leads</p>
            <p className="text-xl md:text-3xl font-black text-white">{indicados.length}</p>
          </div>
          <div className="bg-black-secondary p-4 rounded-2xl text-center border border-gold/10 shadow-lg group hover:border-green-500/30 transition-all">
            <p className="text-slate-500 text-[8px] md:text-[10px] uppercase font-black mb-1 tracking-widest">Convertidos</p>
            <p className="text-xl md:text-3xl font-black text-green-500">
              {indicados.filter(i => i.status === 'convertido').length}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Link Generation Card */}
          <Card className="lg:col-span-2 shadow-card border-sidebar-border bg-black-secondary">
            <CardHeader className="border-b border-sidebar-border bg-black-primary/50">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gold" />
                <CardTitle className="text-gold">Seu Link de Indicação</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Personalize seu código para deixar seus links mais profissionais.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-black-primary/50 border border-gold/10 rounded-xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Nome de Exibição Atual</p>
                    <p className="text-xl font-bold text-foreground">{nomeExibicao || "Não configurado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Seu Código de Link</p>
                    <p className="text-xl font-bold text-foreground">{codigoRef || "Não configurado"}</p>
                  </div>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full md:w-auto border-gold/20 hover:bg-gold hover:text-black text-gold font-black uppercase tracking-tighter italic h-10 rounded-xl transition-all"
                  >
                    <Link to="/perfil">
                      <User className="h-4 w-4 mr-2" />
                      Alterar no Perfil
                    </Link>
                  </Button>
                </div>
              </div>

              {linkGerado && (
                <div className="border rounded-xl p-5 bg-secondary/30 border-primary/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">Link configurado e pronto!</span>
                  </div>
                  <div className="bg-background border rounded-lg p-3 text-sm font-mono break-all text-foreground/80">
                    {linkGerado}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copiarLink} variant="outline" className="flex-1 h-10 border-primary/20">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button onClick={compartilharWhatsApp} className="flex-1 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-card border-sidebar-border bg-black-secondary">
            <CardHeader className="border-b border-sidebar-border bg-black-primary/50">
              <CardTitle className="text-gold">Resumo de Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nível Atual</p>
                  <p className="text-lg font-bold">Consultor Bronze</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed border-muted-foreground/30">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Conversão</span>
                  <span className="font-bold">
                    {indicados.length > 0 ? ((indicados.filter(i => i.status === 'convertido').length / indicados.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Leads (Mês)</span>
                  <span className="font-bold">
                    {indicados.filter(i => {
                      const date = new Date(i.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={redirecionarRSProlipsi}
                className="w-full mt-4 h-11 border-primary/20 hover:bg-primary/5 text-primary font-bold"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Central RS Prólipsi
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lead List Table */}
        <Card className="shadow-sm overflow-hidden border-none bg-card">
          <CardHeader className="bg-muted/30 border-b border-muted">
            <CardTitle className="text-xl">Gestão de Indicados</CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>Acompanhe todos os leads capturados pelo seu link.</span>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 w-fit px-2 py-0.5 rounded">
                Nota: Esta lista mostra apenas seus indicados diretos. Cadastros feitos pelos seus indicados (como o do Mateus) ficam visíveis na rede deles.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {indicados.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">
                Sua lista de indicados está vazia. Comece a compartilhar seu link!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-muted">
                    <tr>
                      <th className="px-6 py-4">Nome / Email</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Contato</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted text-sm">
                    {indicados.map((indicado) => (
                      <tr key={indicado.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{indicado.nome_completo}</div>
                          <div className="text-xs text-muted-foreground">{indicado.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {indicado.created_at ? format(new Date(indicado.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground/80">
                          {indicado.whatsapp || indicado.telefone || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${indicado.status === 'convertido' ? 'bg-green-500/10 text-green-500' :
                            indicado.status === 'contatado' ? 'bg-blue-500/10 text-blue-500' :
                              indicado.status === 'perdido' ? 'bg-red-500/10 text-red-500' :
                                'bg-amber-500/10 text-amber-500'
                            }`}>
                            {indicado.status || 'novo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild className="text-green-500 hover:text-green-600 hover:bg-green-500/10">
                            <a href={`https://wa.me/${indicado.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, title: "Fale rápido", desc: `Contate seu lead em menos de 10 minutos para converter mais.` },
            { icon: TrendingUp, title: "Seja claro", desc: `Explique os benefícios de automação do ${branding.company_name}.` },
            { icon: Share2, title: "Use Stories", desc: "Mostre o sistema funcionando no seu dia a dia." }
          ].map((item, i) => (
            <Card key={i} className="border-dashed bg-muted/20 border-muted">
              <CardContent className="p-6 flex items-start gap-4">
                <item.icon className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
