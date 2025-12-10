-- Add admin email to the admin_emails table
INSERT INTO public.admin_emails (email) 
VALUES ('rsprolipsioficial@gmail.com')
ON CONFLICT (email) DO NOTHING;