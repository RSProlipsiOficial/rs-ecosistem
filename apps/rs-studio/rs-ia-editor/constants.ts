import { AdFormat, TextLayer } from './types';

export const AD_FORMATS: AdFormat[] = [
  { id: 'feed', name: 'Feed Quadrado', width: 1080, height: 1080, label: '1080 x 1080', aspectRatio: '1:1' },
  { id: 'story', name: 'Story / Reels', width: 1080, height: 1920, label: '1080 x 1920', aspectRatio: '9:16' },
  { id: 'portrait', name: 'Feed Vertical', width: 1080, height: 1350, label: '1080 x 1350', aspectRatio: '3:4' }, // Gemini supports 3:4 close to 4:5
  { id: 'landscape', name: 'Link / Horizontal', width: 1200, height: 628, label: '1200 x 628', aspectRatio: '16:9' }, // Approx
];

export const INITIAL_LAYERS: TextLayer[] = [
  {
    id: 'headline-1',
    text: 'HEADLINE SOFISTICADA',
    x: 100,
    y: 100,
    fontSize: 64,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: '#FFFFFF',
    align: 'left',
    type: 'headline',
    uppercase: true,
    opacity: 1,
    letterSpacing: 0.05,
    shadow: true,
  },
  {
    id: 'body-1',
    text: 'Descreva seu produto exclusivo aqui com elegância.',
    x: 100,
    y: 300,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: 400,
    color: '#E5E5E5',
    align: 'left',
    type: 'body',
    opacity: 1,
    letterSpacing: 0,
    shadow: false,
  },
  {
    id: 'cta-1',
    text: 'SAIBA MAIS',
    x: 100,
    y: 500,
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: '#000000',
    align: 'center',
    type: 'cta',
    opacity: 1,
    letterSpacing: 0.1,
    shadow: false,
  }
];