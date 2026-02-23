
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoots() {
    console.log('Checking roots (modified query)...');

    // Try to find roots by checking for null sponsor or known root ID
    const { data: roots, error } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id')
        .or('patrocinador_id.is.null');

    if (error) {
        console.error('Error fetching roots:', error);
    } else {
        console.log(`Found ${roots.length} roots (null sponsor):`);
        roots.forEach(r => console.log(`- ${r.nome} (${r.username}) ID: ${r.id}`));
    }
}

checkRoots();
