

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Collection, ProductOption, ProductVariant, ProductMaterial } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';
import RichTextEditor from './RichTextEditor';
import { ToggleSwitch } from './ToggleSwitch';
import { BotIcon } from './icons/BotIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { productsAPI } from '../services/marketplaceAPI';

const COMMISSION_ORIGIN_OPTIONS = [
    { value: 'rs_physical', label: 'RS Fisico' },
    { value: 'rs_digital', label: 'RS Digital / Drop' },
    { value: 'affiliate_physical', label: 'Afiliado Fisico' },
    { value: 'affiliate_digital', label: 'Afiliado Digital' },
];

const AFFILIATE_MODEL_OPTIONS = [
    { value: 'none', label: 'Nao se aplica' },
    { value: 'essential', label: 'Essential' },
    { value: 'professional', label: 'Professional' },
    { value: 'premium', label: 'Premium' },
];

interface AddEditProductProps {
    product: Product | null;
    collections: Collection[];
    currentUserId?: string | null;
    currentUserName?: string;
    currentUserLoginId?: string;
    forceSellerStoreOrigin?: boolean;
    onSave: (product: Product) => Promise<void> | void;
    onCancel: () => void;
    onCollectionCreated?: (name: string) => Promise<Collection | null>;
}

const parseMaybeJson = <T,>(value: unknown, fallback: T): T | unknown => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return fallback;

    const looksLikeJson = (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );

    if (!looksLikeJson) return value;

    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return fallback;
    }
};

const normalizeRecord = (value: unknown): Record<string, any> => {
    const parsed = parseMaybeJson<Record<string, any> | null>(value, null);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, any>
        : {};
};

const normalizeStringList = (value: unknown): string[] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
    }

    return typeof parsed === 'string' && parsed.length > 0 ? [parsed] : [];
};

const normalizeProductOptions = (value: unknown): ProductOption[] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    return Array.isArray(parsed)
        ? parsed.map((option: any, index) => ({
            id: String(option?.id ?? `opt-${Date.now()}-${index}`),
            name: String(option?.name ?? `Opção ${index + 1}`),
            values: normalizeStringList(option?.values)
        }))
        : [];
};

const normalizeProductVariants = (value: unknown, fallbackPrice: number): ProductVariant[] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    return Array.isArray(parsed)
        ? parsed.map((variant: any, index) => ({
            id: String(variant?.id ?? `var-${Date.now()}-${index}`),
            options: variant?.options && typeof normalizeRecord(variant.options) === 'object'
                ? Object.fromEntries(
                    Object.entries(normalizeRecord(variant.options)).map(([key, optionValue]) => [String(key), String(optionValue ?? '')])
                )
                : {},
            price: Number(variant?.price ?? fallbackPrice ?? 0),
            inventory: Number(variant?.inventory ?? 0),
            sku: String(variant?.sku ?? ''),
            imageId: variant?.imageId ? String(variant.imageId) : undefined
        }))
        : [];
};

const normalizeProductMaterials = (value: unknown): ProductMaterial[] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    if (typeof parsed === 'string' && parsed.length > 0) {
        return [{
            name: parsed.split('/').pop() ?? 'arquivo',
            url: parsed
        }];
    }

    return Array.isArray(parsed)
        ? parsed
            .map((material: any) => {
                if (typeof material === 'string') {
                    return {
                        name: material.split('/').pop() ?? 'arquivo',
                        url: material
                    };
                }

                if (!material?.url) return null;
                return {
                    name: String(material.name ?? material.url.split('/').pop() ?? 'arquivo'),
                    url: String(material.url),
                    size: material.size !== undefined ? Number(material.size) : undefined,
                    mimeType: material.mimeType ? String(material.mimeType) : undefined
                };
            })
            .filter(Boolean) as ProductMaterial[]
        : [];
};

