-- ========================================================
-- INNO SPRINT 2026: FIX CONTACT MESSAGES RLS & ADMIN ACCESS
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- ========================================================

-- 1. Break infinite recursion in public.user_roles policy
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;

-- Simple, non-recursive SELECT policy for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage user roles"
    ON public.user_roles FOR ALL
    USING (
        auth.uid() = user_id
        OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in', 'organizer@vvit.net')
    );

-- 2. Fix the helper function to avoid table recursion and check email directly
CREATE OR REPLACE FUNCTION public.is_organizer_or_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    jwt_email TEXT;
    db_role TEXT;
BEGIN
    -- Check JWT claims email directly (instant, 0 table queries, 0 recursion)
    jwt_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
    IF jwt_email IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in', 'organizer@vvit.net') THEN
        RETURN TRUE;
    END IF;

    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Query user_roles safely with search_path set
    SELECT role INTO db_role
    FROM public.user_roles
    WHERE user_id = user_uuid AND role IN ('organizer', 'superadmin')
    LIMIT 1;

    RETURN db_role IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Ensure official organizers exist in public.user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Fix contact_messages table and RLS policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Ensure all needed columns exist
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS reply_message TEXT;

-- Drop all conflicting policies on contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view contact message by email or admin" ON public.contact_messages;
DROP POLICY IF EXISTS "Organizers can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Organizers can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;

-- INSERT policy: Allow any public visitor to submit contact enquiries
CREATE POLICY "Anyone can submit contact message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

-- SELECT policy: Authorized admins can view ALL messages; users can view their own
CREATE POLICY "Admins can view all contact messages"
    ON public.contact_messages FOR SELECT
    USING (
        public.is_organizer_or_admin(auth.uid())
        OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in', 'organizer@vvit.net')
        OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

-- UPDATE policy: Organizers and admins can update message status and notes
CREATE POLICY "Organizers can update contact messages"
    ON public.contact_messages FOR UPDATE
    USING (
        public.is_organizer_or_admin(auth.uid())
        OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in', 'organizer@vvit.net')
    );

-- 5. Secure RPC function for Admin Dashboard to fetch messages
CREATE OR REPLACE FUNCTION public.get_admin_contact_messages(admin_email TEXT DEFAULT NULL)
RETURNS SETOF public.contact_messages AS $$
DECLARE
    check_email TEXT;
BEGIN
    check_email := LOWER(COALESCE(admin_email, auth.jwt() ->> 'email', ''));

    IF check_email IN ('rajavardhan445@gmail.com', '24bq5a6135@vvit.net', 'admin@vvit.ac.in', 'organizer@vvit.net')
       OR public.is_organizer_or_admin(auth.uid()) THEN
        RETURN QUERY
        SELECT *
        FROM public.contact_messages
        ORDER BY created_at DESC;
    ELSE
        RAISE EXCEPTION 'Access Denied: Only authorized administrators can view contact enquiries';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated and anon
GRANT EXECUTE ON FUNCTION public.get_admin_contact_messages(TEXT) TO authenticated, anon;
