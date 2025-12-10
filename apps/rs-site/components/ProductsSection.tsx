import React from 'react';
import EditableButton from './EditableButton';
import { useLanguage } from '../context/LanguageContext';
import { useProductContext } from '../context/ProductContext';
import { Product, Language, ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import EditableText from './EditableText';
import { useNavigation } from '../context/NavigationContext';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface ProductCardProps {
  product: Product;
  language: Language;
  ctaText: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, language, ctaText }) => {
    const { setViewingProductId } = useNavigation();
    const { name, description } = product.translations[language] || product.translations.pt;

    const firstVariant = product.variants[0];
    const price = firstVariant?.price || 0;
    const originalPrice = firstVariant?.originalPrice;
    const hasDiscount = originalPrice && originalPrice > price;
    const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const handleViewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setViewingProductId(product.id);
    };

    return (
        <div className="bg-surface backdrop-blur-sm border border-border rounded-lg overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20 flex flex-col">
            <button onClick={handleViewClick} className="w-full text-left flex-grow flex flex-col">
                <div className="relative overflow-hidden">
                    <img src={product.imageUrls[0]} alt={name} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                    {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl text-accent mb-2">{name}</h3>
                    <div className="text-text-secondary text-sm leading-relaxed flex-grow prose-static line-clamp-3" dangerouslySetInnerHTML={{ __html: description }} />
                </div>
            </button>
            <div className="p-6 pt-2 flex justify-between items-center mt-auto">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-accent">{formatCurrency(price)}</span>
                    {hasDiscount && originalPrice && (
                        <span className="text-sm text-text-secondary line-through">{formatCurrency(originalPrice)}</span>
                    )}
                </div>
                <EditableButton buttonKey={`buy_now`}>
                    <button onClick={handleViewClick} className="transition-all duration-300 transform hover:scale-105 hover:opacity-80">
                        <span>{ctaText}</span>
                    </button>
                </EditableButton>
            </div>
        </div>
    );
};

interface ProductsSectionProps {
    container: ContentContainer;
    onEdit: () => void;
    pageId: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ container, onEdit, pageId }) => {
    const { language } = useLanguage();
    const { products } = useProductContext();
    const { isAdmin, isEditMode } = useAdmin();

    const digitalProducts = products.filter(p => p.category === 'Digital' && p.status === 'active');
    const physicalProducts = products.filter(p => p.category === 'Physical' && p.status === 'active');

    const mainTitle = container.title || '';
    const digitalTitle = container.features?.[0]?.title || '';
    const physicalTitle = container.features?.[1]?.title || '';

    const sectionContent = (
        <div className="container mx-auto px-6 py-24 md:py-32">
            {mainTitle && (
                <EditableText as="h3" className="text-2xl md:text-3xl text-center mb-12 border-b-2 border-accent/30 pb-4" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={mainTitle} />
            )}
            <div className="grid md:grid-cols-2 gap-16">
                <div>
                    {digitalTitle && (
                        <EditableText as="h4" className="text-2xl text-accent text-center mb-8" pageId={pageId} containerId={container.id} fieldPath="features.0.title" htmlContent={digitalTitle} />
                    )}
                    <div className="grid grid-cols-1 gap-8">
                        {digitalProducts.map(product => 
                            <ProductCard 
                                key={product.id} 
                                product={product}
                                language={language}
                                ctaText={container.ctaText || 'Ver Produto'}
                            />
                        )}
                    </div>
                </div>
                <div>
                    {physicalTitle && (
                       <EditableText as="h4" className="text-2xl text-accent text-center mb-8" pageId={pageId} containerId={container.id} fieldPath="features.1.title" htmlContent={physicalTitle} />
                    )}
                    <div className="grid grid-cols-1 gap-8">
                            {physicalProducts.map(product => 
                            <ProductCard 
                                key={product.id}
                                product={product}
                                language={language}
                                ctaText={container.ctaText || 'Ver Produto'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isAdmin && isEditMode) {
        return (
            <div className="relative group editable-section-wrapper">
                {sectionContent}
                <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
                <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    aria-label="Edit Products List"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return sectionContent;
};

export default ProductsSection;