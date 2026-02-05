import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const sql = `
CREATE OR REPLACE FUNCTION public.get_my_students()
RETURNS TABLE (
    id UUID,
    nome_completo TEXT,
    nome_colegio TEXT,
    serie TEXT,
    sala TEXT,
    turno TEXT,
    status TEXT,
    van_id UUID,
    user_id UUID,
    cpf TEXT,
    email TEXT,
    whatsapp_responsavel TEXT,
    valor_mensalidade NUMERIC,
    dia_vencimento INTEGER,
    endereco_rua TEXT,
    endereco_numero TEXT,
    endereco_bairro TEXT,
    endereco_cidade TEXT,
    endereco_estado TEXT,
    endereco_cep TEXT,
    nome_responsavel TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nome_completo,
        a.nome_colegio,
        a.serie,
        a.sala,
        a.turno,
        (CASE WHEN a.ativo THEN 'Ativo' ELSE 'Inativo' END)::TEXT as status,
        a.van_id,
        a.user_id,
        a.cpf,
        a.email,
        a.whatsapp_responsavel,
        a.valor_mensalidade,
        a.dia_vencimento,
        a.endereco_rua,
        a.endereco_numero,
        a.endereco_bairro,
        a.endereco_cidade,
        a.endereco_estado,
        a.endereco_cep,
        a.nome_responsavel
    FROM public.alunos a
    JOIN public.responsavel_alunos ra ON ra.aluno_id = a.id
    WHERE ra.responsavel_id = auth.uid()
    AND a.ativo = true; -- Roberto quer apenas os ativos
END;
$$;
`;

async function updateRPC() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        await client.query(sql);
        console.log("RPC get_my_students atualizada para filtrar apenas alunos ativos!");
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

updateRPC();
