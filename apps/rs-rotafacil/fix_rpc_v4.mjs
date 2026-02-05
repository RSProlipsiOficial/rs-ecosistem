import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const sql = `
CREATE OR REPLACE FUNCTION public.get_aluno_by_update_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_aluno_id UUID;
    v_aluno_data RECORD;
    v_token_record RECORD;
    v_vans JSONB;
    v_colegios JSONB;
BEGIN
    -- Validar token
    SELECT * INTO v_token_record
    FROM public.aluno_update_tokens
    WHERE token = p_token AND used = FALSE AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Token inválido, já utilizado ou expirado.');
    END IF;

    -- Buscar dados do aluno
    SELECT * INTO v_aluno_data
    FROM public.alunos
    WHERE id = v_token_record.aluno_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Aluno não encontrado.');
    END IF;

    -- Buscar vans do transportador (user_id na tabela vans)
    SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome)) INTO v_vans
    FROM public.vans
    WHERE user_id = v_aluno_data.user_id;

    -- Buscar colégios vinculados às vans deste transportador
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', c.id, 'nome', c.nome)) INTO v_colegios
    FROM public.colegios c
    JOIN public.van_colegios vc ON vc.colegio_id = c.id
    JOIN public.vans v ON v.id = vc.van_id
    WHERE v.user_id = v_aluno_data.user_id;

    -- Fallback se não encontrar colégios vinculados
    IF v_colegios IS NULL OR v_colegios = '[]'::jsonb THEN
        SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome)) INTO v_colegios
        FROM public.colegios
        LIMIT 100;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'vans', v_vans,
        'colegios', v_colegios,
        'aluno', jsonb_build_object(
            'id', v_aluno_data.id,
            'nome_completo', v_aluno_data.nome_completo,
            'nome_responsavel', v_aluno_data.nome_responsavel,
            'whatsapp_responsavel', v_aluno_data.whatsapp_responsavel,
            'cpf', v_aluno_data.cpf,
            'email', v_aluno_data.email,
            'endereco_rua', v_aluno_data.endereco_rua,
            'endereco_numero', v_aluno_data.endereco_numero,
            'endereco_bairro', v_aluno_data.endereco_bairro,
            'endereco_cidade', v_aluno_data.endereco_cidade,
            'endereco_estado', v_aluno_data.endereco_estado,
            'endereco_cep', v_aluno_data.endereco_cep,
            'tipo_residencia', v_aluno_data.tipo_residencia,
            'nome_colegio', v_aluno_data.nome_colegio,
            'serie', v_aluno_data.serie,
            'turno', v_aluno_data.turno,
            'sala', v_aluno_data.sala,
            'valor_mensalidade', v_aluno_data.valor_mensalidade,
            'dia_vencimento', v_aluno_data.dia_vencimento,
            'van_id', v_aluno_data.van_id,
            'userid', v_aluno_data.user_id -- Ajustado para userid se necessário no front, mas o front usa aluno.id
        )
    );
END;
$$;
`;

async function fixRPC() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        await client.query(sql);
        console.log("RPC corrigida com sucesso (owner_id -> user_id)!");
    } catch (err) {
        console.error("ERRO na correção:", err.message);
    } finally {
        await client.end();
    }
}

fixRPC();
