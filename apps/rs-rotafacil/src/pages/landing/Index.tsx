import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bus,
  Shield,
  Smartphone,
  Clock,
  Users,
  Calculator,
  MessageSquare,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LandingContent {
  id: string;
  section: string;
  content_key?: string;
  content_type?: string;
  content_value?: string | null;
  image_url: string | null;
  title?: string;
  link_url?: string;
  active?: boolean;
}

export default function LandingIndex() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [content, setContent] = useState<LandingContent[]>([]);
  const [banners, setBanners] = useState<LandingContent[]>([]);

  const [branding, setBranding] = useState({ logo_url: "", company_name: "" });

  useEffect(() => {
    loadContent();
    loadBranding();
  }, []);

  const loadBranding = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle();

    if (data?.value) {
      setBranding(data.value as any);
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('landing_content')
        .select('*');

      if (error) {
        console.error('Erro Supabase:', error);
        setErrorMsg(`Erro de conexão: ${error.message}`);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('Banco de dados retornou vazio para landing_content');
        // Fallback para não ficar em branco caso o RLS bloqueie
        setContent([]);
      } else {
        setContent(data);
      }

      // Depuração profunda
      console.log('[DEBUG LANDING] Dados recebidos:', data?.length || 0);

      const { data: bannerData } = await supabase
        .from('landing_banners')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      setBanners((bannerData as any) || []);
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      setErrorMsg(error.message || 'Erro desconhecido ao carregar.');
    }
  };

  const getContentFromData = (data: LandingContent[] | null, section: string, key: string, defaultValue: string = '') => {
    const item = data?.find(c => c.section === section && c.content_key === key);
    return item?.content_value || defaultValue;
  };

  const getContent = (section: string, key: string, defaultValue: string = '') => {
    return getContentFromData(content, section, key, defaultValue);
  };

  const loadFont = (fontFamily: string) => {
    const fontMap: Record<string, string> = {
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
      'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      'Lora': 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
      'Source Sans Pro': 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap'
    };

    const fontUrl = fontMap[fontFamily];
    if (fontUrl && !document.querySelector(`link[href="${fontUrl}"]`)) {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  const getImage = (section: string, key: string, defaultUrl: string = '') => {
    const item = content.find(c => c.section === section && c.content_key === key);
    return item?.image_url || defaultUrl;
  };

  const getAppearance = () => {
    const backgroundColor = getContent('appearance', 'background_color', '#0a0a0a');
    const textColor = getContent('appearance', 'text_color', '#f7f7f7');
    const fontFamily = getContent('appearance', 'font_family', 'Inter');
    const primaryColor = getContent('appearance', 'primary_color', '#ffd700');
    return { backgroundColor, textColor, fontFamily, primaryColor };
  };

  const appearance = getAppearance();

  const features = [
    {
      icon: Bus,
      title: getContent('features', 'f1_title', 'Gestão de Frota'),
      description: getContent('features', 'f1_desc', 'Controle completo de suas vans escolares com checklist diário de segurança')
    },
    {
      icon: Users,
      title: getContent('features', 'f2_title', 'Cadastro de Alunos'),
      description: getContent('features', 'f2_desc', 'Gerencie todos os alunos, responsáveis e informações de contato')
    },
    {
      icon: Calculator,
      title: getContent('features', 'f3_title', 'Controle Financeiro'),
      description: getContent('features', 'f3_desc', 'Organize ganhos, gastos e mensalidades de forma automática')
    },
    {
      icon: MessageSquare,
      title: getContent('features', 'f4_title', 'IA para WhatsApp'),
      description: getContent('features', 'f4_desc', 'Comunicação automática de avisos e lembretes via WhatsApp')
    },
    {
      icon: Shield,
      title: getContent('features', 'f5_title', 'Relatórios Detalhados'),
      description: getContent('features', 'f5_desc', 'Acompanhe o desempenho do seu negócio com dados precisos')
    },
    {
      icon: CheckCircle,
      title: getContent('features', 'f6_title', 'Suporte VIP'),
      description: getContent('features', 'f6_desc', 'Atendimento prioritário para garantir sua operação sem interrupções')
    }
  ];


  const benefits = [
    "Reduza 80% do tempo gasto com controle manual",
    "Aumente a satisfação dos pais com comunicação automática",
    "Tenha controle total da sua operação financeira",
    "Garanta a segurança com checklists obrigatórios",
    "Monitore presença dos alunos em tempo real",
    "Automatize cobranças e lembretes de pagamento"
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appearance.backgroundColor,
        color: appearance.textColor,
        fontFamily: appearance.fontFamily
      }}
    >
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: (branding as any).logo_show_bg === true ? ((branding as any).logo_bg_color || '#ffffff') : 'transparent',
                  border: (branding as any).logo_show_bg === true ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <img
                  src={branding.logo_url || (branding as any).falcon_url || "/assets/branding/logo-horizontal.png"}
                  alt={branding.company_name || "Logo"}
                  style={{ height: `${(branding as any).logo_height || 40}px` }}
                  className="w-auto object-contain"
                />
              </div>
              {branding.company_name && branding.company_name.trim() !== '' && (
                <span className="text-xl font-bold">{branding.company_name}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(getContent('header', 'cta_link', '/consultor/login'))}
                className="bg-gold hover:bg-gold/90 text-black font-bold"
              >
                {getContent('header', 'cta_label', 'Acesso Painel')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className="py-8 !bg-black border-y border-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.link_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden rounded-2xl shadow-lg hover:scale-105 transition-all border border-gold/20"
                >
                  <img
                    src={banner.image_url || ''}
                    alt={banner.title || 'Banner'}
                    className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <h3 className="text-white font-black uppercase text-[10px] tracking-widest">{banner.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                  Gerencie sua <br />
                  <span className="text-gold">Frota Escolar</span> <br />
                  de forma Inteligente
                </h1>
                <p className="text-lg text-white/50 mb-8 max-w-xl leading-relaxed">
                  O sistema completo para motoristas e monitoras de transporte escolar. Controle financeiro, segurança, comunicação automática e muito mais.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-start items-center mt-12 relative z-30">
                  <Button
                    size="lg"
                    onClick={() => navigate(getContent('hero', 'cta1_link', '/consultor/cadastro?ref=rsprolipsi'))}
                    className="w-full sm:w-auto text-sm px-8 h-14 font-semibold bg-[#EAB308]/90 hover:bg-[#EAB308] text-black transition-all rounded-lg flex items-center gap-2"
                  >
                    {getContent('hero', 'cta1_text', 'Começar Gratuitamente')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate(getContent('hero', 'cta2_link', '/demonstracao'))}
                    className="w-full sm:w-auto text-sm px-8 h-14 font-semibold border-white/10 text-white hover:bg-white/5 transition-all rounded-lg flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 mr-1 fill-current" />
                    {getContent('hero', 'cta2_text', 'Ver Demonstração')}
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-start gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                    ))}
                  </div>
                  <span className="text-sm text-white/40 font-medium">Avaliado por 200+ motoristas</span>
                </div>
              </div>
            </div>

            <div className="relative group lg:block">
              <div className="relative z-10 animate-scale-in">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src={getImage('hero', 'hero_image', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                  alt="Frota de vans escolares"
                  className="relative rounded-2xl shadow-2xl border border-white/5 w-full object-cover aspect-[4/3] lg:aspect-square xl:aspect-video"
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {getContent('features', 'title', 'Tudo que você precisa em um só lugar')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {getContent('features', 'description', 'O ecossistema Rota Fácil oferece todas as ferramentas necessárias para gerenciar seu transporte escolar de forma profissional e eficiente.')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover-scale">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {getContent('benefits', 'title', 'Por que escolher a Rota Fácil?')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {getContent('benefits', 'description', 'Mais de 200 motoristas já confiam na Rota Fácil para gerenciar seus negócios de transporte escolar.')}
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-black font-black uppercase tracking-widest px-10 py-8 h-auto hover:scale-105 transition-all shadow-gold-sm"
                onClick={() => navigate(getContent('benefits', 'cta_link', '/consultor/cadastro?ref=rsprolipsi'))}
              >
                {getContent('benefits', 'cta', 'Começar Gratuitamente')}
              </Button>
            </div>

            <div className="relative">
              <img
                src={getImage('benefits', 'benefits_image', 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                alt="Van escolar segura"
                className="rounded-2xl shadow-xl hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Interface simples e intuitiva
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Desenvolvido especialmente para motoristas e monitoras,
              com foco na facilidade de uso no dia a dia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Economize Tempo</h3>
              <p className="text-muted-foreground">
                Automatize tarefas repetitivas e foque no que realmente importa
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Mais Segurança</h3>
              <p className="text-muted-foreground">
                Checklists obrigatórios e controle de presença em tempo real
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Controle Total</h3>
              <p className="text-muted-foreground">
                Gerencie finanças, alunos e operação em um só lugar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-black-secondary z-0"></div>
        <div className="absolute inset-0 bg-gradient-hero opacity-30 z-0"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-12 md:p-16 rounded-[2.5rem] bg-black-secondary border border-gold/20 shadow-shadow-elegant text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gold uppercase italic tracking-tighter leading-tight">
              {getContent('cta', 'title', 'Pronto para revolucionar seu transporte escolar?')}
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
              {getContent('cta', 'description', 'Junte-se a centenas de motoristas que já transformaram seus negócios com a Rota Fácil. Comece hoje mesmo.')}
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="text-lg px-12 h-16 font-black uppercase tracking-[0.2em] bg-gradient-to-r from-gold to-gold-dark text-black hover:scale-[1.05] transition-all shadow-[0_0_30px_rgba(255,215,0,0.2)] animate-glow"
                onClick={() => navigate(getContent('cta', 'button_link', '/consultor/cadastro?ref=rsprolipsi'))}
              >
                {getContent('cta', 'button_text', 'Quero o meu agora')}
                <ChevronRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">
              Instalação imediata & Suporte VIP incluso
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="px-2 py-0.5 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: (branding as any).logo_show_bg === true ? ((branding as any).logo_bg_color || 'transparent') : 'transparent',
                    border: (branding as any).logo_show_bg === true ? '1px solid rgba(255, 215, 0, 0.1)' : 'none'
                  }}
                >
                  <img
                    src={branding.logo_url || (branding as any).falcon_url || "/assets/branding/logo-horizontal.png"}
                    alt={branding.company_name || "Logo"}
                    style={{ height: `${((branding as any).logo_height || 40) * 0.8}px` }}
                    className="w-auto object-contain"
                  />
                </div>
                {branding.company_name && branding.company_name.trim() !== '' && (
                  <span className="text-lg font-bold">{branding.company_name}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {getContent('footer', 'description', 'O sistema completo para gestão de transporte escolar.')}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tutoriais</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Contato</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a
                  href={`https://wa.me/55${getContent('footer', 'phone', '41992863922').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{getContent('footer', 'phone', '(41) 9 9286-3922')}</span>
                </a>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{getContent('footer', 'email', 'rsrotafacil@gmail.com')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{getContent('footer', 'address', 'Piraquara-Pr')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
            <p>
              {getContent('footer', 'copyright', `© ${new Date().getFullYear()} ${branding.company_name}. Todos os direitos reservados.`)}
            </p>
            <div className="flex gap-6">
              <a href={getContent('footer', 'terms_url', '/termos-de-uso')} className="hover:text-primary transition-colors">
                {getContent('footer', 'terms_label', 'Termos de Uso')}
              </a>
              <a href={getContent('footer', 'privacy_url', '/politica-privacidade')} className="hover:text-primary transition-colors">
                {getContent('footer', 'privacy_label', 'Política de Privacidade')}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante WhatsApp */}
      <a
        href={`https://wa.me/55${getContent('footer', 'phone', '41992863922').replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all flex items-center gap-3 group"
        title="Falar no WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden md:block font-semibold text-sm pr-2 group-hover:pr-3 transition-all">
          WhatsApp
        </span>
      </a>
    </div >
  );
}