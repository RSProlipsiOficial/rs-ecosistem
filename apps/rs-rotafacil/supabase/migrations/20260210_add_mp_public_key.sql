-- Adiciona coluna mercadopago_public_key se não existir
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS mercadopago_public_key text;

-- Comentário na coluna
COMMENT ON COLUMN public.user_profiles.mercadopago_public_key IS 'Chave PÚBLICA do Mercado Pago para uso no frontend checkout';
