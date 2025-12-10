import React from 'react';

export const QualityGuaranteeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
    >
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#fde047', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
            </radialGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="1" dy="1" result="offsetblur"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#shadow)">
            <path d="M50 0 L55 25 L75 25 L60 40 L65 65 L50 50 L35 65 L40 40 L25 25 L45 25 Z" fill="url(#grad1)" transform="scale(1.3) translate(-15, -10)" />
            <circle cx="50" cy="50" r="32" fill="url(#grad1)" stroke="#ca8a04" strokeWidth="2"/>
            <path d="M38 50 l8 8 l16 -16" stroke="#1c1c1c" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="50" y="35" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1c1c1c">QUALIDADE</text>
            <text x="50" y="70" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1c1c1c">GARANTIDA</text>
        </g>
    </svg>
);