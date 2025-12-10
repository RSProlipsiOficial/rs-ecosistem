
import React, { useState, useMemo } from 'react';
import { Coupon, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TagIcon } from './icons/TagIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ToggleSwitch } from './ToggleSwitch';

interface ManagePromotionsProps {
    coupons: Coupon[];
    onNavigate: (view: View, data?: Coupon) => void;
    onDelete: (couponId: string) => void;
    onStatusToggle: (couponId: string, newStatus: 'Ativo' | 'Inativo') => void;
}

const ManagePromotions: React.FC<ManagePromotionsProps> = ({ coupons, onNavigate, onDelete, onStatusToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCoupons = useMemo(() => {
        return coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [coupons, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">Cupons de Desconto</h1>
                <button 
                    onClick={() => onNavigate('addEditCoupon')}
                    className="flex items-center gap-2 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 transition-colors">
                    <TagIcon className="w-5 h-5" />
                    Criar cupom
                </button>
            </div>
            <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                    <div className="relative max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar por código do cupom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                        <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Código</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3">Valor</th>
                                <th scope="col" className="px-6 py-3">Utilizações</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCoupons.map(coupon => (
                                <tr key={coupon.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50]">
                                    <td className="px-6 py-4">
                                        <button onClick={() => onNavigate('addEditCoupon', coupon)} className="font-medium text-[rgb(var(--color-brand-gold))] hover:underline">{coupon.code}</button>
                                        {coupon.description && <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{coupon.description}</p>}
                                    </td>
                                    <td className="px-6 py-4">{coupon.type}</td>
                                    <td className="px-6 py-4 text-[rgb(var(--color-brand-text-light))]">
                                        {coupon.type === 'Porcentagem' 
                                            ? `${coupon.value}%` 
                                            : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.value)
                                        }
                                    </td>
                                    <td className="px-6 py-4">{coupon.usageCount} / {coupon.usageLimit ?? '∞'}</td>
                                    <td className="px-6 py-4">
                                        <ToggleSwitch 
                                            checked={coupon.status === 'Ativo'} 
                                            onChange={(checked) => onStatusToggle(coupon.id, checked ? 'Ativo' : 'Inativo')}
                                            labelId={`toggle-${coupon.id}`}
                                        />
                                    </td>
                                     <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => onNavigate('addEditCoupon', coupon)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]" title="Editar">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onDelete(coupon.id)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]" title="Excluir">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagePromotions;