import fs from 'node:fs';
import path from 'node:path';

// Manual .env parsing
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

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

async function checkDuplicates() {
    console.log('Fetching duplicates from Edge Function...');
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'x-diagnostic-secret': 'antigravity-diag-2024'
        },
        body: JSON.stringify({ action: 'find-duplicates' })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error:', response.status, errorText);
        return;
    }

    const data = await response.json();

    if (data.duplicates && data.duplicates.length > 0) {
        console.log('\n--- DUPLICATE RECORDS FOUND ---\n');
        data.duplicates.forEach((dup, index) => {
            console.log(`${index + 1}. Duplicate ${dup.type.toUpperCase()}: ${dup.value}`);
            dup.users.forEach(u => {
                console.log(`   - [ID: ${u.id}] ${u.name} (${u.email})`);
            });
            console.log('');
        });
        console.log('-------------------------------\n');
        console.log('NOTE: Multiple entries for the same value mean more than 1 duplicate.');
    } else {
        console.log('No duplicates found.');
    }
}

checkDuplicates().catch(err => console.error('Fatal:', err));
