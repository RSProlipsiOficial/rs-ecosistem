import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

const sql = `
-- 1. get_admin_billing_summary: Filtrar apenas STATUS = 'active'
CREATE OR REPLACE FUNCTION public.get_admin_billing_summary()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_mrr NUMERIC := 0;
    v_total_revenue NUMERIC := 0;
    v_ia_revenue NUMERIC := 0;
    v_active_subs INTEGER := 0;
    v_churn_rate NUMERIC := 0;
BEGIN
    -- MRR: Somente Ativos (Exclui trial/degustação)
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status = 'active';

    -- Active Subscriptions count (Ativas): Exclui trial
    SELECT COUNT(DISTINCT user_id) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status = 'active';

    -- Churn Rate
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'cancelled' AND updated_at > now() - interval '30 days')::NUMERIC * 100 / COUNT(*)::NUMERIC
        END INTO v_churn_rate
    FROM public.user_subscriptions;

    RETURN jsonb_build_object(
      'mrr', v_mrr,
      'total_revenue', v_total_revenue,
      'ia_revenue', v_ia_revenue,
      'active_subscriptions', v_active_subs,
      'churn_rate', v_churn_rate
    );
END;
$function$;

-- 2. get_admin_users_list: Priorizar status da assinatura
CREATE OR REPLACE FUNCTION public.get_admin_users_list(p_parent_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'nome', COALESCE(u.raw_user_meta_data->>'nome', u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', 'Sem Nome'),
            'telefone', COALESCE(u.raw_user_meta_data->>'telefone', u.raw_user_meta_data->>'phone', ''),
            'status', COALESCE((SELECT status FROM public.user_subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1), u.raw_user_meta_data->>'status', 'ativo'),
            'tipo_usuario', COALESCE(u.raw_user_meta_data->>'tipo_usuario', u.raw_user_meta_data->>'user_type', 'usuario'),
            'app', u.raw_user_meta_data->>'app',
            'plan_id', (SELECT plan_id FROM public.user_subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
            'expires_at', (SELECT expires_at FROM public.user_subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
            'created_at', u.created_at,
            'last_sign_in_at', u.last_sign_in_at
        )
    ) INTO result
    FROM auth.users u
    WHERE (
        p_parent_id IS NULL OR 
        u.raw_user_meta_data->>'sponsor_id' = p_parent_id::text OR 
        u.raw_user_meta_data->>'sponsor_user_id' = p_parent_id::text OR 
        u.raw_user_meta_data->>'boss_id' = p_parent_id::text OR
        (p_parent_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'::uuid AND u.raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
    );

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;
`;

async function apply() {
    try {
        await pool.query(sql);
        console.log('✅ RPCs get_admin_billing_summary e get_admin_users_list atualizadas!');
    } catch (err) {
        console.error('❌ Erro:', err);
    } finally {
        await pool.end();
    }
}
apply();
