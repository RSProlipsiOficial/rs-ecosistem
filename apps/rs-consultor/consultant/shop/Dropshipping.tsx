import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { 
    IconTruck, 
    IconMoreVertical, 
    IconLink, 
    IconShoppingCart, 
    IconFileText, 
    IconStore, 
    IconActive,
    IconCopy
} from '../../components/icons';
import { mockShopProducts, mockUser, mockShopSettings } from '../data';

interface DropshipProduct {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
    price: number;
    commission: number;
}


interface CopyAction {
  label: string;
  type: 'ad' | 'productLink' | 'checkoutLink' | 'storeLink';
  icon: React.ElementType;
}

const copyActions: CopyAction[] = [
    { label: 'Link do Produto', type: 'productLink', icon: IconLink },
    { label: 'Link do Checkout', type: 'checkoutLink', icon: IconShoppingCart },
    { label: 'Texto do Anúncio', type: 'ad', icon: IconFileText },
    { label: 'Link da Loja', type: 'storeLink', icon: IconStore },
];

const Dropshipping: React.FC = () => {
    const [modalProduct, setModalProduct] = useState<DropshipProduct | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [copiedState, setCopiedState] = useState<{ productId: string, type: string } | null>(null);
    const dropdownsRef = useRef<(HTMLDivElement | null)[]>([]);

    const dropshippingProducts = useMemo(() => 
        mockShopProducts.filter((p): p is DropshipProduct => p.category === 'RS Dropshipping')
    , []);

    const handleCopy = (type: CopyAction['type'], product: DropshipProduct) => {
        const consultantSlug = mockShopSettings.storeSlug;
        let textToCopy = '';

        switch (type) {
            case 'productLink':
                textToCopy = `https://rsprolipsi.com/loja/${consultantSlug}/produto/${product.id}`; // Assuming product.id can be a slug
                break;
            case 'checkoutLink':
                textToCopy = `https://rsprolipsi.com/loja/${consultantSlug}/checkout/${product.id}`;
                break;
            case 'ad':
                textToCopy = `✨ ${product.name} ✨\n\nGaranta já o seu por apenas R$ ${product.price.toFixed(2)}!\n\nCompre agora: https://rsprolipsi.com/loja/${consultantSlug}/produto/${product.id}`;
                break;
            case 'storeLink':
                textToCopy = `https://rsprolipsi.com/loja/${consultantSlug}`;
                break;
        }

        navigator.clipboard.writeText(textToCopy);
        setCopiedState({ productId: product.id, type });
        setActiveDropdown(null);
        setTimeout(() => setCopiedState(null), 2000);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && dropdownsRef.current.every(ref => ref && !ref.contains(event.target as Node))) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

  return (
    <div className="space-y-8" onClick={() => activeDropdown && setActiveDropdown(null)}>
        <Card>
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                <IconTruck size={48} className="mx-auto md:mx-0 text-brand-gold opacity-80 flex-shrink-0"/>
                <div>
                    <h2 className="text-2xl font-bold text-white">Venda sem Estoque com Dropshipping</h2>
                    <p className="text-gray-400 mt-2">
                        Concentre-se em vender e deixe a logística com a gente. Você tem 
                        <span className="font-bold text-brand-gold"> {dropshippingProducts.length} produtos </span> 
                        prontos para divulgar.
                    </p>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dropshippingProducts.map((product, index) => (
                <Card key={product.id} className="p-0 flex flex-col hover:border-brand-gold/50">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-white">{product.name}</h3>
                        <p className="text-2xl font-extrabold text-brand-gold mt-1">R$ {product.price.toFixed(2)}</p>
                        
                        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-brand-gray mt-4">
                            <button 
                                onClick={() => setModalProduct(product)}
                                className="text-sm bg-brand-gray px-4 py-2 rounded-lg hover:bg-brand-gray-light font-semibold w-full text-center transition-colors"
                            >
                                Ver Detalhes
                            </button>
                            <div className="relative" ref={el => { dropdownsRef.current[index] = el; }}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === product.id ? null : product.id) }}
                                    className="p-2 bg-brand-gray rounded-lg hover:bg-brand-gray-light text-white"
                                    aria-haspopup="true"
                                    aria-expanded={activeDropdown === product.id}
                                >
                                    <IconCopy className="h-5 w-5 mr-1 inline-block"/>
                                    <span className="font-semibold">Copiar</span>
                                </button>
                                {activeDropdown === product.id && (
                                    <div 
                                        className="absolute right-0 bottom-full mb-2 w-56 bg-brand-gray-dark border border-brand-gray rounded-lg shadow-2xl z-10 py-1"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {copyActions.map(action => (
                                            <button 
                                                key={action.type}
                                                onClick={() => handleCopy(action.type, product)}
                                                className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-200 hover:bg-brand-gray-light"
                                            >
                                                <action.icon className="h-4 w-4 mr-3 text-brand-gold" />
                                                <span>
                                                    {copiedState?.productId === product.id && copiedState?.type === action.type ? 'Copiado!' : action.label}
                                                </span>
                                                {copiedState?.productId === product.id && copiedState?.type === action.type && <IconActive size={16} className="ml-auto text-green-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>

        <Modal 
            isOpen={!!modalProduct} 
            onClose={() => setModalProduct(null)} 
            title={modalProduct?.name || ''}
        >
           {modalProduct && (
                <div className="space-y-4">
                    <img src={modalProduct.imageUrl} alt={modalProduct.name} className="w-full h-48 object-cover rounded-lg"/>
                    <div>
                        <h3 className="text-lg font-bold text-brand-gold">Descrição</h3>
                        <p className="text-gray-300 text-sm">
                            Descrição detalhada do produto {modalProduct.name}. Ideal para quem busca qualidade e eficiência. Perfeito para diversas ocasiões e estilos.
                        </p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-brand-gold">Especificações</h3>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 mt-2">
                            <li>Material: Alta qualidade</li>
                            <li>Dimensões: 10x20x5 cm</li>
                            <li>Peso: 250g</li>
                        </ul>
                    </div>
                </div>
           )}
        </Modal>
    </div>
  );
};

export default Dropshipping;