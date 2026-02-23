
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function verifyUsers() {
    const terms = ['rsprolipsiofical@gmail.com', '2343031300185'];
    console.log('[VERIFY] Checking user_profiles for terms and variants...');

    for (const term of terms) {
        console.log(`\n[VERIFY] Querying for: ${term}`);

        // Exact
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?or=(email.eq.${term},cpf.eq.${term})&select=*`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        const data = await res.json();
        console.log(`- Exact match: ${Array.isArray(data) ? data.length : 0} records.`);

        // Partial/Typo variants
        let ilike = term;
        if (term.includes('@')) {
            ilike = term.split('@')[0].slice(0, 10) + '%';
        } else {
            ilike = term.slice(0, -2) + '%';
        }

        const resTypo = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?or=(email.ilike.${ilike},cpf.ilike.${ilike})&select=*&limit=5`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        const dataTypo = await resTypo.json();
        console.log(`- Similar matches (ilike ${ilike}): ${Array.isArray(dataTypo) ? dataTypo.length : 0}`);
        if (Array.isArray(dataTypo)) {
            dataTypo.forEach(u => console.log(`  -> Found: ${u.name} | ${u.email} | ${u.cpf}`));
        }
    }
}

verifyUsers();
