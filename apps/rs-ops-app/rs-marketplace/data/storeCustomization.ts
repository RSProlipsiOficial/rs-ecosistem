
import { StoreCustomization } from '../types';

export const initialStoreCustomization: StoreCustomization = {
  logoUrl: '', // Default to text logo
  logoMaxWidth: 200,
  faviconUrl: '',
  faviconMaxWidth: 32,
  hero: {
    title: 'Elegância, Redefinida.',
    subtitle: 'Descubra um mercado selecionado de produtos premium de vendedores confiáveis. Sua jornada para o luxo começa aqui.',
    desktopImage: 'https://picsum.photos/seed/hero-desktop/1600/900?grayscale',
    mobileImage: 'https://picsum.photos/seed/hero-mobile/800/1200?grayscale',
    buttonAnchor: '#featuredProducts',
  },
  carouselBanners: [
    {
      id: 'banner-1',
      desktopImage: 'https://picsum.photos/seed/carousel1-desktop/1200/400',
      mobileImage: 'https://picsum.photos/seed/carousel1-mobile/400/300',
      link: '#',
      position: 'top',
    },
    {
      id: 'banner-2',
      desktopImage: 'https://picsum.photos/seed/carousel2-desktop/1200/400',
      mobileImage: 'https://picsum.photos/seed/carousel2-mobile/400/300',
      link: '#',
      position: 'middle',
    },
    {
      id: 'banner-3',
      desktopImage: 'https://picsum.photos/seed/carousel3-desktop/1200/400',
      mobileImage: 'https://picsum.photos/seed/carousel3-mobile/400/300',
      link: '#',
      position: 'bottom',
    },
  ],
  midPageBanner: {
    id: 'mid-banner-1',
    desktopImage: 'https://picsum.photos/seed/midbanner-desktop/1200/300',
    mobileImage: 'https://picsum.photos/seed/midbanner-mobile/400/200',
    link: '#',
  },
  footer: {
    description: 'O futuro do e-commerce premium.',
    buyerLinks: [
      { label: 'Encontrar Produtos', url: '#featured-products' },
      { label: 'Sua Conta', url: '#' },
      { label: 'Rastrear Pedidos', url: '#' },
    ],
    sellerLinks: [
      { label: 'Painel do Lojista', url: '#', isAction: true },
      { label: 'Seja um Lojista', url: '#' },
      { label: 'Ferramentas de Marketing', url: '#' },
    ],
    companyLinks: [],
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/rsprolipsi' },
      { platform: 'instagram', url: 'https://instagram.com/rsprolipsi' },
      { platform: 'twitter', url: 'https://twitter.com/rsprolipsi' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/rsprolipsi' },
    ],
    contactEmail: 'contato@rsprolipsi.com.br',
    cnpj: '00.000.000/0001-00',
    businessAddress: 'Rua Exemplo, 123 - Centro, São Paulo - SP, 01010-010',
    paymentMethods: [], // Removed as per user request
    shippingMethods: [], // Removed as per user request
  },
  orderBump: {
    enabled: true,
    productId: '486f290d-500f-4c1c-8889-f8d2db87c2bc',
    offerPrice: 99.90,
    title: 'SIM, QUERO LEVAR O INFLAMAXI COM DESCONTO',
    description: 'Regras iniciais do order bump do marketplace RS Prolipsi.',
    triggerProductIds: ['802529e1-ead9-4eef-bf20-4ce63e25ec92'],
    offers: [
      { productId: '486f290d-500f-4c1c-8889-f8d2db87c2bc', offerPrice: 99.90 },
    ],
    rules: [
      {
        id: 'seed-pro3-inflamaxi',
        name: 'Pro 3+ -> Inflamaxi',
        title: 'SIM, QUERO LEVAR O INFLAMAXI COM DESCONTO',
        description: 'Ao comprar o Pro 3+, adicione Inflamaxi ao pedido com preco especial.',
        triggerProductIds: ['802529e1-ead9-4eef-bf20-4ce63e25ec92'],
        offers: [
          { productId: '486f290d-500f-4c1c-8889-f8d2db87c2bc', offerPrice: 99.90 },
        ],
      },
      {
        id: 'seed-alpha-diva',
        name: 'AlphaLipsi -> DivaLipsi',
        title: 'COMBINE COM DIVALIPSI E PAGUE MENOS',
        description: 'Quem leva AlphaLipsi pode incluir DivaLipsi no mesmo pedido com valor promocional.',
        triggerProductIds: ['d8da03a4-d45a-4390-8698-9a35d43647c8'],
        offers: [
          { productId: 'b98c42b9-52c5-478e-b172-faee36c6ba2c', offerPrice: 99.90 },
        ],
      },
      {
        id: 'seed-diva-alpha',
        name: 'DivaLipsi -> AlphaLipsi',
        title: 'LEVE TAMBEM O ALPHALIPSI COM DESCONTO',
        description: 'Ao comprar DivaLipsi, ofereca AlphaLipsi como complemento com preco especial.',
        triggerProductIds: ['b98c42b9-52c5-478e-b172-faee36c6ba2c'],
        offers: [
          { productId: 'd8da03a4-d45a-4390-8698-9a35d43647c8', offerPrice: 99.90 },
        ],
      },
    ],
  },
  upsell: {
    enabled: true,
    triggerProductId: '',
    productId: '2', // GlicoLipsi
    offerPrice: 109.90,
    title: '✨ OFERTA ÚNICA PÓS-COMPRA! ✨',
    description: 'Parabéns pela sua compra! Complete seu tratamento com o GlicoLipsi — equilíbrio metabólico e vitalidade diária por um preço que você não verá novamente!',
    acceptButtonText: 'Sim, adicionar ao meu pedido com 1 clique!',
    declineButtonText: 'Não, obrigado. Perder esta oferta.',
  },
  promotionRequests: [],
  homepageSections: [
    { id: 'hero', name: 'Banner Principal (Hero)', enabled: true, order: 1 },
    { id: 'carousel', name: 'Carrossel de Banners', enabled: true, order: 2 },
    { id: 'featuredProducts', name: 'Produtos em Destaque', enabled: true, order: 3 },
    { id: 'offers', name: 'Ofertas Especiais', enabled: true, order: 4 },
    { id: 'bestsellers', name: 'Mais Vendidos', enabled: true, order: 5 },
    { id: 'featuredCollections', name: 'Coleções em Destaque', enabled: true, order: 6 },
    { id: 'recentlyViewed', name: 'Vistos Recentemente', enabled: true, order: 7 },
    { id: 'midPageBanner', name: 'Banner de Meio da Página', enabled: true, order: 8 },
  ],
  carouselHeight: 400,
  carouselHeightMobile: 300,
  customCss: `/*
============================================================
  CSS DA LOJA OFICIAL - RS Prólipsi
============================================================
  Este arquivo contém o estilo base completo da sua loja.
  Use-o como ponto de partida para suas personalizações.
*/

/* 
============================================================
  1. ESTILOS GERAIS E FONTES (PALETA APLICADA)
============================================================
*/
body {
  background-color: #121212; /* Preto Absoluto */
  color: #E5E7EB; /* Branco Neve */
  font-family: 'Roboto', sans-serif;
}

.font-display {
  font-family: 'Playfair Display', serif;
}

/* Scrollbar Personalizada */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #121212;
}
::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3a3a3a;
}

/* 
============================================================
  2. CABEÇALHO (HEADER) (PALETA APLICADA)
============================================================
*/
header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(30, 30, 30, 0.8); /* Cinza Grafite com transparência */
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3); /* Ouro Prólipsi com transparência */
}

header .logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.875rem; /* text-3xl */
  color: #FFD700; /* Ouro Prólipsi */
}

header .search-bar {
  background-color: #121212; /* Preto Absoluto */
  border: 2px solid #2A2A2A; /* Cinza Claro */
  border-radius: 9999px; /* rounded-full */
  color: #E5E7EB; /* Branco Neve */
  transition: border-color 0.3s;
}

header .search-bar:focus {
  outline: none;
  border-color: #FFD700; /* Ouro Prólipsi */
}

header .nav-link {
  color: #E5E7EB; /* Branco Neve */
  transition: color 0.3s;
}

header .nav-link:hover {
  color: #FFD700; /* Ouro Prólipsi */
}

/* Animação do Dropdown de Categorias */
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.2s ease-out forwards;
}

header .category-dropdown {
  background-color: #1E1E1E; /* Cinza Grafite */
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 0.375rem; /* rounded-md */
}

header .category-dropdown a {
  color: #E5E7EB; /* Branco Neve */
  transition: background-color 0.3s, color 0.3s;
}

header .category-dropdown a:hover {
  background-color: #FFD700; /* Ouro Prólipsi */
  color: #121212; /* Preto Absoluto */
}


/* 
============================================================
  3. BANNER PRINCIPAL (HERO) (PALETA APLICADA)
============================================================
*/
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 70vh;
  background-size: cover;
  background-position: center;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(18, 18, 18, 0.6); /* Preto Absoluto com transparência */
}

.hero-section h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 3.75rem; /* text-6xl */
  color: #E5E7EB; /* Branco Neve */
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.hero-section p {
  color: #E5E7EB; /* Branco Neve */
  font-size: 1.25rem; /* text-xl */
}

/* 
============================================================
  4. BOTÕES (BUTTONS) (PALETA APLICADA)
============================================================
*/
.btn-primary {
  background-color: #FFD700; /* Ouro Prólipsi */
  color: #121212; /* Preto Absoluto */
  font-weight: 700;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid #FFD700; /* Ouro Prólipsi */
  color: #FFD700; /* Ouro Prólipsi */
  font-weight: 700;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  transition: background-color 0.3s, color 0.3s;
}

.btn-secondary:hover {
  background-color: #FFD700;
  color: #121212;
}


/* 
============================================================
  5. SEÇÕES E CARDS (PALETA APLICADA)
============================================================
*/
.section-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 2.25rem; /* text-4xl */
  color: #E5E7EB; /* Branco Neve */
}

.section-subtitle {
  color: #9CA3AF; /* Cinza Suave */
  font-size: 1.125rem; /* text-lg */
}

/* Card de Produto */
.product-card {
  background-color: rgba(30, 30, 30, 0.5); /* Cinza Grafite com transparência */
  border: 1px solid #2A2A2A; /* Cinza Claro */
  border-radius: 0.5rem; /* rounded-lg */
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
}

.product-card img {
  transition: transform 0.3s;
}

.product-card:hover img {
  transform: scale(1.05);
}

.product-card h3 {
  transition: color 0.3s;
}

.product-card:hover h3 {
  color: #FFD700; /* Ouro Prólipsi */
}

.product-card .price {
  color: #FFD700; /* Ouro Prólipsi */
  font-weight: 600;
  font-size: 1.25rem; /* text-xl */
}

/* Card de Chamada para Ação (CTA) */
.cta-card {
  background: linear-gradient(to bottom right, #1E1E1E, #121212); /* Cinza Grafite para Preto Absoluto */
  padding: 2rem;
  border-radius: 0.5rem; /* rounded-lg */
  border: 2px solid #2A2A2A; /* Cinza Claro */
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}

/* 
============================================================
  6. RODAPÉ (FOOTER) (PALETA APLICADA)
============================================================
*/
footer {
  background-color: #1E1E1E; /* Cinza Grafite */
  color: #9CA3AF; /* Cinza Suave */
  border-top: 1px solid #2A2A2A; /* Cinza Claro */
}

footer h4 {
  font-weight: 700;
  color: #E5E7EB; /* Branco Neve */
  letter-spacing: 0.05em; /* tracking-wider */
}

footer a, footer button {
  transition: color 0.3s;
}

footer a:hover, footer button:hover {
  color: #FFD700; /* Ouro Prólipsi */
}

/* 
============================================================
  7. DETALHES DO PRODUTO (PRODUCT DETAIL PAGE) (PALETA APLICADA)
============================================================
*/
.product-detail .category {
  color: #FFD700; /* Ouro Prólipsi */
  font-weight: 600;
}

.product-detail .title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: #E5E7EB; /* Branco Neve */
}

.product-detail .price {
  color: #FFD700; /* Ouro Prólipsi */
  font-weight: 300;
}

.product-detail .prose {
  color: #E5E7EB; /* Branco Neve */
  line-height: 1.75;
}

.product-detail .prose h1,
.product-detail .prose h2,
.product-detail .prose h3 {
  color: #E5E7EB;
}

.product-detail .prose a {
  color: #60a5fa; /* blue-400 for links is fine */
}

.product-detail .prose blockquote {
  border-left: 3px solid #FFD700; /* Ouro Prólipsi */
  padding-left: 1rem;
  margin-left: 0.5rem;
  font-style: italic;
  color: #E5E7EB;
}

/* 
============================================================
  8. PAINEL DE ADMINISTRAÇÃO (ADMIN) (PALETA APLICADA)
============================================================
*/
.admin-layout {
  background-color: #121212; /* Preto Absoluto */
  color: #E5E7EB; /* Branco Neve */
}

.admin-sidebar {
  background-color: #1E1E1E; /* Cinza Grafite */
  color: #E5E7EB; /* Branco Neve */
}

.admin-sidebar button:hover {
  background-color: #2A2A2A; /* Cinza Claro */
}

.admin-sidebar button.active {
  color: #FFD700; /* Ouro Prólipsi */
  background-color: #2A2A2A; /* Cinza Claro */
}

.admin-header {
  background-color: #1E1E1E; /* Cinza Grafite */
  border-bottom: 1px solid #2A2A2A; /* Cinza Claro */
}

.admin-card {
  background-color: #1E1E1E; /* Cinza Grafite */
  border: 1px solid #2A2A2A; /* Cinza Claro */
  border-radius: 0.5rem; /* rounded-lg */
}

.admin-input {
  background-color: #121212; /* Preto Absoluto */
  border: 2px solid #2A2A2A; /* Cinza Claro */
  border-radius: 0.375rem; /* rounded-md */
  color: #E5E7EB; /* Branco Neve */
}

.admin-input:focus {
  outline: none;
  border-color: #FFD700; /* Ouro Prólipsi */
}

.admin-table th {
  text-transform: uppercase;
  background-color: #1E1E1E; /* Cinza Grafite */
  color: #9CA3AF; /* Cinza Suave */
}

.admin-table tr {
  border-bottom: 1px solid #2A2A2A; /* Cinza Claro */
}

.admin-table tr:hover {
  background-color: rgba(42, 42, 42, 0.5); /* Cinza Claro com transparência */
}
`,
};

