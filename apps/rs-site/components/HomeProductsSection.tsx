import React, { useState, useEffect, useCallback } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import EditableButton from './EditableButton';
import { Product, Language, ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import EditableText from './EditableText';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface ProductCarouselCardProps {
  product: Product;
  language: Language;
}

const ProductCarouselCard: React.FC<ProductCarouselCardProps> = ({ product, language }) => {
    const { setViewingProductId } = useNavigation();
    const { name, description } = product.translations[language] || product.translations.pt;

    const firstVariant = product.variants[0];
    const price = firstVariant?.price || 0;
    const originalPrice = firstVariant?.originalPrice;
    const hasDiscount = originalPrice && originalPrice > price;
    const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <button onClick={() => setViewingProductId(product.id)} className="w-full h-full flex-shrink-0 relative group text-left">
            {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                    -{discountPercentage}%
                </div>
            )}
            <img src={product.imageUrls[0]} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-accent mb-2 transition-transform duration-300 group-hover:-translate-y-1">{name}</h3>
                <div className="text-text-secondary text-sm leading-relaxed mb-2 line-clamp-2 prose-static" dangerouslySetInnerHTML={{ __html: description }} />
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-text-primary">{formatCurrency(price)}</span>
                    {hasDiscount && originalPrice && (
                        <span className="text-sm text-text-secondary line-through">{formatCurrency(originalPrice)}</span>
                    )}
                </div>
            </div>
        </button>
    );
};

interface HomeProductsSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const HomeProductsSection: React.FC<HomeProductsSectionProps> = ({ container, onEdit, pageId }) => {
    const { products } = useProductContext();
    const { language } = useLanguage();
    const { setPage } = useNavigation();
    const { isAdmin, isEditMode } = useAdmin();
    
    // Select first 4 products for the carousel, or use specific productIds if provided
    const productsToDisplay = (container.productIds && container.productIds.length > 0
        ? products.filter(p => container.productIds?.includes(p.id))
        : products.slice(0, 4)).filter(p => p.status === 'active');

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleCtaClick = () => {
        if (container.ctaLink) {
            setPage(container.ctaLink);
        }
    };

    const nextSlide = useCallback(() => {
        if (productsToDisplay.length === 0) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === productsToDisplay.length - 1 ? 0 : prevIndex + 1
        );
    }, [productsToDisplay.length]);

    const prevSlide = () => {
        if (productsToDisplay.length === 0) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? productsToDisplay.length - 1 : prevIndex - 1
        );
    };
    
    useEffect(() => {
        if (productsToDisplay.length > 0) {
            const interval = setInterval(() => {
                nextSlide();
            }, 5000); // Rotate every 5 seconds
            return () => clearInterval(interval);
        }
    }, [nextSlide, productsToDisplay.length]);

    if (productsToDisplay.length === 0) {
        return null;
    }

    const sectionContent = (
        <div id="home-products" className="container mx-auto px-6 py-24 md:py-32">
            <div className="text-center mb-12 md:mb-16">
                <EditableText as="h2" className="text-3xl md:text-4xl section-title" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
            </div>

            <div className="relative w-full max-w-4xl mx-auto h-[28rem] md:h-[32rem] rounded-lg overflow-hidden shadow-2xl border-2 border-accent/30">
                <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {productsToDisplay.map((product) => (
                        <ProductCarouselCard key={product.id} product={product} language={language} />
                    ))}
                </div>
    
                <button onClick={prevSlide} aria-label="Previous product" className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full hover:bg-accent hover:text-button-text transition-all z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextSlide} aria-label="Next product" className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full hover:bg-accent hover:text-button-text transition-all z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {productsToDisplay.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to product ${index + 1}`}
                        className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-accent scale-125' : 'bg-gray-500'}`}
                    />
                    ))}
                </div>
            </div>

            <div className="text-center mt-12 md:mt-16">
                 {container.ctaText && (
                    <EditableButton buttonKey="products_home_cta">
                        <button onClick={handleCtaClick} className="text-lg hover:opacity-80 transition-all duration-300 transform hover:scale-110">
                            {container.ctaText}
                        </button>
                    </EditableButton>
                )}
            </div>
        </div>
    );

     if(isAdmin && isEditMode) {
        return (
            <div className="relative group editable-section-wrapper">
                {sectionContent}
                <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
                 <button
                    onClick={onEdit} // Use the onEdit callback from props
                    className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    aria-label="Edit Products Section"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </div>
        )
    }

    return sectionContent;
};

export default HomeProductsSection;