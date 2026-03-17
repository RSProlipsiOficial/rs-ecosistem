const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findIdsByEmail() {
    const emails = ['emclaro@hotmail.com', 'sidnalvambcamargo@gmail.com', 'rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];
    const { data: consultores } = await supabase.from('consultores').select('id, nome, email, username').in('email', emails);
    console.log(JSON.stringify(consultores, null, 2));

    const sedeId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const { data: downlines } = await supabase.from('downlines').select('downline_id, nivel, linha').eq('upline_id', sedeId);
    console.log('\n--- DOWNLINES DE SEDE RS ---');
    console.log(JSON.stringify(downlines, null, 2));
}

findIdsByEmail().catch(console.error);
