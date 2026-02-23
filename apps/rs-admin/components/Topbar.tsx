import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, MagnifyingGlassIcon, BellIcon, UsersIcon, CubeIcon, TrophyIcon, WalletIcon, CloseIcon, DocumentTextIcon, CycleIcon, BuildingStorefrontIcon } from './icons';

// Cleared mock data
const mockSearchConsultants: any[] = [];
const mockSearchProducts: any[] = [];
const mockSearchActivities: any[] = [];
const mockNotifications: any[] = [];


const getNotificationIcon = (iconType: string) => {
    switch (iconType) {
        case 'order': return <CubeIcon className="w-5 h-5 text-blue-400" />;
        case 'pin': return <TrophyIcon className="w-5 h-5 text-yellow-400" />;
        case 'withdrawal': return <WalletIcon className="w-5 h-5 text-green-400" />;
        case 'stock': return <CubeIcon className="w-5 h-5 text-red-400" />;
        default: return null;
    }
};

const getActivityIcon = (type: string) => {
    const props = { className: "w-5 h-5 text-gray-400" };
    switch (type) {
        case 'Pedido': return <CubeIcon {...props} />;
        case 'Promoção de PIN': return <TrophyIcon {...props} />;
        case 'Saque': return <WalletIcon {...props} />;
        case 'Fatura': return <DocumentTextIcon {...props} />;
        case 'Ativação SIGMA': return <CycleIcon {...props} />;
        default: return null;
    }
};


