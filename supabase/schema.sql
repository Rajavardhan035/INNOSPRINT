-- ==========================================
-- INNO SPRINT HACKATHON SUPABASE SCHEMA
-- Full PostgreSQL Schema, Indexes, RLS Policies, Functions, & Seed Data
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT,
    college TEXT,
    degree_branch TEXT,
    year_of_study TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES TABLE (Enforces secure RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('visitor', 'participant', 'organizer', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'INNO SPRINT 2026',
    dates TEXT NOT NULL DEFAULT 'October 26–28, 2026',
    venue TEXT NOT NULL DEFAULT 'VVIT University, Guntur, Andhra Pradesh, India',
    prize_pool TEXT NOT NULL DEFAULT '₹50,000',
    description TEXT,
    registration_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL,
    leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    join_code TEXT UNIQUE,
    theme TEXT CHECK (theme IN ('Agentic AI', 'Robotic AI', 'Generative AI', 'Open Innovation')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    member_email TEXT NOT NULL,
    member_phone TEXT,
    role_in_team TEXT DEFAULT 'Member',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    participation_type TEXT NOT NULL CHECK (participation_type IN ('individual', 'team')),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    theme TEXT NOT NULL CHECK (theme IN ('Agentic AI', 'Robotic AI', 'Generative AI', 'Open Innovation')),
    project_title TEXT,
    problem_statement TEXT,
    project_description TEXT,
    proposal_url TEXT,
    student_id_url TEXT,
    consent_accepted BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
    organizer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    repo_url TEXT,
    demo_url TEXT,
    video_url TEXT,
    slides_url TEXT,
    is_finalized BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    registration_id_ref TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    admin_notes TEXT,
    reply_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'participants', 'approved')),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SCHEDULE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT DEFAULT 'Main Auditorium / Hall A',
    speaker_or_mentor TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FAQ ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EVENT CONTENT / CMS TABLE
CREATE TABLE IF NOT EXISTS public.event_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    content_json JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_ref_code ON public.registrations(reference_code);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_reg_id ON public.project_submissions(registration_id);

-- ==========================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to handle user signup profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Assign default role 'participant'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'participant')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is an organizer or superadmin
CREATE OR REPLACE FUNCTION public.is_organizer_or_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid AND role IN ('organizer', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to generate unique reference codes
CREATE OR REPLACE FUNCTION public.generate_ref_code(prefix TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN prefix || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_content ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. User Roles RLS
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Only superadmins can manage user roles"
    ON public.user_roles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'superadmin'));

-- 3. Events RLS (Public read, admin write)
CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT USING (true);

CREATE POLICY "Organizers can edit events"
    ON public.events FOR ALL USING (public.is_organizer_or_admin(auth.uid()));

-- 4. Teams & Team Members RLS
CREATE POLICY "Teams viewable by everyone"
    ON public.teams FOR SELECT USING (true);

CREATE POLICY "Anyone can create a team"
    ON public.teams FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Team leader or admin can update team"
    ON public.teams FOR UPDATE
    USING (leader_id = auth.uid() OR public.is_organizer_or_admin(auth.uid()));

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

-- 5. Registrations RLS
CREATE POLICY "Registrations viewable by everyone"
    ON public.registrations FOR SELECT USING (true);

CREATE POLICY "Anyone can create a registration"
    ON public.registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pending registration"
    ON public.registrations FOR UPDATE USING (
        (user_id = auth.uid() AND status = 'pending') OR public.is_organizer_or_admin(auth.uid())
    );

CREATE POLICY "Organizers can delete registration"
    ON public.registrations FOR DELETE USING (public.is_organizer_or_admin(auth.uid()));

-- 6. Project Submissions RLS
CREATE POLICY "Project submissions viewable by submitter, team, or admin"
    ON public.project_submissions FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid())
        OR public.is_organizer_or_admin(auth.uid())
    );

CREATE POLICY "Registered user can create/update project submission"
    ON public.project_submissions FOR ALL USING (
        user_id = auth.uid() OR public.is_organizer_or_admin(auth.uid())
    );

-- 7. Contact Messages RLS
CREATE POLICY "Anyone can submit contact message"
    ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view contact message by email or admin"
    ON public.contact_messages FOR SELECT USING (
        email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        OR public.is_organizer_or_admin(auth.uid())
    );

