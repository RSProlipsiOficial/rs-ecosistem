
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Erro: SUPABASE_URL ou KEY não encontradas');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- BUSCANDO VALORES ÚNICOS ---');

    const { data: pins } = await supabase.from('consultores').select('pin_atual');
    const uniquePins = [...new Set(pins.map(p => p.pin_atual))];
    console.log('PINs encontrados:', uniquePins);

    const { data: status } = await supabase.from('consultores').select('status');
    const uniqueStatus = [...new Set(status.map(s => s.status))];
    console.log('Status encontrados:', uniqueStatus);
}

run();
