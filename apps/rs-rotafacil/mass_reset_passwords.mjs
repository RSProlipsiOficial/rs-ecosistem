import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const sql = `
UPDATE auth.users 
SET encrypted_password = '$2a$10$1aoRWUKeatiPnFqANuNRQuql.ZbQ0h3QNlqnEi4z0xigspXW6/Sai'
WHERE raw_user_meta_data->>'user_type' = 'responsavel';

-- Limpar usuário de teste
DELETE FROM auth.users WHERE email = 'reset_test@example.com';
`;

async function massReset() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(sql);
        console.log("Senhas de todos os responsáveis resetadas para 123456 com sucesso!");
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

massReset();
