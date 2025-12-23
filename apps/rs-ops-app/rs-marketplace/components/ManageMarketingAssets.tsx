import React, { useState, useMemo } from 'react';
import { MarketingAsset, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ManageMarketingAssetsProps {
    assets: MarketingAsset[];
    onNavigate: (view: View, data?: MarketingAsset) => void;
    onDelete: (ids: string[]) => void;
}

const ManageMarketingAssets: React.FC<ManageMarketingAssetsProps> = ({ assets, onNavigate, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [previewAsset, setPreviewAsset] = useState<MarketingAsset | null>(null);

    const filteredAssets = useMemo(() => {
        return assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [assets, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(e.target.checked ? filteredAssets.map(a => a.id) : []);
    };

    const handleSelectOne = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
    };

    const handleAssetClick = (asset: MarketingAsset) => {
        if (asset.format === 'PDF') {
            window.open(asset.downloadUrl, '_blank');
        } else {
            setPreviewAsset(asset);
        }
    };

    return (
        <div className="space-y-4">
             <button onClick={() => onNavigate('communication')} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-gold-400">
                <ArrowLeftIcon className="w-5 h-5"/>
                Voltar para a Central
            </button>
            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                    <div className="relative max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar materiais..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 pl-10 pr-4"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('addEditMarketingAsset')}
                        className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400"
                    >
                        + Novo Material
                    </button>
                </div>
                {selected.length > 0 && (
                    <div className="p-4 bg-dark-800/50">
                        <button onClick={() => onDelete(selected)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                            <TrashIcon className="w-5 h-5" />
                            Excluir {selected.length} item(s)
                        </button>
                    </div>
                )}
                <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredAssets.map(asset => (
                            <div key={asset.id} className="relative group bg-dark-800/50 rounded-lg p-2 flex flex-col">
                                <div className="absolute top-2 left-2 z-10">
                                    <input 
                                        type="checkbox" 
                                        checked={selected.includes(asset.id)} 
                                        onChange={() => handleSelectOne(asset.id)}
                                        className="h-4 w-4 rounded bg-dark-900 border-dark-700 text-gold-500 focus:ring-yellow-600"
                                    />
                                </div>
                                <button onClick={() => handleAssetClick(asset)} className="aspect-square bg-dark-800 flex items-center justify-center rounded-md mb-2 overflow-hidden flex-grow">
                                     {asset.format === 'PDF' ? (
                                        <DocumentTextIcon className="w-16 h-16 text-gray-500" />
                                     ) : (
                                        <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-contain" />
                                     )}
                                </button>
                                <p className="text-xs font-semibold text-white truncate text-center" title={asset.name}>{asset.name}</p>
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                    <button onClick={() => onNavigate('addEditMarketingAsset', asset)} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 mb-2 w-full">Editar</button>
                                    <button onClick={() => handleAssetClick(asset)} className="flex items-center justify-center gap-2 text-sm font-semibold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 w-full">
                                        {asset.format === 'PDF' ? 'Abrir' : 'Visualizar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {previewAsset && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewAsset(null)}>
                    <div className="bg-black border border-dark-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold text-white truncate">{previewAsset.name}</h2>
                            <button onClick={() => setPreviewAsset(null)}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white"/></button>
                        </header>
                        <main className="p-4 flex-grow flex items-center justify-center overflow-auto">
                            <img src={previewAsset.previewUrl} alt={previewAsset.name} className="max-w-full max-h-full object-contain" />
                        </main>
                        <footer className="p-4 border-t border-dark-800 bg-dark-900/50 text-right">
                             <a href={previewAsset.downloadUrl} download={previewAsset.name} className="inline-flex items-center gap-2 text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">
                                <DownloadIcon className="w-5 h-5" /> Baixar
                            </a>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMarketingAssets;
