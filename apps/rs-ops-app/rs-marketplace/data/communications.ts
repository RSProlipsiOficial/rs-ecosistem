import { Announcement, Training, MarketingAsset } from '../types';

export const announcements: Announcement[] = [
    {
        id: 'ann-1',
        title: 'Lançamento do Novo Plano de Compensação 2025',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        content: `
            <h2>Detalhes do Novo Plano de Compensação</h2>
            <p>Estamos entusiasmados em anunciar nosso novo plano de compensação, projetado para recompensar ainda mais seu esforço e dedicação. As principais mudanças incluem:</p>
            <ul>
                <li><strong>Novos Níveis:</strong> Introduzimos os níveis de Rubi e Esmeralda.</li>
                <li><strong>Bônus Acelerado:</strong> Ganhos mais rápidos nos primeiros 90 dias.</li>
                <li><strong>Prêmios de Liderança:</strong> Recompensas exclusivas para líderes de equipe.</li>
            </ul>
            <p>Acesse a seção de treinamentos para um vídeo explicativo completo.</p>
        `,
        isPinned: true,
    },
    {
        id: 'ann-2',
        title: 'Atualização da Política de Devoluções',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>Nossa política de devoluções foi atualizada para melhor atender nossos clientes e lojistas. O prazo para solicitação de devolução agora é de 10 dias corridos após o recebimento do produto.</p>',
        // Fix: Added missing 'isPinned' property.
        isPinned: false,
    },
    {
        id: 'ann-3',
        title: 'Próxima Live de Treinamento: Técnicas de Venda',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>Não perca nossa próxima live de treinamento nesta sexta-feira, às 19h. Vamos abordar as melhores técnicas para aumentar suas vendas e engajar clientes. O link será disponibilizado no dia.</p>',
        // Fix: Added missing 'isPinned' property.
        isPinned: false,
    },
];

