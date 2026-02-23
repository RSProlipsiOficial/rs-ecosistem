
const { supabase } = require('./src/lib/supabaseClient');
console.log('Direct test - Supabase object exists:', !!supabase);
console.log('Direct test - URL:', process.env.SUPABASE_URL);
