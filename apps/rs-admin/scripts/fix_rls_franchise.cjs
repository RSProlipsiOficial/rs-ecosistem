const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const SQLS = [
    // 1. Criar a tabela caso não exista
    `CREATE TABLE IF NOT EXISTS public.franchise_rules (
        id SERIAL PRIMARY KEY,
        initial_cost DECIMAL(12, 2) DEFAULT 0.00,
        royalty_percentage DECIMAL(5, 2) DEFAULT 0.00,
        min_stock_purchase DECIMAL(12, 2) DEFAULT 0.00,
        marketing_fee DECIMAL(5, 2) DEFAULT 0.00,
        commission_percentage DECIMAL(5, 2) DEFAULT 15.20,
        allowed_payment_methods TEXT[] DEFAULT '{PIX, BOLETO, CARTAO}',
        contract_terms TEXT DEFAULT '',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // 2. Inserir a linha inicial para o upsert funcionar
    `INSERT INTO public.franchise_rules (id, initial_cost, royalty_percentage, min_stock_purchase, marketing_fee, commission_percentage)
     VALUES (1, 2000.00, 0.0, 500.0, 0.0, 15.2)
     ON CONFLICT (id) DO NOTHING`,

    // 3. RLS e Políticas
    `ALTER TABLE public.franchise_rules ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Admins can manage franchise rules" ON public.franchise_rules`,
    `CREATE POLICY "Admins can manage franchise rules" ON public.franchise_rules
        FOR ALL 
        TO authenticated
        USING (
            (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
        )
        WITH CHECK (
            (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
        )`,
    `DROP POLICY IF EXISTS "Public read for franchise rules" ON public.franchise_rules`,
    `CREATE POLICY "Public read for franchise rules" ON public.franchise_rules
        FOR SELECT USING (TRUE)`
];

async function run() {
    console.log('🔄 Corrigindo RLS via PostgreSQL...');
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    for (const sql of SQLS) {
        try {
            await client.query(sql);
            console.log(`✅ Sucesso: ${sql.substring(0, 50)}...`);
        } catch (err) {
            console.log(`❌ Erro: ${err.message}`);
        }
    }

    await client.end();
    console.log('✅ Concluído!');
}

run();
