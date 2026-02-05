import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const sql = `
-- Atualizar a RPC de busca de aluno para incluir lista de vans do dono
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

    -- Buscar vans do owner para o seletor
    SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome)) INTO v_vans
    FROM public.vans
    WHERE owner_id = v_aluno_data.user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'vans', v_vans,
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
            'user_id', v_aluno_data.user_id
        )
    );
END;
$$;

-- Atualizar a RPC de atualização para suportar van_id e garantir que o colégio seja salvo
CREATE OR REPLACE FUNCTION public.update_aluno_via_token(p_token TEXT, p_updates JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_aluno_id UUID;
    v_token_record RECORD;
BEGIN
    -- Validar token
    SELECT * INTO v_token_record
    FROM public.aluno_update_tokens
    WHERE token = p_token AND used = FALSE AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Token inválido ou expirado.');
    END IF;

    v_aluno_id := v_token_record.aluno_id;

    -- Atualizar campos permitidos
    UPDATE public.alunos
    SET 
        nome_completo = COALESCE((p_updates->>'nome_completo'), nome_completo),
        nome_responsavel = COALESCE((p_updates->>'nome_responsavel'), nome_responsavel),
        whatsapp_responsavel = COALESCE((p_updates->>'whatsapp_responsavel'), whatsapp_responsavel),
        cpf = COALESCE((p_updates->>'cpf'), cpf),
        email = COALESCE((p_updates->>'email'), email),
        endereco_rua = COALESCE((p_updates->>'endereco_rua'), endereco_rua),
        endereco_numero = COALESCE((p_updates->>'endereco_numero'), endereco_numero),
        endereco_bairro = COALESCE((p_updates->>'endereco_bairro'), endereco_bairro),
        endereco_cidade = COALESCE((p_updates->>'endereco_cidade'), endereco_cidade),
        endereco_estado = COALESCE((p_updates->>'endereco_estado'), endereco_estado),
        endereco_cep = COALESCE((p_updates->>'endereco_cep'), endereco_cep),
        tipo_residencia = COALESCE((p_updates->>'tipo_residencia'), tipo_residencia),
        nome_colegio = COALESCE((p_updates->>'nome_colegio'), nome_colegio),
        serie = COALESCE((p_updates->>'serie'), serie),
        turno = COALESCE((p_updates->>'turno'), turno),
        sala = COALESCE((p_updates->>'sala'), sala),
        van_id = COALESCE((p_updates->>'van_id')::uuid, van_id),
        updated_at = NOW()
    WHERE id = v_aluno_id;

    -- Marcar token como usado
    UPDATE public.aluno_update_tokens
    SET used = TRUE
    WHERE id = v_token_record.id;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;
`;

async function updateRPCS() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        await client.query(sql);
        console.log("RPCs atualizadas com sucesso para incluir Vans e Colégios!");
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

updateRPCS();
