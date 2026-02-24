-- Fix for get_admin_billing_summary with enum casting
CREATE OR REPLACE FUNCTION public.get_admin_billing_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mrr NUMERIC;
    v_total_revenue NUMERIC;
    v_ia_revenue NUMERIC;
    v_active_subs INTEGER;
    v_churn_rate NUMERIC;
BEGIN
    -- MRR: Total from active subscriptions (filtering by typical monthly/annual patterns)
    -- We cast the enum to text to use it in calculations or filtering if needed
    SELECT COALESCE(SUM(valor), 0) INTO v_mrr
    FROM public.user_subscriptions
    WHERE status = 'active';

    -- Revenue: Total payments in last 30 days
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.payment_history
    WHERE created_at > now() - interval '30 days';

    -- IA Revenue: Simplified filter for IA related payments
    SELECT COALESCE(SUM(amount), 0) INTO v_ia_revenue
    FROM public.payment_history
    WHERE (description::text ILIKE '%IA%' OR description::text ILIKE '%Crédito%')
      AND created_at > now() - interval '30 days';

    -- Active Subscriptions count
    SELECT COUNT(*) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status = 'active';

    -- Simplified Churn (canceled in last 30 days vs total)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'canceled' AND updated_at > now() - interval '30 days')::NUMERIC * 100 / COUNT(*)::NUMERIC 
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
$$;

-- Ensure get_admin_growth_stats exists
CREATE OR REPLACE FUNCTION public.get_admin_growth_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(d) INTO v_result
    FROM (
        SELECT 
            date_trunc('day', created_at)::date as date,
            COUNT(*) as new_activations
        FROM public.user_subscriptions
        WHERE created_at > now() - interval '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
    ) d;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Ensure get_admin_user_team_usage exists (fixing potential auth.users access)
CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- We use a lateral join or separate selects to avoid auth.users direct access issues if not superuser
    -- but SECURITY DEFINER should handle it if the function owner has access.
    SELECT jsonb_object_agg(u_id, jsonb_build_object(
        'motoristas', m_count,
        'monitoras', mon_count
    )) INTO v_result
    FROM (
        SELECT 
            id as u_id,
            (SELECT COUNT(*) FROM public.motoristas m WHERE m.user_id = auth.users.id) as m_count,
            (SELECT COUNT(*) FROM public.monitoras mon WHERE mon.user_id = auth.users.id) as mon_count
        FROM auth.users
    ) stats;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;
