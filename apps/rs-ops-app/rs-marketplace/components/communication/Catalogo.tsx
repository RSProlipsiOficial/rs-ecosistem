
import React, { useState, useEffect } from 'react';
import { CatalogIcon } from '../icons/CatalogIcon';
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import ContentCarousel from './ContentCarousel';
import communicationAPI, { Catalog } from '../../services/communicationAPI';

const Catalogo: React.FC = () => {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCatalogs = async () => {
            setLoading(true);
            const res = await communicationAPI.catalogs.getAll();
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
                <CatalogIcon className="w-12 h-12 mx-auto text-yellow-500" />
                <h2 className="text-2xl font-bold text-white mt-4">Catálogos</h2>
                <p className="mt-2 max-w-lg mx-auto">Nenhum caderno ou catálogo disponível no momento.</p>
            </div>
        );
    }

    return (
        <ContentCarousel
            items={catalogs}
            rows={1}
            itemWidth="w-[280px]"
            renderItem={(catalog) => (
                <div className="bg-[#1E1E1E] border border-gray-800 p-3 rounded-lg group hover:border-yellow-500/50 hover:shadow-lg transition-all flex flex-col h-full">
                    <div className="aspect-[3/4] w-full bg-[#2A2A2A] rounded overflow-hidden mb-3 relative">
                        {catalog.cover_image ? (
                            <img src={catalog.cover_image} alt={catalog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <DocumentTextIcon className="w-10 h-10 text-gray-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a
                                href={catalog.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-yellow-500 text-black px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-yellow-400"
                            >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                Abrir
                            </a>
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-yellow-500 transition-colors">{catalog.title}</h3>
                </div>
            )}
        />
    );
};

export default Catalogo;
