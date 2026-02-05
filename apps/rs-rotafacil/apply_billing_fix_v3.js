import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

const sql = `
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
    -- MRR: Somente Ativos do APP RotaFácil (Exclui master principal e trials)
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    JOIN auth.users u ON s.user_id = u.id
    WHERE s.status = 'active'
    AND (u.raw_user_meta_data->>'tipo_usuario' IN ('master', 'owner') OR u.raw_user_meta_data->>'user_type' IN ('master', 'owner'))
    AND u.raw_user_meta_data->>'app' = 'rotafacil';

    -- Active Subscriptions count (Ativas): Somente clientes do produto
    SELECT COUNT(DISTINCT s.user_id) INTO v_active_subs
    FROM public.user_subscriptions s
    JOIN auth.users u ON s.user_id = u.id
    WHERE s.status = 'active'
    AND (u.raw_user_meta_data->>'tipo_usuario' IN ('master', 'owner') OR u.raw_user_meta_data->>'user_type' IN ('master', 'owner'))
    AND u.raw_user_meta_data->>'app' = 'rotafacil';

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
`;

async function apply() {
    try {
        await pool.query(sql);
        console.log('✅ RPC get_admin_billing_summary atualizada! Agora o filtro é App=RotaFacil e Tipo=Master/Owner.');
    } catch (err) {
        console.error('❌ Erro:', err);
    } finally {
        await pool.end();
    }
}
apply();
