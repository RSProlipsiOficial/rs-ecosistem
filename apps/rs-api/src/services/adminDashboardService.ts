import { supabase, supabaseAdmin } from '../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export async function getAdminOverview() {
    try {
        // Carregar mapping para desduplicação precisa
        const mappingPath = path.join(__dirname, '..', 'routes', 'v1', 'detailed_id_mapping.json');
        let mapping: any = {};
        if (fs.existsSync(mappingPath)) {
            mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        }

        // 1. Pegar todos os Consultores RS
        console.log('[AdminOverview] Fetching consultores...');
        const { data: rsData, error: rsError } = await supabaseAdmin.from('consultores').select('nome, email, status');
        if (rsError) console.error('[AdminOverview] Error fetching consultores:', rsError);
        console.log(`[AdminOverview] Consultores fetched: ${rsData?.length || 0}`);

        // 2. Pegar Donos Rota Fácil (mmn_id IS NOT NULL)
        console.log('[AdminOverview] Fetching user_profiles...');
        const { data: rtProfiles, error: rtError } = await supabaseAdmin.from('user_profiles').select('id, nome_completo, mmn_id').not('mmn_id', 'is', null);
        if (rtError) console.error('[AdminOverview] Error fetching user_profiles:', rtError);
        console.log(`[AdminOverview] Rota Profiles fetched: ${rtProfiles?.length || 0}`);
        if (rtProfiles?.length === 0) {
            console.log('[AdminOverview] WARNING: No user_profiles found with mmn_id IS NOT NULL');
        }

        // 3. Unificação por "Identidade Única" (Nome ou Login do Excel)
        const uniqueIdentities = new Set();

        // Adicionar da RS
        if (rsData) {
            rsData.forEach(c => {
                if (c.nome) {
                    const nameKey = c.nome.toLowerCase().trim();
                    uniqueIdentities.add(nameKey);
                }
            });
        }

        // Adicionar da Rota (Apenas proprietários, se não existir na RS)
        if (rtProfiles) {
            rtProfiles.forEach(p => {
                if (p.nome_completo) {
                    const nameKey = p.nome_completo.toLowerCase().trim();
                    uniqueIdentities.add(nameKey);
                }
            });
        }

        // Cálculos financeiros
        const { data: wallets } = await supabaseAdmin.from('wallets').select('balance');
        const totalBalance = wallets?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;

        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count: cyclesMonth } = await supabaseAdmin.from('cycle_events').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth);

        const overview = {
            total_consultants: rsData?.length || 0,
            rota_owners: rtProfiles?.length || 0,
            active_consultants: (rsData || []).filter(c => c.status === 'ativo').length,
            unified_users: uniqueIdentities.size, // União desduplicada por Identidade Real
            total_balance: totalBalance,
            cycles_month: cyclesMonth || 0
        };
        console.log('[AdminOverview] Returning result:', overview);
        return overview;
    } catch (error) {
        console.error('Error in getAdminOverview:', error);
        throw error;
    }
}
