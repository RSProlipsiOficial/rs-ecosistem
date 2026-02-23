import { Product } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'prod-glicolipsi',
    category: 'Physical',
    purchaseUrl: 'https://checkout.rsprolipsi.com.br/gicolipsi-1',
    imageUrls: [
      '/assets/glicolipsi-product.png',
      '/assets/glicolipsi-ingredients.png',
      '/assets/glicolipsi-benefits.png',
    ],
    translations: {
      pt: {
        name: 'GlicoLipsi',
        description: '<h3>A Chave para o Equilíbrio Metabólico que Você Sempre Buscou</h3><p>Recupere sua vitalidade e mantenha sua glicose sob controle com a potência dos ativos naturais do GlicoLipsi. Ciência, segurança e resultados reais.</p><h4>Fórmula Definitiva</h4><p>O GlicoLipsi combina os 4 pilares da natureza para o seu bem-estar metabólico:</p><ul><li><strong>Feno-grego:</strong> O suporte natural mais potente para a sensibilidade à insulina.</li><li><strong>Cúrcuma:</strong> Atua no combate ao estresse oxidativo e inflamação celular.</li><li><strong>Magnésio Dimalato:</strong> O combustível essencial para a regulação energética diária.</li><li><strong>Alho em Pó:</strong> Proteção cardiovascular e equilíbrio do colesterol LDL.</li></ul>',
      },
      en: {
        name: 'GlicoLipsi',
        description: '<h3>The Key to Metabolic Balance You\'ve Always Sought</h3><p>Regain your vitality and keep your glucose under control with the power of GlicoLipsi\'s natural actives. Science, safety, and real results.</p><h4>The Definitive Formula</h4><p>GlicoLipsi combines the 4 pillars of nature for your metabolic well-being:</p><ul><li><strong>Fenugreek:</strong> The most powerful natural support for insulin sensitivity.</li><li><strong>Turmeric:</strong> Acts in combating oxidative stress and cellular inflammation.</li><li><strong>Magnesium Malate:</strong> The essential fuel for daily energy regulation.</li><li><strong>Garlic Powder:</strong> Cardiovascular protection and LDL cholesterol balance.</li></ul>',
      },
      es: {
        name: 'GlicoLipsi',
        description: '<h3>La Clave para el Equilibrio Metabólico que Siempre Buscaste</h3><p>Recupera tu vitalidad y mantén tu glucosa bajo control con el poder de los activos naturales de GlicoLipsi. Ciencia, seguridad y resultados reales.</p><h4>La Fórmula Definitiva</h4><p>GlicoLipsi combina los 4 pilares de la naturaleza para tu bienestar metabólico:</p><ul><li><strong>Fenogreco:</strong> El soporte natural más potente para la sensibilidad a la insulina.</li><li><strong>Cúrcuma:</strong> Actúa en la lucha contra el estrés oxidativo y la inflamación celular.</li><li><strong>Magnesio Malato:</strong> El combustible esencial para la regulación energética diaria.</li><li><strong>Ajo en Polvo:</strong> Protección cardiovascular y equilibrio del colesterol LDL.</li></ul>',
      },
    },
    variants: [
      { id: 'v1-glicolipsi', name: '1 Pote (30 dias)', originalPrice: 267.00, price: 170.00, sku: 'GLICO-1POTE', stock: 500 },
      { id: 'v3-glicolipsi', name: '3 Potes (90 dias)', originalPrice: 510.00, price: 459.00, sku: 'GLICO-3POTES', stock: 300 },
      { id: 'v6-glicolipsi', name: '6 Potes (180 dias)', originalPrice: 1020.00, price: 867.00, sku: 'GLICO-6POTES', stock: 200 },
    ],
    reviews: [
      { id: 'r1-glicolipsi', author: 'Maria S.', rating: 5, text: 'Minha glicose finalmente estabilizou! Recomendo muito.', likes: 42, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r2-glicolipsi', author: 'João P.', rating: 5, text: 'Sinto muito mais energia durante o dia. Produto excelente!', likes: 28, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r3-glicolipsi', author: 'Carla F.', rating: 4, text: 'Bom produto, resultados apareceram após 30 dias.', likes: 19, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    status: 'active',
    tags: ['saúde', 'glicose', 'metabolismo', 'suplemento'],
    shipping: {
      weight: 0.3,
      dimensions: {
        length: 12,
        width: 12,
        height: 15,
      },
    },
    seo: {
        metaTitle: 'GlicoLipsi | Equilíbrio Metabólico e Vitalidade Diária',
        metaDescription: 'Recupere sua vitalidade e mantenha sua glicose sob controle com a potência dos ativos naturais do GlicoLipsi. Feno-grego, Cúrcuma, Magnésio e Alho.',
        slug: 'glicolipsi'
    },
    eligibleForCartRecovery: true,
  },
  {
    id: 'prod-d1',
    category: 'Digital',
    purchaseUrl: '#',
    imageUrls: [
      'https://picsum.photos/seed/dprod1-1/800/800',
      'https://picsum.photos/seed/dprod1-2/800/800',
      'https://picsum.photos/seed/dprod1-3/800/800',
      'https://picsum.photos/seed/dprod1-4/800/800',
    ],
    translations: {
      pt: {
        name: 'Gerenciador de Mídias Sociais IA',
        description: '<h3>Otimize sua presença online com o poder da inteligência artificial.</h3><p>Nossa plataforma de gerenciamento de mídias sociais automatiza postagens, analisa o engajamento e fornece insights valiosos para expandir seu alcance. Economize tempo e maximize resultados com agendamento inteligente, relatórios detalhados e sugestões de conteúdo baseadas em IA.</p><ul><li>Agendamento automático de posts</li><li>Análise de métricas em tempo real</li><li>Sugestões de conteúdo viral</li><li>Relatórios de desempenho</li></ul>',
      },
      en: {
        name: 'AI Social Media Manager',
        description: '<h3>Optimize your online presence with the power of artificial intelligence.</h3><p>Our social media management platform automates posts, analyzes engagement, and provides valuable insights to expand your reach. Save time and maximize results with smart scheduling, detailed reports, and AI-based content suggestions.</p><ul><li>Automatic post scheduling</li><li>Real-time metrics analysis</li><li>Viral content suggestions</li><li>Performance reports</li></ul>',
      },
      es: {
        name: 'Gestor de Redes Sociales con IA',
        description: '<h3>Optimiza tu presencia en línea con el poder de la inteligencia artificial.</h3><p>Nuestra plataforma de gestión de redes sociales automatiza publicaciones, analiza la participación y proporciona información valiosa para ampliar tu alcance. Ahorra tiempo y maximiza resultados con programación inteligente, informes detallados y sugerencias de contenido basadas en IA.</p><ul><li>Programación automática de publicaciones</li><li>Análisis de métricas en tiempo real</li><li>Sugerencias de contenido viral</li><li>Informes de rendimiento</li></ul>',
      },
    },
    variants: [
      { id: 'v1-d1', name: 'Plano Básico', price: 99.90, sku: 'AI-SMM-BAS', stock: 1000 },
      { id: 'v2-d1', name: 'Plano Profissional', originalPrice: 249.90, price: 199.90, sku: 'AI-SMM-PRO', stock: 1000 },
      { id: 'v3-d1', name: 'Plano Empresarial', price: 399.90, sku: 'AI-SMM-ENT', stock: 1000 },
    ],
    reviews: [
      { id: 'r1-d1', author: 'Ana P.', rating: 5, text: 'Ferramenta incrível! Economizou horas do meu dia.', likes: 15, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'r2-d1', author: 'Carlos M.', rating: 4, text: 'Muito bom, mas gostaria de mais integrações.', likes: 8, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    status: 'active',
    tags: ['ia', 'social media', 'gerenciamento'],
    seo: {
        metaTitle: 'Gerenciador de Mídias Sociais com IA - Otimize sua Presença Online',
        metaDescription: 'Automatize postagens, analise engajamento e obtenha insights com nossa plataforma de gerenciamento de mídias sociais baseada em IA.',
        slug: 'gerenciador-midias-sociais-ia'
    },
    eligibleForCartRecovery: true,
  },
  {
    id: 'prod-p1',
    category: 'Physical',
    purchaseUrl: '#',
    imageUrls: [
      'https://picsum.photos/seed/pprod1-1/800/800',
      'https://picsum.photos/seed/pprod1-2/800/800',
    ],
    translations: {
      pt: {
        name: 'Kit de Suplementos Essenciais',
        description: '<h3>Uma base sólida para sua saúde e bem-estar.</h3><p>Este kit completo fornece as vitaminas e minerais essenciais que seu corpo precisa para funcionar no seu melhor. Ideal para quem busca mais energia, imunidade reforçada e saúde geral.</p><ul><li>Vitamina D3 + K2</li><li>Complexo B</li><li>Ômega 3 de alta pureza</li><li>Magnésio Dimalato</li></ul>',
      },
      en: {
        name: 'Essential Supplements Kit',
        description: '<h3>A solid foundation for your health and well-being.</h3><p>This complete kit provides the essential vitamins and minerals your body needs to function at its best. Ideal for those seeking more energy, enhanced immunity, and overall health.</p><ul><li>Vitamin D3 + K2</li><li>B-Complex</li><li>High-purity Omega 3</li><li>Magnesium Malate</li></ul>',
      },
      es: {
        name: 'Kit de Suplementos Esenciales',
        description: '<h3>Una base sólida para tu salud y bienestar.</h3><p>Este kit completo proporciona las vitaminas y minerales esenciales que tu cuerpo necesita para funcionar al máximo. Ideal para quienes buscan más energía, inmunidad reforzada y salud en general.</p><ul><li>Vitamina D3 + K2</li><li>Complejo B</li><li>Omega 3 de alta pureza</li><li>Malato de Magnesio</li></ul>',
      },
    },
    variants: [
      { id: 'v1-p1', name: 'Fornecimento 30 dias', price: 189.90, sku: 'SUP-KIT-30D', stock: 150 },
      { id: 'v2-p1', name: 'Fornecimento 90 dias', originalPrice: 549.90, price: 499.90, sku: 'SUP-KIT-90D', stock: 50 },
    ],
    reviews: [
        { id: 'r1-p1', author: 'Fernanda L.', rating: 5, text: 'Senti uma melhora notável na minha energia!', likes: 22, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    status: 'active',
    tags: ['saúde', 'suplementos', 'essenciais'],
    shipping: {
      weight: 0.5,
      dimensions: {
        length: 20,
        width: 15,
        height: 10,
      },
    },
    seo: {
        metaTitle: 'Kit de Suplementos Essenciais - Saúde e Bem-Estar',
        metaDescription: 'Kit completo com Vitaminas D3, K2, Complexo B, Ômega 3 e Magnésio. Mais energia e imunidade para o seu dia a dia.',
        slug: 'kit-suplementos-essenciais'
    },
    eligibleForCartRecovery: true,
  },
];