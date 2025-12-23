

import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CartItem, Collection, View, Customer } from '../types';

interface HeaderProps {
  logoUrl: string;
  onLogoClick: () => void;
  onConsultantClick: () => void;
  cartItems: CartItem[];
  onCartClick: () => void;
  collections: Collection[];
  onNavigate: (view: View, data?: any) => void;
  currentCustomer: Customer | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  logoUrl, onLogoClick, onConsultantClick, cartItems, onCartClick,
  collections, onNavigate, currentCustomer, onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Categorias', action: () => setIsCategoryOpen(!isCategoryOpen), dropdown: true },
    { name: 'Ofertas', href: '#offers' },
    { name: 'Mais Vendidos', href: '#bestsellers' },
  ];

  const categoryLinks = collections.map(c => ({ name: c.title, id: c.id }));

  return (
    <header className="bg-[rgb(var(--color-brand-gray))] backdrop-blur-sm border-b border-[rgb(var(--color-brand-gold))]/[.30] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={onLogoClick} className="flex-shrink-0" title="Ir para página inicial" aria-label="Ir para página inicial">
            {logoUrl ? (
              <img src={logoUrl} alt="RS Prólipsi Logo" className="h-10 max-w-[120px] object-contain" />
            ) : (
              <span className="text-3xl font-display text-[rgb(var(--color-brand-gold))]">RS Prólipsi</span>
            )}
          </button>

          {/* Search Bar */}
          <div className="flex flex-grow max-w-xl mx-4 lg:mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full bg-[rgb(var(--color-brand-dark))]/[.50] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-full py-2 pl-12 pr-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))] transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-3 lg:space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.dropdown ? (
                  <button onClick={link.action} onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)} className="flex items-center gap-1 text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors">
                    {link.name}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <a href={link.href} className="text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.name}</a>
                )}
                {link.dropdown && isCategoryOpen && (
                  <div className="absolute top-full mt-4 w-48 bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gold))]/[.20] rounded-md shadow-lg animate-fade-in-down">
                    {categoryLinks.map(catLink => (
                      <button key={catLink.id} onClick={() => onNavigate('collectionView', collections.find(c => c.id === catLink.id))} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]">{catLink.name}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <button onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors" title="Minha conta" aria-label="Minha conta">
                <UserIcon className="h-6 w-6" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-56 bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gold))]/[.20] rounded-md shadow-lg animate-fade-in-down">
                  {currentCustomer ? (
                    <>
                      <button onClick={() => { onNavigate('customerAccount'); setIsUserMenuOpen(false); }} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]">Minha Conta</button>
                      <button onClick={() => { onNavigate('customerWishlist'); setIsUserMenuOpen(false); }} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]">Lista de Desejos</button>
                      <button onClick={onLogout} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] border-t border-[rgb(var(--color-brand-gray-light))]">Sair</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { onNavigate('customerLogin'); setIsUserMenuOpen(false); }} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]">Entrar</button>
                      <button onClick={() => { onNavigate('customerRegister'); setIsUserMenuOpen(false); }} className="block text-left w-full px-4 py-2 text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]">Cadastre-se</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button onClick={onCartClick} className="relative text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors" title="Carrinho" aria-label="Carrinho de compras">
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItemsInCart}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[rgb(var(--color-brand-text-light))]" title="Menu" aria-label="Abrir menu de navegação">
              {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[rgb(var(--color-brand-gray-light))]">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <button onClick={link.action} className="w-full text-left flex items-center gap-1 text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors">
                      {link.name}
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <a href={link.href} onClick={() => setIsMenuOpen(false)} className="text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.name}</a>
                  )}
                  {link.dropdown && isCategoryOpen && (
                    <div className="pl-4 mt-2 space-y-2">
                      {categoryLinks.map(catLink => (
                        <button key={catLink.id} onClick={() => { onNavigate('collectionView', collections.find(c => c.id === catLink.id)); setIsMenuOpen(false); }} className="block text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]">{catLink.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;