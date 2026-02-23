
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
ALTER TABLE IF EXISTS public.catalogs 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE IF EXISTS public.download_materials 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID;
`;

async function runFix() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🐘 Conectado ao Postgres. Adicionando colunas faltantes...');
        await client.query(sql);
        console.log('✅ Colunas adicionadas com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao adicionar colunas:', err.message);
    } finally {
        await client.end();
    }
}

runFix();
