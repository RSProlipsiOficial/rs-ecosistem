
const axios = require('axios');

async function checkLevels() {
    try {
        console.log('Fetching levels from http://localhost:4000/v1/admin/career/levels...');
        // Note: In a real scenario we need a token, but let's see if we can bypass or if I need to generate one.
        // Actually, the endpoint is protected: router.get('/career/levels', supabaseAuth, requireRole([ROLES.ADMIN]), ...)
        // So I cannot easily curl it without a token.
        
        // Instead, I will use the supabase client directly in a script to query the database, 
        // effectively bypassing the API layer to verify DB content first.
        // If DB has data, then the issue is likely API/Frontend connection.
        
        const { createClient } = require('@supabase/supabase-js');
        require('dotenv').config({ path: 'g:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-api\\.env' });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for this check

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials in .env');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('career_levels')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching data:', error);
        } else {
            console.log(`Found ${data.length} levels in DB:`);
            data.forEach(l => {
                console.log(`- [${l.display_order}] (ID: ${l.id}) ${l.name} | VMEC: ${l.benefits || l.required_team_volume} | Bonus: ${l.required_pv}`);
            });
        }

    } catch (e) {
        console.error(e);
    }
}

checkLevels();
