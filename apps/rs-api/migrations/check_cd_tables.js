// Verificar quais tabelas CD existem no Supabase
const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function check() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const tables = ['cd_orders', 'cd_order_items', 'cd_products', 'cd_transactions', 'cd_customers', 'cd_regions', 'cd_stock'];

    console.log('📋 Verificação de tabelas CD no Supabase:\n');
    for (const t of tables) {
        try {
            const r = await client.query(`SELECT count(*) as total FROM ${t}`);
            console.log(`  ✅ ${t}: ${r.rows[0].total} registros`);
        } catch (e) {
            console.log(`  ❌ ${t}: NÃO EXISTE`);
        }
    }

    // Verificar colunas da orders que recém adicionamos
    const { rows } = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name IN ('distributor_id','referrer_id')
  `);
    console.log('\n📋 Colunas novas em orders:', rows.map(r => r.column_name).join(', '));

    await client.end();
}
check().catch(console.error);
