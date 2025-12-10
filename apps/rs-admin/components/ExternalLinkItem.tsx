import React from 'react';
import { ExternalLinkIcon } from './icons';

interface ExternalLinkItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Reusable component for external links in sidebar menus
 * Opens links in new tab with proper security attributes
 * Fully accessible with keyboard navigation
 */
const ExternalLinkItem: React.FC<ExternalLinkItemProps> = ({ 
  href, 
  icon, 
  label, 
  ariaLabel,
  onClick 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={ariaLabel}
        className="flex items-center w-full py-3 px-4 my-1 text-sm font-semibold rounded-lg transition-all duration-200 text-[#9CA3AF] hover:text-[#FFD700] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:ring-offset-[#1E1E1E]"
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
        <svg 
          className="w-4 h-4 ml-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
      </a>
    </li>
  );
};

export default ExternalLinkItem;
