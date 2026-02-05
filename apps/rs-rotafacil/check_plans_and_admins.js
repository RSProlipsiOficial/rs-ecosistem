import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    console.log('--- Planos de Assinatura ---');
    const res = await client.query("SELECT id, name, price, plan_type FROM public.subscription_plans");
    console.table(res.rows);

    console.log('--- Admin Emails ---');
    const res2 = await client.query("SELECT email FROM public.admin_emails");
    console.table(res2.rows);

    console.log('--- Detalhes de user_subscriptions ativas ---');
    const res3 = await client.query(`
    SELECT s.user_id, u.email, s.status, p.name as plan_name, p.price, p.plan_type
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    LEFT JOIN auth.users u ON s.user_id = u.id
    WHERE s.status = 'active'
  `);
    console.table(res3.rows);

    await client.end();
}

run().catch(console.error);
