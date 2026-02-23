
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function checkColumns() {
    console.log('[COLUMNS] Fetching one record from user_profiles...');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=*&limit=1`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const data = await res.json();
    if (data.length > 0) {
        console.log('[COLUMNS] user_profiles columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('[COLUMNS] user_profiles is EMPTY.');
    }
}

checkColumns();
