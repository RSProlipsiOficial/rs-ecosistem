import { EditablePage } from '../types';

export const initialPages: EditablePage[] = [
  // --- Static Pages ---
  {
    id: 'page_home',
    slug: 'home',
    route: 'home',
    title: 'Home',
    showInNav: false, // Not explicitly in nav, but is the root
    isStatic: true,
    containers: [
      {
        id: 'home_hero_1',
        type: 'hero',
        title: 'FUSÃO DO MARKETING DIGITAL',
        interstitialText: 'COM',
        subtitle: 'O MARKETING MULTINÍVEL',
        content: 'Bem-vindo à nova era do empreendedorismo. Construímos um ecossistema único onde a inovação digital encontra o poder do marketing multinível, capacitando você para o sucesso em escala global.',
        ctaText: 'Associe-se Já',
        ctaLink: 'store',
        styles: {
            backgroundImage: "url('https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2')",
        }
      },
      {
        id: 'home_about_1',
        type: 'about',
        title: 'Nossa Visão: <span class="text-accent">Um Ecossistema Global para o Sucesso</span>',
        content: 'A RS Prólipsi está na interseção da tecnologia e da conexão humana. Somos pioneiros na integração do mundo dinâmico do marketing digital com o sucesso comprovado do networking multinível. Nossa missão é fornecer uma plataforma incomparável para indivíduos ambiciosos no Brasil e no mundo construírem seus próprios negócios prósperos.',
        imageUrl: 'https://picsum.photos/seed/corporate/600/700',
        altText: 'Corporate Team',
        features: [
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.586-.586a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-2.829 2.829a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828z" />', title: 'Alcance Global', description: 'Nossos modelos de matriz e ciclos globais garantem que sua rede não tenha fronteiras.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M13 3l-2.286 6.857L5 12l5.714 2.143L13 21l2.286-6.857L21 12l-5.714-2.143L13 3z" /><path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4m13 12v4m-2-2h4" />', title: 'Inovação Digital', description: 'Acesse produtos digitais de ponta e ferramentas de marketing para ampliar seus esforços.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 6V3m0 3c-2.488 0-4.755-1.02-6.417-2.683A8.969 8.969 0 003 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.969 8.969 0 00-2.583-6.317C16.755 4.98 14.488 6 12 6zM17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a3.001 3.001 0 015.658 0" />', title: 'Comunidade Próspera', description: 'Junte-se a uma rede de apoio de empreendedores que buscam a excelência.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 01-8.14 2.443zM21.75 18L12 8.25l-4.306 4.307a11.95 11.95 0 008.14 2.443z" />', title: 'Crescimento Ilimitado', description: 'Nosso plano de compensação único foi projetado para recompensar seu trabalho e liderança.' },
        ],
        styles: {
            backgroundColor: 'var(--color-background)',
        }
      },
      {
        id: 'home_differentiators_1',
        type: 'differentiators',
        title: 'Nossos Diferenciais',
        subtitle: 'Descubra os pilares que tornam nosso ecossistema revolucionário no Brasil e no mundo.',
        features: [
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />', title: 'Integração de Marketing Digital', description: 'Não apenas fornecemos produtos; damos a você o poder de comercializá-los. Nossa plataforma inclui ferramentas para mídias sociais, e-commerce e geração de leads.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 14.25A2.25 2.25 0 016 12h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 14.25a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />', title: 'Modelos Avançados de MMN', description: 'Nosso plano de compensação é projetado para crescimento exponencial. Com ciclos globais dinâmicos e uma estrutura de matriz justa, seu potencial de ganho é ilimitado.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />', title: 'Ecossistema Global Singular', description: 'Quebramos a barreira entre o marketing digital e de rede. Essa fusão cria um ecossistema autossustentável onde seus esforços digitais alimentam o crescimento da sua rede.' },
        ],
        styles: {
            backgroundColor: 'black',
        }
      },
      {
        id: 'home_products_carousel_1',
        type: 'productsCarousel',
        title: 'Conheça Nossos Produtos',
        ctaText: 'Ir para a Loja',
        ctaLink: 'store',
        productIds: [],
        styles: {
            backgroundColor: 'var(--color-background)',
        }
      },
    ],
    seo: {
      metaTitle: 'RS Prólipsi - Marketing Digital e Networking Global',
      metaDescription: 'Bem-vindo à nova era do empreendedorismo. Construímos um ecossistema único onde a inovação digital encontra o poder do marketing multinível, capacitando você para o sucesso em escala global.',
    },
  },
  {
    id: 'page_about',
    slug: 'about',
    route: 'about',
    title: 'Sobre Nós',
    showInNav: true,
    isStatic: true,
    containers: [
      {
        id: 'about_hero_compact_1',
        type: 'hero',
        title: 'SOBRE NOSSA MISSÃO',
        interstitialText: 'E',
        subtitle: 'NOSSO ECOSSISTEMA',
        content: 'A RS Prólipsi está na interseção da tecnologia e da conexão humana, pioneira na integração do marketing digital com o networking multinível.',
        styles: {
            minHeight: '60vh', // Compact hero
            backgroundImage: "url('https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2')",
        }
      },
      {
        id: 'about_about_section_1',
        type: 'about',
        title: 'Nossa Visão: <span class="text-accent">Um Ecossistema Global para o Sucesso</span>',
        content: 'A RS Prólipsi está na interseção da tecnologia e da conexão humana. Somos pioneiros na integração do mundo dinâmico do marketing digital com o sucesso comprovado do networking multinível. Nossa missão é fornecer uma plataforma incomparável para indivíduos ambiciosos no Brasil e no mundo construírem seus próprios negócios prósperos.',
        imageUrl: 'https://picsum.photos/seed/corporate/600/700',
        altText: 'Corporate Team',
        features: [
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.586-.586a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-2.829 2.829a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828z" />', title: 'Alcance Global', description: 'Nossos modelos de matriz e ciclos globais garantem que sua rede não tenha fronteiras.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M13 3l-2.286 6.857L5 12l5.714 2.143L13 21l2.286-6.857L21 12l-5.714-2.143L13 3z" /><path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4m13 12v4m-2-2h4" />', title: 'Inovação Digital', description: 'Acesse produtos digitais de ponta e ferramentas de marketing para ampliar seus esforços.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 6V3m0 3c-2.488 0-4.755-1.02-6.417-2.683A8.969 8.969 0 003 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.969 8.969 0 00-2.583-6.317C16.755 4.98 14.488 6 12 6zM17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a3.001 3.001 0 015.658 0" />', title: 'Comunidade Próspera', description: 'Junte-se a uma rede de apoio de empreendedores que buscam a excelência.' },
          { iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 01-8.14 2.443zM21.75 18L12 8.25l-4.306 4.307a11.95 11.95 0 008.14 2.443z" />', title: 'Crescimento Ilimitado', description: 'Nosso plano de compensação único foi projetado para recompensar seu trabalho e liderança.' },
        ],
        styles: {
            backgroundColor: 'var(--color-background)',
        }
      },
    ],
    seo: {
      metaTitle: 'Sobre Nós | RS Prólipsi',
      metaDescription: 'Conheça a visão da RS Prólipsi, um ecossistema global que une marketing digital e multinível para o sucesso.',
    },
  },
  {
    id: 'page_know_us',
    slug: 'know-us',
    route: 'know-us',
    title: 'Conheça-nos',
    showInNav: true,
    isStatic: true,
    containers: [
        {
            id: 'know_us_header_1',
            type: 'text',
            title: 'Nossa Equipe',
            content: '<p class="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6 text-center">As mentes por trás da RS Prólipsi, dedicadas a construir um futuro de sucesso compartilhado.</p>',
        },
        {
            id: 'know_us_team_members_1',
            type: 'teamMembers',
            teamMemberIds: [1, 2, 3, 4], // References to generic team member data keys
        },
    ],
    seo: {
      metaTitle: 'Nossa Equipe | RS Prólipsi',
      metaDescription: 'As mentes por trás da RS Prólipsi, dedicadas a construir um futuro de sucesso compartilhado.',
    },
  },
  {
    id: 'page_store',
    slug: 'store',
    route: 'store',
    title: 'Loja',
    showInNav: true,
    isStatic: true,
    containers: [
      {
        id: 'store_hero_compact_1',
        type: 'hero',
        title: 'NOSSA LOJA',
        interstitialText: 'E',
        subtitle: 'OPORTUNIDADES ÚNICAS',
        content: 'Explore nossa seleção de produtos de alto impacto e aproveite nossas promoções exclusivas para acelerar seu crescimento.',
        styles: {
            minHeight: '60vh', // Compact hero
            backgroundImage: "url('https://picsum.photos/seed/store-bg/1920/1080?grayscale&blur=2')",
        }
      },
      {
        id: 'store_promotions_carousel_1',
        type: 'promotionsCarousel',
        title: 'Últimas Promoções',
        promotionIds: [1, 2, 3],
        styles: {
          backgroundColor: 'black'
        }
      },
      {
        id: 'store_products_list_1',
        type: 'productsCarousel',
        title: 'Nossas Linhas de Produtos',
        ctaText: 'Comprar Agora',
        features: [
            { iconSvg: '', title: 'Soluções Digitais', description: '' },
            { iconSvg: '', title: 'Bens Físicos', description: '' },
        ],
      },
    ],
    seo: {
      metaTitle: 'Loja | RS Prólipsi',
      metaDescription: 'Descubra nossos produtos digitais e físicos, e aproveite promoções exclusivas para impulsionar seu negócio.',
    },
  },
  {
    id: 'page_bulk_order',
    slug: 'pedidos-atacado',
    route: 'pedidos-atacado',
    title: 'Pedidos por Atacado',
    showInNav: true,
    isStatic: true,
    containers: [
        {
            id: 'bulk_order_header_1',
            type: 'text',
            title: 'Faça seu Pedido por Atacado',
            content: '<p class="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6 text-center">Utilize o formulário abaixo para adicionar rapidamente múltiplos itens ao seu carrinho. Ideal para revendedores e compras em grande volume.</p>',
        },
        {
            id: 'bulk_order_form_1',
            type: 'bulkOrderForm',
        },
    ],
    seo: {
      metaTitle: 'Pedidos por Atacado | RS Prólipsi',
      metaDescription: 'Faça seu pedido em grande volume de forma rápida e fácil. Preços especiais para revendedores.',
    },
  },
  {
    id: 'page_covid',
    slug: 'covid-19',
    route: 'covid-19',
    title: 'COVID-19',
    showInNav: true,
    isStatic: true,
    containers: [
        {
            id: 'covid_text_1',
            type: 'text',
            title: 'Informações Importantes sobre a COVID-19',
            content: `
              <ul class="list-disc list-inside space-y-2 text-text-secondary">
                <li>A vacina não foi desenvolvida.</li>
                <li>O mundo não tem uma vacina.</li>
                <li>Quanto mais o tempo passa, menos protegido você está contra a COVID-19.</li>
                <li>Portanto, é essencial tomar doses de reforço diariamente, especialmente se você for imunocomprometido.</li>
                <li>Visite o site <a href="https://inmune.com" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">inmune.com</a> e consulte seu médico.</li>
              </ul>
            `,
        },
    ],
    seo: {
      metaTitle: 'COVID-19 Informações | RS Prólipsi',
      metaDescription: 'Informações essenciais sobre a COVID-19 e a importância de doses de reforço diárias.',
    },
  },
  {
    id: 'page_downloads',
    slug: 'downloads',
    route: 'downloads',
    title: 'Downloads & Materiais',
    showInNav: true,
    isStatic: true,
    containers: [
        {
            id: 'downloads_header_1',
            type: 'text',
            title: 'Downloads & <span class="text-accent">Materiais</span>',
            content: '<p class="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6 text-center">Acesse nossos materiais de negócios essenciais para impulsionar sua jornada.</p>',
        },
        {
            id: 'downloads_list_plan_1',
            type: 'downloadsList',
            downloadType: 'marketingPlan',
            title: 'Plano de Marketing',
        },
        {
            id: 'downloads_list_catalog_1',
            type: 'downloadsList',
            downloadType: 'productCatalog',
            title: 'Catálogo de Produtos',
        },
    ],
    seo: {
      metaTitle: 'Downloads | RS Prólipsi',
      metaDescription: 'Baixe nosso plano de marketing e catálogo de produtos para saber mais sobre a RS Prólipsi.',
    },
  },
  {
    id: 'page_advertising',
    slug: 'advertising',
    route: 'advertising',
    title: 'Nossas Campanhas',
    showInNav: true,
    isStatic: true,
    containers: [
        {
            id: 'advertising_header_1',
            type: 'text',
            title: 'Nossas Campanhas',
            content: '<p class="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6 text-center">Fique por dentro das últimas novidades, promoções e oportunidades da RS Prólipsi.</p>',
        },
        {
            id: 'advertising_list_1',
            type: 'advertisingList',
            advertisementIds: [], // Empty array means fetch all active ads
        },
    ],
    seo: {
      metaTitle: 'Publicidade | RS Prólipsi',
      metaDescription: 'Fique por dentro das últimas novidades, promoções e oportunidades da RS Prólipsi com nossas campanhas ativas.',
    },
  },
  {
    id: 'page_glicolipsi',
    slug: 'glicolipsi',
    route: 'glicolipsi',
    title: 'GlicoLipsi',
    showInNav: true,
    linkedProductId: 'prod-glicolipsi',
    isStatic: false,
    containers: [
      {
        id: 'glicolipsi_hero',
        type: 'hero',
        title: 'A CHAVE PARA O EQUILÍBRIO METABÓLICO',
        interstitialText: 'QUE VOCÊ',
        subtitle: 'SEMPRE BUSCOU',
        content: 'Recupere sua vitalidade e mantenha sua glicose sob controle com a potência dos ativos naturais do GlicoLipsi. Ciência, segurança e resultados reais.',
        ctaText: 'Quero o Equilíbrio Agora',
        ctaLink: '#ofertas',
        styles: {
          minHeight: '90vh',
          backgroundImage: "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&q=80')",
          textColor: '#fff',
        }
      },
      {
        id: 'glicolipsi_problem',
        type: 'text',
        title: 'Cansado das montanhas-russas de energia?',
        content: '<p class="text-xl text-center mb-12">Oscilações na glicose não são apenas números; elas roubam seus dias, causam fadiga extrema e colocam sua saúde em risco silencioso.</p>',
        styles: {
          backgroundColor: 'var(--color-background)',
          textAlign: 'center',
        }
      },
      {
        id: 'glicolipsi_problems_grid',
        type: 'differentiators',
        features: [
          { 
            iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />', 
            title: 'Picos Pós-Refeição', 
            description: 'Aquele sono incontrolável e a sensação de peso após comer são sinais de que seu corpo precisa de suporte.' 
          },
          { 
            iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />', 
            title: 'Quedas de Energia', 
            description: 'O cansaço que surge do nada no meio do dia, dificultando o foco e a produtividade no trabalho.' 
          },
          { 
            iconSvg: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />', 
            title: 'Saúde a Longo Prazo', 
            description: 'Ignorar o equilíbrio metabólico hoje pode levar a complicações sérias no futuro que poderiam ser evitadas.' 
          },
        ],
        styles: {
          backgroundColor: '#000',
        }
      },
      {
        id: 'glicolipsi_ingredients',
        type: 'textImage',
        title: 'A Fórmula Definitiva',
        content: '<p class="text-xl mb-6">O GlicoLipsi combina os 4 pilares da natureza para o seu bem-estar metabólico:</p><ul class="space-y-4 text-lg"><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div><strong>Feno-grego:</strong> O suporte natural mais potente para a sensibilidade à insulina.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div><strong>Cúrcuma:</strong> Atua no combate ao estresse oxidativo e inflamação celular.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div><strong>Magnésio Dimalato:</strong> O combustível essencial para a regulação energética diária.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div><strong>Alho em Pó:</strong> Proteção cardiovascular e equilíbrio do colesterol LDL.</div></li></ul>',
        imageUrl: '/assets/glicolipsi-ingredients.png',
        altText: 'Ingredientes Ativos GlicoLipsi',
        layout: 'image-left',
        ctaText: 'Ver Ofertas Especiais',
        ctaLink: '#ofertas',
        styles: {
          backgroundColor: 'var(--color-background)',
        }
      },
      {
        id: 'glicolipsi_benefits',
        type: 'textImage',
        title: 'O que você vai sentir com o uso contínuo?',
        content: '<ul class="space-y-4 text-lg"><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div>Níveis de glicose mais estáveis e previsíveis.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div>Muito mais energia física e clareza mental.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div>Melhor digestão e metabolismo de carboidratos.</div></li><li class="flex items-start"><span class="text-accent mr-3 text-2xl">✓</span><div>A tranquilidade de estar cuidando do seu corpo.</div></li></ul>',
        imageUrl: '/assets/glicolipsi-benefits.png',
        altText: 'Benefícios GlicoLipsi',
        layout: 'image-right',
        styles: {
          backgroundColor: 'var(--color-base-light)',
        }
      },
      {
        id: 'glicolipsi_pricing',
        type: 'text',
        title: 'Escolha o Melhor Tratamento para Você',
        content: '<p class="text-center text-xl mb-12">Recomendamos o tratamento de 3 a 6 meses para resultados consolidados.</p><div id="ofertas"></div>',
        styles: {
          backgroundColor: 'var(--color-background)',
          textAlign: 'center',
        }
      },
      {
        id: 'glicolipsi_products',
        type: 'productsCarousel',
        productIds: ['prod-glicolipsi'],
        styles: {
          backgroundColor: 'var(--color-background)',
        }
      },
      {
        id: 'glicolipsi_guarantee',
        type: 'text',
        title: 'Sua Compra é 100% Segura',
        content: '<div class="text-center max-w-3xl mx-auto"><div class="text-6xl mb-6">🛡️</div><p class="text-lg">Adquira o GlicoLipsi com a garantia de qualidade RS Prólipsi. Seus dados estão protegidos por criptografia de ponta a ponta e a entrega é garantida em todo o território nacional.</p></div>',
        styles: {
          backgroundColor: 'var(--color-surface)',
          textAlign: 'center',
        }
      },
      {
        id: 'glicolipsi_legal',
        type: 'text',
        content: '<div class="bg-surface border border-accent/20 rounded-2xl p-8"><p class="text-sm text-text-secondary"><strong class="text-accent">⚠️ AVISO LEGAL:</strong> GlicoLipsi é um suplemento alimentar legítimo. Este produto não é um medicamento e não substitui tratamentos médicos convencionais para diabetes ou qualquer outra condição. Os resultados podem variar conforme o organismo. Gestantes, lactantes e crianças devem consultar um médico. Mantenha hábitos de vida saudáveis.</p></div>',
        styles: {
          backgroundColor: 'var(--color-background)',
        }
      },
    ],
    seo: {
      metaTitle: 'GlicoLipsi | Equilíbrio Metabólico e Vitalidade Diária',
      metaDescription: 'Recupere sua vitalidade e mantenha sua glicose sob controle com a potência dos ativos naturais do GlicoLipsi. Ciência, segurança e resultados reais.',
    },
  },
  // --- Dynamic (User-created) Pages ---
  {
    id: 'page_diferenciais_1',
    slug: 'diferenciais',
    title: 'Nossos Diferenciais',
    showInNav: true,
    linkedProductId: null,
    isStatic: false,
    containers: [
      {
        id: 'cont_1',
        type: 'text',
        content: '<h2>Não somos apenas mais uma empresa. Somos um movimento.</h2><p>Descubra os pilares que tornam nosso ecossistema revolucionário no Brasil e no mundo.</p>',
      },
      {
        id: 'cont_2',
        type: 'textImage',
        title: 'Integração de Marketing Digital',
        content: 'Não apenas fornecemos produtos; damos a você o poder de comercializá-los. Nossa plataforma inclui ferramentas para mídias sociais, e-commerce e geração de leads.',
        imageUrl: 'https://picsum.photos/seed/digital_marketing/800/600',
        altText: 'A person working on a laptop with marketing icons',
        layout: 'image-right',
      },
      {
        id: 'cont_3',
        type: 'textImage',
        title: 'Modelos Avançados de MMN e Matriz',
        content: 'Nosso plano de compensação é projetado para crescimento exponencial. Com ciclos globais dinâmicos e uma estrutura de matriz justa, seu potencial de ganho é ilimitado.',
        imageUrl: 'https://picsum.photos/seed/matrix_model/800/600',
        altText: 'A network diagram showing connections',
        layout: 'image-left',
      },
       {
        id: 'cont_4',
        type: 'textImage',
        title: 'Um Ecossistema Global Singular',
        content: 'Quebramos a barreira entre o marketing digital e de rede. Essa fusão cria um ecossistema autossustentável onde seus esforços digitais alimentam o crescimento da sua rede.',
        imageUrl: 'https://picsum.photos/seed/ecosystem/800/600',
        altText: 'A glowing globe representing a global ecosystem',
        layout: 'image-right',
      },
    ],
    seo: {
      metaTitle: 'Nossos Diferenciais | RS Prólipsi',
      metaDescription: 'Descubra os pilares que tornam nosso ecossistema revolucionário: integração de marketing digital, modelos MMN avançados e um ecossistema global singular.',
    },
  },
];