-- Fix Admin Dashboard RPCs
-- Date: 2026-01-31

-- 1. Correct get_admin_user_team_usage to include Alunos and Indicados
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
        'indicados', (SELECT COUNT(*) FROM auth.users sub WHERE (sub.raw_user_meta_data->>'sponsor_id')::uuid = u.id)
    )) INTO v_result
    FROM auth.users u;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 2. Robust get_admin_billing_summary (Include Trial/All Plans)
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
    -- MRR: Total from active or trial subscriptions joining with plans
    -- Roberto wants to see the potential/real MRR
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status IN ('active', 'trial');

    -- Revenue: Total payments in last 30 days
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.payment_history
    WHERE created_at > now() - interval '30 days';

    -- IA Revenue
    SELECT COALESCE(SUM(amount), 0) INTO v_ia_revenue
    FROM public.payment_history
    WHERE (description::text ILIKE '%IA%' OR description::text ILIKE '%Crédito%')
      AND created_at > now() - interval '30 days';

    -- Active + Trial Subscriptions count
    SELECT COUNT(*) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status IN ('active', 'trial');

    -- Churn Rate
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
