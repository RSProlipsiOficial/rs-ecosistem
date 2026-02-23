
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Credenciais do banco (extraídas do histórico anterior)
const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function applySql() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🚀 Conectado ao Postgres. Aplicando SQL de Carreira Digital...');

        const sqlPath = path.join(__dirname, '../career_levels_digital_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);

        console.log('✅ SQL aplicado com sucesso!');
        console.log('RLS, Políticas e Grants configurados para public.career_levels_digital');

    } catch (err) {
        console.error('❌ Erro ao aplicar SQL:', err.message);
    } finally {
        await client.end();
    }
}

applySql();
