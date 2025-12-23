import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-rs-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-rs-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-rs-border flex-shrink-0">
          <h2 className="text-lg font-bold text-rs-text">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-rs-muted hover:bg-rs-border hover:text-rs-gold transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto text-sm text-rs-muted leading-relaxed">
          {children}
        </main>
      </div>
    </div>
  );
};
