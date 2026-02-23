const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkConstraints() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'public.user_profiles'::regclass;
        `);
        console.log("CONSTRAINTS EM user_profiles:");
        res.rows.forEach(r => console.log(` - ${r.conname} (${r.contype}): ${r.def}`));
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

checkConstraints();
