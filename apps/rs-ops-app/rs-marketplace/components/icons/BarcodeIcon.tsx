
import React from 'react';

export const BarcodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5v15a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-15M8.25 4.5h7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.75h.008v.008H6V9.75zm3.75 0h.008v.008H9.75V9.75zm3.75 0h.008v.008H13.5V9.75zm3.75 0h.008v.008H17.25V9.75zm-1.5 3.75h.008v.008H15.75v-.008zm-3.75 0h.008v.008H12v-.008zm-3.75 0h.008v.008H8.25v-.008zM6 17.25h.008v.008H6v-.008zm3.75 0h.008v.008H9.75v-.008zm3.75 0h.008v.008H13.5v-.008zm3.75 0h.008v.008H17.25v-.008z" />
  </svg>
);