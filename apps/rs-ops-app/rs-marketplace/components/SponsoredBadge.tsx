import React from 'react';

interface SponsoredBadgeProps {
    plan?: 'basic' | 'pro' | 'elite';
    className?: string;
    compact?: boolean;
}

export const SponsoredBadge: React.FC<SponsoredBadgeProps> = ({ plan = 'basic', className = '', compact = false }) => {
    const getPlanConfig = () => {
        switch (plan) {
            case 'elite':
                return {
                    bg: 'bg-rs-gold',
                    text: 'text-black',
                    label: 'Destaque Elite',
                    icon: '👑'
                };
            case 'pro':
                return {
                    bg: 'bg-purple-600',
                    text: 'text-white',
                    label: 'Patrocinado',
                    icon: '⚡'
                };
            default:
                return {
                    bg: 'bg-blue-600',
                    text: 'text-white',
                    label: 'Promovido',
                    icon: '📢'
                };
        }
    };

    const config = getPlanConfig();

    if (compact) {
        return (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${config.bg} ${config.text} shadow-sm ${className}`} title={config.label}>
                <span className="text-[9px]">{config.icon}</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bg} shadow-md backdrop-blur-md bg-opacity-90 ${className}`}>
            <span className="text-[10px]">{config.icon}</span>
            <span className={`text-[9px] font-black uppercase tracking-wider ${config.text}`}>
                {config.label}
            </span>
        </div>
    );
};

export default SponsoredBadge;
