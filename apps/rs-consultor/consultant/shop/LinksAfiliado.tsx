import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/Card';
import { mockAffiliateSellers, mockShopSettings } from '../data';
import { 
    IconSearch, 
    IconLink, 
    IconActive, 
    IconCopy, 
    IconFileText,
    IconStore
} from '../../components/icons';
import { useUser } from '../ConsultantLayout';

// Defining Seller type locally for clarity
type Seller = typeof mockAffiliateSellers[0];

interface AffiliateCopyAction {
  label: string;
  type: 'sellerLink' | 'adText' | 'myStoreLink';
  icon: React.ElementType;
}

const affiliateCopyActions: AffiliateCopyAction[] = [
    { label: 'Link da Loja do Parceiro', type: 'sellerLink', icon: IconLink },
    { label: 'Texto de Divulgação', type: 'adText', icon: IconFileText },
    { label: 'Link da Minha Loja', type: 'myStoreLink', icon: IconStore },
];


const LinksAfiliado: React.FC = () => {
    const { user } = useUser();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [copiedState, setCopiedState] = useState<{ sellerId: string, type: string } | null>(null);
    const dropdownsRef = useRef<(HTMLDivElement | null)[]>([]);

    const handleCopy = (type: AffiliateCopyAction['type'], seller: Seller) => {
        const consultantSlug = mockShopSettings.storeSlug;
        const userRef = user.id;
        let textToCopy = '';

        switch (type) {
            case 'sellerLink':
                textToCopy = `https://rsprolipsi.com/loja/${seller.id}?ref=${userRef}`;
                break;
            case 'adText':
                textToCopy = `✨ Confira os produtos incríveis da ${seller.name}! ✨\n\nQualidade e ótimos preços com ${seller.commissionRate}% de comissão para você. \n\nCompre pelo meu link de afiliado: https://rsprolipsi.com/loja/${seller.id}?ref=${userRef}`;
                break;
            case 'myStoreLink':
                textToCopy = `https://rsprolipsi.com/loja/${consultantSlug}`;
                break;
        }

        navigator.clipboard.writeText(textToCopy);
        setCopiedState({ sellerId: seller.id, type });
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
                <h2 className="text-xl font-bold text-white mb-4">Gerador de Links de Afiliado</h2>
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Pesquisar por lojista ou produto..." className="w-full bg-brand-gray border border-brand-gray-light rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-white mb-4">Lojistas Parceiros</h3>
                <div className="space-y-4">
                    {mockAffiliateSellers.map((seller, index) => (
                        <div key={seller.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-brand-gray-light rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img src={seller.logoUrl} alt={seller.name} className="h-14 w-14 rounded-full"/>
                                <div>
                                    <p className="font-bold text-white">{seller.name}</p>
                                    <p className="text-sm text-gray-400">{seller.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                <p className="text-lg font-semibold text-green-400">{seller.commissionRate}%</p>
                                <div className="relative" ref={(el) => { dropdownsRef.current[index] = el; }}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === seller.id ? null : seller.id) }}
                                        className="flex items-center justify-center space-x-2 text-sm bg-brand-gold text-brand-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors w-32"
                                        aria-haspopup="true"
                                        aria-expanded={activeDropdown === seller.id}
                                    >
                                        <IconCopy size={16} />
                                        <span>Copiar</span>
                                    </button>
                                    {activeDropdown === seller.id && (
                                        <div 
                                            className="absolute right-0 top-full mt-2 w-64 bg-brand-gray-dark border border-brand-gray rounded-lg shadow-2xl z-10 py-1"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {affiliateCopyActions.map(action => (
                                                <button 
                                                    key={action.type}
                                                    onClick={() => handleCopy(action.type, seller)}
                                                    className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-200 hover:bg-brand-gray-light"
                                                >
                                                    <action.icon className="h-4 w-4 mr-3 text-brand-gold" />
                                                    <span>
                                                        {copiedState?.sellerId === seller.id && copiedState?.type === action.type ? 'Copiado!' : action.label}
                                                    </span>
                                                    {copiedState?.sellerId === seller.id && copiedState?.type === action.type && <IconActive size={16} className="ml-auto text-green-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LinksAfiliado;