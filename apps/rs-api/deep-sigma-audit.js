const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepSigmaAudit() {
    try {
        console.log('--- AUDITORIA DE CICLOS E MATRIZES ---');

        // 1. Ver estrutura da tabela matrix_positions
        const { data: pos, error: errP } = await supabase.from('matrix_positions').select('*').limit(10);
        if (errP) console.log('Tabela matrix_positions não disponível ou erro:', errP.message);
        else console.log('Amostra matrix_positions:', pos);

        // 2. Ver estrutura da tabela cycles
        const { data: cycles, error: errC } = await supabase.from('cycles').select('*').limit(5);
        if (errC) console.log('Tabela cycles não disponível ou erro:', errC.message);
        else console.log('Amostra cycles:', cycles);

        // 3. Buscar Robert (Líder exemplo) para ver seus ganhos/ciclos
        const { data: robert } = await supabase.from('consultores').select('id, nome').ilike('nome', '%Robert%').limit(1);

        if (robert && robert.length > 0) {
            console.log(`\nLíder Robert: ${robert[0].nome} (${robert[0].id})`);

            // Ver eventos de ciclo para ele
            const { data: events } = await supabase
                .from('cycle_events')
                .select('*')
                .eq('consultor_id', robert[0].id)
                .limit(5);
            console.log('Eventos de Ciclo do Robert:', events);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

deepSigmaAudit();
