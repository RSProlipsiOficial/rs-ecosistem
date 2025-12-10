/**
 * GARANTIR PERMISSÕES POSTGRES
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function garantirPermissoes() {
    try {
        console.log('🔐 GARANTINDO PERMISSÕES...\n');
        await client.connect();
        
        const tabelas = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        // Garantir que o role 'anon' e 'authenticated' tenham acesso
        for (const tabela of tabelas) {
            console.log(`📝 Configurando: ${tabela}`);
            
            // Grant para anon
            await client.query(`GRANT ALL ON TABLE ${tabela} TO anon;`);
            await client.query(`GRANT ALL ON TABLE ${tabela} TO authenticated;`);
            await client.query(`GRANT ALL ON TABLE ${tabela} TO service_role;`);
            await client.query(`GRANT ALL ON TABLE ${tabela} TO postgres;`);
            
            console.log(`  ✅ ${tabela}: Permissões concedidas\n`);
        }
        
        console.log('✅ PERMISSÕES GARANTIDAS!');
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

garantirPermissoes();
