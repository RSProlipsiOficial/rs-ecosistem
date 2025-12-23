import { CompensationSettings } from '../types';

export const initialCompensationSettings: CompensationSettings = {
  dropshippingPointsPerBrl: 1,
  affiliatePointsPerBrl: 1.5,
  frequency: 'Trimestral',
  tiers: [
    {
      id: 'tier-1',
      name: 'Bronze',
      pointsRequired: 1000,
      reward: 150,
      pinImageUrl: 'https://i.imgur.com/J4pGo2K.png',
      bannerImageUrl: '',
    },
    {
      id: 'tier-2',
      name: 'Prata',
      pointsRequired: 2500,
      reward: 400,
      pinImageUrl: 'https://i.imgur.com/e22xkCr.png',
      bannerImageUrl: '',
    },
    {
      id: 'tier-3',
      name: 'Ouro',
      pointsRequired: 5000,
      reward: 1000,
      pinImageUrl: 'https://i.imgur.com/s6c3jZp.png',
      bannerImageUrl: '',
    },
  ],
};
