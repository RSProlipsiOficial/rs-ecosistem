
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'g:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-api\\.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const officialPins = [
    { name: 'Bronze', display_order: 5, required_personal_recruits: 0, benefits: '—', required_pv: 1350 },
    { name: 'Prata', display_order: 15, required_personal_recruits: 1, benefits: '100 %', required_pv: 4050 },
    { name: 'Ouro', display_order: 70, required_personal_recruits: 1, benefits: '100 %', required_pv: 18900 },
    { name: 'Safira', display_order: 150, required_personal_recruits: 2, benefits: '60 / 40', required_pv: 40500 },
    { name: 'Esmeralda', display_order: 300, required_personal_recruits: 2, benefits: '60 / 40', required_pv: 81000 },
    { name: 'Topázio', display_order: 500, required_personal_recruits: 2, benefits: '60 / 40', required_pv: 135000 },
    { name: 'Rubi', display_order: 750, required_personal_recruits: 3, benefits: '50 / 30 / 20', required_pv: 202500 },
    { name: 'Diamante', display_order: 1500, required_personal_recruits: 3, benefits: '50 / 30 / 20', required_pv: 405000 },
    { name: 'Duplo Diamante', display_order: 3000, required_personal_recruits: 4, benefits: '40 / 30 / 20 / 10', required_pv: 1845000 },
    { name: 'Triplo Diamante', display_order: 5000, required_personal_recruits: 5, benefits: '35 / 25 / 20 / 10 / 10', required_pv: 3645000 },
    { name: 'Diamante Red', display_order: 15000, required_personal_recruits: 6, benefits: '30 / 20 / 18 / 12 / 10 / 10 / 1', required_pv: 6750000 },
    { name: 'Diamante Blue', display_order: 25000, required_personal_recruits: 6, benefits: '30 / 20 / 18 / 12 / 10 / 10 / 1', required_pv: 10530000 },
    { name: 'Diamante Black', display_order: 50000, required_personal_recruits: 6, benefits: '30 / 20 / 18 / 12 / 10 / 10 / 1', required_pv: 13500000 }
];

async function ensurePins() {
    console.log('Ensuring 13 Official PINs in DB...');

    for (const pin of officialPins) {
        // Try to find by display_order
        const { data: existing, error: findError } = await supabase
            .from('career_levels')
            .select('*')
            .eq('display_order', pin.display_order)
            .maybeSingle();

        if (findError) {
            console.error(`Error finding pin ${pin.name}:`, findError);
            continue;
        }

        const payload = {
            name: pin.name,
            code: pin.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            display_order: pin.display_order,
            required_personal_recruits: pin.required_personal_recruits,
            required_team_volume: 0, // Not used for now, using benefits for VMEC string
            benefits: pin.benefits,
            required_pv: pin.required_pv,
            bonus_percentage: 0,
            is_active: true
        };

        if (existing) {
            console.log(`Updating ${pin.name} (ID: ${existing.id})...`);
            const { error: updateError } = await supabase
                .from('career_levels')
                .update(payload)
                .eq('id', existing.id);

            if (updateError) console.error(`Error updating ${pin.name}:`, updateError);
        } else {
            console.log(`Creating ${pin.name}...`);
            const { error: insertError } = await supabase
                .from('career_levels')
                .insert([payload]);

            if (insertError) console.error(`Error inserting ${pin.name}:`, insertError);
        }
    }

    // Remove unofficial pins
    const officialOrders = officialPins.map(p => p.display_order);
    console.log('Removing unofficial pins...');
    const { error: deleteError } = await supabase
        .from('career_levels')
        .delete()
        .not('display_order', 'in', `(${officialOrders.join(',')})`);

    if (deleteError) {
        console.error('Error removing unofficial pins:', deleteError);
    } else {
        console.log('Unofficial pins removed.');
    }

    console.log('Done!');
}

ensurePins();
