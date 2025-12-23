import React, { useState, useEffect } from 'react';
import { PaymentSettings, View, PixKeyType } from '../types';
import { ToggleSwitch } from './ToggleSwitch';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface ManagePaymentsProps {
  settings: PaymentSettings;
  onSave: (newSettings: PaymentSettings) => void;
  onNavigate: (view: View) => void;
}

const PasswordInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; id: string; placeholder?: string }> = ({ value, onChange, name, id, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 pr-10 text-white focus:outline-none focus:border-gold-500"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gold-400"
                aria-label={show ? "Esconder" : "Mostrar"}
            >
                {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
        </div>
    );
};

const ManagePayments: React.FC<ManagePaymentsProps> = ({ settings, onSave, onNavigate }) => {
    const [localSettings, setLocalSettings] = useState<PaymentSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const [gateway, field] = name.split('.');
        setLocalSettings(prev => ({
            ...prev,
            [gateway]: {
                ...prev[gateway as keyof PaymentSettings],
                [field]: value
            }
        }));
        setHasChanges(true);
    };
    
    const handleToggleChange = (gateway: keyof PaymentSettings, enabled: boolean) => {
        setLocalSettings(prev => ({
            ...prev,
            [gateway]: {
                ...prev[gateway],
                enabled
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onSave(localSettings);
        setHasChanges(false);
    };

    const handleDiscard = () => {
        setLocalSettings(settings);
        setHasChanges(false);
    };
    
    const pixKeyTypes: PixKeyType[] = ['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Chave Aleatória'];

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-dark-800">
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-gold-400 mr-4">Você tem alterações não salvas.</p>}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Mercado Pago */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Mercado Pago</h3>
                        <ToggleSwitch checked={localSettings.mercadoPago.enabled} onChange={(c) => handleToggleChange('mercadoPago', c)} labelId="mp-toggle" />
                    </div>
                    {localSettings.mercadoPago.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="mp-public-key" className="block text-sm font-medium text-gray-400 mb-2">Public Key</label>
                                <PasswordInput id="mp-public-key" name="mercadoPago.publicKey" value={localSettings.mercadoPago.publicKey} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="mp-access-token" className="block text-sm font-medium text-gray-400 mb-2">Access Token</label>
                                <PasswordInput id="mp-access-token" name="mercadoPago.accessToken" value={localSettings.mercadoPago.accessToken} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* PagSeguro */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">PagSeguro</h3>
                        <ToggleSwitch checked={localSettings.pagSeguro.enabled} onChange={(c) => handleToggleChange('pagSeguro', c)} labelId="ps-toggle" />
                    </div>
                    {localSettings.pagSeguro.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="ps-email" className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
                                <input type="email" id="ps-email" name="pagSeguro.email" value={localSettings.pagSeguro.email} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500" />
                            </div>
                            <div>
                                <label htmlFor="ps-token" className="block text-sm font-medium text-gray-400 mb-2">Token</label>
                                <PasswordInput id="ps-token" name="pagSeguro.token" value={localSettings.pagSeguro.token} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* PIX */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">PIX</h3>
                        <ToggleSwitch checked={localSettings.pix.enabled} onChange={(c) => handleToggleChange('pix', c)} labelId="pix-toggle" />
                    </div>
                     {localSettings.pix.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="pix-key-type" className="block text-sm font-medium text-gray-400 mb-2">Tipo de Chave</label>
                                <select id="pix-key-type" name="pix.pixKeyType" value={localSettings.pix.pixKeyType} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500">
                                    {pixKeyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pix-key" className="block text-sm font-medium text-gray-400 mb-2">Chave PIX</label>
                                <input type="text" id="pix-key" name="pix.pixKey" value={localSettings.pix.pixKey} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500" />
                            </div>
                        </div>
                    )}
                </div>

                 {/* AppMax */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">AppMax</h3>
                        <ToggleSwitch checked={localSettings.appmax.enabled} onChange={(c) => handleToggleChange('appmax', c)} labelId="appmax-toggle" />
                    </div>
                    {localSettings.appmax.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="appmax-api-key" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <PasswordInput id="appmax-api-key" name="appmax.apiKey" value={localSettings.appmax.apiKey} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                 {/* Asaas */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Asaas</h3>
                        <ToggleSwitch checked={localSettings.asaas.enabled} onChange={(c) => handleToggleChange('asaas', c)} labelId="asaas-toggle" />
                    </div>
                    {localSettings.asaas.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="asaas-api-key" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <PasswordInput id="asaas-api-key" name="asaas.apiKey" value={localSettings.asaas.apiKey} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagar.me */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Pagar.me</h3>
                        <ToggleSwitch checked={localSettings.pagarme.enabled} onChange={(c) => handleToggleChange('pagarme', c)} labelId="pagarme-toggle" />
                    </div>
                    {localSettings.pagarme.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="pagarme-api-key" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <PasswordInput id="pagarme-api-key" name="pagarme.apiKey" value={localSettings.pagarme.apiKey} onChange={handleInputChange} />
                            </div>
                             <div>
                                <label htmlFor="pagarme-encryption-key" className="block text-sm font-medium text-gray-400 mb-2">Encryption Key</label>
                                <PasswordInput id="pagarme-encryption-key" name="pagarme.encryptionKey" value={localSettings.pagarme.encryptionKey} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Stripe */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Stripe</h3>
                        <ToggleSwitch checked={localSettings.stripe.enabled} onChange={(c) => handleToggleChange('stripe', c)} labelId="stripe-toggle" />
                    </div>
                    {localSettings.stripe.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="stripe-publishable-key" className="block text-sm font-medium text-gray-400 mb-2">Publishable Key</label>
                                <PasswordInput id="stripe-publishable-key" name="stripe.publishableKey" value={localSettings.stripe.publishableKey} onChange={handleInputChange} />
                            </div>
                             <div>
                                <label htmlFor="stripe-secret-key" className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
                                <PasswordInput id="stripe-secret-key" name="stripe.secretKey" value={localSettings.stripe.secretKey} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManagePayments;