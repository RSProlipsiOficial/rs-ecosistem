
import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES } from '../../middlewares/supabaseAuth';

const router = express.Router();

// Helper to get config from DB or return default
const getConfig = async (key: string, defaultValue: any) => {
    try {
        const { data, error } = await supabase
            .from('app_configs')
            .select('value')
            .eq('key', key)
            .single();

        if (error || !data) return defaultValue;
        return data.value;
    } catch (e) {
        return defaultValue;
    }
};

// Helper to save config to DB
const saveConfig = async (key: string, value: any) => {
    try {
        // Try to update first
        const { data, error } = await supabase
            .from('app_configs')
            .upsert({ key, value })
            .select();

        if (error) {
            // If table doesn't exist, we can't save. Return success to frontend to avoid crash.
            console.warn(`Failed to save config for ${key}:`, error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error(`Exception saving config for ${key}:`, e);
        return false;
    }
};

const DEFAULT_CONSULTANT_CONFIG = {
    bonusCards: [
        { title: 'Bônus Ciclo Global', value: 'bonusCicloGlobal', icon: 'IconGitFork' },
        { title: 'Bônus Top Sigme', value: 'bonusTopSigme', icon: 'IconStar' }
    ],
    userInfo: [
        { label: 'Nome', source: 'name' },
        { label: 'Graduação', source: 'graduacao' },
        { label: 'PIN', source: 'pin' }
    ],
    links: [
        { label: 'Link de Indicação', source: 'linkIndicacao', icon: 'IconLink' }
    ]
};

const DEFAULT_MARKETPLACE_CONFIG = {
    // Similar default for marketplace
    bonusCards: [],
    userInfo: [],
    links: []
};

// GET /v1/admin/dashboard/layout/consultant
router.get('/layout/consultant', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = await getConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    res.json({ success: true, config });
});

// PUT /v1/admin/dashboard/layout/consultant
router.put('/layout/consultant', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    await saveConfig('dashboard_layout_consultant', config);
    res.json({ success: true, config });
});

// GET /v1/admin/dashboard/layout/marketplace
router.get('/layout/marketplace', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = await getConfig('dashboard_layout_marketplace', DEFAULT_MARKETPLACE_CONFIG);
    res.json({ success: true, config });
});

// PUT /v1/admin/dashboard/layout/marketplace
router.put('/layout/marketplace', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    await saveConfig('dashboard_layout_marketplace', config);
    res.json({ success: true, config });
});

// Legacy/Generic endpoints
router.get('/layout', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = await getConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    res.json({ success: true, config });
});

router.put('/layout', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    await saveConfig('dashboard_layout_consultant', config);
    res.json({ success: true, config });
});

router.post('/layout/reset', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    await saveConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    res.json({ success: true, config: DEFAULT_CONSULTANT_CONFIG });
});

export default router;
