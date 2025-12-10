import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import ThemeEditor from '../ThemeEditor';
import { AdminTab } from '../../types';
import PagesTab from './PagesTab';
import SettingsTab from './SettingsTab';
import AISettingsTab from './AISettingsTab';
import IntegrationsTab from './IntegrationsTab';
import StoreTab from './StoreTab';
import BannersTab from './BannersTab';
import OffersTab from './OffersTab';
import CartRecoveryTab from './CartRecoveryTab';
import OrdersTab from './OrdersTab';
import {
    HomeIcon, DocumentDuplicateIcon,
    PaletteIcon, SparklesIcon, KeyIcon, CogIcon,
    LogoutIcon, ViewfinderCircleIcon, XMarkIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon,
    ShoppingBagIcon,
    RectangleGroupIcon,
    TagIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
} from '../Icons';

const TABS: { id: AdminTab, labelKey: string, icon: React.ReactNode }[] = [
    { id: 'home', labelKey: 'admin_dashboard', icon: <HomeIcon /> },
    { id: 'pages', labelKey: 'admin_pages', icon: <DocumentDuplicateIcon />},
    { id: 'store', labelKey: 'admin_store', icon: <ShoppingBagIcon />},
    { id: 'offers', labelKey: 'admin_offers', icon: <TagIcon /> },
    { id: 'carts', labelKey: 'admin_carts', icon: <ShoppingCartIcon /> },
    { id: 'orders', labelKey: 'admin_orders', icon: <ClipboardDocumentListIcon /> },
    { id: 'theme', labelKey: 'admin_theme', icon: <PaletteIcon /> },
    { id: 'banners', labelKey: 'admin_banners_tab_label', icon: <RectangleGroupIcon /> },
    { id: 'ai_settings', labelKey: 'admin_ai_settings', icon: <SparklesIcon /> },
    { id: 'integrations', labelKey: 'admin_integrations', icon: <KeyIcon /> },
    { id: 'settings', labelKey: 'admin_settings', icon: <CogIcon /> },
];

const TabContent: React.FC<{ activeTab: AdminTab }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'home': return <DashboardTab />;
    case 'pages': return <PagesTab />;
    case 'store': return <StoreTab />;
    case 'offers': return <OffersTab />;
    case 'carts': return <CartRecoveryTab />;
    case 'orders': return <OrdersTab />;
    case 'theme': return <ThemeEditor />;
    case 'banners': return <BannersTab />;
    case 'settings': return <SettingsTab />;
    case 'ai_settings': return <AISettingsTab />;
    case 'integrations': return <IntegrationsTab />;
    default: return null;
  }
};

const DashboardTab: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div>
            <h2 className="text-2xl font-bold text-accent mb-4">{t('admin_welcome')}</h2>
            <p className="text-text-secondary">{t('admin_welcome_desc')}</p>
        </div>
    );
};

