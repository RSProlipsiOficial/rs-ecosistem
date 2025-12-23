import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  path: { label: string }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path }) => {
  return (
    <nav className="flex items-center text-sm text-slate-400 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {path.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />}
            <span className={index === path.length - 1 ? 'font-semibold text-rs-gold' : 'text-slate-400'}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};
