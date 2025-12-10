import React, { useState, useMemo } from 'react';
import { Collection, Product, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ManageCollectionsProps {
    collections: Collection[];
    products: Product[];
    onNavigate: (view: View, data?: Collection) => void;
    onDelete?: (collectionId: string) => void;
    onCollectionDelete?: (collectionId: string) => void;
}

const ManageCollections: React.FC<ManageCollectionsProps> = ({ collections, products, onNavigate, onDelete, onCollectionDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteCollection = (id: string) => {
        if (typeof onDelete === 'function') return onDelete(id);
        if (typeof onCollectionDelete === 'function') return onCollectionDelete(id);
        console.warn('No delete handler provided for ManageCollections');
    };

    const filteredCollections = useMemo(() => {
        return collections.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [collections, searchTerm]);
    
    return (
        <div className="bg-black border border-dark-800 rounded-lg">
            <div className="p-4 border-b border-dark-800">
                 <div className="relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar coleções..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-10 text-white"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-black">
                        <tr>
                            <th scope="col" className="px-6 py-3">Coleção</th>
                            <th scope="col" className="px-6 py-3">Produtos</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCollections.map(collection => {
                            const productCount = products.filter(p => p.collectionId === collection.id).length;
                            return (
                                <tr key={collection.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={collection.imageUrl} alt={collection.title} className="w-16 h-10 object-cover rounded-md bg-dark-700" />
                                            <div>
                                                <button onClick={() => onNavigate('addEditCollection', collection)} className="font-medium text-white hover:text-gold-400">{collection.title}</button>
                                                <p className="text-xs text-gray-500">{collection.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{productCount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => onNavigate('addEditCollection', collection)} className="text-gray-400 hover:text-gold-400"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteCollection(collection.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export default ManageCollections;
