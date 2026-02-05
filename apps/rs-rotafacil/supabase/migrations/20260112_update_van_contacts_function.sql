-- Função v2 para buscar contatos da van com dados atualizados dos perfis
CREATE OR REPLACE FUNCTION public.get_van_contacts(p_van_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id UUID;
    v_owner_name TEXT;
    v_owner_phone TEXT;
    v_contacts JSONB := '[]'::JSONB;
    v_record RECORD;
BEGIN
    -- 1. Buscar o dono da van
    SELECT user_id INTO v_owner_id FROM public.vans WHERE id = p_van_id;
    
    -- 2. Buscar dados do dono em user_profiles ou fallback para auth.users metadata
    SELECT 
        COALESCE(up.nome_completo, (u.raw_user_meta_data->>'nome_completo'), (u.raw_user_meta_data->>'name'), 'Dono da Empresa'),
        COALESCE(up.telefone, (u.raw_user_meta_data->>'telefone'), (u.raw_user_meta_data->>'phone'), '')
    INTO v_owner_name, v_owner_phone
    FROM auth.users u
    LEFT JOIN public.user_profiles up ON up.user_id = u.id
    WHERE u.id = v_owner_id;

    -- Adicionar dono
    v_contacts := v_contacts || jsonb_build_object(
        'role', 'dono',
        'name', v_owner_name,
        'phone', v_owner_phone
    );

    -- 3. Buscar Motoristas e Monitoras vinculados a esta van/dono
    FOR v_record IN (
        SELECT 
            u.id,
            COALESCE(up.nome_completo, (u.raw_user_meta_data->>'nome_completo'), (u.raw_user_meta_data->>'name'), 'Colaborador') as nome,
            COALESCE(up.telefone, (u.raw_user_meta_data->>'telefone'), (u.raw_user_meta_data->>'phone'), '') as telefone,
            LOWER(COALESCE(u.raw_user_meta_data->>'tipo_usuario', u.raw_user_meta_data->>'user_type', '')) as tipo
        FROM auth.users u
        LEFT JOIN public.user_profiles up ON up.user_id = u.id
        WHERE (
            -- Vínculo por van_id nos metadados
            (u.raw_user_meta_data->>'van_id')::UUID = p_van_id
            OR 
            -- Vínculo por boss_id/sponsor_id e tipo correto
            (
                (u.raw_user_meta_data->>'boss_id')::UUID = v_owner_id 
                AND 
                (u.raw_user_meta_data->>'tipo_usuario' IN ('motorista', 'monitora'))
            )
        )
        AND u.deleted_at IS NULL
    ) LOOP
        v_contacts := v_contacts || jsonb_build_object(
            'role', v_record.tipo,
            'name', v_record.nome,
            'phone', v_record.telefone
        );
    END LOOP;

    RETURN v_contacts;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_van_contacts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_van_contacts(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_van_contacts(UUID) TO service_role;
