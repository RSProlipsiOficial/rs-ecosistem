import { Router, Request, Response } from 'express';
import { supabaseAuth, requireRole, ROLES } from '../middlewares/supabaseAuth';
import { getSigmaConfig, updateSigmaSettings, SigmaConfig } from '../services/sigmaConfigService';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';

import { supabaseAdmin } from '../lib/supabaseClient';

const router = Router();

// Helper to get app_config from Supabase (Bypass RLS)
const getAppConfig = async (key: string) => {
    try {
        const { data, error } = await supabaseAdmin.from('app_configs').select('value').eq('key', key).maybeSingle();
        if (error) {
            console.error(`[AdminConfig] Error fetching ${key}:`, error.message);
            return null;
        }
        return data?.value;
    } catch (e) {
        console.error(`[AdminConfig] Exception fetching ${key}:`, e);
        return null;
    }
};

// Helper to update app_config in Supabase (Bypass RLS)
const updateAppConfig = async (key: string, value: any) => {
    try {
        console.log(`[AdminConfig] Updating ${key}...`);
        const { data: existing, error: fetchError } = await supabaseAdmin.from('app_configs').select('key').eq('key', key).maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            const { error: updateError } = await supabaseAdmin.from('app_configs').update({
                value,
                updated_at: new Date().toISOString()
            }).eq('key', key);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabaseAdmin.from('app_configs').insert([{ key, value }]);
            if (insertError) throw insertError;
        }
        console.log(`[AdminConfig] ${key} updated successfully.`);
        return true;
    } catch (e: any) {
        console.error(`[AdminConfig] CRITICAL ERROR updating ${key}:`, e.message);
        return false;
	}
};

const DEFAULT_SPONSORED_SETTINGS = {
    placements: [
        {
            id: 'product_detail_related',
            label: 'Detalhe do Produto',
            description: 'Bloco patrocinado dentro da pagina de detalhe do produto.',
            active: true
        },
        {
            id: 'home_featured_strip',
            label: 'Home - Faixa Premium',
            description: 'Vitrine premium na pagina inicial do marketplace.',
            active: true
        },
        {
            id: 'collection_spotlight',
            label: 'Colecoes',
            description: 'Destaque premium dentro das paginas de colecao.',
            active: true
        }
    ],
    packages: [
        {
            id: 'premium-7d',
            name: 'Premium 7 dias',
            description: 'Destaque interno por 7 dias em um placement premium.',
            price: 79,
            durationDays: 7,
            placementIds: ['product_detail_related'],
            maxProducts: 1,
            label: 'Patrocinado',
            priority: 10,
            active: true
        },
        {
            id: 'premium-15d',
            name: 'Premium 15 dias',
            description: 'Destaque interno por 15 dias com prioridade maior.',
            price: 150,
            durationDays: 15,
            placementIds: ['product_detail_related', 'collection_spotlight'],
            maxProducts: 1,
            label: 'Premium',
            priority: 7,
            active: true
        },
        {
            id: 'premium-30d',
            name: 'Premium 30 dias',
            description: 'Destaque interno por 30 dias com maior alcance no marketplace.',
            price: 250,
            durationDays: 30,
            placementIds: ['product_detail_related', 'home_featured_strip', 'collection_spotlight'],
            maxProducts: 2,
            label: 'Produto Premium',
            priority: 5,
            active: true
        }
    ],
    autoApprovePaidRequests: false,
    rotationEnabled: true,
    rotationWindowMinutes: 60,
    maxVisibleProductsPerPlacement: 8
};

const normalizeSponsoredSettings = (value: any = {}) => ({
    placements: Array.isArray(value?.placements) && value.placements.length > 0
        ? value.placements
        : DEFAULT_SPONSORED_SETTINGS.placements,
    packages: Array.isArray(value?.packages) && value.packages.length > 0
        ? value.packages
        : DEFAULT_SPONSORED_SETTINGS.packages,
    autoApprovePaidRequests: typeof value?.autoApprovePaidRequests === 'boolean'
        ? value.autoApprovePaidRequests
        : DEFAULT_SPONSORED_SETTINGS.autoApprovePaidRequests,
    rotationEnabled: typeof value?.rotationEnabled === 'boolean'
        ? value.rotationEnabled
        : DEFAULT_SPONSORED_SETTINGS.rotationEnabled,
    rotationWindowMinutes: Math.max(5, Number(value?.rotationWindowMinutes ?? DEFAULT_SPONSORED_SETTINGS.rotationWindowMinutes) || DEFAULT_SPONSORED_SETTINGS.rotationWindowMinutes),
    maxVisibleProductsPerPlacement: Math.max(1, Number(value?.maxVisibleProductsPerPlacement ?? DEFAULT_SPONSORED_SETTINGS.maxVisibleProductsPerPlacement) || DEFAULT_SPONSORED_SETTINGS.maxVisibleProductsPerPlacement),
});

