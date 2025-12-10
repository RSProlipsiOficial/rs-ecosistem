import React, { useState, useEffect, useCallback } from 'react';
import type { Consultant } from '../types';
import { CloseIcon, LockOpenIcon, LockClosedIcon, ShieldCheckIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (consultant: Consultant) => void;
    consultant: Consultant | null;
}

const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper component for permission rows
const PermissionRow: React.FC<{
    label: string;
    path: string;
    isLocked: boolean;
    onToggle: (path: string) => void;
}> = ({ label, path, isLocked, onToggle }) => (
    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
        <span className="text-sm text-gray-300">{label}</span>
        <button onClick={() => onToggle(path)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors" aria-label={`Toggle lock for ${label}`}>
            {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
        </button>
    </div>
);

// Extracted SecurityTab component to fix hook error
const SecurityTab: React.FC = () => {
    const [resetStatus, setResetStatus] = useState<'idle' | 'success'>('idle');

    const handlePasswordReset = () => {
        // Simulate API call
        setResetStatus('success');
        setTimeout(() => setResetStatus('idle'), 3000);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Gerenciamento de Senha</h3>
            <p className="text-sm text-gray-400">
                Ao clicar no botão abaixo, um e-mail com um link para redefinição de senha será enviado para o endereço de e-mail cadastrado do consultor. 
                O link será válido por 24 horas.
            </p>
            {resetStatus === 'idle' ? (
                <button 
                    onClick={handlePasswordReset}
                    className="w-full bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    Enviar Link de Redefinição de Senha
                </button>
            ) : (
                <div className="w-full text-center py-2.5 px-5 rounded-lg bg-green-500/20 text-green-400">
                    Link enviado com sucesso!
                </div>
            )}
        </div>
    );
};


const ConsultantDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, consultant }) => {
    const [activeTab, setActiveTab] = useState('cadastro');
    const [formData, setFormData] = useState<Consultant | null>(consultant);

    useEffect(() => {
        setFormData(consultant);
        if (consultant) {
            setActiveTab('cadastro');
        }
    }, [consultant]);
    
    const handleChange = useCallback((path: string, value: any) => {
        setFormData(prevData => {
            if (!prevData) return null;
            
            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prevData));
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    }, []);

    const handlePermissionToggle = useCallback((path: string) => {
        setFormData(prevData => {
            if (!prevData) return null;

            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prevData));
            let currentPermissions = newData.permissions;

            for (let i = 0; i < keys.length - 1; i++) {
                currentPermissions = currentPermissions[keys[i]];
            }

            const finalKey = keys[keys.length - 1];
            currentPermissions[finalKey] = !currentPermissions[finalKey];
            return newData;
        });
    }, []);

    if (!isOpen || !formData) return null;

    const handleSave = () => {
        onSave(formData);
    };

    const handleCancel = () => {
        setFormData(consultant);
    }
    
    const TabButton: React.FC<{tabId: string, label: string}> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tabId 
                ? 'border-b-2 border-yellow-500 text-yellow-500' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
        >
            {label}
        </button>
    );
    
    const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition-colors disabled:bg-gray-800/60 disabled:cursor-not-allowed";

    const FormRow: React.FC<{label: string, name: string, type?: string}> = ({label, name, type = 'text'}) => {
        const isLocked = getNestedValue(formData.permissions, name);
        const value = getNestedValue(formData, name);
        return (
         <div className="grid grid-cols-3 gap-4 py-2 items-center">
            <label htmlFor={name} className="text-sm font-medium text-gray-400">{label}</label>
            <div className="col-span-2 flex items-center gap-2">
                <input id={name} name={name} type={type} value={value} disabled={isLocked} onChange={e => handleChange(name, e.target.value)} className={baseInputClasses} />
                <button onClick={() => handlePermissionToggle(name)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors">
                    {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )};
    
    const SelectRow: React.FC<{label: string, name: string, options: string[]}> = ({label, name, options}) => {
        const isLocked = getNestedValue(formData.permissions, name);
        const value = getNestedValue(formData, name);
        return (
            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                <label htmlFor={name} className="text-sm font-medium text-gray-400">{label}</label>
                <div className="col-span-2 flex items-center gap-2">
                    <select id={name} name={name} value={value} disabled={isLocked} onChange={e => handleChange(name, e.target.value)} className={baseInputClasses}>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <button onClick={() => handlePermissionToggle(name)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors">
                        {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        )
    };

    const renderCadastro = () => (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Dados Pessoais</h3>
            <FormRow label="Nome Completo" name="name" />
            <FormRow label="CPF/CNPJ" name="cpfCnpj" />
            <FormRow label="Email" name="contact.email" type="email" />
            <FormRow label="Telefone" name="contact.phone" />
            <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3 pt-4">Endereço</h3>
            <FormRow label="Rua" name="address.street" />
            <FormRow label="Cidade" name="address.city" />
            <FormRow label="Estado" name="address.state" />
            <FormRow label="CEP" name="address.zip" />
            <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3 pt-4">Dados Bancários</h3>
            <FormRow label="Banco" name="bankInfo.bank" />
            <FormRow label="Agência" name="bankInfo.agency" />
            <FormRow label="Conta" name="bankInfo.account" />
        </div>
    );
    
    const renderNegocio = () => (
         <div className="space-y-2">
            <SelectRow label="PIN Atual" name="pin" options={['Bronze', 'Prata', 'Ouro', 'Diamante', 'Duplo Diamante']} />
            <FormRow label="Ciclo Atual" name="cycle" type="number"/>
            <FormRow label="Rede Principal" name="network"/>
            <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3 pt-4">Estrutura da Rede</h3>
            <FormRow label="Diretos" name="networkDetails.directs" type="number"/>
            <FormRow label="Nível 1 (L1)" name="networkDetails.l1" type="number"/>
            <FormRow label="Nível 2 (L2)" name="networkDetails.l2" type="number"/>
            <FormRow label="Nível 3 (L3)" name="networkDetails.l3" type="number"/>
        </div>
    );

    const renderFinanceiro = () => (
        <div className="space-y-2">
            <FormRow label="Saldo Wallet (R$)" name="balance" type="number"/>
            <SelectRow label="Status" name="status" options={['Ativo', 'Inativo', 'Pendente']} />
            <div className="pt-4">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Extrato da Wallet</h3>
                 <div className="text-center text-gray-400 p-8 bg-gray-900/50 rounded-lg">
                    <p>Visualização e edição do extrato.</p>
                    <p className="text-sm mt-2">Funcionalidade a ser implementada.</p>
                </div>
            </div>
        </div>
    );
    
    const renderPermissoes = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PermissionRow label="Nome" path="name" isLocked={getNestedValue(formData.permissions, 'name')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="CPF/CNPJ" path="cpfCnpj" isLocked={getNestedValue(formData.permissions, 'cpfCnpj')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Email" path="contact.email" isLocked={getNestedValue(formData.permissions, 'contact.email')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Telefone" path="contact.phone" isLocked={getNestedValue(formData.permissions, 'contact.phone')} onToggle={handlePermissionToggle} />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PermissionRow label="Rua" path="address.street" isLocked={getNestedValue(formData.permissions, 'address.street')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Cidade" path="address.city" isLocked={getNestedValue(formData.permissions, 'address.city')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Estado" path="address.state" isLocked={getNestedValue(formData.permissions, 'address.state')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="CEP" path="address.zip" isLocked={getNestedValue(formData.permissions, 'address.zip')} onToggle={handlePermissionToggle} />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Dados Bancários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PermissionRow label="Banco" path="bankInfo.bank" isLocked={getNestedValue(formData.permissions, 'bankInfo.bank')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Agência" path="bankInfo.agency" isLocked={getNestedValue(formData.permissions, 'bankInfo.agency')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Conta" path="bankInfo.account" isLocked={getNestedValue(formData.permissions, 'bankInfo.account')} onToggle={handlePermissionToggle} />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Dados de Negócio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PermissionRow label="PIN" path="pin" isLocked={getNestedValue(formData.permissions, 'pin')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Ciclo" path="cycle" isLocked={getNestedValue(formData.permissions, 'cycle')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Rede" path="network" isLocked={getNestedValue(formData.permissions, 'network')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Diretos" path="networkDetails.directs" isLocked={getNestedValue(formData.permissions, 'networkDetails.directs')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Nível 1" path="networkDetails.l1" isLocked={getNestedValue(formData.permissions, 'networkDetails.l1')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Nível 2" path="networkDetails.l2" isLocked={getNestedValue(formData.permissions, 'networkDetails.l2')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Nível 3" path="networkDetails.l3" isLocked={getNestedValue(formData.permissions, 'networkDetails.l3')} onToggle={handlePermissionToggle} />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PermissionRow label="Saldo" path="balance" isLocked={getNestedValue(formData.permissions, 'balance')} onToggle={handlePermissionToggle} />
                    <PermissionRow label="Status" path="status" isLocked={getNestedValue(formData.permissions, 'status')} onToggle={handlePermissionToggle} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{consultant?.name}</h2>
                        <p className="text-sm text-yellow-500">{consultant?.pin}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="border-b border-gray-700 px-4 flex-shrink-0">
                    <nav className="-mb-px flex space-x-4">
                        <TabButton tabId="cadastro" label="Dados Cadastrais" />
                        <TabButton tabId="negocio" label="Dados de Negócio" />
                        <TabButton tabId="financeiro" label="Financeiro" />
                        <TabButton tabId="permissoes" label="Permissões" />
                        <TabButton tabId="seguranca" label="Segurança" />
                    </nav>
                </div>

                <main className="p-6 overflow-y-auto flex-grow">
                    {activeTab === 'cadastro' && renderCadastro()}
                    {activeTab === 'negocio' && renderNegocio()}
                    {activeTab === 'financeiro' && renderFinanceiro()}
                    {activeTab === 'permissoes' && renderPermissoes()}
                    {activeTab === 'seguranca' && <SecurityTab />}
                </main>

                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end space-x-3 rounded-b-2xl flex-shrink-0">
                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};

export default ConsultantDetailModal;