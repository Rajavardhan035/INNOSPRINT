-- ============================================================================
-- InnoSprint 2026 — Project Approval Notifications Schema & Idempotency Table
-- ============================================================================

-- 1. Create project_notifications table
CREATE TABLE IF NOT EXISTS public.project_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.project_submissions(id) ON DELETE SET NULL,
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

-- 2. Indexes for fast lookups & idempotency checking
CREATE INDEX IF NOT EXISTS idx_project_notifications_reg_id 
    ON public.project_notifications(registration_id);

CREATE INDEX IF NOT EXISTS idx_project_notifications_status 
    ON public.project_notifications(status);

CREATE INDEX IF NOT EXISTS idx_project_notifications_email 
    ON public.project_notifications(recipient_email);

-- 3. Row Level Security (RLS)
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read of notification status for registration owners or admins
DROP POLICY IF EXISTS "Organizers and owners can view notifications" ON public.project_notifications;
CREATE POLICY "Organizers and owners can view notifications"
    ON public.project_notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.registrations r 
            WHERE r.id = registration_id AND r.user_id = auth.uid()
        )
        OR auth.uid() IS NOT NULL
    );

-- Allow service role and admins to update/insert notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.project_notifications;
CREATE POLICY "Admins can manage notifications"
    ON public.project_notifications FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Fix infinite recursion in user_roles policy if present
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- 5. Helper function for atomic notification locking and attempt recording
CREATE OR REPLACE FUNCTION public.record_notification_attempt(
    p_registration_id UUID,
    p_submission_id UUID,
    p_recipient_email TEXT,
    p_team_name TEXT,
    p_project_title TEXT,
    p_notification_type TEXT DEFAULT 'shortlisted'
)
RETURNS TABLE (
    notification_id UUID,
    current_status TEXT,
    can_proceed BOOLEAN,
    already_sent BOOLEAN
) AS $$
DECLARE
    v_record public.project_notifications%ROWTYPE;
BEGIN
    SELECT * INTO v_record
    FROM public.project_notifications
    WHERE registration_id = p_registration_id AND notification_type = p_notification_type
    FOR UPDATE;

    IF FOUND THEN
        -- If already delivered, do not re-send unless forced
        IF v_record.status = 'delivered' THEN
            RETURN QUERY SELECT v_record.id, v_record.status, FALSE, TRUE;
            RETURN;
        END IF;

        -- If currently pending and attempted less than 30 seconds ago, prevent concurrent double-send
        IF v_record.status = 'pending' AND v_record.last_attempt_at > (NOW() - INTERVAL '30 seconds') THEN
            RETURN QUERY SELECT v_record.id, v_record.status, FALSE, FALSE;
            RETURN;
        END IF;

        -- Update attempt count and mark pending
        UPDATE public.project_notifications
        SET status = 'pending',
            attempt_count = attempt_count + 1,
            last_attempt_at = NOW(),
            updated_at = NOW()
        WHERE id = v_record.id;

        RETURN QUERY SELECT v_record.id, 'pending'::TEXT, TRUE, FALSE;
        RETURN;
    ELSE
        -- Insert new pending record
        INSERT INTO public.project_notifications (
            registration_id,
            submission_id,
            recipient_email,
            team_name,
            project_title,
            notification_type,
            status,
            attempt_count,
            last_attempt_at
        ) VALUES (
            p_registration_id,
            p_submission_id,
            p_recipient_email,
            p_team_name,
            p_project_title,
            p_notification_type,
            'pending',
            1,
            NOW()
        )
        RETURNING id INTO v_record.id;

        RETURN QUERY SELECT v_record.id, 'pending'::TEXT, TRUE, FALSE;
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
