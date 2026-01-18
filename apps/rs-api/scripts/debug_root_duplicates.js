
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const EMAIL = 'rsprolipsioficial@gmail.com';
    const { data, error } = await supabase.from('consultores').select('id, nome, email, pin_atual').eq('email', EMAIL);
    console.log('Rows with email:', data);

    const { data: byId } = await supabase.from('consultores').select('id, nome, email').eq('id', 'ab3c3567-69f4-4af8-9261-6d452d7a96dc');
    console.log('Row by Old ID:', byId);
}
check();
