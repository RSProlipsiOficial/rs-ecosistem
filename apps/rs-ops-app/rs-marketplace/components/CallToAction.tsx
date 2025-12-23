

import React from 'react';
import { StoreIcon } from './icons/StoreIcon';
import { UserIcon } from './icons/UserIcon';

interface CallToActionProps {
  onConsultantClick: () => void;
  onBecomeSellerClick: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onConsultantClick, onBecomeSellerClick }) => {
  return (
    <section id="cta-section" className="py-12 sm:py-16 bg-[rgb(var(--color-brand-gray))]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 items-stretch">
          
          {/* Become a Seller (Lojista) */}
          <div className="bg-gradient-to-br from-[rgb(var(--color-brand-gray))] to-[rgb(var(--color-brand-dark))] p-8 rounded-lg border-2 border-[rgb(var(--color-brand-gold))]/[.30] flex flex-col items-center text-center shadow-2xl">
            <div className="bg-[rgb(var(--color-brand-gold))]/[.10] p-3 rounded-full border-2 border-[rgb(var(--color-brand-gold))]/[.30]">
              <StoreIcon className="h-10 w-10 text-[rgb(var(--color-brand-gold))]" />
            </div>
            <h3 className="mt-5 text-2xl font-bold font-display text-[rgb(var(--color-brand-text-light))]">Seja um Lojista</h3>
            <p className="mt-3 text-[rgb(var(--color-brand-text-dim))] max-w-md">
              Junte-se ao nosso marketplace. Construa sua marca, alcance milhões de clientes e faça seu negócio crescer com nossas ferramentas poderosas.
            </p>
            <button onClick={onBecomeSellerClick} className="mt-6 bg-transparent border-2 border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] font-bold py-2 px-6 rounded-full text-base hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] transition-colors">
              Comece a Vender
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CallToAction;