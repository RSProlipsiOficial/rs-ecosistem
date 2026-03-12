import { MiniSiteTemplate, Section, Theme } from '../types';

type NicheConfig = {
  slug: string;
  label: string;
  category: string;
  audience: string;
  headline: string;
  subheadline: string;
  offer: string;
  cta: string;
  whatsappMessage: string;
  accent: string;
  secondary: string;
  image: string;
  videoUrl: string;
};

const createSection = (
  id: string,
  type: Section['type'],
  content: Section['content'],
  style: Section['style'] = {}
): Section => ({
  id,
  type,
  content,
  style
});

const createTheme = (name: string, accent: string, secondary: string): Theme => ({
  id: `${name}-theme`,
  name,
  backgroundColor: '#050505',
  primaryColor: accent,
  secondaryColor: secondary,
  textColor: '#ffffff',
  fontFamily: 'Inter',
  backgroundType: 'color',
  customFooterText: 'RS Prolipsi MiniSite'
});

const socialLinks = (slug: string) => ([
  { platform: 'instagram' as const, url: `https://instagram.com/${slug}` },
  { platform: 'whatsapp' as const, url: `https://wa.me/5541999999999?text=Quero%20falar%20sobre%20${slug}` },
  { platform: 'website' as const, url: `https://rsprolipsi.com.br/${slug}` }
]);

const compactLeadSections = (niche: NicheConfig): Section[] => [
  createSection('hero', 'hero', {
    title: niche.headline,
    subtitle: niche.subheadline
  }),
  createSection('social', 'social', {
    title: 'Canais oficiais',
    subtitle: 'Escolha o melhor canal para falar comigo agora.',
    socialLinks: socialLinks(niche.slug)
  }),
  createSection('whatsapp', 'whatsapp', {
    title: 'Atendimento imediato',
    subtitle: niche.offer,
    label: niche.cta,
    whatsappNumber: '5541999999999',
    whatsappMessage: niche.whatsappMessage
  }, {
    backgroundColor: '#25D366',
    textColor: '#ffffff'
  })
];

const serviceFunnelSections = (niche: NicheConfig): Section[] => [
  createSection('hero', 'hero', {
    title: niche.headline,
    subtitle: niche.subheadline
  }),
  createSection('text', 'text', {
    title: 'O que voce encontra',
    subtitle: `${niche.offer} com atendimento profissional, resposta rapida e estrutura pronta para converter visitantes em clientes.`
  }, {
    textAlign: 'left'
  }),
  createSection('image', 'image-text', {
    title: 'Agenda aberta',
    subtitle: 'Atendimento com foco em resultado e experiencia premium.',
    imageSrc: niche.image
  }, {
    textAlign: 'left'
  }),
  createSection('button', 'button', {
    title: 'Receba sua proposta',
    subtitle: 'Clique abaixo para reservar seu horario.',
    label: niche.cta,
    url: `https://wa.me/5541999999999?text=${encodeURIComponent(niche.whatsappMessage)}`
  }),
  createSection('whatsapp', 'whatsapp', {
    title: 'WhatsApp comercial',
    subtitle: niche.offer,
    label: 'Falar no WhatsApp',
    whatsappNumber: '5541999999999',
    whatsappMessage: niche.whatsappMessage
  }, {
    backgroundColor: '#25D366',
    textColor: '#ffffff'
  })
];

