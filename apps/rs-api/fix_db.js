const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixDatabase() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const queries = [
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT;`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords TEXT;`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS member_price NUMERIC;`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;`,
            `NOTIFY pgrst, 'reload schema';`
        ];

        for (const query of queries) {
            console.log('Running:', query);
            await client.query(query);
            console.log('Success.');
        }

        console.log('Database fix completed!');
    } catch (e) {
        console.error('Erro:', e);
    } finally {
        await client.end();
    }
}

fixDatabase();
