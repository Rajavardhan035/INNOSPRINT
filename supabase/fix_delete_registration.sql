-- =================================================================================
-- INNO SPRINT 2026: SUPABASE RLS FIX FOR REGISTRATION & TEAM DELETIONS
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- =================================================================================

-- 1. Ensure foreign key on registrations.team_id is ON DELETE SET NULL
-- This prevents foreign key constraint conflicts when teams are deleted
ALTER TABLE IF EXISTS public.registrations
    DROP CONSTRAINT IF EXISTS registrations_team_id_fkey,
    ADD CONSTRAINT registrations_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- 2. Drop any blocking DELETE policies on registrations, teams, team_members, and certificates
DROP POLICY IF EXISTS "Organizers can delete registration" ON public.registrations;
DROP POLICY IF EXISTS "Allow delete registration" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can delete registration" ON public.registrations;
DROP POLICY IF EXISTS "Users can delete registration" ON public.registrations;

CREATE POLICY "Allow delete registration"
    ON public.registrations FOR DELETE
    USING (true);

DROP POLICY IF EXISTS "Organizers can delete team" ON public.teams;
DROP POLICY IF EXISTS "Allow delete teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can delete team" ON public.teams;

CREATE POLICY "Allow delete teams"
    ON public.teams FOR DELETE
    USING (true);

DROP POLICY IF EXISTS "Organizers can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can delete team members" ON public.team_members;

CREATE POLICY "Allow delete team members"
    ON public.team_members FOR DELETE
    USING (true);

DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow delete certificates" ON public.certificates;

CREATE POLICY "Allow delete certificates"
    ON public.certificates FOR DELETE
    USING (true);

-- 3. Dedicated SECURITY DEFINER RPC to delete a registration and all associated records
-- Executes in a single atomic transaction bypassing client RLS limitations
CREATE OR REPLACE FUNCTION public.delete_registration_permanently(
    p_reg_id UUID DEFAULT NULL,
    p_ref_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_id UUID;
    v_team_id UUID;
BEGIN
    -- Resolve registration ID
    IF p_reg_id IS NOT NULL THEN
        SELECT id, team_id INTO v_target_id, v_team_id
        FROM public.registrations
        WHERE id = p_reg_id
        LIMIT 1;
    ELSIF p_ref_code IS NOT NULL THEN
        SELECT id, team_id INTO v_target_id, v_team_id
        FROM public.registrations
        WHERE reference_code = UPPER(TRIM(p_ref_code))
        LIMIT 1;
    END IF;

    IF v_target_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Delete associated certificates
    DELETE FROM public.certificates
    WHERE registration_id = v_target_id;

    -- Delete associated project submissions
    DELETE FROM public.project_submissions
    WHERE registration_id = v_target_id;

    -- Delete the registration record itself
    DELETE FROM public.registrations
    WHERE id = v_target_id;

    -- If a team is linked, delete team and members if no other registrations reference it
    IF v_team_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.registrations WHERE team_id = v_team_id) THEN
            DELETE FROM public.team_members WHERE team_id = v_team_id;
            DELETE FROM public.teams WHERE id = v_team_id;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.delete_registration_permanently(UUID, TEXT) TO anon, authenticated, service_role;

-- 4. Purge any registrations already marked with __DELETED__ in organizer_notes
DELETE FROM public.certificates
WHERE registration_id IN (
    SELECT id FROM public.registrations WHERE organizer_notes LIKE '%__DELETED__%'
);

DELETE FROM public.project_submissions
WHERE registration_id IN (
    SELECT id FROM public.registrations WHERE organizer_notes LIKE '%__DELETED__%'
);

DELETE FROM public.registrations
WHERE organizer_notes LIKE '%__DELETED__%';
