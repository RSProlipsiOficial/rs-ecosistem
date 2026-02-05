-- 1. Corrigir get_admin_user_team_usage (Dashboards/Filtros)
CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_motoristas int;
    v_monitoras int;
    v_indicados int;
    v_alunos int;
    v_plan_id uuid;
    v_plan_name text;
BEGIN
    -- Contar Motoristas (resiliente a metadados)
    SELECT COUNT(*)::int INTO v_motoristas
    FROM auth.users
    WHERE (
      raw_user_meta_data->>'boss_id' = p_user_id::text
      OR raw_user_meta_data->>'equipe' = p_user_id::text
    )
    AND (
      raw_user_meta_data->>'user_type' = 'motorista'
      OR raw_user_meta_data->>'tipo_usuario' = 'motorista'
    );

    -- Contar Monitoras
    SELECT COUNT(*)::int INTO v_monitoras
    FROM auth.users
    WHERE (
      raw_user_meta_data->>'boss_id' = p_user_id::text
      OR raw_user_meta_data->>'equipe' = p_user_id::text
    )
    AND (
      raw_user_meta_data->>'user_type' = 'monitora'
      OR raw_user_meta_data->>'tipo_usuario' = 'monitora'
    );

    -- Contar Indicados (owners, consultores, indicados)
    SELECT COUNT(*)::int INTO v_indicados
    FROM auth.users
    WHERE (
      raw_user_meta_data->>'sponsor_id' = p_user_id::text 
      OR raw_user_meta_data->>'boss_id' = p_user_id::text
    )
    AND (
      raw_user_meta_data->>'tipo_usuario' IN ('owner', 'indicado', 'consultor')
      OR raw_user_meta_data->>'user_type' IN ('owner', 'indicado', 'consultor')
    )
    AND auth.users.id != p_user_id; -- Não contar a si mesmo

    -- Contar Alunos (total da equipe)
    SELECT COUNT(*)::int INTO v_alunos
    FROM alunos a
    WHERE a.van_id IN (
      SELECT id FROM vans WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE (raw_user_meta_data->>'boss_id' = p_user_id::text OR id = p_user_id)
      )
    );

    -- Plano atual
    SELECT sp.id, sp.name INTO v_plan_id, v_plan_name
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC LIMIT 1;

    RETURN json_build_object(
        'motoristas', COALESCE(v_motoristas, 0),
        'monitoras', COALESCE(v_monitoras, 0),
        'indicados', COALESCE(v_indicados, 0),
        'alunos', COALESCE(v_alunos, 0),
        'plan_id', v_plan_id,
        'plan_name', v_plan_name
    );
END;
$function$;

-- 2. Corrigir get_admin_users_list (Cards na listagem)
CREATE OR REPLACE FUNCTION public.get_admin_users_list(p_search text DEFAULT NULL::text, p_role_filter text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, email text, created_at timestamptz, name text, full_name text, phone text, whatsapp text, documento text, cpf text, cnpj text, status text, user_type text, tipo_usuario text, app text, boss_id text, sponsor_id text, subscription jsonb, stats jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    (au.raw_user_meta_data->>'name')::text as name,
    (au.raw_user_meta_data->>'full_name')::text as full_name,
    (au.raw_user_meta_data->>'phone')::text as phone,
    (au.raw_user_meta_data->>'whatsapp')::text as whatsapp,
    (au.raw_user_meta_data->>'documento')::text as documento,
    (au.raw_user_meta_data->>'cpf')::text as cpf,
    (au.raw_user_meta_data->>'cnpj')::text as cnpj,
    (au.raw_user_meta_data->>'status')::text as status,
    (au.raw_user_meta_data->>'user_type')::text as user_type,
    (au.raw_user_meta_data->>'tipo_usuario')::text as tipo_usuario,
    (au.raw_user_meta_data->>'app')::text as app,
    (au.raw_user_meta_data->>'boss_id')::text as boss_id,
    (au.raw_user_meta_data->>'sponsor_id')::text as sponsor_id,
    (
      SELECT jsonb_build_object(
        'plan_name', sp.name,
        'status', us.status,
        'expires_at', us.expires_at
      )
      FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = au.id
      ORDER BY us.created_at DESC
      LIMIT 1
    ) as subscription,
    (
      SELECT jsonb_build_object(
        'motoristas', (
            SELECT COUNT(*)::int FROM auth.users u2 
            WHERE (u2.raw_user_meta_data->>'boss_id' = au.id::text OR u2.raw_user_meta_data->>'equipe' = au.id::text)
            AND (u2.raw_user_meta_data->>'user_type' = 'motorista' OR u2.raw_user_meta_data->>'tipo_usuario' = 'motorista')
        ),
        'monitoras', (
            SELECT COUNT(*)::int FROM auth.users u2 
            WHERE (u2.raw_user_meta_data->>'boss_id' = au.id::text OR u2.raw_user_meta_data->>'equipe' = au.id::text)
            AND (u2.raw_user_meta_data->>'user_type' = 'monitora' OR u2.raw_user_meta_data->>'tipo_usuario' = 'monitora')
        ),
        'indicados', (
            SELECT COUNT(*)::int FROM auth.users u3 
            WHERE (u3.raw_user_meta_data->>'sponsor_id' = au.id::text OR u3.raw_user_meta_data->>'boss_id' = au.id::text)
            AND (u3.raw_user_meta_data->>'tipo_usuario' IN ('owner', 'indicado', 'consultor') OR u3.raw_user_meta_data->>'user_type' IN ('owner', 'indicado', 'consultor'))
            AND u3.id != au.id
        ),
        'alunos', (
            SELECT COUNT(*)::int FROM public.alunos a 
            WHERE a.van_id IN (SELECT id FROM public.vans v WHERE v.user_id IN (
                SELECT id FROM auth.users u4 WHERE u4.raw_user_meta_data->>'boss_id' = au.id::text OR u4.id = au.id
            ))
        )
      )
    ) as stats
  FROM auth.users au
  WHERE (p_search IS NULL OR au.email ILIKE '%' || p_search || '%' OR (au.raw_user_meta_data->>'name') ILIKE '%' || p_search || '%')
  AND (p_role_filter IS NULL OR au.raw_user_meta_data->>'user_type' = p_role_filter OR au.raw_user_meta_data->>'tipo_usuario' = p_role_filter)
  ORDER BY au.created_at DESC;
END;
$function$;
