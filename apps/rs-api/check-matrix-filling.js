const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatrixFilling() {
    try {
        const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

        console.log('--- AUDITANDO PREENCHIMENTO DA MATRIZ ---');

        // 1. Ver indicados diretos do Root em consultores
        const { data: directs, error } = await supabase
            .from('consultores')
            .select('id, nome, email, created_at')
            .eq('patrocinador_id', rootId)
            .order('created_at', { ascending: true });

        console.log(`\nIndicados Diretos do Root (${rootId}):`, directs?.length);
        if (directs) {
            directs.slice(0, 10).forEach((d, i) => {
                console.log(`${i + 1}. ${d.nome} (${d.email}) - Criado em: ${d.created_at}`);
            });
        }

        // 2. Ver se existe algum registro em sigma_accumulators para esses diretos
        if (directs && directs.length > 0) {
            const ids = directs.map(d => d.id);
            const { data: accs } = await supabase
                .from('sigma_accumulators')
                .select('*')
                .in('consultor_id', ids);
            console.log('\nAcumuladores Sigma dos Diretos:', accs?.length);
        }

        // 3. Verificar a "Allana Larissa" (ID: cb7cd76b-e627-4923-9bdb-dad0e1c3b942) na matriz
        // Ela é o "menino" (Dono de Van) que o usuário quer ver ciclando
        const allanaId = 'cb7cd76b-e627-4923-9bdb-dad0e1c3b942';
        const { data: allanaCons } = await supabase.from('consultores').select('*').eq('id', allanaId).single();
        console.log('\nAllana em Consultores:', allanaCons ? 'SIM' : 'NÃO');

    } catch (error) {
        console.error(error);
    }
}

checkMatrixFilling();
