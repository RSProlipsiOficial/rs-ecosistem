import React, { useState, useRef, ChangeEvent } from 'react';
import { UserCircle, ShieldCheck, Camera, Shield, X, RefreshCw, Lock, Wallet, Loader2, Save, Mail, Phone, MapPin, Upload } from 'lucide-react';
import { useUser } from './ConsultantLayout';
import { supabase } from './services/supabaseClient';

const Configuracoes: React.FC = () => {
    const { user, updateUser, onSyncProfile } = useUser();
    const [profileTab, setProfileTab] = useState<'identity' | 'avatar' | 'bank' | 'security'>('identity');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        cpfCnpj: user.cpfCnpj,
        birthDate: user.birthDate,
        address: { ...user.address },
        bankAccount: { ...user.bankAccount }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // [FIX] Update form when user context loads (replaces initial 'Carregando...' mock)
    React.useEffect(() => {
        if (user.name !== 'Carregando...') {
            setProfileForm({
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                avatarUrl: user.avatarUrl,
                coverUrl: user.coverUrl,
                cpfCnpj: user.cpfCnpj,
                birthDate: user.birthDate,
                address: { ...user.address },
                bankAccount: { ...user.bankAccount }
            });
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setIsUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `availables/${fileName}`;

            let publicUrl = '';
            let uploadedBucket = null;

            // Lista de buckets para tentar (ordem de preferência)
            const bucketsToTry = ['avatars', 'public', 'images', 'geral'];

            // Tenta buckets em sequência
            for (const bucket of bucketsToTry) {
                try {
                    const path = bucket === 'public' ? `avatars/${filePath}` : filePath;
                    const { error } = await supabase.storage.from(bucket).upload(path, file);

                    if (!error) {
                        uploadedBucket = bucket;
                        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                        publicUrl = data.publicUrl;
                        break; // Sucesso!
                    } else {
                        console.warn(`[Avatar] Falha ao enviar para bucket '${bucket}':`, error.message);
                    }
                } catch (err) {
                    console.warn(`[Avatar] Erro exceção bucket '${bucket}':`, err);
                }
            }

            // [FALLBACK] Se nenhum bucket funcionou (ex: Erro de infra ou Bucket not found), converte para Base64
            if (!uploadedBucket || !publicUrl) {
                console.warn("[Avatar] V2.1 - Storage indisponível. Usando fallback Base64.");

                // Limite sênior: 10MB (Postgres TEXT aguenta até 1GB, mas 10MB é o limite seguro de request do Supabase)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error("A imagem é extremamente pesada (limite: 10MB). Reduza o tamanho para salvar.");
                }

                publicUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            if (!publicUrl) {
                throw new Error("Não foi possível gerar a URL da imagem.");
            }

            console.log(`[Avatar] Identidade Mestre v2.1 definida. Base64: ${publicUrl.startsWith('data:')}`);

            // 3. Atualizar user_profiles
            const { error: dbError } = await supabase
                .from('user_profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (dbError) throw dbError;

            // 4. Atualizar contexto local
            updateUser({ avatarUrl: publicUrl });
            setProfileForm(prev => ({ ...prev, avatarUrl: publicUrl }));
            alert('Foto de perfil atualizada com sucesso!');

        } catch (error: any) {
            console.error('[Avatar] Erro no upload:', error);
            alert(`Erro ao atualizar foto: ${error.message || 'Erro desconhecido.'}`);
        }
    };

    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const handleCoverClick = () => coverInputRef.current?.click();

    const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            setIsUploadingCover(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            let publicUrl = '';
            const bucketsToTry = ['avatars', 'public', 'images', 'geral'];

            for (const bucket of bucketsToTry) {
                try {
                    const path = bucket === 'public' ? `avatars/${filePath}` : filePath;
                    const { error } = await supabase.storage.from(bucket).upload(path, file);
                    if (!error) {
                        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                        publicUrl = data.publicUrl;
                        break;
                    }
                } catch { }
            }

            if (!publicUrl) {
                publicUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const { error: dbError } = await supabase
                .from('user_profiles')
                .update({ cover_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);

            if (dbError) throw dbError;
            updateUser({ coverUrl: publicUrl });
            setProfileForm(prev => ({ ...prev, coverUrl: publicUrl }));
            alert('Banner de capa atualizado com sucesso!');
        } catch (error: any) {
            alert(`Erro ao atualizar capa: ${error.message}`);
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleZipCodeBlur = async () => {
        const zip = profileForm.address.zipCode.replace(/\D/g, '');
        if (zip.length !== 8) return;

        setIsZipLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setProfileForm(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro || prev.address.street,
                        neighborhood: data.bairro || prev.address.neighborhood,
                        city: data.localidade || prev.address.city,
                        state: data.uf || prev.address.state
                    }
                }));
            }
        } catch (error) {
            console.error("ViaCEP Error:", error);
        } finally {
            setIsZipLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const globalData = await onSyncProfile();
            if (globalData) {
                setProfileForm(prev => ({
                    ...prev,
                    ...globalData,
                    address: globalData.address ? { ...prev.address, ...globalData.address } : prev.address
                }));
                alert("Dados sincronizados com o Sistema Global RS Prólipsi! 💎");
            } else {
                alert("Não foi possível encontrar dados globais correspondentes.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro na sincronização.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // [FIX] Persistência real no banco de dados Supabase
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    name: profileForm.name,
                    phone: profileForm.whatsapp,
                    cpf: profileForm.cpfCnpj,
                    birth_date: profileForm.birthDate,
                    address_street: profileForm.address.street,
                    address_number: profileForm.address.number,
                    address_neighborhood: profileForm.address.neighborhood,
                    address_city: profileForm.address.city,
                    address_state: profileForm.address.state,
                    address_zip: profileForm.address.zipCode,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            updateUser(profileForm);
            alert("Perfil atualizado com sucesso no banco de dados! 💎");
        } catch (e: any) {
            console.error('[Config] Erro ao salvar:', e);
            alert("Erro ao salvar no banco: " + (e.message || "Erro desconhecido"));
        } finally {
            setIsSaving(false);
        }
    };

    // Helper para extrair short ID
    const shortId = user.id ? user.id.split('-')[0].toUpperCase() : '---';
    const loginId = user.idConsultor && user.idConsultor !== 'RS-PRO-001' ? user.idConsultor : null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
            />
            <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverUpload}
                accept="image/*"
                className="hidden"
            />

            {/* Header / Hero Section */}
            <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-8 rounded-2xl relative overflow-hidden border border-brand-gold/20 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Shield size={180} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-24 h-24 rounded-full border-4 border-brand-gold bg-gray-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-brand-gold" size={32} />
                                ) : profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-brand-gold font-bold text-4xl">{profileForm.name.charAt(0)}</span>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-brand-gold text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold uppercase tracking-wider text-white">{profileForm.name}</h1>
                                <div className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    <ShieldCheck size={10} /> VERIFICADO
                                </div>
                            </div>
                            <div className="flex flex-col">
                                {loginId && (
                                    <p className="text-xs text-gray-400 font-mono uppercase font-bold">
                                        LOGIN: <span className="text-white">{loginId}</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 font-mono uppercase font-bold">
                                    ID CONTA: <span className="text-brand-gold">{shortId}</span>
                                </p>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <span className="flex items-center gap-1 text-xs text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded border border-brand-gold/20">
                                    <Shield size={12} /> {user.graduacao || 'CONSULTOR'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-8 py-4 bg-brand-gold hover:bg-yellow-400 text-brand-dark rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 active:scale-95"
                    >
                        <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIA MESTRE'}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-brand-gray/50 rounded-2xl border border-gray-200 dark:border-brand-gold/10 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-black/20 border-r border-gray-200 dark:border-brand-gold/10">
                    {[
                        { id: 'identity', label: 'Identidade', icon: <UserCircle size={18} /> },
                        { id: 'avatar', label: 'Foto de Perfil', icon: <Camera size={18} /> },
                        { id: 'bank', label: 'Dados Bancários', icon: <Wallet size={18} /> },
                        { id: 'security', label: 'Segurança', icon: <Lock size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setProfileTab(tab.id as any)}
                            className={`w-full py-5 px-6 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-4 border-l-4 ${profileTab === tab.id
                                ? 'border-brand-gold text-brand-gold bg-white dark:bg-brand-dark/40 shadow-inner'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Forms */}
                <div className="flex-1 p-8 md:p-10 bg-white dark:bg-transparent overflow-y-auto">

                    {/* 1. IDENTITY TAB */}
                    {profileTab === 'identity' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Informações Pessoais</h3>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">CPF / CNPJ</label>
                                            <input
                                                type="text"
                                                value={profileForm.cpfCnpj}
                                                readOnly
                                                className="w-full bg-gray-200 dark:bg-black/40 border border-gray-200 dark:border-brand-gold/10 opacity-60 rounded-xl p-4 text-sm text-gray-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nascimento</label>
                                            <input
                                                type="text"
                                                value={profileForm.birthDate}
                                                onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                                                className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={profileForm.whatsapp}
                                            onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                            className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Endereço de Entrega</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">CEP</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={profileForm.address.zipCode}
                                                    onBlur={handleZipCodeBlur}
                                                    onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, zipCode: e.target.value } })}
                                                    className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                                />
                                                {isZipLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-gold" />}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Logradouro</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.street}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                                                className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nº</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.number}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, number: e.target.value } })}
                                                className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Bairro</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.neighborhood}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, neighborhood: e.target.value } })}
                                                className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Cidade</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.city}
                                                readOnly
                                                className="w-full bg-gray-200 dark:bg-black/40 border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-500 outline-none opacity-80"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Estado</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.state}
                                                readOnly
                                                className="w-full bg-gray-200 dark:bg-black/40 border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-500 outline-none opacity-80"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. AVATAR & BANNER TAB */}
                    {profileTab === 'avatar' && (
                        <div className="animate-fade-in space-y-10">
                            <div className="flex flex-col items-center justify-center py-6 space-y-6">
                                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-[0.2em] mb-4">Foto de Perfil</h3>
                                <div className="w-48 h-48 rounded-full border-8 border-brand-gold bg-gray-800 flex items-center justify-center overflow-hidden shadow-2xl relative group cursor-pointer" onClick={handleAvatarClick}>
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-brand-gold" size={48} />
                                    ) : profileForm.avatarUrl ? (
                                        <img src={profileForm.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
                                    ) : (
                                        <span className="text-brand-gold font-bold text-6xl">{profileForm.name.charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={48} className="text-white" />
                                    </div>
                                </div>
                                <button onClick={handleAvatarClick} className="px-8 py-3 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-xl font-bold hover:bg-brand-gray transition-all">
                                    Mudar Foto de Perfil
                                </button>
                            </div>

                            <div className="border-t border-brand-gold/10 pt-10">
                                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-[0.2em] mb-6 text-center">Banner de Capa Individual</h3>
                                <div className="max-w-2xl mx-auto">
                                    <div
                                        onClick={handleCoverClick}
                                        className="aspect-[4/1] w-full rounded-2xl border-4 border-brand-gold bg-gray-900 overflow-hidden relative group cursor-pointer shadow-2xl"
                                    >
                                        {isUploadingCover ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                <Loader2 className="animate-spin text-brand-gold" size={32} />
                                            </div>
                                        ) : profileForm.coverUrl ? (
                                            <img src={profileForm.coverUrl} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-gray-700 font-bold uppercase tracking-tighter text-xl">Sem Banner Personalizado</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Proporção ideal: 4:1 (ex: 1200x300)</p>
                                        <button onClick={handleCoverClick} className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase hover:underline">
                                            <Upload size={14} /> Fazer Upload da Capa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. BANK TAB */}
                    {profileTab === 'bank' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Configuração de Saques</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Banco</label>
                                    <input
                                        type="text"
                                        value={profileForm.bankAccount.bank}
                                        onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, bank: e.target.value } })}
                                        className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tipo de Conta</label>
                                    <select
                                        value={profileForm.bankAccount.accountType}
                                        onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, accountType: e.target.value as any } })}
                                        className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%23D4AF37%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat"
                                    >
                                        <option value="checking">Conta Corrente</option>
                                        <option value="savings">Conta Poupança</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Agência</label>
                                        <input
                                            type="text"
                                            value={profileForm.bankAccount.agency}
                                            onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, agency: e.target.value } })}
                                            className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nº da Conta</label>
                                        <input
                                            type="text"
                                            value={profileForm.bankAccount.accountNumber}
                                            onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, accountNumber: e.target.value } })}
                                            className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Chave PIX (Principal)</label>
                                    <input
                                        type="text"
                                        value={profileForm.bankAccount.pixKey}
                                        onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, pixKey: e.target.value } })}
                                        className="w-full bg-gray-100 dark:bg-brand-dark border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-gold transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. SECURITY TAB */}
                    {profileTab === 'security' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Proteção da Conta</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gray-100 dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-brand-gold/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Senha de Acesso</p>
                                            <p className="text-xs text-gray-400">Última alteração há 30 dias</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2 bg-brand-gray border border-brand-gold/20 text-brand-gold text-xs font-bold rounded-lg hover:bg-brand-dark transition-all">
                                        ALTERAR
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-gray-100 dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-brand-gold/10 border-dashed">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Verificação em Duas Etapas</p>
                                            <p className="text-xs text-gray-400">Proteja sua conta com 2FA via E-mail/App</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all">
                                        ATIVAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-brand-gold/10 flex justify-end gap-4">
                        <button className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest">
                            Descartar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-10 py-3 bg-brand-gold hover:bg-yellow-400 text-brand-dark rounded-xl font-bold shadow-lg shadow-brand-gold/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            SALVAR ALTERAÇÕES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;