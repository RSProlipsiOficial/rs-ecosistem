import React from 'react';

export const HighlightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M15.24 13.16l-2.2-2.2-1.41 1.41 2.2 2.2-2.35 2.35-1.41-1.41-2.2 2.2 3.76 3.76 2.2-2.2-1.41-1.41z"/>
    <path d="M19.78 4.22a.996.996 0 00-1.41 0l-1.83 1.83 2.83 2.83 1.83-1.83a.996.996 0 000-1.41l-1.42-1.42zM15.54 5.64L5.64 15.54 4.22 14.12 14.12 4.22l1.42 1.42zM2.12 15.54l5.29 5.29 1.41-1.41-5.29-5.29-1.41 1.41z"/>
  </svg>
);