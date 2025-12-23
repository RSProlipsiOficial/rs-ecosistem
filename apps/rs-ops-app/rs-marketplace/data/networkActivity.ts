

// data/networkActivity.ts
// Fix: Removed React import as JSX is not being used in this .ts file.
import { NetworkActivityItem } from '../types';

export const networkActivity: NetworkActivityItem[] = [
  {
    id: 'na-1',
    icon: 'UserPlusIcon',
    // Fix: Changed text to a plain string, as JSX is not supported in .ts files.
    // The consuming component will use dangerouslySetInnerHTML to render this string as HTML.
    text: '<strong>Lucas Martins</strong> se cadastrou usando seu link de indicação!',
    timestamp: '2 horas atrás',
  },
  {
    id: 'na-2',
    icon: 'ShoppingCartIcon',
    // Fix: Changed text to a plain string, as JSX is not supported in .ts files.
    text: 'Novo pedido de <strong>R$ 1.250,00</strong> na sua loja.',
    timestamp: '5 horas atrás',
  },
  {
    id: 'na-3',
    icon: 'TrophyIcon',
    // Fix: Changed text to a plain string, as JSX is not supported in .ts files.
    text: 'Você alcançou o nível <strong>PRATA</strong> no plano de carreira!',
    timestamp: '1 dia atrás',
  },
  {
    id: 'na-4',
    icon: 'StarOutlineIcon',
    // Fix: Changed text to a plain string, as JSX is not supported in .ts files.
    text: '<strong>Maria Eduarda</strong> deixou uma nova avaliação em um produto.',
    timestamp: '2 dias atrás',
  },
];