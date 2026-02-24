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
    -- Esta função retorna um mapa onde a chave é o ID do usuário (UUID) 
    -- e o valor é um objeto com as contagens de sua equipe.
    -- Especial: Para o Admin Rs Prólipsi, somamos os vínculos por UUID e pelo slug 'rsprolipsi'
    
    SELECT jsonb_object_agg(u.id, 
        jsonb_build_object(
            'motoristas', (
                SELECT count(*) FROM auth.users 
                WHERE (
                    raw_user_meta_data->>'sponsor_id' = u.id::text OR 
                    raw_user_meta_data->>'sponsor_user_id' = u.id::text OR
                    raw_user_meta_data->>'boss_id' = u.id::text OR 
                    raw_user_meta_data->>'equipe' = u.id::text OR
                    (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
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
                    raw_user_meta_data->>'equipe' = u.id::text OR
                    (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
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
                    (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
                )
                AND (
                    COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') IN ('owner', 'indicado', 'consultor', 'usuario', 'master')
                    AND u.id::text <> auth.users.id::text -- Não contar a si mesmo
                )
            ),
            'alunos', (
                -- Alunos são contados na tabela public.alunos
                SELECT count(*) FROM public.alunos 
                WHERE created_by = u.id OR user_id = u.id
            ),
            'plan_id', (
                SELECT plan_id FROM public.user_subscriptions 
                WHERE user_id = u.id AND status IN ('active', 'trial') 
                ORDER BY created_at DESC LIMIT 1
            )
        )
    ) INTO result
    FROM auth.users u;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;
`;

async function apply() {
    try {
        await client.query(sql);
        console.log('✅ RPC get_admin_user_team_usage atualizada com sucesso (Suporte RSPrólipsi + Alunos)');
    } catch (err) {
        console.error('❌ Erro ao atualizar RPC:', err);
    } finally {
        await client.end();
    }
}

apply();
