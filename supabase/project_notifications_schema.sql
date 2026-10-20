-- ============================================================================
-- InnoSprint 2026 — Project Approval Notifications Production Security Schema
-- File: supabase/project_notifications_schema.sql
-- 
-- Review Notes & Security Hardening Applied:
-- 1. Enforces strict schema qualifications and search_path pinning (search_path = public, pg_temp)
--    to prevent search_path hijacking in SECURITY DEFINER contexts.
-- 2. Revokes public/anon EXECUTE privileges on the atomic attempt function to prevent
--    unauthorized execution via PostgREST RPC endpoints.
-- 3. Implements strict Row Level Security (RLS) policies:
--    - Completely denies anon access (zero read/write).
--    - Grants SELECT to authenticated users strictly for their own registrations, or admins.
--    - Grants INSERT, UPDATE, DELETE to authenticated users strictly if verified admins/organizers.
-- 4. Handles concurrency race conditions on initial insert using exception catching / transaction locking.
-- 5. Validates registration approval status at the database engine level (defense-in-depth).
-- ============================================================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE TABLE: project_notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    submission_id UUID,
    recipient_email TEXT NOT NULL,
    team_name TEXT,
    project_title TEXT,
    notification_type TEXT NOT NULL DEFAULT 'shortlisted',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
    attempt_count INT NOT NULL DEFAULT 1,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_registration_notification UNIQUE (registration_id, notification_type)
);

-- Conditionally link submission_id foreign key if project_submissions exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'project_submissions'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_project_notifications_submission'
              AND table_schema = 'public'
              AND table_name = 'project_notifications'
        ) THEN
            ALTER TABLE public.project_notifications 
            ADD CONSTRAINT fk_project_notifications_submission 
            FOREIGN KEY (submission_id) REFERENCES public.project_submissions(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 2. PERFORMANCE & IDEMPOTENCY INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_project_notifications_reg_id 
    ON public.project_notifications(registration_id);

CREATE INDEX IF NOT EXISTS idx_project_notifications_status 
    ON public.project_notifications(status);

CREATE INDEX IF NOT EXISTS idx_project_notifications_email 
    ON public.project_notifications(recipient_email);

-- ============================================================================
-- 3. TRUSTED SERVER-SIDE AUTHORIZATION HELPER
-- ============================================================================
-- Non-recursive helper that verifies administrative privileges
CREATE OR REPLACE FUNCTION public.is_organizer_or_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    jwt_email TEXT;
    has_role BOOLEAN := FALSE;
BEGIN
    -- Check 1: Primary immutable site owner
    jwt_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
    IF jwt_email = 'rajavardhan445@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- Check 2: Trusted user_roles table
    IF user_uuid IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.user_roles ur
            WHERE ur.user_id = user_uuid
              AND ur.role IN ('organizer', 'superadmin', 'admin')
        ) INTO has_role;

        IF has_role THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check 3: Check authorized_admins roster if table exists
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
                      AND role IN (''organizer'', ''superadmin'', ''admin'')
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

-- Protect authorization helper execution
REVOKE ALL ON FUNCTION public.is_organizer_or_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_organizer_or_admin(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_organizer_or_admin(UUID) TO authenticated, service_role;

-- ============================================================================
-- 4. HARDEN USER_ROLES RLS POLICY
-- ============================================================================
-- Avoid recursion by using simple non-recursive policy
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) FOR project_notifications
-- ============================================================================
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

-- Clean up any preexisting or insecure policies
DROP POLICY IF EXISTS "Organizers and owners can view notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Admins and registration owners can view notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.project_notifications;

-- Policy 1: SELECT
-- Only authorized admins OR the verified applicant who owns the registration can read
CREATE POLICY "Admins and registration owners can view notifications"
    ON public.project_notifications FOR SELECT
    TO authenticated
    USING (
        public.is_organizer_or_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.registrations r 
            WHERE r.id = project_notifications.registration_id 
              AND (
                  (r.user_id IS NOT NULL AND r.user_id = auth.uid())
                  OR (LOWER(TRIM(r.applicant_email)) = LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))))
              )
        )
    );

-- Policy 2: INSERT
-- Strictly restricted to authorized admins/organizers
CREATE POLICY "Admins can insert notifications"
    ON public.project_notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_organizer_or_admin(auth.uid())
    );

-- Policy 3: UPDATE
-- Strictly restricted to authorized admins/organizers
CREATE POLICY "Admins can update notifications"
    ON public.project_notifications FOR UPDATE
    TO authenticated
    USING (
        public.is_organizer_or_admin(auth.uid())
    )
    WITH CHECK (
        public.is_organizer_or_admin(auth.uid())
    );

-- Policy 4: DELETE
-- Strictly restricted to authorized admins/organizers
CREATE POLICY "Admins can delete notifications"
    ON public.project_notifications FOR DELETE
    TO authenticated
    USING (
        public.is_organizer_or_admin(auth.uid())
    );

-- Strict Table Privileges (defense-in-depth below RLS)
REVOKE ALL ON TABLE public.project_notifications FROM PUBLIC;
REVOKE ALL ON TABLE public.project_notifications FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_notifications TO authenticated;
GRANT ALL ON TABLE public.project_notifications TO service_role;

