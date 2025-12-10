
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

if (!process.env.SUPABASE_URL) dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkColumns() {
    // We can't query information_schema easily via JS client usually, but we can try to select * limit 1
    const { data, error } = await supabase.from('career_levels').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample Row:', data[0]);
    } else {
        console.log('Table empty, inserting a dummy to check keys...');
        const { data: insData, error: insError } = await supabase.from('career_levels').insert({
            name: 'SCHEMA_PROBE',
            code: 'PROBE',
            is_active: false
        }).select();

        if (insError) {
            console.log('Insert failed (likely constraints):', insError.message);
            // Try to deduce from error or try minimal insert
        } else {
            console.log('Columns:', Object.keys(insData[0]));
            await supabase.from('career_levels').delete().eq('id', insData[0].id);
        }
    }
}

checkColumns();
