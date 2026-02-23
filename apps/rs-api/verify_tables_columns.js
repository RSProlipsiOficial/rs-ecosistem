
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const tables = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];

    console.log('Verificando colunas tenant_id nas tabelas...');

    for (const table of tables) {
        try {
            // Tenta selecionar tenant_id de 1 registro (limit 0 não funciona pra verificar erro de coluna em alguns casos, mas select deve falhar se coluna não existe)
            const { data, error } = await supabase.from(table).select('tenant_id').limit(1);

            if (error) {
                console.error(`[${table}] Erro:`, error.message);
            } else {
                console.log(`[${table}] Coluna tenant_id EXISTE.`);
            }
        } catch (e) {
            console.error(`[${table}] Exceção:`, e.message);
        }
    }
}

checkColumns();
