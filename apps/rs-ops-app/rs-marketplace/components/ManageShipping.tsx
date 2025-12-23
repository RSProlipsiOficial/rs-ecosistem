import React, { useState, useEffect } from 'react';
import { ShippingSettings, View } from '../types';
import { ToggleSwitch } from './ToggleSwitch';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface ManageShippingProps {
  settings: ShippingSettings;
  onSave: (newSettings: ShippingSettings) => void;
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

const ManageShipping: React.FC<ManageShippingProps> = ({ settings, onSave, onNavigate }) => {
    const [localSettings, setLocalSettings] = useState<ShippingSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [gateway, field] = name.split('.');
        setLocalSettings(prev => ({
            ...prev,
            [gateway]: {
                ...prev[gateway as keyof ShippingSettings],
                [field]: value
            }
        }));
        setHasChanges(true);
    };
    
    const handleToggleChange = (gateway: keyof ShippingSettings, enabled: boolean) => {
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
                {/* Frenet */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Frenet</h3>
                        <ToggleSwitch checked={localSettings.frenet.enabled} onChange={(c) => handleToggleChange('frenet', c)} labelId="frenet-toggle" />
                    </div>
                    {localSettings.frenet.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="frenet-apiKey" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <PasswordInput id="frenet-apiKey" name="frenet.apiKey" value={localSettings.frenet.apiKey} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="frenet-apiSecret" className="block text-sm font-medium text-gray-400 mb-2">API Secret</label>
                                <PasswordInput id="frenet-apiSecret" name="frenet.apiSecret" value={localSettings.frenet.apiSecret} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Melhor Envio */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Melhor Envio</h3>
                        <ToggleSwitch checked={localSettings.melhorEnvio.enabled} onChange={(c) => handleToggleChange('melhorEnvio', c)} labelId="melhor-envio-toggle" />
                    </div>
                    {localSettings.melhorEnvio.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="melhor-envio-token" className="block text-sm font-medium text-gray-400 mb-2">API Token</label>
                                <PasswordInput id="melhor-envio-token" name="melhorEnvio.apiToken" value={localSettings.melhorEnvio.apiToken} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Correios */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Correios</h3>
                        <ToggleSwitch checked={localSettings.correios.enabled} onChange={(c) => handleToggleChange('correios', c)} labelId="correios-toggle" />
                    </div>
                    {localSettings.correios.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="correios-contrato" className="block text-sm font-medium text-gray-400 mb-2">Código do Contrato</label>
                                <input id="correios-contrato" name="correios.contrato" value={localSettings.correios.contrato} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500"/>
                            </div>
                             <div>
                                <label htmlFor="correios-senha" className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                                <PasswordInput id="correios-senha" name="correios.senha" value={localSettings.correios.senha} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* SuperFrete */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">SuperFrete</h3>
                        <ToggleSwitch checked={localSettings.superFrete.enabled} onChange={(c) => handleToggleChange('superFrete', c)} labelId="superfrete-toggle" />
                    </div>
                    {localSettings.superFrete.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="superfrete-token" className="block text-sm font-medium text-gray-400 mb-2">API Token</label>
                                <PasswordInput id="superfrete-token" name="superFrete.apiToken" value={localSettings.superFrete.apiToken} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Jadlog */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Jadlog</h3>
                        <ToggleSwitch checked={localSettings.jadlog.enabled} onChange={(c) => handleToggleChange('jadlog', c)} labelId="jadlog-toggle" />
                    </div>
                    {localSettings.jadlog.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="jadlog-token" className="block text-sm font-medium text-gray-400 mb-2">API Token</label>
                                <PasswordInput id="jadlog-token" name="jadlog.apiToken" value={localSettings.jadlog.apiToken} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Loggi */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Loggi</h3>
                        <ToggleSwitch checked={localSettings.loggi.enabled} onChange={(c) => handleToggleChange('loggi', c)} labelId="loggi-toggle" />
                    </div>
                    {localSettings.loggi.enabled && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="loggi-apiKey" className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <PasswordInput id="loggi-apiKey" name="loggi.apiKey" value={localSettings.loggi.apiKey} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageShipping;