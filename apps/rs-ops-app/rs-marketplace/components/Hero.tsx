

import React, { useRef, useEffect } from 'react';
import { HeroContent } from '../types';

interface HeroProps {
  content: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure autoplay works even on strict browsers
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — video will show poster/image fallback
      });
    }
  }, [content.videoUrl]);

  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith('#')) {
      event.preventDefault();
      const targetElement = document.getElementById(targetId.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!content) return null;

  // Detect if the videoUrl is a YouTube embed URL
  const isYouTube = content.videoUrl?.includes('youtube.com') || content.videoUrl?.includes('youtu.be');
  const heroDesktopImage = content.desktopImage || content.mobileImage;
  const heroMobileImage = content.mobileImage || content.desktopImage;
  const videoPoster = content.videoPoster || heroDesktopImage || heroMobileImage;
  const shouldRenderBackgroundImage = Boolean((!content.videoUrl || isYouTube || videoPoster) && (heroDesktopImage || heroMobileImage));

  return (
    <>
      <section
        className={`relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center overflow-hidden bg-[rgb(var(--color-brand-dark))]`}
        style={{ backgroundColor: content.backgroundColor || 'transparent' }}
      >
        {shouldRenderBackgroundImage && (
          <picture className="absolute inset-0 block">
            {heroDesktopImage ? <source media="(min-width: 768px)" srcSet={heroDesktopImage} /> : null}
            <img
              src={heroMobileImage || heroDesktopImage}
              alt=""
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            />
          </picture>
        )}

        {/* Video Background */}
        {content.videoUrl && !isYouTube && (
          <video
            ref={videoRef}
            src={content.videoUrl}
            poster={videoPoster || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        )}

        {/* YouTube iframe background (muted, autoplay, loop) */}
        {content.videoUrl && isYouTube && (() => {
          // Convert any YouTube URL to embed with autoplay+loop+mute
          const videoId = content.videoUrl!.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] || '';
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&showinfo=0&rel=0&enablejsapi=1`;
          return (
            <iframe
              src={embedUrl}
              title="Hero background video"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scale(1.5)', objectFit: 'cover', border: 'none' }}
              allow="autoplay; encrypted-media"
              loading="eager"
              aria-hidden="true"
            />
          );
        })()}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[rgb(var(--color-brand-dark))]/[.55] z-10"></div>

        {/* Content */}
        <div className="relative z-20 px-4">
          <h1
            className="text-4xl md:text-6xl font-bold font-display drop-shadow-2xl"
            style={{
              color: content.titleColor || 'rgb(var(--color-brand-text-light))',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            {content.title || 'RS PRÓLIPSI'}
          </h1>
          <p
            className="mt-4 max-w-2xl mx-auto text-lg md:text-xl drop-shadow-xl"
            style={{
              color: content.subtitleColor || 'rgb(var(--color-brand-text-light))',
              textShadow: '0 1px 5px rgba(0,0,0,0.8)'
            }}
          >
            {content.subtitle || ''}
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={content.buttonAnchor || '#featured-products'}
              onClick={(e) => handleScroll(e, content.buttonAnchor || '#featured-products')}
              className="font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
              style={{
                backgroundColor: content.buttonColor || 'rgb(var(--color-brand-gold))',
                color: content.buttonColor ? '#fff' : 'rgb(var(--color-brand-dark))',
                zIndex: 30
              }}
            >
              Compre Agora
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
