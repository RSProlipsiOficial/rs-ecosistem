import React from 'react';

export const PickupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.01a.75.75 0 01.75.75v7.5m-3.75 0v-7.5a.75.75 0 00-.75-.75h-.01a.75.75 0 00-.75.75v7.5m-3.75 0v-7.5A.75.75 0 016.75 12h.01a.75.75 0 01.75.75v7.5m-3.75 0V12A2.25 2.25 0 015.25 9.75h9.5A2.25 2.25 0 0117.25 12v9.75M8.25 21h8.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a5.25 5.25 0 00-5.25 5.25c0 3.866 5.25 9.75 5.25 9.75s5.25-5.884 5.25-9.75A5.25 5.25 0 0012 1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);