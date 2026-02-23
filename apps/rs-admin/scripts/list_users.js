
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function listUsers() {
    try {
        console.log('[LIST] Fetching users from user_profiles...');
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=name,email,cpf,id&limit=50`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            console.log(`[LIST] Found ${data.length} users:`);
            data.forEach(u => {
                console.log(`- ${u.name} | ${u.email} | ${u.cpf}`);
            });
        } else {
            console.error('[LIST] Error:', data);
        }
    } catch (e) { console.error(e); }
}

listUsers();
