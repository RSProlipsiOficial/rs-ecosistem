

import React from 'react';
import type { View, SubscriptionStatus } from '../../App';
import type { AppConfig } from '../ControlPanel';

interface HeaderNavAndStatusProps {
    wsStatus: 'connecting' | 'connected' | 'disconnected';
    activeView: View;
    setActiveView: (view: View) => void;
    appConfig: Partial<AppConfig>;
    onLiveModeChange: (isLive: boolean) => void;
    isConnected: boolean;
    subscriptionStatus: SubscriptionStatus;
}

const HeaderNavAndStatus: React.FC<HeaderNavAndStatusProps> = ({ wsStatus, activeView, setActiveView, appConfig, onLiveModeChange, isConnected, subscriptionStatus }) => {
    const statusIndicator = {
        connecting: { text: 'CONECTANDO', color: 'text-yellow-400', ring: 'ring-yellow-400/50', bg: 'bg-yellow-500' },
        connected: { text: 'ONLINE', color: 'text-green-400', ring: 'ring-green-400/50', bg: 'bg-green-500' },
        disconnected: { text: 'OFFLINE', color: 'text-red-400', ring: 'ring-red-400/50', bg: 'bg-red-500' },
    };

    const navItems: { view: View, label: string }[] = [
        { view: 'analysis', label: 'Análise' },
        { view: 'dashboard', label: 'Dashboard' },
        { view: 'robots', label: 'Robôs' },
    ];

    const mobileButtonBase = "py-2 px-1 text-xs font-semibold rounded-md transition-colors text-center";
    const mobileButtonActive = "bg-amber-500 text-black";
    const mobileButtonInactive = "bg-zinc-700 text-zinc-300";

    return (
        <div className="w-full h-full">
            {/* Desktop View */}
            <div className="hidden lg:flex items-center justify-between w-full h-full bg-zinc-800/50 rounded-xl px-2 md:px-6 border border-zinc-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2" title={`Status da conexão: ${statusIndicator[wsStatus].text}`}>
                        <div className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusIndicator[wsStatus].ring} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${statusIndicator[wsStatus].bg}`}></span>
                        </div>
                        <span className={`${statusIndicator[wsStatus].color} font-semibold tracking-wider hidden sm:inline`}>{statusIndicator[wsStatus].text}</span>
                    </div>
                    {wsStatus === 'connected' && subscriptionStatus === 'grace_period' && (
                    <div className="flex items-center gap-2 animate-pulse" title="Sua assinatura expirou. Renove para evitar o bloqueio.">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full ring-red-400/50 bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </div>
                        <span className="text-red-400 font-semibold tracking-wider hidden sm:inline">PAGAMENTO PENDENTE</span>
                    </div>
                    )}
                </div>

                <div className="hidden lg:flex items-center justify-center gap-10">
                    {navItems.map(item => (
                        <button 
                            key={item.view}
                            onClick={() => setActiveView(item.view)} 
                            className={`text-base font-semibold transition-colors pb-1 border-b-2 ${activeView === item.view ? 'text-amber-300 border-amber-300' : 'text-zinc-400 border-transparent hover:text-zinc-200'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-900/50">
                    <button onClick={() => onLiveModeChange(false)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex-1 ${!appConfig.live ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'}`} disabled={!isConnected}>Simulação</button>
                    <button onClick={() => onLiveModeChange(true)} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex-1 ${appConfig.live ? 'bg-green-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'}`} disabled={!isConnected}>Conta Real</button>
                </div>
            </div>

             {/* Mobile View */}
            <div className="lg:hidden flex flex-col space-y-2">
                {/* Row 1: Status & Mode */}
                <div className="grid grid-cols-3 gap-2">
                    <div className={`py-2 px-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 ${statusIndicator[wsStatus].color} bg-zinc-800/50 border border-zinc-700`}>
                        <div className={`relative flex h-2 w-2`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusIndicator[wsStatus].ring} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusIndicator[wsStatus].bg}`}></span>
                        </div>
                        {statusIndicator[wsStatus].text}
                    </div>
                    <button
                        onClick={() => onLiveModeChange(false)}
                        className={`${mobileButtonBase} ${!appConfig.live ? 'bg-yellow-500 text-black' : mobileButtonInactive}`}
                        disabled={!isConnected}
                    >
                        Simulação
                    </button>
                    <button
                        onClick={() => onLiveModeChange(true)}
                        className={`${mobileButtonBase} ${appConfig.live ? 'bg-green-500 text-black' : mobileButtonInactive}`}
                        disabled={!isConnected}
                    >
                        Conta Real
                    </button>
                </div>

                {/* Row 2: Navigation */}
                <div className="grid grid-cols-3 gap-2">
                {navItems.map(item => (
                    <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`${mobileButtonBase} ${activeView === item.view ? mobileButtonActive : mobileButtonInactive}`}
                    >
                    {item.label}
                    </button>
                ))}
                </div>
            </div>
        </div>
    );
};

export default HeaderNavAndStatus;