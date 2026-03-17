const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findIds() {
    const ids = ['5a77754b-3cf0-46ab-adc9-cf9db7e479c4', 'b65a9c2a-e4e7-4f08-9058-6abb10077e08'];
    const { data: consultores } = await supabase.from('consultores').select('id, nome, email, username').in('id', ids);
    console.log(JSON.stringify(consultores, null, 2));

    // Também buscar Oseias, Marisane, Rosely e Julio para ver seus IDs
    const names = ['Oseias Silva', 'Marisane Antunes de lima', 'Rosely Monteiro', 'Júlio Galvão'];
    const { data: others } = await supabase.from('consultores').select('id, nome').in('nome', names);
    console.log('\n--- OUTROS IDS ---');
    console.log(JSON.stringify(others, null, 2));
}

findIds().catch(console.error);
