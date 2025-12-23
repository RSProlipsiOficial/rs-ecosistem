import React, { useState, useRef } from 'react';
import { Coupon, View } from '../types';

interface AddEditCouponProps {
    coupon: Coupon | null;
    onSave: (coupon: Coupon) => void;
    onCancel: () => void;
}

const AddEditCoupon: React.FC<AddEditCouponProps> = ({ coupon, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        description: '',
        type: 'Porcentagem',
        value: 10,
        status: 'Ativo',
        usageLimit: null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        ...coupon,
    });
    const formRef = useRef<HTMLFormElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
    
        if (name === 'unlimitedUses') {
            setFormData(prev => ({ ...prev, usageLimit: checked ? null : prev.usageLimit ?? 100 }));
        } else if (name === 'noEndDate') {
            setFormData(prev => ({ ...prev, endDate: checked ? null : prev.endDate ?? '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
        }
    };
    
    const generateCode = () => {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData(prev => ({ ...prev, code }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation
        if (!formData.code?.trim()) {
            alert('Por favor, insira um código para o cupom.');
            return;
        }
        if (formData.value === undefined || formData.value <= 0) {
            alert('O valor do desconto deve ser maior que zero.');
            return;
        }
        onSave(formData as Coupon);
    };

    const handleSaveClick = () => {
        formRef.current?.requestSubmit();
    };
    
    return (
        <>
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-dark-800">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                        Descartar
                    </button>
                    <button type="button" onClick={handleSaveClick} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 transition-colors">
                        Salvar Cupom
                    </button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Details */}
                        <div className="bg-black border border-dark-800 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-white mb-2">Código do Cupom</label>
                                    <div className="flex gap-2">
                                        <input type="text" name="code" id="code" value={formData.code} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500" />
                                        <button type="button" onClick={generateCode} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">Gerar</button>
                                    </div>
                                </div>
                                <div />
                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-white mb-2">Descrição (opcional)</label>
                                    <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500" placeholder="Para uso interno" />
                                </div>
                            </div>
                        </div>

                        {/* Discount Details */}
                        <div className="bg-black border border-dark-800 rounded-lg p-6">
                             <h3 className="text-lg font-semibold text-white mb-4">Tipo e Valor</h3>
                             <div className="flex gap-8 mb-4">
                                <label className="flex items-center">
                                    <input type="radio" name="type" value="Porcentagem" checked={formData.type === 'Porcentagem'} onChange={handleInputChange} className="h-4 w-4 bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600" />
                                    <span className="ml-2 text-white">Porcentagem</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="type" value="Valor Fixo" checked={formData.type === 'Valor Fixo'} onChange={handleInputChange} className="h-4 w-4 bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600" />
                                    <span className="ml-2 text-white">Valor Fixo</span>
                                </label>
                             </div>
                             <div>
                                <label htmlFor="value" className="block text-sm font-medium text-white mb-2">Valor do Desconto</label>
                                <div className="relative">
                                     <input type="number" name="value" id="value" value={formData.value} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white pl-8" min="0" step="0.01" />
                                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">{formData.type === 'Porcentagem' ? '%' : 'R$'}</span>
                                </div>
                             </div>
                        </div>

                        {/* Usage Limits */}
                        <div className="bg-black border border-dark-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Limites de Utilização</h3>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input type="checkbox" id="unlimitedUses" name="unlimitedUses" checked={formData.usageLimit === null} onChange={handleInputChange} className="h-4 w-4 rounded bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600" />
                                    <label htmlFor="unlimitedUses" className="ml-2 block text-sm text-gray-300">Sem limite de utilizações</label>
                                </div>
                                {formData.usageLimit !== null && (
                                     <div>
                                        <label htmlFor="usageLimit" className="block text-sm text-gray-400 mb-1">Número total de utilizações</label>
                                        <input type="number" name="usageLimit" id="usageLimit" value={formData.usageLimit ?? ''} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-8">
                        <div className="bg-black border border-dark-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                            <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Cupons inativos não podem ser usados no checkout.</p>
                        </div>
                        <div className="bg-black border border-dark-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Período de Atividade</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm text-gray-400 mb-1">Data de Início</label>
                                    <input type="date" name="startDate" id="startDate" value={formData.startDate?.split('T')[0]} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                </div>
                                 <div>
                                    <div className="flex items-center mb-1">
                                        <input type="checkbox" id="noEndDate" name="noEndDate" checked={formData.endDate === null} onChange={handleInputChange} className="h-4 w-4 rounded bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600" />
                                        <label htmlFor="noEndDate" className="ml-2 block text-sm text-gray-300">Sem data de fim</label>
                                    </div>
                                    {formData.endDate !== null && (
                                         <input type="date" name="endDate" id="endDate" value={formData.endDate?.split('T')[0]} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default AddEditCoupon;