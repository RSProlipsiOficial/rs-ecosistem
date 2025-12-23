import React from 'react';

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-2.25 3h5.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21v-4.5a3.75 3.75 0 013.75-3.75h9a3.75 3.75 0 013.75 3.75v4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75v-6a3 3 0 013-3h9a3 3 0 013 3v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.75v-1.5a1.5 1.5 0 011.5-1.5h.008a1.5 1.5 0 011.5 1.5v1.5" />
  </svg>
);
