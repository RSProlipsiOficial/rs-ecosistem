const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function inspectSchema() {
    try {
        await client.connect();

        // Product Catalog - Focus on Commission/Type columns
        console.log('\n--- Product Catalog Columns ---');
        const resProd = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'product_catalog' 
            AND (column_name LIKE '%type%' OR column_name LIKE '%commission%' OR column_name LIKE '%model%' OR column_name LIKE '%affiliate%')
        `);
        if (resProd.rows.length === 0) console.log('No specific type/commission columns found.');
        else resProd.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

        // Sales - Focus on Commission tracking columns
        console.log('\n--- Sales Columns ---');
        const resSales = await client.query(`
             SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sales' 
        `);
        resSales.rows.forEach(r => console.log(`${r.column_name}`)); // Just names to save space

        // Bonuses - Check types
        console.log('\n--- Bonus/Commission Types in Enum (if exists) or Check Constraints ---');
        // This is harder to check via information_schema directly for enums in a generic way without more queries, 
        // so let's just check columns in 'bonuses' table
        const resBonuses = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bonuses'
        `);
        resBonuses.rows.forEach(r => console.log(`${r.column_name}`));

    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        await client.end();
    }
}

inspectSchema();
