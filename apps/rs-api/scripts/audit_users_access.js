require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
});

async function auditUsers() {
    try {
        await client.connect();

        console.log('--- Auditoria de Acesso de Usuários ---');

        // 1. Contar Consultores
        const resConsultores = await client.query('SELECT count(*) FROM public.consultores');
        const totalConsultores = parseInt(resConsultores.rows[0].count);
        console.log(`Total de Consultores na tabela 'public.consultores': ${totalConsultores}`);

        // 2. Contar Usuários Auth
        const resAuth = await client.query('SELECT count(*) FROM auth.users');
        const totalAuth = parseInt(resAuth.rows[0].count);
        console.log(`Total de Usuários na tabela 'auth.users': ${totalAuth}`);

        // 3. Verificar Consultores SEM Usuário Auth (Fantamas)
        const resMissing = await client.query(`
      SELECT c.id, c.nome, c.email 
      FROM public.consultores c 
      LEFT JOIN auth.users u ON c.id = u.id 
      WHERE u.id IS NULL
    `);

        const missingCount = resMissing.rows.length;
        console.log(`\nConsultores SEM conta em auth.users (Não conseguem logar): ${missingCount}`);
        if (missingCount > 0) {
            resMissing.rows.forEach(r => {
                console.log(` - ID: ${r.id} | Nome: ${r.nome} | Email: ${r.email}`);
            });
        } else {
            console.log(' ✅ Todos os consultores possuem registro em auth.users.');
        }

        // 4. Verificar Usuários Auth SEM Consultor (Orfãos)
        const resOrphans = await client.query(`
        SELECT u.id, u.email 
        FROM auth.users u
        LEFT JOIN public.consultores c ON u.id = c.id
        WHERE c.id IS NULL
    `);
        console.log(`\nUsuários Auth SEM perfil de Consultor: ${resOrphans.rows.length}`);


        console.log('\n--- Status de Senhas ---');
        console.log('OBS: As senhas são criptografadas (hash), não é possível lê-las.');
        console.log('Se desejar, podemos RESETAR a senha de todos (ou de um grupo) para "123456".');
        console.log('Isso garantirá o acesso padrão solicitado.');

    } catch (err) {
        console.error('Erro na auditoria:', err);
    } finally {
        await client.end();
    }
}

auditUsers();
