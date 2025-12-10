import React from 'react';
import Modal from './Modal';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose, featureName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={featureName || "Funcionalidade em Breve"}>
        <div className="text-center p-4">
            <div className="p-4 bg-surface rounded-full text-gold mb-6 inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12c0-5.25-4.25-9.5-9.5-9.5S2.5 6.75 2.5 12s4.25 9.5 9.5 9.5"></path><path d="M12 8v4l2 2"></path><path d="m16 22-4-4"></path></svg>
            </div>
            <p className="text-lg text-text-body">
                Esta funcionalidade {featureName ? <span className="font-bold text-gold">{`"${featureName}"`}</span> : ''} está em desenvolvimento e será lançada em breve.
            </p>
            <button
                onClick={onClose}
                className="mt-8 w-full sm:w-auto text-center py-2 px-8 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors"
            >
                Entendido
            </button>
        </div>
    </Modal>
  );
};

export default ComingSoonModal;
