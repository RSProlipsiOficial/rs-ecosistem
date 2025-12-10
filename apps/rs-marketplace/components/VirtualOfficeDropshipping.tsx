
import React, { useState, useRef, useEffect } from 'react';
import { DropshippingProduct } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { StoreIcon } from './icons/StoreIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
// Fix: Added missing import for DistributionIcon.
import { DistributionIcon } from './icons/DistributionIcon';


interface VirtualOfficeDropshippingProps {
    products: DropshippingProduct[];
    onEditProduct: (product: DropshippingProduct) => void;
}

const ProductCard: React.FC<{ 
    product: DropshippingProduct;
    onEditProduct: (product: DropshippingProduct) => void;
}> = ({ product, onEditProduct }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleCopy = (text: string, linkType: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLink(linkType);
        setTimeout(() => {
            setCopiedLink(null);
            setIsMenuOpen(false);
        }, 1500);
    };

    const links = [
        { type: 'product', label: 'Link do Produto', icon: LinkIcon, url: `https://rs.shop/prod/${product.id}` },
        { type: 'checkout', label: 'Link do Checkout', icon: ShoppingCartIcon, url: `https://rs.shop/checkout/${product.id}` },
        { type: 'adText', label: 'Texto do Anúncio', icon: DocumentTextIcon, url: `${product.name} - ${product.description.substring(0, 50)}...` },
        { type: 'storeLink', label: 'Link de Loja', icon: StoreIcon, url: 'https://rs.shop/loja/anacarolina' },
    ];

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-xl p-4 flex flex-col justify-between">
             <div className="aspect-square bg-[rgb(var(--color-brand-gray))] rounded-lg mb-4">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-[rgb(var(--color-brand-text-light))] leading-tight">{product.name}</h3>
                <p className="text-2xl font-bold text-[rgb(var(--color-brand-gold))] mt-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.suggestedRetailPrice)}</p>
                <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => onEditProduct(product)} className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))]">Ver Detalhes</button>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 text-sm font-bold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]"
                        >
                            <CopyIcon className="w-4 h-4" />
                            Copiar
                        </button>
                        {isMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-56 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg shadow-lg z-10">
                                {links.map(link => (
                                    <button 
                                        key={link.type}
                                        onClick={() => handleCopy(link.url, link.type)}
                                        className="w-full flex items-center justify-between text-left px-3 py-2 text-sm text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray))]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <link.icon className="w-4 h-4 text-[rgb(var(--color-brand-text-dim))]" />
                                            <span>{link.label}</span>
                                        </div>
                                        {copiedLink === link.type ? <ClipboardDocumentCheckIcon className="w-4 h-4 text-[rgb(var(--color-success))]" /> : <CopyIcon className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VirtualOfficeDropshipping: React.FC<VirtualOfficeDropshippingProps> = ({ products, onEditProduct }) => {
    return (
        <div>
            <div className="bg-[rgb(var(--color-brand-gold))]/[.10] border border-[rgb(var(--color-brand-gold))]/[.30] rounded-lg p-4 flex items-center gap-4 mb-8">
                <div className="bg-[rgb(var(--color-brand-gold))]/[.20] p-2 rounded-full">
                    <DistributionIcon className="w-8 h-8 text-[rgb(var(--color-brand-gold))]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[rgb(var(--color-brand-text-light))]">Venda sem Estoque com Dropshipping</h1>
                    <p className="text-[rgb(var(--color-brand-text-dim))] text-sm">Concentre-se em vender e deixe a logística com a gente. Você tem <span className="font-bold text-[rgb(var(--color-brand-gold))]">{products.length} produtos</span> prontos para divulgar.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => <ProductCard key={product.id} product={product} onEditProduct={onEditProduct} />)}
            </div>
        </div>
    );
};

export default VirtualOfficeDropshipping;