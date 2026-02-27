
import React, { useState, useRef } from 'react';
import { Collection, Product, View } from '../types';
import { ImageUploader } from './ImageUploader';

interface AddEditCollectionProps {
    collection: Collection | null;
    products: Product[];
    onSave: (collection: Collection) => void;
    onCancel: () => void;
    onNavigate: (view: View) => void;
}

const AddEditCollection: React.FC<AddEditCollectionProps> = ({ collection, products, onSave, onCancel, onNavigate }) => {
    const isEditing = !!collection;
    const [formData, setFormData] = useState<Partial<Collection>>({
        title: '',
        description: '',
        imageUrl: '',
        productIds: [],
        ...collection,
    });
    const formRef = useRef<HTMLFormElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductToggle = (productId: string) => {
        setFormData(prev => {
            const currentIds = prev.productIds || [];
            if (currentIds.includes(productId)) {
                return { ...prev, productIds: currentIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...currentIds, productId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            alert('A coleção precisa de um título.');
            return;
        }
        onSave(formData as Collection);
    };

    const handleSaveClick = () => {
        formRef.current?.requestSubmit();
    };

    const availableProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-dark-800">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Coleção' : 'Criar Coleção'}</h1>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">Descartar</button>
                    <button type="button" onClick={handleSaveClick} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">Salvar</button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">Título</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">Descrição</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                        </div>
                    </div>
                    <div className="bg-black border border-dark-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Produtos na Coleção</h3>
                        <input type="text" placeholder="Buscar produtos para adicionar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white mb-4" />
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                            {availableProducts.map(product => (
                                <label key={product.id} className="flex items-center p-2 bg-dark-800/50 rounded-md cursor-pointer hover:bg-dark-800">
                                    <input
                                        type="checkbox"
                                        checked={formData.productIds?.includes(product.id)}
                                        onChange={() => handleProductToggle(product.id)}
                                        className="h-4 w-4 rounded bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600"
                                    />
                                    <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md ml-4" />
                                    <span className="ml-3 text-sm text-white">{product.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-black border border-dark-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Imagem da Coleção</h3>
                        <div className="max-w-[180px]">
                            <ImageUploader
                                currentImage={formData.imageUrl || ''}
                                onImageUpload={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                placeholderText="Imagem da Coleção"
                                aspectRatio="square"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Recomendado: 400x400px</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddEditCollection;
