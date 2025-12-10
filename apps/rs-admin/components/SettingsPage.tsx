import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../src/services/api';
import { 
    UserPlusIcon, 
    TrashIcon, 
    PhotoIcon, 
    ArrowUpTrayIcon, 
    BuildingOffice2Icon, 
    PaintBrushIcon, 
    FingerPrintIcon, 
    GlobeAltIcon, 
    EnvelopeIcon, 
    ArrowsRightLeftIcon, 
    SpinnerIcon, 
    CheckCircleIcon,
    KeyIcon,
    PlusIcon
} from './icons';

// Custom Checkbox component for a better UI
const Checkbox: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
    <div 
        onClick={onChange}
        className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer transition-colors ${
            checked ? 'bg-yellow-500 border-yellow-500' : 'bg-gray-700 border-gray-600 hover:border-yellow-500'
        } border`}
        aria-checked={checked}
        role="checkbox"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ') onChange(); }}
    >
        {checked && (
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        )}
    </div>
);


interface SettingsCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon, children, footer }) => (
    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <header className="flex items-center p-4 bg-black/30 border-b border-gray-800">
            {icon}
            <h2 className="text-xl font-semibold text-white ml-3">{title}</h2>
        </header>
        <div className="p-6">
            {children}
        </div>
        {footer && (
             <footer className="p-4 bg-black/30 border-t border-gray-800 flex justify-end">
                {footer}
            </footer>
        )}
    </div>
);

interface SettingsRowProps {
    label: string;
    children?: React.ReactNode;
    description?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, children, description }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2 border-b border-gray-800 last:border-b-0">
        <div>
            <label className="text-sm font-medium text-gray-300">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2 relative flex items-center">
             {children}
        </div>
    </div>
);

const baseSelectClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";
const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";


const permissionsList: { [key: string]: string } = {
  viewFinancialReports: 'Ver relatórios financeiros',
  editConsultantData: 'Editar dados de consultores',
  manageGlobalSettings: 'Gerenciar configurações gerais',
  approveShopOrders: 'Aprovar pedidos da loja',
  manageUserRoles: 'Gerenciar permissões e usuários',
};

type SaveStatus = 'idle' | 'saving' | 'success';

const SaveButton: React.FC<{
    status: SaveStatus;
    onClick: () => void;
    text?: string;
}> = ({ status, onClick, text = "Salvar" }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={status !== 'idle'}
            className={`flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg transition-all duration-300 w-44 text-center ${
                status === 'idle' ? 'bg-yellow-500 text-black hover:bg-yellow-600' :
                status === 'saving' ? 'bg-yellow-500/50 text-black cursor-wait' :
                'bg-green-600 text-white'
            }`}
        >
            {status === 'idle' && text}
            {status === 'saving' && <><SpinnerIcon className="w-5 h-5 animate-spin" /> Salvando...</>}
            {status === 'success' && <><CheckCircleIcon className="w-5 h-5" /> Salvo!</>}
        </button>
    );
};


const SettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await settingsAPI.getAllSettings();
            if (res?.data?.success) {
                // Atualizar settings com dados da API
            }
        } catch (err) {
            setError('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const [profile, setProfile] = useState({
        companyName: 'RSPrólipsi Comércio LTDA',
        name: 'Roberto',
        surname: 'Camargo',
        cpf: '123.456.789-00',
        cnpj: '12.345.678/0001-99',
        avatar: 'https://picsum.photos/seed/roberto/100',
    });
    const [branding, setBranding] = useState<{ logo: string | null, favicon: string | null }>({
        logo: null,
        favicon: null,
    });
    
    // Save statuses
    const [profileSaveStatus, setProfileSaveStatus] = useState<SaveStatus>('idle');
    const [brandingSaveStatus, setBrandingSaveStatus] = useState<SaveStatus>('idle');
    const [permissionsSaveStatus, setPermissionsSaveStatus] = useState<SaveStatus>('idle');
    const [localizationSaveStatus, setLocalizationSaveStatus] = useState<SaveStatus>('idle');
    const [apiKeysSaveStatus, setApiKeysSaveStatus] = useState<SaveStatus>('idle');

    const handleSave = (setStatus: React.Dispatch<React.SetStateAction<SaveStatus>>) => {
        setStatus('saving');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2500);
        }, 1500);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (type: 'avatar' | 'logo' | 'favicon', file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') {
                    setProfile(prev => ({ ...prev, avatar: reader.result as string }));
                } else {
                    setBranding(prev => ({ ...prev, [type]: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const [roles, setRoles] = useState([
        {
            name: 'Admin',
            permissions: { viewFinancialReports: true, editConsultantData: true, manageGlobalSettings: true, approveShopOrders: true, manageUserRoles: true, },
        },
        {
            name: 'Líder',
            permissions: { viewFinancialReports: true, editConsultantData: true, manageGlobalSettings: false, approveShopOrders: false, manageUserRoles: false, },
        },
        {
            name: 'Consultor',
            permissions: { viewFinancialReports: false, editConsultantData: false, manageGlobalSettings: false, approveShopOrders: false, manageUserRoles: false, },
        },
    ]);
    
    const [users, setUsers] = useState([
        { email: 'roberto.camargo@example.com', role: 'Admin' },
        { email: 'lider.equipe@example.com', role: 'Líder' },
    ]);

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('Consultor');

    const handlePermissionToggle = (roleIndex: number, permissionKey: string) => {
        setRoles(currentRoles => {
            const newRoles = JSON.parse(JSON.stringify(currentRoles));
            newRoles[roleIndex].permissions[permissionKey] = !newRoles[roleIndex].permissions[permissionKey];
            return newRoles;
        });
    };
    
    const handleUserRoleChange = (email: string, newRole: string) => {
        setUsers(currentUsers => currentUsers.map(u => u.email === email ? { ...u, role: newRole } : u));
    };

    const handleRemoveUser = (email: string) => {
        setUsers(currentUsers => currentUsers.filter(u => u.email !== email));
    };
    
    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserEmail && !users.find(u => u.email === newUserEmail)) {
            setUsers([...users, { email: newUserEmail, role: newUserRole }]);
            setNewUserEmail('');
            setNewUserRole('Consultor');
        } else {
            alert('Email inválido ou já existente.');
        }
    };

    const [localization, setLocalization] = useState({ language: 'pt-BR', currency: 'BRL' });
    const handleLocalizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => setLocalization(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const [apiKeys, setApiKeys] = useState({ mercadoPago: 'pk_test_************************', logistics: 'log_live_************************' });
    const handleApiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => setApiKeys(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const ImageUpload: React.FC<{ label: string; description: string; currentImage: string | null; onImageChange: (file: File | null) => void; recommendedSize: string; }> = ({ label, description, currentImage, onImageChange, recommendedSize }) => (
        <SettingsRow label={label} description={description}>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                    {currentImage ? (
                        <img src={currentImage} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                    ) : (
                        <PhotoIcon className="w-10 h-10 text-gray-500" />
                    )}
                </div>
                <div className="flex-1">
                    <label htmlFor={`${label}-upload`} className="cursor-pointer bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm">
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        Carregar Imagem
                    </label>
                    <input id={`${label}-upload`} type="file" accept="image/png, image/jpeg, image/svg+xml, image/x-icon" className="hidden" onChange={e => onImageChange(e.target.files ? e.target.files[0] : null)} />
                    <p className="text-xs text-gray-500 mt-2">Tamanho recomendado: {recommendedSize}.</p>
                </div>
            </div>
        </SettingsRow>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-6">Configurações Gerais</h1>
            
            <SettingsCard 
                title="Meu Perfil / Dados da Empresa" 
                icon={<BuildingOffice2Icon className="w-6 h-6 text-yellow-500" />}
                footer={<SaveButton status={profileSaveStatus} onClick={() => handleSave(setProfileSaveStatus)} text="Salvar Perfil" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <SettingsRow label="Nome da Empresa"><input name="companyName" value={profile.companyName} onChange={handleProfileChange} className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="CNPJ"><input name="cnpj" value={profile.cnpj} onChange={handleProfileChange} className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="Nome"><input name="name" value={profile.name} onChange={handleProfileChange} className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="Sobrenome"><input name="surname" value={profile.surname} onChange={handleProfileChange} className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="CPF"><input name="cpf" value={profile.cpf} onChange={handleProfileChange} className={baseInputClasses} /></SettingsRow>
                </div>
                <ImageUpload label="Foto de Perfil" description="Sua foto que aparece no topo do painel." currentImage={profile.avatar} onImageChange={(file) => handleImageChange('avatar', file)} recommendedSize="100x100 pixels"/>
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Alterar Senha</h3>
                    <SettingsRow label="Senha Atual"><input type="password" placeholder="********" className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="Nova Senha"><input type="password" placeholder="********" className={baseInputClasses} /></SettingsRow>
                    <SettingsRow label="Confirmar Nova Senha"><input type="password" placeholder="********" className={baseInputClasses} /></SettingsRow>
                </div>
            </SettingsCard>

            <SettingsCard 
                title="Identidade Visual (Branding)" 
                icon={<PaintBrushIcon className="w-6 h-6 text-yellow-500" />}
                footer={<SaveButton status={brandingSaveStatus} onClick={() => handleSave(setBrandingSaveStatus)} text="Salvar Branding" />}
            >
                <ImageUpload label="Logo do Painel" description="Aparece no topo da barra lateral." currentImage={branding.logo} onImageChange={(file) => handleImageChange('logo', file)} recommendedSize="200x50px (SVG/PNG)"/>
                <ImageUpload label="Favicon" description="Ícone na aba do navegador." currentImage={branding.favicon} onImageChange={(file) => handleImageChange('favicon', file)} recommendedSize="32x32px (PNG/ICO)"/>
            </SettingsCard>
            
            <SettingsCard 
                title="Permissões de Acesso e Usuários" 
                icon={<FingerPrintIcon className="w-6 h-6 text-yellow-500" />}
                footer={<SaveButton status={permissionsSaveStatus} onClick={() => handleSave(setPermissionsSaveStatus)} text="Salvar Permissões" />}
            >
                 <h3 className="text-lg font-semibold text-white mb-4">Gerenciar Funções</h3>
                 <div className="overflow-x-auto mb-8"><table className="w-full text-sm text-left"><thead className="text-xs text-yellow-500 uppercase bg-black/20"><tr><th className="px-4 py-3">Permissão</th>{roles.map(role => (<th key={role.name} className="px-4 py-3 text-center">{role.name}</th>))}</tr></thead><tbody>{Object.entries(permissionsList).map(([key, label]) => (<tr key={key} className="border-b border-gray-800"><td className="px-4 py-3 text-gray-300">{label}</td>{roles.map((role, roleIndex) => (<td key={role.name} className="px-4 py-3 text-center"><div className="flex justify-center"><Checkbox checked={role.permissions[key]} onChange={() => handlePermissionToggle(roleIndex, key)}/></div></td>))}</tr>))}</tbody></table></div>
                 <h3 className="text-lg font-semibold text-white mb-4 pt-4 border-t border-gray-700">Gerenciar Usuários</h3>
                 <div className="space-y-3 mb-6">{users.map(user => (<div key={user.email} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-gray-900/50 rounded-lg"><span className="text-gray-300 truncate">{user.email}</span><select value={user.role} onChange={(e) => handleUserRoleChange(user.email, e.target.value)} className={baseSelectClasses}>{roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}</select><div className="text-right"><button onClick={() => handleRemoveUser(user.email)} className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-gray-700/50 transition-colors"><TrashIcon className="w-5 h-5" /></button></div></div>))}</div>
                 <form onSubmit={handleInviteUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 bg-black/30 rounded-lg"><input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@dominio.com" className={baseInputClasses} required/><select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className={baseSelectClasses}>{roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}</select><button type="submit" className="flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors"><UserPlusIcon className="w-5 h-5" />Convidar Usuário</button></form>
            </SettingsCard>

            <SettingsCard 
                title="Idiomas e Moedas" 
                icon={<GlobeAltIcon className="w-6 h-6 text-yellow-500" />}
                footer={<SaveButton status={localizationSaveStatus} onClick={() => handleSave(setLocalizationSaveStatus)} text="Salvar Idiomas" />}
            >
                <div className="space-y-2">
                    <SettingsRow label="Idioma Padrão"><select name="language" value={localization.language} onChange={handleLocalizationChange} className={baseSelectClasses}><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (United States)</option><option value="es-ES">Español (España)</option></select></SettingsRow>
                    <SettingsRow label="Moeda Padrão"><select name="currency" value={localization.currency} onChange={handleLocalizationChange} className={baseSelectClasses}><option value="BRL">Real Brasileiro (R$)</option><option value="USD">Dólar Americano ($)</option><option value="EUR">Euro (€)</option></select></SettingsRow>
                </div>
            </SettingsCard>
            <SettingsCard 
                title="Integrações" 
                icon={<ArrowsRightLeftIcon className="w-6 h-6 text-yellow-500" />}
                footer={<SaveButton status={apiKeysSaveStatus} onClick={() => handleSave(setApiKeysSaveStatus)} text="Salvar Chaves" />}
            >
                <div className="space-y-2">
                    <SettingsRow label="Mercado Pago (API Key)"><input name="mercadoPago" type="password" value={apiKeys.mercadoPago} onChange={handleApiKeysChange} className={baseInputClasses}/></SettingsRow>
                    <SettingsRow label="Logística (API Key)"><input name="logistics" type="password" value={apiKeys.logistics} onChange={handleApiKeysChange} className={baseInputClasses}/></SettingsRow>
                </div>
            </SettingsCard>

             <SettingsCard
                title="API & Webhooks"
                icon={<KeyIcon className="w-6 h-6 text-yellow-500" />}
            >
                <h3 className="text-lg font-semibold text-white mb-4">Chaves de API</h3>
                <p className="text-sm text-gray-400 mb-4">Use estas chaves para integrar seus sistemas com a plataforma RSPrólipsi. Mantenha sua chave secreta segura!</p>
                <div className="space-y-3">
                    <SettingsRow label="Chave Pública (Publishable Key)">
                        <input type="text" readOnly value="pk_live_************************" className={baseInputClasses} />
                    </SettingsRow>
                    <SettingsRow label="Chave Secreta (Secret Key)">
                         <input type="password" readOnly value="sk_live_************************" className={baseInputClasses} />
                    </SettingsRow>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-4 pt-6 border-t border-gray-700 mt-6">Webhooks</h3>
                <p className="text-sm text-gray-400 mb-4">Receba notificações em tempo real sobre eventos na plataforma, como novos pedidos ou pagamentos.</p>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                        <div className="font-mono text-sm text-gray-300">https://api.seu-erp.com/webhook/rsprolipsi</div>
                        <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Ativo</span>
                    </div>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">URL do Endpoint</label>
                        <input type="url" placeholder="https://seu-servidor.com/webhook" className={baseInputClasses} />
                    </div>
                    <button type="submit" onClick={(e) => e.preventDefault()} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        <PlusIcon className="w-5 h-5" />Adicionar Webhook
                    </button>
                </form>
            </SettingsCard>

            <SettingsCard title="Templates de Notificações" icon={<EnvelopeIcon className="w-6 h-6 text-yellow-500" />}>
                <p className="text-sm text-gray-300">Gerencie os templates de e-mail, push e WhatsApp enviados aos consultores.</p>
                <div className="flex justify-start pt-4">
                    <button className="bg-gray-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors">Gerenciar Templates</button>
                </div>
            </SettingsCard>
        </div>
    );
};

export default SettingsPage;