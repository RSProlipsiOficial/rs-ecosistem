-- ============================================================================
-- RS ECOSYSTEM - FIX USER PROFILES SCHEMA
-- Adds missing columns for WalletPay synchronization
-- ============================================================================

-- Check if table user_profiles exists
DO $$ 
BEGIN
    -- user_profiles usually exists but might miss these new columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        
        -- Add upline_id
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'upline_id') THEN
            ALTER TABLE public.user_profiles ADD COLUMN upline_id TEXT;
        END IF;

        -- Add upline_nome
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'upline_nome') THEN
            ALTER TABLE public.user_profiles ADD COLUMN upline_nome TEXT;
        END IF;

        -- Add cpf (User requested this field)
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'cpf') THEN
            ALTER TABLE public.user_profiles ADD COLUMN cpf TEXT;
        END IF;

    END IF;
END $$;
