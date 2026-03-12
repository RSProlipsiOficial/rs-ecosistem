import React from 'react';
import EditableButton from './EditableButton';
import { useNavigation } from '../context/NavigationContext';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { ContentContainer, EditablePage } from '../types';
import EditableText from './EditableText';

interface HeroSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
  backgroundBanner?: EditablePage['backgroundBanner'];
}

const HeroSection: React.FC<HeroSectionProps> = ({ container, onEdit, pageId, backgroundBanner }) => {
  const { setPage } = useNavigation();
  const { isAdmin, isEditMode, isPreviewEditor } = useAdmin();

  const heroBackgroundFromContainer = container.styles?.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/, '$1') || 'https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2';
  const pageBannerBackground = backgroundBanner?.enabled && backgroundBanner.imageUrl
    ? backgroundBanner.imageUrl
    : null;
  const heroBackgroundUrl = pageBannerBackground || heroBackgroundFromContainer;
  const heroBackgroundOpacity = pageBannerBackground ? (backgroundBanner?.opacity ?? 0.42) : 1;
  const overlayTopOpacity = pageBannerBackground ? Math.max(0.22, 0.92 - (heroBackgroundOpacity * 0.58)) : 0.8;
  const overlayMidOpacity = pageBannerBackground ? Math.max(0.36, 0.96 - (heroBackgroundOpacity * 0.42)) : 0.9;
  const overlayBottomOpacity = pageBannerBackground ? Math.max(0.88, 1 - (heroBackgroundOpacity * 0.08)) : 1;
  const overlayBackground = `linear-gradient(to bottom, rgba(18, 18, 18, ${overlayTopOpacity}), rgba(18, 18, 18, ${overlayMidOpacity}), rgba(18, 18, 18, ${overlayBottomOpacity}))`;

  const handleCtaClick = () => {
    if (container.ctaLink) {
        setPage(container.ctaLink);
    }
  };

  const sectionContent = (
    <section 
      id="hero" 
      className={`relative flex items-center justify-center overflow-hidden text-center text-text-primary ${container.styles?.minHeight || 'h-screen'}`} 
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${heroBackgroundUrl}')`,
          opacity: heroBackgroundOpacity,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: overlayBackground }}
      />
      <div className="relative z-10 p-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl tracking-tight mb-4 leading-tight md:leading-snug text-shadow flex flex-col items-center">
          <EditableText as="span" className="text-accent" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
          {container.interstitialText && (
             <EditableText as="span" className="my-1 md:my-2 text-xl md:text-3xl font-light text-text-primary uppercase tracking-widest" pageId={pageId} containerId={container.id} fieldPath="interstitialText" htmlContent={container.interstitialText} />
          )}
          <EditableText as="span" className="text-accent" pageId={pageId} containerId={container.id} fieldPath="subtitle" htmlContent={container.subtitle || ''} />
        </h1>
        <EditableText as="p" className="max-w-3xl text-lg md:text-xl text-text-secondary mb-8 leading-relaxed text-shadow" pageId={pageId} containerId={container.id} fieldPath="content" htmlContent={container.content || ''} />

        {container.ctaText && (
            <EditableButton buttonKey="hero_cta">
                <button onClick={handleCtaClick} className="text-lg hover:opacity-80 transition-all duration-300 transform hover:scale-110">
                    {container.ctaText}
                </button>
            </EditableButton>
        )}
      </div>
      {container.styles?.minHeight !== '60vh' && ( // Only show scroll indicator for full-height hero
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <a href="#about" aria-label="Scroll to about section" className="p-2">
                <div className="w-8 h-14 border-2 border-gray-400 hover:border-text-primary transition-colors rounded-full flex justify-center items-start pt-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
            </a>
        </div>
      )}
    </section>
  );

  if (isAdmin && isEditMode) {
    const handlePreviewEdit = (event: React.MouseEvent) => {
      if (!isPreviewEditor) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onEdit();
    };

    return (
        <div
            className={`relative group editable-section-wrapper ${isPreviewEditor ? 'cursor-pointer' : ''}`}
            onClick={handlePreviewEdit}
        >
            {sectionContent}
            <div className={`absolute inset-0 border-2 border-dashed transition-all pointer-events-none ${isPreviewEditor ? 'border-accent/50 group-hover:border-accent' : 'border-transparent group-hover:border-accent'}`}></div>
            <button
                onClick={onEdit} // Use the onEdit callback from props
                className={`absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center transition-opacity z-30 ${isPreviewEditor ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                aria-label="Edit Hero Section"
            >
                <PencilSquareIcon className="w-5 h-5" />
            </button>
            {isPreviewEditor && (
              <div className="pointer-events-none absolute bottom-6 right-6 rounded-full border border-accent/40 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Clique para editar
              </div>
            )}
        </div>
    );
  }

  return sectionContent;
};

export default HeroSection;
