
import React, { useState, useMemo } from 'react';
import { Affiliate, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';

interface ManageAffiliatesProps {
    affiliates: Affiliate[];
    onNavigate: (view: View) => void;
}

const ManageAffiliates: React.FC<ManageAffiliatesProps> = ({ affiliates, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAffiliates = useMemo(() => {
        return affiliates.filter(a => 
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [affiliates, searchTerm]);

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                <div className="relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail do afiliado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
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
                            <th scope="col" className="px-6 py-3">Afiliado</th>
                            <th scope="col" className="px-6 py-3 text-center">Comissão</th>
                            <th scope="col" className="px-6 py-3 text-right">Vendas Totais</th>
                            <th scope="col" className="px-6 py-3 text-right">Ganhos Totais</th>
                            <th scope="col" className="px-6 py-3 text-right">Saldo a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAffiliates.map(affiliate => {
                            const balance = affiliate.totalEarnings - affiliate.paidOut;
                            return (
                                <tr key={affiliate.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50]">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-[rgb(var(--color-brand-text-light))]">{affiliate.name}</p>
                                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{affiliate.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center text-lg font-bold text-[rgb(var(--color-brand-text-light))]">{affiliate.commissionRate}%</td>
                                    <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(affiliate.totalSales)}</td>
                                    <td className="px-6 py-4 text-right text-[rgb(var(--color-success))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(affiliate.totalEarnings)}</td>
                                    <td className="px-6 py-4 text-right text-[rgb(var(--color-brand-gold))] font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAffiliates;