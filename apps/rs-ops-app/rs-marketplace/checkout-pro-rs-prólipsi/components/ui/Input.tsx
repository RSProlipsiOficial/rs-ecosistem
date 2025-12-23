import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-rs-muted uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rs-muted group-focus-within:text-rs-gold transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full bg-rs-card border border-rs-border rounded-xl 
            text-rs-text placeholder-rs-muted/50
            focus:border-rs-gold focus:ring-1 focus:ring-rs-gold focus:outline-none
            transition-all duration-200
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};