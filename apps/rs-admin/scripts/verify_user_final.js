
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function verifyUsers() {
    try {
        console.log('[VERIFY] Searching for possible "correct" records...');

        // Search for partial variants
        const variants = ['rsprolipsio%', '23430313%', 'RS PR%'];

        for (const variant of variants) {
            console.log(`\n[VERIFY] Querying ilike: ${variant}`);
            const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?or=(email.ilike.${variant},cpf.ilike.${variant},name.ilike.${variant})&select=*&limit=10`, {
                headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                console.log(`- Found ${data.length} records.`);
                data.forEach(u => console.log(`  -> [MATCH] Name: ${u.name} | Email: ${u.email} | CPF: ${u.cpf} | ID: ${u.id}`));
            } else {
                console.error(`- Error for variant ${variant}:`, data);
            }
        }
    } catch (e) {
        console.error('[VERIFY] Fatal error:', e);
    }
}

verifyUsers();
