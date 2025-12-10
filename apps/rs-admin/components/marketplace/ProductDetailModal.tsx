import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { CloseIcon, PhotoIcon, ArchiveBoxIcon, CurrencyDollarIcon, TagIcon, StarIcon, ArrowUpTrayIcon, TrashIcon, SparklesIcon, PlusIcon, FolderPlusIcon, CycleIcon, ShareIcon, CareerIcon } from '../icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
}

const newProductTemplate: Omit<Product, 'id'> = {
    name: '',
    sku: '',
    description: '',
    images: [],
    category: '',
    tags: [],
    fullPrice: 0,
    consultantPrice: 0,
    costPrice: 0,
    stock: 0,
    trackStock: true,
    status: 'Ativo',
    mlm: {
        qualifiesForCycle: true,
    }
};

const ProductDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const [activeTab, setActiveTab] = useState('geral');
    const [formData, setFormData] = useState<Omit<Product, 'id'> & { id?: number }>(newProductTemplate);
    
    // State for string representation of prices to handle comma decimals.
    const [priceStrings, setPriceStrings] = useState({
        fullPrice: '0',
        consultantPrice: '0',
        costPrice: '0',
    });
    
    const [categories, setCategories] = useState(['Cuidados Faciais', 'Bem-Estar', 'Maquiagem', 'Perfumaria']);
    const [newCategory, setNewCategory] = useState('');
    const [tagInput, setTagInput] = useState('');


    useEffect(() => {
        const initialData = product || newProductTemplate;
        setFormData(initialData);

        // Populate string state for prices with localized format.
        setPriceStrings({
            fullPrice: String(initialData.fullPrice).replace('.', ','),
            consultantPrice: String(initialData.consultantPrice).replace('.', ','),
            costPrice: String(initialData.costPrice).replace('.', ','),
        });

        // Reset other states
        setCategories(['Cuidados Faciais', 'Bem-Estar', 'Maquiagem', 'Perfumaria']);
        setNewCategory('');
        setTagInput('');
        setActiveTab('geral');
    }, [product, isOpen]);
    
    if (!isOpen) return null;

    const handleSave = () => {
        // Create a final data object and parse price strings back to numbers before saving.
        const finalData = { ...formData };
        finalData.fullPrice = parseFloat(priceStrings.fullPrice.replace(',', '.')) || 0;
        finalData.consultantPrice = parseFloat(priceStrings.consultantPrice.replace(',', '.')) || 0;
        finalData.costPrice = parseFloat(priceStrings.costPrice.replace(',', '.')) || 0;
        onSave({ ...newProductTemplate, ...finalData, id: finalData.id || Date.now() });
    };

    // This handler remains for non-price inputs.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const isNumber = type === 'number'; // This will apply to 'stock'
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : isNumber ? parseInt(value, 10) || 0 : value }));
    };

    // Specific handler for price inputs to manage string values.
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow only numbers and a single comma, with up to 2 decimal places.
        if (/^[0-9]*[,]{0,1}[0-9]{0,2}$/.test(value)) {
            setPriceStrings(prev => ({ ...prev, [name]: value }));
        }
    };
    
     const handleMlmToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, mlm: { ...prev.mlm, [name]: checked } }));
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            const newCat = newCategory.trim();
            setCategories([...categories, newCat]);
            setFormData(prev => ({ ...prev, category: newCat }));
            setNewCategory('');
        }
    };
    
    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        }
        setTagInput('');
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const TabButton: React.FC<{tabId: string, label: string}> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tabId 
                ? 'border-b-2 border-yellow-500 text-yellow-500' 
                : 'text-gray-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
    
    const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";
    const FormRow: React.FC<{label: string, children: React.ReactNode, description?: string}> = ({label, children, description}) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-3">
            <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="md:col-span-2">{children}</div>
        </div>
    );
    const SettingsToggle: React.FC<{name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ name, checked, onChange }) => (
        <label htmlFor={name} className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" id={name} name={name} className="sr-only" checked={checked} onChange={onChange} />
                <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
    
    const margin = (parseFloat(priceStrings.fullPrice.replace(',', '.')) || 0) - (parseFloat(priceStrings.consultantPrice.replace(',', '.')) || 0);

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="border-b border-gray-700 px-4 overflow-x-auto">
                    <nav className="-mb-px flex space-x-2">
                        <TabButton tabId="geral" label="Geral" />
                        <TabButton tabId="precos" label="Preços & Estoque" />
                        <TabButton tabId="categorias" label="Categorias" />
                        <TabButton tabId="organizacao" label="Tags" />
                        <TabButton tabId="imagens" label="Imagens" />
                        <TabButton tabId="mlm" label="Regras de Ciclo" />
                    </nav>
                </div>

                <main className="p-6 overflow-y-auto">
                    {activeTab === 'geral' && <div className="space-y-2">
                        <FormRow label="Nome do Produto"><input name="name" value={formData.name} onChange={handleChange} className={baseInputClasses} /></FormRow>
                        <FormRow label="SKU (Unidade de Manutenção de Estoque)"><input name="sku" value={formData.sku} onChange={handleChange} className={baseInputClasses} /></FormRow>
                        <FormRow label="Descrição"><textarea name="description" value={formData.description} onChange={handleChange} rows={5} className={baseInputClasses} /></FormRow>
                        <FormRow label="Status do Produto"><select name="status" value={formData.status} onChange={handleChange} className={baseInputClasses}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></FormRow>
                    </div>}
                    {activeTab === 'precos' && <div className="space-y-2">
                        <FormRow label="Preço Cheio (Sugerido)"><input name="fullPrice" value={priceStrings.fullPrice} onChange={handlePriceChange} type="text" inputMode="decimal" className={baseInputClasses} /></FormRow>
                        <FormRow label="Preço para Consultor"><input name="consultantPrice" value={priceStrings.consultantPrice} onChange={handlePriceChange} type="text" inputMode="decimal" className={baseInputClasses} /></FormRow>
                        <FormRow label="Margem de Lucro do Consultor" description="Cálculo automático (Preço Cheio - Preço Consultor)">
                            <div className={`p-2.5 rounded-lg font-semibold ${margin >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {margin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </FormRow>
                        <FormRow label="Preço de Custo" description="Opcional, para seu cálculo de margem."><input name="costPrice" value={priceStrings.costPrice} onChange={handlePriceChange} type="text" inputMode="decimal" className={baseInputClasses} /></FormRow>
                        <FormRow label="Quantidade em Estoque"><input name="stock" value={formData.stock} onChange={handleChange} type="number" className={baseInputClasses} /></FormRow>
                        <FormRow label="Rastrear Estoque?" description="Ative para que o estoque seja debitado automaticamente."><SettingsToggle name="trackStock" checked={formData.trackStock} onChange={handleChange} /></FormRow>
                    </div>}
                    {activeTab === 'categorias' && <div className="space-y-2">
                        <FormRow label="Categoria do Produto">
                            <select name="category" value={formData.category} onChange={handleChange} className={baseInputClasses}>
                                <option value="">Selecione uma categoria</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="Adicionar Nova Categoria">
                            <div className="flex gap-2">
                                <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nome da nova categoria" className={baseInputClasses}/>
                                <button onClick={handleAddCategory} className="flex-shrink-0 flex items-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">
                                    <FolderPlusIcon className="w-5 h-5"/> Adicionar
                                </button>
                            </div>
                        </FormRow>
                    </div>}
                     {activeTab === 'organizacao' && <div className="space-y-2">
                        <FormRow label="Tags" description="Pressione Enter ou vírgula para adicionar uma tag.">
                           <div>
                                <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg min-h-[42px]">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 text-sm font-medium px-2.5 py-1 rounded-full">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="text-yellow-500 hover:text-white">
                                                <CloseIcon className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        placeholder="Adicionar tag..."
                                        className="flex-grow bg-transparent outline-none text-sm p-1"
                                    />
                                </div>
                           </div>
                        </FormRow>
                    </div>}
                    {activeTab === 'imagens' && <div className="space-y-2">
                         <FormRow label="Imagens do Produto" description="A primeira imagem será a principal. Arraste para reordenar.">
                            <div className="w-full">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={img} alt={`Produto ${index+1}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-700" />
                                            <button className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-red-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50">
                                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2" />
                                    <span className="text-sm font-semibold text-yellow-500">Clique para carregar</span>
                                    <span className="text-xs text-gray-500">ou arraste e solte</span>
                                </label>
                                <input id="image-upload" type="file" multiple className="hidden" />
                            </div>
                         </FormRow>
                    </div>}
                    {activeTab === 'mlm' && <div className="space-y-4">
                        <FormRow 
                            label="Qualifica para Formação de Ciclo?" 
                            description="Se ativo, a venda deste produto contará para a formação de um ciclo no plano de marketing."
                        >
                            <SettingsToggle name="qualifiesForCycle" checked={formData.mlm.qualifiesForCycle} onChange={handleMlmToggleChange} />
                        </FormRow>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <div className="p-4 bg-black/50 rounded-lg border border-gray-700/50">
                                <h3 className="text-base font-semibold text-yellow-500 mb-2">Lembrete da Lógica de Ciclos</h3>
                                <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                                    <li><strong className="text-gray-300">1 Ciclo é formado por:</strong> 6 unidades de produtos qualificados, vendidos para 6 consultores (IDs) diferentes na sua rede.</li>
                                    <li><strong className="text-gray-300">Bônus por Ciclar:</strong> Você recebe R$ 108,00.</li>
                                    <li><strong className="text-gray-300">Plano de Carreira:</strong> Cada ciclo conta como 1 para o avanço de PIN.</li>
                                    <li><strong className="text-gray-300">Top SIGME:</strong> Cada ciclo conta como 1 para a qualificação no ranking Top SIGME.</li>
                                </ul>
                            </div>
                        </div>

                    </div>}
                </main>

                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600">Salvar Produto</button>
                </footer>
            </div>
        </div>
    );
};

export default ProductDetailModal;