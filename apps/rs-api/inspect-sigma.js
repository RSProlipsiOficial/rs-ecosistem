const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSigma() {
    try {
        // 1. Listar tabelas relacionadas a Sigma/Matriz
        const tables = ['sigma_matrix', 'matrix_positions', 'cycles', 'cycle_events'];

        console.log('--- INSPEÇÃO SIGMA ---');
        for (const t of tables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!error) {
                console.log(`Tabela [${t}]: ${count} registros`);
                if (count > 0) {
                    const { data } = await supabase.from(t).select('*').limit(3);
                    console.log('Exemplo:', data);
                }
            }
        }

        // 2. Verificar o Root RS Prólipsi na matriz
        const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
        const { data: rootMatrix } = await supabase
            .from('sigma_matrix')
            .select('*')
            .eq('consultor_id', rootId);

        console.log('\nRoot na Matriz:', rootMatrix);

    } catch (error) {
        console.error('Erro:', error);
    }
}

inspectSigma();
