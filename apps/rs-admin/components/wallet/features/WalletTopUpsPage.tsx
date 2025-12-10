import React from 'react';
import { CubeIcon } from '../../icons';

const WalletTopUpsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex items-center mb-8">
            <CubeIcon className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-yellow-500 ml-3">Recargas e Serviços</h1>
        </header>
        <div className="text-center py-20 bg-black/50 border border-dashed border-gray-700 rounded-xl">
            <CubeIcon className="w-16 h-16 mx-auto text-gray-600" />
            <p className="mt-4 text-lg text-gray-500">Esta seção para recargas de celular e compra de serviços está em desenvolvimento.</p>
        </div>
    </div>
  );
};

export default WalletTopUpsPage;
