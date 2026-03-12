import React, { useEffect, useMemo, useState } from 'react';
import type { Collection, Product, SponsoredRequest, SponsoredSettings, StoreCustomization } from '../types';
import { adminSettingsAPI } from '../services/marketplaceAPI';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ManagePromotionBoostProps {
    products: Product[];
    collections: Collection[];
    requests: StoreCustomization['promotionRequests'];
    onSave: (requests: StoreCustomization['promotionRequests']) => Promise<void> | void;
}

type FeedbackState = {
    type: 'success' | 'error';
    message: string;
} | null;

type PromotionDraft = {
    productId: string;
    packageId: string;
    query: string;
    collectionId: string;
    category: string;
    subcategory: string;
    objectivePreset: string;
    objectiveCustom: string;
    notes: string;
};

const statusClasses: Record<string, string> = {
    rascunho: 'bg-gray-700/60 text-gray-200',
    pendente: 'bg-yellow-500/20 text-yellow-300',
    aprovado: 'bg-green-500/20 text-green-300',
    rejeitado: 'bg-red-500/20 text-red-300',
};

const paymentStatusClasses: Record<string, string> = {
    nao_gerado: 'bg-gray-700/60 text-gray-200',
    pendente: 'bg-yellow-500/20 text-yellow-300',
    pago: 'bg-green-500/20 text-green-300',
    cancelado: 'bg-red-500/20 text-red-300',
    falhou: 'bg-red-500/20 text-red-300',
};

const OBJECTIVE_PRESETS = [
    'Impulsionar vendas',
    'Lancar produto',
    'Girar estoque',
    'Ganhar visibilidade',
    'Promover colecao',
    'Recuperar vendas',
    '__custom__',
];

const getTenantId = () => {
    if (typeof window !== 'undefined') {
        const keys = ['tenantId', 'tenant_id', 'marketplaceTenantId', 'storeTenantId'];
        for (const key of keys) {
            const value = window.localStorage.getItem(key);
            if (value) return value;
        }
    }

    const envTenantId = (import.meta as any).env?.VITE_TENANT_ID || (import.meta as any).env?.VITE_MARKETPLACE_TENANT_ID;
    return envTenantId || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
};

const getRequesterProfile = () => {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('rs-consultant-full-profile') || localStorage.getItem('rs-consultant-profile');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return {
            requesterName: parsed?.name || parsed?.full_name || parsed?.nome_completo || '',
            requesterEmail: parsed?.email || parsed?.userEmail || '',
            requesterCpf: parsed?.cpf || parsed?.cpfCnpj || parsed?.cpf_cnpj || '',
            requesterPhone: parsed?.phone || parsed?.telefone || parsed?.whatsapp || '',
        };
    } catch {
        return {};
    }
};

const createDraft = (): PromotionDraft => ({
    productId: '',
    packageId: '',
    query: '',
    collectionId: '',
    category: '',
    subcategory: '',
    objectivePreset: 'Impulsionar vendas',
    objectiveCustom: '',
    notes: '',
});

const formatCurrency = (value?: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
}).format(Number(value || 0));

const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString('pt-BR');
};

const formatCtr = (impressions = 0, clicks = 0) => {
    if (!impressions) return '0,00%';
    return `${((clicks / impressions) * 100).toFixed(2).replace('.', ',')}%`;
};

const extractRequestResponse = (response: any): SponsoredRequest | null => {
    return (response?.data?.data || response?.data || null) as SponsoredRequest | null;
};

