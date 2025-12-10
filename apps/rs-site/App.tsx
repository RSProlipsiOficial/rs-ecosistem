import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import LoginPanel from './components/LoginPanel';
import Chatbot from './components/Chatbot';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { DownloadsProvider } from './context/DownloadsContext';
import { PageBuilderProvider, usePageBuilder } from './context/PageBuilderContext';
import { AdvertisingProvider } from './context/AdvertisingContext';
import { ButtonStyleProvider } from './context/ButtonStyleContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { CardStyleProvider } from './context/CardStyleContext';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import { AISettingsProvider } from './context/AISettingsContext';
import { IntegrationsProvider } from './context/IntegrationsContext';
import { BannerProvider, useBanner } from './context/BannerContext';
import { CartProvider } from './context/CartContext';
import ButtonStyleEditorModal from './components/ButtonStyleEditorModal';
import CardStyleEditorModal from './components/CardStyleEditorModal';
import PageRenderer from './components/PageRenderer'; // New unified renderer
import { PencilSquareIcon } from './components/Icons';
import ProductDetailModal from './components/ProductDetailModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import { OffersProvider } from './context/OffersContext';
import { AbandonedCartProvider } from './context/AbandonedCartContext';
import { OrdersProvider } from './context/OrdersContext';

