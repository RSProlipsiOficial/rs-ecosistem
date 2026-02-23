import { Router, Request, Response } from 'express';
import { supabaseAuth, requireRole, ROLES } from '../middlewares/supabaseAuth';
import { getSigmaConfig, updateSigmaSettings, SigmaConfig } from '../services/sigmaConfigService';
import fs from 'fs';
import path from 'path';

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
        const { data: existing, error: fetchError } = await supabaseAdmin.from('app_configs').select('id').eq('key', key).maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            const { error: updateError } = await supabaseAdmin.from('app_configs').update({
                value,
                updated_at: new Date().toISOString()
            }).eq('id', existing.id);
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

export default router;

export default router;
