import React from 'react';
import { Banner } from '../types';

interface MidPageBannerProps {
    banner: Banner;
}

const MidPageBanner: React.FC<MidPageBannerProps> = ({ banner }) => {
    if (!banner?.desktopImage && !banner?.mobileImage) {
        return null;
    }

    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const currentHeight = isMobile ? (banner.mobileHeight || 300) : (banner.height || 400);

    return (
        <section
            className={`${banner.fullWidth ? 'w-full' : 'container mx-auto px-4'} py-8 sm:py-12 overflow-hidden`}
            style={{ backgroundColor: banner.backgroundColor || '#000000' }}
        >
            <div
                className="relative block rounded-lg overflow-hidden group focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
                style={{ height: `${currentHeight}px` }}
            >
                <picture className="w-full h-full">
                    <source media="(min-width: 768px)" srcSet={banner.desktopImage} />
                    <img
                        src={banner.mobileImage || banner.desktopImage}
                        alt={banner.title || "Banner promocional"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </picture>

                {/* Overlay para Título e Botão */}
                {(banner.title || banner.subtitle || banner.link) && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                        {banner.title && (
                            <h2
                                className="text-3xl md:text-5xl font-display mb-2 drop-shadow-lg"
                                style={{ color: banner.titleColor || 'rgb(var(--color-brand-gold))' }}
                            >
                                {banner.title}
                            </h2>
                        )}
                        {banner.subtitle && (
                            <p
                                className="text-lg md:text-xl max-w-2xl mb-6 drop-shadow-lg text-white"
                                style={{ color: banner.subtitleColor || 'white' }}
                            >
                                {banner.subtitle}
                            </p>
                        )}
                        {banner.link && (
                            <a
                                href={banner.link}
                                className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] px-8 py-3 rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all"
                            >
                                Ver Mais
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MidPageBanner;
