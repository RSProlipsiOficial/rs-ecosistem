import React, { useEffect, useState } from 'react';
import { CatalogIcon } from '../icons/CatalogIcon';
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import communicationAPI, { Catalog } from '../../services/communicationAPI';

const Catalogo: React.FC = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCatalogs = async () => {
      setLoading(true);
      const res = await communicationAPI.catalogs.getAll();
      if (mounted) {
        setCatalogs(res.success && res.data ? res.data : []);
        setLoading(false);
      }
    };

    loadCatalogs();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="py-10 text-center text-gray-400">Carregando catálogos...</div>;
  }

  if (catalogs.length === 0) {
    return (
      <div className="animate-fade-in py-16 text-center text-gray-500">
        <CatalogIcon className="mx-auto h-12 w-12 text-brand-gold" />
        <h2 className="mt-4 text-2xl font-bold text-white">Catálogos</h2>
        <p className="mx-auto mt-2 max-w-lg">
          Nenhum caderno ou catálogo disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {catalogs.map((catalog) => (
        <div
          key={catalog.id}
          className="group flex h-full flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-5 transition-colors hover:border-brand-gold"
        >
          <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-gray-light">
            {catalog.cover_image ? (
              <img
                src={catalog.cover_image}
                alt={catalog.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-600">
                <DocumentTextIcon className="h-16 w-16" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                href={catalog.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-bold text-brand-dark transition-transform group-hover:translate-y-0"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                Visualizar
              </a>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white">{catalog.title}</h3>
          {catalog.description && (
            <p className="mt-2 flex-1 text-sm text-gray-400">{catalog.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Catalogo;
