import React from 'react';

export const NortonSealIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 160 64"
    >
        <g fill="none" fillRule="evenodd">
            <rect width="160" height="64" fill="#1C1C1C" rx="4"/>
            <path fill="#FBB03B" d="M32 49c9.389 0 17-7.611 17-17S41.389 15 32 15 15 22.611 15 32s7.611 17 17 17z"/>
            <path fill="#1C1C1C" d="M26.435 31.06l5.249 5.249 9.878-9.878-2.121-2.121-7.757 7.757-3.128-3.128z"/>
            <text fontFamily="Arial-BoldMT, Arial" fontSize="11" fontWeight="bold" fill="#FFF">
                <tspan x="62" y="30">Norton</tspan>
                <tspan x="62" y="42">SECURED</tspan>
            </text>
        </g>
    </svg>
);