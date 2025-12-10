import React from 'react';
import { ContentContainer, TextImageLayout } from '../types';
import ContactFormComponent from './ContactFormComponent';
import EditableText from './EditableText';

interface ContentRendererProps {
  container: ContentContainer;
  pageId: string;
}

const getLayoutClasses = (layout: TextImageLayout = 'image-left') => {
  switch (layout) {
    case 'image-left':
      return {
        container: 'grid md:grid-cols-2 gap-8 md:gap-12 items-center',
        imageOrder: 'md:order-1 order-1',
        textOrder: 'md:order-2 order-2',
      };
    case 'image-right':
      return {
        container: 'grid md:grid-cols-2 gap-8 md:gap-12 items-center',
        imageOrder: 'md:order-2 order-1',
        textOrder: 'md:order-1 order-2',
      };
    case 'image-top':
      return {
        container: 'flex flex-col gap-6',
        imageOrder: 'order-1',
        textOrder: 'order-2',
      };
    case 'image-bottom':
       return {
        container: 'flex flex-col gap-6',
        imageOrder: 'order-2',
        textOrder: 'order-1',
      };
    default:
        return { container: '', imageOrder: '', textOrder: '' };
  }
};

const TextBlock: React.FC<ContentRendererProps> = ({ container, pageId }) => {
    return (
        <div style={{ maxWidth: container.styles?.maxWidth, margin: '0 auto' }}>
            <EditableText as="h2" className="text-3xl md:text-4xl section-title mb-6" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
            <EditableText as="p" className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed" pageId={pageId} containerId={container.id} fieldPath="subtitle" htmlContent={container.subtitle || ''} />
            <EditableText as="div" className="prose prose-invert max-w-none prose-static" pageId={pageId} containerId={container.id} fieldPath="content" htmlContent={container.content || ''} />
        </div>
    );
};

const ImageBlock: React.FC<ContentRendererProps> = ({ container }) => {
    return (
        <div style={{ width: container.imageWidth || '100%' }} className="mx-auto">
            <img src={container.imageUrl} alt={container.altText} className="rounded-lg shadow-lg w-full h-auto object-cover" />
        </div>
    );
};

const TextImageBlock: React.FC<ContentRendererProps> = ({ container, pageId }) => {
    const layoutClasses = getLayoutClasses(container.layout);
    
    return (
        <div className={layoutClasses.container}>
            <div className={layoutClasses.imageOrder} style={{ width: container.imageWidth || '100%' }}>
                <img src={container.imageUrl} alt={container.altText} className="rounded-lg shadow-lg w-full h-auto object-cover" />
            </div>
            <div className={layoutClasses.textOrder}>
                <EditableText as="h2" className="text-2xl md:text-3xl font-bold text-accent mb-4" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
                <EditableText as="div" className="prose prose-invert max-w-none prose-static" pageId={pageId} containerId={container.id} fieldPath="content" htmlContent={container.content || ''} />
            </div>
        </div>
    );
};

const ColumnsBlock: React.FC<ContentRendererProps> = ({ container, pageId }) => {
    const numColumns = container.columns?.length || 1;
    const gridColsClass = `md:grid-cols-${numColumns}`;

    return (
        <div className={`grid grid-cols-1 ${gridColsClass} gap-8`}>
            {container.columns?.map(column => (
                <div key={column.id} className="space-y-8">
                    {column.containers.map(innerContainer => (
                        <ContentRenderer 
                            key={innerContainer.id} 
                            container={innerContainer}
                            pageId={pageId} 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

const VideoBlock: React.FC<ContentRendererProps> = ({ container }) => {
    if (!container.videoUrl) return null;

    const getEmbedUrl = (url: string): string | null => {
        let videoId: string | null = null;
        try {
            if (url.includes('youtube.com/watch')) {
                videoId = new URL(url).searchParams.get('v');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (url.includes('youtu.be/')) {
                videoId = new URL(url).pathname.substring(1);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (url.includes('vimeo.com/')) {
                videoId = new URL(url).pathname.match(/\d+/)?.[0] || null;
                return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            }
        } catch (error) {
            console.error("Invalid video URL", error);
            return null;
        }
        return null; // Not a supported URL format
    };

    const embedUrl = getEmbedUrl(container.videoUrl);

    if (!embedUrl) {
        return <div className="text-red-400 text-center">Invalid video URL. Please use a valid YouTube or Vimeo link.</div>;
    }

    return (
        <div className="aspect-video max-w-4xl mx-auto">
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-lg"
            ></iframe>
        </div>
    );
};


const ContentRenderer: React.FC<ContentRendererProps> = ({ container, pageId }) => {
  switch (container.type) {
    case 'text':
      return <TextBlock container={container} pageId={pageId} />;
    case 'image':
      return <ImageBlock container={container} pageId={pageId} />;
    case 'textImage':
      return <TextImageBlock container={container} pageId={pageId} />;
    case 'columns':
      return <ColumnsBlock container={container} pageId={pageId} />;
    case 'video':
      return <VideoBlock container={container} pageId={pageId} />;
    case 'contactForm':
      return <ContactFormComponent />;
    default:
      return <div className="text-red-400">Unknown generic container type: {container.type}</div>;
  }
};

export default ContentRenderer;