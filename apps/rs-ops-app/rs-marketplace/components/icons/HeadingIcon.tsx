import React from 'react';

export const HeadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
  </svg>
);
