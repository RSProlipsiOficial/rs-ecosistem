

import React, { useState, useMemo } from 'react';
import { Distributor, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';

interface ManageDistributorsProps {
    distributors: Distributor[];
    onNavigate: (view: View, data?: any) => void;
}

const DistributorCard: React.FC<{ distributor: Distributor; onNavigate: (view: View, data?: any) => void }> = ({ distributor, onNavigate }) => {
    const totalStores = distributor.stores.length;
    const totalConsultants = distributor.stores.reduce((sum, store) => sum + store.consultantIds.length, 0);

    return (
        <div className="bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] border-t-2 border-t-[rgb(var(--color-brand-gold))] rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[rgb(var(--color-brand-gold))]/[0.10] hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">{distributor.name}</h3>
                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Proprietário: {distributor.ownerName}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))] font-mono">{distributor.id}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{distributor.cpfCnpj}</p>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[rgb(var(--color-brand-dark))] p-3 rounded-md">
                    <BuildingStorefrontIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">{totalStores}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Lojas</p>
                </div>
                <div className="bg-[rgb(var(--color-brand-dark))] p-3 rounded-md">
                    <UserGroupIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">{totalConsultants}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Consultores</p>
                </div>
                <div className="bg-[rgb(var(--color-brand-dark))] p-3 rounded-md">
                    <BanknotesIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">R$&nbsp;--</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Faturamento (Mês)</p>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                <button onClick={() => onNavigate('rsCD', distributor)} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-3 rounded-md">Abrir RS-CD</button>
            </div>
        </div>
    );
};


const ManageDistributors: React.FC<ManageDistributorsProps> = ({ distributors, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDistributors = useMemo(() => {
        return distributors.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [distributors, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                 <div className="relative flex-grow max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar por nome, proprietário ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                    </div>
                </div>
                <button 
                    onClick={() => { onNavigate('addEditDistributor') }}
                    className="flex items-center gap-2 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-warning))] transition-colors whitespace-nowrap"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar CD
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDistributors.map(distributor => (
                    <DistributorCard key={distributor.id} distributor={distributor} onNavigate={onNavigate} />
                ))}
            </div>

            {filteredDistributors.length === 0 && (
                <div className="text-center py-16 bg-[rgb(var(--color-brand-dark))] border-2 border-dashed border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                    <p className="text-lg text-[rgb(var(--color-brand-text-dim))]">Nenhuma Central de Distribuição encontrada.</p>
                </div>
            )}
        </div>
    );
};

export default ManageDistributors;
