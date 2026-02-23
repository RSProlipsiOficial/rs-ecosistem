const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTheMissingOne() {
    try {
        console.log('--- AUDITANDO ÚLTIMOS CADASTROS ---');

        // 1. Ver quem é a RAÍZ REAL da árvore RS no banco
        const { data: rootSearch } = await supabase
            .from('consultores')
            .select('id, nome')
            .ilike('nome', '%PRÓLIPSI%')
            .limit(5);
        console.log('Possíveis Roots RS:', rootSearch);

        // 2. Últimos cadastros na tabela CONSULTORES
        const { data: lastCons, error: errC } = await supabase
            .from('consultores')
            .select('id, nome, email, patrocinador_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        console.log('\nÚltimos 5 em Consultores:', lastCons);

        // 3. Últimos cadastros na tabela USUARIOS (Rota Fácil)
        const { data: lastUsers, error: errU } = await supabase
            .from('usuarios')
            .select('id, patrocinador_id')
            .limit(5); // Usuarios não parece ter created_at, vamos ver perfis

        const { data: lastProfs, error: errP } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        console.log('\nÚltimos 5 em Perfis Rota Fácil:', lastProfs);

        if (lastProfs && lastProfs.length > 0) {
            const lastIds = lastProfs.map(p => p.user_id);
            const { data: details } = await supabase
                .from('usuarios')
                .select('id, patrocinador_id')
                .in('id', lastIds);
            console.log('Patrocinadores desses perfis:', details);
        }

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

findTheMissingOne();
