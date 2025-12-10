import React, { useState } from 'react';
import { Distributor } from '../types';

interface AddEditDistributorProps {
    distributor?: Distributor | null;
    onCancel: () => void;
    onSave: (cd: Partial<Distributor>) => void;
}

const AddEditDistributor: React.FC<AddEditDistributorProps> = ({ distributor, onCancel, onSave }) => {
    const [name, setName] = useState(distributor?.name || '');
    const [ownerName, setOwnerName] = useState(distributor?.ownerName || '');
    const [cpfCnpj, setCpfCnpj] = useState(distributor?.cpfCnpj || '');
    const [email, setEmail] = useState(distributor?.email || '');
    const [phone, setPhone] = useState(distributor?.phone || '');

    const handleSubmit = () => {
        if (!name.trim()) { alert('Informe o nome do CD'); return; }
        onSave({ id: distributor?.id, name, ownerName, cpfCnpj, email, phone });
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-[rgb(var(--color-brand-text-light))]">Adicionar/Editar Central de Distribuição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">Nome do CD</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                </div>
                <div>
                    <label className="block text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">Proprietário</label>
                    <input value={ownerName} onChange={e=>setOwnerName(e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                </div>
                <div>
                    <label className="block text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">CPF/CNPJ</label>
                    <input value={cpfCnpj} onChange={e=>setCpfCnpj(e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                </div>
                <div>
                    <label className="block text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">E-mail</label>
                    <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                </div>
                <div>
                    <label className="block text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">Telefone</label>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                </div>
            </div>
            <div className="flex gap-3 mt-4">
                <button onClick={onCancel} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">Voltar</button>
                <button onClick={handleSubmit} className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400">Salvar</button>
            </div>
        </div>
    );
};

export default AddEditDistributor;
