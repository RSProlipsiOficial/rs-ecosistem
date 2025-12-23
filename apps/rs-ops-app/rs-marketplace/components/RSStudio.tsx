import React from 'react';
import { View, Product } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface RSStudioProps {
  products: Product[];
  onNavigate: (view: View) => void;
}

const RSStudio: React.FC<RSStudioProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 bg-black border-2 border-dashed border-dark-800 rounded-lg h-[75vh]">
        <SparklesIcon className="w-20 h-20 text-gold-400 mb-4" />
        <h3 className="text-3xl font-bold font-display text-white">RS Studio: Em Breve</h3>
        <p className="mt-2 max-w-lg text-gray-400">
            Uma suíte de ferramentas com IA para automação e criação de conteúdo está chegando para revolucionar seu negócio. Aguarde!
        </p>
    </div>
  );
};

export default RSStudio;
