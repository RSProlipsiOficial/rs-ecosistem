import React from 'react';
import { EditablePage, ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { useProductContext } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';

// Section-level components
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import DifferentiatorsSection from './DifferentiatorsSection';
import HomeProductsSection from './HomeProductsSection';
import PromotionsCarousel from './Carousel';
import ProductsSection from './ProductsSection';
import TeamMembersSection from './TeamMembersSection';
import DownloadsListSection from './DownloadsListSection';
import AdvertisingListSection from './AdvertisingListSection';
import BulkOrderForm from './BulkOrderForm';

// Generic content block renderer
import ContentRenderer from './ContentRenderer';
import EditableText from './EditableText';

interface PageRendererProps {
  page: EditablePage;
}

const ProductBanner: React.FC<{ productId: string }> = ({ productId }) => {
    const { products } = useProductContext();
    const { language } = useLanguage();
    const product = products.find(p => p.id === productId);

    if (!product) return null;
    
    const { name } = product.translations[language] || product.translations.pt;

    return (
        <div className="bg-surface border-l-4 border-accent p-6 rounded-r-lg my-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="text-xl font-semibold text-accent">Conteúdo Associado</h3>
                <p className="text-text-secondary">Este conteúdo faz parte do nosso produto: <span className="font-bold text-text-primary">{name}</span></p>
            </div>
            <a 
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-button-bg text-button-text font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity whitespace-nowrap"
            >
                Ver Produto
            </a>
        </div>
    );
};


const PageRenderer: React.FC<PageRendererProps> = ({ page }) => {
  const { isAdmin, isEditMode, setOpenAdminSection } = useAdmin();

  const handleEditContainer = (containerId: string) => {
    setOpenAdminSection('pages', page.id, containerId);
  };

  const renderContainer = (container: ContentContainer) => {
    // The Hero section is a special case that manages its own full-height structure and shouldn't be wrapped
    if (container.type === 'hero') {
      return <HeroSection key={container.id} container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
    }
    
    const hasBackgroundImage = container.styles?.backgroundImage && container.styles.backgroundImage !== "url('')";

    const sectionStyle: React.CSSProperties = {
        backgroundColor: hasBackgroundImage ? 'transparent' : container.styles?.backgroundColor,
        color: container.styles?.textColor,
        backgroundImage: container.styles?.backgroundImage,
        position: 'relative', // Needed for the overlay
        paddingTop: container.styles?.paddingTop,
        paddingBottom: container.styles?.paddingBottom,
        textAlign: container.styles?.textAlign,
    };

    const sectionClassName = [
        hasBackgroundImage ? 'bg-cover bg-center' : '',
    ].filter(Boolean).join(' ');


    let componentToRender: React.ReactNode;

    // Render complex, full-width section components that are designed to live inside a <section>
    switch (container.type) {
      case 'about':
        componentToRender = <AboutSection container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
        break;
      case 'differentiators':
        componentToRender = <DifferentiatorsSection container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
        break;
      case 'productsCarousel':
        if (page.route === 'store') {
            componentToRender = <ProductsSection container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
        } else {
            componentToRender = <HomeProductsSection container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
        }
        break;
      case 'promotionsCarousel':
        componentToRender = <PromotionsCarousel container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
        break;
      case 'teamMembers':
         componentToRender = <TeamMembersSection container={container} onEdit={() => handleEditContainer(container.id)} pageId={page.id} />;
         break;
      case 'downloadsList':
         // FIX: Updated onEdit callback to explicitly accept and stop propagation of the MouseEvent.
         componentToRender = <DownloadsListSection container={container} onEdit={(e) => { e.stopPropagation(); setOpenAdminSection('pages', 'downloads'); }} pageId={page.id} />;
         break;
      case 'advertisingList':
         // FIX: Updated onEdit callback to explicitly accept and stop propagation of the MouseEvent.
         componentToRender = <AdvertisingListSection container={container} onEdit={(e) => { e.stopPropagation(); setOpenAdminSection('pages', 'advertising'); }} />;
         break;
      case 'bulkOrderForm':
          componentToRender = <BulkOrderForm />;
          break;
      default:
        // Render generic content blocks, wrapped in a standard container for consistent layout.
        const genericContent = (
            <div className="container mx-auto px-6 py-16 md:py-24">
                <ContentRenderer container={container} pageId={page.id} />
            </div>
        );
        if (isAdmin && isEditMode) {
             componentToRender = (
                <div className="relative group editable-container-wrapper">
                    {genericContent}
                    <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-blue-500 transition-all pointer-events-none rounded-lg"></div>
                    <button
                        onClick={() => handleEditContainer(container.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        aria-label="Edit Content Container"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            );
        } else {
            componentToRender = genericContent;
        }
    }
    
    // Wrap all other components in a <section> for consistent styling and the overlay.
    return (
      <section key={container.id} style={sectionStyle} className={sectionClassName}>
        {hasBackgroundImage && <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/95 z-0"></div>}
        <div className={hasBackgroundImage ? 'relative z-10' : ''}>
            {componentToRender}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen"> {/* Ensure pages always take full height */}
      {page.isStatic ? (
        <>
          {/* Static page header (e.g., for Downloads page) */}
          {page.containers.filter(c => c.type === 'text').map(container => (
            <section key={container.id} className="pt-24 md:pt-32 pb-16">
              <div className="container mx-auto px-6">
                {renderContainer(container)}
              </div>
            </section>
          ))}

          {/* Render all other containers in their standard sections */}
          {page.containers.filter(c => c.type !== 'text').map(renderContainer)}
        </>
      ) : (
        // Layout for user-created "Custom" pages
        <>
          <section className="py-24 md:py-32 text-center">
              <div className="container mx-auto px-6">
                   <EditableText
                      as="h1"
                      className="text-3xl md:text-4xl section-title text-accent"
                      pageId={page.id}
                      containerId={page.id} 
                      fieldPath="title"
                      htmlContent={page.title}
                   />
              </div>
          </section>
          
          {page.linkedProductId && (
              <section className="pb-16 pt-0">
                   <div className="container mx-auto px-6">
                      <ProductBanner productId={page.linkedProductId} />
                   </div>
              </section>
          )}

          <div className="space-y-0">
              {page.containers.map(renderContainer)}
          </div>
        </>
      )}
    </div>
  );
};

export default PageRenderer;