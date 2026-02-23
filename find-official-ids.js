const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const emails = [
        'rsprolipsioficial@gmail.com',
        'rs.prolipsi.oficial@gmail.com'
    ];

    console.log('--- BUSCANDO CONSULTORES PELOS EMAILS OFICIAIS ---');
    const { data, error } = await supabase
        .from('consultores')
        .select('id, nome, username, email')
        .in('email', emails);

    if (error) {
        console.error('Erro:', error.message);
        return;
    }

    data.forEach(c => console.log(`- ID: ${c.id} | Nome: ${c.nome} | Email: ${c.email}`));

    // Se houver poucos resultados, vamos tentar buscar por nome "RS Prólipsi" para ver o email dela
    const { data: prolipsi } = await supabase
        .from('consultores')
        .select('id, nome, email')
        .ilike('nome', '%Prólipsi%');

    console.log('\n--- VERIFICANDO RS PRÓLIPSI ---');
    prolipsi.forEach(p => console.log(`- ID: ${p.id} | Nome: ${p.nome} | Email: ${p.email}`));
}

run();
