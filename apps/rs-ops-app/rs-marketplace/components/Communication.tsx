import React, { useState } from 'react';
import { Announcement, Training, MarketingAsset, View } from '../types';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PinIcon } from './icons/PinIcon';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CommunicationProps {
    announcements: Announcement[];
    trainings: Training[];
    marketingAssets: MarketingAsset[];
    onNavigate: (view: View, data?: any) => void;
}

const Communication: React.FC<CommunicationProps> = ({ announcements, trainings, marketingAssets, onNavigate }) => {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [previewAsset, setPreviewAsset] = useState<MarketingAsset | null>(null);

    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const recentTrainings = trainings.slice(0, 4);
    const recentAssets = marketingAssets.slice(0, 8);

    const AssetCard: React.FC<{asset: MarketingAsset}> = ({ asset }) => {
        const isPdf = asset.format === 'PDF';
        const handleClick = () => {
            if (isPdf) {
                window.open(asset.downloadUrl, '_blank');
            } else {
                setPreviewAsset(asset);
            }
        }
        return (
            <div className="relative group bg-dark-900 border border-dark-800 rounded-lg p-3 text-center transition-transform transform hover:-translate-y-1">
                <button onClick={handleClick} className="aspect-square bg-dark-800 flex items-center justify-center rounded-md mb-2 overflow-hidden w-full">
                    {isPdf ? (
                        <DocumentTextIcon className="w-16 h-16 text-gray-500" />
                    ) : (
                        <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-cover" />
                    )}
                </button>
                <p className="text-sm font-semibold text-white truncate" title={asset.name}>{asset.name}</p>
                <p className="text-xs text-gray-500">{asset.format}</p>

                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-4 space-y-2">
                     <button onClick={handleClick} className="w-full text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">
                        {isPdf ? 'Abrir' : 'Visualizar'}
                    </button>
                    <a href={asset.downloadUrl} download={asset.name} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                        <DownloadIcon className="w-5 h-5" /> Baixar
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            {/* Comunicados */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><MegaphoneIcon className="w-6 h-6 text-gold-400" /> Comunicados Oficiais</h2>
                    <button onClick={() => onNavigate('manageAnnouncements')} className="text-sm font-semibold text-gold-400 hover:underline">Gerenciar</button>
                </div>
                <div className="bg-black border border-dark-800 rounded-lg p-3 space-y-2">
                    {sortedAnnouncements.slice(0, 4).map(ann => (
                        <button
                            key={ann.id}
                            onClick={() => setSelectedAnnouncement(ann)}
                            className={`w-full text-left p-4 rounded-lg transition-colors duration-200 ${
                                ann.isPinned
                                    ? 'bg-yellow-900/30 border-l-4 border-gold-500'
                                    : 'bg-dark-800/40'
                            } hover:bg-dark-800/80`}
                        >
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <p className="font-semibold text-white flex items-center gap-3">
                                        {ann.isPinned && <PinIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />}
                                        {ann.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 ml-1">
                                        {new Date(ann.date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-gold-400 flex-shrink-0">
                                    Ler
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Treinamentos */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><BookOpenIcon className="w-6 h-6 text-gold-400" /> Treinamentos Recentes</h2>
                    <button onClick={() => onNavigate('manageTrainings')} className="text-sm font-semibold text-gold-400 hover:underline">Ver Todos</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentTrainings.map(training => (
                        <button key={training.id} onClick={() => onNavigate('trainingModuleDetail', training)} className="bg-black border border-dark-800 rounded-lg overflow-hidden group text-left transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-dark-700 hover:-translate-y-1">
                            <div className="relative">
                                <img src={training.thumbnailUrl} alt={training.title} className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{training.lessons.length} {training.lessons.length > 1 ? 'Aulas' : 'Aula'}</div>
                                <h3 className="absolute bottom-3 left-3 right-3 font-bold text-base text-white group-hover:text-gold-400 transition-colors leading-tight">{training.title}</h3>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Materiais de Marketing */}
            <section>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><PhotoIcon className="w-6 h-6 text-gold-400" /> Novos Materiais de Marketing</h2>
                    <button onClick={() => onNavigate('manageMarketingAssets')} className="text-sm font-semibold text-gold-400 hover:underline">Ver Todos</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {recentAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                </div>
            </section>

            {/* Announcement Modal */}
            {selectedAnnouncement && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="bg-black border border-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-start justify-between p-4 border-b border-dark-800">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedAnnouncement.title}</h2>
                                <p className="text-sm text-gray-500">{new Date(selectedAnnouncement.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <button onClick={() => setSelectedAnnouncement(null)}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                        </header>
                        <main className="p-6 overflow-y-auto prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }} />
                    </div>
                </div>
            )}
            
            {/* Asset Preview Modal */}
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

export default Communication;