import React, { useState, useRef } from 'react';
import { MOCK_USER_PROFILE } from '../constants';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }> = 
({ title, description, children, footer }) => (
    <div className="bg-card rounded-2xl border border-border shadow-custom-lg">
        <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-text-title">{title}</h3>
            <p className="text-sm text-text-soft mt-1">{description}</p>
        </div>
        <div className="p-6">
            {children}
        </div>
        {footer && (
            <div className="p-6 bg-surface/50 rounded-b-2xl border-t border-border text-right">
                {footer}
            </div>
        )}
    </div>
);

const InputField: React.FC<{ name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, required?: boolean, disabled?: boolean, onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void }> =
({ name, label, value, onChange, type = 'text', placeholder, required = false, disabled = false, onBlur }) => (
   <div>
       <label htmlFor={name} className="block text-sm font-medium text-text-body mb-2">{label}</label>
       <input
           type={type}
           id={name}
           name={name}
           value={value}
           onChange={onChange}
           onBlur={onBlur}
           placeholder={placeholder}
           required={required}
           disabled={disabled}
           className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all disabled:opacity-50"
       />
   </div>
);

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm text-text-body">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-gold' : 'bg-surface'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-card rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const ProfileSettings: React.FC = () => {
    const [profile, setProfile] = useState(MOCK_USER_PROFILE);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cepLoading, setCepLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>, section?: 'address') => {
        const { name, value } = e.target;
        if (section === 'address') {
             setProfile(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
        } else {
             setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado');
            const data = await response.json();
            if (data.erro) throw new Error('CEP inválido');

            setProfile(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                }
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Não foi possível encontrar o CEP informado. Verifique e tente novamente.");
        } finally {
            setCepLoading(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <SettingsCard
                title="Foto de Perfil"
                description="Atualize sua foto de perfil. Recomendamos uma imagem com no mínimo 200x200 pixels."
                footer={<button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-card hover:bg-gold-hover transition-colors">Salvar Foto</button>}
            >
                <div className="flex items-center gap-6">
                    <img src={avatarPreview || "https://picsum.photos/100/100"} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-surface object-cover" />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors">
                        Alterar Foto
                    </button>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Informações Pessoais"
                description="Edite suas informações de contato e identificação."
                footer={<button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-card hover:bg-gold-hover transition-colors">Salvar Informações</button>}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField name="name" label="Nome Completo" value={profile.name} onChange={handleFormChange} />
                    <InputField name="email" label="E-mail" type="email" value={profile.email} onChange={handleFormChange} />
                    <InputField name="phone" label="WhatsApp" type="tel" value={profile.phone} onChange={handleFormChange} />
                    <InputField name="smartCertificate" label="Certificado Inteligente" value={profile.smartCertificate} onChange={handleFormChange} placeholder="Seu número do certificado" />
                </div>
            </SettingsCard>

            <SettingsCard
                title="Endereço"
                description="Mantenha seu endereço de correspondência atualizado."
                footer={<button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-card hover:bg-gold-hover transition-colors">Salvar Endereço</button>}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <InputField name="cep" label="CEP" value={profile.address.cep} onChange={(e) => handleFormChange(e, 'address')} onBlur={handleCepBlur} />
                    </div>
                    <div className="md:col-span-2">
                        <InputField name="street" label="Logradouro" value={profile.address.street} onChange={(e) => handleFormChange(e, 'address')} disabled={cepLoading} />
                    </div>
                    <InputField name="number" label="Número" value={profile.address.number} onChange={(e) => handleFormChange(e, 'address')} />
                    <InputField name="complement" label="Complemento" value={profile.address.complement} onChange={(e) => handleFormChange(e, 'address')} />
                    <InputField name="neighborhood" label="Bairro" value={profile.address.neighborhood} onChange={(e) => handleFormChange(e, 'address')} disabled={cepLoading} />
                    <InputField name="city" label="Cidade" value={profile.address.city} onChange={(e) => handleFormChange(e, 'address')} disabled={cepLoading} />
                    <InputField name="state" label="Estado" value={profile.address.state} onChange={(e) => handleFormChange(e, 'address')} disabled={cepLoading} />
                </div>
            </SettingsCard>
        </div>
    );
};

const SecuritySettings: React.FC = () => {
    return (
        <SettingsCard
            title="Alterar Senha"
            description="Para sua segurança, escolha uma senha forte que você não use em outro lugar."
            footer={<button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-card hover:bg-gold-hover transition-colors">Alterar Senha</button>}
        >
            <div className="space-y-4 max-w-md">
                <InputField name="currentPassword" label="Senha Atual" type="password" value="" onChange={() => {}} />
                <InputField name="newPassword" label="Nova Senha" type="password" value="" onChange={() => {}} />
                <InputField name="confirmPassword" label="Confirmar Nova Senha" type="password" value="" onChange={() => {}} />
            </div>
        </SettingsCard>
    );
};

const NotificationSettings: React.FC = () => {
    const [notifications, setNotifications] = useState({
        commissions: true,
        network: true,
        summary: false,
        promotions: true
    });
    
    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
         <SettingsCard
            title="Preferências de Notificação"
            description="Escolha como você quer ser notificado sobre as atividades da sua conta."
            footer={<button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-card hover:bg-gold-hover transition-colors">Salvar Preferências</button>}
        >
            <div className="divide-y divide-border">
                <ToggleSwitch label="Receber e-mail sobre novas comissões" enabled={notifications.commissions} onChange={() => handleToggle('commissions')} />
                <ToggleSwitch label="Receber alerta sobre atividade da rede" enabled={notifications.network} onChange={() => handleToggle('network')} />
                <ToggleSwitch label="Receber e-mail com resumo semanal" enabled={notifications.summary} onChange={() => handleToggle('summary')} />
                <ToggleSwitch label="Receber novidades e promoções por e-mail" enabled={notifications.promotions} onChange={() => handleToggle('promotions')} />
            </div>
        </SettingsCard>
    );
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const tabs = [
        { id: 'profile', label: 'Perfil' },
        { id: 'security', label: 'Segurança' },
        { id: 'notifications', label: 'Notificações' },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'security': return <SecuritySettings />;
            case 'notifications': return <NotificationSettings />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Configurações</h1>
                <p className="text-text-body mt-1">Gerencie seu perfil, configurações de segurança e preferências.</p>
            </div>
            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;