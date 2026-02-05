import pg from 'pg';
const client = new pg.Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

async function run() {
    await client.connect();

    try {
        console.log('--- Buscando Assinaturas ---');
        // Pegar assinaturas para ver quem são os usuários
        const subs = await client.query(`
      SELECT user_id, status, plan_id 
      FROM public.user_subscriptions 
      LIMIT 10
    `);

        const userIds = subs.rows.map(r => r.user_id).filter(id => id);

        if (userIds.length === 0) {
            console.log("Nenhuma assinatura encontrada.");
        } else {
            const uIdsParam = userIds.map(id => `'${id}'`).join(',');

            console.log(`--- Buscando Metadados para ${userIds.length} usuários com assinatura ---`);
            const users = await client.query(`
            SELECT id, email, raw_user_meta_data, raw_app_meta_data
            FROM auth.users
            WHERE id IN (${uIdsParam})
        `);

            users.rows.forEach(u => {
                console.log(`\nUser: ${u.email}`);
                console.log('Metadata:', JSON.stringify(u.raw_user_meta_data, null, 2));
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
