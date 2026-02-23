
import express from 'express';
import { supabase, supabaseAdmin } from '../../lib/supabaseClient';
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
        console.log(`[DashboardAPI] Persisting config for ${key}...`);
        const { data, error } = await supabaseAdmin
            .from('app_configs')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error(`[DashboardAPI] CRITICAL DATABASE ERROR saving config for ${key}:`, error.message, error.details);
            return false;
        }
        console.log(`[DashboardAPI] Config ${key} saved successfully.`);
        return true;
    } catch (e) {
        console.error(`[DashboardAPI] UNEXPECTED EXCEPTION saving config for ${key}:`, e);
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
    ],
    promoBanners: [
        {
            id: 'banner-default-rs',
            preTitle: 'Oficial',
            title: 'RS Prólipsi',
            price: 0,
            imageUrl: 'https://github.com/user-attachments/assets/bf61e389-9e8c-4f9e-a0e1-7e81084d59de',
            ctaText: 'Ver Novidades'
        }
    ]
};

const DEFAULT_MARKETPLACE_CONFIG = {
    bonusCards: [],
    userInfo: [],
    links: [],
    promoBanners: []
};

// GET /v1/admin/dashboard/layout/consultant
// [SÊNIOR] Permitimos que 'consultor' também leia seu layout, mas apenas ADMIN edite (PUT)
router.get('/layout/consultant', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin', 'consultor']), async (req, res) => {
    const config = await getConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    res.json({ success: true, config });
});

// PUT /v1/admin/dashboard/layout/consultant
router.put('/layout/consultant', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    const success = await saveConfig('dashboard_layout_consultant', config);
    if (!success) {
        return res.status(500).json({ success: false, error: 'Falha ao gravar configuração no banco de dados' });
    }
    res.json({ success: true, config });
});

// GET /v1/admin/dashboard/layout/marketplace
router.get('/layout/marketplace', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin', 'consultor']), async (req, res) => {
    const config = await getConfig('dashboard_layout_marketplace', DEFAULT_MARKETPLACE_CONFIG);
    res.json({ success: true, config });
});

// PUT /v1/admin/dashboard/layout/marketplace
router.put('/layout/marketplace', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    const success = await saveConfig('dashboard_layout_marketplace', config);
    if (!success) {
        return res.status(500).json({ success: false, error: 'Falha ao gravar configuração no banco de dados' });
    }
    res.json({ success: true, config });
});

// Legacy/Generic endpoints
router.get('/layout', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin', 'consultor']), async (req, res) => {
    const config = await getConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    res.json({ success: true, config });
});

router.put('/layout', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const config = req.body;
    const success = await saveConfig('dashboard_layout_consultant', config);
    if (!success) {
        return res.status(500).json({ success: false, error: 'Falha ao gravar configuração no banco de dados' });
    }
    res.json({ success: true, config });
});

router.post('/layout/reset', supabaseAuth, requireRole([ROLES.ADMIN, 'super_admin', 'superadmin']), async (req, res) => {
    const success = await saveConfig('dashboard_layout_consultant', DEFAULT_CONSULTANT_CONFIG);
    if (!success) {
        return res.status(500).json({ success: false, error: 'Falha ao resetar configuração' });
    }
    res.json({ success: true, config: DEFAULT_CONSULTANT_CONFIG });
});

export default router;
