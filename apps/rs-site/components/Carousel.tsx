

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { ContentContainer, Promotion } from '../types';
import { initialPromotions } from '../config/initialPromotions'; // Import real promotion data
import EditableText from './EditableText';

interface PromotionsCarouselProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const PromotionsCarousel: React.FC<PromotionsCarouselProps> = ({ container, onEdit, pageId }) => {
  const { isAdmin, isEditMode } = useAdmin();
  // Map IDs from container to real promotion data
  const promotions = (container.promotionIds || [])
    .map(id => initialPromotions.find(p => p.id === id))
    .filter(Boolean) as Promotion[];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
  }, [promotions.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (promotions.length > 0) {
        const interval = setInterval(() => {
          nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [nextSlide, promotions.length]);

  if (!promotions.length) return null;

  const carouselContent = (
     <div className="container mx-auto px-6 py-24 md:py-32">
        {container.title && (
            <div className="text-center mb-16">
                <EditableText as="h2" className="text-3xl md:text-4xl section-title" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title} />
            </div>
        )}
        <div className="relative w-full max-w-5xl mx-auto h-96 rounded-lg overflow-hidden shadow-2xl border-2 border-accent/30">
        <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {promotions.map((promo) => (
            <div key={promo.id} className="w-full h-full flex-shrink-0 relative">
                <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 md:p-12 text-shadow">
                <h3 className="text-2xl md:text-4xl font-bold text-text-primary mb-2">
                    {promo.title}
                </h3>
                <p className="text-gray-200 max-w-2xl">
                    {promo.description}
                </p>
                </div>
            </div>
            ))}
        </div>
        
        <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full hover:bg-accent hover:text-button-text transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full hover:bg-accent hover:text-button-text transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {promotions.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-accent scale-110' : 'bg-gray-500'}`}
            />
            ))}
        </div>
        </div>
    </div>
  );

  if (isAdmin && isEditMode) {
    return (
      <div className="relative group editable-wrapper">
        {carouselContent}
        <button
          onClick={onEdit} // Use the onEdit callback from props
          className="absolute top-2 right-2 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Edit Promotions"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
        <style>{`.editable-wrapper:hover { outline: 2px dashed var(--color-accent); border-radius: 8px; }`}</style>
      </div>
    );
  }

  return carouselContent;
};

export default PromotionsCarousel;