-- ============================================================================
-- 6. ATOMIC CONCURRENCY-SAFE ATTEMPT RECORDER (SECURITY DEFINER)
-- ============================================================================
DROP FUNCTION IF EXISTS public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION public.record_notification_attempt(
    p_registration_id UUID,
    p_submission_id UUID DEFAULT NULL,
    p_recipient_email TEXT DEFAULT NULL,
    p_team_name TEXT DEFAULT NULL,
    p_project_title TEXT DEFAULT NULL,
    p_notification_type TEXT DEFAULT 'shortlisted',
    p_force_retry BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    notification_id UUID,
    current_status TEXT,
    can_proceed BOOLEAN,
    already_sent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_reg_status TEXT;
    v_db_email TEXT;
    v_db_title TEXT;
    v_record public.project_notifications%ROWTYPE;
    v_resolved_email TEXT;
    v_resolved_title TEXT;
BEGIN
    -- 1. Authorization Gate:
    -- Only service_role (Edge Function) or authorized organizers/admins can call this function
    IF NOT (
        current_user = 'service_role' 
        OR COALESCE(auth.role(), '') = 'service_role'
        OR public.is_organizer_or_admin(auth.uid())
    ) THEN
        RAISE EXCEPTION 'Access denied: insufficient privileges to record notification attempts.'
            USING ERRCODE = '42501';
    END IF;

    -- 2. Verify Registration Existence & Approval Status in database
    SELECT r.status, r.applicant_email, r.project_title
    INTO v_reg_status, v_db_email, v_db_title
    FROM public.registrations r
    WHERE r.id = p_registration_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found with ID: %', p_registration_id
            USING ERRCODE = '02000';
    END IF;

    -- Strict Defense: Emails can ONLY be triggered for approved registrations
    IF v_reg_status <> 'approved' THEN
        RETURN QUERY SELECT NULL::UUID, v_reg_status, FALSE, FALSE;
        RETURN;
    END IF;

    -- Resolve email & project title from verified registration record if not supplied
    v_resolved_email := COALESCE(NULLIF(TRIM(p_recipient_email), ''), v_db_email);
    v_resolved_title := COALESCE(NULLIF(TRIM(p_project_title), ''), v_db_title);

    IF v_resolved_email IS NULL OR v_resolved_email = '' THEN
        RAISE EXCEPTION 'Cannot record notification: registration % has no valid applicant email.', p_registration_id
            USING ERRCODE = '22023';
    END IF;

    -- 3. Row-level Lock on existing record (if present)
    SELECT * INTO v_record
    FROM public.project_notifications
    WHERE registration_id = p_registration_id AND notification_type = p_notification_type
    FOR UPDATE;

    IF FOUND THEN
        -- Case A: Already delivered
        IF v_record.status = 'delivered' AND NOT p_force_retry THEN
            RETURN QUERY SELECT v_record.id, v_record.status, FALSE, TRUE;
            RETURN;
        END IF;

        -- Case B: Currently pending and attempted less than 30 seconds ago (throttling double-clicks)
        IF v_record.status = 'pending' 
           AND v_record.last_attempt_at IS NOT NULL 
           AND v_record.last_attempt_at > (NOW() - INTERVAL '30 seconds') 
           AND NOT p_force_retry THEN
            RETURN QUERY SELECT v_record.id, v_record.status, FALSE, FALSE;
            RETURN;
        END IF;

        -- Case C: Retry or subsequent attempt
        UPDATE public.project_notifications
        SET status = 'pending',
            attempt_count = v_record.attempt_count + 1,
            last_attempt_at = NOW(),
            error_message = NULL,
            updated_at = NOW()
        WHERE id = v_record.id
        RETURNING * INTO v_record;

        RETURN QUERY SELECT v_record.id, 'pending'::TEXT, TRUE, FALSE;
        RETURN;
    ELSE
        -- Case D: Initial Insert with concurrency race condition handling
        BEGIN
            INSERT INTO public.project_notifications (
                registration_id,
                submission_id,
                recipient_email,
                team_name,
                project_title,
                notification_type,
                status,
                attempt_count,
                last_attempt_at,
                created_at,
                updated_at
            ) VALUES (
                p_registration_id,
                p_submission_id,
                v_resolved_email,
                p_team_name,
                v_resolved_title,
                p_notification_type,
                'pending',
                1,
                NOW(),
                NOW(),
                NOW()
            )
            RETURNING * INTO v_record;

            RETURN QUERY SELECT v_record.id, 'pending'::TEXT, TRUE, FALSE;
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- Handle simultaneous race: another transaction inserted the row right now
            SELECT * INTO v_record
            FROM public.project_notifications
            WHERE registration_id = p_registration_id AND notification_type = p_notification_type
            FOR UPDATE;

            IF v_record.status = 'delivered' AND NOT p_force_retry THEN
                RETURN QUERY SELECT v_record.id, v_record.status, FALSE, TRUE;
                RETURN;
            END IF;

            IF v_record.status = 'pending' 
               AND v_record.last_attempt_at IS NOT NULL 
               AND v_record.last_attempt_at > (NOW() - INTERVAL '30 seconds') 
               AND NOT p_force_retry THEN
                RETURN QUERY SELECT v_record.id, v_record.status, FALSE, FALSE;
                RETURN;
            END IF;

            UPDATE public.project_notifications
            SET status = 'pending',
                attempt_count = v_record.attempt_count + 1,
                last_attempt_at = NOW(),
                error_message = NULL,
                updated_at = NOW()
            WHERE id = v_record.id
            RETURNING * INTO v_record;

            RETURN QUERY SELECT v_record.id, 'pending'::TEXT, TRUE, FALSE;
            RETURN;
        END;
    END IF;
END;
$$;

-- Strict Function Privileges:
-- Revoke from all public / anon / authenticated callers
REVOKE ALL ON FUNCTION public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM anon;
REVOKE ALL ON FUNCTION public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM authenticated;

-- Grant EXECUTE exclusively to service_role (Edge Functions)
GRANT EXECUTE ON FUNCTION public.record_notification_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;
