require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking DB connection...');
    const { count, error } = await supabase.from('consultores').select('*', { count: 'exact', head: true });

    if (error) {
        console.error('DB Error:', error);
    } else {
        console.log('Consultores count in DB:', count);
    }
}

check();
