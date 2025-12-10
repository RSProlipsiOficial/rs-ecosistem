import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { getSigmaConfig, updateSigmaSettings, SigmaConfig } from '../services/sigmaConfigService';
import fs from 'fs';
import path from 'path';

const router = Router();

// Helper to get full config and return specific part
const getConfig = async () => await getSigmaConfig();

// Helper to update specific part of config
const updateConfigPart = async (part: keyof SigmaConfig, data: any) => {
    const current = await getSigmaConfig();
    const updated = { ...current, [part]: { ...current[part], ...data } };
    await updateSigmaSettings(updated);
    return updated[part];
};

// ============================================================================
// SIGMA CONFIG
// ============================================================================

// Matrix
router.get('/admin/sigma/matrix/config', auth(true), async (req, res) => {
    try {
        const cfg = await getConfig();
        // Map internal structure to admin expected structure
        const matrixConfig = {
            type: '1x6', // Hardcoded for now or add to DB
            size: 6,
            cycleValue: cfg.cycle.value,
            compression: {
                enabled: true, // Add to DB if needed
                automatic: true,
                mode: cfg.cycle.spilloverMode === 'linha_ascendente' ? 'dynamic' : 'static'
            },
            reentry: {
                enabled: cfg.cycle.autoReentryEnabled,
                automatic: true,
                cost: cfg.cycle.value,
                maxReentries: cfg.cycle.autoReentryLimitPerMonth
            }
        };
        res.json(matrixConfig);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/admin/sigma/matrix/config', auth(true), async (req, res) => {
    try {
        const { cycleValue, compression, reentry } = req.body;
        const current = await getConfig();

        const updated: SigmaConfig = {
            ...current,
            cycle: {
                ...current.cycle,
                value: cycleValue,
                autoReentryEnabled: reentry?.enabled,
                autoReentryLimitPerMonth: reentry?.maxReentries,
                spilloverMode: compression?.mode === 'dynamic' ? 'linha_ascendente' : 'global'
            }
        };

        await updateSigmaSettings(updated);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Top SIGMA
router.get('/admin/sigma/top/config', auth(true), async (req, res) => {
    try {
        const cfg = await getConfig();
        const distribution: Record<string, number> = {};
        cfg.topSigma.ranks.forEach(r => {
            distribution[String(r.rank)] = r.percent;
        });

        res.json({
            enabled: true,
            percentualPool: cfg.topSigma.percentTotal,
            valorPool: 0, // Calculated on frontend or backend?
            period: 'monthly',
            ranking: 'top_10',
            levelWeights: [], // Add to DB if needed
            distribution
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/admin/sigma/top/config', auth(true), async (req, res) => {
    try {
        const { percentualPool, distribution } = req.body;
        const current = await getConfig();

        const ranks = Object.entries(distribution).map(([rank, percent]) => ({
            rank: Number(rank),
            percent: Number(percent)
        }));

        const updated: SigmaConfig = {
            ...current,
            topSigma: {
                ...current.topSigma,
                percentTotal: percentualPool,
                ranks
            }
        };

        await updateSigmaSettings(updated);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Fidelity
router.get('/admin/sigma/fidelity/config', auth(true), async (req, res) => {
    try {
        const cfg = await getConfig();
        const levels: Record<string, any> = {};
        cfg.fidelityBonus.levels.forEach(l => {
            levels[`L${l.level}`] = { percentage: l.percent, value: 0 };
        });

        res.json({
            enabled: true,
            percentualPool: cfg.fidelityBonus.percentTotal,
            valorPool: 0,
            maxLevels: cfg.fidelityBonus.levels.length,
            period: 'monthly',
            levels
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/admin/sigma/fidelity/config', auth(true), async (req, res) => {
    try {
        const { percentualPool, levels } = req.body;
        const current = await getConfig();

        const newLevels = Object.entries(levels).map(([key, val]: [string, any]) => ({
            level: Number(key.replace('L', '')),
            percent: typeof val === 'object' ? val.percentage : val
        }));

        const updated: SigmaConfig = {
            ...current,
            fidelityBonus: {
                ...current.fidelityBonus,
                percentTotal: percentualPool,
                levels: newLevels
            }
        };

        await updateSigmaSettings(updated);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Career
router.get('/admin/career/config', auth(true), async (req, res) => {
    try {
        const cfg = await getConfig();
        res.json({
            enabled: true,
            percentual: cfg.career.percentTotal,
            valorPorCiclo: cfg.career.valuePerCycle,
            period: 'quarterly',
            applyVMEC: true
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/admin/career/config', auth(true), async (req, res) => {
    try {
        const { percentual } = req.body;
        const current = await getConfig();

        const updated: SigmaConfig = {
            ...current,
            career: {
                ...current.career,
                percentTotal: percentual,
                valuePerCycle: 0, // Recalculated by service
                pins: current.career.pins
            }
        };

        await updateSigmaSettings(updated);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
// Helpers for local config logos mapping (fallback / single source for logos when Supabase doesn't store logo_url)
const CONFIG_FILE = path.join(process.cwd(), 'public', 'config.json');
function readLocal(): any { try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')); } catch { return {}; } }
function writeLocal(upd: any) { const cur = readLocal(); const next = { ...cur, ...upd }; fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true }); fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf-8'); }

// ============================================================================
// CAREER PINS (Single source for names/order; logo_url synchronized via local config mapping)
// ============================================================================
router.get('/v1/compensation/career-pins', auth(false), async (_req, res) => {
    try {
        const cfg = await getSigmaConfig();
        const logos: Record<string, string> = readLocal().career_pin_logos || {};
        const basePins = (cfg.career.pins && cfg.career.pins.length) ? cfg.career.pins : [
            { name: 'Bronze', orderIndex: 0, cyclesRequired: 0 },
            { name: 'Prata', orderIndex: 1, cyclesRequired: 0 },
            { name: 'Ouro', orderIndex: 2, cyclesRequired: 0 },
            { name: 'Safira', orderIndex: 3, cyclesRequired: 0 },
            { name: 'Esmeralda', orderIndex: 4, cyclesRequired: 0 },
            { name: 'Topázio', orderIndex: 5, cyclesRequired: 0 },
            { name: 'Rubi', orderIndex: 6, cyclesRequired: 0 },
            { name: 'Diamante', orderIndex: 7, cyclesRequired: 0 }
        ] as any[];
        const pins = basePins.map((p: any, idx: number) => ({
            id: idx + 1,
            nome: p.name,
            ordem: p.orderIndex,
            logo_url: logos[p.name] || null,
            min_pontos: p.cyclesRequired
        }));
        res.json({ success: true, data: pins });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.put('/v1/compensation/career-pins', auth(true), async (req, res) => {
    try {
        const body = req.body || {};
        const logos: Record<string, string> = body.logos || {};
        writeLocal({ career_pin_logos: logos });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// SIGMA canonical pins endpoint (13 oficiais)
router.get('/v1/sigma/career/pins', auth(false), async (_req, res) => {
    try {
        const cfg = await getSigmaConfig();
        const logos: Record<string, string> = readLocal().career_pin_logos || {};
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

// Pins visibility config for dashboard (default all true)
router.get('/v1/admin/dashboard/pins-visibility', auth(false), async (_req, res) => {
    try {
        const logos: Record<string, string> = readLocal().career_pin_logos || {};
        const vis: Record<string, boolean> = readLocal().sigma_pin_visibility || {};
        const defaultOrder = ['Bronze', 'Prata', 'Ouro', 'Safira', 'Esmeralda', 'Topázio', 'Rubi', 'Diamante', 'Duplo Diamante', 'Triplo Diamante', 'Diamante Red', 'Diamante Blue', 'Diamante Black'];
        const data = defaultOrder.map(name => ({ pinId: name.toLowerCase().replace(/\s+/g, '-'), visible: vis[name] ?? true, logoUrl: logos[name] || null, nome: name }));
        res.json({ success: true, data });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/v1/admin/dashboard/pins-visibility', auth(true), async (req, res) => {
    try {
        const arr: Array<{ pinId: string; visible: boolean }> = req.body?.data || [];
        const map: Record<string, boolean> = {};
        arr.forEach(i => { const name = i.pinId.replace(/-/g, ' '); map[name.charAt(0).toUpperCase() + name.slice(1)] = Boolean(i.visible); });
        writeLocal({ sigma_pin_visibility: map });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
