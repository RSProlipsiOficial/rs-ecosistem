import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function verify() {
    const client = new pg.Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Listando Tabelas do Schema Public ---');
        const resTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tabelas:', resTables.rows.map(r => r.table_name).join(', '));

        console.log('\n--- Verificando RPC get_admin_billing_summary ---');
        const resBilling = await client.query('SELECT public.get_admin_billing_summary() as billing');
        console.log('Faturamento:', JSON.stringify(resBilling.rows[0].billing, null, 2));

        console.log('\n--- Verificando RPC get_admin_users_list ---');
        const resUsers = await client.query('SELECT public.get_admin_users_list() as users');
        console.log('Total usuários retornados:', resUsers.rows[0].users?.length || 0);
        if (resUsers.rows[0].users && resUsers.rows[0].users.length > 0) {
            console.log('Exemplo de status:', resUsers.rows[0].users[0].status);
        }

    } catch (err) {
        console.error('ERRO na verificação:', err.message);
    } finally {
        await client.end();
    }
}

verify();
