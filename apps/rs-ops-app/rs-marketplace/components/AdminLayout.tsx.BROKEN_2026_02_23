
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { StorefrontIcon } from './icons/StorefrontIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { WalletIcon } from './icons/WalletIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { BellIcon } from './icons/BellIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
const WALLETPAY_URL = (import.meta as any).env?.VITE_WALLETPAY_URL || 'http://localhost:3005';
const RS_CDS_URL = (import.meta as any).env?.VITE_RS_CDS_URL || 'http://localhost:3203';
const RS_DROP_URL = (import.meta as any).env?.VITE_RS_DROP_URL || 'http://localhost:3103';

import { distributorsAPI } from '../services/marketplaceAPI';


interface AdminLayoutProps {
    title?: string;
    children: React.ReactNode;
    currentView: View;
    onNavigate: (view: View, data?: any) => void;
    onLogout: () => void;
}

const navGroups = [
    {
        main: { icon: DashboardIcon, label: "Dashboard", view: "consultantStore" as View }
    },
    {
        main: { icon: SparklesIcon, label: "RS Studio", view: "rsStudio" as View }
    },
    {
        main: { icon: ChatBubbleLeftRightIcon, label: "Comunicação", view: "communication" as View }
    },
    { isSeparator: true, title: "GERENCIAR" },
    {
        main: { icon: StorefrontIcon, label: "Minha Loja", view: "manageProducts" as View },
        subLinks: [
            { label: 'Produtos', view: 'manageProducts' as View },
            { label: 'Coleções', view: 'manageCollections' as View },
            { label: 'Pedidos', view: 'manageOrders' as View },
            { label: 'Cupons', view: 'managePromotions' as View },
            { label: 'Order Bump', view: 'manageOrderBump' as View },
            { label: 'Upsell', view: 'manageUpsell' as View },
            { label: 'Carrinhos Abandonados', view: 'manageAbandonedCarts' as View },
            { label: 'Avaliações', view: 'manageReviews' as View },
            { label: 'Afiliados', view: 'manageAffiliates' as View },
        ]
    },
    { isSeparator: true, title: "APARÊNCIA" },
    {
        main: { icon: PaletteIcon, label: "Personalização", view: "storeEditor" as View },
        subLinks: [
            { label: 'Meu Perfil', view: 'userProfileEditor' as View },
            { label: 'Aparência da Loja', view: 'storeEditor' as View },
        ]
    },
    {
        main: { icon: Cog6ToothIcon, label: "Configurações", view: "managePayments" as View },
        subLinks: [
            { label: 'Perfil do Consultor', view: 'consultantProfile' as View },
            { label: 'Pagamentos', view: 'managePayments' as View },
            { label: 'Frete', view: 'manageShipping' as View },
        ]
    }
];

