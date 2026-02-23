/**
 * RS PRÓLIPSI - MARKETPLACE DATA LOADER
 * Carrega dados REAIS do Supabase, eliminando dados mockados.
 */
import { adminSupabase } from './supabaseClient';

// =====================================================
// PERFIL DO CONSULTOR (REAL)
// =====================================================
export async function loadRealUserProfile(userId?: string) {
    const uid = userId || localStorage.getItem('userId') || localStorage.getItem('rs-tenant-id');

    if (!uid) {
        console.warn('[RS-MARKETPLACE] Nenhum userId encontrado. Usando perfil padrão.');
        return getDefaultProfile();
    }

    try {
        // Tentar buscar do minisite_profiles primeiro (fonte primária)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);

        const { data: profile, error } = await adminSupabase
            .from('minisite_profiles')
            .select('*')
            .or(isUUID ? `id.eq.${uid},consultant_id.eq.${uid}` : `consultant_id.eq.${uid}`)
            .maybeSingle();

        if (error) {
            console.error('[RS-MARKETPLACE] Erro ao buscar perfil:', error);
            return getDefaultProfile();
        }

        if (profile) {
            console.log('[RS-MARKETPLACE] ✅ Perfil REAL carregado:', profile.name);
            return {
                name: profile.name || 'Consultor RS',
                id: profile.consultant_id || profile.id || uid,
                graduation: profile.graduation || 'CONSULTOR',
                accountStatus: profile.account_status || 'Ativo',
                monthlyActivity: profile.monthly_activity || 'Ativo',
                category: profile.category || 'CONSULTOR',
                referralLink: `https://rsprolipsi.com/register/${profile.consultant_id || uid}`,
                affiliateLink: `https://rs-shop.com/loja/${profile.consultant_id || uid}`,
                avatarUrl: profile.avatar_url || '',
            };
        }

        // Fallback: tentar buscar na tabela consultores
        const { data: consultor } = await adminSupabase
            .from('consultores')
            .select('*')
            .or(isUUID ? `id.eq.${uid},consultant_id.eq.${uid}` : `consultant_id.eq.${uid}`)
            .maybeSingle();

        if (consultor) {
            console.log('[RS-MARKETPLACE] ✅ Perfil carregado da tabela consultores:', consultor.name);
            return {
                name: consultor.name || 'Consultor RS',
                id: consultor.consultant_id || consultor.id || uid,
                graduation: consultor.graduation || 'CONSULTOR',
                accountStatus: 'Ativo',
                monthlyActivity: 'Ativo',
                category: 'CONSULTOR',
                referralLink: `https://rsprolipsi.com/register/${consultor.consultant_id || uid}`,
                affiliateLink: `https://rs-shop.com/loja/${consultor.consultant_id || uid}`,
                avatarUrl: consultor.avatar_url || '',
            };
        }

        console.warn('[RS-MARKETPLACE] Nenhum perfil encontrado para:', uid);
        return getDefaultProfile();
    } catch (err) {
        console.error('[RS-MARKETPLACE] Erro crítico ao carregar perfil:', err);
        return getDefaultProfile();
    }
}

function getDefaultProfile() {
    return {
        name: 'Consultor RS',
        id: 'N/A',
        graduation: 'CONSULTOR',
        accountStatus: 'Ativo',
        monthlyActivity: 'Ativo',
        category: 'CONSULTOR',
        referralLink: '',
        affiliateLink: '',
        avatarUrl: '',
    };
}

// =====================================================
// PRODUTOS REAIS
// =====================================================
export async function loadRealProducts() {
    try {
        const { data: products, error } = await adminSupabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[RS-MARKETPLACE] Erro ao buscar produtos:', error);
            return [];
        }

        if (products && products.length > 0) {
            console.log(`[RS-MARKETPLACE] ✅ ${products.length} produtos REAIS carregados`);
            return products.map((p: any) => ({
                id: String(p.id),
                name: p.name || 'Produto sem nome',
                seller: p.seller || 'RS Prólipsi',
                price: Number(p.price) || 0,
                compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
                costPerItem: p.cost_per_item ? Number(p.cost_per_item) : undefined,
                currency: 'BRL',
                shortDescription: p.short_description || p.description?.substring(0, 150) || '',
                description: p.description || '',
                images: Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : ['https://placehold.co/400x400?text=Produto']),
                rating: Number(p.rating) || 0,
                reviewCount: Number(p.review_count) || 0,
                collectionId: p.collection_id || null,
                status: p.status || 'Publicado',
                inventory: Number(p.inventory) || Number(p.stock) || 0,
                type: p.type || 'Físico',
                requiresShipping: p.requires_shipping !== false,
                trackQuantity: true,
                chargeTax: true,
                continueSelling: false,
                seoTitle: p.seo_title || p.name || '',
                seoDescription: p.seo_description || p.description?.substring(0, 320) || '',
                urlHandle: p.url_handle || p.slug || '',
                options: p.options || [],
                variants: p.variants || [],
            }));
        }

        console.warn('[RS-MARKETPLACE] Nenhum produto encontrado no banco');
        return [];
    } catch (err) {
        console.error('[RS-MARKETPLACE] Erro crítico ao carregar produtos:', err);
        return [];
    }
}
