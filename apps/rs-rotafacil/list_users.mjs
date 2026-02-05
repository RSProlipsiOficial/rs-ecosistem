import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

async function listAllUsers() {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-users?all=true`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'x-diagnostic-secret': 'antigravity-diag-2024'
        }
    });

    if (!response.ok) {
        console.error('Error:', response.status, await response.text());
        return;
    }

    const data = await response.json();
    console.log('Total Users:', data.users?.length);

    const targets = data.users.filter(u =>
        u.email?.includes('oficial') ||
        u.nome?.toLowerCase().includes('camargo') ||
        u.nome?.toLowerCase().includes('prolipsi') ||
        u.nome?.toLowerCase().includes('enclaro') ||
        u.nome?.toLowerCase().includes('maxwell')
    );

    console.log(JSON.stringify(targets, null, 2));
}

listAllUsers().catch(console.error);
