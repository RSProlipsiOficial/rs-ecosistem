
-- Função para buscar dados do usuário e suas vans para o cadastro público
-- ATUALIZADA: Corrigindo a busca para usar user_ID (Auth) e não ID (Profile)
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
    -- IMPORTANTE: Selecionar user_id também!
    SELECT id, user_id, nome_completo, avatar_url
    INTO v_user_record
    FROM public.user_profiles
    WHERE mmn_id = p_identifier
    LIMIT 1;

    -- 2. Se não encontrou, tentar por UUID (se for um UUID válido)
    IF v_user_record.id IS NULL AND p_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id, user_id, nome_completo, avatar_url
        INTO v_user_record
        FROM public.user_profiles
        WHERE id = p_identifier::uuid
        LIMIT 1;
    END IF;

    -- 3. Se ainda não encontrou, retornar erro
    IF v_user_record.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Usuário não encontrado');
    END IF;

    -- CORREÇÃO: Usar user_id (Auth ID) se disponível, senão usar id (Profile ID)
    -- As vans estão linkadas ao Auth ID.
    v_target_user_id := COALESCE(v_user_record.user_id, v_user_record.id);

    -- 4. Buscar vans desse usuário
    -- Mapeando whatsapp_group_link para link_grupo_whatsapp
    SELECT jsonb_agg(jsonb_build_object(
        'id', id, 
        'nome', nome,
        'link_grupo_whatsapp', whatsapp_group_link
    ))
    INTO v_vans_json
    FROM public.vans
    WHERE user_id = v_target_user_id;

    -- 5. Retornar dados combinados
    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_user_record.id, -- Retorna Profile ID para o frontend (normalmente usado pra nada ou avatar)
            'nome', v_user_record.nome_completo,
            'avatar_url', v_user_record.avatar_url
        ),
        'vans', COALESCE(v_vans_json, '[]'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_registration_data(text) TO public;
GRANT EXECUTE ON FUNCTION public.get_public_registration_data(text) TO anon;
