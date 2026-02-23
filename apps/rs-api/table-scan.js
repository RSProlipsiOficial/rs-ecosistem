const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listEverything() {
    try {
        // Como não podemos listar tabelas diretamente via JS client facilmente sem RPC,
        // vamos tentar as que já conhecemos e algumas prováveis.
        const tables = [
            'usuarios', 'user_profiles', 'consultores', 'apps_vendidos',
            'admins', 'admin_emails', 'vans', 'owners', 'profiles'
        ];

        console.log('--- SCAN DE TABELAS ---');
        for (const t of tables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!error) {
                console.log(`Tabela [${t}]: ${count} registros`);
            } else {
                // console.log(`Tabela [${t}]: não encontrada ou erro`);
            }
        }

        // Buscar o e-mail 'matheusdorneles2804@gmail.com' em TODAS as tabelas de perfil possíveis
        console.log('\n--- BUSCANDO MATHEUS ---');
        const searchEmail = 'matheusdorneles2804@gmail.com';

        const { data: cMatheus } = await supabase.from('consultores').select('*').eq('email', searchEmail);
        console.log('Em Consultores:', cMatheus?.length ? 'SIM' : 'NÃO');

        const { data: pMatheus } = await supabase.from('user_profiles').select('*').eq('email', searchEmail);
        console.log('Em User Profiles (Rota Fácil):', pMatheus?.length ? 'SIM' : 'NÃO');

        const { data: prMatheus } = await supabase.from('profiles').select('*').eq('user_id', cMatheus?.[0]?.user_id || 'x');
        console.log('Em Profiles:', prMatheus?.length ? 'SIM' : 'NÃO');

    } catch (error) {
        console.error('Erro:', error);
    }
}

listEverything();
