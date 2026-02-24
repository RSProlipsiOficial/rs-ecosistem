import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- 1. Atualizar get_admin_user_team_usage
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
                    OR (child.raw_user_meta_data->>'minha_equipe') = u.id::text
                    OR (child.raw_user_meta_data->>'equipe') = u.id::text
                )
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'motorista'
            ) as motoristas,
            (
                SELECT COUNT(*) FROM auth.users child 
                WHERE (
                    (child.raw_user_meta_data->>'sponsor_id') = u.id::text 
                    OR (child.raw_user_meta_data->>'boss_id') = u.id::text
                    OR (child.raw_user_meta_data->>'created_by') = u.id::text
                    OR (child.raw_user_meta_data->>'minha_equipe') = u.id::text
                    OR (child.raw_user_meta_data->>'equipe') = u.id::text
                )
                AND (child.raw_user_meta_data->>'tipo_usuario') = 'monitora'
            ) as monitoras,
            (SELECT COUNT(*) FROM public.alunos a WHERE a.user_id = u.id) as alunos,
            (SELECT COUNT(*) FROM public.indicados i WHERE i.indicado_por_id = u.id) as indicados,
            (
                SELECT s.plan_id 
                FROM public.user_subscriptions s 
                WHERE s.user_id = u.id 
                AND s.status IN ('active', 'ativo', 'pago', 'paid', 'approved', 'confirmed')
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

-- 2. Atualizar get_admin_billing_summary (CORREÇÃO DE PAYMENT_STATUS E NOMES)
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
    -- MRR: Apenas planos ativos e confirmados
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status IN ('active', 'ativo', 'pago', 'paid', 'approved', 'confirmed');

    -- Total Revenue: Correção para usar payment_status da payment_history
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.payment_history
    WHERE payment_status IN ('approved', 'paid', 'concluido', 'authorized', 'confirmed')
      AND created_at > now() - interval '30 days';

    -- IA Revenue: Correção para usar payment_status
    SELECT COALESCE(SUM(amount), 0) INTO v_ia_revenue
    FROM public.payment_history
    WHERE (description::text ILIKE '%IA%' OR description::text ILIKE '%%Crédito%%')
      AND payment_status IN ('approved', 'paid', 'concluido', 'authorized', 'confirmed')
      AND created_at > now() - interval '30 days';

    -- Active Subs
    SELECT COUNT(DISTINCT user_id) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status IN ('active', 'ativo', 'pago', 'paid', 'approved', 'confirmed');

    -- Churn
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

-- 3. Atualizar get_admin_users_list (REVERTER DEFAULT 'ATIVO' PARA leads)
CREATE OR REPLACE FUNCTION public.get_admin_users_list(p_parent_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE email = auth.jwt() ->> 'email'
    ) INTO v_is_admin;

    IF v_is_admin THEN
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                u.id,
                u.email,
                COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'nome', 'Sem Nome') as nome,
                COALESCE(u.raw_user_meta_data->>'phone', u.raw_user_meta_data->>'telefone', '') as telefone,
                COALESCE(u.raw_user_meta_data->>'status', 'pendente') as status, -- MUDANÇA AQUI: Default pendente
                COALESCE(u.raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                u.created_at,
                u.raw_user_meta_data as user_metadata,
                (u.raw_user_meta_data->>'app') as app,
                (
                    SELECT s.plan_id 
                    FROM public.user_subscriptions s 
                    WHERE s.user_id = u.id 
                    AND s.status IN ('active', 'ativo', 'pago', 'paid', 'approved', 'confirmed')
                    ORDER BY s.created_at DESC 
                    LIMIT 1
                ) as plan_id
            FROM auth.users u
            WHERE (p_parent_id IS NULL AND (u.raw_user_meta_data->>'sponsor_id' IS NULL OR u.raw_user_meta_data->>'sponsor_id' = ''))
               OR (p_parent_id IS NOT NULL AND u.raw_user_meta_data->>'sponsor_id' = p_parent_id::text)
            ORDER BY u.created_at DESC
        ) u;
    ELSE
        SELECT jsonb_agg(u) INTO v_result
        FROM (
            SELECT 
                u.id,
                u.email,
                COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'nome', 'Sem Nome') as nome,
                COALESCE(u.raw_user_meta_data->>'phone', u.raw_user_meta_data->>'telefone', '') as telefone,
                COALESCE(u.raw_user_meta_data->>'status', 'pendente') as status, -- MUDANÇA AQUI
                COALESCE(u.raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                u.created_at,
                u.raw_user_meta_data as user_metadata,
                (u.raw_user_meta_data->>'app') as app,
                (
                    SELECT s.plan_id 
                    FROM public.user_subscriptions s 
                    WHERE s.user_id = u.id 
                    AND s.status IN ('active', 'ativo', 'pago', 'paid', 'approved', 'confirmed')
                    ORDER BY s.created_at DESC 
                    LIMIT 1
                ) as plan_id
            FROM auth.users u
            WHERE 
                (u.raw_user_meta_data->>'sponsor_id')::uuid = auth.uid() OR
                (u.raw_user_meta_data->>'boss_id')::uuid = auth.uid() OR
                (u.raw_user_meta_data->>'created_by')::uuid = auth.uid() OR
                u.id = auth.uid()
            ORDER BY u.created_at DESC
        ) u;
    END IF;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;
`;

const client = new pg.Client({ connectionString });

async function apply() {
    try {
        console.log('--- Iniciando aplicação das correções SQL v2 ---');
        await client.connect();
        await client.query(sql);
        console.log('Sucesso: As funções RPC foram atualizadas.');
    } catch (err) {
        console.error('ERRO:', err);
    } finally {
        await client.end();
    }
}

apply();
