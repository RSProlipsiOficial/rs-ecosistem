import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Relógio de Pulso Clássico de Couro',
    seller: 'Ana Carolina',
    price: 1250.00,
    compareAtPrice: 1500.00,
    currency: 'BRL',
    shortDescription: 'Um relógio atemporal que combina design clássico com funcionalidade moderna. Perfeito para qualquer ocasião.',
    description: `
      <h2>Design Atemporal, Qualidade Inquestionável</h2>
      <p>Este relógio é mais do que um simples acessório; é uma declaração de estilo. Com sua pulseira de couro genuíno e caixa de aço inoxidável polido, ele exala sofisticação.</p>
      <ul>
        <li><strong>Movimento:</strong> Quartzo Suíço de alta precisão.</li>
        <li><strong>Material:</strong> Aço inoxidável 316L e couro legítimo.</li>
        <li><strong>Resistência à água:</strong> 5 ATM (adequado para banho, não para mergulho).</li>
        <li><strong>Vidro:</strong> Cristal de safira resistente a arranhões.</li>
      </ul>
      <blockquote>"O tempo é o que mais queremos, mas o que usamos de pior maneira." - William Penn. Use o seu com sabedoria e estilo.</blockquote>
      <p>Seja para uma reunião de negócios ou um evento social, este relógio complementará seu visual com um toque de elegância discreta.</p>
    `,
    images: [
      'https://picsum.photos/seed/watch1/600/600',
      'https://picsum.photos/seed/watch2/600/600',
      'https://picsum.photos/seed/watch3/600/600',
      'https://picsum.photos/seed/watch4/600/600',
    ],
    rating: 4.8,
    reviewCount: 72,
    collectionId: 'col-1',
    status: 'Ativo',
    inventory: 25,
    type: 'Físico',
    sku: 'RW-CLASSIC-01',
    requiresShipping: true,
    trackQuantity: true,
    chargeTax: true,
    continueSelling: false,
    seoTitle: 'Relógio Clássico de Couro | Elegância e Precisão',
    seoDescription: 'Descubra o relógio de pulso clássico com pulseira de couro e movimento suíço. Uma peça de luxo atemporal para o homem moderno.',
    urlHandle: 'relogio-pulso-classico-couro',
    options: [
      { id: 'opt1', name: 'Cor da Pulseira', values: ['Marrom', 'Preto'] },
      { id: 'opt2', name: 'Cor da Caixa', values: ['Prata', 'Dourado'] },
    ],
    variants: [
      { id: 'var1', options: { 'Cor da Pulseira': 'Marrom', 'Cor da Caixa': 'Prata' }, price: 1250.00, inventory: 10, sku: 'RW-MAR-PRA' },
      { id: 'var2', options: { 'Cor da Pulseira': 'Marrom', 'Cor da Caixa': 'Dourado' }, price: 1350.00, inventory: 5, sku: 'RW-MAR-DOU' },
      { id: 'var3', options: { 'Cor da Pulseira': 'Preto', 'Cor da Caixa': 'Prata' }, price: 1250.00, inventory: 8, sku: 'RW-PRE-PRA' },
      { id: 'var4', options: { 'Cor da Pulseira': 'Preto', 'Cor da Caixa': 'Dourado' }, price: 1350.00, inventory: 2, sku: 'RW-PRE-DOU' },
    ],
    weight: 0.3,
    weightUnit: 'kg',
    supplier: 'Relojoaria Suíça Premium',
  },
  {
    id: '2',
    name: 'Bolsa de Ombro de Designer em Couro',
    seller: 'RS Prólipsi',
    price: 2100.00,
    currency: 'BRL',
    shortDescription: 'Elegância e praticidade em uma bolsa de couro legítimo com design exclusivo. Espaço interno otimizado e acabamento impecável.',
    description: `
      <h2>A Companheira Perfeita para o Seu Dia a Dia</h2>
      <p>Feita à mão com couro italiano da mais alta qualidade, esta bolsa de ombro é o epítome do luxo funcional. Seu design versátil a torna perfeita tanto para o trabalho quanto para o lazer.</p>
      <h3>Características:</h3>
      <ul>
        <li><strong>Material Externo:</strong> Couro bovino italiano de flor integral.</li>
        <li><strong>Forro:</strong> Tecido jacquard personalizado.</li>
        <li><strong>Metais:</strong> Banhados a ouro com acabamento acetinado.</li>
        <li><strong>Compartimentos:</strong> Três compartimentos internos, incluindo um com zíper, e um bolso externo de acesso rápido.</li>
      </ul>
    `,
    images: [
      'https://picsum.photos/seed/bag1/600/600',
      'https://picsum.photos/seed/bag2/600/600',
      'https://picsum.photos/seed/bag3/600/600',
    ],
    rating: 4.9,
    reviewCount: 45,
    collectionId: 'col-2',
    status: 'Ativo',
    inventory: 15,
    type: 'Físico',
    sku: 'HB-LEATHER-DESIGN',
    requiresShipping: true,
    trackQuantity: true,
    chargeTax: true,
    continueSelling: false,
    options: [],
    variants: [],
    weight: 0.8,
    weightUnit: 'kg',
    supplier: 'Artesãos de Florença',
  },
  {
    id: '3',
    name: 'Caneta-tinteiro Executiva',
    seller: 'Escritório Premium',
    price: 850.00,
    compareAtPrice: 950.00,
    currency: 'BRL',
    shortDescription: 'Uma experiência de escrita superior. Corpo em resina nobre, detalhes banhados a platina e pena de ouro 14K feita à mão.',
    description: `
      <h2>A Arte da Escrita</h2>
      <p>Redescubra o prazer de escrever com esta caneta-tinteiro executiva. Cada traço é uma experiência suave e fluida, graças à sua pena de ouro maciço 14K, meticulosamente trabalhada.</p>
    `,
    images: [
      'https://picsum.photos/seed/pen1/600/600',
      'https://picsum.photos/seed/pen2/600/600',
    ],
    rating: 4.7,
    reviewCount: 30,
    collectionId: 'col-3',
    status: 'Ativo',
    inventory: 50,
    type: 'Físico',
    sku: 'PEN-EXEC-BLK',
    requiresShipping: true,
    trackQuantity: true,
    chargeTax: true,
    continueSelling: false,
    options: [],
    variants: [],
    weight: 0.1,
    weightUnit: 'kg',
    supplier: 'Oficina Alemã de Canetas',
  },
  {
    id: '4',
    name: 'Óculos de Sol Aviador Polarizados',
    seller: 'Estilo & Visão',
    price: 720.00,
    currency: 'BRL',
    shortDescription: 'Proteção e estilo icônico. Lentes polarizadas com 100% de proteção UV e armação de metal leve e resistente.',
    description: `
      <h2>Visão Clara, Estilo Inconfundível</h2>
      <p>O design clássico do aviador encontra a tecnologia moderna de lentes polarizadas. Estes óculos de sol não apenas protegem seus olhos, mas também elevam seu estilo a um novo patamar.</p>
    `,
    images: [
      'https://picsum.photos/seed/glasses1/600/600',
      'https://picsum.photos/seed/glasses2/600/600',
      'https://picsum.photos/seed/glasses3/600/600',
    ],
    rating: 4.9,
    reviewCount: 88,
    collectionId: null,
    status: 'Ativo',
    inventory: 40,
    type: 'Físico',
    sku: 'SUN-AVIA-POL',
    requiresShipping: true,
    trackQuantity: true,
    chargeTax: true,
    continueSelling: false,
    options: [],
    variants: [],
    weight: 0.15,
    weightUnit: 'kg',
    supplier: 'Design de Óculos Italiano',
  },
   {
    id: '5',
    name: 'Curso Online de Marketing Digital',
    seller: 'Academia do Saber',
    price: 497.00,
    currency: 'BRL',
    shortDescription: 'Domine as estratégias essenciais de marketing digital, de SEO a mídias sociais, e impulsione sua carreira ou negócio.',
    description: `
      <h2>Transforme sua Carreira com Marketing Digital</h2>
      <p>Aprenda com especialistas do setor e adquira as habilidades mais procuradas do mercado. Este curso abrangente cobre tudo o que você precisa para ter sucesso no mundo digital.</p>
    `,
    images: [
      'https://picsum.photos/seed/course1/600/600',
    ],
    rating: 4.8,
    reviewCount: 250,
    collectionId: null,
    status: 'Ativo',
    inventory: 1000, // Typically high for digital products
    type: 'Digital',
    sku: 'DIG-MKT-COURSE',
    requiresShipping: false,
    trackQuantity: false,
    chargeTax: false,
    continueSelling: true,
    options: [],
    variants: [],
  },
];