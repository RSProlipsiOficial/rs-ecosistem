import React from 'react';

export const PixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Diamante externo */}
        <path d="M12 3 L21 12 L12 21 L3 12 Z" />
        {/* Curvas internas estilizadas (inspirado no símbolo Pix) */}
        <path d="M7.5 12c0-1.8 1.45-3.25 3.25-3.25h2.5c1.8 0 3.25 1.45 3.25 3.25" />
        <path d="M16.5 12c0 1.8-1.45 3.25-3.25 3.25h-2.5C9.95 15.25 8.5 13.8 8.5 12" />
    </svg>
);
