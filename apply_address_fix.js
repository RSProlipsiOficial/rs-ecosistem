const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function applyMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Conectando ao Supabase...');
        await client.connect();

        const sql = fs.readFileSync('supabase/migrations/20260128_add_address_to_user_profiles.sql', 'utf8');
        console.log('Executando migração de endereço...');
        await client.query(sql);
        console.log('Migração concluída com sucesso!');
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

applyMigration();
