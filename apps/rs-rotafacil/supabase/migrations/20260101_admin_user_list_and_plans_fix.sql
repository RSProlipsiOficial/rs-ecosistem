-- Fix User List Visibility, Rename Plans and Upgrade Roberto
-- Date: 2026-01-01

-- 1. Fix get_admin_users_list RPC
-- This was likely missing or restricted, causing the "None found" issue for Roberto.
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    -- Check if the current user is a Super Admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE email = auth.jwt() ->> 'email'
    ) INTO v_is_admin;

    IF v_is_admin THEN
        -- Return all users for Super Admin
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                id,
                email,
                raw_user_meta_data->>'name' as nome,
                raw_user_meta_data->>'phone' as telefone,
                COALESCE(raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                created_at,
                raw_user_meta_data as user_metadata
            FROM auth.users
            ORDER BY created_at DESC
        ) u;
    ELSE
        -- Return filtered users (same team/sponsor) for others
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                id,
                email,
                raw_user_meta_data->>'name' as nome,
                raw_user_meta_data->>'phone' as telefone,
                COALESCE(raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                created_at,
                raw_user_meta_data as user_metadata
            FROM auth.users
            WHERE 
                (raw_user_meta_data->>'sponsor_id')::uuid = auth.uid() OR
                (raw_user_meta_data->>'boss_id')::uuid = auth.uid() OR
                (raw_user_meta_data->>'created_by')::uuid = auth.uid() OR
                (raw_user_meta_data->>'minha_equipe')::uuid = auth.uid() OR
                (raw_user_meta_data->>'equipe')::uuid = auth.uid() OR
                id = auth.uid()
            ORDER BY created_at DESC
        ) u;
    END IF;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 2. Standardize Plan Names
-- Based on: "Inicial, Crescimento e Profissional"
UPDATE public.subscription_plans SET name = 'Inicial', plan_type = 'inicial' WHERE plan_type = 'basico' OR name ILIKE '%Básico%';
UPDATE public.subscription_plans SET name = 'Crescimento', plan_type = 'crescimento' WHERE plan_type = 'premium' OR name ILIKE '%Premium%' OR name = 'Plano Crescimento';
UPDATE public.subscription_plans SET name = 'Profissional', plan_type = 'profissional' WHERE plan_type = 'empresarial' OR name ILIKE '%Empresarial%' OR name = 'Plano Profissional (Vans)';

-- 3. Upgrade Roberto's Account to Unlimited
-- User: rsprolipsioficial@gmail.com (d107da4e-e266-41b0-947a-0c66b2f2b9ef)
-- Plan: Ilimitado (980e00d8-bac3-4aa0-8470-30d6d033b928)
UPDATE public.user_subscriptions 
SET 
    plan_id = '980e00d8-bac3-4aa0-8470-30d6d033b928',
    status = 'active',
    expires_at = '2099-12-31 23:59:59+00'
WHERE user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

-- Ensure he is in admin_emails
INSERT INTO public.admin_emails (email)
VALUES ('rsprolipsioficial@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 4. Exclude Ilimitado from Financial Dashboard
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
    -- MRR: Total from active subscriptions filtering out Ilimitado or accounts from admin_emails
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status = 'active'
      AND p.plan_type != 'ilimitado' -- Exclude free/unlimited from MRR
      AND s.user_id NOT IN (SELECT id FROM auth.users WHERE email IN (SELECT email FROM public.admin_emails));

    -- Revenue: Total payments in last 30 days
    -- (No exclusion here as payments are real money, but admin accounts usually don't have payments)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.payment_history
    WHERE created_at > now() - interval '30 days';

    -- IA Revenue
    SELECT COALESCE(SUM(amount), 0) INTO v_ia_revenue
    FROM public.payment_history
    WHERE (description::text ILIKE '%IA%' OR description::text ILIKE '%Crédito%')
      AND created_at > now() - interval '30 days';

    -- Active Subscriptions count (excluding admins)
    SELECT COUNT(*) INTO v_active_subs
    FROM public.user_subscriptions s
    WHERE s.status = 'active'
      AND s.user_id NOT IN (SELECT id FROM auth.users WHERE email IN (SELECT email FROM public.admin_emails));

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
