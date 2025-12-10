
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('Checking for missing stores...');

    // Get all consultants
    const { data: consultants, error } = await supabase
        .from('consultores')
        .select('id, nome, email');

    if (error) {
        console.error('Error fetching consultants:', error);
        return;
    }

    console.log(`Found ${consultants.length} consultants.`);

    let createdCount = 0;

    for (const c of consultants) {
        // Check if store exists
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('consultant_id', c.id)
            .maybeSingle();

        if (!store) {
            // Create store
            const cleanName = c.nome.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const referralCode = `${cleanName}${Math.floor(Math.random() * 1000)}`;
            
            const { error: insertError } = await supabase.from('stores').insert({
                consultant_id: c.id,
                name: `Loja de ${c.nome}`,
                referral_code: referralCode,
                referral_link: `https://loja.rsprolipsi.com.br/invite/${referralCode}`,
                affiliate_link: `https://rsprolipsi.com.br/cadastro?ref=${referralCode}`
            });

            if (insertError) {
                console.error(`Failed to create store for ${c.nome}:`, insertError.message);
            } else {
                createdCount++;
                // console.log(`Created store for ${c.nome}`);
            }
        }
    }

    console.log(`Finished. Created ${createdCount} missing stores.`);
}

main();
