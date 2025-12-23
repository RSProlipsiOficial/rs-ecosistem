import React from 'react';

export const ShopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.01a.75.75 0 01.75.75v7.5m-3.75-7.5V21a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-7.5m-3.75 0a.75.75 0 00-.75.75v7.5a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-7.5m-3.75 0V21a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-7.5A.75.75 0 0010.5 12h-.01a.75.75 0 00-.75.75zM15 3.75a.75.75 0 00-.75-.75h-.01a.75.75 0 00-.75.75v.01A.75.75 0 0014.25 4.5h.01a.75.75 0 00.75-.75V3.75zM3.75 12a.75.75 0 00-.75.75v7.5a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-7.5a.75.75 0 00-.75-.75h-.01zM9 3.75a.75.75 0 00-.75-.75h-.01a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6.75A2.25 2.25 0 0017.25 4.5h-10.5A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5h10.5A2.25 2.25 0 0019.5 17.25V6.75z" />
  </svg>
);