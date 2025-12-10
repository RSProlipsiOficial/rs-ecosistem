

import React from 'react';
import { HeroContent } from '../types';

interface HeroProps {
  content: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{`
        .hero-section {
          background-image: url('${content.mobileImage}');
        }
        @media (min-width: 768px) {
          .hero-section {
            background-image: url('${content.desktopImage}');
          }
        }
      `}</style>
      <section 
        className="hero-section relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-[rgb(var(--color-brand-dark))]/[.60]"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-display text-[rgb(var(--color-brand-text-light))] drop-shadow-lg">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[rgb(var(--color-brand-text-light))]">
            {content.subtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <a 
              href="#featured-products" 
              onClick={(e) => handleScroll(e, 'featured-products')}
              className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-8 rounded-full text-lg hover:bg-[rgb(var(--color-brand-secondary))] transition-transform transform hover:scale-105">
              Compre Agora
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
