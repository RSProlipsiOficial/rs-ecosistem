const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    user: 'postgres.rptkhrboejbwexseikuo',
    host: 'db.rptkhrboejbwexseikuo.supabase.co',
    database: 'postgres',
    password: 'Yannis784512@',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados Supabase.');

        const migrationPath = path.resolve(__dirname, './create_logistic_tables.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('⏳ Executando migração 007-cd-management.sql...');
        await client.query(sql);
        console.log('✅ Migração concluída com sucesso!');

        // Adicionar também a coluna status em minisite_profiles por compatibilidade imediata
        console.log('⏳ Garantindo coluna status em minisite_profiles...');
        await client.query(`
            ALTER TABLE minisite_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
            COMMENT ON COLUMN minisite_profiles.status IS 'Status do perfil de minisite/CD (active/blocked)';
        `);
        console.log('✅ Colunsa status garantida!');

    } catch (err) {
        console.error('❌ Erro na migração:', err.message);
        if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
            console.log('💡 Dica: Verifique se o host/porta estão corretos ou se há restrição de firewall.');
        }
    } finally {
        await client.end();
    }
}

runMigration();