const getSponsoredSettingsConfig = async () => normalizeSponsoredSettings(
    await getAppConfig('marketplace_sponsored_settings') || {}
);

const resolveSponsoredCampaignWindow = (request: any) => {
    const requestedStart = request?.campaignStartAt ? new Date(request.campaignStartAt) : new Date();
    const safeStart = Number.isNaN(requestedStart.getTime()) ? new Date() : requestedStart;
    const durationDays = Math.max(1, Number(request?.durationDays || 0) || 1);
    const requestedEnd = request?.campaignEndAt ? new Date(request.campaignEndAt) : null;

    const safeEnd = requestedEnd && !Number.isNaN(requestedEnd.getTime())
        ? requestedEnd
        : new Date(safeStart.getTime() + durationDays * 24 * 60 * 60 * 1000);

    return {
        campaignStartAt: safeStart.toISOString(),
        campaignEndAt: safeEnd.toISOString(),
    };
};

const mapMercadoPagoStatus = (status?: string) => {
    const normalized = String(status || '').toLowerCase();
    if (['approved', 'authorized'].includes(normalized)) return 'pago';
    if (['cancelled', 'cancelled_by_user'].includes(normalized)) return 'cancelado';
    if (['rejected', 'refunded', 'charged_back'].includes(normalized)) return 'falhou';
    return 'pendente';
};

const buildPayerData = (request: any, body: any) => {
    const payerName = String(body?.buyer?.name || request?.requesterName || 'Cliente RS Prolipsi').trim();
    const nameParts = payerName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Marketplace';
    const cpf = String(body?.buyer?.cpf || '').replace(/\D/g, '');

    return {
        payerName,
        payer: {
            email: String(body?.buyer?.email || request?.requesterEmail || 'financeiro@rsprolipsi.com'),
            first_name: firstName,
            last_name: lastName,
            identification: cpf
                ? {
                    type: 'CPF',
                    number: cpf,
                }
                : undefined,
        }
    };
};

const resolveSponsoredWebhookUrl = () => {
    if (process.env.MP_SPONSORED_WEBHOOK_URL) {
        return process.env.MP_SPONSORED_WEBHOOK_URL;
    }

    if (process.env.API_BASE_URL) {
        return `${process.env.API_BASE_URL.replace(/\/$/, '')}/v1/public/marketplace/sponsored-requests/payment-webhook/mercadopago`;
    }

    if (process.env.MP_WEBHOOK_URL) {
        try {
            const parsed = new URL(process.env.MP_WEBHOOK_URL);
            return `${parsed.origin}/v1/public/marketplace/sponsored-requests/payment-webhook/mercadopago`;
        } catch {
            return undefined;
        }
    }

    return undefined;
};

const getSponsoredRequestContextByTenant = async (tenantId: string) => {
    const { data: customization, error: customizationError } = await supabaseAdmin
        .from('store_customizations')
        .select('tenant_id, footer')
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (customizationError) throw customizationError;

    const footer = customization?.footer || {};
    const customSettings = footer?.customSettings || {};
    const requests = Array.isArray(customSettings?.promotionRequests) ? customSettings.promotionRequests : [];

    return {
        customization,
        footer,
        customSettings,
        requests,
    };
};

const saveSponsoredRequestsForTenant = async (tenantId: string, footer: any, customSettings: any, requests: any[], updatedAt = new Date().toISOString()) => {
    const footerPayload = {
        ...footer,
        customSettings: {
            ...customSettings,
            promotionRequests: requests,
        }
    };

    const { error: saveError } = await supabaseAdmin
        .from('store_customizations')
        .upsert({
            tenant_id: tenantId,
            footer: footerPayload,
            updated_at: updatedAt,
        }, { onConflict: 'tenant_id' });

    if (saveError) throw saveError;

    return footerPayload;
};

