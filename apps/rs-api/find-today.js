const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findToday() {
    const tables = [
        'usuarios', 'user_profiles', 'consultores', 'apps_vendidos',
        'vans', 'vans_rotas', 'alunos', 'mensalidades', 'perfil_usuario'
    ];

    const dateColumns = ['created_at', 'criado_em', 'updated_at', 'data_criacao'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log('--- BUSCANDO REGISTROS DE HOJE ---');
    console.log('Referência:', todayISO);

    for (const t of tables) {
        for (const col of dateColumns) {
            try {
                const { data, error } = await supabase
                    .from(t)
                    .select('*')
                    .gte(col, todayISO)
                    .limit(5);

                if (!error && data && data.length > 0) {
                    console.log(`[!] Encontrado em [${t}.${col}]:`, data.length, 'registros');
                    console.log('Exemplo:', data[0]);
                }
            } catch (e) {
                // Silently skip if column doesn't exist
            }
        }
    }
    console.log('--- FIM DA BUSCA ---');
}

findToday();
