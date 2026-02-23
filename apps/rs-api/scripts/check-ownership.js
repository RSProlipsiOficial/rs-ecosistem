const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkOwnership() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        const officialId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

        console.log('--- Verificação de Posse de Dados ---');

        // Alunos
        const resAlunos = await client.query('SELECT user_id, COUNT(*) FROM public.alunos GROUP BY user_id');
        console.log('Alunos por user_id:', resAlunos.rows);

        // Financeiro
        const resFinanceiro = await client.query('SELECT user_id, COUNT(*) FROM public.lancamentos_financeiros GROUP BY user_id');
        console.log('Lançamentos por user_id:', resFinanceiro.rows);

        // Vans
        const resVans = await client.query('SELECT user_id, COUNT(*) FROM public.vans GROUP BY user_id');
        console.log('Vans por user_id:', resVans.rows);

        const allMatch = resAlunos.rows.every(r => r.user_id === officialId) &&
            resFinanceiro.rows.every(r => r.user_id === officialId);

        if (allMatch) {
            console.log('✅ Todos os dados pertencem ao ID oficial.');
        } else {
            console.log('⚠️ ALERTA: Existem dados pertencentes a outros IDs!');
        }

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

checkOwnership();
