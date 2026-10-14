-- ==========================================
-- AUTO-CONFIRM ALL USERS & GRANT ADMIN ROLE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- ==========================================

-- 1. Confirm all unconfirmed emails immediately
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- 2. Grant superadmin role to your email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = '24BQ5A6135@vvit.net'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Verify confirmed users
SELECT id, email, email_confirmed_at, role FROM auth.users;
