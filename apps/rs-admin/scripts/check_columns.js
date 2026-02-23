
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

async function checkColumns() {
    console.log('[CHECK] Fetching one record from user_profiles to inspect keys...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=*&limit=1`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                console.log('[CHECK] user_profiles columns:', Object.keys(data[0]).join(', '));
            } else {
                console.log('[CHECK] user_profiles is empty or RLS blocks read.');
            }
        } else {
            console.error('[CHECK] Error user_profiles:', await res.text());
        }
    } catch (e) { console.error(e); }

    console.log('\n[CHECK] Fetching one record from minisite_profiles to inspect keys...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/minisite_profiles?select=*&limit=1`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                console.log('[CHECK] minisite_profiles columns:', Object.keys(data[0]).join(', '));
            } else {
                console.log('[CHECK] minisite_profiles is empty or RLS blocks read.');
            }
        } else {
            console.error('[CHECK] Error minisite_profiles:', await res.text());
        }
    } catch (e) { console.error(e); }
}

checkColumns();
