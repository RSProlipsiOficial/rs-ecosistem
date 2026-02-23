const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function verify() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Verificação de Segurança ---');

        // 1. Quem é admin?
        const admins = await client.query('SELECT * FROM public.admin_emails');
        console.log('Admin Emails:', admins.rows);

        // 2. O email oficial está no auth.users?
        const authUser = await client.query("SELECT id, email FROM auth.users WHERE email = 'rsprolipsioficial@gmail.com'");
        console.log('Auth User:', authUser.rows);

        // 3. O is_admin() está funcionando para esse email?
        // Simulando a chamada da função
        if (authUser.rows.length > 0) {
            const userId = authUser.rows[0].id;
            console.log(`Testando is_admin para ID: ${userId}`);
            // Note: is_admin uses auth.jwt(), so we can't test it directly easily via pg without mocking the JWT claims session
        }

        // 4. Verificar se existem políticas órfãs ou duplicadas na tabela alunos
        const policies = await client.query("SELECT * FROM pg_policies WHERE tablename = 'alunos'");
        console.log('Políticas na tabela Alunos:', policies.rows.map(p => p.policyname));

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

verify();
