-- ============================================================================
-- RS ECOSYSTEM - ADD ADDRESS COLUMNS TO USER_PROFILES
-- Adds columns needed for full synchronization with platform
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        
        -- Add Address Columns
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_cep') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_cep TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_rua') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_rua TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_numero') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_numero TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_complemento') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_complemento TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_bairro') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_bairro TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_cidade') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_cidade TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'endereco_estado') THEN
            ALTER TABLE public.user_profiles ADD COLUMN endereco_estado TEXT;
        END IF;

        -- Add MMN ID / Consultant ID
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'mmn_id') THEN
            ALTER TABLE public.user_profiles ADD COLUMN mmn_id TEXT;
        END IF;

    END IF;
END $$;