const authoritySections = (niche: NicheConfig): Section[] => [
  createSection('hero', 'hero', {
    title: niche.headline,
    subtitle: niche.subheadline
  }),
  createSection('carousel', 'carousel', {
    title: 'Destaques do negocio',
    subtitle: 'Projetos, servicos e bastidores que reforcam sua autoridade.',
    carouselItems: [
      { imageSrc: niche.image, title: 'Resultado 1', url: '#' },
      { imageSrc: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', title: 'Resultado 2', url: '#' },
      { imageSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', title: 'Resultado 3', url: '#' }
    ],
    autoplay: true,
    autoplaySpeed: 3500
  }),
  createSection('bento', 'bento', {
    title: 'Porque escolhem esta solucao',
    subtitle: 'Argumentos de venda rapidos para facilitar a conversao.',
    bentoItems: [
      { type: 'text', title: 'Rapidez', subtitle: 'Resposta no mesmo dia', backgroundColor: niche.secondary, textColor: '#ffffff' },
      { type: 'text', title: 'Confianca', subtitle: 'Prova social e atendimento humano', backgroundColor: '#111111', textColor: '#ffffff' },
      { type: 'image', imageSrc: niche.image, url: '#' }
    ]
  }),
  createSection('video', 'video', {
    title: 'Apresentacao em video',
    subtitle: 'Use esse bloco para apresentar seu servico em menos de 60 segundos.',
    videoUrl: niche.videoUrl
  }),
  createSection('faq', 'faq', {
    title: 'Perguntas frequentes',
    faqItems: [
      { question: 'Como funciona o atendimento?', answer: 'Voce clica no botao, recebe o contato e continuamos no canal mais rapido.' },
      { question: 'Tem condicao especial?', answer: 'Sim. Existem condicoes de entrada, combos e ofertas sazonais.' }
    ]
  }),
  createSection('social', 'social', {
    title: 'Redes sociais',
    subtitle: 'Centralize todos os pontos de contato em um unico painel.',
    socialLinks: socialLinks(niche.slug)
  }),
  createSection('whatsapp', 'whatsapp', {
    title: 'Fechamento rapido',
    subtitle: niche.offer,
    label: niche.cta,
    whatsappNumber: '5541999999999',
    whatsappMessage: niche.whatsappMessage
  }, {
    backgroundColor: '#25D366',
    textColor: '#ffffff'
  })
];

const launchSections = (niche: NicheConfig): Section[] => [
  createSection('hero', 'hero', {
    title: niche.headline,
    subtitle: niche.subheadline
  }),
  createSection('countdown', 'countdown', {
    title: 'Nova campanha no ar',
    subtitle: 'Oferta especial ativa por tempo limitado.',
    targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString()
  }),
  createSection('product', 'product', {
    title: niche.offer,
    subtitle: 'Oferta principal com foco total em conversao.',
    label: niche.cta,
    price: 'R$ 97,00',
    oldPrice: 'R$ 147,00',
    imageSrc: niche.image,
    checkoutEnabled: true,
    url: '#'
  }),
  createSection('gallery', 'gallery', {
    title: 'Galeria do negocio',
    subtitle: 'Fotos prontas para reforcar valor e prova visual.',
    galleryItems: [
      { imageSrc: niche.image, title: 'Principal' },
      { imageSrc: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', title: 'Ambiente' },
      { imageSrc: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', title: 'Bastidores' }
    ]
  }),
  createSection('text', 'text', {
    title: 'Prova social',
    subtitle: '“Atendimento excelente, visual premium e conversao rapida.”'
  }),
  createSection('button', 'button', {
    title: 'Garanta sua vaga',
    subtitle: 'Clique para falar com a equipe e confirmar agora.',
    label: niche.cta,
    url: `https://wa.me/5541999999999?text=${encodeURIComponent(niche.whatsappMessage)}`
  }),
  createSection('newsletter', 'newsletter', {
    title: 'Lista VIP',
    subtitle: 'Cadastre seu melhor e-mail para receber novidades e condicoes especiais.',
    placeholderText: 'Seu melhor email',
    buttonText: 'Entrar na lista'
  }),
  createSection('whatsapp', 'whatsapp', {
    title: 'Atendimento final',
    subtitle: niche.offer,
    label: 'Atender agora',
    whatsappNumber: '5541999999999',
    whatsappMessage: niche.whatsappMessage
  }, {
    backgroundColor: '#25D366',
    textColor: '#ffffff'
  })
];

const nicheConfigs: NicheConfig[] = [
  { slug: 'clinica-estetica', label: 'Clinica Estetica', category: 'Saude e beleza', audience: 'Clientes premium', headline: 'Sua clinica com agenda cheia e visual premium', subheadline: 'Converta visitas em agendamentos com um MiniSite pronto para anuncios, Instagram e WhatsApp.', offer: 'Avaliacao personalizada e agendamento imediato', cta: 'Agendar avaliacao', whatsappMessage: 'Oi, vim pelo MiniSite e quero agendar uma avaliacao.', accent: '#D4AF37', secondary: '#1D1B16', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'petshop', label: 'Pet Shop', category: 'Pets', audience: 'Pais de pet', headline: 'Seu pet shop vendendo banho, tosa e produtos todos os dias', subheadline: 'Organize servicos, promoes e contatos em uma pagina que converte rapido.', offer: 'Banho e tosa com entrega e atendimento agil', cta: 'Agendar banho', whatsappMessage: 'Oi, quero agendar banho e tosa para meu pet.', accent: '#F59E0B', secondary: '#20160A', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'barbearia', label: 'Barbearia', category: 'Beleza masculina', audience: 'Homens que querem praticidade', headline: 'Sua barbearia com agenda lotada e visual de marca forte', subheadline: 'Mostre cortes, combos e horarios vagos com uma pagina pronta para vender.', offer: 'Corte, barba e assinatura mensal', cta: 'Reservar horario', whatsappMessage: 'Oi, quero reservar um horario na barbearia.', accent: '#C084FC', secondary: '#1E1330', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'salao-cabeleireiro', label: 'Salao de Cabeleireiro', category: 'Beleza feminina', audience: 'Clientes recorrentes', headline: 'Seu salao vendendo cortes, coloracao e tratamentos', subheadline: 'Centralize agenda, portfolio e links em um MiniSite elegante.', offer: 'Coloracao, mechas e cronograma capilar', cta: 'Agendar agora', whatsappMessage: 'Oi, quero atendimento para cabelo e gostaria de agendar.', accent: '#FB7185', secondary: '#2A1118', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'uber', label: 'Motorista de App', category: 'Mobilidade', audience: 'Passageiros e parceiros', headline: 'Seu perfil profissional para corridas, contatos e servicos', subheadline: 'Use o MiniSite para captar corridas particulares e servicos recorrentes.', offer: 'Corridas agendadas e atendimento corporativo', cta: 'Chamar no WhatsApp', whatsappMessage: 'Oi, vim pelo seu MiniSite e quero uma corrida agendada.', accent: '#22C55E', secondary: '#0E2015', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'social-media', label: 'Social Media', category: 'Marketing digital', audience: 'Empreendedores', headline: 'Seu portifolio de social media pronto para fechar contratos', subheadline: 'Mostre resultados, servicos e provas sociais em uma pagina premium.', offer: 'Gestao de redes, criativos e estrategia', cta: 'Solicitar proposta', whatsappMessage: 'Oi, quero uma proposta para social media.', accent: '#38BDF8', secondary: '#0B1B26', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'youtuber', label: 'YouTuber', category: 'Criadores', audience: 'Seguidores e patrocinadores', headline: 'Seu canal com links, produtos e parceiros em uma bio premium', subheadline: 'Concentre videos, kits de midia e contatos comerciais no mesmo lugar.', offer: 'Kit de midia, collabs e produtos', cta: 'Falar com o canal', whatsappMessage: 'Oi, quero falar sobre parceria comercial no canal.', accent: '#EF4444', secondary: '#260B0B', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'imobiliaria', label: 'Corretor Imobiliario', category: 'Imoveis', audience: 'Compradores e investidores', headline: 'Seus imoveis em destaque com atendimento imediato', subheadline: 'Exiba lancamentos, oportunidades e agendamentos de visita.', offer: 'Visitas agendadas e oportunidades exclusivas', cta: 'Agendar visita', whatsappMessage: 'Oi, vi seu MiniSite e quero agendar uma visita.', accent: '#F97316', secondary: '#2A1408', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'dentista', label: 'Dentista', category: 'Saude', audience: 'Pacientes particulares', headline: 'Seu consultorio com agenda organizada e imagem premium', subheadline: 'Capte consultas, mostre especialidades e facilite o contato do paciente.', offer: 'Avaliacao, limpeza e tratamentos especializados', cta: 'Marcar consulta', whatsappMessage: 'Oi, quero marcar uma consulta odontologica.', accent: '#06B6D4', secondary: '#0D2126', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'nutricionista', label: 'Nutricionista', category: 'Saude', audience: 'Pacientes e acompanhamento', headline: 'Seu atendimento nutricional com jornada clara e facil de contratar', subheadline: 'Mostre planos, acompanhamento e resultados em uma unica pagina.', offer: 'Consulta, plano alimentar e acompanhamento', cta: 'Quero acompanhamento', whatsappMessage: 'Oi, quero iniciar acompanhamento nutricional.', accent: '#84CC16', secondary: '#18210B', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'personal-trainer', label: 'Personal Trainer', category: 'Fitness', audience: 'Alunos e consultoria', headline: 'Seu atendimento fitness com oferta clara e bio que converte', subheadline: 'Venda consultoria, aula experimental e acompanhamento em poucos cliques.', offer: 'Treino personalizado presencial e online', cta: 'Solicitar aula experimental', whatsappMessage: 'Oi, quero falar sobre treino personalizado.', accent: '#FACC15', secondary: '#28210A', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'restaurante', label: 'Restaurante', category: 'Alimentacao', audience: 'Clientes locais', headline: 'Seu restaurante com cardapio, delivery e reserva no mesmo lugar', subheadline: 'Transforme o link da bio em canal de pedidos e relacionamento.', offer: 'Cardapio do dia, reservas e delivery', cta: 'Ver cardapio', whatsappMessage: 'Oi, quero ver o cardapio e fazer um pedido.', accent: '#EA580C', secondary: '#2A1208', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'confeitaria', label: 'Confeitaria', category: 'Alimentacao', audience: 'Pedidos personalizados', headline: 'Sua confeitaria vendendo bolos e datas especiais todos os dias', subheadline: 'Mostre encomendas, combos e agenda em uma pagina charmosa.', offer: 'Bolos, doces finos e encomendas personalizadas', cta: 'Pedir agora', whatsappMessage: 'Oi, quero fazer uma encomenda na confeitaria.', accent: '#F472B6', secondary: '#2B0E1E', image: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'loja-moda', label: 'Loja de Moda', category: 'Varejo', audience: 'Clientes e revendedoras', headline: 'Sua loja de moda com colecao, links e atendimento em alta', subheadline: 'Venda pecas, capte clientes e direcione para o WhatsApp em uma pagina premium.', offer: 'Colecoes, looks e novidades exclusivas', cta: 'Ver novidades', whatsappMessage: 'Oi, quero ver as novidades da loja.', accent: '#A78BFA', secondary: '#161126', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'fotografo', label: 'Fotografo', category: 'Criativo', audience: 'Ensaios e eventos', headline: 'Seu portfolio fotografico vendendo ensaios e datas de eventos', subheadline: 'Exiba trabalhos, depoimentos e botao de orcamento rapido.', offer: 'Ensaios, eventos e producoes visuais', cta: 'Pedir orcamento', whatsappMessage: 'Oi, quero um orcamento para fotografia.', accent: '#EAB308', secondary: '#221B0A', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'psicologo', label: 'Psicologo', category: 'Saude', audience: 'Pacientes particulares', headline: 'Seu consultorio com acolhimento, agenda e autoridade digital', subheadline: 'Mostre abordagem, formas de atendimento e canais de contato com sobriedade.', offer: 'Sessao online e presencial com agenda organizada', cta: 'Conversar agora', whatsappMessage: 'Oi, quero mais informacoes sobre atendimento psicologico.', accent: '#14B8A6', secondary: '#0C2522', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'advogado', label: 'Advogado', category: 'Servicos profissionais', audience: 'Clientes e empresas', headline: 'Seu escritorio com posicionamento serio e canal rapido de atendimento', subheadline: 'Capte clientes com uma bio institucional pronta para transito, familia ou empresarial.', offer: 'Consultoria e atendimento juridico', cta: 'Solicitar atendimento', whatsappMessage: 'Oi, preciso de atendimento juridico.', accent: '#A16207', secondary: '#1F180B', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'mecanica', label: 'Mecanica Automotiva', category: 'Automotivo', audience: 'Motoristas locais', headline: 'Sua oficina com atendimento agil, revisao e servicos em destaque', subheadline: 'Exiba diagnostico, revisao e ofertas em uma pagina pronta para converter.', offer: 'Revisao, alinhamento e manutencao preventiva', cta: 'Agendar revisao', whatsappMessage: 'Oi, quero agendar uma revisao do carro.', accent: '#60A5FA', secondary: '#0F1829', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'turismo', label: 'Turismo', category: 'Viagens', audience: 'Pacotes e experiencias', headline: 'Sua agencia com pacotes, roteiros e atendimento rapido no WhatsApp', subheadline: 'Venda experiencia com um MiniSite visual, organizado e pronto para anuncios.', offer: 'Pacotes nacionais e internacionais', cta: 'Montar roteiro', whatsappMessage: 'Oi, quero montar um roteiro de viagem.', accent: '#0EA5E9', secondary: '#0B1D28', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { slug: 'corretor-seguros', label: 'Corretor de Seguros', category: 'Financeiro', audience: 'Familias e empresas', headline: 'Seu seguro explicado de forma clara e pronto para fechar proposta', subheadline: 'Organize tipos de cobertura, beneficios e contato em uma pagina premium.', offer: 'Seguro auto, vida, residencial e empresarial', cta: 'Solicitar cotacao', whatsappMessage: 'Oi, quero uma cotacao de seguro.', accent: '#2563EB', secondary: '#0C1630', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
];

const buildTemplate = (
  templateId: string,
  templateName: string,
  niche: NicheConfig,
  sections: Section[]
): MiniSiteTemplate => ({
  id: templateId,
  name: templateName,
  niche: niche.label,
  category: niche.category,
  description: niche.subheadline,
  sections,
  theme: createTheme(templateName, niche.accent, niche.secondary),
  seo: {
    title: templateName,
    description: niche.subheadline,
    image: niche.image
  },
  plan: 'free',
  previewText: `${sections.length} blocos`,
  previewAccent: niche.accent,
  source: 'built_in',
  isPublic: true,
  isCompanyLibrary: true
});

const alternateBuilder = (index: number, niche: NicheConfig) => {
  switch (index % 4) {
    case 0:
      return buildTemplate(`${niche.slug}-compact`, `${niche.label} - Conversao Rapida`, niche, compactLeadSections(niche));
    case 1:
      return buildTemplate(`${niche.slug}-service`, `${niche.label} - Servico Premium`, niche, serviceFunnelSections(niche));
    case 2:
      return buildTemplate(`${niche.slug}-authority`, `${niche.label} - Autoridade Digital`, niche, authoritySections(niche));
    default:
      return buildTemplate(`${niche.slug}-launch`, `${niche.label} - Oferta de Lancamento`, niche, launchSections(niche));
  }
};

const secondaryBuilder = (index: number, niche: NicheConfig) => {
  switch (index % 3) {
    case 0:
      return buildTemplate(`${niche.slug}-alt-authority`, `${niche.label} - Portfolio de Resultados`, niche, authoritySections(niche));
    case 1:
      return buildTemplate(`${niche.slug}-alt-launch`, `${niche.label} - Campanha Comercial`, niche, launchSections(niche));
    default:
      return buildTemplate(`${niche.slug}-alt-compact`, `${niche.label} - Bio Express`, niche, compactLeadSections(niche));
  }
};

export const MINISITE_TEMPLATE_LIBRARY: MiniSiteTemplate[] = [
  ...nicheConfigs.map((niche, index) => alternateBuilder(index, niche)),
  ...nicheConfigs.slice(0, 10).map((niche, index) => secondaryBuilder(index, niche))
];

export const cloneTemplateSections = (sections: Section[]): Section[] =>
  sections.map((section, index) => ({
    ...section,
    id: `${section.type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`
  }));
