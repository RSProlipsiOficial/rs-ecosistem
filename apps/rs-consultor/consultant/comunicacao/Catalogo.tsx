
import React, { useState, useEffect } from 'react';
import { IconShop, IconExternalLink, IconFileText } from '../../components/icons';
import { communicationService, Catalog } from '../services/communicationService';
import Card from '../../components/Card';

const Catalogo: React.FC = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      const res = await communicationService.getCatalogs();
      if (res.success && res.data) {
        setCatalogs(res.data);
      }
      setLoading(false);
    };
    loadCatalogs();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Carregando catálogos...</div>;

  if (catalogs.length === 0) {
    return (
      <div className="animate-fade-in text-center py-16 text-gray-500">
        <IconShop size={48} className="mx-auto text-brand-gold" />
        <h2 className="text-2xl font-bold text-white mt-4">Catálogos</h2>
        <p className="mt-2 max-w-lg mx-auto">Nenhum caderno ou catálogo disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {catalogs.map(catalog => (
        <Card key={catalog.id} className="group hover:border-brand-gold transition-colors flex flex-col h-full">
          <div className="aspect-[3/4] w-full bg-brand-gray-light rounded-lg overflow-hidden mb-4 relative">
            {catalog.cover_image ? (
              <img src={catalog.cover_image} alt={catalog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                <IconFileText size={64} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={catalog.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform"
              >
                <IconExternalLink size={20} />
                Visualizar
              </a>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">{catalog.title}</h3>
          {catalog.description && <p className="text-sm text-gray-400 mt-2 flex-1">{catalog.description}</p>}
          <a
            href={catalog.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-center block w-full py-2 border border-brand-gray text-brand-gold rounded-lg hover:bg-brand-gray hover:text-white transition-colors text-sm font-semibold md:hidden"
          >
            Abrir PDF
          </a>
        </Card>
      ))}
    </div>
  );
};

export default Catalogo;

