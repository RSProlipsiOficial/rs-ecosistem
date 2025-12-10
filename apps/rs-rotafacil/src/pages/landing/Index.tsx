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
  content_key: string;
  content_type: string;
  content_value: string | null;
  image_url: string | null;
}

export default function LandingIndex() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [content, setContent] = useState<LandingContent[]>([]);
  const [banners, setBanners] = useState<LandingContent[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('*');

      if (error) throw error;
      
      setContent(data || []);
      setBanners(data?.filter(item => item.section === 'banners') || []);
      
      // Apply appearance settings
      const appearance = {
        backgroundColor: getContentFromData(data, 'appearance', 'background_color', '#0a0a0a'),
        textColor: getContentFromData(data, 'appearance', 'text_color', '#f7f7f7'),
        fontFamily: getContentFromData(data, 'appearance', 'font_family', 'Inter')
      };
      
      // Apply styles to body or root element
      if (appearance.fontFamily !== 'Inter') {
        loadFont(appearance.fontFamily);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  const getContentFromData = (data: LandingContent[] | null, section: string, key: string, defaultValue: string = '') => {
    const item = data?.find(c => c.section === section && c.content_key === key);
    return item?.content_value || defaultValue;
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

  const getContent = (section: string, key: string, defaultValue: string = '') => {
    const item = content.find(c => c.section === section && c.content_key === key);
    return item?.content_value || defaultValue;
  };

  const getImage = (section: string, key: string, defaultUrl: string = '') => {
    const item = content.find(c => c.section === section && c.content_key === key);
    return item?.image_url || defaultUrl;
  };

  const getAppearance = () => {
    const backgroundColor = getContent('appearance', 'background_color', '#0a0a0a');
    const textColor = getContent('appearance', 'text_color', '#f7f7f7');
    const fontFamily = getContent('appearance', 'font_family', 'Inter');
    return { backgroundColor, textColor, fontFamily };
  };

  const appearance = getAppearance();

  const features = [
    {
      icon: Bus,
      title: "Gestão de Frota",
      description: "Controle completo de suas vans escolares com checklist diário de segurança"
    },
    {
      icon: Users,
      title: "Cadastro de Alunos",
      description: "Gerencie todos os alunos, responsáveis e informações de contato"
    },
    {
      icon: Calculator,
      title: "Controle Financeiro",
      description: "Organize ganhos, gastos e mensalidades de forma automática"
    },
    {
      icon: MessageSquare,
      title: "IA para WhatsApp",
      description: "Envio automático de mensagens e cobranças via inteligência artificial"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Monitoramento de presença e comunicação direta com responsáveis"
    },
    {
      icon: Smartphone,
      title: "App Móvel",
      description: "Acesse tudo pelo celular, tablet ou computador"
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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">RotaFácil</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hidden sm:flex"
              >
                Portal do Consultor
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Acesso Consultor
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className="py-8 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="relative overflow-hidden rounded-2xl shadow-lg hover-scale">
                  <img 
                    src={banner.image_url || ''}
                    alt={banner.content_value || 'Banner'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {getContent('hero', 'title', 'Gerencie sua')}
                  <span className="text-primary block">
                    {getContent('hero', 'subtitle', 'Frota Escolar')}
                  </span>
                  {getContent('hero', 'title_end', 'de forma Inteligente')}
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl">
                  {getContent('hero', 'description', 'O sistema completo para motoristas e monitoras de transporte escolar. Controle financeiro, segurança, comunicação automática e muito mais.')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-base px-6 py-4 hover-scale"
                  onClick={() => navigate('/consultor/cadastro')}
                >
                  {getContent('hero', 'cta_primary', 'Cadastrar como Consultor')}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-base px-6 py-4"
                  onClick={() => navigate('/demo')}
                >
                  <Play className="mr-2 w-5 h-5" />
                  {getContent('hero', 'cta_secondary', 'Ver Demonstração')}
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getContent('hero', 'social_proof', 'Avaliado por 200+ motoristas')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 animate-scale-in">
                <img 
                  src={getImage('hero', 'hero_image', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                  alt="Frota de vans escolares"
                  className="rounded-2xl shadow-2xl hover-scale"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-2xl"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
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
              {getContent('features', 'description', 'O RotaFácil oferece todas as ferramentas necessárias para gerenciar seu transporte escolar de forma profissional e eficiente.')}
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
                  {getContent('benefits', 'title', 'Por que escolher o RotaFácil?')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {getContent('benefits', 'description', 'Mais de 200 motoristas já confiam no RotaFácil para gerenciar seus negócios de transporte escolar.')}
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
                className="hover-scale"
                onClick={() => navigate('/auth')}
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
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
            {getContent('cta', 'title', 'Pronto para revolucionar seu transporte escolar?')}
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {getContent('cta', 'description', 'Junte-se a centenas de motoristas que já transformaram seus negócios com o RotaFácil. Comece hoje mesmo, é grátis!')}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-base px-6 py-4 hover-scale"
            onClick={() => navigate('/auth')}
          >
            {getContent('cta', 'button_text', 'Cadastrar Agora - É Gratuito')}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">RotaFácil</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O sistema completo para gestão de transporte escolar.
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
              <h4 className="font-semibold">Contato</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@rotafacil.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 RotaFácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}