export const AdminPanel: React.FC = () => {
    const {
        logout, setEditMode, activeAdminTab, setActiveAdminTab,
        panelState, updatePanelState, isPanelMinimized, setIsPanelMinimized,
        openItemId, editingContainerId
    } = useAdmin();
    const { t } = useLanguage();

    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    const preMaximizeState = useRef(panelState);

    useEffect(() => {
        // When an item is opened for editing from the page, ensure the panel is visible.
        if (openItemId || editingContainerId) {
            setIsPanelMinimized(false);
        }
    }, [openItemId, editingContainerId, setIsPanelMinimized]);

    const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMaximized || (e.target as HTMLElement).closest('button, .resize-handle')) return;
        setIsDragging(true);
        dragOffset.current = { x: e.clientX - panelState.x, y: e.clientY - panelState.y };
        e.preventDefault();
    };
    
    const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
        if (isMaximized) return;
        setIsResizing(true);
        setResizeDirection(direction);
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                let newX = e.clientX - dragOffset.current.x;
                let newY = e.clientY - dragOffset.current.y;
                updatePanelState({ x: newX, y: newY });
            }
            if (isResizing) {
                let { x, y, width, height } = panelState;
                const dx = e.movementX;
                const dy = e.movementY;
                const minWidth = 400;
                const minHeight = 500;

                if (resizeDirection.includes('right')) width = Math.max(minWidth, width + dx);
                if (resizeDirection.includes('bottom')) height = Math.max(minHeight, height + dy);
                if (resizeDirection.includes('left')) {
                    const newWidth = width - dx;
                    if (newWidth >= minWidth) {
                        x += dx;
                        width = newWidth;
                    }
                }
                if (resizeDirection.includes('top')) {
                    const newHeight = height - dy;
                    if (newHeight >= minHeight) {
                        y += dy;
                        height = newHeight;
                    }
                }
                updatePanelState({ x, y, width, height });
            }
        };

        const onMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeDirection('');
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, isResizing, resizeDirection, panelState, updatePanelState]);
    
    const toggleMaximize = () => {
        if (isMaximized) {
            updatePanelState(preMaximizeState.current);
        } else {
            preMaximizeState.current = panelState;
            updatePanelState({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
        }
        setIsMaximized(!isMaximized);
    };

    const activeTabLabel = TABS.find(tab => tab.id === activeAdminTab)?.labelKey || 'admin_dashboard';
    
    const panelStyle: React.CSSProperties = {
        top: isMaximized ? 0 : `${panelState.y}px`,
        left: isMaximized ? 0 : `${panelState.x}px`,
        width: isMaximized ? '100vw' : `${panelState.width}px`,
        height: isPanelMinimized ? '4rem' : (isMaximized ? '100vh' : `${panelState.height}px`),
        borderRadius: isMaximized ? '0' : '0.5rem',
        transition: isDragging || isResizing ? 'none' : 'width 0.2s, height 0.2s, top 0.2s, left 0.2s',
    };
    
    return (
        <div
            style={panelStyle}
            className="fixed bg-background/90 backdrop-blur-md border border-border z-[60] flex flex-col shadow-2xl"
        >
            {/* Resize Handles */}
            {!isMaximized && !isPanelMinimized && (
                <>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'top')} className="absolute -top-1 left-2 right-2 h-2 cursor-ns-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'bottom')} className="absolute -bottom-1 left-2 right-2 h-2 cursor-ns-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'left')} className="absolute -left-1 top-2 bottom-2 w-2 cursor-ew-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'right')} className="absolute -right-1 top-2 bottom-2 w-2 cursor-ew-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'top-left')} className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'top-right')} className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'bottom-left')} className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize resize-handle"></div>
                    <div onMouseDown={(e) => onResizeMouseDown(e, 'bottom-right')} className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize resize-handle"></div>
                </>
            )}

            <header
                onMouseDown={onDragMouseDown}
                className={`flex-shrink-0 flex items-center justify-between h-16 border-b border-border px-4 ${isMaximized ? '' : 'cursor-move'}`}
            >
                <h2 className="text-lg font-bold text-accent tracking-wider select-none truncate">{t(activeTabLabel)}</h2>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsPanelMinimized(!isPanelMinimized)} title={isPanelMinimized ? t('admin_panel_restore') : t('admin_panel_minimize')} className="p-2 text-text-secondary hover:text-text-primary"><MinusIcon className="w-5 h-5" /></button>
                    <button onClick={toggleMaximize} title={isMaximized ? t('admin_panel_restore') : t('admin_panel_maximize')} className="p-2 text-text-secondary hover:text-text-primary">{isMaximized ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}</button>
                    <button onClick={() => setEditMode(false)} title={t('admin_panel_close')} className="p-2 text-text-secondary hover:text-text-primary"><XMarkIcon className="w-5 h-5" /></button>
                </div>
            </header>
            
            {!isPanelMinimized && (
                <>
                    <div className="flex-grow flex flex-row min-h-0">
                        <nav className="flex-shrink-0 w-20 border-r border-border p-2 space-y-1 overflow-y-auto">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveAdminTab(tab.id)} title={t(tab.labelKey)} className={`w-16 h-16 flex flex-col items-center justify-center rounded-md text-left transition-colors ${activeAdminTab === tab.id ? 'bg-accent text-button-text' : 'text-text-primary hover:bg-surface'}`}>
                                    <div className="w-6 h-6">{tab.icon}</div>
                                    <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden select-none">{t(tab.labelKey).split(' ')[0]}</span>
                                </button>
                            ))}
                        </nav>
                        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                            <TabContent activeTab={activeAdminTab} />
                        </main>
                    </div>
                    <footer className="flex-shrink-0 border-t border-border p-2 flex items-center justify-end space-x-2">
                        <button onClick={() => setEditMode(false)} title={t('admin_panel_view_site')} className="h-12 w-12 flex items-center justify-center rounded-md text-text-secondary hover:bg-surface"><ViewfinderCircleIcon className="w-5 h-5" /></button>
                        <button onClick={logout} title={t('admin_panel_logout')} className="h-12 w-12 flex items-center justify-center rounded-md text-text-secondary hover:bg-surface hover:text-red-400"><LogoutIcon className="w-5 h-5" /></button>
                    </footer>
                </>
            )}
        </div>
    );
};

const MinusIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>;

export default AdminPanel;