const buildInitialFormData = (product: Product | null, collections: Collection[]): Partial<Product> => {
    const fallbackCollectionId = collections[0]?.id || null;
    const memberPrice = Number(product?.memberPrice ?? 0);

    const defaults: Partial<Product> = {
        name: '',
        shortDescription: '',
        description: '',
        images: [],
        price: 0,
        memberPrice: 0,
        dropshipPrice: 0,
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
        collectionId: fallbackCollectionId,
        subcategory: '',
        seoTitle: '',
        seoDescription: '',
        urlHandle: '',
        weight: 0,
        weightUnit: 'kg',
        supplier: '',
        productType: 'physical',
        commissionOrigin: 'rs_physical',
        affiliateModel: 'none',
        ownerUserId: null,
        ownerLoginId: '',
        fulfillmentOriginType: 'central',
        fulfillmentOriginId: null,
        fulfillmentOriginName: '',
        fulfillmentOriginZip: '',
        options: [],
        variants: [],
    };

    return {
        ...defaults,
        ...product,
        images: normalizeStringList(product?.images),
        videos: normalizeStringList(product?.videos),
        materials: normalizeProductMaterials(product?.materials),
        options: normalizeProductOptions(product?.options),
        variants: normalizeProductVariants(product?.variants, Number(product?.price ?? memberPrice * 2 ?? 0)),
        collectionIds: Array.isArray(product?.collectionIds)
            ? product.collectionIds.filter((id): id is string => typeof id === 'string')
            : (product?.collectionId ? [product.collectionId] : []),
        collectionId: product?.collectionId ?? fallbackCollectionId,
        price: Number(product?.price ?? memberPrice * 2 ?? 0),
        memberPrice,
        dropshipPrice: product?.dropshipPrice !== undefined ? Number(product.dropshipPrice) : 0,
        inventory: Number(product?.inventory ?? 10),
        weight: Number(product?.weight ?? 0),
        compareAtPrice: product?.compareAtPrice !== undefined ? Number(product.compareAtPrice) : undefined,
        costPerItem: product?.costPerItem !== undefined ? Number(product.costPerItem) : undefined,
        shortDescription: String(product?.shortDescription ?? ''),
        description: String(product?.description ?? ''),
        seoTitle: String(product?.seoTitle ?? ''),
        seoDescription: String(product?.seoDescription ?? ''),
        sku: String(product?.sku ?? ''),
        barcode: String(product?.barcode ?? ''),
        subcategory: String(product?.subcategory ?? ''),
        supplier: String(product?.supplier ?? ''),
        urlHandle: String(product?.urlHandle ?? ''),
        type: String(product?.type ?? 'Fisico'),
        productType: (product?.productType ?? 'physical') as Product['productType'],
        commissionOrigin: (product?.commissionOrigin ?? 'rs_physical') as Product['commissionOrigin'],
        affiliateModel: (product?.affiliateModel ?? 'none') as Product['affiliateModel'],
        ownerUserId: product?.ownerUserId ?? null,
        ownerLoginId: String(product?.ownerLoginId ?? ''),
        fulfillmentOriginType: (product?.fulfillmentOriginType ?? 'central') as Product['fulfillmentOriginType'],
        fulfillmentOriginId: product?.fulfillmentOriginId ?? null,
        fulfillmentOriginName: String(product?.fulfillmentOriginName ?? ''),
        fulfillmentOriginZip: String(product?.fulfillmentOriginZip ?? ''),
    };
};

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

