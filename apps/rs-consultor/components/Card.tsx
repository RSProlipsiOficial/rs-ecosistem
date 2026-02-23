
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-brand-gray border border-brand-gray-light rounded-xl shadow-lg shadow-black/30 p-4 sm:p-6 relative ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
