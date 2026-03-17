const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    const sedeId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const robertoId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

    console.log('--- CICLOS SEDE RS ---');
    const { data: sedeCycles } = await supabase.from('matriz_cycles').select('*').eq('consultor_id', sedeId);
    console.log(JSON.stringify(sedeCycles, null, 2));

    console.log('\n--- CICLOS ROBERTO ---');
    const { data: robertoCycles } = await supabase.from('matriz_cycles').select('*').eq('consultor_id', robertoId);
    console.log(JSON.stringify(robertoCycles, null, 2));
}

verify().catch(console.error);
