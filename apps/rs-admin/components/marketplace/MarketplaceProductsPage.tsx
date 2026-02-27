import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import { uploadProductImage } from '../../src/services/supabase';
import { CubeIcon, PlusIcon, ArrowUpTrayIcon, CloseIcon, SpinnerIcon, CheckCircleIcon } from '../icons';
import type { Product } from '../../types';
import ProductDetailModal from './ProductDetailModal';

// Cleared mock data
const mockProducts: Product[] = [];


const statusClasses = {
    Ativo: 'bg-green-600/20 text-green-400',
    Inativo: 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = () => {
        if (!file) return;
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-6 h-6 text-yellow-500" />
                        Importar Produtos em Massa
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                            <h3 className="mt-4 text-xl font-bold text-white">Importação Concluída!</h3>
                            <p className="text-gray-400 mt-1">Os produtos foram adicionados com sucesso.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300">
                                Para importar produtos em massa, envie uma planilha <code className="text-yellow-400 font-mono">.csv</code> ou <code className="text-yellow-400 font-mono">.xlsx</code> seguindo o modelo.
                            </p>
                            <a href="#" className="text-sm text-yellow-500 hover:underline">
                                Baixar modelo de planilha (.csv)
                            </a>
                            <div className="mt-4">
                                <label htmlFor="import-file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50">
                                    <CubeIcon className="w-8 h-8 text-gray-500 mb-2" />
                                    <span className="text-sm font-semibold text-yellow-500">
                                        {file ? file.name : 'Clique para selecionar o arquivo'}
                                    </span>
                                    <span className="text-xs text-gray-500">ou arraste e solte aqui</span>
                                </label>
                                <input id="import-file-upload" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleFileChange} />
                            </div>
                            <div className="text-xs text-gray-500 bg-black/30 p-3 rounded-lg">
                                <strong>Colunas obrigatórias:</strong> <code className="text-gray-400">name, sku, category, fullPrice, consultantPrice, stock, status</code>.
                            </div>
                        </div>
                    )}
                </main>
                {!isSuccess && (
                    <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end">
                        <button onClick={handleProcess} disabled={!file || isProcessing} className="flex items-center justify-center gap-2 w-48 bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-wait">
                            {isProcessing ? (
                                <><SpinnerIcon className="w-5 h-5 animate-spin" /> Processando...</>
                            ) : 'Processar Arquivo'}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

const MarketplaceProductsPage: React.FC = () => {
    const [products, setProducts] = useState(mockProducts);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await marketplaceAPI.getAllProducts(); // Changed 'response' to 'res'
            // [RS-MAPPING] Nested data support
            const actualData = res.data?.data || res.data; // Uses 'res'
            if (actualData?.success || actualData?.products) {
                setProducts(actualData.products || actualData || mockProducts);
            }
        } catch (err) {
            console.error('Erro:', err);
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);

    const handleAddNew = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (productToSave: Product) => {
        if (editingProduct) {
            // Update existing product
            setProducts(products.map(p => p.id === productToSave.id ? productToSave : p));
        } else {
            // Add new product
            setProducts([{ ...productToSave, id: Date.now() }, ...products]);
        }
        handleCloseModal();
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                    <CubeIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Produtos do Marketplace</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setImportModalOpen(true)} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        Importar Produtos
                    </button>
                    <button onClick={handleAddNew} className="flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Produto
                    </button>
                </div>
            </header>

            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input type="text" placeholder="Buscar por nome, SKU..." className={baseInputClasses} />
                    <select className={baseInputClasses}><option>Todas as Categorias</option><option>Cuidados Faciais</option><option>Bem-Estar</option><option>Maquiagem</option></select>
                    <select className={baseInputClasses}><option>Todos os Status</option><option>Ativo</option><option>Inativo</option></select>
                </div>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4 text-right">Preço Consultor</th>
                                <th className="px-6 py-4 text-center">Estoque</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map(p => (
                                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-md object-cover" />
                                        {p.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono">{p.sku}</td>
                                    <td className="px-6 py-4">{p.category}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{p.consultantPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 text-center">{p.stock > 0 ? p.stock : <span className="text-red-400">Esgotado</span>}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[p.status]}`}>{p.status}</span></td>
                                    <td className="px-6 py-4 text-center"><button onClick={() => handleEdit(p)} className="font-medium text-yellow-500 hover:text-yellow-400">Editar</button></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">Nenhum produto cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductDetailModal
                isOpen={isModalOpen}
                product={editingProduct}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
            />

            {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} />}
        </div>
    );
};

export default MarketplaceProductsPage;