import React from 'react';
import { IconX } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      <div className={`relative w-full ${sizeClasses[size]} mx-auto my-6`}>
        <div className="relative flex flex-col w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-2xl">
          {title && (
            <div className="flex items-center justify-between p-5 border-b border-[#2A2A2A]">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 ml-auto text-gray-400 hover:text-white transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className="relative p-6 flex-auto max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
