
import React, { useState, useRef } from 'react';
import { MarketingPixel, View, MARKETING_PIXEL_TYPES } from '../types';

interface AddEditMarketingPixelProps {
    pixel: MarketingPixel | null;
    onSave: (pixel: MarketingPixel) => void;
    onCancel: () => void;
}

const AddEditMarketingPixel: React.FC<AddEditMarketingPixelProps> = ({ pixel, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<MarketingPixel>>({
        name: '',
        type: 'Facebook',
        pixelId: '',
        idLabel: '',
        status: 'Ativo',
        ...pixel
    });
    const formRef = useRef<HTMLFormElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.pixelId?.trim()) {
            alert('Por favor, preencha o nome e o ID do pixel.');
            return;
        }
        onSave(formData as MarketingPixel);
    };

    const handleSaveClick = () => {
        formRef.current?.requestSubmit();
    };

    return (
        <>
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-[rgb(var(--color-brand-gray-light))]">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors">
                        Descartar
                    </button>
                    <button type="button" onClick={handleSaveClick} className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 transition-colors">
                        Salvar Pixel
                    </button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="max-w-2xl mx-auto space-y-8">
                <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Nome da Campanha</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ex: Campanha de Lançamento"
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Plataforma</label>
                        <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                        >
                            {MARKETING_PIXEL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pixelId" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">ID do Pixel / Tag</label>
                        <input
                            type="text"
                            name="pixelId"
                            id="pixelId"
                            value={formData.pixelId}
                            onChange={handleInputChange}
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                            required
                        />
                    </div>
                    {formData.type === 'Google Ads' && (
                        <div>
                            <label htmlFor="idLabel" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Rótulo de Conversão (Opcional)</label>
                            <input
                                type="text"
                                name="idLabel"
                                id="idLabel"
                                value={formData.idLabel}
                                onChange={handleInputChange}
                                className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                            />
                        </div>
                    )}
                </div>

                <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4">Status</h3>
                    <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                </div>
            </form>
        </>
    );
};

export default AddEditMarketingPixel;