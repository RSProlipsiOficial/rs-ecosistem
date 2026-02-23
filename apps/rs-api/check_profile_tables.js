const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    console.log("Verificando tabelas...");

    const candidates = [
        'rs_drop_sellers',
        'drop_sellers',
        'sellers',
        'marketplace_sellers',
        'mp_sellers',
        'rs_market_profiles',
        'user_profiles'
    ];

    for (const table of candidates) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`[❌] ${table}: Não existe ou erro (${error.code})`);
        } else {
            console.log(`[✅] ${table}: Existe (${count} registros)`);
        }
    }
}

checkTables();
