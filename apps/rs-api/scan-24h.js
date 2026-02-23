const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function scanNewRecords() {
    const tables = [
        'usuarios', 'user_profiles', 'consultores', 'apps_vendidos',
        'vans', 'alunos', 'mensalidades', 'perfil_usuario', 'auth.users'
    ];

    // Últimas 24 horas
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    console.log('--- SCAN DE REGISTROS (ÚLTIMAS 24H) ---');
    console.log('Início:', yesterday);

    for (const t of tables) {
        try {
            // Tentar colunas comuns
            const cols = ['created_at', 'criado_em', 'updated_at', 'data_cadastro'];
            for (const col of cols) {
                const { data, error } = await supabase
                    .from(t)
                    .select('*')
                    .gte(col, yesterday)
                    .limit(5);

                if (!error && data && data.length > 0) {
                    console.log(`[FOUND] ${t}.${col}:`, data.length, 'regs');
                    console.log(data[0]);
                }
            }
        } catch (e) { }
    }

    // Verificar se existem novos usuários em auth (via consulta indireta se houver triggers)
    // Mas como sumbe ao frontend, vamos focar em tabelas de negócio
    console.log('--- FIM DO SCAN ---');
}

scanNewRecords();
