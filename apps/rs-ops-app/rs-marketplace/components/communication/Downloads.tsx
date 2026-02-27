
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { DocumentDuplicateIcon as PresentationChartLineIcon } from '../icons/DocumentDuplicateIcon';
import { VideoCameraIcon } from '../icons/VideoCameraIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import communicationAPI, { DownloadMaterial as Material } from '../../services/communicationAPI';

const DownloadCard: React.FC<{ asset: Material }> = ({ asset }) => {
    let Icon = DocumentTextIcon;
    if (asset.icon_type === 'photo') Icon = ImageIcon;
    else if (asset.icon_type === 'presentation') Icon = PresentationChartLineIcon;

    // Try to deduce icon from extension
    if (asset.file_name?.endsWith('.png') || asset.file_name?.endsWith('.jpg')) Icon = ImageIcon;
    if (asset.file_name?.endsWith('.mp4')) Icon = VideoCameraIcon;

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 p-4 rounded-xl flex flex-col h-full hover:border-yellow-500/50 transition-colors">
            <div className="relative aspect-video bg-[#2A2A2A] rounded-md flex items-center justify-center overflow-hidden">
                {asset.icon_type === 'photo' && asset.file_url ? (
                    <img src={asset.file_url} alt={asset.title} className="w-full h-full object-cover" />
                ) : (
                    <Icon className="w-12 h-12 text-gray-600" />
                )}
            </div>
            <div className="mt-4 flex-grow">
                <h3 className="font-semibold text-white">{asset.title}</h3>
                {asset.description && <p className="text-xs text-gray-400 mt-1">{asset.description}</p>}
            </div>
            <a
                href={asset.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
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
                <p className="text-gray-500 text-center py-10">Nenhum material disponível para download.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {materials.map(asset => (
                        <DownloadCard key={asset.id} asset={asset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Downloads;
