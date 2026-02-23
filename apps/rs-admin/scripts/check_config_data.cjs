const { Client } = require('pg');

async function checkConfigData() {
    const user = "postgres.rptkhrboejbwexseikuo";
    const pass = encodeURIComponent("Rspro_@$#2025");
    const host = "aws-0-sa-east-1.pooler.supabase.com";
    const port = "6543";
    const db = "postgres";

    const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${db}`;

    const client = new Client({
        connectionString: connectionString
    });

    try {
        await client.connect();
        console.log('Connected to Supabase DB');

        console.log('\n--- POLICIES for app_configs ---');
        const policies = await client.query("SELECT * FROM pg_policies WHERE tablename = 'app_configs'");
        console.table(policies.rows);

        console.log('\n--- TABLE OWNER ---');
        const owner = await client.query("SELECT tableowner FROM pg_tables WHERE tablename = 'app_configs'");
        console.table(owner.rows);

        await client.end();
    } catch (err) {
        console.error('Connection error', err.message);
    }
}

checkConfigData();
