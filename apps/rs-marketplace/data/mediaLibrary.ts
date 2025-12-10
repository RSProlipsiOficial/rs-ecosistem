import { MediaAsset } from '../types';

export const initialMediaAssets: MediaAsset[] = [
  {
    id: 'media-1',
    name: 'Relógio Clássico no Pulso',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/watch1/600/600',
    previewUrl: 'https://picsum.photos/seed/watch1/600/600',
  },
  {
    id: 'media-2',
    name: 'Bolsa de Couro Detalhe',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/bag1/600/600',
    previewUrl: 'https://picsum.photos/seed/bag1/600/600',
  },
  {
    id: 'media-3',
    name: 'Óculos Aviador em Foco',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/glasses1/600/600',
    previewUrl: 'https://picsum.photos/seed/glasses1/600/600',
  },
  {
    id: 'media-4',
    name: 'Caneta Tinteiro Escrevendo',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/pen1/600/600',
    previewUrl: 'https://picsum.photos/seed/pen1/600/600',
  },
  {
    id: 'media-5',
    name: 'Unboxing Óculos de Sol',
    // Fix: Changed type to a valid MediaAsset type ('template' for video) and added missing properties.
    type: 'template',
    format: 'PDF',
    downloadUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    previewUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'media-6',
    name: 'Demonstração Smartwatch',
    // Fix: Changed type to a valid MediaAsset type ('template' for video) and added missing properties.
    type: 'template',
    format: 'PDF',
    downloadUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    previewUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'media-7',
    name: 'Detalhes Bolsa de Ombro',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/bag2/600/600',
    previewUrl: 'https://picsum.photos/seed/bag2/600/600',
  },
  {
    id: 'media-8',
    name: 'Close-up Relógio',
    // Fix: Changed type to a valid MediaAsset type and added missing properties.
    type: 'banner',
    format: 'JPG',
    downloadUrl: 'https://picsum.photos/seed/watch2/600/600',
    previewUrl: 'https://picsum.photos/seed/watch2/600/600',
  },
];