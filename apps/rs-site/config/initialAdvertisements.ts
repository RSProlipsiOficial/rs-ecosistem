
import { Advertisement } from '../types';

export const initialAdvertisements: Advertisement[] = [
  {
    id: 'ad_1',
    title: 'Campanha de Verão RS Prólipsi',
    description: 'Descubra nossas ofertas exclusivas para a estação mais quente do ano. Produtos com até 40% de desconto!',
    imageUrl: 'https://picsum.photos/seed/ad1/1200/675',
    ctaText: 'Ver Ofertas',
    ctaLink: '#',
    isActive: true,
  },
  {
    id: 'ad_2',
    title: 'Junte-se à Nossa Equipe',
    description: 'Estamos expandindo! Procuramos por empreendedores apaixonados para se juntarem à nossa rede global. Saiba mais sobre a oportunidade.',
    imageUrl: 'https://picsum.photos/seed/ad2/1200/675',
    ctaText: 'Saiba Mais',
    ctaLink: '#',
    isActive: true,
  },
  {
    id: 'ad_3',
    title: 'Lançamento: Linha Zen',
    description: 'A nova linha de produtos Zen Aromatherapy já está disponível. Encontre seu equilíbrio e bem-estar.',
    imageUrl: 'https://picsum.photos/seed/ad3/1200/675',
    ctaText: 'Comprar Agora',
    ctaLink: '#',
    isActive: false,
  },
];
