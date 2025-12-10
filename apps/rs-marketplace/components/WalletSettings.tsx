
import React, { useState, useEffect } from 'react';
import { WalletSettings, TransferFrequency, PaymentSettings, View } from '../types';
import { ToggleSwitch } from './ToggleSwitch';

interface WalletSettingsProps {
  settings: WalletSettings;
  onSave: (newSettings: WalletSettings) => void;
  paymentSettings: PaymentSettings;
  onNavigate: (view: View) => void;
}

const WalletSettingsComponent: React.FC<WalletSettingsProps> = ({ settings, onSave, paymentSettings, onNavigate }) => {
  const [localSettings, setLocalSettings] = useState<WalletSettings>(settings);
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleChange = (section: keyof WalletSettings, field: string, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof WalletSettings] as any),
        [field]: field === 'frequency' ? value : Number(value),
      },
    }));
  };

  const handleSave = () => onSave(localSettings);
  const handleDiscard = () => setLocalSettings(settings);
  
  const frequencyOptions: TransferFrequency[] = ['Diário', 'Semanal', 'Mensal'];
  const dayOfWeekOptions = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  return (
    <div className="space-y-6">
        <div className="pb-6 mb-6 flex justify-end items-center border-b border-dark-800">
            <div className="flex items-center gap-4">
                {hasChanges && <p className="text-sm text-gold-400">Você tem alterações não salvas.</p>}
                <button onClick={handleDiscard} disabled={!hasChanges} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50">Descartar</button>
                <button onClick={handleSave} disabled={!hasChanges} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50">Salvar Configurações</button>
            </div>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Payout Methods */}
            <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Métodos de Recebimento</h3>
                <p className="text-sm text-gray-400">Esta é a chave PIX para onde suas transferências serão enviadas. Você pode gerenciá-la nas configurações de pagamento da loja.</p>
                {paymentSettings.pix.enabled && paymentSettings.pix.pixKey ? (
                    <div className="bg-dark-800/50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-300">Chave PIX Ativa ({paymentSettings.pix.pixKeyType})</p>
                            <p className="font-mono text-white">{paymentSettings.pix.pixKey}</p>
                        </div>
                        <button onClick={() => onNavigate('managePayments')} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                            Gerenciar
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-dark-800/50 rounded-md border border-dashed border-dark-700">
                        <p className="text-gray-400">Nenhuma chave PIX configurada.</p>
                        <button onClick={() => onNavigate('managePayments')} className="text-sm font-semibold text-gold-500 hover:underline mt-2">
                            Configurar Chave PIX
                        </button>
                    </div>
                )}
            </div>
            
            {/* Automatic Transfers */}
            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Transferências Automáticas</h3>
                    <ToggleSwitch checked={localSettings.automaticTransfers.enabled} onChange={c => handleToggleChange('automaticTransfers', 'enabled', c)} labelId="auto-transfer-toggle" />
                </div>
                {localSettings.automaticTransfers.enabled && (
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-400 mb-2">Frequência</label>
                                <select id="frequency" name="automaticTransfers.frequency" value={localSettings.automaticTransfers.frequency} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                                    {frequencyOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                             {localSettings.automaticTransfers.frequency === 'Semanal' && (
                                <div>
                                    <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-400 mb-2">Dia da Semana</label>
                                    <select id="dayOfWeek" name="automaticTransfers.dayOfWeek" value={localSettings.automaticTransfers.dayOfWeek} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                                        {dayOfWeekOptions.map((day, i) => <option key={i} value={i}>{day}</option>)}
                                    </select>
                                </div>
                            )}
                             {localSettings.automaticTransfers.frequency === 'Mensal' && (
                                <div>
                                    <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-400 mb-2">Dia do Mês</label>
                                    <input type="number" id="dayOfMonth" name="automaticTransfers.dayOfMonth" value={localSettings.automaticTransfers.dayOfMonth} onChange={handleInputChange} min="1" max="31" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="minimumAmount" className="block text-sm font-medium text-gray-400 mb-2">Valor Mínimo para Transferência</label>
                            <input type="number" id="minimumAmount" name="automaticTransfers.minimumAmount" value={localSettings.automaticTransfers.minimumAmount} placeholder="R$ 100,00" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
             <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Notificações por E-mail</h3>
                <div className="flex items-center justify-between">
                    <label htmlFor="notif-commission" className="text-sm text-gray-300">Receber e-mail ao ganhar nova comissão</label>
                    <ToggleSwitch checked={localSettings.notifications.onNewCommission} onChange={c => handleToggleChange('notifications', 'onNewCommission', c)} labelId="notif-commission" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="notif-success" className="text-sm text-gray-300">Receber e-mail quando uma transferência for concluída</label>
                    <ToggleSwitch checked={localSettings.notifications.onTransferSuccess} onChange={c => handleToggleChange('notifications', 'onTransferSuccess', c)} labelId="notif-success" />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="notif-fail" className="text-sm text-gray-300">Receber e-mail se uma transferência falhar</label>
                    <ToggleSwitch checked={localSettings.notifications.onTransferFail} onChange={c => handleToggleChange('notifications', 'onTransferFail', c)} labelId="notif-fail" />
                </div>
            </div>
            
            {/* Security */}
             <div className="bg-black border border-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Segurança</h3>
                 <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="2fa-toggle" className="text-sm text-white font-medium">Autenticação de Dois Fatores (2FA)</label>
                        <p className="text-xs text-gray-400">Exigir um código de verificação para todas as transferências.</p>
                    </div>
                    <ToggleSwitch checked={localSettings.security.twoFactorAuth} onChange={c => handleToggleChange('security', 'twoFactorAuth', c)} labelId="2fa-toggle" />
                </div>
             </div>
        </div>
    </div>
  );
};

export default WalletSettingsComponent;