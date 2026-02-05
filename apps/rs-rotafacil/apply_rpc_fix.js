import pg from 'pg';
const client = new pg.Pool({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

const sql = `
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
                ) AND (raw_user_meta_data->>'tipo_usuario' = 'motorista' OR raw_user_meta_data->>'user_type' = 'motorista')
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
                ) AND (raw_user_meta_data->>'tipo_usuario' = 'monitora' OR raw_user_meta_data->>'user_type' = 'monitora')
            ),
            'indicados', (
                SELECT count(*) FROM auth.users 
                WHERE (
                    raw_user_meta_data->>'sponsor_id' = u.id::text OR 
                    raw_user_meta_data->>'sponsor_user_id' = u.id::text OR
                    raw_user_meta_data->>'boss_id' = u.id::text OR
                    (u.id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                )
                AND (raw_user_meta_data->>'tipo_usuario' IN ('owner', 'indicado', 'consultor', 'usuario') OR raw_user_meta_data->>'user_type' IN ('owner', 'indicado', 'consultor', 'usuario'))
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
        console.log('RPC get_admin_user_team_usage atualizada com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar RPC:', err);
    } finally {
        await client.end();
    }
}

run();
