const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function readAdmins() {
    try {
        const { data, error } = await supabase
            .from('admin_emails')
            .select('*');

        console.log('--- ADMIN EMAILS ---');
        console.log(data);
        console.log('--------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

readAdmins();
