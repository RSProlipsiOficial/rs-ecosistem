import React from 'react';

export const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 74 24"
        fill="none"
    >
        <path d="M60.48 23.64H69.5L74 0H64.93L60.48 23.64z" fill="#142688" />
        <path d="M43.02 23.64l4.4-23.64h-8.82l-4.41 23.64h8.83z" fill="#142688" />
        <path d="M30.41 6.34L26.37 0H17.2l4.4 23.64h8.82L34.82 6.34h-4.41z" fill="#F7A600" />
        <path d="M16.91 23.64L21.3 0H12.5L5.4 16.59 4.14 9.12l-1.3-.3L0 23.64h8.82l4.4-17.77.3 1.25L9.75 23.64h7.16z" fill="#142688"/>
    </svg>
);