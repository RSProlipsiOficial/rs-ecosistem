
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function getProduct() {
    // Removido price_final pois não existe na tabela products segundo o erro anterior
    const { data, error } = await supabase.from('products').select('id, name, price').limit(1);
    if (error) console.error(JSON.stringify(error, null, 2));
    else console.log(JSON.stringify(data[0]));
}

getProduct();
