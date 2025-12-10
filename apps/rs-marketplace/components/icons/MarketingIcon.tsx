import React from 'react';

export const MarketingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.117 19.117a11.94 11.94 0 01-1.397 1.397M19.117 19.117l-2.07-2.07m2.07 2.07H21m-1.883-1.883a11.94 11.94 0 01-1.397-1.397m1.397 1.397L19.117 19.117m0 0h1.883m-1.883 0v-1.883m1.883 1.883l-2.07-2.07" />
  </svg>
);