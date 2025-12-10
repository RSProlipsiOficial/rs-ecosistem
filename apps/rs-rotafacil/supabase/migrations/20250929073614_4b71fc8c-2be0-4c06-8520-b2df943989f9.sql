-- Garantir que o email do usuário esteja cadastrado como admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_emails WHERE email = 'rsprolipsioficial@gmail.com'
  ) THEN
    INSERT INTO public.admin_emails (email)
    VALUES ('rsprolipsioficial@gmail.com');
  END IF;
END $$;