CREATE POLICY "Organizers can update contact messages"
    ON public.contact_messages FOR UPDATE USING (public.is_organizer_or_admin(auth.uid()));

-- 8. Announcements RLS (Public read, admin write)
CREATE POLICY "Announcements viewable by everyone"
    ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Organizers can manage announcements"
    ON public.announcements FOR ALL USING (public.is_organizer_or_admin(auth.uid()));

-- 9. Schedule Items & FAQ Items & Event Content (Public read, admin write)
CREATE POLICY "Schedule items viewable by everyone"
    ON public.schedule_items FOR SELECT USING (true);

CREATE POLICY "Organizers can manage schedule"
    ON public.schedule_items FOR ALL USING (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "FAQs viewable by everyone"
    ON public.faq_items FOR SELECT USING (true);

CREATE POLICY "Organizers can manage FAQs"
    ON public.faq_items FOR ALL USING (public.is_organizer_or_admin(auth.uid()));

CREATE POLICY "Event Content viewable by everyone"
    ON public.event_content FOR SELECT USING (true);

CREATE POLICY "Organizers can manage Event Content"
    ON public.event_content FOR ALL USING (public.is_organizer_or_admin(auth.uid()));

-- ==========================================
-- STORAGE BUCKETS SETUP INSTRUCTIONS & POLICIES
-- ==========================================

-- Insert Default Event Data
INSERT INTO public.events (title, dates, venue, prize_pool, description)
VALUES (
    'INNO SPRINT 2026',
    'October 26–28, 2026',
    'VVIT University, Guntur, Andhra Pradesh, India',
    '₹50,000',
    'A premier 48-hour national hackathon bringing together student innovators to solve high-impact challenges in Agentic AI, Robotic AI, and Generative AI.'
) ON CONFLICT DO NOTHING;

-- Insert Seed FAQs
INSERT INTO public.faq_items (category, question, answer, display_order)
VALUES
('Registration', 'Who is eligible to participate in INNO SPRINT?', 'INNO SPRINT is open to all university, college, and institute students pursuing undergraduate, postgraduate, or diploma programs.', 1),
('Teams', 'Can I participate individually or in a team?', 'You can register either as an individual participant or in a team of 2 to 4 members. Teams can be formed across different departments or institutions.', 2),
('Themes', 'What are the main themes of the hackathon?', 'The hackathon features three primary tracks: 1. Agentic AI, 2. Robotic AI, and 3. Generative AI, plus an Open Innovation option.', 3),
('Venue', 'Where will INNO SPRINT take place?', 'The event will be hosted on-site at VVIT University, Guntur, Andhra Pradesh, India, with technical mentorship provided throughout the 48 hours.', 4),
('Certificates & Prizes', 'Will all participants receive certificates?', 'Yes! Official certificates of participation will be provided to all registered participants who complete and submit their project, along with ₹50,000 in cash prizes for top winners.', 5)
ON CONFLICT DO NOTHING;

-- Insert Seed Schedule Items
INSERT INTO public.schedule_items (event_date, start_time, end_time, title, description, location, display_order)
VALUES
('2026-10-26', '09:00:00', '10:30:00', 'Reporting & Registration Check-in', 'Participant desk verification and kit distribution', 'Main Auditorium Foyer', 1),
('2026-10-26', '10:30:00', '12:00:00', 'Grand Opening & Keynote Briefing', 'Introduction to tracks, judging criteria, and safety guidelines', 'Main Auditorium', 2),
('2026-10-26', '12:00:00', '13:00:00', 'Hacking Begins & Mentor Allocation', 'Official start of the 48-hour sprint', 'Innovation Labs', 3),
('2026-10-27', '10:00:00', '12:00:00', 'Mid-Sprint Mentoring Checkpoint', 'One-on-one review with technical mentors', 'Lab Block A', 4),
('2026-10-28', '12:00:00', '13:00:00', 'Code Freeze & Project Submission', 'Final submission of code repositories and demo links', 'Online Portal', 5),
('2026-10-28', '14:00:00', '17:00:00', 'Grand Expo & Valedictory Ceremony', 'Live project demos, judging, and prize distribution', 'Main Auditorium', 6)
ON CONFLICT DO NOTHING;
