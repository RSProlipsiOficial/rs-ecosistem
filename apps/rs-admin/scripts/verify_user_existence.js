
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

async function verifyUsers() {
    const terms = ['rsprolipsiofical@gmail.com', '2343031300185'];
    console.log('[VERIFY] Checking user_profiles for terms:', terms);

    for (const term of terms) {
        let cleanTerm = term;
        if (term.match(/^\d+$/)) {
            // It's a CPF/CNPJ
        }

        console.log(`\n[VERIFY] Searching for: ${term}`);

        // Try exact email
        const resEmail = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${term}&select=*`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        const dataEmail = await resEmail.json();
        console.log(`- Email match: ${dataEmail.length} records found.`);

        // Try exact CPF
        const resCpf = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?cpf=eq.${term}&select=*`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        const dataCpf = await resCpf.json();
        console.log(`- CPF match: ${dataCpf.length} records found.`);

        if (dataEmail.length > 0) console.log('  Data:', dataEmail[0].name, '|', dataEmail[0].email, '|', dataEmail[0].cpf);
        if (dataCpf.length > 0) console.log('  Data:', dataCpf[0].name, '|', dataCpf[0].email, '|', dataCpf[0].cpf);
    }
}

verifyUsers();
