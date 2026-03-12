const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configurado.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const tenantId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

const genericImageHosts = [
  'picsum.photos',
  'images.unsplash.com',
  'placehold.co',
];

const catalog = [
  {
    sku: 'RS-ALPHA-01',
    name: 'AlphaLipsi',
    price: 120,
    memberPrice: 60,
    comparePrice: 219,
    stockQuantity: 500,
    category: 'Suplementos',
    shortDescription:
      'Controle de peso e metabolismo acelerado com o poder da natureza.',
    seoTitle: 'AlphaLipsi | Controle de peso e metabolismo acelerado',
    seoDescription:
      'Suporte diario para metabolismo ativo, energia e rotina de controle de peso.',
    subcategory: 'Controle de peso',
    description: `
      <h2>Transforme seu corpo com o poder da natureza</h2>
      <p>AlphaLipsi foi desenvolvido para apoiar a rotina de controle de peso, oferecendo suporte ao metabolismo e mais energia no dia a dia.</p>
      <ul>
        <li><strong>Cafeina anidra:</strong> auxilia na disposicao e na rotina metabolica.</li>
        <li><strong>Cha verde:</strong> suporte antioxidante para o uso diario.</li>
        <li><strong>L-carnitina:</strong> apoio ao aproveitamento energetico do organismo.</li>
        <li><strong>Picolinato de cromo:</strong> contribui para o equilibrio da rotina alimentar.</li>
      </ul>
    `,
  },
  {
    sku: 'GLICO-RS-001',
    name: 'GlicoLipsi',
    price: 140,
    memberPrice: 70,
    comparePrice: 267,
    stockQuantity: 300,
    category: 'Suplementos',
    shortDescription:
      'Equilibrio metabolico e vitalidade diaria para a rotina com foco em glicose.',
    seoTitle: 'GlicoLipsi | Equilibrio metabolico e vitalidade diaria',
    seoDescription:
      'Suporte nutricional para equilibrio da glicose, metabolismo energetico e bem-estar diario.',
    subcategory: 'Equilibrio metabolico',
    description: `
      <h2>Suporte nutricional para equilibrio metabolico</h2>
      <p>GlicoLipsi foi pensado para adultos que buscam mais estabilidade energetica e apoio a uma rotina de equilibrio da glicose com ativos naturais.</p>
      <ul>
        <li><strong>Feno-grego:</strong> apoio nutricional ao metabolismo da glicose.</li>
        <li><strong>Curcuma:</strong> suporte antioxidante para o uso continuo.</li>
        <li><strong>Magnesio dimalato:</strong> contribui para a rotina energetica diaria.</li>
        <li><strong>Alho em po:</strong> suporte complementar ao bem-estar metabolico.</li>
      </ul>
    `,
  },
  {
    sku: 'DIVA-RS-001',
    name: 'DivaLipsi',
    price: 126,
    memberPrice: 63,
    comparePrice: 199,
    stockQuantity: 200,
    category: 'Suplementos',
    shortDescription:
      'Bem-estar feminino, vitalidade e suporte nutricional para a rotina diaria.',
    seoTitle: 'DivaLipsi | Bem-estar feminino e vitalidade diaria',
    seoDescription:
      'Suporte nutricional para mulheres que buscam equilibrio, disposicao e cuidado diario.',
    subcategory: 'Bem-estar feminino',
    description: `
      <h2>Suporte diario para o bem-estar feminino</h2>
      <p>DivaLipsi foi desenvolvido para apoiar a rotina feminina com uma proposta de cuidado diario, vitalidade e equilibrio de forma gradual e responsavel.</p>
      <ul>
        <li><strong>Suporte nutricional:</strong> pensado para o organismo feminino.</li>
        <li><strong>Uso continuo:</strong> integra-se a habitos saudaveis e autocuidado.</li>
        <li><strong>Ativos naturais:</strong> apoio ao bem-estar fisico e emocional.</li>
        <li><strong>Rotina pratica:</strong> suplementacao simples para o dia a dia.</li>
      </ul>
    `,
  },
  {
    sku: 'INFLA-RS-001',
    name: 'Inflamaxi',
    price: 120,
    memberPrice: 60,
    comparePrice: 199,
    stockQuantity: 150,
    category: 'Suplementos',
    shortDescription:
      'Suporte nutricional para conforto muscular, articular e recuperacao diaria.',
    seoTitle: 'Inflamaxi | Conforto muscular e suporte para a rotina ativa',
    seoDescription:
      'Suporte diario para quem busca conforto muscular, bem-estar articular e recuperacao.',
    subcategory: 'Recuperacao muscular e articular',
    description: `
      <h2>Suporte diario para conforto muscular e articular</h2>
      <p>Inflamaxi foi formulado para apoiar a rotina de pessoas ativas, oferecendo suporte nutricional ao conforto muscular, articular e a recuperacao do organismo.</p>
      <ul>
        <li><strong>Rotina ativa:</strong> apoio ao bem-estar apos esforcos fisicos.</li>
        <li><strong>Conforto diario:</strong> suporte para musculos e articulacoes.</li>
        <li><strong>Uso continuo:</strong> integracao simples com habitos saudaveis.</li>
        <li><strong>Ativos naturais:</strong> proposta segura para acompanhamento diario.</li>
      </ul>
    `,
  },
  {
    sku: 'OZONI-RS-001',
    name: 'Ozone Pro 3+',
    price: 76,
    memberPrice: 38,
    comparePrice: 129,
    stockQuantity: 400,
    category: 'Cosmeticos',
    shortDescription:
      'Cuidado da pele com oleo de girassol ozonizado para hidratacao e nutricao diaria.',
    seoTitle: 'Ozone Pro 3+ | Cuidado diario e hidratacao da pele',
    seoDescription:
      'Produto fisico para cuidado da pele com proposta cosmetica, hidratacao e nutricao diaria.',
    subcategory: 'Cuidado da pele',
    description: `
      <h2>Cuidado diario da pele com oleo de girassol ozonizado</h2>
      <p>Ozone Pro 3+ entra no catalogo como produto fisico de uso topico, com proposta cosmetica para hidratacao, nutricao e sensacao de conforto cutaneo.</p>
      <ul>
        <li><strong>Hidratacao:</strong> ajuda na rotina de cuidado da pele.</li>
        <li><strong>Nutricao cutanea:</strong> apoio ao uso diario em areas ressecadas.</li>
        <li><strong>Textura leve:</strong> absorcao pratica para autocuidado.</li>
        <li><strong>Uso externo:</strong> produto alinhado a uma proposta cosmetica.</li>
      </ul>
    `,
  },
  {
    sku: 'PRO3-RS-001',
    name: 'Pro 3+',
    price: 90,
    memberPrice: 45,
    comparePrice: 149,
    stockQuantity: 600,
    category: 'Suplementos',
    shortDescription:
      'Fonte natural de omega 3, 6, 9 e vitamina E para a rotina diaria.',
    seoTitle: 'Pro 3+ | Suporte antioxidante e cardiovascular diario',
    seoDescription:
      'Suplementacao para rotina antioxidante, bem-estar metabolico e suporte cardiovascular.',
    subcategory: 'Suporte antioxidante',
    description: `
      <h2>Fonte natural de gorduras boas para o dia a dia</h2>
      <p>Pro 3+ foi organizado no catalogo como suplemento para uma rotina de suporte antioxidante, metabolico e cardiovascular, com foco em uso continuo.</p>
      <ul>
        <li><strong>Omega 3, 6 e 9:</strong> apoio nutricional ao organismo.</li>
        <li><strong>Vitamina E:</strong> suporte antioxidante para uso diario.</li>
        <li><strong>Rotina preventiva:</strong> integracao simples a habitos saudaveis.</li>
        <li><strong>Uso continuo:</strong> proposta de bem-estar e qualidade de vida.</li>
      </ul>
    `,
  },
  {
    sku: 'SLIM-RS-001',
    name: 'SlimLipsi',
    price: 140,
    memberPrice: 70,
    comparePrice: 249,
    stockQuantity: 350,
    category: 'Suplementos',
    shortDescription:
      'Suporte nutricional para controle de peso com equilibrio metabolico diario.',
    seoTitle: 'SlimLipsi | Controle de peso com suporte metabolico',
    seoDescription:
      'Suporte diario para controle de peso, rotina alimentar equilibrada e bem-estar geral.',
    subcategory: 'Controle de peso',
    description: `
      <h2>Suporte diario para controle de peso com responsabilidade</h2>
      <p>SlimLipsi foi pensado para apoiar a rotina de quem busca controle de peso, equilibrio metabolico e constancia em habitos saudaveis.</p>
      <ul>
        <li><strong>Rotina alimentar:</strong> suporte nutricional para mais constancia.</li>
        <li><strong>Metabolismo:</strong> apoio gradual ao equilibrio do organismo.</li>
        <li><strong>Uso continuo:</strong> integracao com dieta equilibrada e exercicios.</li>
        <li><strong>Bem-estar:</strong> proposta pratica para o dia a dia.</li>
      </ul>
    `,
  },
];

