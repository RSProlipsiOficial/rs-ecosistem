import React, { useEffect, useMemo, useState } from 'react';
import { StoreCustomization, Product, OrderBump, OrderBumpOffer, OrderBumpRule } from '../types';
import { ToggleSwitch } from './ToggleSwitch';

interface ManageOrderBumpProps {
    settings: StoreCustomization['orderBump'];
    products: Product[];
    onSave: (newSettings: StoreCustomization['orderBump']) => Promise<void> | void;
}

interface ProductFilters {
    query: string;
    category: string;
    subcategory: string;
}

type FeedbackState = {
    type: 'success' | 'error';
    message: string;
} | null;

const DEFAULT_TITLE = 'SIM, EU QUERO ESTA OFERTA ESPECIAL!';
const EMPTY_FILTERS: ProductFilters = { query: '', category: '', subcategory: '' };
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const SEEDED_ORDER_BUMP_RULES: OrderBumpRule[] = [
    {
        id: 'seed-pro3-inflamaxi',
        name: 'Pro 3+ -> Inflamaxi',
        title: 'SIM, QUERO LEVAR O INFLAMAXI COM DESCONTO',
        description: 'Ao comprar o Pro 3+, adicione Inflamaxi ao pedido com preco especial.',
        triggerProductIds: ['802529e1-ead9-4eef-bf20-4ce63e25ec92'],
        offers: [{ productId: '486f290d-500f-4c1c-8889-f8d2db87c2bc', offerPrice: 99.9 }],
    },
    {
        id: 'seed-alpha-diva',
        name: 'AlphaLipsi -> DivaLipsi',
        title: 'COMBINE COM DIVALIPSI E PAGUE MENOS',
        description: 'Quem leva AlphaLipsi pode incluir DivaLipsi no mesmo pedido com valor promocional.',
        triggerProductIds: ['d8da03a4-d45a-4390-8698-9a35d43647c8'],
        offers: [{ productId: 'b98c42b9-52c5-478e-b172-faee36c6ba2c', offerPrice: 99.9 }],
    },
    {
        id: 'seed-diva-alpha',
        name: 'DivaLipsi -> AlphaLipsi',
        title: 'LEVE TAMBEM O ALPHALIPSI COM DESCONTO',
        description: 'Ao comprar DivaLipsi, ofereca AlphaLipsi como complemento com preco especial.',
        triggerProductIds: ['b98c42b9-52c5-478e-b172-faee36c6ba2c'],
        offers: [{ productId: 'd8da03a4-d45a-4390-8698-9a35d43647c8', offerPrice: 99.9 }],
    },
];