const NavItem: React.FC<{
    item: { main: { icon: React.ElementType; label: string; view: View; }, subLinks?: { label: string; view: View; }[] };
    isCollapsed: boolean;
    currentView: View;
    onNavigate: (view: View) => void;
}> = ({ item, isCollapsed, currentView, onNavigate }) => {
    const { main, subLinks } = item;
    const isActive = currentView === main.view || (subLinks && subLinks.some(s => s.view === currentView));
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(isActive);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const navItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive && !isCollapsed) {
            setIsSubMenuOpen(false);
        }
    }, [isActive, isCollapsed]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isCollapsed && navItemRef.current && !navItemRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCollapsed]);


    const handleMainClick = () => {
        if (isCollapsed) {
            if (subLinks) {
                setIsPopoverOpen(p => !p);
            } else {
                onNavigate(main.view);
            }
        } else {
            if (subLinks) {
                setIsSubMenuOpen(p => !p);
            } else {
                onNavigate(main.view);
            }
        }
    };

    const baseClasses = "w-full flex items-center justify-between text-left px-3 rounded-md text-sm font-medium transition-all duration-200 h-11 relative group";
    const activeClasses = "bg-[rgb(var(--color-brand-gold))]/10 text-white";
    const inactiveClasses = "text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white";

    return (
        <div ref={navItemRef}>
            <button onClick={handleMainClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
                <div className="flex items-center gap-4">
                    <main.icon className={`h-6 w-6 flex-shrink-0 transition-colors ${isActive ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-text-dim))]'} group-hover:text-[rgb(var(--color-brand-gold))]`} />
                    {!isCollapsed && <span className="truncate">{main.label}</span>}
                </div>
                {!isCollapsed && subLinks && (
                    <span className={`transform transition-transform text-xs ${isSubMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[rgb(var(--color-brand-gold))] rounded-r-full"></div>}
                {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[rgb(var(--color-brand-gray))] text-white text-xs font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity delay-300 z-50">
                        {main.label}
                    </div>
                )}
            </button>

            {/* Expanded Submenu */}
            {!isCollapsed && isSubMenuOpen && subLinks && (
                <div className="pl-8 pt-2 space-y-1">
                    {subLinks.map(sub => (
                        <button key={sub.view} onClick={() => onNavigate(sub.view)}
                            className={`w-full text-left pl-5 pr-2 py-2 rounded-md text-sm transition-colors relative ${currentView === sub.view ? 'text-white font-semibold' : 'text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))]'}`}>
                            {currentView === sub.view && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-[rgb(var(--color-brand-gold))] rounded-full"></div>}
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Collapsed Popover Submenu */}
            {isCollapsed && isPopoverOpen && subLinks && (
                <div className="absolute left-full top-0 ml-2 z-50 w-56 bg-[rgba(30,30,30,0.8)] backdrop-blur-md border border-[rgb(var(--color-brand-gold))]/20 rounded-lg shadow-2xl p-2 animate-fade-in-fast">
                    {subLinks.map(sub => (
                        <button key={sub.view} onClick={() => onNavigate(sub.view)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${currentView === sub.view ? 'text-[rgb(var(--color-brand-gold))] font-semibold bg-[rgb(var(--color-brand-gray))]' : 'text-white hover:bg-[rgb(var(--color-brand-gray))]'}`}>
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children, currentView, onNavigate, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isSuperAdmin = (typeof window !== 'undefined' && (localStorage.getItem('rs-role') === 'super_admin' || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));

    const [hasCDAccess, setHasCDAccess] = useState(false);

    useEffect(() => {
        // Forçar o sidebar aberto por padrão (ignorar valores antigos do localStorage)
        try {
            localStorage.removeItem('rs-mp-sidebar-open');
        } catch { }
        setIsSidebarOpen(true);

        checkCDAccess();
    }, []);

    const checkCDAccess = async () => {
        try {
            const userId = localStorage.getItem('rs-user-id');
            if (userId) {
                const res = await distributorsAPI.list();
                const cds = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
                const myCD = cds.find((cd: any) => String(cd.owner_id) === String(userId) && cd.active);
                setHasCDAccess(!!myCD);
            }
        } catch (error) {
            console.error("Error checking CD access", error);
        }
    };
    useEffect(() => {
        localStorage.setItem('rs-mp-sidebar-open', isSidebarOpen ? '1' : '0');
    }, [isSidebarOpen]);

    const filteredNavGroups = navGroups.map(g => {
        if ('isSeparator' in g) return g as any;
        if (g.main.label === 'Personalização') {
            const base = { ...g } as any;
            base.subLinks = (g.subLinks || []).filter(sl => {
                if (isSuperAdmin) return true;
                return sl.view === 'storeEditor';
            });
            return base;
        }
        return g as any;
    });

    const adminMpGroup: any[] = [];

    return (
        <div className="flex h-screen bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))]">
            <style>{`
                @keyframes fade-in-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-fast { animation: fade-in-fast 0.15s ease-out forwards; }
            `}</style>

            {/* Overlay for mobile */}
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

            {/* Sidebar - sempre visível (forçado) */}
            <aside
                className={`
                    flex flex-col
                    bg-[rgba(18,18,18,0.98)] backdrop-blur-lg 
                    flex-shrink-0 p-3 
                    transition-all duration-300 
                    border-r border-[rgb(var(--color-brand-gold))]/20
                    ${isSidebarOpen ? 'w-72' : 'w-20'}
                `}
            >
                <div className="flex items-center justify-between h-16 px-3 mb-6 flex-shrink-0">
                    <span className={`font-display text-[rgb(var(--color-brand-gold))] transition-all duration-300 ${isSidebarOpen ? 'text-2xl' : 'text-xl'}`}>
                        {isSidebarOpen ? 'RS Prólipsi' : 'RS'}
                    </span>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:inline-flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white"
                        title="Recolher menu"
                        aria-label="Recolher menu"
                    >
                        <ChevronDoubleLeftIcon className={`h-5 w-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
                    </button>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute hidden lg:flex items-center justify-center -right-3 top-24 w-6 h-12 rounded-r-md bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gold))]/20 text-[rgb(var(--color-brand-text-dim))] hover:text-white"
                    title="Toggle menu"
                    aria-label="Toggle menu"
                >
                    <ChevronDoubleLeftIcon className={`h-4 w-4 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
                </button>
                <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
                    {[...filteredNavGroups].map((group: any, index: number) => {
                        // FIX: Use `in` operator for type guarding. `isSeparator` is not present on all types in the union,
                        // so checking for property existence is a more robust way to narrow the type.
                        if ('isSeparator' in group) {
                            return (
                                <div key={index} className={`pt-4 pb-2 px-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
                                    <p className="text-xs font-bold text-[rgb(var(--color-brand-text-dim))] uppercase tracking-wider">{group.title}</p>
                                </div>
                            );
                        }
                        else {
                            return <NavItem key={index} item={group} isCollapsed={!isSidebarOpen} currentView={currentView} onNavigate={onNavigate} />;
                        }
                    })}
                    {hasCDAccess && (
                        <button onClick={() => window.open(RS_CDS_URL, '_blank')} className={`w-full flex items-center justify-between text-left px-3 rounded-md text-sm font-medium transition-all duration-200 h-11 relative group text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white`}>
                            <div className="flex items-center gap-4">
                                <BuildingStorefrontIcon className="h-6 w-6 text-[rgb(var(--color-brand-text-dim))] group-hover:text-[rgb(var(--color-brand-gold))]" />
                                {!(!isSidebarOpen) && <span className="truncate">CDs (RS-CD)</span>}
                            </div>
                            {!(!isSidebarOpen) && <ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                        </button>
                    )}
                    <button onClick={() => window.open(RS_DROP_URL, '_blank')} className={`w-full flex items-center justify-between text-left px-3 rounded-md text-sm font-medium transition-all duration-200 h-11 relative group text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white`}>
                        <div className="flex items-center gap-4">
                            <ShoppingBagIcon className="h-6 w-6 text-[rgb(var(--color-brand-text-dim))] group-hover:text-[rgb(var(--color-brand-gold))]" />
                            {!(!isSidebarOpen) && <span className="truncate">Market / Drop / Afiliado</span>}
                        </div>
                        {!(!isSidebarOpen) && <ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => window.open(WALLETPAY_URL, '_blank')} className={`w-full flex items-center justify-between text-left px-3 rounded-md text-sm font-medium transition-all duration-200 h-11 relative group text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white`}>
                        <div className="flex items-center gap-4">
                            <WalletIcon className="h-6 w-6 text-[rgb(var(--color-brand-text-dim))] group-hover:text-[rgb(var(--color-brand-gold))]" />
                            {!(!isSidebarOpen) && <span className="truncate">WalletPay</span>}
                        </div>
                        {!(!isSidebarOpen) && <ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                    </button>
                </nav>

                <div className="flex-shrink-0 mt-auto pt-4 space-y-2">
                    <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white ${!isSidebarOpen ? 'justify-center' : ''}`}>
                        <LogoutIcon className="h-6 w-6" />
                        {!isSidebarOpen || <span className="truncate">Sair</span>}
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full hidden lg:flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))] hover:text-white"
                        title="Recolher menu"
                        aria-label="Recolher menu"
                    >
                        <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
                        {!isSidebarOpen || <span className="truncate">Recolher</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 h-20 flex items-center justify-between px-6 bg-[rgb(var(--color-brand-dark))] border-b border-[rgb(var(--color-brand-gray-light))]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden" title="Abrir menu" aria-label="Abrir menu"> <MenuIcon className="w-6 h-6" /> </button>
                        <h1 className="text-xl md:text-2xl font-bold text-white">{title || 'Painel'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-white py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Ver Loja</span>
                        </button>
                        <button className="relative text-[rgb(var(--color-brand-text-dim))] hover:text-white" title="Notificações" aria-label="Notificações">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-3 h-3 rounded-full text-xs"></span>
                        </button>
                        <button onClick={() => onNavigate('consultantProfile')} title="Meu perfil" aria-label="Meu perfil"><UserIcon className="w-8 h-8 p-1 rounded-full bg-[rgb(var(--color-brand-gray))]" /></button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
