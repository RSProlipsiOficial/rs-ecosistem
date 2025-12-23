import React from 'react';

export const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89H8.313v-2.91h2.125v-2.207c0-2.103 1.25-3.245 3.162-3.245.897 0 1.8.165 1.8.165v2.468h-1.265c-1.03 0-1.35.613-1.35 1.325v1.562h2.79l-.45 2.91h-2.34v7.028C18.343 21.128 22 16.991 22 12z" />
    </svg>
);
