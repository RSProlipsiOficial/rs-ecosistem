import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.316-5.322A4.5 4.5 0 0112 9.75a4.5 4.5 0 015.184 3.678 9.75 9.75 0 011.316 5.322zM21 15.75a9.75 9.75 0 00-3.375-7.234 4.502 4.502 0 00-1.096-1.096A9.75 9.75 0 0012 3c-1.605 0-3.113.42-4.418 1.157a4.502 4.502 0 00-1.096 1.096A9.75 9.75 0 003 15.75m18 0v2.25c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 18v-2.25m18 0A12.03 12.03 0 0012 9.75c-2.493 0-4.815.73-6.75 2.006" />
  </svg>
);