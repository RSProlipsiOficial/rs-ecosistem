const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDownlinesRoberto() {
    const userId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // Roberto
    const { data: downlines } = await supabase.from('downlines').select('downline_id, nivel, linha').eq('upline_id', userId).eq('nivel', 1);
    console.log(`\n--- DOWNLINES DE ROBERTO (${userId}) ---`);
    console.log(JSON.stringify(downlines, null, 2));

    if (downlines) {
        const ids = downlines.map(d => d.downline_id);
        const { data: names } = await supabase.from('consultores').select('id, nome').in('id', ids);
        console.log('\n--- NOMES DOS DIRETOS ---');
        console.log(JSON.stringify(names, null, 2));
    }
}

checkDownlinesRoberto().catch(console.error);