const ManagePromotionBoost: React.FC<ManagePromotionBoostProps> = ({ products, collections, requests, onSave }) => {
    const [settings, setSettings] = useState<SponsoredSettings>({ placements: [], packages: [] });
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [draft, setDraft] = useState<PromotionDraft>(createDraft());
    const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoadingSettings(true);
                const response = await adminSettingsAPI.getSponsoredSettings();
                const nextSettings = (response?.data?.data || response?.data || { placements: [], packages: [] }) as SponsoredSettings;
                setSettings(nextSettings);
            } catch (error: any) {
                setFeedback({ type: 'error', message: error?.message || 'Nao foi possivel carregar os pacotes de impulsionamento.' });
            } finally {
                setLoadingSettings(false);
            }
        };

        loadSettings();
    }, []);

    const collectionMap = useMemo(
        () => new Map(collections.map((collection) => [String(collection.id), collection])),
        [collections]
    );

    const collectionOptions = useMemo(
        () => [...collections].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
        [collections]
    );

    const categoryOptions = useMemo(
        () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
        [products]
    );

    const subcategoryOptions = useMemo(
        () => Array.from(new Set(
            products
                .filter((product) => !draft.category || product.category === draft.category)
                .map((product) => product.subcategory)
                .filter(Boolean)
        )).sort(),
        [products, draft.category]
    );

    const filteredProducts = useMemo(() => {
        const normalizedQuery = draft.query.trim().toLowerCase();

        return products.filter((product) => {
            const productCollectionIds = [
                ...(product.collectionId ? [String(product.collectionId)] : []),
                ...((product.collectionIds || []).map(String))
            ];
            const productCollectionNames = productCollectionIds
                .map((collectionId) => collectionMap.get(collectionId)?.title || '')
                .filter(Boolean);

            const matchesQuery =
                !normalizedQuery ||
                [
                    product.name,
                    product.sku,
                    ...productCollectionNames,
                    product.category,
                    product.subcategory,
                    product.supplier,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));

            const matchesCollection = !draft.collectionId || productCollectionIds.includes(String(draft.collectionId));
            const matchesCategory = !draft.category || product.category === draft.category;
            const matchesSubcategory = !draft.subcategory || product.subcategory === draft.subcategory;

            return matchesQuery && matchesCollection && matchesCategory && matchesSubcategory;
        });
    }, [products, draft, collectionMap]);

    const selectedProduct = products.find((product) => String(product.id) === String(draft.productId));
    const selectedPackage = settings.packages.find((pkg) => pkg.id === draft.packageId && pkg.active);
    const resolvedObjective = draft.objectivePreset === '__custom__'
        ? draft.objectiveCustom.trim()
        : draft.objectivePreset;
    const reportSummary = useMemo(() => {
        return requests.reduce((acc, request) => {
            acc.impressions += Number(request.metrics?.impressions || 0);
            acc.clicks += Number(request.metrics?.clicks || 0);
            return acc;
        }, { impressions: 0, clicks: 0 });
    }, [requests]);

    const resetDraft = () => {
        setDraft(createDraft());
        setEditingRequestId(null);
    };

    const persistRequests = async (nextRequests: StoreCustomization['promotionRequests']) => {
        await Promise.resolve(onSave(nextRequests));
    };

    const replaceRequest = async (updatedRequest: SponsoredRequest) => {
        const nextRequests = requests.map((item) => item.id === updatedRequest.id ? { ...item, ...updatedRequest } : item);
        await persistRequests(nextRequests);
    };

    const handleSaveRequest = async (options?: { generatePix?: boolean }) => {
        if (!selectedProduct || !selectedPackage) {
            setFeedback({ type: 'error', message: 'Selecione um produto e um pacote valido para salvar a solicitacao.' });
            return;
        }

        if (!resolvedObjective) {
            setFeedback({ type: 'error', message: 'Defina o objetivo da campanha antes de salvar.' });
            return;
        }

        const tenantId = getTenantId();
        const requester = getRequesterProfile() as any;
        const now = new Date();
        const existingRequest = editingRequestId ? requests.find((item) => item.id === editingRequestId) : null;
        const nextCampaignEnd = new Date(now.getTime() + Math.max(1, Number(selectedPackage.durationDays || 1)) * 24 * 60 * 60 * 1000);
        const requestChanged = !existingRequest || existingRequest.productId !== String(selectedProduct.id) || existingRequest.packageId !== selectedPackage.id;

        const nextRequest: SponsoredRequest = {
            id: editingRequestId || `promotion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            tenantId,
            productId: String(selectedProduct.id),
            productName: selectedProduct.name,
            productImage: selectedProduct.featured_image || selectedProduct.images?.[0],
            productSku: selectedProduct.sku,
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            packagePrice: Number(selectedPackage.price || 0),
            durationDays: Number(selectedPackage.durationDays || 0),
            placementIds: selectedPackage.placementIds || [],
            requesterName: requester.requesterName,
            requesterEmail: requester.requesterEmail,
            objective: resolvedObjective,
            notes: draft.notes.trim(),
            status: existingRequest?.status === 'aprovado' && !requestChanged ? 'aprovado' : 'pendente',
            campaignStartAt: existingRequest?.campaignStartAt || now.toISOString(),
            campaignEndAt: existingRequest?.campaignEndAt || nextCampaignEnd.toISOString(),
            paymentMethod: requestChanged ? undefined : existingRequest?.paymentMethod,
            paymentStatus: requestChanged ? 'nao_gerado' : (existingRequest?.paymentStatus || 'nao_gerado'),
            paymentAmount: Number(selectedPackage.price || 0),
            paymentId: requestChanged ? undefined : existingRequest?.paymentId,
            paymentQrCode: requestChanged ? undefined : existingRequest?.paymentQrCode,
            paymentQrCodeBase64: requestChanged ? undefined : existingRequest?.paymentQrCodeBase64,
            paymentTicketUrl: requestChanged ? undefined : existingRequest?.paymentTicketUrl,
            paymentGeneratedAt: requestChanged ? undefined : existingRequest?.paymentGeneratedAt,
            paidAt: requestChanged ? undefined : existingRequest?.paidAt,
            requestedAt: existingRequest?.requestedAt || now.toISOString(),
            updatedAt: now.toISOString(),
            adminNotes: existingRequest?.adminNotes,
        };

        const nextRequests = editingRequestId
            ? requests.map((item) => item.id === editingRequestId ? nextRequest : item)
            : [nextRequest, ...requests];

        try {
            setSaving(true);
            setFeedback(null);
            await persistRequests(nextRequests);
            if (options?.generatePix) {
                const response = await adminSettingsAPI.createSponsoredRequestPayment(nextRequest.id, {
                    tenantId: nextRequest.tenantId,
                    method: 'pix',
                    buyer: {
                        name: requester.requesterName || nextRequest.requesterName,
                        email: requester.requesterEmail || nextRequest.requesterEmail,
                        cpf: requester.requesterCpf,
                        phone: requester.requesterPhone,
                    }
                });

                const updatedRequest = extractRequestResponse(response);
                if (!updatedRequest) throw new Error('Resposta de pagamento invalida');

                const requestsWithPayment = nextRequests.map((item) => item.id === updatedRequest.id ? { ...item, ...updatedRequest } : item);
                await persistRequests(requestsWithPayment);
                setFeedback({ type: 'success', message: 'Solicitacao salva e PIX gerado.' });
            } else {
                setFeedback({ type: 'success', message: editingRequestId ? 'Solicitacao atualizada.' : 'Solicitacao enviada para aprovacao do admin.' });
            }
            resetDraft();
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.message || 'Nao foi possivel salvar a solicitacao de impulsionamento.' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditRequest = (request: SponsoredRequest) => {
        setEditingRequestId(request.id);
        setDraft({
            productId: request.productId,
            packageId: request.packageId,
            query: '',
            collectionId: '',
            category: '',
            subcategory: '',
            objectivePreset: request.objective && OBJECTIVE_PRESETS.includes(request.objective) ? request.objective : '__custom__',
            objectiveCustom: request.objective && !OBJECTIVE_PRESETS.includes(request.objective) ? request.objective : '',
            notes: request.notes || '',
        });
    };

    const handleRemoveRequest = async (requestId: string) => {
        const nextRequests = requests.filter((item) => item.id !== requestId);

        try {
            setSaving(true);
            setFeedback(null);
            await persistRequests(nextRequests);
            setFeedback({ type: 'success', message: 'Solicitacao removida da fila.' });
            if (editingRequestId === requestId) {
                resetDraft();
            }
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.message || 'Nao foi possivel remover a solicitacao.' });
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePayment = async (request: SponsoredRequest, method: 'pix' | 'boleto') => {
        try {
            setSaving(true);
            setFeedback(null);
            const requester = getRequesterProfile() as any;
            const response = await adminSettingsAPI.createSponsoredRequestPayment(request.id, {
                tenantId: request.tenantId,
                method,
                buyer: {
                    name: requester.requesterName || request.requesterName,
                    email: requester.requesterEmail || request.requesterEmail,
                    cpf: requester.requesterCpf,
                    phone: requester.requesterPhone,
                }
            });

            const updatedRequest = extractRequestResponse(response);
            if (!updatedRequest) throw new Error('Resposta de pagamento invalida');

            await replaceRequest(updatedRequest);
            setFeedback({ type: 'success', message: `Cobranca ${method.toUpperCase()} gerada com sucesso.` });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.message || 'Nao foi possivel gerar a cobranca.' });
        } finally {
            setSaving(false);
        }
    };

    const handleRefreshPaymentStatus = async (request: SponsoredRequest) => {
        try {
            setSaving(true);
            setFeedback(null);
            const response = await adminSettingsAPI.syncSponsoredRequestPaymentStatus(request.id, request.tenantId);
            const updatedRequest = extractRequestResponse(response);
            if (!updatedRequest) throw new Error('Resposta de pagamento invalida');

            await replaceRequest(updatedRequest);
            setFeedback({ type: 'success', message: 'Status do pagamento atualizado.' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.message || 'Nao foi possivel atualizar o pagamento.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCopyPixCode = async (code?: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setFeedback({ type: 'success', message: 'Codigo PIX copiado.' });
        } catch {
            setFeedback({ type: 'error', message: 'Nao foi possivel copiar o codigo PIX.' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6 flex items-center justify-between border-b border-dark-800 pb-6">
                <div>
                    <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                        <MegaphoneIcon className="h-6 w-6 text-[rgb(var(--color-brand-gold))]" />
                        Pacotes de Impulsionamento
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Escolha o produto, o pacote e envie a solicitacao para o rs-admin aprovar o destaque premium.
                    </p>
                </div>
                {saving && (
                    <div className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-brand-gold))]">
                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                        Salvando...
                    </div>
                )}
            </div>

            {feedback && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                    {feedback.message}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <section className="rounded-lg border border-dark-800 bg-black p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Nova solicitacao</h3>
                            <p className="text-sm text-gray-400">Monte o pedido de impulsionamento e envie para aprovacao.</p>
                        </div>
                        {editingRequestId && (
                            <button onClick={resetDraft} className="rounded-md bg-dark-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600">
                                Nova solicitacao
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-5">
                        <input
                            value={draft.query}
                            onChange={(event) => setDraft((prev) => ({ ...prev, query: event.target.value }))}
                            placeholder="Buscar por nome, SKU, colecao, categoria..."
                            className="rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white lg:col-span-2"
                        />
                        <select
                            value={draft.collectionId}
                            onChange={(event) => setDraft((prev) => ({ ...prev, collectionId: event.target.value }))}
                            className="rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                        >
                            <option value="">Todas as colecoes</option>
                            {collectionOptions.map((collection) => (
                                <option key={collection.id} value={collection.id}>{collection.title}</option>
                            ))}
                        </select>
                        <select
                            value={draft.category}
                            onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value, subcategory: '' }))}
                            className="rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                        >
                            <option value="">Todas as categorias</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            value={draft.subcategory}
                            onChange={(event) => setDraft((prev) => ({ ...prev, subcategory: event.target.value }))}
                            className="rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                        >
                            <option value="">Todas as subcategorias</option>
                            {subcategoryOptions.map((subcategory) => (
                                <option key={subcategory} value={subcategory}>{subcategory}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-2">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => setDraft((prev) => ({ ...prev, productId: String(product.id) }))}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${String(draft.productId) === String(product.id) ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/10' : 'border-dark-700 bg-dark-800 hover:border-[rgb(var(--color-brand-gold))]/40'}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                        <p className="truncate text-xs text-gray-500">
                                            {product.category || 'Sem categoria'}{product.subcategory ? ` - ${product.subcategory}` : ''}{product.sku ? ` - SKU ${product.sku}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-[rgb(var(--color-brand-gold))]">
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Pacote premium</label>
                            <select
                                value={draft.packageId}
                                onChange={(event) => setDraft((prev) => ({ ...prev, packageId: event.target.value }))}
                                className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                disabled={loadingSettings}
                            >
                                <option value="">Selecione o pacote</option>
                                {settings.packages.filter((pkg) => pkg.active).map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.name} - {formatCurrency(pkg.price)} - {pkg.durationDays} dias
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Objetivo da campanha</label>
                            <select
                                value={draft.objectivePreset}
                                onChange={(event) => setDraft((prev) => ({ ...prev, objectivePreset: event.target.value }))}
                                className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                            >
                                {OBJECTIVE_PRESETS.map((objective) => (
                                    <option key={objective} value={objective}>
                                        {objective === '__custom__' ? 'Outro objetivo' : objective}
                                    </option>
                                ))}
                            </select>
                            {draft.objectivePreset === '__custom__' && (
                                <input
                                    value={draft.objectiveCustom}
                                    onChange={(event) => setDraft((prev) => ({ ...prev, objectiveCustom: event.target.value }))}
                                    placeholder="Digite o objetivo da campanha"
                                    className="mt-3 w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                                />
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Observacoes</label>
                            <textarea
                                value={draft.notes}
                                onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                                rows={4}
                                placeholder="Descreva o contexto, a verba ja comprada ou qualquer prioridade comercial."
                                className="w-full rounded-md border-2 border-dark-700 bg-dark-800 px-3 py-2 text-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={resetDraft}
                                disabled={saving}
                                className="rounded-md bg-dark-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={handleSaveRequest}
                                disabled={saving || !selectedProduct || !selectedPackage}
                                className="rounded-md bg-[rgb(var(--color-brand-gold))] px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {editingRequestId ? 'Atualizar solicitacao' : 'Enviar solicitacao'}
                            </button>
                            <button
                                onClick={() => handleSaveRequest({ generatePix: true })}
                                disabled={saving || !selectedProduct || !selectedPackage}
                                className="rounded-md border border-[rgb(var(--color-brand-gold))]/40 px-4 py-2 text-sm font-bold text-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-brand-gold))]/10 disabled:opacity-50"
                            >
                                Salvar e gerar PIX
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-lg border border-dark-800 bg-black p-6">
                        <h3 className="text-lg font-semibold text-white">Resumo do pacote</h3>
                        {selectedPackage ? (
                            <div className="mt-4 space-y-3">
                                <div className="rounded-lg border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-gold))]/5 p-4">
                                    <p className="text-base font-semibold text-white">{selectedPackage.name}</p>
                                    <p className="mt-1 text-sm text-gray-400">{selectedPackage.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Valor</p>
                                        <p className="mt-1 text-lg font-bold text-[rgb(var(--color-brand-gold))]">
                                            {formatCurrency(selectedPackage.price)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Duracao</p>
                                        <p className="mt-1 text-lg font-bold text-white">{selectedPackage.durationDays} dias</p>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Placements</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedPackage.placementIds.map((placementId) => {
                                            const placement = settings.placements.find((item) => item.id === placementId);
                                            return (
                                                <span key={placementId} className="rounded-full border border-dark-700 px-3 py-1 text-xs text-gray-200">
                                                    {placement?.label || placementId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-lg border border-dashed border-dark-700 px-4 py-6 text-sm text-gray-500">
                                Selecione um pacote para ver os placements e o valor que sera solicitado.
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-dark-800 bg-black p-6">
                        <h3 className="text-lg font-semibold text-white">Solicitacoes enviadas</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Impressoes</p>
                                <p className="mt-1 text-xl font-bold text-white">{reportSummary.impressions}</p>
                            </div>
                            <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Cliques</p>
                                <p className="mt-1 text-xl font-bold text-white">{reportSummary.clicks}</p>
                            </div>
                            <div className="rounded-lg border border-dark-700 bg-dark-800 p-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">CTR medio</p>
                                <p className="mt-1 text-xl font-bold text-white">{formatCtr(reportSummary.impressions, reportSummary.clicks)}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {requests.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-dark-700 px-4 py-6 text-sm text-gray-500">
                                    Nenhuma solicitacao enviada ainda.
                                </div>
                            ) : requests.map((request) => (
                                <div key={request.id} className="rounded-lg border border-dark-700 bg-dark-800 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">{request.productName}</p>
                                            <p className="text-xs text-gray-400">{request.packageName} - {request.durationDays} dias</p>
                                            <p className="text-xs text-gray-500">Atualizado em {formatDateTime(request.updatedAt)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusClasses[request.status] || statusClasses.rascunho}`}>
                                                {request.status}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${paymentStatusClasses[request.paymentStatus || 'nao_gerado'] || paymentStatusClasses.nao_gerado}`}>
                                                pagamento {request.paymentStatus || 'nao_gerado'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-3 text-sm text-gray-300 md:grid-cols-2">
                                        <p>Objetivo: {request.objective || '-'}</p>
                                        <p>Valor do pacote: {formatCurrency(request.paymentAmount || request.packagePrice)}</p>
                                        <p>Inicio da campanha: {formatDateTime(request.campaignStartAt)}</p>
                                        <p>Fim da campanha: {formatDateTime(request.campaignEndAt)}</p>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-lg border border-dark-700 bg-black/30 px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Impressoes</p>
                                            <p className="mt-1 text-lg font-bold text-white">{Number(request.metrics?.impressions || 0)}</p>
                                        </div>
                                        <div className="rounded-lg border border-dark-700 bg-black/30 px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Cliques</p>
                                            <p className="mt-1 text-lg font-bold text-white">{Number(request.metrics?.clicks || 0)}</p>
                                        </div>
                                        <div className="rounded-lg border border-dark-700 bg-black/30 px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">CTR</p>
                                            <p className="mt-1 text-lg font-bold text-white">{formatCtr(Number(request.metrics?.impressions || 0), Number(request.metrics?.clicks || 0))}</p>
                                        </div>
                                    </div>

                                    {request.metrics?.byPlacement && Object.keys(request.metrics.byPlacement).length > 0 && (
                                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                                            {Object.entries(request.metrics.byPlacement).map(([placementId, placementMetrics]) => (
                                                <div key={placementId} className="rounded-lg border border-dark-700 bg-black/20 px-3 py-3 text-sm text-gray-300">
                                                    <p className="font-semibold text-white">{placementId}</p>
                                                    <p className="mt-1">Impressoes: {Number(placementMetrics.impressions || 0)}</p>
                                                    <p>Cliques: {Number(placementMetrics.clicks || 0)}</p>
                                                    <p>CTR: {formatCtr(Number(placementMetrics.impressions || 0), Number(placementMetrics.clicks || 0))}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {request.notes && <p className="mt-2 text-sm text-gray-400">{request.notes}</p>}
                                    {request.adminNotes && <p className="mt-2 text-sm text-red-300">Admin: {request.adminNotes}</p>}

                                    {request.paymentQrCodeBase64 && (
                                        <div className="mt-4 rounded-lg border border-dark-700 bg-black/40 p-4">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                <img
                                                    src={`data:image/png;base64,${request.paymentQrCodeBase64}`}
                                                    alt="QR Code PIX"
                                                    className="h-32 w-32 rounded-lg bg-white p-2 object-contain"
                                                />
                                                <div className="min-w-0 flex-1 space-y-3">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">PIX copia e cola</p>
                                                    <textarea
                                                        readOnly
                                                        value={request.paymentQrCode || ''}
                                                        rows={3}
                                                        className="w-full rounded-lg border border-dark-700 bg-dark-900 px-3 py-2 text-xs text-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => handleCopyPixCode(request.paymentQrCode)}
                                                        className="rounded-md border border-[rgb(var(--color-brand-gold))]/30 px-3 py-2 text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-brand-gold))]/10"
                                                    >
                                                        Copiar codigo PIX
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {request.paymentTicketUrl && (
                                        <div className="mt-4 rounded-lg border border-dark-700 bg-black/40 p-4">
                                            <p className="text-sm text-gray-300">Boleto gerado para esta solicitacao.</p>
                                            <a
                                                href={request.paymentTicketUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex rounded-md border border-[rgb(var(--color-brand-gold))]/30 px-3 py-2 text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-brand-gold))]/10"
                                            >
                                                Abrir boleto
                                            </a>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button onClick={() => handleEditRequest(request)} className="rounded-md border border-[rgb(var(--color-brand-gold))]/30 px-3 py-2 text-xs font-semibold text-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-brand-gold))]/10">
                                            Editar
                                        </button>
                                        <button onClick={() => handleRemoveRequest(request.id)} className="rounded-md border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10">
                                            Remover
                                        </button>
                                        <button
                                            onClick={() => handleGeneratePayment(request, 'pix')}
                                            disabled={saving || request.paymentStatus === 'pago'}
                                            className="rounded-md border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/10 disabled:opacity-50"
                                        >
                                            Gerar PIX
                                        </button>
                                        <button
                                            onClick={() => handleGeneratePayment(request, 'boleto')}
                                            disabled={saving || request.paymentStatus === 'pago'}
                                            className="rounded-md border border-purple-500/30 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
                                        >
                                            Gerar boleto
                                        </button>
                                        <button
                                            onClick={() => handleRefreshPaymentStatus(request)}
                                            disabled={saving || !request.paymentId}
                                            className="rounded-md border border-green-500/30 px-3 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/10 disabled:opacity-50"
                                        >
                                            Atualizar pagamento
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManagePromotionBoost;
