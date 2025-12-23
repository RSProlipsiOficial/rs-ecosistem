
import React, { useState } from 'react';
import { X, Expand, Shrink } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ isOpen, onClose, title, children, size = '4xl' }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;
  
  const sizeClasses = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`bg-rs-card border border-rs-gold/50 rounded-xl shadow-2xl flex flex-col transition-all duration-300
          ${isFullScreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : `${sizeClasses[size]} w-full max-h-[95vh] h-auto`
          }`
        }
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-rs-gold">{title}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-slate-400 hover:text-white p-1">
              {isFullScreen ? <Shrink size={18} /> : <Expand size={18} />}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
