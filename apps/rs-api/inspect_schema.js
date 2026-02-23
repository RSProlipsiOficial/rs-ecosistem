const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function inspectSchema() {
    try {
        await client.connect();
        console.log('Connected to Supabase Postgres!');

        const tables = ['product_catalog', 'sales', 'bonuses', 'orders'];

        for (const table of tables) {
            console.log(`\n--- Schema for table: ${table} ---`);
            const res = await client.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY ordinal_position;
            `);

            if (res.rows.length === 0) {
                console.log(`Table '${table}' not found or has no columns.`);
            } else {
                res.rows.forEach(row => {
                    console.log(`${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
                });
            }
        }

    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        await client.end();
    }
}

inspectSchema();
