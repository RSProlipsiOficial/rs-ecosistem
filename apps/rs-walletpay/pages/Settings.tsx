import React, { useState, useRef, useEffect } from 'react';
import { MOCK_USER_PROFILE } from '../constants';
import { supabase } from '../src/lib/supabaseClient';
import { syncService } from '../src/services/syncService';
import {
    User,
    Shield,
    CreditCard,
    MapPin,
    RefreshCcw,
    Camera,
    Building,
    Smartphone,
    Mail,
    Lock,
    Save,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// --- COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl ${className}`}>
        {children}
    </div>
);

const InputField: React.FC<{
    name: string,
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string,
    placeholder?: string,
    disabled?: boolean,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
    icon?: React.ElementType
}> = ({ name, label, value, onChange, type = 'text', placeholder, disabled = false, onBlur, icon: Icon }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all text-white placeholder:text-gray-600 disabled:opacity-50`}
            />
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; label: string }> = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${active
            ? 'border-gold text-gold bg-gold/5'
            : 'border-transparent text-gray-500 hover:text-white hover:border-white/20'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

// --- MAIN COMPONENT ---

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'bank' | 'security' | 'integration'>('profile');
    const [profile, setProfile] = useState({
        ...MOCK_USER_PROFILE,
        bankAccount: {
            bank: '',
            accountType: 'checking',
            agency: '',
            accountNumber: '',
            pixKey: ''
        },
        upline: {
            name: '',
            idConsultor: '',
            whatsapp: ''
        },
        cpf: ''
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    setLoading(false);
                    return;
                }

                const [profileRes, consultorRes] = await Promise.all([
                    supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
                    supabase.from('consultores').select('*').eq('id', userId).maybeSingle()
                ]);

                if (profileRes.data || consultorRes.data) {
                    const p = profileRes.data || {};
                    const c = consultorRes.data || {};

                    // AUTO-POPULATION LOGIC
                    // If profile is missing key data but consultor has it, use it.
                    const finalId = p.mmn_id || c.username || c.id || '';
                    const finalName = p.nome_completo || c.nome || '';
                    const finalEmail = c.email || '';
                    const finalPhone = p.telefone || c.whatsapp || '';
                    const finalCpf = p.cpf || c.cpf || '';

                    setProfile(prev => ({
                        ...prev,
                        id: finalId,
                        name: finalName,
                        email: finalEmail,
                        phone: finalPhone,
                        smartCertificate: c.certificado || prev.smartCertificate,
                        avatarUrl: p.avatar_url || prev.avatarUrl,
                        address: {
                            ...prev.address,
                            street: p.endereco_rua || prev.address.street,
                            number: p.endereco_numero || prev.address.number,
                            complement: p.endereco_complemento || prev.address.complement || '',
                            neighborhood: p.endereco_bairro || prev.address.neighborhood,
                            city: p.endereco_cidade || prev.address.city,
                            state: p.endereco_estado || prev.address.state,
                            cep: p.endereco_cep || prev.address.cep,
                        },
                        cpf: finalCpf,
                        bankAccount: {
                            bank: p.banco_nome || '',
                            accountType: p.banco_tipo || 'checking',
                            agency: p.banco_agencia || '',
                            accountNumber: p.banco_conta || '',
                            pixKey: p.banco_pix || ''
                        },
                        upline: {
                            name: p.upline_nome || 'SISTEMA RS',
                            idConsultor: p.upline_id || 'RAIZ',
                            whatsapp: ''
                        }
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section?: 'address' | 'bank') => {
        const { name, value } = e.target;
        if (section === 'address') {
            setProfile(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
        } else if (section === 'bank') {
            setProfile(prev => ({ ...prev, bankAccount: { ...prev.bankAccount, [name]: value } }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSync = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        setSyncing(true);
        try {
            const result = await syncService.syncProfile(userId);
            console.log('[Settings] Resultado da sincronização:', result);
            if (result.success) {
                alert('Sincronização concluída com sucesso!');
                // Pequeno delay para o usuário ver o log se estiver com console aberto
                setTimeout(() => window.location.reload(), 500);
            } else {
                alert('Falha na sincronização: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            alert('Erro inesperado ao sincronizar dados.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSave = async (section: string) => {
        setSaveStatus(section);
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('Usuário não identificado');

            let updatePayload = {};

            if (section === 'profile') {
                updatePayload = {
                    nome_completo: profile.name,
                    telefone: profile.phone,
                    cpf: profile.cpf,
                    updated_at: new Date().toISOString()
                };

                // Also update consultores table for email and username if they were changed
                const userId = localStorage.getItem('userId');
                if (userId) {
                    await syncService.updateConsultor(userId, {
                        email: profile.email,
                        username: profile.id,
                        nome: profile.name,
                        whatsapp: profile.phone,
                    });
                }

            } else if (section === 'address') {
                updatePayload = {
                    endereco_cep: profile.address.cep,
                    endereco_rua: profile.address.street,
                    endereco_numero: profile.address.number,
                    endereco_bairro: profile.address.neighborhood,
                    endereco_cidade: profile.address.city,
                    endereco_estado: profile.address.state,
                    updated_at: new Date().toISOString()
                };
            } else if (section === 'bank') {
                updatePayload = {
                    banco_nome: profile.bankAccount.bank,
                    banco_tipo: profile.bankAccount.accountType,
                    banco_agencia: profile.bankAccount.agency,
                    banco_conta: profile.bankAccount.accountNumber,
                    banco_pix: profile.bankAccount.pixKey,
                    updated_at: new Date().toISOString()
                };
            }

            const result = await syncService.updateProfile(userId, updatePayload);
            if (!result.success) throw new Error(result.message);
            alert('Configurações salvas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaveStatus(null);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setSaveStatus('avatar');
                const userId = localStorage.getItem('userId');
                if (!userId) throw new Error('Não autenticado');

                const fileName = `avatars/${userId}-${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('rsia-uploads')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('rsia-uploads')
                    .getPublicUrl(fileName);

                await syncService.updateProfile(userId, {
                    avatar_url: publicUrl
                });

                setAvatarPreview(publicUrl);
                alert('Foto de perfil atualizada!');
            } catch (error: any) {
                console.error('Erro no upload:', error);
                alert('Erro ao atualizar foto: ' + error.message);
            } finally {
                setSaveStatus(null);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-card/80 to-transparent p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gold bg-clip-text text-transparent italic">
                        Configurações da Conta
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <User size={14} className="text-gold" />
                        Gerencie seu perfil, integrações e dados de segurança.
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-hover transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar com Plataforma'}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-2 flex flex-col overflow-hidden">
                        <TabButton
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            icon={User}
                            label="Perfil & Identidade"
                        />
                        <TabButton
                            active={activeTab === 'address'}
                            onClick={() => setActiveTab('address')}
                            icon={MapPin}
                            label="Endereço"
                        />
                        <TabButton
                            active={activeTab === 'bank'}
                            onClick={() => setActiveTab('bank')}
                            icon={Building}
                            label="Dados Bancários"
                        />
                        <TabButton
                            active={activeTab === 'integration'}
                            onClick={() => setActiveTab('integration')}
                            icon={CreditCard}
                            label="Integração (API)"
                        />
                        <TabButton
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                            icon={Shield}
                            label="Segurança"
                        />
                    </Card>

                    {/* Quick Stats / Info Widget */}
                    <Card className="p-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Seu Patrocinador</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-black border border-gold/20">
                                {profile.upline.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{profile.upline.name}</p>
                                <p className="text-xs text-gold uppercase font-bold tracking-tighter">ID: {profile.upline.idConsultor}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-3">
                    <Card className="p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-8 mb-4">
                                    <div className="relative group overflow-hidden">
                                        <div className="w-24 h-24 rounded-full border-2 border-gold/50 p-1 flex items-center justify-center bg-black/40">
                                            <img
                                                src={avatarPreview || profile.avatarUrl || "https://picsum.photos/200"}
                                                alt="Avatar"
                                                className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Camera size={24} className="text-white" />
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                                        <p className="text-gray-500 text-sm">Atualize sua foto e dados de identidade.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="name" label="Nome Completo" value={profile.name} onChange={handleFormChange} />
                                    <InputField name="email" label="E-mail" value={profile.email} onChange={handleFormChange} type="email" icon={Mail} />
                                    <InputField name="phone" label="WhatsApp" value={profile.phone} onChange={handleFormChange} icon={Smartphone} />
                                    <InputField name="cpf" label="CPF" value={profile.cpf || ''} onChange={handleFormChange} />
                                    <InputField name="id" label="ID de Consultor" value={profile.id} onChange={handleFormChange} icon={Shield} />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => handleSave('profile')}
                                        className="bg-gold hover:bg-gold-hover text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-gold/10"
                                    >
                                        <Save size={18} />
                                        Salvar Perfil
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <InputField name="cep" label="CEP" value={profile.address.cep} onChange={(e) => handleFormChange(e, 'address')} icon={MapPin} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField name="street" label="Logradouro" value={profile.address.street} onChange={(e) => handleFormChange(e, 'address')} />
                                    </div>
                                    <InputField name="number" label="Número" value={profile.address.number} onChange={(e) => handleFormChange(e, 'address')} />
                                    <InputField name="complement" label="Complemento" value={profile.address.complement || ''} onChange={(e) => handleFormChange(e, 'address')} />
                                    <InputField name="neighborhood" label="Bairro" value={profile.address.neighborhood} onChange={(e) => handleFormChange(e, 'address')} />
                                    <InputField name="city" label="Cidade" value={profile.address.city} onChange={(e) => handleFormChange(e, 'address')} />
                                    <InputField name="state" label="Estado" value={profile.address.state} onChange={(e) => handleFormChange(e, 'address')} />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => handleSave('address')}
                                        className="bg-gold hover:bg-gold-hover text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-gold/10"
                                    >
                                        <Save size={18} />
                                        Salvar Endereço
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bank' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="bank" label="Banco" value={profile.bankAccount.bank} onChange={(e) => handleFormChange(e, 'bank')} icon={Building} />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Tipo de Conta</label>
                                        <select
                                            name="accountType"
                                            value={profile.bankAccount.accountType}
                                            onChange={(e) => handleFormChange(e, 'bank')}
                                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:ring-2 focus:ring-gold/30 outline-none text-white h-[48px]"
                                        >
                                            <option value="checking">Conta Corrente</option>
                                            <option value="savings">Conta Poupança</option>
                                        </select>
                                    </div>
                                    <InputField name="agency" label="Agência" value={profile.bankAccount.agency} onChange={(e) => handleFormChange(e, 'bank')} />
                                    <InputField name="accountNumber" label="Número da Conta" value={profile.bankAccount.accountNumber} onChange={(e) => handleFormChange(e, 'bank')} />
                                    <div className="md:col-span-2">
                                        <InputField name="pixKey" label="Chave PIX Principal" value={profile.bankAccount.pixKey} onChange={(e) => handleFormChange(e, 'bank')} placeholder="CPF, Email ou Celular" />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => handleSave('bank')}
                                        className="bg-gold hover:bg-gold-hover text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-gold/10"
                                    >
                                        <Save size={18} />
                                        Salvar Dados Bancários
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'integration' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <AlertCircle className="text-blue-400" size={20} />
                                    <div className="text-sm">
                                        <p className="text-white font-bold">Configuração de Gateway (Checkout)</p>
                                        <p className="text-gray-400">Estas credenciais são usadas para processar recebimentos via PIX e Cartão diretamente para sua conta.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <InputField name="mp_public_key" label="Mercado Pago - Public Key" value="" onChange={() => { }} placeholder="APP_USR-..." icon={Lock} />
                                    <InputField name="mp_access_token" label="Mercado Pago - Access Token" value="" onChange={() => { }} type="password" placeholder="TEST-..." icon={Lock} />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        className="bg-gold/20 text-gold font-bold px-8 py-3 rounded-xl flex items-center gap-2 border border-gold/40 cursor-not-allowed opacity-50"
                                    >
                                        <Save size={18} />
                                        Salvar Integrações (EM BREVE)
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8 max-w-sm">
                                <InputField name="currentPassword" label="Senha Atual" type="password" value="" onChange={() => { }} />
                                <InputField name="newPassword" label="Nova Senha" type="password" value="" onChange={() => { }} />
                                <InputField name="confirmPassword" label="Confirmar Senha" type="password" value="" onChange={() => { }} />

                                <div className="pt-4 flex justify-start">
                                    <button
                                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
                                    >
                                        <Lock size={18} />
                                        Alterar Senha
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;