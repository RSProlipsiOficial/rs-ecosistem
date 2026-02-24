-- Função para buscar dados do usuário e suas vans para o cadastro público
CREATE OR REPLACE FUNCTION public.get_public_registration_data(p_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record record;
    v_vans_json jsonb;
    v_target_user_id uuid;
BEGIN
    -- 1. Tentar encontrar por mmn_id primeiro
    SELECT id, nome_completo, avatar_url
    INTO v_user_record
    FROM public.user_profiles
    WHERE mmn_id = p_identifier
    LIMIT 1;

    -- 2. Se não encontrou, tentar por UUID (se for um UUID válido)
    IF v_user_record.id IS NULL AND p_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id, nome_completo, avatar_url
        INTO v_user_record
        FROM public.user_profiles
        WHERE id = p_identifier::uuid
        LIMIT 1;
    END IF;

    -- 3. Se ainda não encontrou, retornar erro
    IF v_user_record.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Usuário não encontrado');
    END IF;

    v_target_user_id := v_user_record.id;

    -- 4. Buscar vans desse usuário
    SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome))
    INTO v_vans_json
    FROM public.vans
    WHERE user_id = v_target_user_id;

    -- 5. Retornar dados combinados
    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_target_user_id,
            'nome', v_user_record.nome_completo,
            'avatar_url', v_user_record.avatar_url
        ),
        'vans', COALESCE(v_vans_json, '[]'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_registration_data(text) TO public;
GRANT EXECUTE ON FUNCTION public.get_public_registration_data(text) TO anon;