const sanitizeImages = (images) => {
  if (!Array.isArray(images)) return [];

  return images.filter((image) => {
    if (typeof image !== 'string' || !image.trim()) return false;
    return !genericImageHosts.some((host) => image.includes(host));
  });
};

const normalizeSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== 'object' || Array.isArray(specifications)) {
    return {};
  }

  return specifications;
};

async function syncCatalog() {
  const skus = catalog.map((product) => product.sku);
  const { data: existingProducts, error: loadError } = await supabase
    .from('products')
    .select('id, sku, images, featured_image, specifications')
    .eq('tenant_id', tenantId)
    .in('sku', skus);

  if (loadError) {
    throw new Error(`Falha ao carregar produtos atuais: ${loadError.message}`);
  }

  const existingBySku = new Map(
    (existingProducts || []).map((product) => [product.sku, product])
  );

  for (const product of catalog) {
    const current = existingBySku.get(product.sku);
    const currentImages = sanitizeImages(current?.images || []);
    const specifications = normalizeSpecifications(current?.specifications);

    const payload = {
      tenant_id: tenantId,
      name: product.name,
      sku: product.sku,
      price: product.price,
      member_price: product.memberPrice,
      compare_price: product.comparePrice,
      stock_quantity: product.stockQuantity,
      category: product.category,
      description: product.description.trim(),
      short_description: product.shortDescription,
      images: currentImages,
      featured_image: currentImages[0] || null,
      published: true,
      is_active: true,
      seo_title: product.seoTitle,
      seo_description: product.seoDescription,
      updated_at: new Date().toISOString(),
      specifications: {
        ...specifications,
        shortDescription: product.shortDescription,
        type: 'Fisico',
        options: [],
        variants: [],
        videos: [],
        materials: [],
        supplier: 'RS Prolipsi',
        barcode: '',
        weight: 0,
        weightUnit: 'kg',
        subcategory: product.subcategory,
        collections: [],
        trackQuantity: true,
        requiresShipping: true,
      },
    };

    if (current?.id) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', current.id);

      if (updateError) {
        throw new Error(`Falha ao atualizar ${product.sku}: ${updateError.message}`);
      }

      console.log(`Atualizado: ${product.sku} -> ${product.name}`);
      continue;
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert(payload);

    if (insertError) {
      throw new Error(`Falha ao inserir ${product.sku}: ${insertError.message}`);
    }

    console.log(`Inserido: ${product.sku} -> ${product.name}`);
  }

  console.log('\nCatalogo sincronizado com sucesso.');
}

syncCatalog().catch((error) => {
  console.error('\nErro ao sincronizar catalogo:', error.message);
  process.exit(1);
});
