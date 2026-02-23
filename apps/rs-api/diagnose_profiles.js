const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('--- Diagnóstico de Triggers em user_profiles ---');

    // SQL para listar triggers sem ponto e vírgula interno que quebra o EXECUTE
    const sql = `
    SELECT 
        trigger_name, 
        event_manipulation, 
        event_object_table, 
        action_statement, 
        action_orientation, 
        action_timing
    FROM information_schema.triggers
    WHERE event_object_table = 'user_profiles'
  `;

    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.error('Erro ao executar RPC execute_sql:', error);
            return;
        }

        console.log('Triggers encontrados:');
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error('Erro inesperado:', err.message);
    }
}

diagnose();
