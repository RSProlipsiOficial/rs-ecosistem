const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTheFive() {
    const names = ['Aryn', 'Beto', 'Matheus', 'Rota Fácil', 'RS Prólipsi'];

    console.log('--- BUSCANDO OS 5 PROPRIETÁRIOS ---');

    for (const name of names) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('nome_completo', `%${name}%`);

        if (data && data.length > 0) {
            console.log(`\nEncontrado [${name}]:`, data.length, 'registros');
            data.forEach(p => {
                console.log(`- Nome: ${p.nome_completo} | Empresa: ${p.empresa} | MMN ID: ${p.mmn_id} | ID: ${p.id}`);
            });
        }
    }

    // Verificar quem tem mmn_id preenchido
    const { count: withMMN } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .not('mmn_id', 'is', null);

    console.log('\nTotal com mmn_id preenchido:', withMMN);

    console.log('-----------------------------------');
}

findTheFive();
