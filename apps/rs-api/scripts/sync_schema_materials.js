
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- CATALOGS
ALTER TABLE IF EXISTS public.catalogs 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'file',
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- DOWNLOAD MATERIALS
ALTER TABLE IF EXISTS public.download_materials 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'file',
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50);
`;

async function runFix() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🐘 Conectado ao Postgres. Sincronizando colunas faltantes (source_type, etc)...');
        await client.query(sql);
        console.log('✅ Sincronização de esquema concluída!');
    } catch (err) {
        console.error('❌ Erro na sincronização:', err.message);
    } finally {
        await client.end();
    }
}

runFix();
