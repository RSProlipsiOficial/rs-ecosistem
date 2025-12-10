import React, { useState, useEffect, useRef } from 'react';
import { useIntegrations } from '../../context/IntegrationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { IntegrationsSettings } from '../../types';

const IntegrationsTab: React.FC = () => {
    const { settings, updateSettings } = useIntegrations();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<IntegrationsSettings>(settings);

    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(settings) !== JSON.stringify(formData);
    }, [formData, settings]);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (field: keyof IntegrationsSettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        alert(t('admin_integrations_saved_success'));
    };
    
    const paymentFields: { key: keyof IntegrationsSettings; labelKey: string }[] = [
        { key: 'mercadoPago', labelKey: 'admin_key_mercado_pago' },
        { key: 'adyen', labelKey: 'admin_key_adyen' },
        { key: 'stripe', labelKey: 'admin_key_stripe' },
        { key: 'pagSeguro', labelKey: 'admin_key_pagseguro' },
        { key: 'stone', labelKey: 'admin_key_stone' },
        { key: 'asaas', labelKey: 'admin_key_asaas' },
    ];
    
    const shippingFields: { key: keyof IntegrationsSettings; labelKey: string }[] = [
        { key: 'melhorEnvio', labelKey: 'admin_key_melhor_envio' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-accent">{t('admin_integrations_title')}</h2>
            <p className="text-text-secondary mt-1 mb-6">{t('admin_integrations_desc')}</p>
            <form onSubmit={handleSave} className="space-y-8">
                 <div>
                    <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{t('admin_payment_gateways')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {paymentFields.map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium text-text-secondary mb-1">{t(field.labelKey)}</label>
                                <input type="password" value={formData[field.key]} onChange={e => handleChange(field.key, e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{t('admin_shipping_integrations')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {shippingFields.map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium text-text-secondary mb-1">{t(field.labelKey)}</label>
                                <input type="password" value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/30">
                    <h4 className="font-semibold text-yellow-400">{t('admin_api_keys_note_title')}</h4>
                    <p className="text-sm text-yellow-200/80 mt-1">{t('admin_api_keys_note_desc')}</p>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>Salvar</button>
                </div>
            </form>
        </div>
    );
};

export default IntegrationsTab;