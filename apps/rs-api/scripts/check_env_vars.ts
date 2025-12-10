
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Env vars loaded.');
console.log('SUPABASE_URL:', !!process.env.SUPABASE_URL);
console.log('DATABASE_URL:', !!process.env.DATABASE_URL);
