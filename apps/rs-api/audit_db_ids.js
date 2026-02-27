const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabase() {
    console.log('--- AUDITORIA DE IDS DO ECOSSISTEMA RS ---');

    const tablesToAudit = [
        'minisite_profiles',
        'user_profiles',
        'leads',
        'tracking_pixels',
        'app_configs',
        'orders',
        'cd_profiles',
        'sigma_users',
        'commissions',
        'withdrawals',
        'products',
        'registrations'
    ];

    const results = {};

    for (const tableName of tablesToAudit) {
        try {
            // console.log(`\nAuditando tabela: ${tableName}`);
            const { data: sample, error: sampleError } = await supabase.from(tableName).select('*').limit(1);

            if (sampleError) {
                // console.error(`Erro ao ler tabela ${tableName}:`, sampleError.message);
                continue;
            }

            if (sample && sample.length > 0) {
                const columns = Object.keys(sample[0]);
                const idFields = columns.filter(col => col.toLowerCase().includes('id') || col.toLowerCase().includes('pk'));
                results[tableName] = {
                    columns: columns,
                    idFields: idFields,
                    sample: sample[0]
                };
            } else {
                // Tentar buscar apenas a estrutura de alguma forma
                // results[tableName] = "Tabela vazia";
            }
        } catch (e) {
            console.error(`Erro inesperado na tabela ${tableName}:`, e.message);
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

auditDatabase();
