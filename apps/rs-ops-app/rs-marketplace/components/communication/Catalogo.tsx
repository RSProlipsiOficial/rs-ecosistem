
import React, { useState, useEffect } from 'react';
import { CatalogIcon } from '../icons/CatalogIcon';
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
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
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map(catalog => (
                <div key={catalog.id} className="bg-[#1E1E1E] border border-gray-800 p-4 rounded-xl group hover:border-yellow-500 transition-colors flex flex-col h-full">
                    <div className="aspect-[3/4] w-full bg-[#2A2A2A] rounded-lg overflow-hidden mb-4 relative">
                        {catalog.cover_image ? (
                            <img src={catalog.cover_image} alt={catalog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <DocumentTextIcon className="w-16 h-16 text-gray-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a
                                href={catalog.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                            >
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
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
                        className="mt-4 text-center block w-full py-2 border border-gray-700 text-yellow-500 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm font-semibold md:hidden"
                    >
                        Abrir PDF
                    </a>
                </div>
            ))}
        </div>
    );
};

export default Catalogo;
