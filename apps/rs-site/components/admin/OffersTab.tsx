import React, { useState } from 'react';
import { useOffers } from '../../context/OffersContext';
import { useProductContext } from '../../context/ProductContext';
import { Offer } from '../../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '../Icons';
import ImageInput from '../ImageInput';

const OfferEditor: React.FC<{ offer: Offer | Omit<Offer, 'id'>, onSave: (offer: Offer | Omit<Offer, 'id'>) => void, onCancel: () => void }> = ({ offer, onSave, onCancel }) => {
    const [formData, setFormData] = useState(offer);
    const { products } = useProductContext();

    const handleChange = (field: keyof Offer, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <button onClick={onCancel} className="flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-4">
                    <ArrowLeftIcon className="w-5 h-5"/> <span>Voltar para Ofertas</span>
                </button>
                <button onClick={() => onSave(formData)} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">
                    Salvar Oferta
                </button>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border space-y-4">
                <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-3 mb-4">Editor de Oferta</h3>
                
                <input type="text" placeholder="Nome Interno da Oferta" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />
                
                <ImageInput label="Imagem da Oferta" value={formData.imageUrl} onChange={v => handleChange('imageUrl', v)} />
                
                <input type="text" placeholder="Título da Oferta (Ex: OFERTA ESPECIAL!)" value={formData.headline} onChange={e => handleChange('headline', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />

                <textarea placeholder="Descrição da Oferta" value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" rows={3}></textarea>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Produto Ofertado</label>
                        <select value={formData.offerProductId} onChange={e => handleChange('offerProductId', e.target.value)} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600">
                            <option value="">Selecione um produto</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.translations.pt.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Desconto (%)</label>
                        <input type="number" value={formData.discountPercentage} onChange={e => handleChange('discountPercentage', parseInt(e.target.value))} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600" />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-text-secondary">Produtos Gatilho (ative a oferta quando estes produtos estiverem no carrinho)</label>
                    <div className="max-h-40 overflow-y-auto bg-gray-800 p-2 mt-1 rounded border border-gray-600 space-y-1">
                        {products.map(p => (
                            <label key={p.id} className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.triggerProductIds.includes(p.id)}
                                    onChange={e => {
                                        const newTriggers = e.target.checked
                                            ? [...formData.triggerProductIds, p.id]
                                            : formData.triggerProductIds.filter(id => id !== p.id);
                                        handleChange('triggerProductIds', newTriggers);
                                    }}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent"
                                />
                                <span>{p.translations.pt.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" checked={formData.isActive} onChange={e => handleChange('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent" />
                    <label className="ml-2 text-sm text-text-secondary">Oferta Ativa</label>
                </div>
            </div>
        </div>
    );
};

const OffersTab: React.FC = () => {
    const { offers, addOffer, updateOffer, deleteOffer } = useOffers();
    const [activeSubTab, setActiveSubTab] = useState<'order_bump' | 'upsell'>('order_bump');
    const [editingOffer, setEditingOffer] = useState<Offer | Omit<Offer, 'id'> | null>(null);
    
    const filteredOffers = offers.filter(o => o.type === activeSubTab);

    const handleAddNew = () => {
        setEditingOffer({
            type: activeSubTab,
            name: '',
            triggerProductIds: [],
            offerProductId: '',
            discountPercentage: 0,
            headline: '',
            description: '',
            imageUrl: '',
            isActive: false
        });
    };
    
    const handleSave = (offer: Offer | Omit<Offer, 'id'>) => {
        if ('id' in offer && offer.id) {
            updateOffer(offer as Offer);
        } else {
            addOffer(offer);
        }
        setEditingOffer(null);
    };

    if (editingOffer) {
        return <OfferEditor offer={editingOffer} onSave={handleSave} onCancel={() => setEditingOffer(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-accent">Gerenciar Ofertas</h2>
                <button onClick={handleAddNew} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80 flex items-center space-x-2">
                    <PlusIcon /><span>Adicionar Oferta</span>
                </button>
            </div>

            <div className="flex items-center space-x-1 rounded-lg bg-gray-900/50 p-1 border border-border self-start">
                <button onClick={() => setActiveSubTab('order_bump')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeSubTab === 'order_bump' ? 'bg-accent text-button-text' : 'text-text-secondary hover:bg-surface'}`}>Order Bumps</button>
                <button onClick={() => setActiveSubTab('upsell')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeSubTab === 'upsell' ? 'bg-accent text-button-text' : 'text-text-secondary hover:bg-surface'}`}>Upsells</button>
            </div>
            
            <div className="space-y-2">
                {filteredOffers.map(offer => (
                    <div key={offer.id} className="bg-gray-800/50 p-3 rounded-md flex items-center justify-between hover:bg-gray-800/80">
                        <span className={`h-2 w-2 rounded-full mr-3 ${offer.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <p className="flex-grow font-semibold text-text-primary truncate">{offer.name}</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setEditingOffer(offer)} className="p-2 text-text-secondary hover:text-accent"><PencilIcon /></button>
                            <button onClick={() => deleteOffer(offer.id)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OffersTab;
