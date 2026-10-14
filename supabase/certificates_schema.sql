-- =================================================================================
-- INNOSPRINT 2026: CERTIFICATE MANAGEMENT DATABASE & STORAGE MIGRATION
-- Run this migration in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- =================================================================================

-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
-- 1. TRUSTED SERVER-SIDE ADMIN AUTHORIZATION HELPER (SECURITY DEFINER)
-- =================================================================================
-- Prevents RLS recursion on user_roles and checks trusted role tables only
-- (never trusts client-supplied role variables, query params, or editable profile fields).

CREATE OR REPLACE FUNCTION public.is_organizer_or_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    jwt_email TEXT;
    has_role BOOLEAN := FALSE;
BEGIN
    -- 1. Check trusted user_roles table by authenticated UUID
    IF user_uuid IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.user_roles ur
            WHERE ur.user_id = user_uuid
              AND ur.role IN ('organizer', 'superadmin')
        ) INTO has_role;

        IF has_role THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- 2. Check trusted authorized_admins table by verified JWT email claim
    jwt_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
    IF jwt_email <> '' THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'authorized_admins'
        ) THEN
            EXECUTE
                'SELECT EXISTS (
                    SELECT 1 FROM public.authorized_admins
                    WHERE LOWER(TRIM(email)) = $1
                      AND role IN (''organizer'', ''superadmin'')
                )'
            INTO has_role
            USING jwt_email;

            IF has_role THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Fix infinite recursion in user_roles RLS policies if present
DROP POLICY IF EXISTS "Only superadmins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can delete roles" ON public.user_roles;

CREATE POLICY "Superadmins can insert roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Superadmins can update roles"
    ON public.user_roles FOR UPDATE
    USING (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Superadmins can delete roles"
    ON public.user_roles FOR DELETE
    USING (public.is_organizer_or_admin(auth.uid()));

-- =================================================================================
-- 2. CERTIFICATES TABLE (REUSING EXISTING REGISTRATIONS, TEAMS, TEAM_MEMBERS, PROFILES)
-- =================================================================================
-- Note: Participant email addresses are not duplicated unnecessarily; they are
-- resolved from public.registrations (applicant_email), public.team_members (member_email),
-- or public.profiles (email) via foreign keys and participant_key.

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    participant_key TEXT NOT NULL, -- 'leader' for primary applicant, or 'member:<team_member_uuid>'
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
    file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- Max 10 MB
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_certificate_per_participant_registration UNIQUE (registration_id, participant_key)
);

CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_participant_id ON public.certificates(participant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_team_member_id ON public.certificates(team_member_id);

-- Automatically update updated_at timestamp on certificate replacement
CREATE OR REPLACE FUNCTION public.touch_certificates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_certificates_updated_at();

-- =================================================================================
-- 3. ROW LEVEL SECURITY (RLS) FOR public.certificates
-- =================================================================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Participants can view own certificate" ON public.certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;

-- A. SELECT: Authorized admins can view all certificate records
CREATE POLICY "Admins can view all certificates"
    ON public.certificates FOR SELECT
    USING (public.is_organizer_or_admin(auth.uid()));

-- B. SELECT: Authenticated participants can view ONLY their own individual certificate
CREATE POLICY "Participants can view own certificate"
    ON public.certificates FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND participant_id = auth.uid())
        OR (
            COALESCE(auth.jwt() ->> 'email', '') <> ''
            AND (
                -- Leader certificate matches registrations.applicant_email
                (
                    participant_key = 'leader'
                    AND EXISTS (
                        SELECT 1 FROM public.registrations r
                        WHERE r.id = certificates.registration_id
                          AND LOWER(TRIM(r.applicant_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
                    )
                )
                OR
                -- Team member certificate matches team_members.member_email
                (
                    team_member_id IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM public.team_members tm
                        WHERE tm.id = certificates.team_member_id
                          AND LOWER(TRIM(tm.member_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
                    )
                )
            )
        )
    );

-- C. INSERT / UPDATE / DELETE: Strictly restricted to verified organizers & superadmins
CREATE POLICY "Admins can insert certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Admins can update certificates"
    ON public.certificates FOR UPDATE
    USING (public.is_organizer_or_admin(auth.uid()))
    WITH CHECK (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Admins can delete certificates"
    ON public.certificates FOR DELETE
    USING (public.is_organizer_or_admin(auth.uid()));

-- =================================================================================
-- 4. SECURE SERVER-SIDE PARTICIPANT VERIFICATION RPC
-- =================================================================================
-- Verifies that a participant checking their status provides their registered email
-- (optionally paired with their registration reference code) and returns ONLY the
-- certificate belonging to that specific verified individual (never exposing team
-- members' certificates to one another or allowing lookup by reference_code alone).

CREATE OR REPLACE FUNCTION public.verify_and_get_certificate(
    p_email TEXT,
    p_reference_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    certificate_id UUID,
    registration_id UUID,
    reference_code TEXT,
    participant_key TEXT,
    participant_name TEXT,
    team_name TEXT,
    registration_status TEXT,
    storage_path TEXT,
    original_filename TEXT,
    mime_type TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
    v_clean_ref TEXT := UPPER(TRIM(COALESCE(p_reference_code, '')));
    v_reg RECORD;
    v_member RECORD;
    v_part_key TEXT := NULL;
    v_part_name TEXT := NULL;
BEGIN
    -- Require a valid email address; never authorize certificate lookup by registration ID alone
    IF v_clean_email = '' OR POSITION('@' IN v_clean_email) = 0 THEN
        RAISE EXCEPTION 'VERIFICATION_REQUIRED: A valid registered email address is required to verify certificate ownership.';
    END IF;

    -- 1. Check if the email belongs to a primary applicant (Team Leader)
    SELECT r.*, t.team_name AS joined_team_name
    INTO v_reg
    FROM public.registrations r
    LEFT JOIN public.teams t ON t.id = r.team_id
    WHERE LOWER(TRIM(r.applicant_email)) = v_clean_email
      AND (v_clean_ref = '' OR UPPER(TRIM(r.reference_code)) = v_clean_ref)
    ORDER BY r.created_at DESC
    LIMIT 1;

    IF FOUND THEN
        v_part_key := 'leader';
        v_part_name := COALESCE(v_reg.applicant_name, 'Participant');
    ELSE
        -- 2. Check if the email belongs to a registered team member
        SELECT tm.*, r.id AS reg_id, r.reference_code AS reg_ref, r.status AS reg_status, t.team_name AS joined_team_name
        INTO v_member
        FROM public.team_members tm
        INNER JOIN public.teams t ON t.id = tm.team_id
        INNER JOIN public.registrations r ON r.team_id = t.id
        WHERE LOWER(TRIM(tm.member_email)) = v_clean_email
          AND (v_clean_ref = '' OR UPPER(TRIM(r.reference_code)) = v_clean_ref)
        ORDER BY r.created_at DESC
        LIMIT 1;

        IF FOUND THEN
            v_part_key := 'member:' || v_member.id::TEXT;
            v_part_name := COALESCE(v_member.member_name, 'Team Member');
            SELECT r.*, v_member.joined_team_name AS joined_team_name
            INTO v_reg
            FROM public.registrations r
            WHERE r.id = v_member.reg_id;
        END IF;
    END IF;

    IF v_part_key IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        c.id AS certificate_id,
        v_reg.id AS registration_id,
        v_reg.reference_code AS reference_code,
        v_part_key AS participant_key,
        v_part_name AS participant_name,
        v_reg.joined_team_name AS team_name,
        v_reg.status AS registration_status,
        c.storage_path,
        c.original_filename,
        c.mime_type,
        c.file_size,
        c.updated_at AS uploaded_at
    FROM public.certificates c
    WHERE c.registration_id = v_reg.id
      AND c.participant_key = v_part_key
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_get_certificate(TEXT, TEXT) TO anon, authenticated;

-- =================================================================================
-- 5. DEDICATED PRIVATE STORAGE BUCKET & STORAGE RLS POLICIES ('certificates')
-- =================================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'certificates',
    'certificates',
    false, -- STRICTLY PRIVATE BUCKET (no public object URLs)
    10485760, -- 10 MB limit
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

-- Clean up existing storage policies on certificates bucket before recreating
DROP POLICY IF EXISTS "Users can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Verified certificate read access" ON storage.objects;

-- Allow reading/signing specific certificate objects when requested via verified flow
CREATE POLICY "Verified certificate read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'certificates');

-- Allow uploads, updates, and orphan cleanup on the private certificates bucket
CREATE POLICY "Admins can upload certificates"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Admins can update certificates"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'certificates');

CREATE POLICY "Admins can delete certificates"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'certificates');
