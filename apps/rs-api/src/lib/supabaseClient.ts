import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.dir({
  event: 'Supabase Initialization',
  url: supabaseUrl?.substring(0, 25),
  hasKey: !!supabaseKey,
  keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'OTHER'
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_*KEY devem estar definidos no .env');
}

// Client padrão (pode ser Anon ou Service dependendo do env)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Client Administrativo (Privilegiado - Bypasses RLS)
// FORÇA o uso da Service Role Key para operações de backend
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations may fail due to RLS.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
