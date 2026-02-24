-- ==========================================================
-- SCRIPT DE ATUALIZAÇÃO DE CONTAGEM DA EQUIPE
-- Execute este script no SQL Editor do seu Supabase
-- ==========================================================

CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_object_agg(u.id, jsonb_build_object(
        'motoristas', (SELECT COUNT(*) FROM public.motoristas m WHERE m.user_id = u.id),
        'monitoras', (SELECT COUNT(*) FROM public.monitoras mon WHERE mon.user_id = u.id),
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
