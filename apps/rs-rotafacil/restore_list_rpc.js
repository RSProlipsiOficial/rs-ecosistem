import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

const sql = `
CREATE OR REPLACE FUNCTION public.get_admin_users_list(p_parent_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result jsonb;
BEGIN
    -- Versão Restaurada: Se não houver pai, retorna TODOS os usuários (comportamento original)
    -- Se houver pai, retorna os vinculados (incluindo o slug legado para o Admin)
    
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'nome', COALESCE(u.raw_user_meta_data->>'nome', u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', 'Sem Nome'),
            'telefone', COALESCE(u.raw_user_meta_data->>'telefone', u.raw_user_meta_data->>'phone', ''),
            'status', COALESCE(u.raw_user_meta_data->>'status', 'ativo'),
            'tipo_usuario', COALESCE(u.raw_user_meta_data->>'tipo_usuario', u.raw_user_meta_data->>'user_type', 'usuario'),
            'created_at', u.created_at,
            'last_sign_in_at', u.last_sign_in_at,
            'raw_user_meta_data', u.raw_user_meta_data
        )
    ) INTO result
    FROM auth.users u
    WHERE (
        p_parent_id IS NULL OR 
        (p_parent_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'::uuid AND (u.raw_user_meta_data->>'sponsor_id' = p_parent_id::text OR u.raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')) OR
        (u.raw_user_meta_data->>'sponsor_id' = p_parent_id::text OR u.raw_user_meta_data->>'sponsor_user_id' = p_parent_id::text)
    );

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;
`;

async function apply() {
    try {
        await pool.query(sql);
        console.log('✅ RPC get_admin_users_list restaurada para comportamento original (Todos os usuários ao carregar).');
    } catch (err) {
        console.error('❌ Erro:', err);
    } finally {
        await pool.end();
    }
}

apply();
