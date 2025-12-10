import { ScheduledPost } from '../types';

export const initialScheduledPosts: ScheduledPost[] = [
  {
    id: 'post-1',
    platforms: ['Facebook', 'Instagram'],
    content: 'Descubra a elegância atemporal do nosso Relógio de Pulso Clássico de Couro. Perfeito para qualquer ocasião! ✨ #luxo #relogio #estilo',
    mediaUrl: 'https://picsum.photos/seed/watch1/600/600',
    mediaType: 'image',
    linkUrl: 'https://example.com/relogio-couro',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias a partir de agora
    status: 'Agendado',
  },
  {
    id: 'post-2',
    platforms: ['Pinterest', 'Facebook'],
    content: 'Procurando a bolsa perfeita? Nossa Bolsa de Ombro de Designer em Couro combina estilo e funcionalidade. Veja mais em nosso site!',
    mediaUrl: 'https://picsum.photos/seed/bag1/600/600',
    mediaType: 'image',
    linkUrl: 'https://example.com/bolsa-couro',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias a partir de agora
    status: 'Agendado',
  },
    {
    id: 'post-3',
    platforms: ['TikTok', 'Instagram'],
    content: 'Unboxing dos nossos novos Óculos de Sol Aviador Polarizados! 🕶️ Proteção e estilo que você merece. #oculosdesol #verao #unboxing',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mediaType: 'video',
    linkUrl: 'https://example.com/oculos-aviador',
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    status: 'Postado',
  },
];