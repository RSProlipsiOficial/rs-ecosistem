

import React, { useState, useMemo } from 'react';
// FIX: Changed missing 'Franchisee' type to 'Distributor' to match the type definition in types.ts
import { Distributor, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';

interface ManageFranchiseesProps {
    franchisees: Distributor[];
    onNavigate: (view: View, data?: any) => void;
}

const FranchiseeCard: React.FC<{ franchisee: Distributor }> = ({ franchisee }) => {
    const totalStores = franchisee.stores.length;
    const totalConsultants = franchisee.stores.reduce((sum, store) => sum + store.consultantIds.length, 0);

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[rgb(var(--color-brand-gold))]/[0.10] hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">{franchisee.name}</h3>
                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Proprietário: {franchisee.ownerName}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))] font-mono">{franchisee.id}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{franchisee.cpfCnpj}</p>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[rgb(var(--color-brand-gray))]/[.50] p-3 rounded-md">
                    <BuildingStorefrontIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">{totalStores}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Lojas</p>
                </div>
                <div className="bg-[rgb(var(--color-brand-gray))]/[.50] p-3 rounded-md">
                    <UserGroupIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">{totalConsultants}</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Consultores</p>
                </div>
                <div className="bg-[rgb(var(--color-brand-gray))]/[.50] p-3 rounded-md">
                    <BanknotesIcon className="w-6 h-6 mx-auto text-[rgb(var(--color-brand-text-dim))]" />
                    <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] mt-1">R$ --</p>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Faturamento (Mês)</p>
                </div>
            </div>
        </div>
    );
};


const ManageFranchisees: React.FC<ManageFranchiseesProps> = ({ franchisees, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFranchisees = useMemo(() => {
        return franchisees.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [franchisees, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="relative flex-grow w-full sm:w-auto max-w-lg">
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
                    onClick={() => { /* onNavigate('addEditFranchisee') */ }}
                    className="flex items-center gap-2 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 transition-colors w-full sm:w-auto justify-center"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Franqueado
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFranchisees.map(franchisee => (
                    <FranchiseeCard key={franchisee.id} franchisee={franchisee} />
                ))}
            </div>

            {filteredFranchisees.length === 0 && (
                <div className="text-center py-16 bg-[rgb(var(--color-brand-dark))] border-2 border-dashed border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                    <p className="text-lg text-[rgb(var(--color-brand-text-dim))]">Nenhum franqueado encontrado.</p>
                </div>
            )}
        </div>
    );
};

export default ManageFranchisees;