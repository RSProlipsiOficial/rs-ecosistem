import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Review, Language } from '../../types';
import { useProductContext } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeftIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, TagIcon } from '../Icons';
import ImageInput from '../ImageInput';
import RichTextEditor from '../RichTextEditor';
import { AITextGenerator, MagicWandIcon } from '../AIComponents';

type EditorTab = 'general' | 'images' | 'variants' | 'reviews' | 'delivery';

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {text}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ label: string, checked: boolean, onChange: (checked: boolean) => void, description: string }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between">
        <span className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-secondary">{label}</label>
            <Tooltip text={description} />
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
    </div>
);


const ProductEditor: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => {
    const [formData, setFormData] = useState<Product>(product);
    const { addProduct, updateProduct, deleteReview } = useProductContext();
    const { language, t } = useLanguage();
    const [newReview, setNewReview] = useState({ author: '', rating: 5, text: '' });
    
    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleSave = () => {
        if (formData.variants.length === 0 || formData.variants.some(v => !v.name.trim())) {
            alert('Por favor, adicione pelo menos uma variação de preço com um nome.');
            return;
        }

        if (formData.status === 'active' && formData.imageUrls.filter(url => url && url.trim() !== '').length === 0) {
            alert('Para ATIVAR um produto, é necessário adicionar pelo menos uma imagem.');
            return;
        }

        // Use formData.id to check if it's a new product
        if (!formData.id) {
            const { id, reviews, ...productDataForCreation } = formData;
            const newlyCreatedProduct = addProduct(productDataForCreation);
            setFormData(newlyCreatedProduct); 
            alert('Produto criado com sucesso! Você pode continuar editando.');
        } else {
            updateProduct(formData);
            alert('Produto atualizado com sucesso!');
        }
    };

    const handleFieldChange = (field: keyof Product, value: any) => setFormData(p => ({ ...p, [field]: value }));
    const handleTranslationChange = (field: 'name' | 'description', value: string) => setFormData(p => ({ ...p, translations: { ...p.translations, [language]: { ...p.translations[language], [field]: value } } }));

    // Image Handlers
    const handleImageChange = (index: number, value: string) => handleFieldChange('imageUrls', formData.imageUrls.map((url, i) => i === index ? value : url));
    const addImage = () => handleFieldChange('imageUrls', [...formData.imageUrls, '']);
    const removeImage = (index: number) => handleFieldChange('imageUrls', formData.imageUrls.filter((_, i) => i !== index));
    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...formData.imageUrls];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newImages.length) return;
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        handleFieldChange('imageUrls', newImages);
    };
    
    // Variant Handlers
    const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
        const newVariants = [...formData.variants];
        const isNumeric = field === 'price' || field === 'stock' || field === 'originalPrice';
        (newVariants[index] as any)[field] = isNumeric ? (parseFloat(value) || undefined) : value;
        handleFieldChange('variants', newVariants);
    };
    const addVariant = () => {
        const newVariant: ProductVariant = { id: `v_${new Date().getTime()}`, name: '', price: 0, sku: '', stock: 0 };
        handleFieldChange('variants', [...formData.variants, newVariant]);
    };
    const removeVariant = (index: number) => handleFieldChange('variants', formData.variants.filter((_, i) => i !== index));

    // Review Handlers
    const handleAddReview = () => {
        if (!newReview.author || !newReview.text) return;
        const reviewToAdd: Review = { id: `r_${Date.now()}`, ...newReview, likes: 0, createdAt: new Date().toISOString() };
        handleFieldChange('reviews', [reviewToAdd, ...formData.reviews]);
        setNewReview({ author: '', rating: 5, text: '' });
    };
    const handleRemoveReview = (reviewId: string) => deleteReview(product.id, reviewId);

    // Shipping Handlers
    const handleShippingChange = (field: 'weight' | 'dimensions', value: any) => {
        handleFieldChange('shipping', { ...(formData.shipping || { weight: 0, dimensions: { length: 0, width: 0, height: 0 } }), [field]: value });
    };

    // SEO Handlers
    const handleSeoChange = (field: 'metaTitle' | 'metaDescription' | 'slug', value: string) => {
        const newSeo = { ...(formData.seo || { metaTitle: '', metaDescription: '', slug: '' }), [field]: value };
        setFormData(p => ({ ...p, seo: newSeo }));
    };

    const generateSlug = () => {
        const name = formData.translations[language]?.name || '';
        const slug = name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');
        handleSeoChange('slug', slug);
    };

    const SeoSection = () => {
        const name = formData.translations[language]?.name || formData.translations.pt.name;
        const description = formData.translations[language]?.description || formData.translations.pt.description;
    
        const buildSeoPrompt = ({ currentContent: contextName }: { currentContent?: string }) => {
            const base = `Baseado no nome do produto "${contextName}" e na descrição "${description.replace(/<[^>]+>/g, '').substring(0, 200)}...", gere um meta título otimizado para SEO com menos de 60 caracteres e uma meta descrição com menos de 160 caracteres.`;
            return base;
        }
    
        return (
            <div className="bg-surface p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-3">SEO (Otimização para Buscadores)</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Meta Título</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" value={formData.seo?.metaTitle || ''} onChange={e => handleSeoChange('metaTitle', e.target.value)} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600" />
                            <AITextGenerator
                                onInsert={v => handleSeoChange('metaTitle', v)}
                                buildInitialPrompt={buildSeoPrompt}
                                modalTitle="Gerar Meta Título com IA"
                                modalPlaceholder="Descreva o foco principal do produto"
                                triggerIcon={<MagicWandIcon />}
                                className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                adTitle={name}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Meta Descrição</label>
                         <div className="flex items-start space-x-2">
                            <textarea value={formData.seo?.metaDescription || ''} onChange={e => handleSeoChange('metaDescription', e.target.value)} rows={3} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600" />
                            <AITextGenerator
                                onInsert={v => handleSeoChange('metaDescription', v)}
                                buildInitialPrompt={buildSeoPrompt}
                                modalTitle="Gerar Meta Descrição com IA"
                                modalPlaceholder="Descreva os pontos chave para a descrição"
                                triggerIcon={<MagicWandIcon />}
                                className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                adTitle={name}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">URL Slug</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" value={formData.seo?.slug || ''} onChange={e => handleSeoChange('slug', e.target.value)} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600" />
                            <button onClick={generateSlug} type="button" className="text-sm text-accent hover:underline whitespace-nowrap">Gerar do Título</button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Pré-visualização no Google</h4>
                        <div className="p-3 bg-background rounded">
                            <p className="text-blue-500 text-lg truncate">{formData.seo?.metaTitle || name}</p>
                            <p className="text-green-400 text-sm">https://seusite.com/produtos/{formData.seo?.slug || ''}</p>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{formData.seo?.metaDescription || description.replace(/<[^>]+>/g, '')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-background z-10 flex flex-col animate-slide-in-right">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary"><ArrowLeftIcon /></button>
                    <h2 className="text-xl font-bold text-accent">Editar Produto</h2>
                </div>
                <button onClick={handleSave} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">Salvar Produto</button>
            </header>

            <main className="flex-grow flex overflow-hidden">
                <div className="w-full lg:w-2/3 p-6 overflow-y-auto space-y-8">
                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <input type="text" value={formData.translations[language]?.name || ''} onChange={e => handleTranslationChange('name', e.target.value)} placeholder="Nome do Produto" className="w-full bg-transparent text-2xl font-bold text-text-primary focus:outline-none mb-2" />
                        <RichTextEditor value={formData.translations[language]?.description || ''} onChange={v => handleTranslationChange('description', v)} />
                    </div>
                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-3">Imagens</h3>
                        <div className="space-y-3">
                            {formData.imageUrls.map((url, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <ImageInput label="" value={url} onChange={v => handleImageChange(index, v)} />
                                    <div className="flex flex-col">
                                        <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 text-text-secondary disabled:opacity-30"><ArrowUpIcon /></button>
                                        <button onClick={() => moveImage(index, 'down')} disabled={index === formData.imageUrls.length - 1} className="p-1 text-text-secondary disabled:opacity-30"><ArrowDownIcon /></button>
                                    </div>
                                    <button onClick={() => removeImage(index)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addImage} className="mt-4 text-sm text-accent hover:underline flex items-center space-x-1"><PlusIcon /> <span>Adicionar Imagem</span></button>
                    </div>
                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-3">Variações e Preços</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-max">
                                <thead>
                                    <tr className="text-left text-text-secondary">
                                        <th className="p-2">Nome</th>
                                        <th className="p-2">Preço Original</th>
                                        <th className="p-2">Preço (Venda)</th>
                                        <th className="p-2">SKU</th>
                                        <th className="p-2">Estoque</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.variants.map((variant, index) => (
                                        <tr key={variant.id || index} className="border-t border-border">
                                            <td className="p-1"><input type="text" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" /></td>
                                            <td className="p-1"><input type="number" step="0.01" value={variant.originalPrice || ''} onChange={e => handleVariantChange(index, 'originalPrice', e.target.value)} placeholder="Opcional" className="w-full bg-gray-800 p-2 rounded border border-gray-600" /></td>
                                            <td className="p-1"><input type="number" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" /></td>
                                            <td className="p-1"><input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" /></td>
                                            <td className="p-1"><input type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} className="w-20 bg-gray-800 p-2 rounded border border-gray-600" /></td>
                                            <td className="p-1"><button onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={addVariant} className="mt-4 text-sm text-accent hover:underline flex items-center space-x-1"><PlusIcon /> <span>Adicionar Variação</span></button>
                    </div>
                    {formData.category === 'Physical' && (
                        <div className="bg-surface p-4 rounded-lg border border-border">
                            <h3 className="text-lg font-semibold mb-3">Entrega</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs text-text-secondary">Peso (kg)</label>
                                    <input type="number" step="0.01" value={formData.shipping?.weight || ''} onChange={e => handleShippingChange('weight', parseFloat(e.target.value))} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary">Comprimento (cm)</label>
                                    <input type="number" step="0.1" value={formData.shipping?.dimensions.length || ''} onChange={e => handleShippingChange('dimensions', {...(formData.shipping?.dimensions || { length: 0, width: 0, height: 0 }), length: parseFloat(e.target.value)})} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary">Largura (cm)</label>
                                    <input type="number" step="0.1" value={formData.shipping?.dimensions.width || ''} onChange={e => handleShippingChange('dimensions', {...(formData.shipping?.dimensions || { length: 0, width: 0, height: 0 }), width: parseFloat(e.target.value)})} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary">Altura (cm)</label>
                                    <input type="number" step="0.1" value={formData.shipping?.dimensions.height || ''} onChange={e => handleShippingChange('dimensions', {...(formData.shipping?.dimensions || { length: 0, width: 0, height: 0 }), height: parseFloat(e.target.value)})} className="w-full bg-gray-800 p-2 rounded border border-gray-600" />
                                </div>
                            </div>
                        </div>
                    )}
                    <SeoSection />
                </div>
                <aside className="w-full lg:w-1/3 p-6 border-l border-border flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-3">Organização</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-text-secondary">Status do Produto</label>
                                <select value={formData.status} onChange={e => handleFieldChange('status', e.target.value)} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600">
                                    <option value="active">Ativo</option>
                                    <option value="draft">Rascunho</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-secondary">Categoria do Produto</label>
                                <select value={formData.category} onChange={e => handleFieldChange('category', e.target.value)} className="w-full bg-gray-800 p-2 mt-1 rounded border border-gray-600">
                                    <option value="Physical">Físico</option>
                                    <option value="Digital">Digital</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-secondary">Tags</label>
                                <div className="relative">
                                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" value={(formData.tags || []).join(', ')} onChange={e => handleFieldChange('tags', e.target.value.split(',').map(t => t.trim()))} placeholder="saude, digital, novo" className="w-full bg-gray-800 p-2 pl-9 mt-1 rounded border border-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-3">Funções Especiais</h3>
                        <div className="space-y-4">
                             <ToggleSwitch
                                label="Recuperar Carrinho"
                                checked={!!formData.eligibleForCartRecovery}
                                onChange={value => handleFieldChange('eligibleForCartRecovery', value)}
                                description="Incluir este produto em campanhas de e-mail para recuperação de carrinhos abandonados."
                            />
                        </div>
                    </div>

                    <div className="bg-surface p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-3">Avaliações</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {formData.reviews.map(review => (
                                <div key={review.id} className="text-xs p-2 bg-gray-800 rounded relative">
                                    <p><strong>{review.author} ({review.rating}/5):</strong> {review.text}</p>
                                    <button onClick={() => handleRemoveReview(review.id)} className="absolute top-1 right-1 p-1 text-red-500 opacity-50 hover:opacity-100"><TrashIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 border-t border-border pt-3 space-y-2">
                             <h4 className="text-sm font-semibold">Adicionar Avaliação</h4>
                             <input type="text" placeholder="Nome do Autor" value={newReview.author} onChange={e => setNewReview(r => ({...r, author: e.target.value}))} className="w-full bg-gray-800 p-1 text-sm rounded border border-gray-600" />
                             <textarea placeholder="Comentário" value={newReview.text} onChange={e => setNewReview(r => ({...r, text: e.target.value}))} className="w-full bg-gray-800 p-1 text-sm rounded border border-gray-600" rows={2}></textarea>
                             <div className="flex justify-between items-center">
                                <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview(r => ({...r, rating: parseInt(e.target.value)}))} className="w-20 bg-gray-800 p-1 text-sm rounded border border-gray-600" />
                                <button onClick={handleAddReview} className="bg-accent text-button-text font-bold py-1 px-3 text-sm rounded-md hover:opacity-80">Adicionar</button>
                             </div>
                        </div>
                    </div>
                </aside>
            </main>
            <style>{`.animate-slide-in-right { animation: slideInRight 0.3s ease-out; } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </div>
    );
};

export default ProductEditor;