const AddEditProduct: React.FC<AddEditProductProps> = ({ product, collections, currentUserId, currentUserName, currentUserLoginId, forceSellerStoreOrigin = false, onSave, onCancel, onCollectionCreated }) => {
    const isEditing = !!product?.id || (product?.id === '' && !!product.name);

    const [formData, setFormData] = useState<Partial<Product>>(() => buildInitialFormData(product, collections));

    useEffect(() => {
        if (formData.fulfillmentOriginType !== 'seller_store') return;
        setFormData(prev => ({
            ...prev,
            ownerUserId: prev.ownerUserId || currentUserId || null,
            ownerLoginId: prev.ownerLoginId || currentUserLoginId || '',
            fulfillmentOriginId: prev.fulfillmentOriginId || currentUserId || null,
            fulfillmentOriginName: prev.fulfillmentOriginName || currentUserName || prev.seller || '',
        }));
    }, [formData.fulfillmentOriginType, currentUserId, currentUserLoginId, currentUserName]);

    useEffect(() => {
        if (!forceSellerStoreOrigin) return;
        setFormData(prev => ({
            ...prev,
            fulfillmentOriginType: 'seller_store',
        }));
    }, [forceSellerStoreOrigin]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

    const [pendingImageFiles, setPendingImageFiles] = useState<Record<string, File>>({});
    const [pendingVideoFiles, setPendingVideoFiles] = useState<Record<string, File>>({});
    const [pendingMaterialFiles, setPendingMaterialFiles] = useState<Record<string, File>>({});
    const [isUploading, setIsUploading] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const materialInputRef = useRef<HTMLInputElement>(null);
    const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

    const hasVariants = useMemo(() => (formData.options || []).length > 0, [formData.options]);

    useEffect(() => {
        setFormData(buildInitialFormData(product, collections));
        setPendingImageFiles({});
        setPendingVideoFiles({});
        setPendingMaterialFiles({});
        setNewOptionValues({});
    }, [product, collections]);

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
        console.log(`[AddEditProduct] Input Change: ${name} = ${value}`);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (name: keyof Product, checked: boolean) => {
        console.log(`[AddEditProduct] Toggle Change: ${name} = ${checked}`);
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    };

    const handleFileUpload = (file: File, base64: string) => {
        setPendingImageFiles(prev => ({ ...prev, [base64]: file }));
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64] }));
    };

    const handleImageRemove = (urlToRemove: string) => {
        setFormData(prev => ({ ...prev, images: prev.images?.filter(url => url !== urlToRemove) }));
        setPendingImageFiles(prev => {
            const nextFiles = { ...prev };
            delete nextFiles[urlToRemove];
            return nextFiles;
        });
    };

    const handleVideoFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const nextPendingFiles: Record<string, File> = {};
        const nextVideos = files.map((file) => {
            const previewUrl = URL.createObjectURL(file);
            nextPendingFiles[previewUrl] = file;
            return previewUrl;
        });

        setPendingVideoFiles(prev => ({ ...prev, ...nextPendingFiles }));
        setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), ...nextVideos] }));
        event.target.value = '';
    };

    const handleMaterialFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const nextPendingFiles: Record<string, File> = {};
        const nextMaterials: ProductMaterial[] = files.map((file) => {
            const localUrl = `local-material:${Date.now()}:${Math.random().toString(36).slice(2)}:${file.name}`;
            nextPendingFiles[localUrl] = file;
            return {
                name: file.name,
                url: localUrl,
                size: file.size,
                mimeType: file.type
            };
        });

        setPendingMaterialFiles(prev => ({ ...prev, ...nextPendingFiles }));
        setFormData(prev => ({ ...prev, materials: [...(prev.materials || []), ...nextMaterials] }));
        event.target.value = '';
    };

    const handleVideoRemove = (videoToRemove: string) => {
        if (videoToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(videoToRemove);
        }

        setFormData(prev => ({ ...prev, videos: (prev.videos || []).filter(url => url !== videoToRemove) }));
        setPendingVideoFiles(prev => {
            const nextFiles = { ...prev };
            delete nextFiles[videoToRemove];
            return nextFiles;
        });
    };

    const handleMaterialRemove = (materialUrl: string) => {
        setFormData(prev => ({
            ...prev,
            materials: (prev.materials || []).filter(material => material.url !== materialUrl)
        }));
        setPendingMaterialFiles(prev => {
            const nextFiles = { ...prev };
            delete nextFiles[materialUrl];
            return nextFiles;
        });
    };

    const getMaterialName = (material: ProductMaterial) => {
        return material.name || material.url.split('/').pop() || 'arquivo';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[AddEditProduct] Submit triggered. Current formData:', formData);

        if (isUploading) {
            console.warn('[AddEditProduct] Submit blocked: upload in progress');
            return;
        }

        if (!formData.name?.trim()) {
            alert('Por favor, insira um nome para o produto.');
            return;
        }

        setIsUploading(true);
        try {
            let userImages = [...(formData.images || [])];
            let userVideos = [...(formData.videos || [])];
            let userMaterials = [...(formData.materials || [])];
            let hasNewImages = false;
            let hasNewVideos = false;
            let hasNewMaterials = false;

            for (let i = 0; i < userImages.length; i++) {
                const imgStr = userImages[i];
                if (pendingImageFiles[imgStr]) {
                    const result: any = await productsAPI.uploadAsset(pendingImageFiles[imgStr], 'products');
                    if (result?.success && result?.url) {
                        userImages[i] = result.url;
                        hasNewImages = true;
                    } else {
                        throw new Error(result?.error || 'Erro no upload de arquivo');
                    }
                }
            }

            for (let i = 0; i < userVideos.length; i++) {
                const videoUrl = userVideos[i];
                if (pendingVideoFiles[videoUrl]) {
                    const result: any = await productsAPI.uploadAsset(pendingVideoFiles[videoUrl], 'videos');
                    if (result?.success && result?.url) {
                        userVideos[i] = result.url;
                        hasNewVideos = true;
                    } else {
                        throw new Error(result?.error || 'Erro no upload do vídeo');
                    }
                }
            }

            userMaterials = await Promise.all(
                userMaterials.map(async (material) => {
                    const pendingFile = pendingMaterialFiles[material.url];
                    if (!pendingFile) return material;

                    const result: any = await productsAPI.uploadAsset(pendingFile, 'materials');
                    if (!result?.success || !result?.url) {
                        throw new Error(result?.error || 'Erro no upload do material');
                    }

                    hasNewMaterials = true;
                    return {
                        ...material,
                        name: material.name || pendingFile.name,
                        url: result.url,
                        size: pendingFile.size,
                        mimeType: pendingFile.type
                    };
                })
            );

            const finalProduct = {
                ...formData,
                images: userImages,
                videos: userVideos,
                materials: userMaterials,
                featured_image: userImages[0] || null
            };
            await Promise.resolve(onSave(finalProduct as Product));

            if (hasNewImages) {
                setPendingImageFiles({});
            }
            if (hasNewVideos) {
                Object.keys(pendingVideoFiles).forEach((url) => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
                setPendingVideoFiles({});
            }
            if (hasNewMaterials) {
                setPendingMaterialFiles({});
            }
        } catch (error: any) {
            console.error('Erro na submissão do produto: ', error);
            alert(`Falha ao salvar produto/imagem: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
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
                    <button type="button" onClick={handleSaveClick} disabled={isUploading} className="flex items-center gap-2 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-secondary))] transition-colors disabled:opacity-50">
                        {isUploading && <SpinnerIcon className="w-4 h-4" />}
                        {isUploading ? 'Enviando...' : 'Salvar'}
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
                        <div className="relative">
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
                                    <ImageUploader currentImage="" onImageUpload={handleImageUpload} onFileUpload={handleFileUpload} placeholderText="Adicionar imagem" aspectRatio="square" />
                                )}
                            </div>

                            <div className="mt-6 border-t border-[rgb(var(--color-brand-gray-light))] pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))]">Videos</h4>
                                    <button
                                        type="button"
                                        onClick={() => videoInputRef.current?.click()}
                                        className="text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:underline"
                                    >
                                        + Adicionar video
                                    </button>
                                </div>
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleVideoFilesSelected}
                                />
                                {(formData.videos?.length || 0) > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(formData.videos || []).map(video => (
                                            <div key={video} className="relative group rounded-lg border border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))]/[.35] p-2">
                                                <video src={video} className="w-full h-40 rounded-md object-cover bg-black" controls muted />
                                                <button
                                                    type="button"
                                                    onClick={() => handleVideoRemove(video)}
                                                    className="absolute top-3 right-3 p-1.5 bg-[rgb(var(--color-error))] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-[rgb(var(--color-brand-gray-light))] p-4 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                        Nenhum video enviado.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-[rgb(var(--color-brand-gray-light))] pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))]">Materiais</h4>
                                    <button
                                        type="button"
                                        onClick={() => materialInputRef.current?.click()}
                                        className="text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:underline"
                                    >
                                        + Adicionar material
                                    </button>
                                </div>
                                <input
                                    ref={materialInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleMaterialFilesSelected}
                                />
                                {(formData.materials?.length || 0) > 0 ? (
                                    <div className="space-y-2">
                                        {(formData.materials || []).map(material => (
                                            <div key={material.url} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))]/[.35] px-3 py-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm text-[rgb(var(--color-brand-text-light))]">{getMaterialName(material)}</p>
                                                    <p className="truncate text-[11px] text-[rgb(var(--color-brand-text-dim))]">
                                                        {material.mimeType || 'arquivo'}{material.size ? ` • ${(material.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMaterialRemove(material.url)}
                                                    className="ml-3 p-1.5 text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/10 rounded-full"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-[rgb(var(--color-brand-gray-light))] p-4 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                        Nenhum material anexado.
                                    </div>
                                )}
                            </div>

                            {/* Overlay de Upload */}
                            {isUploading && (
                                <div className="absolute inset-0 z-10 bg-[rgb(var(--color-brand-dark))]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-[rgb(var(--color-brand-gold))]/30 animate-in fade-in duration-300">
                                    <SpinnerIcon className="w-10 h-10 text-[rgb(var(--color-brand-gold))] animate-spin mb-3" />
                                    <p className="text-sm font-bold text-[rgb(var(--color-brand-gold))] uppercase tracking-widest">Processando Mídia...</p>
                                    <p className="text-[10px] text-[rgb(var(--color-brand-text-dim))] mt-1">Sincronizando com Supabase</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-3">Formatos: JPG, PNG, WebP, GIF, MP4, WebM (máx. 10 arquivos, 30s para vídeos)</p>
                    </div>

                    {/* Pricing */}
                    <Accordion title="Precos" defaultOpen>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="memberPrice" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preco Consultor (Base)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                    <input type="number" name="memberPrice" id="memberPrice" value={formData.memberPrice} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gold))]/[.30] rounded-md py-2 pl-9 pr-3 text-[rgb(var(--color-brand-text-light))] font-bold" step="0.01" min="0" />
                                </div>
                                <p className="text-xs text-[rgb(var(--color-brand-gold))] mt-1">Este e o valor base. O preco de varejo sera R$ {((formData.memberPrice || 0) * 2).toFixed(2)}.</p>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preco Loja (Varejo)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                    <input type="number" name="price" id="price" value={formData.price} readOnly className="w-full bg-[rgb(var(--color-brand-gray-light))]/[.10] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-9 pr-3 text-[rgb(var(--color-brand-text-light))] opacity-75 cursor-not-allowed" step="0.01" min="0" />
                                </div>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Calculado automaticamente (2x o preco consultor).</p>
                            </div>
                            <div>
                                <label htmlFor="dropshipPrice" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preco Drop</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                    <input type="number" name="dropshipPrice" id="dropshipPrice" value={formData.dropshipPrice ?? 0} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-9 pr-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                                </div>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Use para o modelo digital/drop separado do varejo e do consultor.</p>
                            </div>
                            <div>
                                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Preco de Comparacao (De:)</label>
                                <input type="number" name="compareAtPrice" id="compareAtPrice" value={formData.compareAtPrice} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                            </div>
                            <div>
                                <label htmlFor="costPerItem" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Custo de Producao/Compra</label>
                                <input type="number" name="costPerItem" id="costPerItem" value={formData.costPerItem} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" step="0.01" min="0" />
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Apenas para calculo interno de lucro.</p>
                            </div>
                            <div>
                                <label htmlFor="productType" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Tipo Comercial</label>
                                <select name="productType" id="productType" value={formData.productType || 'physical'} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                    <option value="physical">Produto Fisico</option>
                                    <option value="digital">Produto Digital</option>
                                </select>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Produto digital alimenta carreira digital; fisico segue fluxo tradicional.</p>
                            </div>
                            <div>
                                <label htmlFor="commissionOrigin" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Origem Comercial / Comissao</label>
                                <select name="commissionOrigin" id="commissionOrigin" value={formData.commissionOrigin || 'rs_physical'} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                    {COMMISSION_ORIGIN_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Use afiliado para produto de terceiro; use RS Digital / Drop para carreira digital da casa.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="affiliateModel" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Modelo Afiliado</label>
                                <select name="affiliateModel" id="affiliateModel" value={formData.affiliateModel || 'none'} onChange={handleInputChange} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                    {AFFILIATE_MODEL_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">Quando o produto nao for da RS, isso define a tabela de comissao do afiliado.</p>
                            </div>
                            <div>
                                <label htmlFor="fulfillmentOriginType" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Origem do Atendimento</label>
                                <select name="fulfillmentOriginType" id="fulfillmentOriginType" value={formData.fulfillmentOriginType || 'central'} onChange={handleInputChange} disabled={forceSellerStoreOrigin} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))] disabled:cursor-not-allowed disabled:opacity-70">
                                    <option value="central">Sede / Marketplace</option>
                                    <option value="seller_store">Loja do Lojista</option>
                                </select>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1">
                                    {forceSellerStoreOrigin
                                        ? 'Conta de lojista: os produtos criados aqui saem sempre da propria loja.'
                                        : 'Produtos do lojista saem do endereco da propria loja e nao da sede.'}
                                </p>
                            </div>
                            <div>
                                <label htmlFor="fulfillmentOriginName" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Nome da Origem</label>
                                <input type="text" name="fulfillmentOriginName" id="fulfillmentOriginName" value={formData.fulfillmentOriginName || ''} onChange={handleInputChange} placeholder={currentUserName || 'Ex.: Loja do Emanuel'} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                            </div>
                            <div>
                                <label htmlFor="fulfillmentOriginZip" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">CEP da Origem</label>
                                <input type="text" name="fulfillmentOriginZip" id="fulfillmentOriginZip" value={formData.fulfillmentOriginZip || ''} onChange={handleInputChange} placeholder="00000-000" className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                            </div>
                            <div className="md:col-span-2 rounded-md border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-dark))] px-4 py-3 text-xs text-[rgb(var(--color-brand-text-dim))]">
                                <p>Responsavel vinculado: <span className="font-semibold text-[rgb(var(--color-brand-gold))]">{formData.ownerLoginId || currentUserLoginId || '--'}</span></p>
                                <p className="mt-1">Produtos da loja do lojista so devem ser misturados no carrinho com itens da mesma origem de atendimento.</p>
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

                        {/* Multi-coleção: checkboxes */}
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">
                                Coleções <span className="text-xs text-[rgb(var(--color-brand-text-dim))]">(selecione uma ou mais)</span>
                            </label>
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 bg-[rgb(var(--color-brand-gray))]/30 rounded-lg p-3 border border-[rgb(var(--color-brand-gray-light))]">
                                {collections.length === 0 && (
                                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Nenhuma coleção criada. Crie coleções em <strong>Minha Loja → Coleções</strong>.</p>
                                )}
                                {collections.map(col => {
                                    const checked = (formData.collectionIds || []).includes(col.id);
                                    return (
                                        <label key={col.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    const current = formData.collectionIds || [];
                                                    const next = checked
                                                        ? current.filter(id => id !== col.id)
                                                        : [...current, col.id];
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        collectionIds: next,
                                                        collectionId: next[0] || null, // retrocompatibilidade
                                                    }));
                                                }}
                                                className="w-4 h-4 accent-[rgb(var(--color-brand-gold))]"
                                            />
                                            <span className={`text-sm ${checked ? 'text-[rgb(var(--color-brand-gold))] font-semibold' : 'text-[rgb(var(--color-brand-text-dim))] group-hover:text-white'}`}>
                                                {col.title}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {onCollectionCreated && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const name = window.prompt('Nome da nova coleção:');
                                        if (name && name.trim()) {
                                            const newCol = await onCollectionCreated(name.trim());
                                            if (newCol) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    collectionIds: [...(prev.collectionIds || []), newCol.id],
                                                    collectionId: (prev.collectionIds || []).length === 0 ? newCol.id : (prev.collectionId || newCol.id)
                                                }));
                                            }
                                        }
                                    }}
                                    className="mt-2 text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:underline flex items-center gap-1"
                                >
                                    + Criar Nova Coleção
                                </button>
                            )}
                            {(formData.collectionIds?.length || 0) > 0 && (
                                <p className="text-xs text-[rgb(var(--color-brand-gold))] mt-2">
                                    ✓ {formData.collectionIds?.length} coleção(ões) selecionada(s): {formData.collectionIds?.map(id => collections.find(c => c.id === id)?.title).filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Subcategoria */}
                        <div>
                            <label htmlFor="subcategory" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">
                                Subcategoria
                                <span className="text-xs text-[rgb(var(--color-brand-text-dim))] ml-2">(ex: Encapsulado, Líquido, Pó)</span>
                            </label>
                            <input
                                type="text"
                                name="subcategory"
                                id="subcategory"
                                value={formData.subcategory || ''}
                                onChange={handleInputChange}
                                placeholder="Ex: Encapsulado, Termogênico, Vitamina..."
                                className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))] text-sm"
                            />
                        </div>

                        {/* Tipo de Produto */}
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
