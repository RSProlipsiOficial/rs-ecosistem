import React from 'react';

export const StorefrontIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.01a.75.75 0 01.75.75v7.5m-3.75 0v-7.5a.75.75 0 00-.75-.75h-.01a.75.75 0 00-.75.75v7.5m-3.75 0v-7.5A.75.75 0 016.75 12h.01a.75.75 0 01.75.75v7.5m-3.75 0V12A2.25 2.25 0 015.25 9.75h9.5A2.25 2.25 0 0117.25 12v9.75m-9.75 0h4.5m-13.5-3.375V12a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 12v2.25m-18 0h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);