const activateSponsoredProductForRequest = async (tenantId: string, request: any, options?: { priority?: number; label?: string; placementIds?: string[] }) => {
    if (!request?.productId) return;

    const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, tenant_id, specifications')
        .eq('id', request.productId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (productError) throw productError;
    if (!product) return;

    const specifications = product.specifications || {};
    const merchandising = specifications.merchandising || {};
    const existingSponsored = merchandising.sponsored || {};

    const nextMerchandising = {
        comboProductIds: Array.isArray(merchandising.comboProductIds) ? merchandising.comboProductIds : [],
        relatedProductIds: Array.isArray(merchandising.relatedProductIds) ? merchandising.relatedProductIds : [],
        sponsored: {
            enabled: true,
            priority: Number(options?.priority ?? request?.priority ?? existingSponsored.priority ?? 10),
            label: String(options?.label || request?.packageName || existingSponsored.label || 'Patrocinado'),
            placements: Array.isArray(options?.placementIds) && options?.placementIds.length > 0
                ? options.placementIds
                : (Array.isArray(request?.placementIds) && request.placementIds.length > 0
                    ? request.placementIds
                    : (Array.isArray(existingSponsored.placements) && existingSponsored.placements.length > 0
                        ? existingSponsored.placements
                        : ['product_detail_related'])),
            startsAt: request?.campaignStartAt || existingSponsored.startsAt,
            endsAt: request?.campaignEndAt || existingSponsored.endsAt,
        }
    };

    const { error: updateProductError } = await supabaseAdmin
        .from('products')
        .update({
            specifications: {
                ...specifications,
                merchandising: nextMerchandising
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', request.productId)
        .eq('tenant_id', tenantId);

    if (updateProductError) throw updateProductError;
};

const finalizeSponsoredRequest = async (
    tenantId: string,
    requestId: string,
    footer: any,
    customSettings: any,
    requests: any[],
    nextRequest: any,
    options?: { priority?: number; label?: string; placementIds?: string[] }
) => {
    const sponsoredSettings = await getSponsoredSettingsConfig();
    const relatedPackage = Array.isArray(sponsoredSettings.packages)
        ? sponsoredSettings.packages.find((pkg: any) => pkg?.id === nextRequest?.packageId)
        : null;

    let finalRequest = {
        ...nextRequest,
        updatedAt: nextRequest?.updatedAt || new Date().toISOString(),
    };

    if (
        finalRequest.paymentStatus === 'pago' &&
        sponsoredSettings.autoApprovePaidRequests &&
        finalRequest.status !== 'rejeitado'
    ) {
        const campaignWindow = resolveSponsoredCampaignWindow(finalRequest);
        finalRequest = {
            ...finalRequest,
            status: 'aprovado',
            campaignStartAt: campaignWindow.campaignStartAt,
            campaignEndAt: campaignWindow.campaignEndAt,
            adminNotes: finalRequest.adminNotes || 'Aprovado automaticamente apos confirmacao de pagamento.',
            updatedAt: new Date().toISOString(),
        };
    }

    const nextRequests = requests.map((item: any) =>
        String(item?.id) === String(requestId) ? finalRequest : item
    );

    await saveSponsoredRequestsForTenant(tenantId, footer, customSettings, nextRequests, finalRequest.updatedAt || new Date().toISOString());

    if (String(finalRequest.status) === 'aprovado') {
        await activateSponsoredProductForRequest(tenantId, finalRequest, {
            priority: Number(options?.priority ?? relatedPackage?.priority ?? finalRequest?.priority ?? 10),
            label: String(options?.label || relatedPackage?.label || finalRequest?.packageName || 'Patrocinado'),
            placementIds: Array.isArray(options?.placementIds) && options?.placementIds.length > 0
                ? options.placementIds
                : (Array.isArray(relatedPackage?.placementIds) && relatedPackage.placementIds.length > 0
                    ? relatedPackage.placementIds
                    : finalRequest?.placementIds),
        });
    }

    return finalRequest;
};

const parseSponsoredExternalReference = (value?: string) => {
    const reference = String(value || '').trim();
    if (!reference) return null;

    if (reference.startsWith('promotion:')) {
        const [, tenantId, requestId] = reference.split(':');
        if (tenantId && requestId) {
            return { tenantId, requestId };
        }
    }

    if (reference.startsWith('promotion-')) {
        return { requestId: reference.replace(/^promotion-/, '') };
    }

    return null;
};

const findSponsoredRequestContext = async (params: { tenantId?: string; requestId?: string; paymentId?: string }) => {
    const resolveFromRows = (rows: any[]) => {
        for (const row of rows || []) {
            const footer = row?.footer || {};
            const customSettings = footer?.customSettings || {};
            const requests = Array.isArray(customSettings?.promotionRequests) ? customSettings.promotionRequests : [];
            const currentRequest = requests.find((item: any) =>
                (params.requestId && String(item?.id) === String(params.requestId)) ||
                (params.paymentId && String(item?.paymentId) === String(params.paymentId))
            );

            if (currentRequest) {
                return {
                    tenantId: String(row?.tenant_id || params.tenantId || ''),
                    footer,
                    customSettings,
                    requests,
                    currentRequest,
                };
            }
        }

        return null;
    };

    if (params.tenantId) {
        const context = await getSponsoredRequestContextByTenant(params.tenantId);
        const currentRequest = context.requests.find((item: any) =>
            (params.requestId && String(item?.id) === String(params.requestId)) ||
            (params.paymentId && String(item?.paymentId) === String(params.paymentId))
        );

        if (currentRequest) {
            return {
                tenantId: params.tenantId,
                ...context,
                currentRequest,
            };
        }
    }

    const { data, error } = await supabaseAdmin
        .from('store_customizations')
        .select('tenant_id, footer');

    if (error) throw error;

    return resolveFromRows(data || []);
};

const isSponsoredRequestActiveForPlacement = (request: any, placementId: string, now = new Date()) => {
    if (String(request?.status) !== 'aprovado') return false;
    if (!Array.isArray(request?.placementIds) || !request.placementIds.includes(placementId)) return false;

    const startsAt = request?.campaignStartAt ? new Date(request.campaignStartAt) : null;
    const endsAt = request?.campaignEndAt ? new Date(request.campaignEndAt) : null;

    if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt > now) return false;
    if (endsAt && !Number.isNaN(endsAt.getTime()) && endsAt < now) return false;

    return true;
};

const incrementSponsoredRequestMetrics = (request: any, placementId: string, type: 'impression' | 'click') => {
    const now = new Date().toISOString();
    const dateKey = now.slice(0, 10);
    const currentMetrics = request?.metrics || {};
    const currentPlacementMetrics = currentMetrics?.byPlacement?.[placementId] || {};
    const currentDailyMetrics = currentMetrics?.daily?.[dateKey] || {};
    const currentDailyPlacementMetrics = currentDailyMetrics?.byPlacement?.[placementId] || {};

    const nextPlacementMetrics = {
        impressions: Number(currentPlacementMetrics.impressions || 0) + (type === 'impression' ? 1 : 0),
        clicks: Number(currentPlacementMetrics.clicks || 0) + (type === 'click' ? 1 : 0),
        lastImpressionAt: type === 'impression' ? now : currentPlacementMetrics.lastImpressionAt,
        lastClickAt: type === 'click' ? now : currentPlacementMetrics.lastClickAt,
    };

    const nextDailyPlacementMetrics = {
        impressions: Number(currentDailyPlacementMetrics.impressions || 0) + (type === 'impression' ? 1 : 0),
        clicks: Number(currentDailyPlacementMetrics.clicks || 0) + (type === 'click' ? 1 : 0),
        lastImpressionAt: type === 'impression' ? now : currentDailyPlacementMetrics.lastImpressionAt,
        lastClickAt: type === 'click' ? now : currentDailyPlacementMetrics.lastClickAt,
    };

    const nextDailyMetrics = {
        impressions: Number(currentDailyMetrics.impressions || 0) + (type === 'impression' ? 1 : 0),
        clicks: Number(currentDailyMetrics.clicks || 0) + (type === 'click' ? 1 : 0),
        byPlacement: {
            ...(currentDailyMetrics.byPlacement || {}),
            [placementId]: nextDailyPlacementMetrics,
        }
    };

    return {
        ...request,
        metrics: {
            impressions: Number(currentMetrics.impressions || 0) + (type === 'impression' ? 1 : 0),
            clicks: Number(currentMetrics.clicks || 0) + (type === 'click' ? 1 : 0),
            lastImpressionAt: type === 'impression' ? now : currentMetrics.lastImpressionAt,
            lastClickAt: type === 'click' ? now : currentMetrics.lastClickAt,
            byPlacement: {
                ...(currentMetrics.byPlacement || {}),
                [placementId]: nextPlacementMetrics,
            },
            daily: {
                ...(currentMetrics.daily || {}),
                [dateKey]: nextDailyMetrics,
            },
        },
        updatedAt: now,
    };
};

// ============================================================================
// CANONICAL PIN ENDPOINTS (Unified for Admin 3001)
// ============================================================================

// Career pins list with logos from Supabase
router.get('/v1/admin/sigma/pins', supabaseAuth, async (_req: Request, res: Response) => {
    try {
        const cfg = await getSigmaConfig();
        const logos: Record<string, string> = await getAppConfig('career_pin_logos') || {};

        const basePins = (cfg.career.pins && cfg.career.pins.length) ? cfg.career.pins : [
            { name: 'Bronze', orderIndex: 1 },
            { name: 'Prata', orderIndex: 2 },
            { name: 'Ouro', orderIndex: 3 },
            { name: 'Safira', orderIndex: 4 },
            { name: 'Esmeralda', orderIndex: 5 },
            { name: 'Topázio', orderIndex: 6 },
            { name: 'Rubi', orderIndex: 7 },
            { name: 'Diamante', orderIndex: 8 },
            { name: 'Duplo Diamante', orderIndex: 9 },
            { name: 'Triplo Diamante', orderIndex: 10 },
            { name: 'Diamante Red', orderIndex: 11 },
            { name: 'Diamante Blue', orderIndex: 12 },
            { name: 'Diamante Black', orderIndex: 13 },
        ] as any[];

        const pins = basePins.map((p: any) => ({
            id: p.name.toLowerCase().replace(/\s+/g, '-'),
            ordem: p.orderIndex,
            nome: p.name,
            descricao: p.description || '',
            logoUrl: logos[p.name] || null,
        }));
        res.json({ success: true, pins });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Pins visibility config for dashboard (Supabase app_configs)
router.get('/v1/admin/sigma/pins/visibility', supabaseAuth, async (_req: Request, res: Response) => {
    try {
        const logos: Record<string, string> = await getAppConfig('career_pin_logos') || {};
        const visRaw = await getAppConfig('dashboard_pins_visibility');

        // Se for array (formato novo), mapear. Se for objeto (formato antigo), converter.
        const vis: Record<string, boolean> = {};
        if (Array.isArray(visRaw)) {
            visRaw.forEach((item: any) => {
                if (item.nome) vis[item.nome] = item.visible;
                else if (item.pinId) vis[item.pinId.replace(/-/g, ' ')] = item.visible;
            });
        } else if (visRaw && typeof visRaw === 'object') {
            Object.assign(vis, visRaw);
        }

        const defaultOrder = ['Bronze', 'Prata', 'Ouro', 'Safira', 'Esmeralda', 'Topázio', 'Rubi', 'Diamante', 'Duplo Diamante', 'Triplo Diamante', 'Diamante Red', 'Diamante Blue', 'Diamante Black'];
        const data = defaultOrder.map(name => ({
            pinId: name.toLowerCase().replace(/\s+/g, '-'),
            visible: vis[name] ?? true,
            logoUrl: logos[name] || null,
            nome: name
        }));
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/admin/sigma/pins/visibility', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        // Aceitar tanto o array direto quanto o objeto { data: [...] }
        const data = Array.isArray(payload) ? payload : (payload.data || []);

        const success = await updateAppConfig('dashboard_pins_visibility', data);
        if (!success) throw new Error('Falha ao persistir no banco de dados');

        res.json({ success: true });
    } catch (e: any) {
        console.error('[AdminConfig] PUT visibility error:', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================================================
// GENERAL SETTINGS & BRANDING (Unified)
// ============================================================================

// GET all settings (General + Notifications) - PUBLIC for login branding
router.get('/v1/admin/settings/general', async (_req: Request, res: Response) => {
    try {
        const general = await getAppConfig('general_branding_settings') || {
            companyName: 'RSPrólipsi Comércio LTDA',
            name: 'Roberto',
            surname: 'Camargo',
            cpf: '123.456.789-00',
            cnpj: '12.345.678/0001-99',
            avatar: '/logo-rs.png',
            logo: '/logo-rs.png',
            favicon: '/favicon.ico',
            language: 'pt-BR',
            currency: 'BRL'
        };
        res.json({ success: true, data: general });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/admin/settings/general', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const success = await updateAppConfig('general_branding_settings', payload);
        if (!success) throw new Error('Falha ao persistir configurações gerais');
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/v1/admin/settings/notifications', supabaseAuth, async (_req: Request, res: Response) => {
    try {
        const notifications = await getAppConfig('notification_settings') || {
            emailEnabled: true,
            whatsappEnabled: true,
            pushEnabled: false
        };
        res.json({ success: true, data: notifications });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/admin/settings/notifications', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const success = await updateAppConfig('notification_settings', payload);
        if (!success) throw new Error('Falha ao persistir configurações de notificação');
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/v1/admin/marketplace/sponsored-settings', supabaseAuth, async (_req: Request, res: Response) => {
    try {
        const settings = await getSponsoredSettingsConfig();
        res.json({ success: true, data: settings });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/v1/public/marketplace/sponsored-settings', async (_req: Request, res: Response) => {
    try {
        const settings = await getSponsoredSettingsConfig();
        res.json({
            success: true,
            data: {
                rotationEnabled: settings.rotationEnabled,
                rotationWindowMinutes: settings.rotationWindowMinutes,
                maxVisibleProductsPerPlacement: settings.maxVisibleProductsPerPlacement,
            }
        });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/admin/marketplace/sponsored-settings', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req: Request, res: Response) => {
    try {
        const payload = normalizeSponsoredSettings(req.body || {});
        const success = await updateAppConfig('marketplace_sponsored_settings', payload);
        if (!success) throw new Error('Falha ao persistir configuracoes de patrocinio');
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/v1/admin/marketplace/sponsored-requests', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('store_customizations')
            .select('tenant_id, footer, updated_at');

        if (error) throw error;

        const requests = (data || []).flatMap((row: any) => {
            const footer = row?.footer || {};
            const customSettings = footer?.customSettings || {};
            const promotionRequests = Array.isArray(customSettings?.promotionRequests) ? customSettings.promotionRequests : [];

            return promotionRequests.map((request: any) => ({
                ...request,
                tenantId: String(request?.tenantId || row?.tenant_id || ''),
                updatedAt: request?.updatedAt || row?.updated_at || new Date().toISOString(),
            }));
        }).sort((a: any, b: any) => {
            const aDate = new Date(a?.requestedAt || a?.updatedAt || 0).getTime();
            const bDate = new Date(b?.requestedAt || b?.updatedAt || 0).getTime();
            return bDate - aDate;
        });

        res.json({ success: true, data: { requests } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/v1/admin/marketplace/sponsored-requests/:id/payment', supabaseAuth, async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const { tenantId, method } = req.body || {};

        if (!tenantId) {
            return res.status(400).json({ success: false, error: 'tenantId requerido' });
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            return res.status(500).json({ success: false, error: 'MP_ACCESS_TOKEN nao configurado' });
        }

        const { footer, customSettings, requests } = await getSponsoredRequestContextByTenant(tenantId);
        const currentRequest = requests.find((item: any) => String(item?.id) === String(requestId));

        if (!currentRequest) {
            return res.status(404).json({ success: false, error: 'Solicitacao nao encontrada' });
        }

        const paymentMethod = String(method || currentRequest.paymentMethod || 'pix').toLowerCase() === 'boleto' ? 'boleto' : 'pix';
        const amount = Number(currentRequest.packagePrice || currentRequest.paymentAmount || 0);

        if (amount <= 0) {
            return res.status(400).json({ success: false, error: 'Valor do pacote invalido para cobranca' });
        }

        const { payerName, payer } = buildPayerData(currentRequest, req.body || {});
        const externalReference = `promotion:${tenantId}:${requestId}`;
        const idempotencyKey = crypto
            .createHash('sha256')
            .update(`${externalReference}-${paymentMethod}-${Date.now()}`)
            .digest('hex');
        const notificationUrl = resolveSponsoredWebhookUrl();

        const mpPayload: Record<string, any> = {
            transaction_amount: amount,
            description: `${currentRequest.packageName} - ${currentRequest.productName}`,
            payment_method_id: paymentMethod === 'boleto' ? 'bolbradesco' : 'pix',
            external_reference: externalReference,
            payer,
        };

        if (notificationUrl) {
            mpPayload.notification_url = notificationUrl;
        }

        const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', mpPayload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey,
            }
        });

        const paymentData = mpResponse.data || {};
        const transactionData = paymentData?.point_of_interaction?.transaction_data || {};
        const paymentStatus = mapMercadoPagoStatus(paymentData?.status);
        const now = new Date().toISOString();

        const nextRequest = {
            ...currentRequest,
            paymentMethod,
            paymentStatus,
            paymentAmount: amount,
            paymentId: String(paymentData?.id || currentRequest.paymentId || ''),
            paymentQrCode: transactionData?.qr_code || currentRequest.paymentQrCode,
            paymentQrCodeBase64: transactionData?.qr_code_base64 || currentRequest.paymentQrCodeBase64,
            paymentTicketUrl: transactionData?.ticket_url || paymentData?.transaction_details?.external_resource_url || currentRequest.paymentTicketUrl,
            paymentGeneratedAt: now,
            paidAt: paymentStatus === 'pago' ? now : currentRequest.paidAt,
            updatedAt: now,
            requesterName: currentRequest.requesterName || payerName,
            requesterEmail: currentRequest.requesterEmail || payer.email,
        };

        const finalRequest = await finalizeSponsoredRequest(
            tenantId,
            requestId,
            footer,
            customSettings,
            requests,
            nextRequest
        );

        res.json({ success: true, data: finalRequest });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/v1/admin/marketplace/sponsored-requests/:id/payment-status', supabaseAuth, async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const tenantId = String(req.query.tenantId || '');

        if (!tenantId) {
            return res.status(400).json({ success: false, error: 'tenantId requerido' });
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            return res.status(500).json({ success: false, error: 'MP_ACCESS_TOKEN nao configurado' });
        }

        const { footer, customSettings, requests } = await getSponsoredRequestContextByTenant(tenantId);
        const currentRequest = requests.find((item: any) => String(item?.id) === String(requestId));

        if (!currentRequest) {
            return res.status(404).json({ success: false, error: 'Solicitacao nao encontrada' });
        }

        if (!currentRequest.paymentId) {
            return res.json({ success: true, data: currentRequest });
        }

        const mpResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${currentRequest.paymentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        const paymentData = mpResponse.data || {};
        const paymentStatus = mapMercadoPagoStatus(paymentData?.status);
        const now = new Date().toISOString();

        const nextRequest = {
            ...currentRequest,
            paymentStatus,
            paidAt: paymentStatus === 'pago' ? (currentRequest.paidAt || now) : currentRequest.paidAt,
            updatedAt: now,
        };

        const finalRequest = await finalizeSponsoredRequest(
            tenantId,
            requestId,
            footer,
            customSettings,
            requests,
            nextRequest
        );

        res.json({ success: true, data: finalRequest });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/v1/public/marketplace/sponsored-requests/payment-webhook/mercadopago', async (req: Request, res: Response) => {
    try {
        const paymentId = String(req.body?.data?.id || req.body?.id || req.query['data.id'] || req.query.id || '');
        if (!paymentId) {
            return res.status(400).json({ success: false, error: 'paymentId requerido' });
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            return res.status(500).json({ success: false, error: 'MP_ACCESS_TOKEN nao configurado' });
        }

        const mpResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        const paymentData = mpResponse.data || {};
        const transactionData = paymentData?.point_of_interaction?.transaction_data || {};
        const paymentStatus = mapMercadoPagoStatus(paymentData?.status);
        const reference = parseSponsoredExternalReference(paymentData?.external_reference);
        const context = await findSponsoredRequestContext({
            tenantId: reference?.tenantId,
            requestId: reference?.requestId,
            paymentId,
        });

        if (!context?.currentRequest) {
            return res.json({ success: true, ignored: true, reason: 'request_not_found' });
        }

        const now = new Date().toISOString();
        const nextRequest = {
            ...context.currentRequest,
            paymentMethod: context.currentRequest.paymentMethod || (String(paymentData?.payment_method_id || '').includes('bol') ? 'boleto' : 'pix'),
            paymentStatus,
            paymentAmount: Number(context.currentRequest.paymentAmount || context.currentRequest.packagePrice || 0),
            paymentId: String(paymentData?.id || context.currentRequest.paymentId || paymentId),
            paymentQrCode: transactionData?.qr_code || context.currentRequest.paymentQrCode,
            paymentQrCodeBase64: transactionData?.qr_code_base64 || context.currentRequest.paymentQrCodeBase64,
            paymentTicketUrl: transactionData?.ticket_url || paymentData?.transaction_details?.external_resource_url || context.currentRequest.paymentTicketUrl,
            paymentGeneratedAt: context.currentRequest.paymentGeneratedAt || now,
            paidAt: paymentStatus === 'pago' ? (context.currentRequest.paidAt || now) : context.currentRequest.paidAt,
            updatedAt: now,
        };

        const finalRequest = await finalizeSponsoredRequest(
            context.tenantId,
            context.currentRequest.id,
            context.footer,
            context.customSettings,
            context.requests,
            nextRequest
        );

        return res.json({ success: true, data: finalRequest });
    } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/v1/public/marketplace/sponsored-events', async (req: Request, res: Response) => {
    try {
        const { tenantId, productId, placementId, type } = req.body || {};
        const normalizedType = String(type || '').toLowerCase() === 'click' ? 'click' : 'impression';

        if (!tenantId || !productId || !placementId) {
            return res.status(400).json({ success: false, error: 'tenantId, productId e placementId sao obrigatorios' });
        }

        const { footer, customSettings, requests } = await getSponsoredRequestContextByTenant(String(tenantId));
        const now = new Date();
        const matchingRequests = requests
            .filter((item: any) =>
                String(item?.productId) === String(productId) &&
                isSponsoredRequestActiveForPlacement(item, String(placementId), now)
            )
            .sort((a: any, b: any) => {
                const priorityA = Number(a?.priority ?? 999);
                const priorityB = Number(b?.priority ?? 999);
                if (priorityA !== priorityB) return priorityA - priorityB;

                const dateA = new Date(a?.updatedAt || a?.requestedAt || 0).getTime();
                const dateB = new Date(b?.updatedAt || b?.requestedAt || 0).getTime();
                return dateB - dateA;
            });

        const activeRequest = matchingRequests[0];
        if (!activeRequest) {
            return res.json({ success: true, ignored: true, reason: 'active_request_not_found' });
        }

        const nextRequest = incrementSponsoredRequestMetrics(activeRequest, String(placementId), normalizedType);
        const nextRequests = requests.map((item: any) =>
            String(item?.id) === String(activeRequest.id) ? nextRequest : item
        );

        await saveSponsoredRequestsForTenant(String(tenantId), footer, customSettings, nextRequests, nextRequest.updatedAt || new Date().toISOString());

        return res.json({ success: true, data: nextRequest.metrics });
    } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/admin/marketplace/sponsored-requests/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const { tenantId, status, adminNotes, priority, label, placementIds, campaignStartAt, campaignEndAt } = req.body || {};

        if (!tenantId) {
            return res.status(400).json({ success: false, error: 'tenantId requerido' });
        }

        const { footer, customSettings, requests } = await getSponsoredRequestContextByTenant(tenantId);
        const currentRequest = requests.find((item: any) => String(item?.id) === String(requestId));

        if (!currentRequest) {
            return res.status(404).json({ success: false, error: 'Solicitacao nao encontrada' });
        }

        const campaignWindow = resolveSponsoredCampaignWindow({
            ...currentRequest,
            campaignStartAt,
            campaignEndAt,
        });

        if (String(status || currentRequest.status) === 'aprovado' && currentRequest.paymentStatus !== 'pago') {
            return res.status(400).json({ success: false, error: 'A solicitacao precisa estar paga antes da aprovacao' });
        }

        const nextRequest = {
            ...currentRequest,
            status: status || currentRequest.status,
            adminNotes: adminNotes ?? currentRequest.adminNotes,
            campaignStartAt: campaignWindow.campaignStartAt,
            campaignEndAt: campaignWindow.campaignEndAt,
            updatedAt: new Date().toISOString(),
        };

        const finalRequest = await finalizeSponsoredRequest(
            tenantId,
            requestId,
            footer,
            customSettings,
            requests,
            nextRequest,
            {
                priority: priority !== undefined && priority !== null && `${priority}` !== ''
                    ? Number(priority)
                    : undefined,
                label: label ? String(label) : undefined,
                placementIds: Array.isArray(placementIds) ? placementIds : undefined,
            }
        );

        res.json({ success: true, data: finalRequest });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

export default router;
