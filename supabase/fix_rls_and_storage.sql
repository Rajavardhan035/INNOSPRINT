-- ==========================================
-- INNO SPRINT: FIX RLS POLICIES & STORAGE BUCKETS
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- ==========================================

-- 1. FIX TEAMS & TEAM MEMBERS RLS POLICIES
-- Allow anyone to create a team & add team members during registration
DROP POLICY IF EXISTS "Team leader can create or update team" ON public.teams;
DROP POLICY IF EXISTS "Anyone can create a team" ON public.teams;
DROP POLICY IF EXISTS "Teams viewable by members & admins" ON public.teams;
DROP POLICY IF EXISTS "Teams viewable by everyone" ON public.teams;

CREATE POLICY "Teams viewable by everyone"
    ON public.teams FOR SELECT USING (true);

CREATE POLICY "Anyone can create a team"
    ON public.teams FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Team leader or admin can update team"
    ON public.teams FOR UPDATE
    USING (leader_id = auth.uid() OR public.is_organizer_or_admin(auth.uid()));

-- Team Members
DROP POLICY IF EXISTS "Team members can be added by team leader or admin" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can add team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members viewable by anyone" ON public.team_members;

CREATE POLICY "Team members viewable by anyone"
    ON public.team_members FOR SELECT USING (true);

CREATE POLICY "Anyone can add team members"
    ON public.team_members FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Team leader or admin can update team members"
    ON public.team_members FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
        OR user_id = auth.uid()
        OR public.is_organizer_or_admin(auth.uid())
    );

-- 2. ENSURE REGISTRATIONS TABLE HAS APPLICANT DETAIL COLUMNS
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS applicant_email TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS applicant_mobile TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS applicant_college TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS degree_branch TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS year_of_study TEXT;

-- 3. CREATE STORAGE BUCKETS
-- Insert storage buckets into Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('participant-uploads', 'participant-uploads', true, 10485760, NULL),
    ('public-assets', 'public-assets', true, 10485760, NULL),
    ('certificates', 'certificates', true, 10485760, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. STORAGE RLS POLICIES (Allow uploads and downloads)
DROP POLICY IF EXISTS "Public Upload to participant-uploads" ON storage.objects;
CREATE POLICY "Public Upload to participant-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'participant-uploads');

DROP POLICY IF EXISTS "Public Read participant-uploads" ON storage.objects;
CREATE POLICY "Public Read participant-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'participant-uploads');

DROP POLICY IF EXISTS "Public Upload to public-assets" ON storage.objects;
CREATE POLICY "Public Upload to public-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Public Read public-assets" ON storage.objects;
CREATE POLICY "Public Read public-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Public Upload to certificates" ON storage.objects;
CREATE POLICY "Public Upload to certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Public Read certificates" ON storage.objects;
CREATE POLICY "Public Read certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');
