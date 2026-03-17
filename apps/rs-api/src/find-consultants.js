const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findRoot() {
    console.log('--- BUSCANDO CONSULTOR RAIZ ---');

    // 1. Buscar Roberto Camargo
    const { data: roberto } = await supabase.from('consultores').select('*').ilike('nome', '%Roberto%');
    console.log('Roberto Camargo:', JSON.stringify(roberto, null, 2));

    // 2. Buscar Sede
    const { data: sede } = await supabase.from('consultores').select('*').ilike('nome', '%Sede%');
    console.log('Sede RS:', JSON.stringify(sede, null, 2));

    // 3. Buscar por e-mail oficial
    const { data: official } = await supabase.from('consultores').select('*').eq('email', 'rsprolipsioficial@gmail.com');
    console.log('E-mail Oficial:', JSON.stringify(official, null, 2));

    console.log('-------------------------------');
}

findRoot().catch(console.error);