interface TopbarProps {
    toggleSidebar: () => void;
    setActiveView: (view: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, setActiveView }) => {
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [filteredConsultants, setFilteredConsultants] = useState(mockSearchConsultants);
    const [filteredProducts, setFilteredProducts] = useState(mockSearchProducts);
    const [filteredActivities, setFilteredActivities] = useState(mockSearchActivities);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notifications State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const hasUnread = notifications.some(n => n.unread);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsResultsOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(e.target.value);

        if (query.length > 1) {
            setFilteredConsultants(mockSearchConsultants.filter(c => c.name.toLowerCase().includes(query)));
            setFilteredProducts(mockSearchProducts.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)));
            setFilteredActivities(mockSearchActivities.filter(a => a.type.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)));
            setIsResultsOpen(true);
        } else {
            setIsResultsOpen(false);
        }
    };

    const handleResultClick = (view: string) => {
        setActiveView(view);
        setIsResultsOpen(false);
        setSearchQuery('');
    };

    const toggleNotifications = () => {
        const willBeOpen = !isNotificationsOpen;
        setIsNotificationsOpen(willBeOpen);
        if (willBeOpen && hasUnread) {
            // Mark all as read when opening after a short delay
            setTimeout(() => setNotifications(notifications.map(n => ({ ...n, unread: false }))), 2000);
        }
    };

    const handleNotificationClick = (view: string) => {
        setActiveView(view);
        setIsNotificationsOpen(false);
    };

    // User Profile State
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // 1. Get Session
                const { data: { session } } = await import('../src/services/supabase').then(m => m.supabase.auth.getSession());

                if (session?.user) {
                    const userId = session.user.id;
                    const { supabase } = await import('../src/services/supabase');

                    // 2. Try fetching from user_profiles
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('user_id', userId)
                        .maybeSingle();

                    const OFFICIAL_LOGO_RS = 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png';
                    const BANNED_PATTERNS = ['0aa67016', 'user-attachments/assets', 'google', 'ai-studio'];

                    // 3. Fallback/Logic similar to App.tsx logic
                    let avatarUrl = profile?.avatar_url || OFFICIAL_LOGO_RS;
                    const isBanned = BANNED_PATTERNS.some(p => avatarUrl?.includes(p));
                    const isMaster = session.user.email?.includes('rsprolipsi') || profile?.slug === 'rsprolipsi';

                    if (isBanned || isMaster || !profile?.avatar_url) {
                        avatarUrl = OFFICIAL_LOGO_RS;
                    }

                    if (profile) {
                        const loginId = profile.slug || profile.id_consultor || profile.consultant_id;
                        setUserProfile({
                            name: isMaster ? 'SEDE RS PRÓLIPSI' : (profile.nome_completo || profile.name || 'Administrador'),
                            avatarUrl: avatarUrl,
                            loginId: loginId && loginId.length < 20 ? loginId : null,
                            shortId: userId.split('-')[0].toUpperCase(),
                            role: 'Administrador' // Or fetch role
                        });
                    } else {
                        // If no profile, use session data with official logo fallback
                        setUserProfile({
                            name: session.user.email || 'Administrador',
                            avatarUrl: OFFICIAL_LOGO_RS,
                            loginId: null,
                            shortId: userId.split('-')[0].toUpperCase(),
                            role: 'Administrador'
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching admin profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-[#1E1E1E] border-b border-[#2A2A2A] gap-4">
            {/* Left Side */}
            <div className="flex items-center flex-shrink-0">
                <button onClick={toggleSidebar} className="text-[#9CA3AF] focus:outline-none md:hidden mr-4">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="hidden lg:block">
                    <h2 className="text-xl font-semibold text-[#E5E7EB]">Painel Administrativo</h2>
                </div>
            </div>

            {/* Search Bar (Center) */}
            <div ref={searchRef} className="relative flex-1 max-w-2xl mx-auto hidden md:flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                    type="search"
                    placeholder="Buscar consultores, produtos, atividades..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setIsResultsOpen(true)}
                    className="w-full bg-[#2A2A2A] border border-transparent text-[#E5E7EB] rounded-lg py-2.5 pl-11 pr-10 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-colors placeholder-gray-500"
                />
                {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setIsResultsOpen(false); }} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <CloseIcon className="h-5 w-5 text-gray-500 hover:text-white" />
                    </button>
                )}

                {/* Search Results Dropdown */}
                {isResultsOpen && (filteredConsultants.length > 0 || filteredProducts.length > 0 || filteredActivities.length > 0) && (
                    <div className="absolute top-full mt-2 w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                        {/* Search results rendering logic remains */}
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Notification Bell */}
                <div ref={notificationsRef} className="relative">
                    <button onClick={toggleNotifications} className="text-gray-400 hover:text-yellow-500 transition-colors p-2 rounded-full hover:bg-gray-800/80 focus:outline-none" aria-label="Notificações">
                        <BellIcon className="h-6 w-6" />
                        {hasUnread && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    {/* Notifications Panel */}
                    {isNotificationsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-2xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-[#3A3A3A]">
                                <h4 className="font-bold text-white">Notificações</h4>
                            </div>
                            {notifications.length > 0 ? (
                                <ul className="max-h-96 overflow-y-auto">
                                    {notifications.map(n => (
                                        <li key={n.id} onClick={() => handleNotificationClick(n.view)} className={`flex gap-3 p-4 border-b border-[#3A3A3A] cursor-pointer hover:bg-yellow-500/10 ${n.unread ? 'bg-black/20' : ''}`}>
                                            <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.icon)}</div>
                                            <div>
                                                <p className="text-sm text-gray-200">{n.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-8 text-center text-sm text-gray-500">Nenhuma notificação.</p>
                            )}
                            <div className="p-2 bg-black/30 text-center">
                                <button onClick={() => alert('Navegando para a página de todas as notificações...')} className="text-xs text-yellow-500 font-semibold hover:underline">Ver todas as notificações</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center cursor-pointer" onClick={() => setActiveView('Configurações')}>
                    <div className="text-right mr-4 hidden sm:block">
                        <p className="font-semibold text-[#E5E7EB]">{userProfile?.name || 'Admin'}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            {userProfile?.loginId && (userProfile.loginId !== 'RS-PRO-001') && (
                                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                    {userProfile.loginId}
                                </span>
                            )}
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                #{userProfile?.shortId || '---'}
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-[#FFD700] overflow-hidden">
                        {userProfile?.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                        ) : (
                            <UsersIcon className="w-6 h-6 text-yellow-500" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;