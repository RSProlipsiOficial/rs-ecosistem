import React from 'react';

interface TabButtonProps {
    icon?: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button 
        type="button" 
        onClick={onClick} 
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${ isActive ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400 hover:text-slate-100' }`}
    >
        {icon} {label}
    </button>
);