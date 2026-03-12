import React, { useEffect, useState } from 'react';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { DocumentDuplicateIcon as PresentationChartLineIcon } from '../icons/DocumentDuplicateIcon';
import { VideoCameraIcon } from '../icons/VideoCameraIcon';
import communicationAPI, { DownloadMaterial as Material } from '../../services/communicationAPI';

const DownloadCard: React.FC<{ asset: Material }> = ({ asset }) => {
  let Icon = DocumentTextIcon;
  if (asset.icon_type === 'photo') Icon = ImageIcon;
  else if (asset.icon_type === 'presentation') Icon = PresentationChartLineIcon;

  if (asset.file_name?.endsWith('.png') || asset.file_name?.endsWith('.jpg')) Icon = ImageIcon;
  if (asset.file_name?.endsWith('.mp4')) Icon = VideoCameraIcon;

  return (
    <div className="flex h-full flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-5 transition-colors hover:border-brand-gold/50">
      <div className="relative aspect-video overflow-hidden rounded-md bg-brand-gray-dark">
        {asset.icon_type === 'photo' && asset.file_url ? (
          <img src={asset.file_url} alt={asset.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-brand-text-dim" />
          </div>
        )}
      </div>

      <div className="mt-4 flex-grow">
        <h3 className="font-semibold text-white">{asset.title}</h3>
        {asset.description && <p className="mt-1 text-xs text-gray-400">{asset.description}</p>}
        {(asset as any).format && (
          <p className="mt-2 text-xs uppercase text-brand-gold">{(asset as any).format}</p>
        )}
      </div>

      <a
        href={asset.file_url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-bold text-brand-dark transition-colors hover:bg-yellow-400"
      >
        <DownloadIcon className="h-5 w-5" />
        <span>Baixar</span>
      </a>
    </div>
  );
};

const Downloads: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMaterials = async () => {
      setLoading(true);
      const res = await communicationAPI.downloadMaterials.getAll();
      if (mounted) {
        setMaterials(res.success && res.data ? res.data : []);
        setLoading(false);
      }
    };

    loadMaterials();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="py-10 text-center text-gray-400">Carregando materiais...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold text-white">Materiais para Download</h2>
      {materials.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          Nenhum material disponível para download.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {materials.map((asset) => (
            <DownloadCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;
