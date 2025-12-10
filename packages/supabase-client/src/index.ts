
import { createClient } from '@supabase/supabase-js';

// Default to process.env or provide a way to inject
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key not found in environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
