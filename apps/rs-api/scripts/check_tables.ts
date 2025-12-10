
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkTables() {
    const tables = ['consultores', 'wallets', 'orders', 'cycle_events', 'stores'];
    
    for (const t of tables) {
        try {
            const { error } = await supabase.from(t).select('*').limit(1);
            if (error) {
                console.log(`Table '${t}' ERROR: ${error.message}`);
            } else {
                console.log(`Table '${t}' exists.`);
            }
        } catch (e: any) {
            console.log(`Table '${t}' EXCEPTION: ${e.message}`);
        }
    }
}

checkTables();
