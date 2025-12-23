import { Pixel } from '../types';

export const pixels: Pixel[] = [
  {
    id: 'PIX-FB-001',
    // Fix: Added missing 'type' property.
    type: 'Facebook',
    name: 'Facebook Pixel',
    pixelId: '123456789012345',
    status: 'Ativo',
    events: {
      pageView: true,
      viewContent: true,
      addToCart: true,
      initiateCheckout: false,
      purchase: true,
    }
  },
  {
    id: 'PIX-GA-001',
    // Fix: Added missing 'type' property.
    type: 'Google Analytics',
    name: 'Google Analytics',
    pixelId: 'UA-98765432-1',
    status: 'Ativo',
    events: {
      pageView: true,
      viewContent: true,
      addToCart: true,
      initiateCheckout: true,
      purchase: true,
    }
  },
  {
    id: 'PIX-TT-001',
    // Fix: Added missing 'type' property.
    type: 'TikTok',
    name: 'TikTok Pixel',
    pixelId: 'C1ABCDEFGHIJ0123456789',
    status: 'Inativo',
    events: {
      pageView: true,
      viewContent: false,
      addToCart: false,
      initiateCheckout: false,
      purchase: false,
    }
  }
];