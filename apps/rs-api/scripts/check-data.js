const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkData() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Verificação de Dados ---');

        const resAlunos = await client.query('SELECT COUNT(*) FROM public.alunos');
        console.log(`Total de Alunos: ${resAlunos.rows[0].count}`);

        const resVans = await client.query('SELECT COUNT(*) FROM public.vans');
        console.log(`Total de Vans: ${resVans.rows[0].count}`);

        const resLancamentos = await client.query('SELECT COUNT(*) FROM public.lancamentos_financeiros');
        console.log(`Total de Lançamentos Financeiros: ${resLancamentos.rows[0].count}`);

        const resAdmin = await client.query('SELECT COUNT(*) FROM public.admin_emails');
        console.log(`Total de Admins registrados: ${resAdmin.rows[0].count}`);

    } catch (err) {
        console.error('❌ Erro na verificação:', err.message);
    } finally {
        await client.end();
    }
}

checkData();
