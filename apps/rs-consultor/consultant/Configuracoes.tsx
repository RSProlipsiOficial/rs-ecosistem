import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
    IconUser, IconLock, IconImage, IconRotateCw, IconWallet,
    IconRotateCw as IconLoader2, IconSave, IconMail, IconPhone, IconMapPin, IconUpload,
    IconStore, IconUserCog, IconAward, IconCheckCircle, IconMessage
} from '../components/icons';
import { useUser } from './ConsultantLayout';
import { useBranding } from '../App';
import { supabase } from './services/supabaseClient';
import { apiClient } from './services/apiClient';

type EditPermissions = {
    can_edit_name: boolean;
    can_edit_birthDate: boolean;
    can_edit_whatsapp: boolean;
    can_edit_cep: boolean;
    can_edit_street: boolean;
    can_edit_number: boolean;
    can_edit_neighborhood: boolean;
    can_edit_city: boolean;
    can_edit_state: boolean;
    can_edit_bankName: boolean;
    can_edit_agency: boolean;
    can_edit_account: boolean;
    can_edit_accountType: boolean;
    can_edit_pix: boolean;
    can_edit_avatar: boolean;
    can_edit_cover: boolean;
    can_edit_cpfCnpj: boolean;
    can_edit_consultantId: boolean;
    can_edit_registerDate: boolean;
    can_edit_sponsor: boolean;
};

type SponsorInfo = {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    loginId: string;
    numericId: string;
    sponsorId?: string;
};

const defaultEditPermissions: EditPermissions = {
    can_edit_name: true,
    can_edit_birthDate: true,
    can_edit_whatsapp: true,
    can_edit_cep: true,
    can_edit_street: true,
    can_edit_number: true,
    can_edit_neighborhood: true,
    can_edit_city: true,
    can_edit_state: true,
    can_edit_bankName: true,
    can_edit_agency: true,
    can_edit_account: true,
    can_edit_accountType: true,
    can_edit_pix: true,
    can_edit_avatar: true,
    can_edit_cover: true,
    can_edit_cpfCnpj: true,
    can_edit_consultantId: false,
    can_edit_registerDate: false,
    can_edit_sponsor: false,
};

const inferPixKeyType = (value?: string | null): 'email' | 'cpf' | 'phone' | 'random' => {
    const raw = String(value || '').trim();
    const digits = raw.replace(/\D/g, '');

    if (!raw) return 'random';
    if (raw.includes('@')) return 'email';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return 'random';
    if (raw.startsWith('+') || raw.includes('(') || raw.includes(')') || raw.includes('-') || digits.length >= 12) return 'phone';
    if (digits.length === 11) return 'cpf';
    return 'random';
};

const normalizeBankAccount = (bankAccount: any) => ({
    ...bankAccount,
    pixKeyType: bankAccount?.pixKeyType || inferPixKeyType(bankAccount?.pixKey),
});

const buildWhatsAppLink = (value?: string | null, contactName?: string | null) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    const introName = String(contactName || '').trim();
    const message = introName
        ? `Olá meu patrocinador, olá meu líder, tudo bem? Eu sou ${introName} e estou cadastrado com você.`
        : 'Olá meu patrocinador, olá meu líder, tudo bem? Estou cadastrado com você.';
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

