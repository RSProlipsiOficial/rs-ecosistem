const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function inspectDatabase() {
    try {
        await client.connect();

        console.log('\\n--- DADOS DA TABELA COLLECTIONS ---');
        const cols = await client.query('SELECT id, name, image, product_ids FROM collections LIMIT 5;');
        console.table(cols.rows);

        console.log('\\n--- ESTRUTURA TABLE PRODUCTS ---');
        const prodSchema = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);
        console.table(prodSchema.rows);

        console.log('\\n--- DADOS DA TABELA PRODUCTS (AlphaLipsi) ---');
        const prods = await client.query("SELECT id, name, category, published, specifications FROM products WHERE name ILIKE '%AlphaLipsi%' LIMIT 5;");
        console.table(prods.rows);

        console.log('\\n--- LISTANDO 5 PRIMEIROS PRODUTOS REAIS ---');
        const top5 = await client.query("SELECT id, name, category, published FROM products LIMIT 5;");
        console.table(top5.rows);

    } catch (e) {
        console.error('Erro na auditoria da DB:', e);
    } finally {
        await client.end();
    }
}

inspectDatabase();
