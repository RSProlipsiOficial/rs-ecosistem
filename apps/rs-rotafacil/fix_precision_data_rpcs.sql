-- ==========================================================
-- SCRIPT DE CORREÇÃO: PRECISÃO DE DADOS & PERFORMANCE (ADMIN) v2
-- ==========================================================

-- 1. Atualizar get_admin_user_team_usage para ser mais robusto e performante
CREATE OR REPLACE FUNCTION public.get_admin_user_team_usage()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH user_counts AS (
        SELECT 
            u.id,
            (
                SELECT COUNT(*) FROM auth.users child 
                WHERE (
                    (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
                    OR (child.raw_user_meta_data->>'boss_id') = u.id::text
                    OR (child.raw_user_meta_data->>'created_by') = u.id::text
                )
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'motorista'
            ) as motoristas,
            (
                SELECT COUNT(*) FROM auth.users child 
                WHERE (
                    (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
                    OR (child.raw_user_meta_data->>'boss_id') = u.id::text
                    OR (child.raw_user_meta_data->>'created_by') = u.id::text
                )
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'monitora'
            ) as monitoras,
            (SELECT COUNT(*) FROM public.alunos a WHERE a.user_id = u.id) as alunos,
            (SELECT COUNT(*) FROM public.indicados i WHERE i.indicado_por_id = u.id) as indicados,
            (
                SELECT s.plan_id 
                FROM public.user_subscriptions s 
                WHERE s.user_id = u.id 
                AND s.status IN ('active', 'ativo')
                ORDER BY s.created_at DESC 
                LIMIT 1
            ) as plan_id
        FROM auth.users u
    )
    SELECT jsonb_object_agg(id, jsonb_build_object(
        'motoristas', motoristas,
        'monitoras', monitoras,
        'alunos', alunos,
        'indicados', indicados,
        'plan_id', plan_id
    )) INTO v_result
    FROM user_counts;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 2. Atualizar get_admin_billing_summary para considerar status 'ativo' e 'active'
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
    -- MRR: Total from active subscriptions joining with plans
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status IN ('active', 'ativo');

    -- Revenue: Total payments in last 30 days (somente aprovados/pagos)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.payment_history
    WHERE payment_status IN ('approved', 'paid', 'concluido', 'authorized')
      AND created_at > now() - interval '30 days';

    -- IA Revenue: Filter for IA related payments
    SELECT COALESCE(SUM(amount), 0) INTO v_ia_revenue
    FROM public.payment_history
    WHERE (description::text ILIKE '%IA%' OR description::text ILIKE '%Crédito%')
      AND payment_status IN ('approved', 'paid', 'concluido', 'authorized')
      AND created_at > now() - interval '30 days';

    -- Active Subscriptions count
    SELECT COUNT(*) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status IN ('active', 'ativo');

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

-- 3. Atualizar get_admin_growth_stats para ser mais preciso
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
        WHERE status IN ('active', 'ativo')
          AND created_at > now() - interval '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
    ) d;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 4. Criar RPC get_admin_users_list_v2 (Opcional - Melhoria de Performance)
-- Esta versão já retorna as contagens integradas para evitar o map gigante no frontend
CREATE OR REPLACE FUNCTION public.get_admin_users_list_v2(p_parent_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(u_data) INTO v_result
    FROM (
        SELECT 
            u.id,
            u.email,
            u.created_at,
            u.last_sign_in_at as ultimo_login,
            u.raw_user_meta_data as user_metadata,
            (u.raw_user_meta_data->>'status') as status,
            (u.raw_user_meta_data->>'tipo_usuario') as tipo_usuario,
            (u.raw_user_meta_data->>'nome') as nome,
            (u.raw_user_meta_data->>'telefone') as telefone,
            (u.raw_user_meta_data->>'cpf') as cpf,
            (u.raw_user_meta_data->>'sponsor_id') as sponsor_id,
            (
                SELECT COUNT(*) FROM auth.users child 
                WHERE (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
                   OR (child.raw_user_meta_data->>'boss_id') = u.id::text
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'motorista'
            ) as motoristas,
            (
                SELECT COUNT(*) FROM auth.users child 
                WHERE (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
                   OR (child.raw_user_meta_data->>'boss_id') = u.id::text
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'monitora'
            ) as monitoras,
            (SELECT COUNT(*) FROM public.alunos a WHERE a.user_id = u.id) as alunos,
            (SELECT COUNT(*) FROM public.indicados i WHERE i.indicado_por_id = u.id) as indicados
        FROM auth.users u
        WHERE (p_parent_id IS NULL AND (u.raw_user_meta_data->>'sponsor_id' IS NULL OR u.raw_user_meta_data->>'sponsor_id' = ''))
           OR (p_parent_id IS NOT NULL AND u.raw_user_meta_data->>'sponsor_id' = p_parent_id::text)
    ) u_data;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ==========================================================
-- FIM DO SCRIPT
-- ==========================================================
