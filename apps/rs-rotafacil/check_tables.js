import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function run() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('Creating tracking_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.tracking_logs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                event_name TEXT NOT NULL,
                event_id TEXT,
                status TEXT,
                payload JSONB,
                response JSONB,
                pixel_id TEXT,
                error_message TEXT
            );
            ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
            
            -- Simple policies
            DROP POLICY IF EXISTS "Enable insert for all" ON public.tracking_logs;
            CREATE POLICY "Enable insert for all" ON public.tracking_logs FOR INSERT WITH CHECK (true);
            
            DROP POLICY IF EXISTS "Enable select for all" ON public.tracking_logs;
            CREATE POLICY "Enable select for all" ON public.tracking_logs FOR SELECT USING (true);
        `);

        console.log('✅ Tracking logs created or already exists');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('tracking_logs', 'app_settings');
        `);

        console.log('Found tables:', res.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

run();
