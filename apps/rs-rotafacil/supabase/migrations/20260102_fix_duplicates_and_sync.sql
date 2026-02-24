-- Fix User Edit Consistency and Duplicates
-- Date: 2026-01-02

-- 1. Eliminate Duplicate "Profissional" Plan
-- Deleting the one identified as unused (ID: 7ff6a46a-9b67-4e53-af4e-f673998638db)
DELETE FROM public.subscription_plans 
WHERE id = '7ff6a46a-9b67-4e53-af4e-f673998638db';

-- 2. Update RPC to Sync Metadata (Plan Name)
-- This ensures that when an admin updates a user's plan via the UI, the 'plan' metadata field (used for the badge) is also updated.
CREATE OR REPLACE FUNCTION public.admin_update_user_v2(
    p_user_id uuid, 
    p_nome text, 
    p_telefone text, 
    p_tipo_usuario text, 
    p_plan_id uuid DEFAULT NULL::uuid, 
    p_status text DEFAULT 'ativo'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_admin_email text;
    v_is_super_admin boolean;
    v_plan_name text;
    v_new_metadata jsonb;
BEGIN
    -- 1. Check if caller is Admin
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE LOWER(email) = LOWER(v_admin_email)
    ) INTO v_is_super_admin;

    IF NOT v_is_super_admin THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem atualizar usuários.';
    END IF;

    -- 2. Handle Plan Update Logic First to get Plan Name
    IF p_plan_id IS NOT NULL THEN
        -- Verify Plan Exists and Get Name
        SELECT name INTO v_plan_name FROM public.subscription_plans WHERE id = p_plan_id;
        
        IF v_plan_name IS NULL THEN
            RAISE EXCEPTION 'Plano não encontrado.';
        END IF;

        -- Update Subscription Table
        INSERT INTO public.user_subscriptions (user_id, plan_id, status, expires_at, updated_at)
        VALUES (p_user_id, p_plan_id, 'active', '2099-12-31 23:59:59+00', now())
        ON CONFLICT (user_id) DO UPDATE 
        SET plan_id = p_plan_id, 
            status = 'active', 
            updated_at = now();
    END IF;

    -- 3. Construct New Metadata
    -- We fetch existing metadata to preserve other fields
    SELECT raw_user_meta_data INTO v_new_metadata FROM auth.users WHERE id = p_user_id;
    
    v_new_metadata := COALESCE(v_new_metadata, '{}'::jsonb) || 
        jsonb_build_object(
            'nome', p_nome,
            'name', p_nome,
            'full_name', p_nome,
            'telefone', p_telefone,
            'phone', p_telefone,
            'tipo_usuario', p_tipo_usuario,
            'status', p_status
        );

    -- If a plan update occurred, update the 'plan' and 'tier' metadata
    IF v_plan_name IS NOT NULL THEN
        v_new_metadata := v_new_metadata || jsonb_build_object(
            'plan', v_plan_name,
            'tier', LOWER(v_plan_name) -- e.g. 'crescimento', 'profissional'
        );
    END IF;

    -- 4. Update auth.users with consolidated metadata
    UPDATE auth.users
    SET 
        raw_user_meta_data = v_new_metadata,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'plan_updated', v_plan_name);
END;
$function$;

-- 3. Force Sync for Roberto (Manual Fix)
-- Updates his metadata to match his current subscription (Ilimitado or Profissional)
DO $$
DECLARE
    v_user_id uuid := 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    v_current_plan_name text;
BEGIN
    -- Get current active plan name from subscription
    SELECT p.name INTO v_current_plan_name
    FROM public.user_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.user_id = v_user_id;

    IF v_current_plan_name IS NOT NULL THEN
        UPDATE auth.users
        SET raw_user_meta_data = raw_user_meta_data || 
            jsonb_build_object(
                'plan', v_current_plan_name,
                'tier', LOWER(v_current_plan_name)
            )
        WHERE id = v_user_id;
    END IF;
END $$;
