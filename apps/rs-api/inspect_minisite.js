const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
    console.log('--- Testando RPC execute_sql_central ---');

    const { data, error } = await supabase.rpc('execute_sql_central', {
        sql_query: "SELECT 1 as test;"
    });

    if (error) {
        console.log('❌ RPC execute_sql_central não existe ou falhou:', error.message);
    } else {
        console.log('✅ RPC execute_sql_central existe! Resultado:', data);
    }
}

inspect();
