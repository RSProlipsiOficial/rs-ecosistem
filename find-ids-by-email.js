const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const email = 'rsprolipsioficial@gmail.com';
    const { data, error } = await supabase
        .from('consultores')
        .select('id, nome, username, email')
        .eq('email', email);

    if (error) {
        console.error('Erro:', error.message);
        return;
    }

    console.log(`--- IDs VINCULADOS AO EMAIL: ${email} ---`);
    data.forEach(c => console.log(`- ID: ${c.id} | Nome: ${c.nome} | User: ${c.username}`));

    // Também verificar joziana para ver por que ela estava na hierarquia
    const { data: joziana } = await supabase
        .from('consultores')
        .select('id, nome, email')
        .ilike('nome', '%joziana%');

    console.log('\n--- DADOS JOZIANA ---');
    joziana.forEach(j => console.log(`- ID: ${j.id} | Nome: ${j.nome} | Email: ${j.email}`));
}

run();
