const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function listTriggers() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers
            WHERE event_object_table = 'user_profiles'
        `);
        console.log("TRIGGERS EM user_profiles:");
        res.rows.forEach(r => console.log(` - ${r.trigger_name} (${r.event_manipulation}): ${r.action_statement}`));

        // Also check for columns with default values
        const colDefaults = await client.query(`
            SELECT column_name, column_default
            FROM information_schema.columns
            WHERE table_name = 'user_profiles' AND column_default IS NOT NULL
        `);
        console.log("\nVALORES PADRÃO EM user_profiles:");
        colDefaults.rows.forEach(r => console.log(` - ${r.column_name}: ${r.column_default}`));

    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

listTriggers();
