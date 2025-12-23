// Fix: Implementing the ShieldCheckIcon component.
import React from 'react';

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M12 2.25c-4.97 0-9 4.03-9 9v1.5c0 .34.03.67.08.99.1.66.27 1.3.52 1.91.24.6.56 1.16.94 1.68.82 1.09 1.88 2.01 3.09 2.76.84.52 1.76.92 2.74 1.19.04.01.08.02.12.03.04.01.08.02.12.03C11.601 21.96 11.79 22 12 22s.399-.04.59-.11c.04-.01.08-.02.12-.03.04-.01.08-.02.12-.03.98-.27 1.9-.67 2.74-1.19 1.21-.75 2.27-1.67 3.09-2.76.38-.52.7-1.08.94-1.68.25-.61.42-1.25.52-1.91.05-.32.08-.65.08-.99v-1.5c0-4.97-4.03-9-9-9zm-1.03 13.28a.75.75 0 001.06 0l4.5-4.5a.75.75 0 10-1.06-1.06L11.25 13.94l-2.72-2.72a.75.75 0 00-1.06 1.06l3.25 3.25z" clipRule="evenodd" />
  </svg>
);