const createRuleId = () => `order-bump-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyRule = (): OrderBumpRule => ({
    id: createRuleId(),
    name: '',
    title: DEFAULT_TITLE,
    description: '',
    triggerProductIds: [],
    offers: [],
});

const dedupeStrings = (values: string[] = []) => Array.from(new Set(values.filter(Boolean).map(String)));

const normalizeOfferList = (offers: OrderBumpOffer[] = []) => {
    const offerMap = new Map<string, OrderBumpOffer>();

    offers.forEach((offer) => {
        if (!offer?.productId) return;
        offerMap.set(String(offer.productId), {
            productId: String(offer.productId),
            offerPrice: Number(offer.offerPrice || 0),
        });
    });

    return Array.from(offerMap.values());
};

const normalizeRule = (rule: Partial<OrderBumpRule>, fallback: OrderBump): OrderBumpRule => ({
    id: rule.id || createRuleId(),
    name: rule.name || '',
    title: rule.title || fallback.title || DEFAULT_TITLE,
    description: rule.description || fallback.description || '',
    triggerProductIds: dedupeStrings(rule.triggerProductIds || []),
    offers: normalizeOfferList(rule.offers || []),
});

const syncLegacyFields = (settings: OrderBump): OrderBump => {
    const firstRule = settings.rules?.[0];

    return {
        ...settings,
        title: firstRule?.title || settings.title || DEFAULT_TITLE,
        description: firstRule?.description || settings.description || '',
        triggerProductIds: firstRule?.triggerProductIds || [],
        offers: firstRule?.offers || [],
        productId: firstRule?.offers?.[0]?.productId || '',
        offerPrice: Number(firstRule?.offers?.[0]?.offerPrice || 0),
    };
};

const normalizeOrderBumpSettings = (settings: OrderBump): OrderBump => {
    const normalizedOffers = normalizeOfferList(
        Array.isArray(settings.offers) && settings.offers.length > 0
            ? settings.offers
            : (settings.productId ? [{ productId: settings.productId, offerPrice: Number(settings.offerPrice || 0) }] : [])
    );

    const hasLegacyRuleData = Boolean(
        normalizedOffers.length > 0 ||
        (settings.triggerProductIds || []).length > 0
    );

    const normalizedRules = Array.isArray(settings.rules) && settings.rules.length > 0
        ? settings.rules.map((rule) => normalizeRule(rule, settings))
        : (String(settings.productId || '') === '3'
            ? SEEDED_ORDER_BUMP_RULES.map((rule) => normalizeRule(rule, settings))
        : (hasLegacyRuleData
            ? [normalizeRule({
                id: 'legacy-order-bump',
                name: settings.title || 'Regra principal',
                title: settings.title || DEFAULT_TITLE,
                description: settings.description || '',
                triggerProductIds: settings.triggerProductIds || [],
                offers: normalizedOffers,
            }, settings)]
            : []));

    return syncLegacyFields({
        ...settings,
        enabled: Boolean(settings.enabled),
        title: settings.title || DEFAULT_TITLE,
        description: settings.description || '',
        triggerProductIds: dedupeStrings(settings.triggerProductIds || []),
        offers: normalizedOffers,
        rules: normalizedRules,
    });
};

const filterProducts = (products: Product[], filters: ProductFilters) => {
    const query = filters.query.trim().toLowerCase();

    return products.filter((product) => {
        const matchesQuery = !query || [
            product.name,
            product.seller,
            product.supplier,
            product.category,
            product.subcategory,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

        const matchesCategory = !filters.category || product.category === filters.category;
        const matchesSubcategory = !filters.subcategory || product.subcategory === filters.subcategory;

        return matchesQuery && matchesCategory && matchesSubcategory;
    });
};

const ManageOrderBump: React.FC<ManageOrderBumpProps> = ({ settings, products, onSave }) => {
    const normalizedSettings = useMemo(() => normalizeOrderBumpSettings(settings), [settings]);
    const [localSettings, setLocalSettings] = useState<OrderBump>(normalizedSettings);
    const [draftRule, setDraftRule] = useState<OrderBumpRule>(createEmptyRule());
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [triggerFilters, setTriggerFilters] = useState<ProductFilters>(EMPTY_FILTERS);
    const [offerFilters, setOfferFilters] = useState<ProductFilters>(EMPTY_FILTERS);
    const [showTriggerPicker, setShowTriggerPicker] = useState(true);
    const [showOfferPicker, setShowOfferPicker] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    useEffect(() => {
        setLocalSettings(normalizedSettings);
        setDraftRule(createEmptyRule());
        setEditingRuleId(null);
        setTriggerFilters(EMPTY_FILTERS);
        setOfferFilters(EMPTY_FILTERS);
        setFeedback(null);
    }, [normalizedSettings]);

    const hasGlobalChanges = JSON.stringify(localSettings) !== JSON.stringify(normalizedSettings);

    const categoryOptions = useMemo(
        () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
        [products]
    );

    const getSubcategoryOptions = (category: string) => Array.from(
        new Set(
            products
                .filter((product) => !category || product.category === category)
                .map((product) => product.subcategory)
                .filter(Boolean)
        )
    ).sort();

    const filteredTriggerProducts = useMemo(
        () => filterProducts(products, triggerFilters),
        [products, triggerFilters]
    );

    const filteredOfferProducts = useMemo(
        () => filterProducts(products, offerFilters),
        [products, offerFilters]
    );

    const selectedTriggerProducts = useMemo(
        () => products.filter((product) => draftRule.triggerProductIds.includes(product.id)),
        [products, draftRule.triggerProductIds]
    );

    const selectedOfferProducts = useMemo(() => {
        const offerMap = new Map((draftRule.offers || []).map((offer) => [offer.productId, Number(offer.offerPrice || 0)]));

        return products
            .filter((product) => offerMap.has(product.id))
            .map((product) => ({
                product,
                offerPrice: Number(offerMap.get(product.id) || 0),
            }));
    }, [products, draftRule.offers]);

    const persistSettings = async (nextSettings: OrderBump, successMessage: string, shouldResetDraft = false) => {
        setIsSaving(true);
        setFeedback(null);

        try {
            await Promise.resolve(onSave(nextSettings));
            setLocalSettings(nextSettings);
            setFeedback({ type: 'success', message: successMessage });

            if (shouldResetDraft) {
                setDraftRule(createEmptyRule());
                setEditingRuleId(null);
                setTriggerFilters(EMPTY_FILTERS);
                setOfferFilters(EMPTY_FILTERS);
                setShowTriggerPicker(false);
                setShowOfferPicker(false);
            }
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error?.message || 'Nao foi possivel salvar o order bump.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setLocalSettings(normalizedSettings);
        setDraftRule(createEmptyRule());
        setEditingRuleId(null);
        setTriggerFilters(EMPTY_FILTERS);
        setOfferFilters(EMPTY_FILTERS);
        setFeedback(null);
    };

    const handleToggleChange = (enabled: boolean) => {
        setLocalSettings((prev) => ({ ...prev, enabled }));
    };

    const handleDraftTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setDraftRule((prev) => ({ ...prev, [name]: value }));
    };

    const setFilterValue = (
        key: 'trigger' | 'offer',
        field: keyof ProductFilters,
        value: string
    ) => {
        const setFilters = key === 'trigger' ? setTriggerFilters : setOfferFilters;

        setFilters((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'category' ? { subcategory: '' } : {}),
        }));
    };

    const toggleTriggerProduct = (productId: string) => {
        setDraftRule((prev) => {
            const ids = new Set(prev.triggerProductIds);
            if (ids.has(productId)) ids.delete(productId);
            else ids.add(productId);

            return {
                ...prev,
                triggerProductIds: Array.from(ids),
            };
        });
    };

    const toggleOfferProduct = (productId: string, defaultPrice: number) => {
        setDraftRule((prev) => {
            const currentOffers = prev.offers || [];
            const exists = currentOffers.some((offer) => offer.productId === productId);

            return {
                ...prev,
                offers: exists
                    ? currentOffers.filter((offer) => offer.productId !== productId)
                    : [...currentOffers, { productId, offerPrice: Number(defaultPrice || 0) }],
            };
        });
    };

    const updateOfferPrice = (productId: string, offerPrice: number) => {
        setDraftRule((prev) => ({
            ...prev,
            offers: (prev.offers || []).map((offer) =>
                offer.productId === productId
                    ? { ...offer, offerPrice: Number(offerPrice || 0) }
                    : offer
            ),
        }));
    };

    const resetDraft = () => {
        setDraftRule(createEmptyRule());
        setEditingRuleId(null);
        setTriggerFilters(EMPTY_FILTERS);
        setOfferFilters(EMPTY_FILTERS);
        setFeedback(null);
    };

    const handleSaveRule = async () => {
        const normalizedRule = normalizeRule({
            ...draftRule,
            name: draftRule.name?.trim() || draftRule.title?.trim() || 'Nova regra',
            title: draftRule.title?.trim() || DEFAULT_TITLE,
            description: draftRule.description?.trim() || '',
        }, localSettings);

        if (normalizedRule.offers.length === 0) {
            setFeedback({ type: 'error', message: 'Selecione pelo menos um produto ofertado para salvar esta regra.' });
            return;
        }

        const currentRules = localSettings.rules || [];
        const nextRules = editingRuleId
            ? currentRules.map((rule) => rule.id === editingRuleId ? normalizedRule : rule)
            : [...currentRules, normalizedRule];

        const nextSettings = syncLegacyFields({
            ...localSettings,
            rules: nextRules,
        });

        await persistSettings(
            nextSettings,
            editingRuleId ? 'Regra de order bump atualizada.' : 'Regra de order bump salva.',
            true
        );
    };

    const handleEditRule = (rule: OrderBumpRule) => {
        setDraftRule(normalizeRule(rule, localSettings));
        setEditingRuleId(rule.id);
        setShowTriggerPicker(true);
        setShowOfferPicker(true);
        setFeedback(null);
    };

    const handleDeleteRule = async (ruleId: string) => {
        const nextRules = (localSettings.rules || []).filter((rule) => rule.id !== ruleId);
        const nextSettings = syncLegacyFields({
            ...localSettings,
            rules: nextRules,
        });

        await persistSettings(nextSettings, 'Regra removida com sucesso.');

        if (editingRuleId === ruleId) {
            resetDraft();
        }
    };

    const handleSaveStatus = async () => {
        await persistSettings(syncLegacyFields(localSettings), 'Configuracoes gerais atualizadas.');
    };

    return (
        <div className="space-y-6">
            <div className="mb-6 flex items-center justify-end border-b border-dark-800 pb-6">
                <div className="flex items-center gap-4">
                    {hasGlobalChanges && <p className="text-sm text-gold-400">Existem alteracoes gerais nao salvas.</p>}
                    <button
                        onClick={handleDiscard}
                        disabled={isSaving}
                        className="rounded-md bg-dark-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSaveStatus}
                        disabled={isSaving || !hasGlobalChanges}
                        className="rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-black hover:bg-gold-400 disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-8">
                <div className="rounded-lg border border-dark-800 bg-black">
                    <div className="flex items-center justify-between border-b border-dark-800 p-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Configuracao do Order Bump</h3>
                            <p className="mt-1 text-sm text-gray-500">Defina quais produtos ativam a oferta e quais produtos podem entrar juntos no checkout.</p>
                        </div>
                        <ToggleSwitch checked={localSettings.enabled} onChange={handleToggleChange} labelId="order-bump-toggle" />
                    </div>

                    <div className="space-y-8 p-6">
                        {feedback && (
                            <div className={`rounded-lg border px-4 py-3 text-sm ${
                                feedback.type === 'success'
                                    ? 'border-green-500/30 bg-green-500/10 text-green-300'
                                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                            }`}>
                                {feedback.message}
                            </div>
                        )}

                        {!localSettings.enabled && (
                            <div className="rounded-lg border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-gray-400">
                                O order bump esta desativado. Ative o interruptor acima para exibir as ofertas no checkout.
                            </div>
                        )}

                        <div className="rounded-xl border border-dark-700 bg-dark-900/60 p-5">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-base font-semibold text-white">
                                        {editingRuleId ? 'Editando regra salva' : 'Nova regra de order bump'}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Monte a regra, salve e ela sera listada abaixo para futuras edicoes.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetDraft}
                                    className="rounded-md border border-dark-600 px-4 py-2 text-sm font-semibold text-white hover:border-dark-500 hover:bg-dark-800"
                                >
                                    Nova regra
                                </button>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                    <label htmlFor="rule-name" className="mb-2 block text-sm font-medium text-gray-400">Nome interno da regra</label>
                                    <input
                                        id="rule-name"
                                        name="name"
                                        type="text"
                                        value={draftRule.name || ''}
                                        onChange={handleDraftTextChange}
                                        placeholder="Ex.: Pro 3+ -> Inframax"
                                        className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rule-title" className="mb-2 block text-sm font-medium text-gray-400">Titulo da oferta no checkout</label>
                                    <input
                                        id="rule-title"
                                        name="title"
                                        type="text"
                                        value={draftRule.title}
                                        onChange={handleDraftTextChange}
                                        className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="rule-description" className="mb-2 block text-sm font-medium text-gray-400">Descricao da oferta</label>
                                <textarea
                                    id="rule-description"
                                    name="description"
                                    rows={3}
                                    value={draftRule.description}
                                    onChange={handleDraftTextChange}
                                    className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                                <section className="space-y-4 rounded-xl border border-dark-700 bg-black/40 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h5 className="text-base font-semibold text-white">Produtos gatilho</h5>
                                            <p className="text-sm text-gray-500">Se nada for marcado, a regra aparece em qualquer checkout.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowTriggerPicker((prev) => !prev)}
                                            className="rounded-md border border-dark-600 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-300 hover:border-dark-500 hover:bg-dark-800"
                                        >
                                            {showTriggerPicker ? 'Fechar busca' : 'Buscar produtos'}
                                        </button>
                                    </div>

                                    {showTriggerPicker && (
                                        <div className="space-y-3 rounded-lg border border-dark-700 bg-dark-900/80 p-4">
                                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                                                <input
                                                    type="text"
                                                    value={triggerFilters.query}
                                                    onChange={(event) => setFilterValue('trigger', 'query', event.target.value)}
                                                    placeholder="Buscar por nome, vendedor, categoria..."
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                />
                                                <select
                                                    value={triggerFilters.category}
                                                    onChange={(event) => setFilterValue('trigger', 'category', event.target.value)}
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="">Todas as categorias</option>
                                                    {categoryOptions.map((category) => (
                                                        <option key={`trigger-category-${category}`} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={triggerFilters.subcategory}
                                                    onChange={(event) => setFilterValue('trigger', 'subcategory', event.target.value)}
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="">Todas as subcategorias</option>
                                                    {getSubcategoryOptions(triggerFilters.category).map((subcategory) => (
                                                        <option key={`trigger-subcategory-${subcategory}`} value={subcategory}>{subcategory}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                                {filteredTriggerProducts.map((product) => {
                                                    const selected = draftRule.triggerProductIds.includes(product.id);
                                                    const image = product.images?.[0] || product.featured_image || 'https://placehold.co/72x72?text=Produto';

                                                    return (
                                                        <div key={`trigger-product-${product.id}`} className="flex items-center gap-3 rounded-lg border border-dark-700 bg-dark-950 px-3 py-3">
                                                            <img src={image} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                                                            <div className="min-w-0 flex-grow">
                                                                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                                                <p className="truncate text-xs text-gray-500">
                                                                    {[product.category, product.subcategory, product.seller || product.supplier].filter(Boolean).join(' - ')}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleTriggerProduct(product.id)}
                                                                className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-widest ${
                                                                    selected
                                                                        ? 'bg-red-500/15 text-red-300'
                                                                        : 'bg-gold-500 text-black'
                                                                }`}
                                                            >
                                                                {selected ? 'Remover' : 'Selecionar'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                {filteredTriggerProducts.length === 0 && (
                                                    <div className="rounded-lg border border-dashed border-dark-700 px-4 py-6 text-center text-sm text-gray-500">
                                                        Nenhum produto encontrado com estes filtros.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Selecionados nesta regra</p>
                                        {selectedTriggerProducts.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-dark-700 px-4 py-3 text-sm text-gray-400">
                                                Todos os produtos do checkout vao poder exibir esta oferta.
                                            </div>
                                        ) : (
                                            selectedTriggerProducts.map((product) => (
                                                <div key={`selected-trigger-${product.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-dark-700 bg-dark-900 px-3 py-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-white">{product.name}</p>
                                                        <p className="truncate text-xs text-gray-500">{product.seller || product.supplier || 'Marketplace RS'}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTriggerProduct(product.id)}
                                                        className="rounded-md border border-dark-600 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-red-400 hover:text-red-300"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-xl border border-dark-700 bg-black/40 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h5 className="text-base font-semibold text-white">Produtos ofertados</h5>
                                            <p className="text-sm text-gray-500">Selecione quantos produtos quiser e defina o preco promocional de cada um.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowOfferPicker((prev) => !prev)}
                                            className="rounded-md border border-dark-600 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-300 hover:border-dark-500 hover:bg-dark-800"
                                        >
                                            {showOfferPicker ? 'Fechar busca' : 'Buscar produtos'}
                                        </button>
                                    </div>

                                    {showOfferPicker && (
                                        <div className="space-y-3 rounded-lg border border-dark-700 bg-dark-900/80 p-4">
                                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                                                <input
                                                    type="text"
                                                    value={offerFilters.query}
                                                    onChange={(event) => setFilterValue('offer', 'query', event.target.value)}
                                                    placeholder="Buscar por nome, vendedor, categoria..."
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                />
                                                <select
                                                    value={offerFilters.category}
                                                    onChange={(event) => setFilterValue('offer', 'category', event.target.value)}
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="">Todas as categorias</option>
                                                    {categoryOptions.map((category) => (
                                                        <option key={`offer-category-${category}`} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={offerFilters.subcategory}
                                                    onChange={(event) => setFilterValue('offer', 'subcategory', event.target.value)}
                                                    className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="">Todas as subcategorias</option>
                                                    {getSubcategoryOptions(offerFilters.category).map((subcategory) => (
                                                        <option key={`offer-subcategory-${subcategory}`} value={subcategory}>{subcategory}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                                {filteredOfferProducts.map((product) => {
                                                    const selected = draftRule.offers.some((offer) => offer.productId === product.id);
                                                    const image = product.images?.[0] || product.featured_image || 'https://placehold.co/72x72?text=Produto';

                                                    return (
                                                        <div key={`offer-product-${product.id}`} className="flex items-center gap-3 rounded-lg border border-dark-700 bg-dark-950 px-3 py-3">
                                                            <img src={image} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                                                            <div className="min-w-0 flex-grow">
                                                                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                                                <p className="truncate text-xs text-gray-500">
                                                                    {[product.category, product.subcategory, product.seller || product.supplier].filter(Boolean).join(' - ')}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gold-400">Preco original: {currencyFormatter.format(Number(product.price || 0))}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleOfferProduct(product.id, Number(product.price || 0))}
                                                                className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-widest ${
                                                                    selected
                                                                        ? 'bg-red-500/15 text-red-300'
                                                                        : 'bg-gold-500 text-black'
                                                                }`}
                                                            >
                                                                {selected ? 'Remover' : 'Selecionar'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                {filteredOfferProducts.length === 0 && (
                                                    <div className="rounded-lg border border-dashed border-dark-700 px-4 py-6 text-center text-sm text-gray-500">
                                                        Nenhum produto encontrado com estes filtros.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Ofertas salvas nesta regra</p>
                                        {selectedOfferProducts.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-dark-700 px-4 py-3 text-sm text-gray-400">
                                                Nenhum produto ofertado foi selecionado ainda.
                                            </div>
                                        ) : (
                                            selectedOfferProducts.map(({ product, offerPrice }) => (
                                                <div key={`selected-offer-${product.id}`} className="grid gap-4 rounded-lg border border-dark-700 bg-dark-900 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-center">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-white">{product.name}</p>
                                                        <p className="truncate text-xs text-gray-500">{product.seller || product.supplier || 'Marketplace RS'}</p>
                                                        <p className="mt-1 text-xs text-gray-400">Original: {currencyFormatter.format(Number(product.price || 0))}</p>
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500">Preco da oferta</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={offerPrice}
                                                            onChange={(event) => updateOfferPrice(product.id, Number(event.target.value))}
                                                            className="w-full rounded-md border border-dark-600 bg-dark-800 px-3 py-2 text-white"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOfferProduct(product.id, Number(product.price || 0))}
                                                        className="rounded-md border border-dark-600 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-red-400 hover:text-red-300"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetDraft}
                                    className="rounded-md border border-dark-600 px-4 py-2 text-sm font-semibold text-white hover:border-dark-500 hover:bg-dark-800"
                                >
                                    Limpar formulario
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveRule}
                                    disabled={isSaving}
                                    className="rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-black hover:bg-gold-400 disabled:opacity-50"
                                >
                                    {isSaving ? 'Salvando regra...' : editingRuleId ? 'Salvar edicao' : 'Salvar regra'}
                                </button>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-semibold text-white">Regras salvas</h4>
                                    <p className="text-sm text-gray-500">Cada regra abaixo pode ser editada ou removida sem perder as outras.</p>
                                </div>
                                <div className="rounded-full border border-dark-700 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                    {localSettings.rules?.length || 0} regra(s)
                                </div>
                            </div>

                            {(localSettings.rules || []).length === 0 ? (
                                <div className="rounded-lg border border-dashed border-dark-700 bg-dark-900/40 px-4 py-6 text-center text-sm text-gray-500">
                                    Nenhuma regra de order bump foi salva ainda.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(localSettings.rules || []).map((rule) => {
                                        const triggerNames = rule.triggerProductIds
                                            .map((productId) => products.find((product) => product.id === productId)?.name)
                                            .filter(Boolean) as string[];
                                        const offerNames = rule.offers
                                            .map((offer) => products.find((product) => product.id === offer.productId)?.name)
                                            .filter(Boolean) as string[];

                                        return (
                                            <div key={rule.id} className="rounded-xl border border-dark-700 bg-dark-900/60 p-4">
                                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">{rule.name || 'Regra sem nome'}</p>
                                                            <h5 className="mt-1 text-lg font-semibold text-white">{rule.title}</h5>
                                                            {rule.description && <p className="mt-2 text-sm text-gray-400">{rule.description}</p>}
                                                        </div>

                                                        <div className="grid gap-3 lg:grid-cols-2">
                                                            <div className="rounded-lg border border-dark-700 bg-black/40 px-4 py-3">
                                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Produtos gatilho</p>
                                                                <p className="mt-2 text-sm text-white">
                                                                    {triggerNames.length > 0 ? triggerNames.join(', ') : 'Todos os produtos do checkout'}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-lg border border-dark-700 bg-black/40 px-4 py-3">
                                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Produtos ofertados</p>
                                                                <p className="mt-2 text-sm text-white">{offerNames.join(', ')}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditRule(rule)}
                                                            className="rounded-md border border-dark-600 px-4 py-2 text-sm font-semibold text-white hover:border-dark-500 hover:bg-dark-800"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                            disabled={isSaving}
                                                            className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageOrderBump;
