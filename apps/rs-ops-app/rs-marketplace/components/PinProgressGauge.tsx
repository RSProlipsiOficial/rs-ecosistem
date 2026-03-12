import React from 'react';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface GaugePin {
    name: string;
    value: number;
    imageUrl?: string;
}

interface PinProgressGaugeProps {
    currentValue: number;
    currentPin: GaugePin;
    nextPin: GaugePin;
    unitLabel?: string;
    size?: 'sm' | 'lg';
    valueFormatter?: (value: number) => string;
}

const PinProgressGauge: React.FC<PinProgressGaugeProps> = ({
    currentValue = 0,
    currentPin = { name: 'Consultor', value: 0 },
    nextPin = { name: 'Proximo', value: 10000 },
    size = 'sm',
    valueFormatter
}) => {
    const startValue = currentPin?.value || 0;
    const endValue = nextPin?.value || 0;
    const range = endValue - startValue;
    const progressInValue = currentValue - startValue;
    const progress = range > 0 ? Math.min(100, Math.max(0, (progressInValue / range) * 100)) : (currentValue >= endValue ? 100 : 0);

    const radius = 150;
    const strokeWidth = 25;
    const totalAngle = 240;
    const startAngle = 150;

    const getPoint = (angle: number, r: number) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: 200 + r * Math.cos(rad),
            y: 200 + r * Math.sin(rad)
        };
    };

    const start = getPoint(startAngle, radius);
    const end = getPoint(startAngle + totalAngle, radius);
    const progressAngle = startAngle + (progress / 100) * totalAngle;
    const progressPos = getPoint(progressAngle, radius);

    const iconSize = size === 'lg' ? 'h-60 w-60' : 'h-16 w-16';

    const renderPinIcon = (pin: GaugePin, isCurrent: boolean) => {
        if (pin?.imageUrl) {
            return (
                <img
                    src={pin.imageUrl}
                    alt={pin.name}
                    className={`${iconSize} object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.55)]`}
                    onError={(event) => {
                        event.currentTarget.src = 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png';
                    }}
                />
            );
        }

        if (isCurrent) {
            return (
                <div className={`relative flex items-center justify-center ${iconSize} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-600 shadow-2xl overflow-hidden`}>
                    <StarOutlineIcon className={size === 'lg' ? 'h-24 w-24 text-[#d4af37]' : 'h-8 w-8 text-[#d4af37]'} />
                    <div className="absolute inset-0 bg-white/5 opacity-10" />
                </div>
            );
        }

        return <TrophyIcon className={`${iconSize} text-[#d4af37] drop-shadow-lg`} />;
    };

    return (
        <div className={`relative flex items-center justify-center ${size === 'lg' ? 'w-[760px] min-h-[430px]' : 'w-[320px] min-h-[220px]'} mx-auto`}>
            <div className={`absolute ${size === 'lg' ? '-left-[19rem]' : '-left-16'} flex flex-col items-center z-20`}>
                {renderPinIcon(currentPin, true)}
                <div className={`${size === 'lg' ? 'mt-12' : 'mt-2'} bg-black/70 px-6 py-2 rounded-xl border border-white/10 shadow-2xl`}>
                    <p className={`font-black text-white uppercase tracking-[0.3em] ${size === 'lg' ? 'text-lg' : 'text-[10px]'} whitespace-nowrap`}>
                        {currentPin?.name}
                    </p>
                </div>
            </div>

            <svg viewBox="0 0 400 320" className="w-full h-full overflow-visible drop-shadow-2xl">
                <defs>
                    <linearGradient id="marketplaceGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1f2a44" />
                        <stop offset="52%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <filter id="marketplaceGaugeGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <path
                    d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`}
                    stroke="#0f172a"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.55"
                />

                {progress > 0 && (
                    <path
                        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progress > 75 ? 1 : 0} 1 ${progressPos.x} ${progressPos.y}`}
                        stroke="url(#marketplaceGaugeGradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#marketplaceGaugeGlow)"
                    />
                )}

                <g filter="url(#marketplaceGaugeGlow)">
                    <circle cx={progressPos.x} cy={progressPos.y} r={strokeWidth * 0.7} fill="#10b981" />
                    <circle cx={progressPos.x} cy={progressPos.y} r={strokeWidth * 0.3} fill="white" />
                </g>

                <text x="200" y="170" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="900" letterSpacing="0.30em" opacity="0.75">
                    META: {valueFormatter ? valueFormatter(endValue) : endValue}
                </text>
                <text x="200" y="235" textAnchor="middle" fill="#ffffff" fontSize="72" fontWeight="900">
                    {Math.round(progress)}%
                </text>
                <text x="200" y="270" textAnchor="middle" fill="#d1d5db" fontSize="14" fontWeight="900" letterSpacing="0.40em" opacity="0.85">
                    COMPLETO
                </text>
            </svg>

            <div className={`absolute ${size === 'lg' ? '-right-[19rem]' : '-right-16'} flex flex-col items-center z-20`}>
                {renderPinIcon(nextPin, false)}
                <div className={`${size === 'lg' ? 'mt-12' : 'mt-2'} bg-black/70 px-6 py-2 rounded-xl border border-white/10 shadow-2xl`}>
                    <p className={`font-black text-white uppercase tracking-[0.3em] ${size === 'lg' ? 'text-lg' : 'text-[10px]'} whitespace-nowrap`}>
                        {nextPin?.name}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PinProgressGauge;
