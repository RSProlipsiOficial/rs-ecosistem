-- ==========================================================
-- SCRIPT DE CORREÇÃO: CONTAGEM DE EQUIPE (V3)
-- Execute este script no SQL Editor do seu Supabase
-- ==========================================================

CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_object_agg(u.id, jsonb_build_object(
        'motoristas', (
            SELECT COUNT(*) FROM auth.users child 
            WHERE (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
              AND (child.raw_user_meta_data->>'tipo_usuario') = 'motorista'
        ),
        'monitoras', (
            SELECT COUNT(*) FROM auth.users child 
            WHERE (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
              AND (child.raw_user_meta_data->>'tipo_usuario') = 'monitora'
        ),
        'alunos', (SELECT COUNT(*) FROM public.alunos a WHERE a.user_id = u.id),
        'indicados', (SELECT COUNT(*) FROM public.indicados i WHERE i.indicado_por_id = u.id)
    )) INTO v_result
    FROM auth.users u;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ==========================================================
-- SCRIPT FINALIZADO
-- ==========================================================
