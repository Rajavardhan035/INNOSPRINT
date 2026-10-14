-- ========================================================
-- INNO SPRINT: AUTHORIZED ADMINS & RBAC TABLE
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- ========================================================

-- 1. Create table for authorized admins and staff
CREATE TABLE IF NOT EXISTS public.authorized_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('organizer', 'superadmin', 'judge')),
    added_by TEXT DEFAULT 'rajavardhan445@gmail.com',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Open RLS policies for authorized_admins table so admins can view & add
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view authorized admins" ON public.authorized_admins;
CREATE POLICY "Anyone can view authorized admins"
    ON public.authorized_admins FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can add authorized admins" ON public.authorized_admins;
CREATE POLICY "Admins can add authorized admins"
    ON public.authorized_admins FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update authorized admins" ON public.authorized_admins;
CREATE POLICY "Admins can update authorized admins"
    ON public.authorized_admins FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Admins can delete authorized admins" ON public.authorized_admins;
CREATE POLICY "Admins can delete authorized admins"
    ON public.authorized_admins FOR DELETE
    USING (true);

-- 3. Seed Main Admin (Raja Vardhan)
INSERT INTO public.authorized_admins (email, full_name, role, added_by)
VALUES 
    ('rajavardhan445@gmail.com', 'Raja Vardhan (Main Admin)', 'superadmin', 'system'),
    ('24BQ5A6135@vvit.net', 'Raja Vardhan (VVIT Student)', 'superadmin', 'system'),
    ('admin@vvit.ac.in', 'VVIT Chief Organizer', 'superadmin', 'system')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- 4. Auto-confirm any existing users with these emails
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email IN ('rajavardhan445@gmail.com', '24BQ5A6135@vvit.net', 'admin@vvit.ac.in');

-- 5. Grant superadmin in user_roles table if users already exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email IN ('rajavardhan445@gmail.com', '24BQ5A6135@vvit.net', 'admin@vvit.ac.in')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Verify table contents
SELECT * FROM public.authorized_admins;
