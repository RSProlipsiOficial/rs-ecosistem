

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Collection, ProductOption, ProductVariant } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';
import RichTextEditor from './RichTextEditor';
import { ToggleSwitch } from './ToggleSwitch';
import { BotIcon } from './icons/BotIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddEditProductProps {
    product: Product | null;
    collections: Collection[];
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-[rgb(var(--color-brand-text-light))]"
            >
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-6 border-t border-[rgb(var(--color-brand-gray-light))]">{children}</div>}
        </div>
    );
};

const AddEditProduct: React.FC<AddEditProductProps> = ({ product, collections, onSave, onCancel }) => {
    const isEditing = !!product?.id || (product?.id === '' && !!product.name);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        shortDescription: '',
        description: '',
        images: [],
        price: 0,
        memberPrice: 0,
        compareAtPrice: undefined,
        costPerItem: undefined,
        status: 'Ativo',
        sku: '',
        barcode: '',
        trackQuantity: true,
        inventory: 10,
        continueSelling: false,
        requiresShipping: true,
        chargeTax: true,
        type: 'Físico',
        collectionId: collections[0]?.id || null,
        seoTitle: '',
        seoDescription: '',
        urlHandle: '',
        weight: 0,
        weightUnit: 'kg',
        supplier: '',
        options: [],
        variants: [],
        ...product,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

    const hasVariants = useMemo(() => (formData.options || []).length > 0, [formData.options]);

    useEffect(() => {
        if (!hasVariants) {
            if (formData.variants?.length) setFormData(prev => ({ ...prev, variants: [] }));
            return;
        }

        const oldVariants = formData.variants || [];
        const options = formData.options || [];

        if (options.length === 0 || options.every(o => o.values.length === 0)) {
            if (oldVariants.length > 0) {
                setFormData(prev => ({ ...prev, variants: [] }));
            }
            return;
        }

        const valueArrays = options.map(opt => opt.values.length > 0 ? opt.values : ['']);

        const cartesian = <T,>(...a: T[][]): T[][] => a.reduce((acc, val) => acc.flatMap(d => val.map(e => [...d, e])), [[]] as T[][]);
        const combinations = cartesian(...valueArrays);

        const newVariants = combinations.map((combo, index) => {
            const comboArray = Array.isArray(combo) ? combo : [combo];
            const optionsObject = options.reduce((obj, opt, i) => {
                if (comboArray[i]) obj[opt.name] = comboArray[i] as string;
                return obj;
            }, {} as { [key: string]: string });

            const existingVariant = oldVariants.find(v => {
                return options.every(opt => v.options[opt.name] === optionsObject[opt.name]);
            });

            return {
                id: existingVariant?.id || `var-${Date.now()}-${index}`,
                options: optionsObject,
                price: existingVariant?.price ?? formData.price ?? 0,
                inventory: existingVariant?.inventory ?? 0,
                sku: existingVariant?.sku ?? '',
            };
        });

        if (JSON.stringify(newVariants) !== JSON.stringify(oldVariants)) {
            setFormData(prev => ({ ...prev, variants: newVariants }));
        }

    }, [formData.options, hasVariants, formData.price]); // Added formData.price to dependencies for variant price initialization

    // Auto-calculate Retail Price (price) based on Consultant Price (memberPrice) x2
    useEffect(() => {
        if (formData.memberPrice !== undefined) {
            const calculatedPrice = (formData.memberPrice || 0) * 2;
            if (formData.price !== calculatedPrice) {
                setFormData(prev => ({ ...prev, price: calculatedPrice }));
            }
        }
    }, [formData.memberPrice]);

    const handleHasVariantsToggle = (checked: boolean) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                options: [{ id: `opt-${Date.now()}`, name: 'Tamanho', values: ['P', 'M', 'G'] }]
            }));
        } else {
            setFormData(prev => ({ ...prev, options: [], variants: [] }));
        }
    };

    const handleAddOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...(prev.options || []), { id: `opt-${Date.now()}`, name: `Opção ${(prev.options?.length || 0) + 1}`, values: [] }]
        }));
    };

    const handleRemoveOption = (optionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            options: (prev.options || []).filter((_, i) => i !== optionIndex)
        }));
    };

    const handleOptionNameChange = (index: number, newName: string) => {
        setFormData(prev => {
            const oldOptions = prev.options || [];
            const oldName = oldOptions[index].name;
            const newOptions = oldOptions.map((opt, i) => i === index ? { ...opt, name: newName } : opt);

            const newVariants = (prev.variants || []).map(variant => {
                if (oldName in variant.options) {
                    const newVariantOptions = { ...variant.options };
                    newVariantOptions[newName] = newVariantOptions[oldName];
                    delete newVariantOptions[oldName];
                    return { ...variant, options: newVariantOptions };
                }
                return variant;
            });

            return { ...prev, options: newOptions, variants: newVariants };
        });
    };

    const handleAddOptionValue = (optionIndex: number) => {
        const newValue = newOptionValues[optionIndex]?.trim();
        if (!newValue) return;

        setFormData(prev => {
            const options = [...(prev.options || [])];
            if (options[optionIndex] && !options[optionIndex].values.includes(newValue)) {
                options[optionIndex] = { ...options[optionIndex], values: [...options[optionIndex].values, newValue] };
                return { ...prev, options };
            }
            return prev;
        });

        setNewOptionValues(prev => ({ ...prev, [optionIndex]: '' }));
    };

    const handleRemoveOptionValue = (optionIndex: number, valueToRemove: string) => {
        setFormData(prev => {
            const options = [...(prev.options || [])];
            if (options[optionIndex]) {
                options[optionIndex] = { ...options[optionIndex], values: options[optionIndex].values.filter(v => v !== valueToRemove) };
                return { ...prev, options };
            }
            return prev;
        });
    };

    const handleNewOptionValueChange = (index: number, value: string) => {
        setNewOptionValues(prev => ({ ...prev, [index]: value }));
    };

    const handleVariantChange = (variantId: string, field: 'price' | 'inventory' | 'sku', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            variants: (prev.variants || []).map(v =>
                v.id === variantId ? { ...v, [field]: (field === 'price' || field === 'inventory') ? Number(value) : value } : v
            )
        }));
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (name: keyof Product, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    };

    const handleImageRemove = (urlToRemove: string) => {
        setFormData(prev => ({ ...prev, images: prev.images?.filter(url => url !== urlToRemove) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            alert('Por favor, insira um nome para o produto.');
            return;
        }
        onSave(formData as Product);
    };

    const handleSaveClick = () => {
        formRef.current?.requestSubmit();
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            alert('Por favor, insira um nome para o produto antes de gerar a descrição.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Você é um copywriter especialista em e-commerce para produtos de luxo. Com base no nome do produto "${formData.name}" e na descrição curta "${formData.shortDescription}", escreva uma descrição completa, atraente e sofisticada para o produto. Use formatação rica em HTML como títulos (h2), listas de marcadores (ul/li) e negrito (strong) para destacar os principais recursos e benefícios. O tone deve ser elegante e persuasivo, focado em qualidade, design e exclusividade.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            handleDescriptionChange(response.text ?? '');
        } catch (error) {
            console.error("AI Description Generation Error:", error);
            alert("Ocorreu um erro ao gerar a descrição. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSeo = async () => {
        if (!formData.name) {
            alert('Por favor, insira um nome para o produto antes de gerar o SEO.');
            return;
        }
        setIsGeneratingSeo(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Baseado no nome do produto "${formData.name}" e na descrição curta "${formData.shortDescription}", gere um Título SEO e uma Meta Descrição SEO otimizados para mecanismos de busca para um e-commerce de luxo.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            seoTitle: {
                                type: Type.STRING,
                                description: "Um título otimizado para SEO com no máximo 60 caracteres."
                            },
                            seoDescription: {
                                type: Type.STRING,
                                description: "Uma meta descrição otimizada para SEO com no máximo 160 caracteres."
                            }
                        },
                        required: ["seoTitle", "seoDescription"]
                    },
                },
            });

            const responseJson = JSON.parse(response.text ?? '{}');

            if (responseJson.seoTitle && responseJson.seoDescription) {
                setFormData(prev => ({
                    ...prev,
                    seoTitle: responseJson.seoTitle,
                    seoDescription: responseJson.seoDescription,
                }));
            } else {
                throw new Error("Resposta da IA em formato inválido.");
            }

        } catch (error) {
            console.error("AI SEO Generation Error:", error);
            alert("Ocorreu um erro ao gerar o conteúdo de SEO. Tente novamente.");
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-[rgb(var(--color-brand-gray-light))]">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</h1>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors">
                        Descartar
                    </button>
                    <button type="button" onClick={handleSaveClick} className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-secondary))] transition-colors">
                        Salvar
                    </button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Details */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Nome do Produto</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                        <div>
                            <label htmlFor="shortDescription" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Descrição Curta</label>
                            <textarea name="shortDescription" id="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={3} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Descrição Completa</label>
                                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="flex items-center gap-1.5 text-sm font-semibold bg-[rgb(var(--color-brand-gold))]/[.10] text-[rgb(var(--color-brand-gold))] py-1 px-3 rounded-md hover:bg-[rgb(var(--color-brand-gold))]/[.20] transition-colors disabled:opacity-50">
                                    {isGenerating ? <SpinnerIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                                    {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                                </button>
                            </div>
                            <RichTextEditor value={formData.description || ''} onChange={handleDescriptionChange} />
                        </div>
                    </div>

                    {/* Media - Images, Videos & GIFs */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))]">Mídia</h3>
                            <span className="text-xs text-[rgb(var(--color-brand-text-dim))]">{formData.images?.length || 0}/10 mídias</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {formData.images?.map(media => {
                                const isVideo = media.match(/\.(mp4|webm|mov|avi)$/i) || media.startsWith('blob:') && media.includes('video');
                                const isGif = media.match(/\.gif$/i);
                                return (
                                    <div key={media} className="relative group aspect-square w-full max-w-[80px]">
                                        {isVideo ? (
                                            <>
                                                <video src={media} className="w-full h-full object-cover rounded-md" muted />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-black/60 rounded-full p-1.5">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <img src={media} alt="preview" className={`w-full h-full object-cover rounded-md ${isGif ? 'ring-2 ring-cyan-400' : ''}`} />
                                        )}
                                        {isGif && (
                                            <span className="absolute top-1 left-1 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">GIF</span>
                                        )}
                                        <div className="absolute inset-0 bg-[rgb(var(--color-brand-dark))]/[.60] opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                                            <button type="button" onClick={() => handleImageRemove(media)} className="p-1.5 bg-[rgb(var(--color-error))] rounded-full">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {(formData.images?.length || 0) < 10 && (
                                <ImageUploader currentImage="" onImageUpload={handleImageUpload} placeholderText="Adicionar" aspectRatio="square" acceptMedia />
                            )}
                        </div>
                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-3">Formatos: JPG, PNG, WebP, GIF, MP4, WebM (máx. 10 arquivos, 30s para vídeos)</p>
                    </div>

                    {/* Pricing */}
                    <Accordion title="Preços" defaultOpen>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="memberPrice" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preço Consultor (Base)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                    <input type="number" name="memberPrice" id="memberPrice" value={formData.memberPrice} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gold))]/[.30] rounded-md py-2 pl-9 pr-3 text-[rgb(var(--color-brand-text-light))] font-bold" step="0.01" min="0" />
                                </div>
                                <p className="text-xs text-[rgb(var(--color-brand-gold))] mt-1">Este é o valor base. O preço de varejo será R$ {((formData.memberPrice || 0) * 2).toFixed(2)}.</p>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preço Varejo (Loja)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                    <input type="number" name="price" id="price" value={formData.price} readOnly className="w-full bg-[rgb(var(--color-brand-gray-light))]/[.10] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-9 pr-3 text-[rgb(var(--color-brand-text-light))] opacity-75 cursor-not-allowed" step="0.01" min="0" />
                                </div>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Calculado automaticamente (2x o preço consultor).</p>
                            </div>
                            <div>
                                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preço de Comparação (De:)</label>
                                <input type="number" name="compareAtPrice" id="compareAtPrice" value={formData.compareAtPrice} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                            </div>
                            <div>
                                <label htmlFor="costPerItem" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Custo de Produção/Compra</label>
                                <input type="number" name="costPerItem" id="costPerItem" value={formData.costPerItem} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Apenas para cálculo interno de lucro.</p>
                            </div>
                        </div>
                    </Accordion>

                    {/* Inventory */}
                    <Accordion title="Estoque" defaultOpen>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="trackQuantity" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Rastrear quantidade</label>
                                <ToggleSwitch checked={!!formData.trackQuantity} onChange={c => handleToggleChange('trackQuantity', c)} labelId="trackQuantity" />
                            </div>
                            {formData.trackQuantity && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="inventory" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Quantidade disponível</label>
                                        <input type="number" name="inventory" id="inventory" value={formData.inventory} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" min="0" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="continueSelling" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Continuar vendendo quando esgotar</label>
                                        <ToggleSwitch checked={!!formData.continueSelling} onChange={c => handleToggleChange('continueSelling', c)} labelId="continueSelling" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Accordion>

                    {/* Variations */}
                    <Accordion title="Variações">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="hasVariants" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Este produto tem múltiplas opções (ex: tamanhos, cores)?</label>
                                <ToggleSwitch checked={hasVariants} onChange={handleHasVariantsToggle} labelId="hasVariants" />
                            </div>
                            {hasVariants && (
                                <div className="space-y-6">
                                    {(formData.options || []).map((option, index) => (
                                        <div key={option.id} className="p-4 bg-[rgb(var(--color-brand-gray))]/[.50] rounded-lg border border-[rgb(var(--color-brand-gray-light))]">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Nome da Opção</label>
                                                <button type="button" onClick={() => handleRemoveOption(index)} className="p-1 text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                            <input type="text" value={option.name} onChange={e => handleOptionNameChange(index, e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))] text-sm mb-3" />

                                            <label className="text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Valores da Opção</label>
                                            <div className="flex flex-wrap gap-2 my-2 min-h-[2.25rem]">
                                                {option.values.map(val => (
                                                    <div key={val} className="flex items-center gap-1 bg-[rgb(var(--color-brand-gray))] rounded-full px-3 py-1 text-sm">
                                                        {val}
                                                        <button type="button" onClick={() => handleRemoveOptionValue(index, val)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] leading-none -mr-1">&times;</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newOptionValues[index] || ''}
                                                    onChange={e => handleNewOptionValueChange(index, e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOptionValue(index); } }}
                                                    placeholder="Adicionar novo valor e pressionar Enter"
                                                    className="flex-grow bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))] text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddOption} className="text-sm font-semibold text-[rgb(var(--color-brand-gold))] hover:underline">+ Adicionar outra opção</button>

                                    {(formData.variants?.length || 0) > 0 && (
                                        <div className="mt-6 border-t border-[rgb(var(--color-brand-gray-light))] pt-6">
                                            <h4 className="text-md font-semibold text-[rgb(var(--color-brand-text-light))] mb-2">Variantes</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                                                    <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                                                        <tr>
                                                            {(formData.options || []).map(opt => <th key={opt.id} className="px-4 py-2">{opt.name}</th>)}
                                                            <th className="px-4 py-2">Preço</th>
                                                            <th className="px-4 py-2">Estoque</th>
                                                            <th className="px-4 py-2">SKU</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(formData.variants || []).map(variant => (
                                                            <tr key={variant.id} className="border-t border-[rgb(var(--color-brand-gray-light))]">
                                                                {Object.entries(variant.options).map(([key, value]) => (
                                                                    <td key={key} className="px-4 py-2">{value}</td>
                                                                ))}
                                                                <td className="px-4 py-2">
                                                                    <input type="number" value={variant.price} onChange={e => handleVariantChange(variant.id, 'price', e.target.value)} className="w-24 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))] text-sm" />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <input type="number" value={variant.inventory} onChange={e => handleVariantChange(variant.id, 'inventory', e.target.value)} className="w-24 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))] text-sm" />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <input type="text" value={variant.sku} onChange={e => handleVariantChange(variant.id, 'sku', e.target.value)} className="w-24 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))] text-sm" />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Accordion>

                    {/* Shipping */}
                    <Accordion title="Envio">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="requiresShipping" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Este produto exige envio?</label>
                                <ToggleSwitch checked={!!formData.requiresShipping} onChange={c => handleToggleChange('requiresShipping', c)} labelId="requiresShipping" />
                            </div>
                            {formData.requiresShipping && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="weight" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Peso</label>
                                        <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                                    </div>
                                    <div>
                                        <label htmlFor="weightUnit" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Unidade de Peso</label>
                                        <select name="weightUnit" id="weightUnit" value={formData.weightUnit} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="lb">lb</option>
                                            <option value="oz">oz</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Accordion>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Product Status */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))]">Status do Produto</h3>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                <option value="Ativo">Ativo</option>
                                <option value="Rascunho">Rascunho</option>
                            </select>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))]">Organização do Produto</h3>
                        <div>
                            <label htmlFor="collectionId" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Coleção</label>
                            <select name="collectionId" id="collectionId" value={formData.collectionId || ''} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                <option value="">Nenhuma</option>
                                {collections.map(col => (
                                    <option key={col.id} value={col.id}>{col.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Tipo de Produto</label>
                            <select name="type" id="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                <option value="Físico">Físico</option>
                                <option value="Digital">Digital</option>
                                <option value="Dropshipping">Dropshipping</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Fornecedor (opcional)</label>
                            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                    </div>

                    {/* SEO */}
                    <Accordion title="SEO (Otimização para Busca)">
                        <div className="space-y-4">
                            <button type="button" onClick={handleGenerateSeo} disabled={isGeneratingSeo} className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold bg-[rgb(var(--color-brand-gold))]/[.10] text-[rgb(var(--color-brand-gold))] py-2 px-3 rounded-md hover:bg-[rgb(var(--color-brand-gold))]/[.20] transition-colors disabled:opacity-50">
                                {isGeneratingSeo ? <SpinnerIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                                {isGeneratingSeo ? 'Gerando...' : 'Gerar SEO com IA'}
                            </button>
                            <div>
                                <label htmlFor="seoTitle" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Título SEO</label>
                                <input type="text" name="seoTitle" id="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" maxLength={60} />
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">{formData.seoTitle?.length || 0} de 60 caracteres</p>
                            </div>
                            <div>
                                <label htmlFor="seoDescription" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Meta Descrição</label>
                                <textarea name="seoDescription" id="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={3} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" maxLength={160} />
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">{formData.seoDescription?.length || 0} de 160 caracteres</p>
                            </div>
                            <div>
                                <label htmlFor="urlHandle" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">URL Handle</label>
                                <input type="text" name="urlHandle" id="urlHandle" value={formData.urlHandle} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Ex: /produtos/nome-do-produto</p>
                            </div>
                        </div>
                    </Accordion>

                    {/* Custom Information (SKU/Barcode) */}
                    <Accordion title="Informações Adicionais">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">SKU (Stock Keeping Unit)</label>
                                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                            </div>
                            <div>
                                <label htmlFor="barcode" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Código de Barras (ISBN, UPC, GTIN)</label>
                                <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                            </div>
                        </div>
                    </Accordion>

                    {/* Tax */}
                    <Accordion title="Tributação">
                        <div className="flex items-center justify-between">
                            <label htmlFor="chargeTax" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))]">Cobrar imposto sobre este produto?</label>
                            <ToggleSwitch checked={!!formData.chargeTax} onChange={c => handleToggleChange('chargeTax', c)} labelId="chargeTax" />
                        </div>
                    </Accordion>
                </div>
            </form>
        </div>
    );
};

export default AddEditProduct;