const EditWrapper: React.FC<{ children: React.ReactNode; onEdit: () => void; areaLabel: string }> = ({ children, onEdit, areaLabel }) => {
    const { isAdmin, isEditMode } = useAdmin();

    if (isAdmin && isEditMode) {
        return (
            <div className="relative group editable-section-wrapper">
                {children}
                <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none rounded-lg"></div>
                <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[51]"
                    aria-label={areaLabel}
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }
    return <>{children}</>;
};

const SiteLayout: React.FC = () => {
    const { page } = useNavigation();
    const { pages } = usePageBuilder();
    
    // Find the active page data (static or custom)
    const activePageData = pages.find(p => p.slug === page);

    // If no page is found (e.g., on first load with page='home'), default to the home page.
    const pageToRender = activePageData || pages.find(p => p.route === 'home');

    if (pageToRender) {
        return <PageRenderer page={pageToRender} />;
    }

    // Fallback if no page is found at all.
    const defaultHomePageData = pages.find(p => p.route === 'home');
    return defaultHomePageData ? <PageRenderer page={defaultHomePageData} /> : <div>Page not found</div>;
};

const AppContent: React.FC = () => {
  const { isAdmin, isEditMode, setOpenAdminSection } = useAdmin();
  const { page, viewingProductId, setViewingProductId } = useNavigation();
  const { backgroundClass } = useBackground();
  const { pages } = usePageBuilder();
  const { settings: bannerSettings } = useBanner();
  const { theme } = useTheme();

  // Find the active page data
  const activePageData = pages.find(p => p.slug === page) || pages.find(p => p.route === page);

  // Check if the current page has a hero section with its own background image
  const pageHasHeroWithBackground = activePageData?.containers.some(
    c => c.type === 'hero' && c.styles?.backgroundImage && c.styles.backgroundImage !== "url('')"
  );

  // Determine which banner to use: page-specific takes priority over global
  const pageBanner = activePageData?.backgroundBanner;
  const globalBanner = bannerSettings.backgroundBanner;
  
  const bannerToUse = (pageBanner?.enabled && pageBanner?.imageUrl) 
    ? pageBanner 
    : globalBanner;
  
  // The background banner is only visible if it's enabled AND the current page doesn't have a hero with its own background.
  const isBgBannerVisible = bannerToUse.enabled && bannerToUse.imageUrl && !pageHasHeroWithBackground;
  const isSideBannerVisible = bannerSettings.sideBanner.enabled && bannerSettings.sideBanner.imageUrl;
  const isBackgroundGradient = theme.colors.background.includes('gradient');


  useEffect(() => {
    // This logic determines the body background, prioritizing banner, then gradient, then pattern.
    if (isBgBannerVisible) {
      document.body.className = '';
      document.body.removeAttribute('data-background-type');
    } else if (isBackgroundGradient) {
      document.body.setAttribute('data-background-type', 'gradient');
      document.body.className = ''; // A gradient overrides patterns
    } else {
      document.body.removeAttribute('data-background-type');
      document.body.className = backgroundClass; // Restore pattern class
    }
  }, [backgroundClass, isBgBannerVisible, isBackgroundGradient]);

  useEffect(() => {
    // Find a static page by route or a custom page by slug
    const currentPageData = pages.find(p => p.slug === page) || pages.find(p => p.route === page);
    const metaDescriptionTag = document.getElementById('meta-description');
    
    if (currentPageData?.seo?.metaTitle) {
      document.title = currentPageData.seo.metaTitle;
    } else {
      document.title = 'RS Prólipsi';
    }

    if (metaDescriptionTag) {
        if (currentPageData?.seo?.metaDescription) {
            metaDescriptionTag.setAttribute('content', currentPageData.seo.metaDescription);
        } else {
            metaDescriptionTag.setAttribute('content', 'A corporate website for RS Prólipsi, a company that fuses digital marketing with multi-level marketing to create a unique global ecosystem.');
        }
    }
  }, [page, pages]);
  
  return (
    <>
      {isBgBannerVisible && (
        <>
          <div 
            className="fixed inset-0 -z-10 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url('${bannerToUse.imageUrl}')`,
              opacity: bannerToUse.opacity,
            }}
          />
          <div className="fixed inset-0 -z-20 bg-background" />
        </>
      )}

      <div className={`${isBgBannerVisible ? 'bg-transparent' : ''} min-h-screen font-sans`}>
        {isSideBannerVisible && (
          <aside 
            className="fixed z-40 hidden lg:block"
            style={{
              width: `${bannerSettings.sideBanner.width}px`,
              top: `${bannerSettings.sideBanner.top}px`,
              [bannerSettings.sideBanner.position]: '2rem',
            }}
          >
            <a href={bannerSettings.sideBanner.link} target="_blank" rel="noopener noreferrer">
              <img src={bannerSettings.sideBanner.imageUrl} alt="Side Banner" className="w-full h-auto rounded-lg shadow-lg" />
            </a>
          </aside>
        )}
        
        {isAdmin && isEditMode && <AdminPanel />}
        <div 
          className="relative"
        >
          <EditWrapper onEdit={() => setOpenAdminSection('pages', 'global_header')} areaLabel="Edit Header">
              <Header />
          </EditWrapper>
          <main>
            <SiteLayout />
          </main>
           <EditWrapper onEdit={() => setOpenAdminSection('pages', 'global_footer')} areaLabel="Edit Footer">
              <Footer />
          </EditWrapper>
          {!isEditMode && <Chatbot />}
        </div>
      </div>
      {viewingProductId && <ProductDetailModal productId={viewingProductId} onClose={() => setViewingProductId(null)} />}
      <CartModal />
      <CheckoutModal />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AdminProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SiteSettingsProvider>
            <AISettingsProvider>
              <IntegrationsProvider>
                <ButtonStyleProvider>
                  <CardStyleProvider>
                    <ProductProvider>
                      <DownloadsProvider>
                        <PageBuilderProvider>
                          <AdvertisingProvider>
                            <NavigationProvider>
                              <BackgroundProvider>
                                <BannerProvider>
                                  <OffersProvider>
                                    <AbandonedCartProvider>
                                      <OrdersProvider>
                                        <CartProvider>
                                          <AppContent />
                                          <LoginPanel />
                                          <ButtonStyleEditorModal />
                                          <CardStyleEditorModal />
                                        </CartProvider>
                                      </OrdersProvider>
                                    </AbandonedCartProvider>
                                  </OffersProvider>
                                </BannerProvider>
                              </BackgroundProvider>
                            </NavigationProvider>
                          </AdvertisingProvider>
                        </PageBuilderProvider>
                      </DownloadsProvider>
                    </ProductProvider>
                  </CardStyleProvider>
                </ButtonStyleProvider>
              </IntegrationsProvider>
            </AISettingsProvider>
          </SiteSettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AdminProvider>
  );
};

export default App;