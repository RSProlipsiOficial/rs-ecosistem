-- Confirm the user's email to allow login
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'rsprolipsioficial@gmail.com';