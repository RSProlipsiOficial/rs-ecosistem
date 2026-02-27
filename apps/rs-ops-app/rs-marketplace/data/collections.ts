import { Collection } from '../types';

export const collections: Collection[] = [
  {
    id: 'col-encapsulados',
    title: 'Encapsulados',
    description: 'Nossa linha completa de suplementos em cápsulas para sua saúde integral.',
    imageUrl: 'https://images.unsplash.com/photo-1550573105-df4574744720?auto=format&fit=crop&q=80&w=800',
    productIds: ['1', '2', '3', '4', '5', '6', '7'],
  },
  {
    id: 'col-essenciais',
    title: 'Essenciais',
    description: 'Produtos fundamentais para o equilíbrio do seu organismo no dia a dia.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    productIds: ['2', '4', '6'],
  },
  {
    id: 'col-homem',
    title: 'Saúde do Homem',
    description: 'Protocolos específicos para a performance e vitalidade masculina.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    productIds: ['1', '5', '6'],
  },
  {
    id: 'col-mulher',
    title: 'Saúde da Mulher',
    description: 'Nutrição e bem-estar focados nas necessidades do organismo feminino.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    productIds: ['3', '7'],
  },
  {
    id: 'col-emagrecimento',
    title: 'Emagrecimento',
    description: 'As ferramentas definitivas para sua jornada de perda de peso e definição.',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    productIds: ['1', '7'],
  },
];
