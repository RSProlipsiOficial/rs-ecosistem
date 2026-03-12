const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const DEFAULT_TENANT_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

const collectionsToCreate = [
    'Encapsulados',
    'Óleos Essenciais',
    'Saúde da Mulher',
    'Saúde do Homem',
    'Emagrecimento'
];

async function seedCollections() {
    try {
        await client.connect();
        console.log('--- Iniciando Seed de Coleções ---');

        for (const name of collectionsToCreate) {
            const check = await client.query('SELECT id FROM collections WHERE name = $1 LIMIT 1', [name]);
            if (check.rows.length === 0) {
                const id = crypto.randomUUID();
                await client.query(
                    `INSERT INTO collections (id, tenant_id, name, description, image, product_ids, created_at, updated_at) 
                     VALUES ($1, $2, $3, '', '', '{}', NOW(), NOW())`,
                    [id, DEFAULT_TENANT_ID, name]
                );
                console.log(`✅ Coleção criada: ${name}`);
            } else {
                console.log(`⚠️ Coleção já existia: ${name}`);
            }
        }

        console.log('--- Seed Finalizado com Sucesso ---');
    } catch (e) {
        console.error('Erro no Seed:', e);
    } finally {
        await client.end();
    }
}

seedCollections();
