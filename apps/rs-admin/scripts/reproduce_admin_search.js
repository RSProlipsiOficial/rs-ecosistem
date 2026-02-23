
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

async function reproduceSearch() {
    const term = '23430313000185';
    console.log(`[REPRO] Searching for term: ${term}`);

    const cleanTerm = term.replace(/\D/g, '');
    console.log(`[REPRO] Clean term: ${cleanTerm}`);

    console.log('[REPRO] Attempting search in user_profiles with ANON key via REST API...');

    // Constructing the query URL
    // .or(`document.eq.${cleanTerm},cpf.eq.${cleanTerm}`)
    // In REST: or=(document.eq.VALUE,cpf.eq.VALUE)
    const orQuery = `(document.eq.${cleanTerm},cpf.eq.${cleanTerm})`;
    const url = `${SUPABASE_URL}/rest/v1/user_profiles?select=*&or=${orQuery}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`[REPRO] ❌ Error ${response.status}: ${text}`);
            return;
        }

        const data = await response.json();
        console.log(`[REPRO] ✅ Success. Found ${data.length} records.`);
        if (data.length === 0) {
            console.log('[REPRO] ⚠️ No records found. This indicates RLS blocking or data missing.');
        } else {
            console.log('[REPRO] Data:', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('[REPRO] ❌ Network Error:', err);
    }
}

reproduceSearch();
