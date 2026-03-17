const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectDownlines() {
    const { data, error } = await supabase.from('downlines').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log('Colunas de downlines:', Object.keys(data[0]));
    console.log('Amostra de dados:', data[0]);
}

inspectDownlines().catch(console.error);
