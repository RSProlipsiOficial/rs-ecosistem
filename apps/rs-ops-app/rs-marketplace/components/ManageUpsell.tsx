import React, { useEffect, useState } from 'react';
import { UpsellSettings, Product } from '../types';
import { ToggleSwitch } from './ToggleSwitch';

interface ManageUpsellProps {
    settings: UpsellSettings;
    products: Product[];
    onSave: (newSettings: UpsellSettings) => void;
}

const normalizeUpsellSettings = (settings: UpsellSettings): UpsellSettings => ({
    ...settings,
    triggerProductId: String(settings.triggerProductId || ''),
    productId: String(settings.productId || ''),
    offerPrice: Number(settings.offerPrice || 0),
});

const ManageUpsell: React.FC<ManageUpsellProps> = ({ settings, products, onSave }) => {
    const [localSettings, setLocalSettings] = useState<UpsellSettings>(() => normalizeUpsellSettings(settings));
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(normalizeUpsellSettings(settings));

    useEffect(() => {
        setLocalSettings(normalizeUpsellSettings(settings));
    }, [settings]);

    const handleSave = () => {
        onSave(normalizeUpsellSettings(localSettings));
        alert('Configuracoes do Upsell salvas com sucesso!');
    };

    const handleDiscard = () => setLocalSettings(normalizeUpsellSettings(settings));

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

    const selectedTriggerProduct = products.find(product => product.id === localSettings.triggerProductId);
    const selectedOfferProduct = products.find(product => product.id === localSettings.productId);

    return (
        <div className="space-y-6">
            <div className="mb-6 flex items-center justify-end border-b border-dark-800 pb-6">
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-gold-400">Voce tem alteracoes nao salvas.</p>}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="rounded-md bg-dark-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-black hover:bg-gold-400 disabled:opacity-50"
                    >
                        Salvar
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-8">
                <div className="rounded-lg border border-dark-800 bg-black">
                    <div className="flex items-center justify-between border-b border-dark-800 p-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Upsell Pos-Compra (One-Click)</h3>
                            <p className="text-sm text-gray-400">Ofereca um produto complementar logo apos a finalizacao da compra.</p>
                        </div>
                        <ToggleSwitch checked={localSettings.enabled} onChange={handleToggleChange} labelId="upsell-toggle" />
                    </div>

                    {localSettings.enabled && (
                        <div className="space-y-4 p-6">
                            <div>
                                <label htmlFor="triggerProductId" className="mb-2 block text-sm font-medium text-gray-400">
                                    Produto Comprado que Ativa o Upsell
                                </label>
                                <select
                                    id="triggerProductId"
                                    name="triggerProductId"
                                    value={localSettings.triggerProductId || ''}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                >
                                    <option value="">Qualquer pedido aprovado</option>
                                    {products.map(product => (
                                        <option key={`trigger-${product.id}`} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    {selectedTriggerProduct
                                        ? `O upsell so aparece quando o cliente comprar ${selectedTriggerProduct.name}.`
                                        : 'Se deixar em branco, a oferta aparece para qualquer compra aprovada.'}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="productId" className="mb-2 block text-sm font-medium text-gray-400">
                                    Produto Ofertado no Upsell
                                </label>
                                <select
                                    id="productId"
                                    name="productId"
                                    value={localSettings.productId}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                >
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedOfferProduct && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Preco original:{' '}
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOfferProduct.price)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="offerPrice" className="mb-2 block text-sm font-medium text-gray-400">
                                    Preco da Oferta de Upsell
                                </label>
                                <input
                                    type="number"
                                    id="offerPrice"
                                    name="offerPrice"
                                    min="0"
                                    step="0.01"
                                    value={localSettings.offerPrice}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-400">
                                    Titulo da Oferta
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={localSettings.title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                />
                                <p className="mt-1 text-xs text-gray-500">Ex: OFERTA UNICA POS-COMPRA!</p>
                            </div>

                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-400">
                                    Descricao da Oferta
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={localSettings.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="acceptButtonText" className="mb-2 block text-sm font-medium text-gray-400">
                                        Texto do Botao de Aceitar
                                    </label>
                                    <input
                                        type="text"
                                        id="acceptButtonText"
                                        name="acceptButtonText"
                                        value={localSettings.acceptButtonText}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="declineButtonText" className="mb-2 block text-sm font-medium text-gray-400">
                                        Texto do Botao de Recusar
                                    </label>
                                    <input
                                        type="text"
                                        id="declineButtonText"
                                        name="declineButtonText"
                                        value={localSettings.declineButtonText}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                    />
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
