
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function inspectProduct() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) console.error(error);
    else console.log(JSON.stringify(data[0], null, 2));
}

inspectProduct();
