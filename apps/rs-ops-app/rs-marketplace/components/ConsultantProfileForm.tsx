import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ImageUploader } from './ImageUploader';
import { supabase } from '../services/supabase';

interface ConsultantData extends UserProfile {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    pixKey?: string;
    pixType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    bankName?: string;
    bankAgency?: string;
    bankAccount?: string;
}

const ConsultantProfileForm: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'payment'>('personal');
    const [formData, setFormData] = useState<ConsultantData>(() => {
        try {
            const stored = localStorage.getItem('rs-consultant-full-profile');
            if (stored) {
                return JSON.parse(stored) as ConsultantData;
            }
        } catch {
        }
        return {
            name: '',
            id: '',
            graduation: '',
            accountStatus: '',
            monthlyActivity: '',
            category: '',
            referralLink: '',
            affiliateLink: '',
            avatarUrl: '',
            email: '',
            phone: '',
            cpfCnpj: '',
            cep: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            pixKey: '',
            pixType: 'cpf',
            bankName: '',
            bankAgency: '',
            bankAccount: ''
        } as ConsultantData;
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isSaving, setIsSaving] = useState(false);

    const persistProfileLocally = (profile: ConsultantData) => {
        localStorage.setItem('rs-consultant-full-profile', JSON.stringify(profile));
        localStorage.setItem('rs-consultant-profile', JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent('rs-consultant-profile-updated', { detail: profile }));
    };

    // Sincroniza email e nome com a sessão Supabase se estiverem vazios
    useEffect(() => {
        const syncFromSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const user = session.user;

            // [RS-SYNC v12.0] Busca paralela para garantir dados de carreira e avatar
            const [profileRes, consultorRes] = await Promise.all([
                supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('consultores').select('*').eq('user_id', user.id).maybeSingle()
            ]);

            const profile = profileRes.data;
            const consultor = consultorRes.data;

            setFormData(prev => {
                const updated = {
                    ...prev,
                    id: user.id,
                    email: prev.email || user.email || '',
                    name: profile?.full_name || consultor?.nome_completo || prev.name || user.user_metadata?.full_name || '',
                    avatarUrl: profile?.avatar_url || consultor?.avatar_url || (consultor as any)?.foto || prev.avatarUrl || user.user_metadata?.avatar_url || '',
                    cpfCnpj: profile?.cpf_cnpj || consultor?.cpf_cnpj || prev.cpfCnpj || '',
                    graduation: consultor?.graduacao || profile?.graduation || prev.graduation || '',
                    category: consultor?.categoria || profile?.category || prev.category || '',
                    accountStatus: consultor?.status_conta || profile?.account_status || prev.accountStatus || 'Ativo',
                    monthlyActivity: consultor?.atividade_mensal || profile?.monthly_activity || prev.monthlyActivity || 'Ativo',
                    phone: profile?.phone_number || consultor?.telefone || prev.phone || ''
                };

                // Mantém sincronizado o avatar do topo no mesmo instante
                persistProfileLocally(updated);
                return updated;
            });
        };
        syncFromSession();
    }, []);

    const handleImageUpload = (url: string) => {
        setFormData(prev => {
            const updated = { ...prev, avatarUrl: url };
            persistProfileLocally(updated);
            return updated;
        });
    };

    const handleFileUpload = async (file: File, base64: string) => {
        try {
            setFormData(prev => {
                const updated = { ...prev, avatarUrl: base64 };
                persistProfileLocally(updated);
                return updated;
            }); // Optimistic UI

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `availables/${fileName}`;

            let publicUrl = '';
            let uploadedBucket = null;
            const bucketsToTry = ['avatars', 'public', 'images', 'geral'];

            for (const bucket of bucketsToTry) {
                try {
                    const path = bucket === 'public' ? `avatars/${filePath}` : filePath;
                    const { error } = await supabase.storage.from(bucket).upload(path, file);
                    if (!error) {
                        uploadedBucket = bucket;
                        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                        publicUrl = data.publicUrl;
                        break;
                    }
                } catch (err) { }
            }

            if (!publicUrl) {
                console.warn("[Avatar] Storage indisponível. Usando fallback Base64.");
                publicUrl = base64;
            }

            setFormData(prev => {
                const updated = { ...prev, avatarUrl: publicUrl };
                persistProfileLocally(updated);
                return updated;
            });

        } catch (error) {
            console.error('[Avatar] Erro no upload:', error);
            alert('Erro ao processar imagem no servidor.');
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            persistProfileLocally(formData);

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Atualiza no banco real
                await supabase
                    .from('user_profiles')
                    .update({
                        full_name: formData.name,
                        avatar_url: formData.avatarUrl,
                        cpf_cnpj: formData.cpfCnpj,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', session.user.id);

                // Atualiza metadados do auth
                await supabase.auth.updateUser({
                    data: {
                        name: formData.name,
                        full_name: formData.name,
                        avatar_url: formData.avatarUrl
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao salvar perfil no DB:', error);
        } finally {
            setIsSaving(false);
            alert('✅ Perfil salvo com sucesso!');
            setTimeout(() => window.location.reload(), 300);
        }
    };

    return (
        <div className="space-y-4">
            <div className="pb-4 mb-4 flex justify-between items-center border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Perfil do Consultor</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-sm font-bold bg-[#d4af37] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'personal'
                        ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Dados Pessoais
                </button>
                <button
                    onClick={() => setActiveTab('address')}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'address'
                        ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Endereço
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'payment'
                        ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Pagamento
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'personal' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-slate-200 mb-3">Foto de Perfil</h3>
                        <div className="max-w-[200px] mx-auto">
                            <ImageUploader
                                currentImage={formData.avatarUrl}
                                onImageUpload={handleImageUpload}
                                onFileUpload={handleFileUpload}
                                placeholderText="Enviar foto"
                                aspectRatio="square"
                            />
                        </div>
                    </div>
                    <div className="bg-black border border-white/10 rounded-xl p-4 space-y-3">
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
                            <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="cpfCnpj" className="block text-xs font-medium text-slate-400 mb-1">CPF/CNPJ</label>
                                <input id="cpfCnpj" name="cpfCnpj" type="text" value={formData.cpfCnpj} onChange={handleInputChange} placeholder="000.000.000-00" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
                                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(11) 99999-9999" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'address' && (
                <div className="bg-black border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="cep" className="block text-xs font-medium text-slate-400 mb-1">CEP</label>
                            <input id="cep" name="cep" type="text" value={formData.cep} onChange={handleInputChange} placeholder="00000-000" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="street" className="block text-xs font-medium text-slate-400 mb-1">Rua/Avenida</label>
                            <input id="street" name="street" type="text" value={formData.street} onChange={handleInputChange} placeholder="Rua Exemplo" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="number" className="block text-xs font-medium text-slate-400 mb-1">Número</label>
                            <input id="number" name="number" type="text" value={formData.number} onChange={handleInputChange} placeholder="123" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="complement" className="block text-xs font-medium text-slate-400 mb-1">Complemento</label>
                            <input id="complement" name="complement" type="text" value={formData.complement} onChange={handleInputChange} placeholder="Apto 45, Bloco B" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="neighborhood" className="block text-xs font-medium text-slate-400 mb-1">Bairro</label>
                            <input id="neighborhood" name="neighborhood" type="text" value={formData.neighborhood} onChange={handleInputChange} placeholder="Centro" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-xs font-medium text-slate-400 mb-1">Cidade</label>
                            <input id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="São Paulo" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                            <input id="state" name="state" type="text" value={formData.state} onChange={handleInputChange} placeholder="SP" maxLength={2} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm uppercase" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payment' && (
                <div className="bg-black border border-white/10 rounded-xl p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-[#d4af37] mb-3">Dados PIX</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="pixType" className="block text-xs font-medium text-slate-400 mb-1">Tipo de Chave</label>
                                    <select id="pixType" name="pixType" value={formData.pixType} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm">
                                        <option value="cpf">CPF</option>
                                        <option value="cnpj">CNPJ</option>
                                        <option value="email">E-mail</option>
                                        <option value="phone">Telefone</option>
                                        <option value="random">Chave Aleatória</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="pixKey" className="block text-xs font-medium text-slate-400 mb-1">Chave PIX</label>
                                    <input id="pixKey" name="pixKey" type="text" value={formData.pixKey} onChange={handleInputChange} placeholder="Digite sua chave PIX" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#d4af37] mb-3">Dados Bancários (Opcional)</h3>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="bankName" className="block text-xs font-medium text-slate-400 mb-1">Banco</label>
                                <input id="bankName" name="bankName" type="text" value={formData.bankName} onChange={handleInputChange} placeholder="Banco do Brasil, Caixa, Itaú..." className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="bankAgency" className="block text-xs font-medium text-slate-400 mb-1">Agência</label>
                                    <input id="bankAgency" name="bankAgency" type="text" value={formData.bankAgency} onChange={handleInputChange} placeholder="0001" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="bankAccount" className="block text-xs font-medium text-slate-400 mb-1">Conta</label>
                                    <input id="bankAccount" name="bankAccount" type="text" value={formData.bankAccount} onChange={handleInputChange} placeholder="12345-6" className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultantProfileForm;
