import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import {
    CogIcon,
    CreditCardIcon,
    TruckIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    SpinnerIcon,
    EyeIcon,
    EyeSlashIcon
} from '../icons';

interface MarketplaceConfig {
    // PIX
    pix: {
        enabled: boolean;
        key: string;
        keyType: 'email' | 'phone' | 'cpf' | 'cnpj' | 'random';
        merchantName: string;
        merchantCity: string;
    };

    // Mercado Pago
    mercadoPago: {
        enabled: boolean;
        accessToken: string;
        publicKey: string;
        webhookUrl: string;
        environment: 'sandbox' | 'production';
    };

    // Correios (Frete)
    correios: {
        enabled: boolean;
        contractCode: string;
        contractPassword: string;
        adminCode: string;
        originZipCode: string;
        services: {
            sedex: boolean;
            pac: boolean;
            sedex10: boolean;
            sedexHoje: boolean;
        };
    };

    // PayPal
    paypal: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
        webhookId: string;
        environment: 'sandbox' | 'production';
    };

    // Stripe
    stripe: {
        enabled: boolean;
        publishableKey: string;
        secretKey: string;
        webhookSecret: string;
    };

    // Configurações Gerais
    general: {
        currency: string;
        taxRate: number;
        minOrderValue: number;
        freeShippingThreshold: number;
        autoApproveOrders: boolean;
    };
}

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";
const baseLabelClasses = "block mb-2 text-sm font-medium text-gray-300";

const MarketplaceSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    const [config, setConfig] = useState<MarketplaceConfig>({
        pix: {
            enabled: false,
            key: '',
            keyType: 'email',
            merchantName: 'RS Prólipsi',
            merchantCity: 'São Paulo',
        },
        mercadoPago: {
            enabled: false,
            accessToken: '',
            publicKey: '',
            webhookUrl: 'https://api.rsprolipsi.com.br/webhooks/mercadopago',
            environment: 'production',
        },
        correios: {
            enabled: false,
            contractCode: '',
            contractPassword: '',
            adminCode: '',
            originZipCode: '',
            services: {
                sedex: true,
                pac: true,
                sedex10: false,
                sedexHoje: false,
            },
        },
        paypal: {
            enabled: false,
            clientId: '',
            clientSecret: '',
            webhookId: '',
            environment: 'production',
        },
        stripe: {
            enabled: false,
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
        },
        general: {
            currency: 'BRL',
            taxRate: 0,
            minOrderValue: 0,
            freeShippingThreshold: 15000,
            autoApproveOrders: false,
        },
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await marketplaceAPI.getMarketplaceConfig();
            // [RS-MAPPING] Nested data support
            const responseData = res.data?.data || res.data;
            if (responseData?.config) {
                setConfig(responseData.config);
            }
        } catch (err) {
            console.error('Erro ao carregar:', err);
            setError('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            await marketplaceAPI.updateMarketplaceConfig(config);

            setSuccess('✅ Configurações salvas com sucesso!');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (field: string) => {
        setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const updateConfig = (section: keyof MarketplaceConfig, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const updateNestedConfig = (section: keyof MarketplaceConfig, subSection: string, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...(prev[section] as any)[subSection],
                    [field]: value,
                },
            },
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <SpinnerIcon className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <CogIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Configurações do Marketplace</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-yellow-500 text-black font-bold py-2.5 px-6 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {saving ? (
                        <><SpinnerIcon className="w-5 h-5 animate-spin" /> Salvando...</>
                    ) : (
                        <><CheckCircleIcon className="w-5 h-5" /> Salvar Configurações</>
                    )}
                </button>
            </header>

            {/* Mensagens de Feedback */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                    <span className="text-red-400">{error}</span>
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-green-400">{success}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* ========== PIX ========== */}
                <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <CreditCardIcon className="w-6 h-6 text-green-500" />
                            <h2 className="text-xl font-bold text-white">PIX</h2>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.pix.enabled}
                                onChange={(e) => updateConfig('pix', 'enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            <span className="ml-3 text-sm font-medium text-gray-300">Ativar PIX</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={baseLabelClasses}>Tipo de Chave PIX</label>
                            <select
                                value={config.pix.keyType}
                                onChange={(e) => updateConfig('pix', 'keyType', e.target.value)}
                                className={baseInputClasses}
                                disabled={!config.pix.enabled}
                            >
                                <option value="email">E-mail</option>
                                <option value="phone">Telefone</option>
                                <option value="cpf">CPF</option>
                                <option value="cnpj">CNPJ</option>
                                <option value="random">Chave Aleatória</option>
                            </select>
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Chave PIX</label>
                            <input
                                type="text"
                                value={config.pix.key}
                                onChange={(e) => updateConfig('pix', 'key', e.target.value)}
                                placeholder="exemplo@email.com"
                                className={baseInputClasses}
                                disabled={!config.pix.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Nome do Beneficiário</label>
                            <input
                                type="text"
                                value={config.pix.merchantName}
                                onChange={(e) => updateConfig('pix', 'merchantName', e.target.value)}
                                placeholder="RS Prólipsi"
                                className={baseInputClasses}
                                disabled={!config.pix.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Cidade</label>
                            <input
                                type="text"
                                value={config.pix.merchantCity}
                                onChange={(e) => updateConfig('pix', 'merchantCity', e.target.value)}
                                placeholder="São Paulo"
                                className={baseInputClasses}
                                disabled={!config.pix.enabled}
                            />
                        </div>
                    </div>
                </section>

                {/* ========== MERCADO PAGO ========== */}
                <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <CreditCardIcon className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-bold text-white">Mercado Pago</h2>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.mercadoPago.enabled}
                                onChange={(e) => updateConfig('mercadoPago', 'enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            <span className="ml-3 text-sm font-medium text-gray-300">Ativar Mercado Pago</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={baseLabelClasses}>Access Token (Private)</label>
                            <div className="relative">
                                <input
                                    type={showSecrets.mpAccessToken ? 'text' : 'password'}
                                    value={config.mercadoPago.accessToken}
                                    onChange={(e) => updateConfig('mercadoPago', 'accessToken', e.target.value)}
                                    placeholder="APP_USR-xxxxx-xxxxxx-xxxxx-xxxxx"
                                    className={baseInputClasses + ' pr-10'}
                                    disabled={!config.mercadoPago.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('mpAccessToken')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showSecrets.mpAccessToken ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Public Key</label>
                            <input
                                type="text"
                                value={config.mercadoPago.publicKey}
                                onChange={(e) => updateConfig('mercadoPago', 'publicKey', e.target.value)}
                                placeholder="APP_USR-xxxxx-xxxxxx"
                                className={baseInputClasses}
                                disabled={!config.mercadoPago.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Webhook URL</label>
                            <input
                                type="url"
                                value={config.mercadoPago.webhookUrl}
                                onChange={(e) => updateConfig('mercadoPago', 'webhookUrl', e.target.value)}
                                placeholder="https://api.rsprolipsi.com.br/webhooks/mercadopago"
                                className={baseInputClasses}
                                disabled={!config.mercadoPago.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Ambiente</label>
                            <select
                                value={config.mercadoPago.environment}
                                onChange={(e) => updateConfig('mercadoPago', 'environment', e.target.value)}
                                className={baseInputClasses}
                                disabled={!config.mercadoPago.enabled}
                            >
                                <option value="sandbox">Sandbox (Testes)</option>
                                <option value="production">Produção</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* ========== CORREIOS ========== */}
                <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <TruckIcon className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-xl font-bold text-white">Correios (Cálculo de Frete)</h2>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.correios.enabled}
                                onChange={(e) => updateConfig('correios', 'enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            <span className="ml-3 text-sm font-medium text-gray-300">Ativar Correios</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={baseLabelClasses}>Código do Contrato</label>
                            <input
                                type="text"
                                value={config.correios.contractCode}
                                onChange={(e) => updateConfig('correios', 'contractCode', e.target.value)}
                                placeholder="9912345678"
                                className={baseInputClasses}
                                disabled={!config.correios.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Senha do Contrato</label>
                            <div className="relative">
                                <input
                                    type={showSecrets.correiosPassword ? 'text' : 'password'}
                                    value={config.correios.contractPassword}
                                    onChange={(e) => updateConfig('correios', 'contractPassword', e.target.value)}
                                    placeholder="••••••••"
                                    className={baseInputClasses + ' pr-10'}
                                    disabled={!config.correios.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('correiosPassword')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showSecrets.correiosPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Código Administrativo</label>
                            <input
                                type="text"
                                value={config.correios.adminCode}
                                onChange={(e) => updateConfig('correios', 'adminCode', e.target.value)}
                                placeholder="12345678"
                                className={baseInputClasses}
                                disabled={!config.correios.enabled}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>CEP de Origem</label>
                            <input
                                type="text"
                                value={config.correios.originZipCode}
                                onChange={(e) => updateConfig('correios', 'originZipCode', e.target.value)}
                                placeholder="01310-100"
                                className={baseInputClasses}
                                disabled={!config.correios.enabled}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <label className="block mb-3 text-sm font-medium text-gray-300">Serviços Disponíveis</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries({
                                sedex: 'SEDEX',
                                pac: 'PAC',
                                sedex10: 'SEDEX 10',
                                sedexHoje: 'SEDEX Hoje',
                            }).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.correios.services[key as keyof typeof config.correios.services]}
                                        onChange={(e) => updateNestedConfig('correios', 'services', key, e.target.checked)}
                                        disabled={!config.correios.enabled}
                                        className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-gray-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== CONFIGURAÇÕES GERAIS ========== */}
                <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CogIcon className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={baseLabelClasses}>Moeda</label>
                            <select
                                value={config.general.currency}
                                onChange={(e) => updateConfig('general', 'currency', e.target.value)}
                                className={baseInputClasses}
                            >
                                <option value="BRL">Real Brasileiro (BRL)</option>
                                <option value="USD">Dólar Americano (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                            </select>
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Taxa de Serviço (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.general.taxRate}
                                onChange={(e) => updateConfig('general', 'taxRate', parseFloat(e.target.value))}
                                placeholder="0.00"
                                className={baseInputClasses}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Valor Mínimo de Pedido (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.general.minOrderValue / 100}
                                onChange={(e) => updateConfig('general', 'minOrderValue', parseFloat(e.target.value) * 100)}
                                placeholder="0.00"
                                className={baseInputClasses}
                            />
                        </div>

                        <div>
                            <label className={baseLabelClasses}>Frete Grátis Acima de (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.general.freeShippingThreshold / 100}
                                onChange={(e) => updateConfig('general', 'freeShippingThreshold', parseFloat(e.target.value) * 100)}
                                placeholder="150.00"
                                className={baseInputClasses}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.general.autoApproveOrders}
                                    onChange={(e) => updateConfig('general', 'autoApproveOrders', e.target.checked)}
                                    className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                                />
                                <span className="text-sm text-gray-300">Aprovar pedidos automaticamente após pagamento</span>
                            </label>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer com botão de salvar novamente */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {saving ? (
                        <><SpinnerIcon className="w-5 h-5 animate-spin" /> Salvando...</>
                    ) : (
                        <><CheckCircleIcon className="w-5 h-5" /> Salvar Todas as Configurações</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MarketplaceSettingsPage;
