
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuery() {
    try {
        const { data, count, error } = await supabase
            .from('consultores')
            .select('*', { count: 'exact' });

        if (error) throw error;
        console.log('Total Consultants Count:', count);
        console.log('First 2 consultants:', data.slice(0, 2).map(c => ({ id: c.id, nome: c.nome, status: c.status })));
    } catch (err) {
        console.error('Query failed:', err.message);
    }
}

testQuery();
