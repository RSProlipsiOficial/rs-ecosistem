import React from 'react';

export const TransportadoraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.01a.75.75 0 01.75.75v7.5m-3.75 0v-7.5a.75.75 0 00-.75-.75h-.01a.75.75 0 00-.75.75v7.5m-3.75 0v-7.5A.75.75 0 016.75 12h.01a.75.75 0 01.75.75v7.5m-3.75 0V12A2.25 2.25 0 015.25 9.75h9.5A2.25 2.25 0 0117.25 12v9.75M8.25 21h8.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12a2.25 2.25 0 00-2.25 2.25v.75A2.25 2.25 0 003 17.25h18A2.25 2.25 0 0023.25 15v-.75A2.25 2.25 0 0021 12m-18 0v-2.25A2.25 2.25 0 015.25 7.5h9.5A2.25 2.25 0 0117.25 9.75v2.25" />
    <circle cx="7.5" cy="18.5" r="1.5"/>
    <circle cx="16.5" cy="18.5" r="1.5"/>
  </svg>
);