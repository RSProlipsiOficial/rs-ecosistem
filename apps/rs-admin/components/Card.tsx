import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#1E1E1E] p-6 rounded-lg border border-[#2A2A2A] ${className}`}>
      {children}
    </div>
  );
};

export default Card;
