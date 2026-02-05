const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function diagnose() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Diagnóstico de Usuários ---');

        // 1. Listar admins
        const resAdmins = await client.query('SELECT * FROM public.admin_emails');
        console.log('Admins registrados:', resAdmins.rows);

        // 2. Verificar quem é o dono dos 73 alunos
        const resAlunosOwner = await client.query('SELECT user_id, COUNT(*) FROM public.alunos GROUP BY user_id');
        console.log('Donos dos alunos no banco:', resAlunosOwner.rows);

        // 3. Verificar o email rsprolipsioficial@gmail.com
        const resUser = await client.query("SELECT id, email FROM auth.users WHERE email = 'rsprolipsioficial@gmail.com'");
        console.log('ID do usuário oficial:', resUser.rows);

        // 4. Verificar se o ID do usuário oficial bate com o dono dos alunos
        if (resUser.rows.length > 0 && resAlunosOwner.rows.length > 0) {
            const officialId = resUser.rows[0].id;
            const match = resAlunosOwner.rows.find(row => row.user_id === officialId);
            if (match) {
                console.log(`✅ O usuário oficial é dono de ${match.count} alunos.`);
            } else {
                console.log('⚠️ O usuário oficial NÃO é dono de nenhum aluno nas 73 linhas!');
                console.log('Isso explica a perda de visibilidade.');
            }
        }

    } catch (err) {
        console.error('❌ Erro no diagnóstico:', err.message);
    } finally {
        await client.end();
    }
}

diagnose();
