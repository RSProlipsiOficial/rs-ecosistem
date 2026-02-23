const { createClient } = require('@supabase/supabase-js');

const URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(URL, KEY);

async function checkCentralSchema() {
    const { data: columns, error } = await supabase.rpc('inspect_table', { table_name_input: 'user_profiles' });

    if (error) {
        // Fallback se rpc não existir
        console.log("RPC falhou, tentando query direta...");
        const { data, error: qError } = await supabase.from('user_profiles').select('*').limit(1);
        if (data && data.length > 0) {
            console.log("Colunas encontradas:", Object.keys(data[0]));
        } else {
            console.log("Tabela vazia ou erro:", qError);
        }
    } else {
        console.log("Colunas:", columns);
    }
}

checkCentralSchema();
