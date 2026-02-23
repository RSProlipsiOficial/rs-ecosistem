const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatrixHierarchy() {
    try {
        // 1. Root Principal
        const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

        // 2. Buscar indicados diretos ordenados por data ou ordem de cadastro
        const { data: directs } = await supabase
            .from('consultores')
            .select('id, nome, email, created_at, patrocinador_id')
            .eq('patrocinador_id', rootId)
            .order('created_at', { ascending: true });

        console.log(`--- HIERARQUIA MATRIZ PROLIPSI (ROOT) ---`);
        console.log(`Total indicados diretos: ${directs?.length}`);

        if (directs) {
            directs.forEach((d, i) => {
                console.log(`${i + 1}. ${d.nome} | ID: ${d.id}`);
            });
        }

        // 3. Verificar se existe alguém em Rota Fácil (Allana) que deveria ser direto
        const allanaId = 'cb7cd76b-e627-4923-9bdb-dad0e1c3b942';
        const { data: allana } = await supabase.from('user_profiles').select('*').eq('id', allanaId).single();
        if (allana) {
            console.log(`\nAllana (Aryn) Sponsor No Banco Rota: ${allana.sponsor_id}`);
        }

    } catch (error) {
        console.error(error);
    }
}

checkMatrixHierarchy();
