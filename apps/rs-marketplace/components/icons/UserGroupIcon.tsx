import React from 'react';

export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.928a9.092 9.092 0 013.741-.479 3 3 0 014.682-2.72M12 12.75a9.092 9.092 0 00-3.741.479 3 3 0 00-4.682 2.72m7.5 2.928v-2.928m0 0a9.092 9.092 0 013.741.479 3 3 0 01-4.682 2.72m0 0V15m-3.72 3.72a9.094 9.094 0 01-3.741.479 3 3 0 01-4.682-2.72m7.5-2.928v-2.928" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
