import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Fallback
if (!process.env.SUPABASE_URL) dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping:
// required_pv -> Bonus Value (Integer)
// required_team_volume -> VMEC
// required_personal_recruits -> Min Lines
// display_order -> Cycles (Sort Order)
// bonus_percentage -> 0 (Unused due to precision limit)

const initialCareerData = [
    { name: 'Consultor', code: 'consultor', display_order: 0, required_personal_recruits: 0, required_team_volume: 0, required_pv: 0, bonus_percentage: 0, pin_image: '', is_active: true },
    { name: 'VIP', code: 'vip', display_order: 1, required_personal_recruits: 1, required_team_volume: 1000, required_pv: 50, bonus_percentage: 0, pin_image: '', is_active: true },
    { name: 'Bronze', code: 'bronze', display_order: 3, required_personal_recruits: 2, required_team_volume: 3000, required_pv: 150, bonus_percentage: 0, pin_image: '', is_active: true },
    { name: 'Prata', code: 'prata', display_order: 6, required_personal_recruits: 2, required_team_volume: 6000, required_pv: 300, bonus_percentage: 0, pin_image: '', is_active: true },
    { name: 'Ouro', code: 'ouro', display_order: 9, required_personal_recruits: 3, required_team_volume: 12000, required_pv: 600, bonus_percentage: 0, pin_image: '', is_active: true },
    { name: 'Diamante', code: 'diamante', display_order: 12, required_personal_recruits: 4, required_team_volume: 24000, required_pv: 1200, bonus_percentage: 0, pin_image: '', is_active: true },
];

async function seed() {
    console.log('🌱 Seeding career data...');

    // Check if data exists
    const { count } = await supabase.from('career_levels').select('*', { count: 'exact', head: true });

    if (count && count > 0) {
        console.log('⚠️  Data already exists. Clearing and re-seeding to ensure correct structure...');
        await supabase.from('career_levels').delete().neq('id', 0); // Delete all
    }

    const { data, error } = await supabase.from('career_levels').insert(initialCareerData).select();

    if (error) {
        console.error('❌ Error seeding data:', error);
    } else {
        console.log('✅ Data seeded successfully:', data?.length, 'records.');
    }
}

seed();
