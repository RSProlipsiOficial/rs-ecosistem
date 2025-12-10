import React, { useState, useEffect } from 'react';
import { walletAPI } from '../../src/services/api';
import { CogIcon, PuzzlePieceIcon, ScaleIcon, CalendarDaysIcon, UsersIcon, DocumentPlusIcon } from '../icons';

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; }> = ({ title, icon, children, footer }) => (
    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <header className="flex items-center p-4 bg-black/30 border-b border-gray-800">
            {icon}
            <h2 className="text-xl font-semibold text-white ml-3">{title}</h2>
        </header>
        <div className="p-6">{children}</div>
        {footer && <footer className="p-4 bg-black/30 border-t border-gray-800 flex justify-end">{footer}</footer>}
    </div>
);

const SettingsRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 py-4 border-b border-gray-800 last:border-b-0">
        <div>
            <label className="text-sm font-medium text-gray-300">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2 relative flex items-center">
            {children}
        </div>
    </div>
);

const SettingsInput: React.FC<{name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, adornment?: string}> = 
({ name, value, onChange, type = 'text', adornment }) => (
    <div className="relative w-full">
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-12" />
        {adornment && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">{adornment}</span>}
    </div>
);

const SettingsToggle: React.FC<{name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" id={name} name={name} className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

// --- NEW GATEWAY CONFIG ---
interface GatewayField { key: string; label: string; type: 'text' | 'password'; }
interface Gateway {
    id: string;
    name: string;
    fields: GatewayField[];
    enabled: boolean;
    data: Record<string, string>;
}

const initialGateways: Gateway[] = [
    { id: 'mercadopago', name: 'Mercado Pago', fields: [{ key: 'accessToken', label: 'Access Token', type: 'password' }], enabled: true, data: { accessToken: 'APP_USR-xxxxxx-xxxxxx-xxxxxx' } },
    { id: 'stone', name: 'Stone', fields: [{ key: 'apiKey', label: 'Chave da API', type: 'password' }], enabled: false, data: { apiKey: '' } },
    { id: 'pagseguro', name: 'PagSeguro', fields: [{ key: 'email', label: 'Email', type: 'text' }, { key: 'token', label: 'Token', type: 'password' }], enabled: false, data: { email: '', token: '' } },
    { id: 'stripe', name: 'Stripe', fields: [{ key: 'publicKey', label: 'Chave Pública', type: 'text' }, { key: 'secretKey', label: 'Chave Secreta', type: 'password' }], enabled: false, data: { publicKey: '', secretKey: '' } },
    { id: 'paypal', name: 'PayPal', fields: [{ key: 'clientId', label: 'Client ID', type: 'text' }, { key: 'clientSecret', label: 'Client Secret', type: 'password' }], enabled: false, data: { clientId: '', clientSecret: '' } },
];
// --- END NEW GATEWAY CONFIG ---


const WalletSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { loadConfig(); }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const res = await walletAPI.getWalletConfig();
            if (res?.data?.success) {
                // Atualizar config
            }
        } catch (err) {
            setError('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const [config, setConfig] = useState({
        // Withdrawal Rules
        withdrawalFee: 5.00,
        minWithdrawalAmount: 50.00,
        dailyWithdrawalLimit: 5000,
        monthlyWithdrawalLimit: 20000,
        // Schedule
        withdrawalDays: ['Sexta-feira'],
        startTime: '09:00',
        cutoffTime: '12:00',
        paymentDay: 'Sexta-feira',
        // Internal Transfers
        internalTransferFee: 0,
        minInternalTransferAmount: 10.00,
        dailyInternalTransferLimit: 1000,
        // Billing
        autoBillMonthlyFee: true,
        monthlyFeeAmount: 60.00,
    });

    const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
    
    const handleGatewayToggle = (id: string) => {
        setGateways(gateways.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
    };

    const handleGatewayDataChange = (id: string, key: string, value: string) => {
        setGateways(gateways.map(g => g.id === id ? { ...g, data: { ...g.data, [key]: value } } : g));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

     const handleDayChange = (day: string) => {
        setSettings(prev => {
            const newDays = prev.withdrawalDays.includes(day)
                ? prev.withdrawalDays.filter(d => d !== day)
                : [...prev.withdrawalDays, day];
            return { ...prev, withdrawalDays: newDays };
        });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <CogIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Configurações - WalletPay</h1>
            </header>

            <SettingsCard
                title="Regras de Saque"
                icon={<ScaleIcon className="w-6 h-6 text-yellow-500" />}
            >
                <SettingsRow label="Taxa de Saque (PIX/TED)" description="Valor fixo cobrado por cada solicitação de saque externo."><SettingsInput name="withdrawalFee" value={settings.withdrawalFee} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
                <SettingsRow label="Valor Mínimo para Saque" description="Valor mínimo que um consultor pode solicitar para saque."><SettingsInput name="minWithdrawalAmount" value={settings.minWithdrawalAmount} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
                <SettingsRow label="Limite de Saque Diário" description="Valor máximo que um consultor pode sacar por dia."><SettingsInput name="dailyWithdrawalLimit" value={settings.dailyWithdrawalLimit} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
                <SettingsRow label="Limite de Saque Mensal" description="Valor máximo que um consultor pode sacar por mês."><SettingsInput name="monthlyWithdrawalLimit" value={settings.monthlyWithdrawalLimit} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
            </SettingsCard>
            
            <SettingsCard
                title="Janela de Solicitação e Pagamento"
                icon={<CalendarDaysIcon className="w-6 h-6 text-yellow-500" />}
            >
                <SettingsRow label="Dias para Solicitação" description="Selecione os dias da semana em que os consultores podem pedir saques.">
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs w-full">
                        {weekdays.map(day => (
                            <button key={day} onClick={() => handleDayChange(day)} className={`p-2 rounded-lg border transition-colors ${settings.withdrawalDays.includes(day) ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'bg-gray-800 border-gray-700 hover:border-yellow-500/50'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </SettingsRow>
                <SettingsRow label="Horário para Solicitação" description="Período do dia em que as solicitações são aceitas.">
                    <div className="flex items-center gap-2 w-full">
                       <input type="time" name="startTime" value={settings.startTime} onChange={handleChange} className={baseInputClasses} />
                       <span className="text-gray-400">até</span>
                       <input type="time" name="cutoffTime" value={settings.cutoffTime} onChange={handleChange} className={baseInputClasses} />
                    </div>
                </SettingsRow>
                <SettingsRow label="Dia de Pagamento" description="Dia da semana em que os pagamentos de saques são processados.">
                     <select name="paymentDay" value={settings.paymentDay} onChange={handleChange} className={baseInputClasses}>
                       {weekdays.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                </SettingsRow>
            </SettingsCard>
            
             <SettingsCard title="Regras de Transferência Interna" icon={<UsersIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Taxa de Transferência Interna" description="Taxa para transferências entre consultores. Deixe 0 para ser isento."><SettingsInput name="internalTransferFee" value={settings.internalTransferFee} onChange={handleChange} type="number" adornment="%" /></SettingsRow>
                <SettingsRow label="Valor Mínimo para Transferência" description="Menor valor que pode ser transferido entre consultores."><SettingsInput name="minInternalTransferAmount" value={settings.minInternalTransferAmount} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
                <SettingsRow label="Limite de Transferência Diário" description="Valor máximo que um consultor pode transferir por dia."><SettingsInput name="dailyInternalTransferLimit" value={settings.dailyInternalTransferLimit} onChange={handleChange} type="number" adornment="R$" /></SettingsRow>
            </SettingsCard>

            <SettingsCard title="Configurações de Cobrança" icon={<DocumentPlusIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Gerar Cobrança de Mensalidade" description="Ative para criar automaticamente faturas mensais para consultores ativos.">
                    <SettingsToggle name="autoBillMonthlyFee" checked={settings.autoBillMonthlyFee} onChange={handleChange} />
                </SettingsRow>
                {settings.autoBillMonthlyFee && (
                    <SettingsRow label="Valor da Mensalidade" description="Valor a ser cobrado mensalmente de cada consultor.">
                        <SettingsInput name="monthlyFeeAmount" value={settings.monthlyFeeAmount} onChange={handleChange} type="number" adornment="R$" />
                    </SettingsRow>
                )}
            </SettingsCard>

            <SettingsCard title="Gateways de Pagamento" icon={<PuzzlePieceIcon className="w-6 h-6 text-yellow-500" />}>
                <div className="space-y-6">
                    {gateways.map(gateway => (
                        <div key={gateway.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-white">{gateway.name}</span>
                                <SettingsToggle name={gateway.id} checked={gateway.enabled} onChange={() => handleGatewayToggle(gateway.id)} />
                            </div>
                             {gateway.enabled && (
                                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                                    {gateway.fields.map(field => (
                                         <div key={field.key}>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                                            <input 
                                                type={field.type} 
                                                value={gateway.data[field.key]} 
                                                onChange={(e) => handleGatewayDataChange(gateway.id, field.key, e.target.value)} 
                                                className={baseInputClasses} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SettingsCard>
            
            <div className="flex justify-end pt-2">
                 <button className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors text-lg">
                    Salvar Todas as Configurações
                </button>
            </div>
        </div>
    );
};

export default WalletSettingsPage;