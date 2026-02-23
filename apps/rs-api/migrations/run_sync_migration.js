// Executar migration via conexão direta PostgreSQL
// Requer: npm install pg (ou usa o pg já instalado)

const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const SQLS = [
    // 1) Adicionar colunas em orders
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS distributor_id TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS referrer_id TEXT`,

    // 2) Criar tabela cd_orders
    `CREATE TABLE IF NOT EXISTS cd_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    consultant_name TEXT,
    consultant_pin TEXT,
    sponsor_name TEXT,
    sponsor_id TEXT,
    buyer_cpf TEXT,
    buyer_email TEXT,
    buyer_phone TEXT,
    shipping_address TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    order_time TIME DEFAULT CURRENT_TIME,
    total NUMERIC(12,2) DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDENTE',
    type TEXT DEFAULT 'MARKETPLACE',
    items_count INTEGER DEFAULT 0,
    tracking_code TEXT,
    vehicle_plate TEXT,
    marketplace_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 3) Criar tabela cd_order_items
    `CREATE TABLE IF NOT EXISTS cd_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_order_id UUID NOT NULL REFERENCES cd_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 4) Indices
    `CREATE INDEX IF NOT EXISTS idx_cd_orders_cd_id ON cd_orders(cd_id)`,
    `CREATE INDEX IF NOT EXISTS idx_cd_orders_status ON cd_orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_cd_order_items_order ON cd_order_items(cd_order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_distributor ON orders(distributor_id)`,

    // 5) RLS
    `ALTER TABLE cd_orders ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cd_order_items ENABLE ROW LEVEL SECURITY`,

    // 6) Policies (usando DO $$ para evitar erro de duplicata)
    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cd_orders' AND policyname = 'service_role_cd_orders') THEN
      CREATE POLICY service_role_cd_orders ON cd_orders FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END $$`,
    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cd_order_items' AND policyname = 'service_role_cd_order_items') THEN
      CREATE POLICY service_role_cd_order_items ON cd_order_items FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END $$`,
    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cd_orders' AND policyname = 'anon_read_cd_orders') THEN
      CREATE POLICY anon_read_cd_orders ON cd_orders FOR SELECT USING (true);
    END IF;
  END $$`,
    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cd_order_items' AND policyname = 'anon_read_cd_order_items') THEN
      CREATE POLICY anon_read_cd_order_items ON cd_order_items FOR SELECT USING (true);
    END IF;
  END $$`,
];

async function run() {
    console.log('🔄 Conectando ao PostgreSQL do Supabase...\n');

    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('✅ Conectado!\n');

    for (let i = 0; i < SQLS.length; i++) {
        const sql = SQLS[i];
        const label = sql.trim().substring(0, 70).replace(/\n/g, ' ');
        try {
            await client.query(sql);
            console.log(`  [${i + 1}/${SQLS.length}] ✅ ${label}...`);
        } catch (err) {
            console.log(`  [${i + 1}/${SQLS.length}] ⚠️  ${label}... → ${err.message}`);
        }
    }

    // Verificação
    console.log('\n📋 Verificação pós-migration:');

    try {
        const r1 = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('distributor_id', 'referrer_id')`);
        console.log(`  orders colunas novas: ${r1.rows.map(r => r.column_name).join(', ') || 'NENHUMA'}`);
    } catch (e) { console.log('  ⚠️ Verificação orders falhou:', e.message); }

    try {
        const r2 = await client.query(`SELECT count(*) as total FROM cd_orders`);
        console.log(`  cd_orders: ✅ OK (${r2.rows[0].total} registros)`);
    } catch (e) { console.log('  ❌ cd_orders:', e.message); }

    try {
        const r3 = await client.query(`SELECT count(*) as total FROM cd_order_items`);
        console.log(`  cd_order_items: ✅ OK (${r3.rows[0].total} registros)`);
    } catch (e) { console.log('  ❌ cd_order_items:', e.message); }

    await client.end();
    console.log('\n✅ Migration concluída! Conexão fechada.');
}

run().catch(err => {
    console.error('❌ Erro fatal:', err.message);
    process.exit(1);
});
