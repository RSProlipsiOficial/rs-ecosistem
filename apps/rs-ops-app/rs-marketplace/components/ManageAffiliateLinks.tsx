
import React, { useState, useRef, useEffect } from 'react';
import { PartnerStore } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { StoreIcon } from './icons/StoreIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ManageAffiliateLinksProps {
    stores: PartnerStore[];
    onCommissionChange: (storeId: string, newCommission: number) => void;
}

const PartnerCard: React.FC<{ store: PartnerStore; onCommissionChange: (storeId: string, newCommission: number) => void; }> = ({ store, onCommissionChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [localCommission, setLocalCommission] = useState(store.commission);
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

    const handleCommissionBlur = () => {
        const newCommission = Number(localCommission);
        if (!isNaN(newCommission) && newCommission >= 0 && newCommission !== store.commission) {
            onCommissionChange(store.id, newCommission);
        } else {
            // Reset if invalid or unchanged to avoid saving bad data
            setLocalCommission(store.commission);
        }
    };

    const links = [
        { type: 'partnerLink', label: 'Link da Loja do Parceiro', icon: StoreIcon, url: `https://rs.shop/p/${store.id}?ref=anacarolina` },
        { type: 'adText', label: 'Texto de Divulgação', icon: DocumentTextIcon, url: `Conheça a ${store.name}, especialista em ${store.description}! Use meu link de afiliado para conferir.` },
        { type: 'myStoreLink', label: 'Link da Minha Loja', icon: LinkIcon, url: 'https://rs.shop/loja/anacarolina' },
    ];

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-lg bg-[rgb(var(--color-brand-gray))]"/>
                <div>
                    <h3 className="font-bold text-[rgb(var(--color-brand-text-light))]">{store.name}</h3>
                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{store.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative w-24 text-center">
                    <input
                        type="number"
                        value={localCommission}
                        onChange={(e) => setLocalCommission(Number(e.target.value))}
                        onBlur={handleCommissionBlur}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-lg py-1 pr-6 text-center text-xl font-bold text-[rgb(var(--color-success))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))] appearance-none [-moz-appearance:textfield]"
                        aria-label={`Comissão para ${store.name}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-bold text-[rgb(var(--color-success))] pointer-events-none">%</span>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Comissão</p>
                </div>
                 <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-5 rounded-md hover:bg-gold-400"
                    >
                        Copiar
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg shadow-lg z-10">
                             {links.map(link => (
                                <button 
                                    key={link.type}
                                    onClick={() => handleCopy(link.url, link.type)}
                                    className="w-full flex items-center justify-between text-left px-3 py-2 text-sm text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray))] first:rounded-t-lg last:rounded-b-lg"
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
    );
};

const ManageAffiliateLinks: React.FC<ManageAffiliateLinksProps> = ({ stores, onCommissionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStores = stores.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">Gerador de Links de Afiliado</h1>
            </div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Pesquisar por lojista ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-lg py-3 pl-12 pr-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))]">Lojistas Parceiros</h2>
                {filteredStores.map(store => (
                    <PartnerCard key={store.id} store={store} onCommissionChange={onCommissionChange} />
                ))}
            </div>
        </div>
    );
};

export default ManageAffiliateLinks;