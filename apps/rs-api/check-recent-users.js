const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentUsers() {
    try {
        console.log('--- USUÁRIOS ROTA FÁCIL CRIADOS HOJE ---');

        // Pegar início do dia de hoje em UTC
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // 1. Verificar na tabela user_profiles (que tem created_at no Rota Fácil)
        const { data: recentProfiles, error: errProf } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo, created_at')
            .gte('created_at', todayISO);

        if (errProf) console.error('Erro Perfis:', errProf);
        console.log('Novos Perfis:', recentProfiles);

        if (recentProfiles && recentProfiles.length > 0) {
            const userIds = recentProfiles.map(p => p.user_id);

            // 2. Verificar patrocinador desses novos usuários na tabela usuarios
            const { data: recentUsers, error: errUser } = await supabase
                .from('usuarios')
                .select('id, patrocinador_id')
                .in('id', userIds);

            if (errUser) console.error('Erro Usuarios:', errUser);
            console.log('Dados de Patrocínio dos Novos:', recentUsers);
        }

        // 3. Contagem total de diretos da RS Prólipsi (Primary Root)
        const PRIMARY_ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

        const { count: rsDirects } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', PRIMARY_ROOT_ID);

        const { count: rotaDirects } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', PRIMARY_ROOT_ID);

        console.log(`\nDiretos da RS Prólipsi (ID: ${PRIMARY_ROOT_ID}):`);
        console.log('- Na tabela consultores:', rsDirects);
        console.log('- Na tabela usuarios (Rota):', rotaDirects);
        console.log('- Total esperado na árvore:', (rsDirects || 0) + (rotaDirects || 0));

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkRecentUsers();
