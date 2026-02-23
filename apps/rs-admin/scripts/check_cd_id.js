
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function checkCdId() {
    console.log('[CHECK_ADMIN] Fetching one record from minisite_profiles to check for cd_id...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/minisite_profiles?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                const keys = Object.keys(data[0]);
                console.log('[CHECK_ADMIN] minisite_profiles columns:', keys.join(', '));
                if (keys.includes('cd_id')) {
                    console.log('[CHECK_ADMIN] ✅ cd_id column exists.');
                } else {
                    console.log('[CHECK_ADMIN] ❌ cd_id column MISSING.');
                }
            } else {
                console.log('[CHECK_ADMIN] minisite_profiles is empty.');
            }
        } else {
            console.error('[CHECK_ADMIN] Error minisite_profiles:', await res.text());
        }
    } catch (e) { console.error(e); }
}

checkCdId();
