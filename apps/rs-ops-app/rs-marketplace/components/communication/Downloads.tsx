
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { DocumentDuplicateIcon as PresentationChartLineIcon } from '../icons/DocumentDuplicateIcon';
import { VideoCameraIcon } from '../icons/VideoCameraIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import ContentCarousel from './ContentCarousel';
import communicationAPI, { DownloadMaterial as Material } from '../../services/communicationAPI';

const DownloadCard: React.FC<{ asset: Material }> = ({ asset }) => {
    let Icon = DocumentTextIcon;
    if (asset.icon_type === 'photo') Icon = ImageIcon;
    else if (asset.icon_type === 'presentation') Icon = PresentationChartLineIcon;

    // Try to deduce icon from extension
    if (asset.file_name?.endsWith('.png') || asset.file_name?.endsWith('.jpg')) Icon = ImageIcon;
    if (asset.file_name?.endsWith('.mp4')) Icon = VideoCameraIcon;

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 p-3 rounded-lg flex flex-col h-full hover:border-yellow-500/50 transition-colors group">
            <div className="relative aspect-video bg-[#2A2A2A] rounded flex items-center justify-center overflow-hidden">
                {asset.icon_type === 'photo' && asset.file_url ? (
                    <img src={asset.file_url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <Icon className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" />
                )}
            </div>
            <div className="mt-3 flex-grow">
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-yellow-500 transition-colors">{asset.title}</h3>
                {asset.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{asset.description}</p>}
            </div>
            <a
                href={asset.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#2A2A2A] text-yellow-500 border border-yellow-500/20 text-xs font-bold py-1.5 px-3 rounded hover:bg-yellow-500 hover:text-black transition-colors"
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Baixar</span>
            </a>
        </div>
    );
};

const Downloads: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMaterials = async () => {
            setLoading(true);
            const res = await communicationAPI.downloadMaterials.getAll();
            if (res.success && res.data) {
                setMaterials(res.data);
            }
            setLoading(false);
        };
        loadMaterials();
    }, []);

    if (loading) return <div className="text-center py-10 text-gray-400">Carregando materiais...</div>;

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Materiais para Download</h2>
            {materials.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border-t border-gray-800 mt-8 pt-16">
                    <DownloadIcon className="w-12 h-12 mx-auto text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white mt-4">Materiais para Download</h2>
                    <p className="mt-2 max-w-lg mx-auto">Nenhum material disponível para download no momento.</p>
                </div>
            ) : (
                <ContentCarousel
                    items={materials}
                    rows={1}
                    itemWidth="w-[280px]"
                    renderItem={(asset) => <DownloadCard key={asset.id} asset={asset} />}
                />
            )}
        </div>
    );
};

export default Downloads;
