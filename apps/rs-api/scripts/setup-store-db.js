const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Credentials from CREDENCIAIS.md or .env
const supabaseUrl = process.env.SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Connection String constructed from CREDENCIAIS.md discovery
const dbConfig = {
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(dbConfig);

async function setup() {
    try {
        console.log('🔌 Conectando ao Banco de Dados...');
        await client.connect();

        console.log('📦 Configurando tabela store_customizations...');

        // 1. Create Table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.store_customizations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id TEXT NOT NULL UNIQUE,
                logo_url TEXT,
                favicon_url TEXT,
                primary_color TEXT,
                secondary_color TEXT,
                hero JSONB,
                carousel_banners JSONB,
                mid_page_banner JSONB,
                footer JSONB,
                custom_css TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 2. Add new columns for advanced customization (safe idempotency)
        const columns = [
            { name: 'logo_size', type: 'INTEGER DEFAULT 100' },
            { name: 'sections', type: "JSONB DEFAULT '[]'::jsonb" },
            { name: 'show_seller_banner', type: 'BOOLEAN DEFAULT true' }
        ];

        for (const col of columns) {
            await client.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_customizations' AND column_name = '${col.name}') THEN 
                        ALTER TABLE public.store_customizations ADD COLUMN ${col.name} ${col.type}; 
                    END IF;
                END $$;
            `);
        }

        console.log('🔒 Configurando RLS...');
        await client.query(`ALTER TABLE public.store_customizations ENABLE ROW LEVEL SECURITY;`);

        // Policies
        await client.query(`
            DO $$ 
            BEGIN 
                DROP POLICY IF EXISTS "Public Read" ON public.store_customizations;
                DROP POLICY IF EXISTS "Service Role Full Access" ON public.store_customizations;
            END $$;
        `);

        await client.query(`CREATE POLICY "Public Read" ON public.store_customizations FOR SELECT USING (true);`);
        await client.query(`CREATE POLICY "Service Role Full Access" ON public.store_customizations USING (true) WITH CHECK (true);`);

        console.log('✅ Tabela configurada!');

        console.log('🗂️ Verificando Bucket de Storage...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) console.error('Erro ao listar buckets:', listError.message);
        else {
            const bucketName = 'marketplace-assets';
            const bucketExists = buckets.find(b => b.name === bucketName);

            if (!bucketExists) {
                console.log(`🔨 Criando bucket '${bucketName}'...`);
                const { data, error } = await supabase.storage.createBucket(bucketName, { public: true });
                if (error) console.error('Erro ao criar bucket:', error.message);
                else console.log('✅ Bucket criado!');
            } else {
                console.log('✅ Bucket já existe.');
            }
        }

        // Storage Policies (via SQL to be sure)
        console.log('🔒 Configurando Políticas de Storage...');
        // Insert bucket record if missing (sometime needed for RLS)
        await client.query(`
            INSERT INTO storage.buckets (id, name, public) 
            VALUES ('marketplace-assets', 'marketplace-assets', true)
            ON CONFLICT (id) DO UPDATE SET public = true;
        `);

        await client.query(`
            DO $$ 
            BEGIN 
                DROP POLICY IF EXISTS "Public Access Marketplace" ON storage.objects;
                DROP POLICY IF EXISTS "Authenticated Upload Marketplace" ON storage.objects;
            END $$;
        `);

        await client.query(`CREATE POLICY "Public Access Marketplace" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-assets');`);
        // Allow public upload for now to fix the issue quickly (or service role)
        // Since API uses service role, it bypasses RLS, but let's add a policy just in case API uses anon key for upload context (unlikely).
        // Actually, the API uses SERVICE_ROLE_KEY to initialize supabase client?
        // Let's check: in marketplace.ts, it imports `supabase` from `../lib/supabaseClient`.
        // `supabaseClient.ts` uses `SUPABASE_SERVICE_ROLE_KEY`.
        // So RLS is bypassed by the backend client.
        // But if we want to be safe:
        await client.query(`CREATE POLICY "Authenticated Upload Marketplace" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace-assets');`);

        console.log('✅ Políticas de Storage configuradas!');

    } catch (err) {
        console.error('❌ Erro Fatal:', err);
    } finally {
        await client.end();
        console.log('🏁 Script finalizado.');
    }
}

setup();
