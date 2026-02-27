import React, { FC, useMemo } from 'react';
import { IconAward } from '../../components/icons';
import { SigmaConfig } from '../services/sigmaApi';

interface PinProgressGaugeProps {
    currentValue: number;
    currentPin: { name: string; value: number; imageUrl?: string };
    nextPin: { name: string; value: number; imageUrl?: string };
    unitLabel: string; // Ex: "DE VOLUME" ou "CICLOS"
    size?: 'sm' | 'lg';
    valueFormatter?: (val: number) => string;
}

const PinProgressGauge: FC<PinProgressGaugeProps> = ({
    currentValue = 0,
    currentPin = { name: 'Consultor', value: 0 },
    nextPin = { name: 'Próximo', value: 10000 },
    unitLabel,
    size = 'sm',
    valueFormatter
}) => {
    const startValue = currentPin?.value || 0;
    const endValue = nextPin?.value || 0;
    const range = endValue - startValue;
    const progressInValue = currentValue - startValue;
    const progress = range > 0 ? Math.min(100, (progressInValue / range) * 100) : (currentValue >= endValue ? 100 : 0);

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

    const currentPinName = currentPin.name;
    const nextPinName = nextPin.name;

    const renderPinIcon = (pin: { name: string; imageUrl?: string }, isCurrent: boolean) => {
        const logo = pin?.imageUrl;
        const name = pin?.name || '';
        const iconSize = size === 'lg' ? 'h-56 w-56' : 'h-16 w-16';

        if (logo) return <img src={logo} alt={name} className={`${iconSize} object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] animate-float`} />;

        if (name === 'Consultor') {
            return (
                <div className={`relative flex items-center justify-center ${iconSize} rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-brand-gray-light shadow-2xl overflow-hidden`}>
                    <IconAward size={size === 'lg' ? 120 : 32} className="text-gray-400 opacity-60" />
                    <div className="absolute inset-0 bg-white/5 opacity-10"></div>
                </div>
            );
        }

        return <IconAward className={`${iconSize} drop-shadow-lg`} style={{ color: isCurrent ? '#FFD700' : '#4B5563' }} />;
    };

    return (
        <div className={`relative flex items-center justify-center ${size === 'lg' ? 'w-[700px] min-h-[400px]' : 'w-[320px] min-h-[220px]'} mx-auto animate-fade-in`}>
            {/* PIN ATUAL */}
            <div className={`absolute ${size === 'lg' ? '-left-72' : '-left-16'} flex flex-col items-center z-20`}>
                {renderPinIcon(currentPin, true)}
                <div className={`${size === 'lg' ? 'mt-12' : 'mt-2'} bg-black/70 px-6 py-2 rounded-xl border border-white/10 shadow-3xl`}>
                    <p className={`font-black text-white uppercase tracking-[0.3em] ${size === 'lg' ? 'text-lg' : 'text-[10px]'} whitespace-nowrap`}>
                        {currentPin?.name}
                    </p>
                </div>
            </div>

            <svg viewBox="0 0 400 320" className="w-full h-full drop-shadow-2xl overflow-visible">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="50%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Track */}
                <path
                    d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`}
                    stroke="#111827"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className="opacity-40"
                />

                {/* Os PINs já estão sendo renderizados via divs absolutas acima. Removendo foreignObject duplicado para evitar confusão e erros extras */}

                {/* Progress */}
                {progress > 0 && (
                    <path
                        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progress > 75 ? 1 : 0} 1 ${progressPos.x} ${progressPos.y}`}
                        stroke="url(#gaugeGradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="transition-all duration-1000 ease-out"
                    />
                )}

                {/* Dot Indicador */}
                <g filter="url(#glow)">
                    <circle
                        cx={progressPos.x}
                        cy={progressPos.y}
                        r={strokeWidth * 0.7}
                        fill="#10B981"
                        className="transition-all duration-1000 ease-out"
                    />
                    <circle
                        cx={progressPos.x}
                        cy={progressPos.y}
                        r={strokeWidth * 0.3}
                        fill="white"
                        className="transition-all duration-1000 ease-out"
                    />
                </g>

                {/* Labels Centrais */}
                <text x="200" y="170" textAnchor="middle" className="fill-gray-400 text-[11px] font-black tracking-[0.3em] uppercase opacity-60">
                    META: {valueFormatter ? valueFormatter(endValue) : endValue}
                </text>
                <text x="200" y="235" textAnchor="middle" className="fill-white text-7xl font-black tracking-tighter drop-shadow-2xl">
                    {Math.round(progress)}%
                </text>
                <text x="200" y="270" textAnchor="middle" className="fill-gray-300 text-sm font-black uppercase tracking-[0.4em] opacity-80">
                    COMPLETO
                </text>
            </svg>

            {/* PRÓXIMO PIN */}
            <div className={`absolute ${size === 'lg' ? '-right-72' : '-right-16'} flex flex-col items-center z-20`}>
                {renderPinIcon(nextPin, false)}
                <div className={`${size === 'lg' ? 'mt-12' : 'mt-2'} bg-black/70 px-6 py-2 rounded-xl border border-white/10 shadow-3xl`}>
                    <p className={`font-black text-white uppercase tracking-[0.3em] ${size === 'lg' ? 'text-lg' : 'text-[10px]'} whitespace-nowrap`}>
                        {nextPin?.name}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PinProgressGauge;
