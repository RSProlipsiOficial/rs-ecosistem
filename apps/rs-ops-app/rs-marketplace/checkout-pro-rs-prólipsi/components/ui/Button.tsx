import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  
  // Added transform hover:scale-105 active:scale-95 for tactile feedback
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rs-dark disabled:cursor-not-allowed transform hover:scale-[1.03] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-rs-gold text-black hover:bg-rs-goldHover focus:ring-rs-gold shadow-[0_0_15px_rgba(200,167,78,0.3)] disabled:bg-rs-border disabled:text-rs-muted disabled:shadow-none disabled:transform-none",
    secondary: "bg-rs-card text-rs-gold border border-rs-border hover:border-rs-gold hover:bg-rs-border focus:ring-rs-border disabled:opacity-50 disabled:transform-none",
    outline: "bg-transparent text-rs-gold border border-rs-gold hover:bg-rs-gold/10 focus:ring-rs-gold disabled:opacity-50 disabled:transform-none",
    ghost: "bg-transparent text-rs-muted hover:text-rs-gold hover:bg-rs-card/50 disabled:opacity-50 disabled:transform-none"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};