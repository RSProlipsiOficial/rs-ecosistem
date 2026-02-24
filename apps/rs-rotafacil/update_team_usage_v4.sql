CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_object_agg(u.id, 
        jsonb_build_object(
            'motoristas', (SELECT count(*) FROM auth.users WHERE (raw_user_meta_data->>'sponsor_id' = u.id::text OR raw_user_meta_data->>'boss_id' = u.id::text OR raw_user_meta_data->>'created_by' = u.id::text OR raw_user_meta_data->>'minha_equipe' = u.id::text OR raw_user_meta_data->>'equipe' = u.id::text) AND (raw_user_meta_data->>'tipo_usuario' = 'motorista')),
            'monitoras', (SELECT count(*) FROM auth.users WHERE (raw_user_meta_data->>'sponsor_id' = u.id::text OR raw_user_meta_data->>'boss_id' = u.id::text OR raw_user_meta_data->>'created_by' = u.id::text OR raw_user_meta_data->>'minha_equipe' = u.id::text OR raw_user_meta_data->>'equipe' = u.id::text) AND (raw_user_meta_data->>'tipo_usuario' = 'monitora')),
            'indicados', (
                SELECT count(*) FROM auth.users 
                WHERE (raw_user_meta_data->>'sponsor_id' = u.id::text OR raw_user_meta_data->>'boss_id' = u.id::text OR raw_user_meta_data->>'created_by' = u.id::text)
                AND (raw_user_meta_data->>'tipo_usuario' = 'owner' OR raw_user_meta_data->>'tipo_usuario' = 'indicado')
            ),
            'alunos', (SELECT count(*) FROM public.alunos WHERE created_by = u.id OR user_id = u.id),
            'plan_id', (SELECT plan_id FROM public.user_subscriptions WHERE user_id = u.id AND status IN ('active', 'trial') ORDER BY created_at DESC LIMIT 1)
        )
    ) INTO result
    FROM auth.users u;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;