export const trainings: Training[] = [
    {
        id: 'train-1',
        title: 'Configurando Sua Loja de Sucesso',
        description: 'Aprenda o passo a passo para montar e configurar sua loja virtual do zero, pronta para vender.',
        thumbnailUrl: 'https://picsum.photos/seed/store-success/400/200',
        progress: 50,
        lessons: [
            { id: 'l1-1', title: 'O que é Facebook Ads?', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', content: 'Facebook Ads é a plataforma de publicidade da Meta, que permite criar e veicular anúncios no Facebook, Instagram, Messenger e Audience Network. Com ela, é possível alcançar um público altamente segmentado com base em demografia, interesses e comportamentos. O objetivo principal é gerar resultados de negócios, como reconhecimento de marca, geração de leads, tráfego para o site e vendas. A plataforma oferece diversos formatos de anúncio, incluindo imagens, vídeos, carrosséis e coleções.', likes: 127 },
            { id: 'l1-2', title: 'Criando sua Conta de Anúncios', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', content: 'Para começar a anunciar, você precisa de uma conta no Gerenciador de Negócios (Business Manager) da Meta. Dentro do Gerenciador, você criará uma Conta de Anúncios. É crucial configurar corretamente as informações de pagamento e faturamento. Lembre-se de adicionar uma forma de pagamento válida, como cartão de crédito ou boleto, para que seus anúncios possam ser veiculados. A estrutura ideal é ter uma conta do Gerenciador de Negócios que gerencia múltiplas contas de anúncios, caso você trabalhe com diferentes clientes ou projetos.', likes: 98 },
            { id: 'l1-3', title: 'Como Criar uma Página (Fanpage)', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', content: 'Uma Página no Facebook (Fanpage) é a identidade da sua empresa na plataforma. É por meio dela que seus anúncios serão veiculados. Para criar uma, vá até a seção "Páginas" do seu perfil e clique em "Criar Nova Página". Preencha as informações essenciais como nome, categoria, descrição, foto de perfil e capa. Uma página bem configurada transmite profissionalismo e confiança para seu público.', likes: 153 },
            { id: 'l1-4', title: 'Instalando o Pixel do Facebook', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', content: 'O Pixel da Meta é um trecho de código que você instala em seu site. Sua função é rastrear as ações dos visitantes, como visualizações de página, adições ao carrinho e compras. Esses dados são valiosos para otimizar suas campanhas, criar públicos personalizados (remarketing) e mensurar o retorno sobre o investimento (ROI) dos seus anúncios. A instalação pode ser feita manualmente, via gerenciadores de tags como o Google Tag Manager, ou através de integrações com plataformas de e-commerce.', likes: 212 },
        ]
    },
    {
        id: 'train-2',
        title: 'Dominando o Produto e a Oferta',
        description: 'Aprenda a escolher produtos vencedores e criar ofertas irresistíveis que vendem todos os dias.',
        thumbnailUrl: 'https://picsum.photos/seed/product-offer/400/200',
        progress: 50,
        lessons: [
             { id: 'l2-1', title: 'Análise de Mercado e Nicho', videoUrl: 'placeholder.mp4', content: 'SEO (Search Engine Optimization) é o conjunto de técnicas para otimizar seu site e conteúdo para os mecanismos de busca...', likes: 88 },
             { id: 'l2-2', title: 'Criação de Ofertas Irresistíveis', videoUrl: 'placeholder.mp4', content: 'Aprenda a encontrar os termos que seu público-alvo utiliza para buscar por seus produtos ou serviços...', likes: 112 },
        ]
    },
    {
        id: 'train-3',
        title: 'Logística de Dropshipping Simplificada',
        description: 'Entenda todo o fluxo de um pedido, desde a venda até a entrega na casa do cliente, sem estresse.',
        thumbnailUrl: 'https://picsum.photos/seed/dropship-logistics/400/200',
        progress: 33,
        lessons: [
            { id: 'l3-1', title: 'O Ciclo de Vida do Pedido Drop', videoUrl: 'placeholder.mp4', content: 'Conheça a trajetória da RS Prólipsi e os valores que guiam nossa jornada...', likes: 130 },
        ]
    },
    {
        id: 'train-4',
        title: 'RSIA: Sua Assistente de Vendas',
        description: 'Aprenda a utilizar as ferramentas de IA da plataforma para otimizar suas vendas e marketing.',
        thumbnailUrl: 'https://picsum.photos/seed/ai-assistant/400/200',
        progress: 0,
        lessons: [
            { id: 'l4-1', title: 'Introdução à RSIA', videoUrl: 'placeholder.mp4', content: 'Descubra como nossa inteligência artificial, a RSIA, pode ser sua maior aliada...', likes: 250 },
        ]
    },
];

export const marketingAssets: MarketingAsset[] = [
    {
        id: 'asset-1',
        name: 'Logo Oficial RS Prólipsi (Ouro)',
        type: 'logo',
        format: 'PNG',
        downloadUrl: 'https://picsum.photos/seed/logo-gold-dl/500/500',
        previewUrl: 'https://picsum.photos/seed/logo-gold-pv/200/200',
    },
    {
        id: 'asset-2',
        name: 'Banner Promocional - Dia das Mães',
        type: 'banner',
        format: 'JPG',
        downloadUrl: 'https://picsum.photos/seed/assetbanner1/1200/600',
        previewUrl: 'https://picsum.photos/seed/assetbanner1/400/200',
    },
    {
        id: 'asset-3',
        name: 'Template de Post (PDF)',
        type: 'template',
        format: 'PDF',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: 'https://i.imgur.com/S5OK3sI.png',
    },
    {
        id: 'asset-4',
        name: 'Logo Oficial RS Prólipsi (Preto)',
        type: 'logo',
        format: 'PNG',
        downloadUrl: 'https://picsum.photos/seed/logo-black-dl/500/500',
        previewUrl: 'https://picsum.photos/seed/logo-black-pv/200/200',
    },
    {
        id: 'asset-5',
        name: 'Guia de Produto - Relógios',
        type: 'template',
        format: 'PDF',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: 'https://i.imgur.com/S5OK3sI.png',
    },
    {
        id: 'asset-6',
        name: 'Manual de Marca',
        type: 'template',
        format: 'PDF',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: 'https://i.imgur.com/S5OK3sI.png',
    },
    {
        id: 'asset-7',
        name: 'Catálogo de Bolsas',
        type: 'template',
        format: 'PDF',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: 'https://i.imgur.com/S5OK3sI.png',
    },
];