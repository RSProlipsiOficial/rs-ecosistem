import pg from 'pg';
const client = new pg.Pool({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

const sql = `
-- Fix get_admin_users_list to be role-name agnostic
CREATE OR REPLACE FUNCTION public.get_admin_users_list(p_parent_id uuid DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE email = auth.jwt() ->> 'email'
    ) INTO v_is_admin;

    IF v_is_admin AND p_parent_id IS NULL THEN
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                id,
                email,
                COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'nome', 'Sem Nome') as nome,
                COALESCE(raw_user_meta_data->>'phone', raw_user_meta_data->>'telefone', raw_user_meta_data->>'whatsapp', '') as telefone,
                COALESCE(raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type', 'usuario') as tipo_usuario,
                created_at,
                raw_user_meta_data as user_metadata
            FROM auth.users
            ORDER BY created_at DESC
        ) u;
    ELSE
        -- If p_parent_id is null, it might be the admin looking at their main list
        -- We need to handle the 'rsprolipsi' legacy handle here too
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                id,
                email,
                COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'nome', 'Sem Nome') as nome,
                COALESCE(raw_user_meta_data->>'phone', raw_user_meta_data->>'telefone', raw_user_meta_data->>'whatsapp', '') as telefone,
                COALESCE(raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type', 'usuario') as tipo_usuario,
                created_at,
                raw_user_meta_data as user_metadata
            FROM auth.users
            WHERE 
                (raw_user_meta_data->>'sponsor_id' = COALESCE(p_parent_id, auth.uid())::text) OR
                (raw_user_meta_data->>'sponsor_user_id' = COALESCE(p_parent_id, auth.uid())::text) OR
                (raw_user_meta_data->>'boss_id' = COALESCE(p_parent_id, auth.uid())::text) OR
                (raw_user_meta_data->>'minha_equipe' = COALESCE(p_parent_id, auth.uid())::text) OR
                (
                    (COALESCE(p_parent_id, auth.uid()) = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef') AND 
                    (raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                ) OR
                id = COALESCE(p_parent_id, auth.uid())
            ORDER BY created_at DESC
        ) u;
    END IF;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Fix get_admin_user_team_usage to be role-name agnostic
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
            'motoristas', (
                SELECT count(*) FROM auth.users 
                WHERE (
                    raw_user_meta_data->>'sponsor_id' = u.id::text OR 
                    raw_user_meta_data->>'sponsor_user_id' = u.id::text OR
                    raw_user_meta_data->>'boss_id' = u.id::text OR 
                    raw_user_meta_data->>'minha_equipe' = u.id::text OR 
                    raw_user_meta_data->>'equipe' = u.id::text OR
                    (u.id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                ) AND (
                    COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') = 'motorista'
                )
            ),
            'monitoras', (
                SELECT count(*) FROM auth.users 
                WHERE (
                    raw_user_meta_data->>'sponsor_id' = u.id::text OR 
                    raw_user_meta_data->>'sponsor_user_id' = u.id::text OR
                    raw_user_meta_data->>'boss_id' = u.id::text OR 
                    raw_user_meta_data->>'minha_equipe' = u.id::text OR 
                    raw_user_meta_data->>'equipe' = u.id::text OR
                    (u.id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                ) AND (
                    COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') = 'monitora'
                )
            ),
            'indicados', (
                SELECT count(*) FROM auth.users 
                WHERE (
                    raw_user_meta_data->>'sponsor_id' = u.id::text OR 
                    raw_user_meta_data->>'sponsor_user_id' = u.id::text OR
                    raw_user_meta_data->>'boss_id' = u.id::text OR
                    (u.id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                )
                AND (
                    COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') IN ('owner', 'indicado', 'consultor', 'usuario', 'master')
                )
            ),
            'alunos', (SELECT count(*) FROM public.alunos WHERE created_by = u.id OR user_id = u.id),
            'plan_id', (SELECT plan_id FROM public.user_subscriptions WHERE user_id = u.id AND status IN ('active', 'trial') ORDER BY created_at DESC LIMIT 1)
        )
    ) INTO result
    FROM auth.users u;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;
`;

async function run() {
    try {
        await client.query(sql);
        console.log('RPCs fixadas com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar RPCs:', err);
    } finally {
        await client.end();
    }
}

run();
