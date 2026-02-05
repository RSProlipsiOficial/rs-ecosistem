-- Função para obter informações básicas da van publicamente (apenas nome)
CREATE OR REPLACE FUNCTION public.get_van_public(p_van_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_van_record record;
BEGIN
    SELECT id, nome
    INTO v_van_record
    FROM public.vans
    WHERE id = p_van_id;

    IF v_van_record.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Van não encontrada');
    END IF;

    RETURN jsonb_build_object(
        'id', v_van_record.id,
        'nome', v_van_record.nome
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_van_public(uuid) TO public;
GRANT EXECUTE ON FUNCTION public.get_van_public(uuid) TO anon;

-- Função para criar aluno publicamente
CREATE OR REPLACE FUNCTION public.create_aluno_public(p_aluno_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_van_id uuid;
    v_user_id uuid;
    v_aluno_id uuid;
    v_valor_mensalidade numeric;
    v_valor_letalidade numeric;
    v_dia_vencimento integer;
    v_mes_atual integer;
    v_ano_atual integer;
    v_data_vencimento date;
    v_total_valor numeric;
BEGIN
    -- Validar input
    v_van_id := (p_aluno_data->>'van_id')::uuid;
    
    IF v_van_id IS NULL THEN
        RAISE EXCEPTION 'van_id é obrigatório';
    END IF;

    -- Obter o dono da van (user_id)
    SELECT user_id 
    INTO v_user_id
    FROM public.vans
    WHERE id = v_van_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Van não encontrada ou sem proprietário';
    END IF;

    -- Inserir aluno
    INSERT INTO public.alunos (
        user_id,
        van_id,
        nome_completo,
        nome_responsavel,
        cpf,
        email,
        turno,
        serie,
        nome_colegio,
        endereco_rua,
        endereco_numero,
        endereco_bairro,
        endereco_cidade,
        endereco_estado,
        endereco_cep,
        tipo_residencia,
        whatsapp_responsavel,
        valor_mensalidade,
        valor_letalidade,
        dia_vencimento,
        ativo
    ) VALUES (
        v_user_id,
        v_van_id,
        p_aluno_data->>'nome_completo',
        p_aluno_data->>'nome_responsavel',
        p_aluno_data->>'cpf',
        p_aluno_data->>'email',
        p_aluno_data->>'turno',
        p_aluno_data->>'serie',
        p_aluno_data->>'nome_colegio',
        p_aluno_data->>'endereco_rua',
        p_aluno_data->>'endereco_numero',
        p_aluno_data->>'endereco_bairro',
        p_aluno_data->>'endereco_cidade',
        p_aluno_data->>'endereco_estado',
        p_aluno_data->>'endereco_cep',
        p_aluno_data->>'tipo_residencia',
        p_aluno_data->>'whatsapp_responsavel',
        (p_aluno_data->>'valor_mensalidade')::numeric,
        COALESCE((p_aluno_data->>'valor_letalidade')::numeric, 0),
        COALESCE((p_aluno_data->>'dia_vencimento')::integer, 10),
        false -- Inicia inativo até confirmar pagamento
    )
    RETURNING id, valor_mensalidade, valor_letalidade, dia_vencimento
    INTO v_aluno_id, v_valor_mensalidade, v_valor_letalidade, v_dia_vencimento;

    -- Gerar primeira mensalidade
    v_mes_atual := EXTRACT(MONTH FROM CURRENT_DATE);
    v_ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Calcular data de vencimento
    BEGIN
        v_data_vencimento := make_date(v_ano_atual, v_mes_atual, v_dia_vencimento);
    EXCEPTION WHEN others THEN
        -- Fallback se dia for inválido (ex: 31 em fevereiro)
        v_data_vencimento := make_date(v_ano_atual, v_mes_atual, 28);
    END;

    v_total_valor := v_valor_mensalidade + COALESCE(v_valor_letalidade, 0);

    INSERT INTO public.pagamentos_mensais (
        aluno_id,
        mes,
        ano,
        valor,
        status,
        user_id,
        data_vencimento
    ) VALUES (
        v_aluno_id,
        v_mes_atual,
        v_ano_atual,
        v_total_valor,
        'nao_pago',
        v_user_id,
        v_data_vencimento
    );

    RETURN jsonb_build_object(
        'success', true,
        'aluno_id', v_aluno_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_aluno_public(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.create_aluno_public(jsonb) TO anon;
