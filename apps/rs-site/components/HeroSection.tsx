import React from 'react';
import EditableButton from './EditableButton';
import { useNavigation } from '../context/NavigationContext';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { ContentContainer } from '../types';
import EditableText from './EditableText';

interface HeroSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ container, onEdit, pageId }) => {
  const { setPage } = useNavigation();
  const { isAdmin, isEditMode } = useAdmin();

  const handleCtaClick = () => {
    if (container.ctaLink) {
        setPage(container.ctaLink);
    }
  };

  const sectionContent = (
    <section 
      id="hero" 
      className={`relative flex items-center justify-center text-center text-text-primary bg-cover bg-center ${container.styles?.minHeight || 'h-screen'}`} 
      style={{ backgroundImage: `url('${container.styles?.backgroundImage || 'https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2'}')` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background`}></div>
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
    return (
        <div className="relative group editable-section-wrapper">
            {sectionContent}
            <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
            <button
                onClick={onEdit} // Use the onEdit callback from props
                className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                aria-label="Edit Hero Section"
            >
                <PencilSquareIcon className="w-5 h-5" />
            </button>
        </div>
    );
  }

  return sectionContent;
};

export default HeroSection;
