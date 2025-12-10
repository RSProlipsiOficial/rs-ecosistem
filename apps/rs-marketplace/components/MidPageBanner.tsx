import React from 'react';
import { Banner } from '../types';

interface MidPageBannerProps {
  banner: Banner;
}

const MidPageBanner: React.FC<MidPageBannerProps> = ({ banner }) => {
    if (!banner?.desktopImage && !banner?.mobileImage) {
        return null;
    }

    return (
        <section className="py-16 sm:py-24 bg-black">
            <div className="container mx-auto px-4">
                <a href={banner.link || '#'} className="block rounded-lg overflow-hidden group focus:outline-none focus:ring-4 focus:ring-yellow-500/50">
                    <picture>
                        <source media="(min-width: 768px)" srcSet={banner.desktopImage} />
                        <img 
                            src={banner.mobileImage} 
                            alt="Banner promocional" 
                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    </picture>
                </a>
            </div>
        </section>
    );
};

export default MidPageBanner;
