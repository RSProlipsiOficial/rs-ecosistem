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

    const handlePermissionToggle = useCallback((key: keyof ConsultantPermissions) => {
        setFormData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                permissions: {
                    ...prevData.permissions,
                    [key]: !prevData.permissions[key]
                }
            };
        });
    }, []);

    if (!isOpen || !formData) return null;

    const handleSave = () => {
        onSave(formData);
    };

    const handleCancel = () => {
        setFormData(consultant);
    }

    const TabButton: React.FC<{ tabId: string, label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : 'text-gray-400 hover:text-yellow-500'
                }`}
        >
            {label}
        </button>
    );

    const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition-colors disabled:bg-gray-800/60 disabled:cursor-not-allowed disabled:text-gray-500";

    // FormRow agora aceita 'lockKey' para saber qual cadeado controla este campo
    const FormRow: React.FC<{ label: string, name: string, type?: string, lockKey?: keyof ConsultantPermissions }> = ({ label, name, type = 'text', lockKey }) => {
        const isLocked = lockKey ? formData.permissions[lockKey] : false;
        const value = getNestedValue(formData, name);

        return (
            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                <label htmlFor={name} className="text-sm font-medium text-gray-400">{label}</label>
                <div className="col-span-2 flex items-center gap-2">
                    <input id={name} name={name} type={type} value={value || ''} disabled={isLocked} onChange={e => handleChange(name, e.target.value)} className={baseInputClasses} />
                    {lockKey && (
                        <button onClick={() => handlePermissionToggle(lockKey)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors" title={isLocked ? "Desbloquear Edição" : "Bloquear Edição"}>
                            {isLocked ? <LockClosedIcon className="w-5 h-5 text-red-400" /> : <LockOpenIcon className="w-5 h-5 text-green-400" />}
                        </button>
                    )}
                </div>
            </div>
        )
    };

    const SelectRow: React.FC<{ label: string, name: string, options: string[], lockKey?: keyof ConsultantPermissions }> = ({ label, name, options, lockKey }) => {
        const isLocked = lockKey ? formData.permissions[lockKey] : false;
        const value = getNestedValue(formData, name);
        return (
            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                <label htmlFor={name} className="text-sm font-medium text-gray-400">{label}</label>
                <div className="col-span-2 flex items-center gap-2">
                    <select id={name} name={name} value={value || ''} disabled={isLocked} onChange={e => handleChange(name, e.target.value)} className={baseInputClasses}>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {lockKey && (
                        <button onClick={() => handlePermissionToggle(lockKey)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors" title={isLocked ? "Desbloquear Edição" : "Bloquear Edição"}>
                            {isLocked ? <LockClosedIcon className="w-5 h-5 text-red-400" /> : <LockOpenIcon className="w-5 h-5 text-green-400" />}
                        </button>
                    )}
                </div>
            </div>
        )
    };

    const renderCadastro = () => (
        <div className="space-y-4 animate-fade-in">
            {/* Seção Dados Pessoais com ONE Lock */}
            <div className="relative border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-yellow-500">Dados Pessoais & Contato</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">{formData.permissions.personalDataLocked ? 'Bloqueado' : 'Editável'}</span>
                        <button onClick={() => handlePermissionToggle('personalDataLocked')} className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                            {formData.permissions.personalDataLocked ? <LockClosedIcon className="w-5 h-5 text-red-500" /> : <LockOpenIcon className="w-5 h-5 text-green-500" />}
                        </button>
                    </div>
                </div>
                <FormRow label="Nome Completo" name="name" lockKey="personalDataLocked" />
                <FormRow label="CPF/CNPJ" name="cpfCnpj" lockKey="personalDataLocked" />
                <FormRow label="Email" name="contact.email" type="email" lockKey="personalDataLocked" />
                <FormRow label="Telefone" name="contact.phone" lockKey="personalDataLocked" />
                <FormRow label="Rua" name="address.street" lockKey="personalDataLocked" />
                <FormRow label="Cidade" name="address.city" lockKey="personalDataLocked" />
                <FormRow label="Estado" name="address.state" lockKey="personalDataLocked" />
                <FormRow label="CEP" name="address.zip" lockKey="personalDataLocked" />
            </div>

            {/* Seção Dados Bancários com ONE Lock */}
            <div className="relative border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-yellow-500">Dados Bancários & PIX</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">{formData.permissions.bankDataLocked ? 'Bloqueado' : 'Editável'}</span>
                        <button onClick={() => handlePermissionToggle('bankDataLocked')} className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                            {formData.permissions.bankDataLocked ? <LockClosedIcon className="w-5 h-5 text-red-500" /> : <LockOpenIcon className="w-5 h-5 text-green-500" />}
                        </button>
                    </div>
                </div>
                <FormRow label="Banco" name="bankInfo.bank" lockKey="bankDataLocked" />
                <FormRow label="Agência" name="bankInfo.agency" lockKey="bankDataLocked" />
                <FormRow label="Conta" name="bankInfo.account" lockKey="bankDataLocked" />
                <SelectRow label="Tipo Chave PIX" name="bankInfo.pixType" options={['CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIA']} lockKey="bankDataLocked" />
                <FormRow label="Chave PIX" name="bankInfo.pixKey" lockKey="bankDataLocked" />
            </div>
        </div>
    );

    // Lista de PINs do Plano de Carreira Padrão (Unilevel/Matriz)
    const pinOptions = [
        'Iniciante',
        'Bronze', 'Prata', 'Ouro', 'Safira', 'Esmeralda', 'Topázio', 'Rubi',
        'Diamante', 'Blue Diamond', 'Black Diamond', 'Red Diamond', 'Crown Diamond', 'Royal Diamond', 'Imperial', 'Presidente'
    ];

    // Lista de PINs do Plano de Carreira Digital (Drop/Infoprodutos) - Fonte: populate_career_levels_digital.sql
    const digitalPinOptions = [
        'RS One Star',
        'RS Two Star',
        'RS Three Star',
        'RS Pro Star',
        'RS Prime Star',
        'RS Elite Star',
        'RS Legend Star'
    ];

    const renderNegocio = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Status na Rede</h3>
                <div className="alert alert-info bg-blue-900/20 text-blue-400 p-3 rounded-lg text-sm mb-4">
                    <strong>Nota:</strong> O PIN é calculado automaticamente pelo sistema. A edição manual deve ser feita apenas em casos excepcionais.
                </div>
                <SelectRow label="PIN Carreira (Padrão)" name="pin" options={pinOptions} />
                <SelectRow label="PIN Digital (Drop)" name="digitalPin" options={digitalPinOptions} />
                <FormRow label="Ciclo Atual" name="cycle" type="number" />
                <FormRow label="Rede Principal" name="network" />
            </div>

            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Estrutura da Rede</h3>
                <FormRow label="Indicados Diretos" name="networkDetails.directs" type="number" />
            </div>
        </div>
    );

    const renderFinanceiro = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Status Financeiro</h3>
                <FormRow label="Saldo Wallet (R$)" name="balance" type="number" />
                <SelectRow label="Status da Conta" name="status" options={['Ativo', 'Inativo', 'Pendente']} />
            </div>

            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Extrato da Wallet</h3>
                <div className="text-center text-gray-400 p-8 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                    <p>Visualização detalhada do extrato disponível no módulo Financeiro.</p>
                </div>
            </div>
        </div>
    );

    // Renderiza as novas permissões de sistema (Bonus Eligibility)
    const renderPermissoes = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-xl text-yellow-200 text-sm mb-4">
                <strong>Atenção:</strong> Estas permissões definem se o consultor está ELEGÍVEL para receber os respectivos bônus.
                Desmarcar uma opção impedirá o cálculo de comissões para aquele bônus específico.
            </div>

            <div className="grid grid-cols-1 gap-4">
                <PermissionRow label="Apto a Bônus de Ciclo" path="bonus_cycle" isLocked={!formData.permissions.bonus_cycle} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Apto a Bônus Fidelidade" path="bonus_fidelity" isLocked={!formData.permissions.bonus_fidelity} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Apto a Matriz Fidelidade" path="bonus_matrix_fidelity" isLocked={!formData.permissions.bonus_matrix_fidelity} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Apto a Bônus de Liderança" path="bonus_leadership" isLocked={!formData.permissions.bonus_leadership} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Apto a Bônus de Carreira (Prêmios)" path="bonus_career" isLocked={!formData.permissions.bonus_career} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Apto a Bônus Digital (Drop/Infoproduto)" path="bonus_digital" isLocked={!formData.permissions.bonus_digital} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
                <PermissionRow label="Acesso à Plataforma" path="access_platform" isLocked={!formData.permissions.access_platform} onToggle={(path) => handlePermissionToggle(path as keyof ConsultantPermissions)} />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 bg-gray-950/50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <img src={consultant?.avatar} alt={consultant?.name} className="w-12 h-12 rounded-full border-2 border-yellow-500" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{consultant?.name}</h2>
                            <p className="text-sm text-yellow-500 font-mono">{consultant?.pin} | ID: {consultant?.code || consultant?.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="border-b border-gray-700 px-4 flex-shrink-0 bg-gray-900">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide">
                        <TabButton tabId="cadastro" label="Dados Cadastrais" />
                        <TabButton tabId="negocio" label="Dados de Negócio" />
                        <TabButton tabId="financeiro" label="Financeiro" />
                        <TabButton tabId="permissoes" label="Permissões & Bônus" />
                        <TabButton tabId="seguranca" label="Segurança" />
                    </nav>
                </div>

                <main className="p-6 overflow-y-auto flex-grow bg-gray-900 custom-scrollbar">
                    {activeTab === 'cadastro' && renderCadastro()}
                    {activeTab === 'negocio' && renderNegocio()}
                    {activeTab === 'financeiro' && renderFinanceiro()}
                    {activeTab === 'permissoes' && renderPermissoes()}
                    {activeTab === 'seguranca' && <SecurityTab />}
                </main>

                <footer className="p-4 bg-gray-950/50 border-t border-gray-700 flex justify-end space-x-3 rounded-b-2xl flex-shrink-0">
                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Restaurar Original</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};

export default ConsultantDetailModal;