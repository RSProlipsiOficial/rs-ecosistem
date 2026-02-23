
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testV1Query() {
    try {
        console.log('Testing V1 Query...');
        const { data: consultants, error } = await supabase
            .from('consultores')
            .select('*')
            .ilike('nome', '%Rota oficial%')
            .limit(1);

        if (error) {
            console.error('❌ V1 Query Error:', error);
        } else {
            console.log('✅ V1 Query Success!');
            console.log('Total found:', consultants.length);
            if (consultants.length > 0) {
                console.log('Sample data:', JSON.stringify(consultants[0], null, 2));
            }
        }
    } catch (err) {
        console.error('Fatal error:', err);
    }
}

testV1Query();
