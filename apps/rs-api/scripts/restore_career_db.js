
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

if (!process.env.SUPABASE_URL) {
    console.error('No SUPABASE_URL found');
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const careerLevels = [
    {
        name: 'Bronze',
        cycles: 5,
        minLines: 0,
        vmec: '—',
        reward: 13.50,
        image: 'https://cdn-icons-png.flaticon.com/512/179/179249.png'
    },
    {
        name: 'Prata',
        cycles: 15,
        minLines: 1,
        vmec: '100 %',
        reward: 40.50,
        image: 'https://cdn-icons-png.flaticon.com/512/179/179251.png'
    },
    {
        name: 'Ouro',
        cycles: 70,
        minLines: 1,
        vmec: '100 %',
        reward: 189.00,
        image: 'https://cdn-icons-png.flaticon.com/512/179/179250.png'
    },
    {
        name: 'Safira',
        cycles: 150,
        minLines: 2,
        vmec: '60 / 40',
        reward: 405.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Esmeralda',
        cycles: 300,
        minLines: 2,
        vmec: '60 / 40',
        reward: 810.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Topázio',
        cycles: 500,
        minLines: 2,
        vmec: '60 / 40',
        reward: 1350.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Rubi',
        cycles: 750,
        minLines: 3,
        vmec: '50 / 30 / 20',
        reward: 2025.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Diamante',
        cycles: 1500,
        minLines: 3,
        vmec: '50 / 30 / 20',
        reward: 4050.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Duplo Diamante',
        cycles: 3000,
        minLines: 4,
        vmec: '40 / 30 / 20 / 10',
        reward: 18450.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Triplo Diamante',
        cycles: 5000,
        minLines: 5,
        vmec: '35 / 25 / 20 / 10 / 10',
        reward: 36450.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Diamante Red',
        cycles: 15000,
        minLines: 6,
        vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1',
        reward: 67500.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Diamante Blue',
        cycles: 25000,
        minLines: 6,
        vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1',
        reward: 105300.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    },
    {
        name: 'Diamante Black',
        cycles: 50000,
        minLines: 6,
        vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1',
        reward: 135000.00,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    }
];

async function restore() {
    console.log('🚀 Starting Career Plan Restore...');

    // 1. Clear existing
    console.log('Clearing existing records...');
    const { error: delError } = await supabase.from('career_levels').delete().gt('display_order', -1);
    if (delError) console.error('Delete error:', delError);
    else console.log('✅ Cleared existing rows');

    // 2. Insert new
    for (const level of careerLevels) {
        const payload = {
            name: level.name,
            code: level.name.toUpperCase().replace(/\s+/g, '_'),
            display_order: level.cycles,
            required_personal_recruits: level.minLines,
            required_team_volume: 0,
            required_pv: Math.round(level.reward * 100), // Store as centavos (integer)
            bonus_percentage: 0,
            benefits: level.vmec,
            pin_image: level.image,
            is_active: true
        };

        const { error } = await supabase.from('career_levels').insert(payload);
        if (error) console.error(`Failed to insert ${level.name}:`, error.message);
        else console.log(`✅ Inserted ${level.name}`);
    }

    console.log('🏁 Restore complete!');
}

restore();
