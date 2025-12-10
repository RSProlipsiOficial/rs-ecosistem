
import React, { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import EditableButton from './EditableButton';
import { useNavigation } from '../context/NavigationContext';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { useBanner } from '../context/BannerContext';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon } from './Icons';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { page, setPage } = useNavigation();
  const { pages, globalContent } = usePageBuilder();
  const { openLoginPanel } = useAdmin();
  const { theme } = useTheme();
  const { settings: bannerSettings } = useBanner();
  const { cartItems, toggleCart } = useCart();
  const isBgBannerActive = bannerSettings.backgroundBanner.enabled && bannerSettings.backgroundBanner.imageUrl;

  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const headerContent = globalContent.header;
  
  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isBgBannerActive 
        ? 'bg-background shadow-lg' 
        : (isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-lg' : 'bg-transparent')
  }`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleNavClick = (targetPage: string) => {
    setPage(targetPage);
    closeMenu();
  };
  
  const handleLoginClick = () => {
    openLoginPanel();
    closeMenu();
  };

  // Dynamically generate navigation links from all pages marked showInNav
  const navLinks = pages
    .filter(p => p.showInNav)
    .map(p => ({
        page: p.slug,
        label: p.title,
    }));

  const MobileMenuOverlay = () => (
    <div className={`md:hidden fixed inset-0 bg-[var(--color-mobile-menu-background)] backdrop-blur-lg z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="h-full flex flex-col items-center justify-center space-y-8">
        {navLinks.map((link) => (
          <button key={link.page} onClick={() => handleNavClick(link.page)} className="text-3xl font-semibold transition-colors duration-300" style={{color: 'var(--color-mobile-menu-text)', ['--hover-color' as any]: 'var(--color-mobile-menu-accent)'}} onMouseOver={e => e.currentTarget.style.color = 'var(--hover-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-mobile-menu-text)'}>
            {link.label}
          </button>
        ))}
        <div className="mt-4">
          <EditableButton buttonKey="nav_login">
            <button onClick={handleLoginClick} className="text-lg transition-all duration-300">
              <span dangerouslySetInnerHTML={{ __html: headerContent.ctaText || '' }} />
            </button>
          </EditableButton>
        </div>
        <div className="mt-6">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );

  const MobileMenuSidePanel = () => (
    <>
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div className={`md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[var(--color-mobile-menu-background)] z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-lg font-bold" style={{ color: 'var(--color-mobile-menu-accent)' }}>Menu</span>
          <button onClick={closeMenu} style={{ color: 'var(--color-mobile-menu-text)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-grow p-6 flex flex-col items-start space-y-6 overflow-y-auto">
          {navLinks.map((link) => (
            <button key={link.page} onClick={() => handleNavClick(link.page)} className="text-xl font-medium transition-colors duration-300" style={{color: 'var(--color-mobile-menu-text)', ['--hover-color' as any]: 'var(--color-mobile-menu-accent)'}} onMouseOver={e => e.currentTarget.style.color = 'var(--hover-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-mobile-menu-text)'}>
              {link.label}
            </button>
          ))}
          <div className="pt-6 border-t w-full" style={{ borderColor: 'var(--color-border)' }}>
            <EditableButton buttonKey="nav_login">
                <button onClick={handleLoginClick} className="text-sm transition-all duration-300">
                    <span dangerouslySetInnerHTML={{ __html: headerContent.ctaText || '' }} />
                </button>
            </EditableButton>
          </div>
        </div>
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => handleNavClick('home')} className="text-2xl text-accent tracking-wider" dangerouslySetInnerHTML={{ __html: headerContent.title || '' }} />
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button key={link.page} onClick={() => handleNavClick(link.page)} className={`relative font-medium transition-colors duration-300 ${page === link.page ? 'text-accent' : 'text-text-primary hover:text-accent'}`}>
                {link.label}
                {page === link.page && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full"></span>}
              </button>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-6">
             <LanguageSwitcher />
             <button onClick={toggleCart} className="relative text-text-primary hover:text-accent transition-colors">
                <ShoppingBagIcon />
                {totalItemsInCart > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItemsInCart}</span>
                )}
             </button>
             <EditableButton buttonKey="nav_login">
                <button onClick={openLoginPanel} className="hover:opacity-80 transition-all duration-300 transform hover:scale-105">
                  <span dangerouslySetInnerHTML={{ __html: headerContent.ctaText || '' }} />
                </button>
             </EditableButton>
          </div>
          <button className="md:hidden text-text-primary z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            )}
          </button>
        </div>
      </header>
      
      {theme.navigation.mobileMenuStyle === 'overlay' ? <MobileMenuOverlay /> : <MobileMenuSidePanel />}
    </>
  );
};

export default Header;