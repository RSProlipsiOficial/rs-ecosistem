
import React from 'react';
import { FooterContent, View, Customer } from '../types';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';


interface FooterProps {
  logoUrl: string;
  content: FooterContent;
  onConsultantClick: () => void;
  onNavigate: (view: View) => void;
  currentCustomer: Customer | null;
}

const socialIconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
};


const Footer: React.FC<FooterProps> = ({ logoUrl, content, onConsultantClick, onNavigate, currentCustomer }) => {

  const handleScrollToProducts = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('featured-products');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[rgb(var(--color-brand-gray))] border-t border-[rgb(var(--color-brand-gold))]/[.30] text-[rgb(var(--color-brand-text-dim))]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            {logoUrl ? (
              <img src={logoUrl} alt="RS Prólipsi Logo" className="h-12 max-w-[150px] object-contain" />
            ) : (
              <h3 className="text-2xl font-display text-[rgb(var(--color-brand-gold))]">RS Prólipsi</h3>
            )}
            <p className="mt-4 text-sm">{content.description}</p>
          </div>
          <div>
            <h4 className="font-bold text-[rgb(var(--color-brand-text-light))] tracking-wider">Para Compradores</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {content.buyerLinks.map(link => (
                <li key={link.label}>
                  {link.label === 'Rastrear Pedidos' ? (
                    <button onClick={() => onNavigate('orderLookup')} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</button>
                  ) : link.label === 'Sua Conta' ? (
                    <button onClick={() => onNavigate(currentCustomer ? 'customerAccount' : 'customerLogin')} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</button>
                  ) : link.url === '#featured-products' ? (
                    <button onClick={handleScrollToProducts} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</button>
                  ) : (
                    <a href={link.url} className="hover:text-[rgb(var(--color-brand-gold))]">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[rgb(var(--color-brand-text-light))] tracking-wider">Para Vendedores</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {content.sellerLinks.map(link => (
                <li key={link.label}>
                  {link.label === 'Painel do Lojista' ? (
                    <a href="#/seller" onClick={(e) => { e.preventDefault(); onNavigate(currentCustomer ? 'consultantStore' : 'consultantLogin'); }} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</a>
                  ) : link.label === 'Ferramentas de Marketing' ? (
                    <button onClick={() => onNavigate('communication')} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</button>
                  ) : link.label === 'Seja um Lojista' ? (
                    <button onClick={() => onNavigate('sellerRegistration')} className="text-left hover:text-[rgb(var(--color-brand-gold))] transition-colors">{link.label}</button>
                  ) : (
                    <a href={link.url} className="hover:text-[rgb(var(--color-brand-gold))]">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {content.companyLinks.length > 0 && <div>
            <h4 className="font-bold text-[rgb(var(--color-brand-text-light))] tracking-wider">Empresa</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {content.companyLinks.map(link => (
                <li key={link.label}><a href={link.url} className="hover:text-[rgb(var(--color-brand-gold))]">{link.label}</a></li>
              ))}
            </ul>
          </div>}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold text-[rgb(var(--color-brand-text-light))] tracking-wider">Siga-nos</h4>
            <div className="flex mt-4 space-x-4">
              {content.socialLinks.map(link => {
                const Icon = socialIconMap[link.platform.toLowerCase()];
                return Icon ? (
                  <a key={link.platform} href={link.url} className="hover:text-[rgb(var(--color-brand-gold))]" target="_blank" rel="noopener noreferrer" aria-label={link.platform}>
                    <Icon className="h-6 w-6 currentColor" />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[rgb(var(--color-brand-gray-light))] pt-8 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left">
            <div className="lg:col-span-1">
              <h4 className="font-bold text-[rgb(var(--color-brand-text-light))] tracking-wider mb-2">Informações</h4>
              <p>{content.businessAddress}</p>
              <p>{content.contactEmail}</p>
              <p>CNPJ: {content.cnpj}</p>
            </div>
            {/* Removed Payment Methods section */}
            {/* Removed Shipping Methods section */}
          </div>
          <div className="mt-8 border-t border-[rgb(var(--color-brand-gray-light))] pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} RS Prólipsi. Todos os Direitos Reservados.</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
