
import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { IconDownload, IconImage, IconFileText, IconPresentation, IconVideo } from '../../components/icons';
import { communicationService, Material } from '../services/communicationService';

const DownloadCard: React.FC<{ asset: Material }> = ({ asset }) => {
  let Icon = IconFileText;
  if (asset.icon_type === 'photo') Icon = IconImage;
  else if (asset.icon_type === 'presentation') Icon = IconPresentation;

  // Try to deduce icon from extension if mock data had types but API has different
  if (asset.file_name?.endsWith('.png') || asset.file_name?.endsWith('.jpg')) Icon = IconImage;
  if (asset.file_name?.endsWith('.mp4')) Icon = IconVideo;

  return (
    <Card className="flex flex-col h-full bg-brand-gray-light hover:border-brand-gold/50 transition-colors">
      <div className="relative aspect-video bg-brand-gray-dark rounded-md flex items-center justify-center overflow-hidden">
        {asset.icon_type === 'photo' && asset.file_url ? (
          <img src={asset.file_url} alt={asset.title} className="w-full h-full object-cover" />
        ) : (
          <Icon size={48} className="text-brand-text-dim" />
        )}
      </div>
      <div className="mt-4 flex-grow">
        <h3 className="font-semibold text-white">{asset.title}</h3>
        {asset.description && <p className="text-xs text-gray-400 mt-1">{asset.description}</p>}
        {asset.format && <p className="text-xs text-brand-gold mt-2 uppercase">{asset.format}</p>}
      </div>
      <a
        href={asset.file_url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        <IconDownload size={18} />
        <span>Baixar</span>
      </a>
    </Card>
  );
};

const Downloads: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      const res = await communicationService.getMaterials();
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