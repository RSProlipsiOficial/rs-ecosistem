import React, { useState, useEffect } from 'react';
import { UpsellSettings, Product } from '../types';
import { ToggleSwitch } from './ToggleSwitch';

interface ManageUpsellProps {
    settings: UpsellSettings;
    products: Product[];
    onSave: (newSettings: UpsellSettings) => void;
}

const ManageUpsell: React.FC<ManageUpsellProps> = ({ settings, products, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    
    const handleSave = () => {
        onSave(localSettings);
        alert('Configurações do Upsell salvas com sucesso!');
    };
    const handleDiscard = () => setLocalSettings(settings);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: name === 'offerPrice' ? Number(value) : value,
        }));
    };
    
    const handleToggleChange = (enabled: boolean) => {
        setLocalSettings(prev => ({ ...prev, enabled }));
    };

    const selectedProduct = products.find(p => p.id === localSettings.productId);

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-dark-800">
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-gold-400">Você tem alterações não salvas.</p>}
                    <button onClick={handleDiscard} disabled={!hasChanges} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50">Descartar</button>
                    <button onClick={handleSave} disabled={!hasChanges} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50">Salvar</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Upsell Pós-Compra (One-Click)</h3>
                            <p className="text-sm text-gray-400">Ofereça um produto complementar logo após a finalização da compra.</p>
                        </div>
                        <ToggleSwitch checked={localSettings.enabled} onChange={handleToggleChange} labelId="upsell-toggle" />
                    </div>
                    {localSettings.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="productId" className="block text-sm font-medium text-gray-400 mb-2">Produto da Oferta</label>
                                <select id="productId" name="productId" value={localSettings.productId} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {selectedProduct && <p className="text-xs text-gray-500 mt-1">Preço original: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price)}</p>}
                            </div>
                            <div>
                                <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-400 mb-2">Preço da Oferta de Upsell</label>
                                <input type="number" id="offerPrice" name="offerPrice" value={localSettings.offerPrice} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                            </div>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Título da Oferta</label>
                                <input type="text" id="title" name="title" value={localSettings.title} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                <p className="text-xs text-gray-500 mt-1">Ex: ✨ OFERTA ÚNICA PÓS-COMPRA! ✨</p>
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Descrição da Oferta</label>
                                <textarea id="description" name="description" value={localSettings.description} onChange={handleInputChange} rows={3} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="acceptButtonText" className="block text-sm font-medium text-gray-400 mb-2">Texto do Botão de Aceitar</label>
                                    <input type="text" id="acceptButtonText" name="acceptButtonText" value={localSettings.acceptButtonText} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                </div>
                                <div>
                                    <label htmlFor="declineButtonText" className="block text-sm font-medium text-gray-400 mb-2">Texto do Botão de Recusar</label>
                                    <input type="text" id="declineButtonText" name="declineButtonText" value={localSettings.declineButtonText} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUpsell;
