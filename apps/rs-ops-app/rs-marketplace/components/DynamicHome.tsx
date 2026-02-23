
import React from 'react';
import Hero from './Hero';
import Carousel from './Carousel';
import FeaturedProducts from './FeaturedProducts';
import Offers from './Offers';
import Bestsellers from './Bestsellers';
import MidPageBanner from './MidPageBanner';
import CallToAction from './CallToAction';
import CustomerChatWidget from './CustomerChatWidget';
import RecentlyViewed from './RecentlyViewed';
import FeaturedCollections from './FeaturedCollections';
import { StoreCustomization, Product, Order, StoreSection, Banner, Collection } from '../types';

interface DynamicHomeProps {
    customization: StoreCustomization;
    products: Product[];
    collections: Collection[];
    offerProducts: Product[];
    orders: Order[];
    recentlyViewedProducts: Product[];
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
    onProductClick: (product: Product) => void;
    onNavigate: (view: any, data?: any) => void;
    onConsultantClick: () => void;
    onBecomeSellerClick: () => void;
}

const DynamicHome: React.FC<DynamicHomeProps> = ({
    customization,
    products,
    collections,
    offerProducts,
    orders,
    recentlyViewedProducts,
    wishlist,
    onToggleWishlist,
    onProductClick,
    onNavigate,
    onConsultantClick,
    onBecomeSellerClick
}) => {
    const sections = customization.sections || [];

    // Sort by order and filter visible
    const sortedSections = [...sections]
        .filter(section => section.visible)
        .sort((a, b) => a.order - b.order);

    const renderSection = (section: StoreSection) => {
        switch (section.type) {
            case 'hero':
                return <Hero key={section.id} content={customization.hero} />;
            case 'carousel':
                return <Carousel key={section.id} banners={customization.carouselBanners} />;
            case 'featuredProducts':
                return <FeaturedProducts key={section.id} products={products} onProductClick={onProductClick} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />;
            case 'offers':
                return offerProducts.length > 0 ? <Offers key={section.id} products={offerProducts} onProductClick={onProductClick} wishlist={wishlist} onToggleWishlist={onToggleWishlist} /> : null;
            case 'bestsellers':
                return <Bestsellers key={section.id} products={products} onProductClick={onProductClick} orders={orders} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />;
            case 'midPageBanner':
                return <MidPageBanner key={section.id} banner={customization.midPageBanner} />;
            case 'collections':
                return <FeaturedCollections key={section.id} collections={collections} onNavigate={onNavigate} />;
            // case 'dropshippingCatalog':
            //   return <DropshippingPreview key={section.id} ... />; // To be implemented if needed
            default:
                return null; // Unknown section type
        }
    };

    return (
        <>
            {sortedSections.map(renderSection)}

            {/* Static sections that might be optional or fixed at bottom */}
            <RecentlyViewed products={recentlyViewedProducts} onProductClick={onProductClick} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

            {customization.showSellerBanner && (
                <CallToAction onConsultantClick={onConsultantClick} onBecomeSellerClick={onBecomeSellerClick} />
            )}

            <CustomerChatWidget orders={orders} />
        </>
    );
};

export default DynamicHome;
