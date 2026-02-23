const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findSigmaLogic() {
    try {
        const sigmaTables = [
            'sigma_accumulators', 'sigma_bonus_rules', 'sigma_global_pool',
            'operational_rules', 'marketing_plan', 'system_config'
        ];

        console.log('--- BUSCANDO LÓGICA SIGMA ---');
        for (const t of sigmaTables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!error) {
                console.log(`Tabela [${t}]: ${count} registros`);
                const { data } = await supabase.from(t).select('*').limit(3);
                console.log('Exemplo:', data);
            }
        }

        // Tentar descobrir em qual tabela os "seis abaixo" de 1+6 ficam salvos.
        // Pode estar em downlines com algum filtro ou atributo.
        const { data: downlines, error: errD } = await supabase
            .from('downlines')
            .select('*')
            .limit(5);

        if (!errD) {
            console.log('\nAmostra de downlines:', downlines);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

findSigmaLogic();
