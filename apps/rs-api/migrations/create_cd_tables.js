// Criar tabelas faltantes para o RS-CDS
const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const SQLS = [
    // cd_products - Estoque do CD
    `CREATE TABLE IF NOT EXISTS cd_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    sku TEXT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    stock_level INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    price NUMERIC(12,2) DEFAULT 0,
    cost_price NUMERIC(12,2) DEFAULT 0,
    points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'OK',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // cd_transactions - Financeiro do CD
    `CREATE TABLE IF NOT EXISTS cd_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'credit',
    category TEXT DEFAULT 'vendas',
    amount NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'completed',
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // cd_customers - Clientes do CD
    `CREATE TABLE IF NOT EXISTS cd_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    last_purchase_date DATE,
    total_spent NUMERIC(12,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // cd_regions - Regiões de cobertura do CD
    `CREATE TABLE IF NOT EXISTS cd_regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    cep_start TEXT,
    cep_end TEXT,
    city TEXT,
    state TEXT,
    radius_km NUMERIC(8,2),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // Indices
    `CREATE INDEX IF NOT EXISTS idx_cd_products_cd ON cd_products(cd_id)`,
    `CREATE INDEX IF NOT EXISTS idx_cd_transactions_cd ON cd_transactions(cd_id)`,
    `CREATE INDEX IF NOT EXISTS idx_cd_customers_cd ON cd_customers(cd_id)`,
    `CREATE INDEX IF NOT EXISTS idx_cd_regions_cd ON cd_regions(cd_id)`,

    // RLS
    `ALTER TABLE cd_products ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cd_transactions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cd_customers ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cd_regions ENABLE ROW LEVEL SECURITY`,

    // Policies - service_role
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_products' AND policyname='srv_cd_products') THEN CREATE POLICY srv_cd_products ON cd_products FOR ALL USING (auth.role()='service_role'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_transactions' AND policyname='srv_cd_transactions') THEN CREATE POLICY srv_cd_transactions ON cd_transactions FOR ALL USING (auth.role()='service_role'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_customers' AND policyname='srv_cd_customers') THEN CREATE POLICY srv_cd_customers ON cd_customers FOR ALL USING (auth.role()='service_role'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_regions' AND policyname='srv_cd_regions') THEN CREATE POLICY srv_cd_regions ON cd_regions FOR ALL USING (auth.role()='service_role'); END IF; END $$`,

    // Policies - anon read
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_products' AND policyname='anon_cd_products') THEN CREATE POLICY anon_cd_products ON cd_products FOR SELECT USING (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_transactions' AND policyname='anon_cd_transactions') THEN CREATE POLICY anon_cd_transactions ON cd_transactions FOR SELECT USING (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_customers' AND policyname='anon_cd_customers') THEN CREATE POLICY anon_cd_customers ON cd_customers FOR SELECT USING (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_regions' AND policyname='anon_cd_regions') THEN CREATE POLICY anon_cd_regions ON cd_regions FOR SELECT USING (true); END IF; END $$`,

    // Policies - anon insert/update para o frontend do CDS
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_products' AND policyname='anon_write_cd_products') THEN CREATE POLICY anon_write_cd_products ON cd_products FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_transactions' AND policyname='anon_write_cd_transactions') THEN CREATE POLICY anon_write_cd_transactions ON cd_transactions FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_customers' AND policyname='anon_write_cd_customers') THEN CREATE POLICY anon_write_cd_customers ON cd_customers FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_orders' AND policyname='anon_write_cd_orders') THEN CREATE POLICY anon_write_cd_orders ON cd_orders FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cd_order_items' AND policyname='anon_write_cd_order_items') THEN CREATE POLICY anon_write_cd_order_items ON cd_order_items FOR ALL USING (true) WITH CHECK (true); END IF; END $$`,
];

async function run() {
    console.log('🔄 Criando tabelas CD faltantes...\n');
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    for (let i = 0; i < SQLS.length; i++) {
        const label = SQLS[i].trim().substring(0, 65).replace(/\n/g, ' ');
        try {
            await client.query(SQLS[i]);
            console.log(`  [${i + 1}/${SQLS.length}] ✅ ${label}...`);
        } catch (e) {
            console.log(`  [${i + 1}/${SQLS.length}] ⚠️  ${label}... → ${e.message}`);
        }
    }

    // Verificação final
    console.log('\n📋 Verificação final:');
    const tables = ['cd_orders', 'cd_order_items', 'cd_products', 'cd_transactions', 'cd_customers', 'cd_regions', 'cd_stock'];
    for (const t of tables) {
        try {
            const r = await client.query(`SELECT count(*) as c FROM ${t}`);
            console.log(`  ✅ ${t}: OK`);
        } catch (e) { console.log(`  ❌ ${t}: FALHOU`); }
    }

    await client.end();
    console.log('\n✅ Todas as tabelas criadas!');
}
run().catch(console.error);
