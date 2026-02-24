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
                AND s.status IN ('active', 'trial')
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

-- 2. Atualizar get_admin_billing_summary
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
    -- MRR: Total from active/trialing subscriptions joining with plans
    SELECT COALESCE(SUM(p.price), 0) INTO v_mrr
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status IN ('active', 'trial')
      AND p.plan_type != 'ilimitado';

    -- Revenue: Total from subscriptions (since payment_history is empty)
    -- As a fallback, we use the MRR for total revenue if history is empty
    SELECT COALESCE(SUM(p.price), 0) INTO v_total_revenue
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.status IN ('active', 'trial');

    -- IA Revenue (Zero for now as no payment table found with data)
    v_ia_revenue := 0;

    -- Active Subscriptions count (Apps Vendidos)
    SELECT COUNT(DISTINCT user_id) INTO v_active_subs
    FROM public.user_subscriptions
    WHERE status IN ('active', 'trial');

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
$$;

-- 3. Atualizar get_admin_users_list
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
                COALESCE(u.raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(u.raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                u.created_at,
                u.raw_user_meta_data as user_metadata,
                (u.raw_user_meta_data->>'app') as app,
                (
                    SELECT s.plan_id 
                    FROM public.user_subscriptions s 
                    WHERE s.user_id = u.id 
                    AND s.status IN ('active', 'trial')
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
                COALESCE(u.raw_user_meta_data->>'status', 'ativo') as status,
                COALESCE(u.raw_user_meta_data->>'tipo_usuario', 'usuario') as tipo_usuario,
                u.created_at,
                u.raw_user_meta_data as user_metadata,
                (u.raw_user_meta_data->>'app') as app,
                (
                    SELECT s.plan_id 
                    FROM public.user_subscriptions s 
                    WHERE s.user_id = u.id 
                    AND s.status IN ('active', 'trial')
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
$$;`;

const client = new pg.Client({ connectionString });

async function run() {
    try {
        await client.connect();
        console.log('Fase 1: Aplicando SQL...');
        await client.query(sql);
        console.log('SQL aplicado com sucesso.');

        console.log('Fase 2: Verificando resultados...');
        const billingRes = await client.query('SELECT public.get_admin_billing_summary() as billing');
        console.log('Billing Summary:', JSON.stringify(billingRes.rows[0].billing, null, 2));

        console.log('Fase 3: Buscando usuários ativos...');
        const usersRes = await client.query(`
      SELECT u.email, u.raw_user_meta_data->>'nome' as nome, s.status
      FROM auth.users u
      JOIN public.user_subscriptions s ON u.id = s.user_id
      WHERE s.status IN ('active', 'trial')
    `);
        console.table(usersRes.rows);

    } catch (err) {
        console.error('ERRO:', err);
    } finally {
        await client.end();
    }
}

run();
