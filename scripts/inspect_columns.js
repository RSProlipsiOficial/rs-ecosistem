
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/rs-api/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspect() {
    console.log('🕵️ Inspecting consultores table...');

    // Try to select columns one by one
    const columns = ['nome', 'email', 'telefone', 'cpf', 'username', 'codigo_consultor', 'patrocinador_id', 'pin_atual', 'status', 'address', 'cidade', 'estado'];

    for (const col of columns) {
        const { data, error } = await supabase.from('consultores').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}': MISSING (${error.message})`);
        } else {
            console.log(`✅ Column '${col}': EXISTS`);
        }
    }
}

inspect();
