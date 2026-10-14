-- ============================================================
-- INNO SPRINT: PREVENT DUPLICATE REGISTRATIONS BY EMAIL
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hbntxrrexilmjvxncwvc/sql/new
-- ============================================================

-- Ensure duplicate applicant emails cannot be inserted into registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_registrations_applicant_email 
ON public.registrations (LOWER(TRIM(applicant_email)));
