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

async function probe() {
  console.log('🔍 Probing schema types...');

  const probeName = 'PROBE_' + Date.now();

  // Test: Large values in required_pv and required_team_volume
  console.log('Test: Large values');
  const { data, error } = await supabase.from('career_levels').insert([{
    name: probeName,
    code: 'TEST_LARGE',
    required_pv: 24000, // Try large number
    required_team_volume: 50000, // Try large number
    required_personal_recruits: 10,
    bonus_percentage: 0, // Keep small
    display_order: 1,
    is_active: true
  }]).select();

  if (error) {
    console.log('❌ Large Value Failed:', error.message);
  } else {
    console.log('✅ Large Value Success!');
    await supabase.from('career_levels').delete().eq('id', data[0].id);
  }
}

probe();