const Configuracoes: React.FC = () => {
    const { user, updateUser, onSyncProfile } = useUser();
    const branding = useBranding();
    const [profileTab, setProfileTab] = useState<'identity' | 'avatar' | 'bank' | 'sponsor' | 'security'>('identity');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);
    const [editPermissions, setEditPermissions] = useState<EditPermissions>(defaultEditPermissions);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [permissionsMessage, setPermissionsMessage] = useState('');
    const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo | null>(null);
    const [sponsorLoading, setSponsorLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        cpfCnpj: user.cpfCnpj,
        birthDate: user.birthDate,
        address: { ...user.address },
        bankAccount: normalizeBankAccount({ ...user.bankAccount })
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const editableFieldClass = "w-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all";
    const lockedFieldClass = "w-full bg-gray-200 dark:bg-black/40 border border-gray-200 dark:border-brand-gold/10 rounded-xl p-4 text-sm text-gray-500 outline-none opacity-70 cursor-not-allowed";
    const actionButtonClass = "px-8 py-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold hover:bg-emerald-500/20 transition-all";
    const disabledActionButtonClass = "px-8 py-3 bg-brand-dark/60 border border-brand-gold/10 text-gray-500 rounded-xl font-bold cursor-not-allowed opacity-70";

    const isLocked = (permission: keyof EditPermissions) => permissionsLoading || editPermissions[permission] !== true;
    const getFieldClass = (permission: keyof EditPermissions) => isLocked(permission) ? lockedFieldClass : editableFieldClass;
    const showLockedAlert = (label: string) => {
        alert(`${label} está bloqueado pela administração e não pode ser alterado neste painel.`);
    };

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
                bankAccount: normalizeBankAccount({ ...user.bankAccount })
            });
        }
    }, [user]);

    useEffect(() => {
        let active = true;

        async function loadPermissions() {
            if (!user.id) {
                return;
            }

            setPermissionsLoading(true);
            setPermissionsMessage('');

            const response = await apiClient.get<{ permissions?: Partial<EditPermissions> }>('/v1/consultor/profile/edit-permissions');

            if (!active) {
                return;
            }

            if (response.success && response.data?.permissions) {
                setEditPermissions({
                    ...defaultEditPermissions,
                    ...response.data.permissions,
                });
            } else {
                setEditPermissions(defaultEditPermissions);
                setPermissionsMessage(response.error || 'Não foi possível carregar as permissões da administração. Usando padrão do sistema.');
            }

            setPermissionsLoading(false);
        }

        void loadPermissions();

        return () => {
            active = false;
        };
    }, [user.id, (user as any)?.patrocinador_id]);

    useEffect(() => {
        let active = true;

        async function loadSponsor() {
            if (!user.id) {
                return;
            }

            setSponsorLoading(true);
            const response = await apiClient.get<{ sponsor?: SponsorInfo | null }>('/v1/consultor/profile/sponsor');

            if (!active) {
                return;
            }

            const sponsor = response.data?.sponsor || null;
            const hasMeaningfulSponsor = Boolean(
                sponsor && (sponsor.name || sponsor.email || sponsor.whatsapp || sponsor.loginId)
            );

            if (response.success && hasMeaningfulSponsor) {
                setSponsorInfo(sponsor);
                setSponsorLoading(false);
                return;
            }

            let sponsorRef = String((user as any)?.patrocinador_id || '').trim();

            if (!sponsorRef) {
                const selfRef = user.email || user.loginId || user.idConsultor || user.name;
                if (selfRef) {
                    const selfLookup = await apiClient.get<{ result?: SponsorInfo | null }>(`/v1/consultants/lookup-details?q=${encodeURIComponent(selfRef)}`);

                    if (!active) {
                        return;
                    }

                    sponsorRef = String(selfLookup.data?.result?.sponsorId || '').trim();
                }
            }

            if (sponsorRef) {
                const fallbackResponse = await apiClient.get<{ result?: SponsorInfo | null }>(`/v1/consultants/lookup-details?q=${encodeURIComponent(sponsorRef)}`);

                if (!active) {
                    return;
                }

                if (fallbackResponse.success && fallbackResponse.data?.result) {
                    setSponsorInfo(fallbackResponse.data.result);
                    setSponsorLoading(false);
                    return;
                }
            }

            setSponsorInfo(null);
            setSponsorLoading(false);
        }

        void loadSponsor();

        return () => {
            active = false;
        };
    }, [user.id]);

    const handleAvatarClick = () => {
        if (isLocked('can_edit_avatar')) {
            showLockedAlert('A foto de perfil');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            if (isLocked('can_edit_avatar')) {
                showLockedAlert('A foto de perfil');
                return;
            }
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

            const response = await apiClient.put<{ blockedFields?: string[] }>('/v1/consultor/profile', {
                avatarUrl: publicUrl,
            });

            if (!response.success) {
                throw new Error(response.error || 'Falha ao salvar a foto de perfil');
            }

            if ((response.data?.blockedFields || []).includes('avatar')) {
                throw new Error('A foto de perfil esta bloqueada pela administracao.');
            }

            // 4. Atualizar contexto local
            updateUser({ avatarUrl: publicUrl });
            setProfileForm(prev => ({ ...prev, avatarUrl: publicUrl }));
            alert('Foto de perfil atualizada com sucesso!');

        } catch (error: any) {
            console.error('[Avatar] Erro no upload:', error);
            alert(`Erro ao atualizar foto: ${error.message || 'Erro desconhecido.'}`);
        } finally {
            setIsUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const handleCoverClick = () => {
        if (isLocked('can_edit_cover')) {
            showLockedAlert('O banner de capa');
            return;
        }
        coverInputRef.current?.click();
    };

    const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            if (isLocked('can_edit_cover')) {
                showLockedAlert('O banner de capa');
                return;
            }
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

            const response = await apiClient.put<{ blockedFields?: string[] }>('/v1/consultor/profile', {
                coverUrl: publicUrl,
            });

            if (!response.success) {
                throw new Error(response.error || 'Falha ao salvar o banner de capa');
            }

            if ((response.data?.blockedFields || []).includes('cover')) {
                throw new Error('O banner de capa esta bloqueado pela administracao.');
            }

            updateUser({ coverUrl: publicUrl });
            setProfileForm(prev => ({ ...prev, coverUrl: publicUrl }));
            alert('Banner de capa atualizado com sucesso!');
        } catch (error: any) {
            alert(`Erro ao atualizar capa: ${error.message}`);
        } finally {
            setIsUploadingCover(false);
            if (event.target) {
                event.target.value = '';
            }
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
            const response = await apiClient.put<{ blockedFields?: string[] }>('/v1/consultor/profile', {
                name: profileForm.name,
                cpfCnpj: profileForm.cpfCnpj,
                whatsapp: profileForm.whatsapp,
                birthDate: profileForm.birthDate,
                address: {
                    zipCode: profileForm.address.zipCode,
                    street: profileForm.address.street,
                    number: profileForm.address.number,
                    neighborhood: profileForm.address.neighborhood,
                    city: profileForm.address.city,
                    state: profileForm.address.state,
                },
                bankAccount: {
                    bank: profileForm.bankAccount.bank,
                    agency: profileForm.bankAccount.agency,
                    accountNumber: profileForm.bankAccount.accountNumber,
                    accountType: profileForm.bankAccount.accountType,
                    pixKey: profileForm.bankAccount.pixKey,
                    pixKeyType: profileForm.bankAccount.pixKeyType,
                },
            });

            if (!response.success) {
                throw new Error(response.error || 'Falha ao salvar o perfil');
            }

            const blockedFields = new Set(response.data?.blockedFields || []);
            const nextProfileForm = {
                ...profileForm,
                name: blockedFields.has('name') ? user.name : profileForm.name,
                cpfCnpj: blockedFields.has('cpfCnpj') ? user.cpfCnpj : profileForm.cpfCnpj,
                whatsapp: blockedFields.has('whatsapp') ? user.whatsapp : profileForm.whatsapp,
                birthDate: blockedFields.has('birthDate') ? user.birthDate : profileForm.birthDate,
                address: {
                    ...profileForm.address,
                    zipCode: blockedFields.has('address.zipCode') ? user.address.zipCode : profileForm.address.zipCode,
                    street: blockedFields.has('address.street') ? user.address.street : profileForm.address.street,
                    number: blockedFields.has('address.number') ? user.address.number : profileForm.address.number,
                    neighborhood: blockedFields.has('address.neighborhood') ? user.address.neighborhood : profileForm.address.neighborhood,
                    city: blockedFields.has('address.city') ? user.address.city : profileForm.address.city,
                    state: blockedFields.has('address.state') ? user.address.state : profileForm.address.state,
                },
                bankAccount: {
                    ...profileForm.bankAccount,
                    bank: blockedFields.has('bank.bank') ? user.bankAccount.bank : profileForm.bankAccount.bank,
                    agency: blockedFields.has('bank.agency') ? user.bankAccount.agency : profileForm.bankAccount.agency,
                    accountNumber: blockedFields.has('bank.accountNumber') ? user.bankAccount.accountNumber : profileForm.bankAccount.accountNumber,
                    accountType: blockedFields.has('bank.accountType') ? user.bankAccount.accountType : profileForm.bankAccount.accountType,
                    pixKey: blockedFields.has('bank.pixKey') ? user.bankAccount.pixKey : profileForm.bankAccount.pixKey,
                    pixKeyType: blockedFields.has('bank.pixKey') ? user.bankAccount.pixKeyType : profileForm.bankAccount.pixKeyType,
                },
            };

            setProfileForm(nextProfileForm);
            updateUser({
                name: nextProfileForm.name,
                cpfCnpj: nextProfileForm.cpfCnpj,
                whatsapp: nextProfileForm.whatsapp,
                birthDate: nextProfileForm.birthDate,
                coverUrl: nextProfileForm.coverUrl,
                avatarUrl: nextProfileForm.avatarUrl,
                address: { ...nextProfileForm.address },
                bankAccount: { ...nextProfileForm.bankAccount },
            });

            if (blockedFields.size) {
                alert(`Perfil salvo. Alguns campos bloqueados pela administração foram ignorados: ${response.data.blockedFields.join(', ')}`);
            } else {
                alert("Perfil atualizado com sucesso no banco de dados! 💎");
            }
        } catch (e: any) {
            console.error('[Config] Erro ao salvar:', e);
            alert("Erro ao salvar no banco: " + (e.message || "Erro desconhecido"));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
            alert('Preencha a nova senha e a confirmacao.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert('A nova senha precisa ter pelo menos 6 caracteres.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('A confirmacao da senha nao confere.');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
            if (error) {
                throw error;
            }

            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
            alert('Senha atualizada com sucesso.');
        } catch (error: any) {
            alert(`Erro ao atualizar senha: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const accountId = user.code || (user.idNumerico ? String(user.idNumerico) : '---');
    const loginId = (user.loginId || user.idConsultor) && (user.loginId || user.idConsultor) !== 'RS-PRO-001'
        ? (user.loginId || user.idConsultor)
        : null;

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

            {/* Cabeçalho / Seção Hero com Suporte a Banner */}
            <div
                className="relative overflow-hidden border border-brand-gold/20 shadow-2xl p-8 rounded-2xl text-white transition-all duration-500"
                style={{
                    backgroundImage: profileForm.coverUrl ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.73)), url(${profileForm.coverUrl})` : 'linear-gradient(to right, black, #111827, black)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '220px'
                }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <IconLock size={180} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 h-full mt-auto">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-24 h-24 rounded-full border-4 border-brand-gold bg-gray-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                                {isUploading ? (
                                    <IconLoader2 className="animate-spin text-brand-gold" size={32} />
                                ) : (
                                    <img
                                        src={profileForm.avatarUrl || branding.logo}
                                        alt="Perfil"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = branding.logo;
                                        }}
                                    />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-brand-gold text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <IconImage size={16} />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold uppercase tracking-wider text-white drop-shadow-lg">{profileForm.name}</h1>
                                <div className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                    <IconCheckCircle size={10} /> VERIFICADO
                                </div>
                            </div>
                            <div className="flex flex-col drop-shadow-md">
                                {loginId && (
                                    <p className="text-xs text-gray-200 font-mono uppercase font-black">
                                        LOGIN/MMN ID: <span className="text-white">{loginId}</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-200 font-mono uppercase font-black">
                                    ID CONTA: <span className="text-brand-gold">{accountId}</span>
                                </p>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <span className="flex items-center gap-1 text-[10px] text-brand-gold font-black bg-black/40 px-2 py-1 rounded border border-brand-gold/20 tracking-widest uppercase">
                                    <IconAward size={12} /> {user.graduacao || 'CONSULTOR'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-8 py-4 bg-brand-gold hover:bg-yellow-400 text-brand-dark rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 active:scale-95"
                    >
                        <IconRotateCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIA MESTRE'}
                    </button>
                </div>
            </div>

            {permissionsMessage ? (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                    {permissionsMessage}
                </div>
            ) : null}

            {/* Main Content Area */}
            <div className="bg-white dark:bg-brand-gray/50 rounded-2xl border border-gray-200 dark:border-brand-gold/10 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Abas do Menu */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-black/20 border-r border-gray-200 dark:border-brand-gold/10">
                    {[
                        { id: 'identity', label: 'Identidade', icon: <IconUserCog size={18} /> },
                        { id: 'avatar', label: 'Foto & Capa', icon: <IconImage size={18} /> },
                        { id: 'bank', label: 'Dados Bancários', icon: <IconWallet size={18} /> },
                        { id: 'sponsor', label: 'Patrocinador', icon: <IconUser size={18} /> },
                        { id: 'security', label: 'Segurança', icon: <IconLock size={18} /> }
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
                                            disabled={isLocked('can_edit_name')}
                                            className={getFieldClass('can_edit_name')}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">CPF / CNPJ</label>
                                            <input
                                                type="text"
                                                value={profileForm.cpfCnpj}
                                                onChange={e => setProfileForm({ ...profileForm, cpfCnpj: e.target.value })}
                                                disabled={isLocked('can_edit_cpfCnpj')}
                                                className={getFieldClass('can_edit_cpfCnpj')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nascimento</label>
                                            <input
                                                type="date"
                                                value={profileForm.birthDate}
                                                onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                                                disabled={isLocked('can_edit_birthDate')}
                                                className={getFieldClass('can_edit_birthDate')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={profileForm.whatsapp}
                                            onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                            disabled={isLocked('can_edit_whatsapp')}
                                            className={getFieldClass('can_edit_whatsapp')}
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
                                                    disabled={isLocked('can_edit_cep')}
                                                    className={getFieldClass('can_edit_cep')}
                                                />
                                                {isZipLoading && <IconLoader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-gold" />}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Logradouro</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.street}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                                                disabled={isLocked('can_edit_street')}
                                                className={getFieldClass('can_edit_street')}
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
                                                disabled={isLocked('can_edit_number')}
                                                className={getFieldClass('can_edit_number')}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Bairro</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.neighborhood}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, neighborhood: e.target.value } })}
                                                disabled={isLocked('can_edit_neighborhood')}
                                                className={getFieldClass('can_edit_neighborhood')}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Cidade</label>
                                        <input
                                            type="text"
                                            value={profileForm.address.city}
                                            onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })}
                                            disabled={isLocked('can_edit_city')}
                                            className={getFieldClass('can_edit_city')}
                                        />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Estado</label>
                                        <input
                                            type="text"
                                            value={profileForm.address.state}
                                            onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })}
                                            disabled={isLocked('can_edit_state')}
                                            className={getFieldClass('can_edit_state')}
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
                                        <IconLoader2 className="animate-spin text-brand-gold" size={48} />
                                    ) : (
                                        <img
                                            src={profileForm.avatarUrl || branding.logo}
                                            alt="Prévia do Avatar"
                                            className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = branding.logo;
                                            }}
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <IconImage size={48} className="text-white" />
                                    </div>
                                </div>
                                <button onClick={handleAvatarClick} disabled={isLocked('can_edit_avatar')} className={isLocked('can_edit_avatar') ? disabledActionButtonClass : actionButtonClass}>
                                    Mudar Foto de Perfil
                                </button>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-brand-gold/5 px-2 py-1 rounded border border-brand-gold/10">
                                    ✨ Dica: Use uma imagem quadrada (ex: 500x500px) para melhor ajuste.
                                </p>
                            </div>

                            <div className="border-t border-brand-gold/10 pt-10">
                                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-[0.2em] mb-6 text-center">Banner de Capa Individual</h3>
                                <div className="max-w-2xl mx-auto">
                                    <div
                                        onClick={handleCoverClick}
                                        className="aspect-[4/1] w-full rounded-2xl border-4 border-brand-gold bg-gray-900 overflow-hidden relative group cursor-pointer shadow-2xl transition-all hover:border-white"
                                    >
                                        {isUploadingCover ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                <IconLoader2 className="animate-spin text-brand-gold" size={32} />
                                            </div>
                                        ) : profileForm.coverUrl ? (
                                            <img src={profileForm.coverUrl} alt="Prévia da Capa" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-gray-700 font-bold uppercase tracking-tighter text-xl">Sem Banner Personalizado</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <IconImage size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Proporção ideal: 4:1 (ex: 1200x300)</p>
                                        <button onClick={handleCoverClick} disabled={isLocked('can_edit_cover')} className={`flex items-center gap-2 text-xs font-bold uppercase ${isLocked('can_edit_cover') ? 'text-gray-500 cursor-not-allowed' : 'text-emerald-300 hover:text-emerald-200 hover:underline'}`}>
                                            <IconUpload size={14} /> Fazer Upload da Capa
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
                                        disabled={isLocked('can_edit_bankName')}
                                        className={getFieldClass('can_edit_bankName')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tipo de Conta</label>
                                    <select
                                        value={profileForm.bankAccount.accountType}
                                        onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, accountType: e.target.value as any } })}
                                        disabled={isLocked('can_edit_accountType')}
                                        className={`${getFieldClass('can_edit_accountType')} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%23D4AF37%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat`}
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
                                            disabled={isLocked('can_edit_agency')}
                                            className={getFieldClass('can_edit_agency')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nº da Conta</label>
                                        <input
                                            type="text"
                                            value={profileForm.bankAccount.accountNumber}
                                            onChange={e => setProfileForm({ ...profileForm, bankAccount: { ...profileForm.bankAccount, accountNumber: e.target.value } })}
                                            disabled={isLocked('can_edit_account')}
                                            className={getFieldClass('can_edit_account')}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Tipo de Chave PIX</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { value: 'email', label: 'Email' },
                                                { value: 'cpf', label: 'CPF' },
                                                { value: 'phone', label: 'Telefone' },
                                                { value: 'random', label: 'Aleatoria' },
                                            ].map((option) => {
                                                const isActive = profileForm.bankAccount.pixKeyType === option.value;
                                                const isDisabled = isLocked('can_edit_pix');
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => setProfileForm({
                                                            ...profileForm,
                                                            bankAccount: { ...profileForm.bankAccount, pixKeyType: option.value as any }
                                                        })}
                                                        className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                                                            isDisabled
                                                                ? 'border-brand-gold/10 bg-black/20 text-gray-500 cursor-not-allowed opacity-70'
                                                                : isActive
                                                                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]'
                                                                    : 'border-brand-gold/15 bg-black/20 text-gray-300 hover:border-brand-gold/40 hover:text-white'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Chave PIX</label>
                                        <input
                                            type="text"
                                            value={profileForm.bankAccount.pixKey}
                                            placeholder={
                                                profileForm.bankAccount.pixKeyType === 'email'
                                                    ? 'seu@email.com'
                                                    : profileForm.bankAccount.pixKeyType === 'cpf'
                                                        ? '000.000.000-00'
                                                        : profileForm.bankAccount.pixKeyType === 'phone'
                                                            ? '(41) 99999-9999'
                                                            : 'Cole aqui a chave aleatoria'
                                            }
                                            onChange={e => setProfileForm({
                                                ...profileForm,
                                                bankAccount: {
                                                    ...profileForm.bankAccount,
                                                    pixKey: e.target.value
                                                }
                                            })}
                                            disabled={isLocked('can_edit_pix')}
                                            className={getFieldClass('can_edit_pix')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. SPONSOR TAB */}
                    {profileTab === 'sponsor' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Dados do Patrocinador</h3>

                            {sponsorLoading ? (
                                <div className="rounded-2xl border border-brand-gold/10 bg-black/20 p-8 flex items-center justify-center">
                                    <IconLoader2 size={24} className="animate-spin text-brand-gold" />
                                </div>
                            ) : sponsorInfo ? (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-6">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold mb-2">Patrocinador Ativo</p>
                                        <h4 className="text-2xl font-black text-white uppercase">{sponsorInfo.name || 'Patrocinador RS'}</h4>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {sponsorInfo.loginId ? `LOGIN/MMN: ${sponsorInfo.loginId}` : 'Vinculado à sua rede de patrocínio'}
                                            {sponsorInfo.numericId ? `  |  ID: ${sponsorInfo.numericId}` : ''}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nome</label>
                                            <input type="text" readOnly value={sponsorInfo.name || ''} className={lockedFieldClass} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">E-mail</label>
                                            <input type="text" readOnly value={sponsorInfo.email || ''} className={lockedFieldClass} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">WhatsApp</label>
                                            <input type="text" readOnly value={sponsorInfo.whatsapp || ''} className={lockedFieldClass} />
                                            {sponsorInfo.whatsapp ? (
                                                <a
                                                    href={buildWhatsAppLink(sponsorInfo.whatsapp, user.name)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-white"
                                                >
                                                    <IconMessage size={16} />
                                                    Chamar no WhatsApp
                                                </a>
                                            ) : null}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Login / MMN ID</label>
                                            <input type="text" readOnly value={sponsorInfo.loginId || ''} className={lockedFieldClass} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-brand-gold/10 bg-black/20 p-8 text-sm text-gray-300">
                                    Nenhum patrocinador foi encontrado para esta conta. Se esta conta for da sede ou raiz da rede, isso é esperado.
                                </div>
                            )}
                        </div>
                    )}

                    {/* 5. SECURITY TAB */}
                    {profileTab === 'security' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">Proteção da Conta</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gray-100 dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-brand-gold/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full">
                                            <IconLock size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Senha de Acesso</p>
                                            <p className="text-xs text-gray-400">Use esta área para atualizar a senha de acesso da conta.</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setShowPasswordForm((prev) => !prev)} className="px-6 py-2 bg-brand-gray border border-brand-gold/20 text-brand-gold text-xs font-bold rounded-lg hover:bg-brand-dark transition-all">
                                        {showPasswordForm ? 'FECHAR' : 'ALTERAR'}
                                    </button>
                                </div>
                                {showPasswordForm ? (
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nova Senha</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                                    className={editableFieldClass}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Confirmar Nova Senha</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className={editableFieldClass}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handlePasswordChange}
                                                disabled={isUpdatingPassword}
                                                className="px-6 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-lg hover:bg-emerald-500/30 transition-all disabled:opacity-60"
                                            >
                                                {isUpdatingPassword ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="flex items-center justify-between p-6 bg-gray-100 dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-brand-gold/10 border-dashed">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                                            <IconLock size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Verificação em Duas Etapas</p>
                                            <p className="text-xs text-gray-400">Ativacao centralizada pela plataforma. Quando estiver disponivel, a configuracao aparece aqui.</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold rounded-lg">
                                        AGUARDANDO LIBERACAO
                                    </span>
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
                            disabled={isSaving || permissionsLoading}
                            className="flex items-center gap-2 px-10 py-3 bg-brand-gold hover:bg-yellow-400 text-brand-dark rounded-xl font-bold shadow-lg shadow-brand-gold/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <IconLoader2 size={18} className="animate-spin" /> : <IconSave size={18} />}
                            SALVAR ALTERAÇÕES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;
