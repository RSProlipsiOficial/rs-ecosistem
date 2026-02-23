const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAryn() {
    try {
        const { data: cons } = await supabase
            .from('consultores')
            .select('id, nome, email')
            .eq('email', 'xtntplay@gmail.com');

        console.log('Aryn em Consultores:', cons);
    } catch (error) {
        console.error(error);
    }
}

checkAryn();
