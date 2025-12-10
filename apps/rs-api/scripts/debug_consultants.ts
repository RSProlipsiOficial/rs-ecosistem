
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
  console.log('Checking consultores table...');
  const { data, error, count } = await supabase
    .from('consultores')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting:', error);
  } else {
    console.log('Total rows:', count);
  }

  const { data: rows, error: err2 } = await supabase
    .from('consultores')
    .select('*')
    .limit(1);

  if (err2) {
    console.error('Error selecting:', err2);
  } else {
    console.log('First row columns:', rows && rows.length > 0 ? Object.keys(rows[0]) : 'No rows');
    if (rows && rows.length > 0) console.log('First row:', rows[0]);
  }
}

debug();
