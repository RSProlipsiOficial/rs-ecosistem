import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
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
                SELECT count(*) FROM auth.users sub_u
                WHERE (sub_u.raw_user_meta_data->>'sponsor_id' = u.id::text OR (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND sub_u.raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'))
                AND COALESCE(sub_u.raw_user_meta_data->>'tipo_usuario', sub_u.raw_user_meta_data->>'user_type') = 'motorista'
            ),
            'monitoras', (
                SELECT count(*) FROM auth.users sub_u
                WHERE (sub_u.raw_user_meta_data->>'sponsor_id' = u.id::text OR (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND sub_u.raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'))
                AND COALESCE(sub_u.raw_user_meta_data->>'tipo_usuario', sub_u.raw_user_meta_data->>'user_type') = 'monitora'
            ),
            'indicados', (
                SELECT count(*) FROM auth.users sub_u
                WHERE (sub_u.raw_user_meta_data->>'sponsor_id' = u.id::text OR (u.id::text = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' AND sub_u.raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'))
                AND COALESCE(sub_u.raw_user_meta_data->>'tipo_usuario', sub_u.raw_user_meta_data->>'user_type') NOT IN ('motorista', 'monitora')
                AND sub_u.id <> u.id
            ),
            'alunos', (
                SELECT count(*) FROM public.alunos al
                WHERE al.van_id IN (SELECT v.id FROM public.vans v WHERE v.user_id = u.id)
            ),
            'plan_id', (
                SELECT subs.plan_id FROM public.user_subscriptions subs
                WHERE subs.user_id = u.id AND subs.status IN ('active', 'trial') 
                ORDER BY subs.created_at DESC LIMIT 1
            )
        )
    ) INTO result
    FROM auth.users u;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;
`;
async function main() {
    try {
        await pool.query(sql);
        console.log('✅ RPC get_admin_user_team_usage atualizada com sucesso!');
    } catch (e) {
        console.error('❌ Erro:', e);
    } finally {
        await pool.end();
    }
}
main();
