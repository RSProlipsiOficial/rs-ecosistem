const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- Função para buscar todos os IDs do time (recursivo)
CREATE OR REPLACE FUNCTION public.get_team_ids(root_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE team_cte AS (
        -- Base cases: diretos do root
        SELECT c.id FROM public.consultores c WHERE c.patrocinador_id = root_id
        UNION
        -- Recursive step: diretos de quem já está no time
        SELECT c.id FROM public.consultores c
        JOIN team_cte t ON c.patrocinador_id = t.id
    )
    SELECT team_cte.id FROM team_cte;
END;
$$;
`;

async function createRPC() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🚀 Criando RPC get_team_ids...');
        await client.query(sql);
        console.log('✅ RPC criada com sucesso!');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

createRPC();
