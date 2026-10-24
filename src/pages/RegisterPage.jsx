import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, isValidUuid } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendEmailNotification } from '../lib/email';
import { THEMES } from '../lib/constants';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, User, Users, ShieldCheck, Zap, Copy, Check } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const initialTheme = searchParams.get('theme') || THEMES[0].name;

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [duplicateEmailInfo, setDuplicateEmailInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Participant Details
    fullName: profile?.full_name || '',
    email: user?.email || profile?.email || '',
    mobile: profile?.mobile || '',
    college: profile?.college || '',
    degreeBranch: profile?.degree_branch || '',
    yearOfStudy: profile?.year_of_study || '3rd Year',

    // Step 2: Participation Details
    participationType: 'team', // Team participation only (2 to 4 members)
    teamName: '',
    teamSize: 2,
    teamMembers: [
      { name: '', email: '', phone: '', role: 'Member 1' },
      { name: '', email: '', phone: '', role: 'Member 2' },
      { name: '', email: '', phone: '', role: 'Member 3' },
    ],

    // Step 3: Project Details
    theme: initialTheme,
    projectTitle: '',
    problemStatement: '',
    projectDescription: '',

    // Step 4: Documents
    proposalFile: null,
    studentIdFile: null,

    // Step 5: Consent
    consentRules: false,
    consentAccuracy: false,
  });

  // Success State & Last Submitted Reference
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [lastRef, setLastRef] = useState(() => localStorage.getItem('inno_sprint_last_ref') || '');

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        email: prev.email || profile.email || '',
        mobile: prev.mobile || profile.mobile || '',
        college: prev.college || profile.college || '',
        degreeBranch: prev.degreeBranch || profile.degree_branch || '',
        yearOfStudy: prev.yearOfStudy || profile.year_of_study || '3rd Year',
      }));
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
    if (duplicateEmailInfo) setDuplicateEmailInfo(null);
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index][field] = value;
    setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    if (errorMessage) setErrorMessage('');
    if (duplicateEmailInfo) setDuplicateEmailInfo(null);
  };

  // Helper to check if an email is already registered in Supabase or local state
  const checkEmailAlreadyRegistered = async (emailToCheck) => {
    const clean = (emailToCheck || '').trim().toLowerCase();
    if (!clean || !clean.includes('@')) return { registered: false };

    // 1. Check Supabase registrations table
    if (isSupabaseConfigured) {
      try {
        const { data: regMatch, error: regErr } = await supabase
          .from('registrations')
          .select('id, reference_code, applicant_email, status, organizer_notes')
          .ilike('applicant_email', clean);

        if (!regErr && regMatch && regMatch.length > 0) {
          // Only active non-rejected, non-deleted registrations block registration
          const activeReg = regMatch.find(r => {
            const s = (r.status || 'pending').toLowerCase();
            const notes = r.organizer_notes || '';
            if (s === 'rejected' || s === '__deleted__' || notes.includes('__DELETED__')) {
              return false;
            }
            return true;
          });
          if (activeReg) {
            return { registered: true, ref: activeReg.reference_code, source: 'applicant' };
          }
        }
      } catch (e) {
        console.warn('[Duplicate Check] registrations lookup notice:', e);
      }

      // 2. Check Supabase team_members table (only active teams with valid non-deleted registrations)
      try {
        const { data: memberMatch, error: memErr } = await supabase
          .from('team_members')
          .select('id, member_email, team_id')
          .ilike('member_email', clean);

        if (!memErr && memberMatch && memberMatch.length > 0) {
          for (const m of memberMatch) {
            if (m.team_id) {
              const { data: linkedRegs } = await supabase
                .from('registrations')
                .select('id, reference_code, status, organizer_notes')
                .eq('team_id', m.team_id);

              if (linkedRegs && linkedRegs.length > 0) {
                const activeLinked = linkedRegs.find(r => {
                  const s = (r.status || 'pending').toLowerCase();
                  const notes = r.organizer_notes || '';
                  return s !== 'rejected' && s !== '__deleted__' && !notes.includes('__DELETED__');
                });
                if (activeLinked) {
                  return { registered: true, ref: activeLinked.reference_code, source: 'team_member' };
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('[Duplicate Check] team_members lookup notice:', e);
      }

      // If online check confirmed email is NOT actively registered in Supabase,
      // purge any stale entries from localStorage so local caches never block a deleted registration
      try {
        const localRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
        const updatedLocal = localRegs.filter(r =>
          !(r.applicant_email && r.applicant_email.trim().toLowerCase() === clean) &&
          !(r.user_email && r.user_email.trim().toLowerCase() === clean) &&
          !(Array.isArray(r.team_members) && r.team_members.some(m => m.email && m.email.trim().toLowerCase() === clean))
        );
        localStorage.setItem('inno_sprint_registrations', JSON.stringify(updatedLocal));

        const lastReg = JSON.parse(localStorage.getItem('inno_sprint_last_registration') || 'null');
        if (lastReg && (
          (lastReg.applicant_email && lastReg.applicant_email.trim().toLowerCase() === clean) ||
          (lastReg.user_email && lastReg.user_email.trim().toLowerCase() === clean)
        )) {
          localStorage.removeItem('inno_sprint_last_registration');
        }
      } catch (e) {}

      // Supabase is the authoritative source of truth
      return { registered: false };
    }

    // Fallback only when Supabase is offline / unconfigured:
    // 3. Check localStorage registrations fallback
    try {
      const localRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
      const found = localRegs.find(r => 
        (r.applicant_email && r.applicant_email.trim().toLowerCase() === clean) ||
        (r.user_email && r.user_email.trim().toLowerCase() === clean) ||
        (Array.isArray(r.team_members) && r.team_members.some(m => m.email && m.email.trim().toLowerCase() === clean))
      );
      if (found) {
        return { registered: true, ref: found.reference_code, source: 'local' };
      }
    } catch (e) {}

    // 4. Check last registration record in localStorage
    try {
      const lastReg = JSON.parse(localStorage.getItem('inno_sprint_last_registration') || 'null');
      if (lastReg && (
        (lastReg.applicant_email && lastReg.applicant_email.trim().toLowerCase() === clean) ||
        (lastReg.user_email && lastReg.user_email.trim().toLowerCase() === clean)
      )) {
        return { registered: true, ref: lastReg.reference_code, source: 'local' };
      }
    } catch (e) {}

    return { registered: false };
  };

  const validateStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.college.trim()) {
        setErrorMessage('Please fill in all required participant details.');
        return false;
      }
      if (!formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return false;
      }
    } else if (step === 2) {
      if (formData.participationType === 'team') {
        if (!formData.teamName.trim()) {
          setErrorMessage('Please enter your team name.');
          return false;
        }
        for (let i = 0; i < formData.teamSize - 1; i++) {
          if (!formData.teamMembers[i].name.trim() || !formData.teamMembers[i].email.trim()) {
            setErrorMessage(`Please enter details for Team Member ${i + 1}.`);
            return false;
          }
        }
      }
    } else if (step === 3) {
      if (!formData.projectTitle.trim() || !formData.projectDescription.trim()) {
        setErrorMessage('Please provide a project title and short description.');
        return false;
      }
    } else if (step === 5) {
      if (!formData.consentRules || !formData.consentAccuracy) {
        setErrorMessage('You must accept the hackathon rules and verify your submitted details.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step === 1) {
      setCheckingEmail(true);
      const dup = await checkEmailAlreadyRegistered(formData.email);
      setCheckingEmail(false);
      if (dup.registered) {
        setDuplicateEmailInfo({ email: formData.email, ref: dup.ref });
        setErrorMessage(`This email (${formData.email}) is already registered for INNOSPRINT 2026. Duplicate registrations are not allowed.`);
        return;
      }
    } else if (step === 2 && formData.participationType === 'team') {
      const memberEmails = [formData.email.trim().toLowerCase()];
      for (let i = 0; i < formData.teamSize - 1; i++) {
        const mEmail = (formData.teamMembers[i].email || '').trim().toLowerCase();
        if (memberEmails.includes(mEmail)) {
          setErrorMessage(`Duplicate email inside team: "${mEmail}". Each member must have a unique email address.`);
          return;
        }
        memberEmails.push(mEmail);
      }

      setCheckingEmail(true);
      for (let i = 0; i < formData.teamSize - 1; i++) {
        const mEmail = (formData.teamMembers[i].email || '').trim().toLowerCase();
        const dup = await checkEmailAlreadyRegistered(mEmail);
        if (dup.registered) {
          setCheckingEmail(false);
          setDuplicateEmailInfo({ email: mEmail, ref: dup.ref });
          setErrorMessage(`Team Member ${i + 1} (${mEmail}) is already registered for INNOSPRINT 2026.`);
          return;
        }
      }
      setCheckingEmail(false);
    }

    setDuplicateEmailInfo(null);
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setErrorMessage('');
    setDuplicateEmailInfo(null);
    setStep(prev => prev - 1);
  };

  const uploadFileToSupabase = async (file, folder) => {
    if (!file || !isSupabaseConfigured) return null;
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanFileName}`;
      const { data, error } = await supabase.storage
        .from('participant-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Storage upload notice:', error.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('participant-uploads')
        .getPublicUrl(data?.path || filePath);

      return urlData?.publicUrl || filePath;
    } catch (e) {
      console.warn('File upload notice:', e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateStep()) return;

    setLoading(true);
    setErrorMessage('');
    setDuplicateEmailInfo(null);

    // Final check before database writes: prevent duplicate registrations
    const primaryDup = await checkEmailAlreadyRegistered(formData.email);
    if (primaryDup.registered) {
      setDuplicateEmailInfo({ email: formData.email, ref: primaryDup.ref });
      setErrorMessage(`This email (${formData.email}) is already registered for INNOSPRINT 2026. Duplicate registrations are not allowed.`);
      setLoading(false);
      return;
    }

    if (formData.participationType === 'team') {
      const allEmails = [formData.email.trim().toLowerCase()];
      for (let i = 0; i < formData.teamSize - 1; i++) {
        const mEmail = (formData.teamMembers[i].email || '').trim().toLowerCase();
        if (allEmails.includes(mEmail)) {
          setErrorMessage(`Duplicate email within team: "${mEmail}". Each team member must have a distinct email address.`);
          setLoading(false);
          return;
        }
        allEmails.push(mEmail);

        const memberDup = await checkEmailAlreadyRegistered(mEmail);
        if (memberDup.registered) {
          setDuplicateEmailInfo({ email: mEmail, ref: memberDup.ref });
          setErrorMessage(`Team Member ${i + 1} (${mEmail}) is already registered for INNOSPRINT 2026.`);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const refCode = 'INNO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Upload optional documents
      let proposalUrl = null;
      let studentIdUrl = null;

      if (formData.proposalFile) {
        proposalUrl = await uploadFileToSupabase(formData.proposalFile, 'proposals');
      }
      if (formData.studentIdFile) {
        studentIdUrl = await uploadFileToSupabase(formData.studentIdFile, 'student_ids');
      }

      let teamId = null;

      if (isSupabaseConfigured) {
        // 1. Resolve strictly verified Supabase Auth user UUID
        // Ensures non-UUID values (like "usr_rajavardhan445_gmail_com") are NEVER passed to PostgreSQL UUID columns
        let verifiedAuthUserId = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const candidateId = (session?.user?.id && isValidUuid(session.user.id))
            ? session.user.id
            : (user?.id && isValidUuid(user.id) ? user.id : null);

          if (candidateId) {
            // Check if profile exists in public.profiles to satisfy foreign key constraint
            const { data: profRow } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', candidateId)
              .maybeSingle();

            if (profRow?.id) {
              verifiedAuthUserId = profRow.id;
            } else {
              // Upsert minimal profile to guarantee foreign key constraint succeeds
              const { error: profUpsertErr } = await supabase
                .from('profiles')
                .upsert({
                  id: candidateId,
                  full_name: formData.fullName.trim() || 'Participant',
                  email: formData.email.trim().toLowerCase(),
                  mobile: formData.mobile.trim() || null,
                  college: formData.college.trim() || null,
                  degree_branch: formData.degreeBranch.trim() || null,
                  year_of_study: formData.yearOfStudy || null,
                });
              if (!profUpsertErr) {
                verifiedAuthUserId = candidateId;
              }
            }
          }
        } catch (authErr) {
          console.warn('[Register] Auth session verification notice:', authErr);
          verifiedAuthUserId = null;
        }

        // 2. Create Team if team mode
        if (formData.participationType === 'team') {
          const { data: teamData, error: teamErr } = await supabase
            .from('teams')
            .insert({
              team_name: formData.teamName.trim(),
              leader_id: verifiedAuthUserId, // Valid UUID or null
              theme: formData.theme,
            })
            .select()
            .single();

          if (teamErr) throw teamErr;
          teamId = teamData.id;

          // Insert team members
          const membersToInsert = formData.teamMembers.slice(0, formData.teamSize - 1).map((m, idx) => ({
            team_id: teamId,
            member_name: m.name.trim(),
            member_email: m.email.trim().toLowerCase(),
            member_phone: m.phone ? m.phone.trim() : null,
            role_in_team: `Member ${idx + 1}`
          }));

          if (membersToInsert.length > 0) {
            const { error: memErr } = await supabase.from('team_members').insert(membersToInsert);
            if (memErr) {
              // Rollback orphaned team
              await supabase.from('teams').delete().eq('id', teamId).catch(() => {});
              throw memErr;
            }
          }
        }

        // 3. Create Registration record in Supabase
        const { error: regErr } = await supabase
          .from('registrations')
          .insert({
            reference_code: refCode,
            user_id: verifiedAuthUserId, // Valid UUID or null
            applicant_name: formData.fullName.trim(),
            applicant_email: formData.email.trim().toLowerCase(),
            applicant_mobile: formData.mobile.trim(),
            applicant_college: formData.college.trim(),
            degree_branch: formData.degreeBranch.trim(),
            year_of_study: formData.yearOfStudy,
            participation_type: formData.participationType,
            team_id: teamId,
            theme: formData.theme,
            project_title: formData.projectTitle.trim(),
            problem_statement: formData.problemStatement.trim(),
            project_description: formData.projectDescription.trim(),
            proposal_url: proposalUrl,
            student_id_url: studentIdUrl,
            consent_accepted: true,
            status: 'pending'
          });

        if (regErr) {
          // Rollback orphaned team and members on registration failure
          if (teamId) {
            await supabase.from('team_members').delete().eq('team_id', teamId).catch(() => {});
            await supabase.from('teams').delete().eq('id', teamId).catch(() => {});
          }
          throw regErr;
        }
      }

      // Always save locally so status check & refresh work reliably and immediately
      try {
        const existingRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
        const localEntry = {
          reference_code: refCode,
          applicant_name: formData.fullName,
          user_name: formData.fullName,
          applicant_email: formData.email,
          user_email: formData.email,
          applicant_mobile: formData.mobile,
          applicant_college: formData.college,
          degree_branch: formData.degreeBranch,
          year_of_study: formData.yearOfStudy,
          participation_type: formData.participationType,
          team_name: formData.teamName,
          theme: formData.theme,
          project_title: formData.projectTitle,
          problem_statement: formData.problemStatement,
          project_description: formData.projectDescription,
          proposal_url: proposalUrl,
          student_id_url: studentIdUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        const filteredRegs = existingRegs.filter(r =>
          r.reference_code !== refCode &&
          r.applicant_email?.trim().toLowerCase() !== formData.email.trim().toLowerCase() &&
          r.user_email?.trim().toLowerCase() !== formData.email.trim().toLowerCase()
        );
        filteredRegs.unshift(localEntry);
        localStorage.setItem('inno_sprint_registrations', JSON.stringify(filteredRegs));
        localStorage.setItem('inno_sprint_last_registration', JSON.stringify(localEntry));
      } catch (saveErr) {
        console.warn('Could not persist registration locally', saveErr);
      }

      // Dispatch Confirmation Email
      await sendEmailNotification({
        to: formData.email,
        subject: `[INNOSPRINT 2026] Registration Received (${refCode})`,
        template: 'registration_confirmation',
        data: {
          name: formData.fullName,
          referenceCode: refCode,
          theme: formData.theme,
          participationType: formData.participationType === 'team' ? `Team (${formData.teamName})` : 'Individual'
        }
      });

      setRegistrationSuccess({
        referenceCode: refCode,
        fullName: formData.fullName,
        email: formData.email,
        theme: formData.theme,
        participationType: formData.participationType,
        teamName: formData.teamName,
      });

      try {
        localStorage.setItem('inno_sprint_last_ref', refCode);
        setLastRef(refCode);
      } catch (e) {
        console.warn('Could not save last reference code to localStorage', e);
      }

    } catch (err) {
      console.error('[Registration Error]', err);
      setErrorMessage(err.message || 'Registration failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = () => {
    if (registrationSuccess?.referenceCode) {
      navigator.clipboard.writeText(registrationSuccess.referenceCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // SUCCESS SCREEN VIEW
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full p-8 sm:p-10 rounded-3xl bg-gray-900/90 border border-cyan-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-['Orbitron'] uppercase">
            REGISTRATION SUBMITTED SUCCESSFULLY
          </span>

          <h1 className="text-3xl sm:text-4xl font-black font-['Orbitron'] text-white">
            WELCOME TO <span className="text-cyan-400">INNOSPRINT 2026</span>
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            Your application has been received and logged in our database. Please save your unique reference code to check your approval status.
          </p>

          {/* Reference Code Box */}
          <div className="p-6 rounded-2xl bg-black/60 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs text-gray-400 uppercase font-bold font-['Orbitron'] block">Registration Reference ID</span>
              <span className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                {registrationSuccess.referenceCode}
              </span>
            </div>
            <button
              onClick={copyRefCode}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase flex items-center space-x-2 transition-colors font-['Orbitron']"
            >
              {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedRef ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left text-xs bg-gray-950/60 p-4 rounded-xl border border-gray-800">
            <div>
              <span className="text-gray-500 uppercase block font-bold">Selected Track:</span>
              <strong className="text-cyan-300 font-['Orbitron']">{registrationSuccess.theme}</strong>
            </div>
            <div>
              <span className="text-gray-500 uppercase block font-bold">Participation:</span>
              <strong className="text-amber-400 font-['Orbitron']">
                {registrationSuccess.participationType === 'team' ? `Team (${registrationSuccess.teamName})` : 'Individual'}
              </strong>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={`/status?email=${encodeURIComponent(registrationSuccess.email)}`}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider font-['Orbitron'] shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>Track Application Status Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="px-6 py-3.5 rounded-xl bg-gray-900 border border-gray-700 text-white font-bold text-xs uppercase tracking-wider font-['Orbitron'] hover:bg-gray-800 transition-colors"
            >
              Return To Homepage
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 text-left space-y-1.5">
            <div className="flex items-center space-x-2 font-['Orbitron'] uppercase font-bold text-amber-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>How To Check Your Approval Status Anytime:</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              If you leave or close this page, your registration is safely saved in our database. You can track whether your team is approved anytime by clicking <strong>"Check Status"</strong> in the website navigation menu and searching with your registered email: <code className="font-mono text-cyan-400 font-bold">{registrationSuccess.email}</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      {/* HEADER */}
      <section className="py-8 px-4 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>NATIONAL LEVEL HACKATHON • REGISTRATION PORTAL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase font-['Orbitron']">
          TEAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">REGISTRATION</span>
        </h1>
        <p className="text-gray-300 text-sm font-medium max-w-xl mx-auto">
          Complete the multi-step form to register your team (2 to 4 members) for the 48-Hour National Level Hackathon at VVITU.
        </p>

        {/* Existing Registration Banner (if previously submitted) */}
        {lastRef && (
          <div className="pt-2 max-w-xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center space-x-2 text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Already registered? You can track your application status anytime.
                </span>
              </div>
              <Link
                to="/status"
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-[10px] uppercase font-['Orbitron'] hover:bg-cyan-400 transition-colors whitespace-nowrap shadow-md"
              >
                Check Status →
              </Link>
            </div>
          </div>
        )}

        {/* Multi-step progress bar */}
        <div className="pt-6 max-w-2xl mx-auto flex items-center justify-between text-xs font-bold uppercase font-['Orbitron']">
          {[
            { num: 1, label: 'Team Lead' },
            { num: 2, label: 'Team Members' },
            { num: 3, label: 'Project' },
            { num: 4, label: 'Docs' },
            { num: 5, label: 'Submit' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center space-y-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  step === s.num
                    ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/40'
                    : step > s.num
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                    : 'bg-gray-900 text-gray-500 border-gray-800'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[10px] hidden sm:block ${step === s.num ? 'text-cyan-300' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FORM CONTAINER */}
      <section className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-2xl space-y-8">
          
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs shadow-xl space-y-3 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-1 text-left flex-1">
                  <p className="font-bold text-sm text-red-300">{errorMessage}</p>
                  {duplicateEmailInfo && (
                    <p className="text-gray-300 text-xs leading-relaxed">
                      An application is already registered for this email address. You can check your application status, approval details, and assigned reference code directly on the Check Status page.
                    </p>
                  )}
                </div>
              </div>
              {duplicateEmailInfo && (
                <div className="pt-1 flex items-center space-x-3">
                  <Link
                    to={`/status?email=${encodeURIComponent(duplicateEmailInfo.email)}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase font-['Orbitron'] transition-colors shadow-md"
                  >
                    <span>Check Application Status →</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: PARTICIPANT DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3">
                Step 1: Primary Participant Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="e.g., Alex Johnson"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    College / University *
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    placeholder="VVITU / University Name"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    Degree & Branch *
                  </label>
                  <input
                    type="text"
                    value={formData.degreeBranch}
                    onChange={(e) => handleChange('degreeBranch', e.target.value)}
                    placeholder="B.Tech Computer Science / AI"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                    Year of Study
                  </label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => handleChange('yearOfStudy', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate / Diploma">Postgraduate / Diploma</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TEAM DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3">
                Step 2: Team Details & Members
              </h2>

              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-400/50 text-amber-200 flex items-center space-x-3 shadow-md">
                <Users className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-extrabold uppercase text-xs font-['Orbitron'] block text-amber-300">
                    Team Participation (2 to 4 Members Required)
                  </span>
                  <span className="text-[11px] text-gray-300">
                    Individual participation is not permitted. Please enter your team name and member details below.
                  </span>
                </div>
              </div>

              {formData.participationType === 'team' && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        value={formData.teamName}
                        onChange={(e) => handleChange('teamName', e.target.value)}
                        placeholder="e.g., CyberSprints"
                        className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                        Total Team Members
                      </label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => handleChange('teamSize', parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      >
                        <option value={2}>2 Members (Leader + 1 Member)</option>
                        <option value={3}>3 Members (Leader + 2 Members)</option>
                        <option value={4}>4 Members (Leader + 3 Members)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-bold uppercase text-cyan-400 font-['Orbitron'] block">
                      Team Member Details (Excluding Team Leader)
                    </span>

                    {Array.from({ length: formData.teamSize - 1 }).map((_, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                        <span className="text-xs font-extrabold text-amber-400 font-['Orbitron'] block">
                          Member #{idx + 2}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Full Name *"
                            value={formData.teamMembers[idx]?.name || ''}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email Address *"
                            value={formData.teamMembers[idx]?.email || ''}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PROJECT & THEME DETAILS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-1xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3">
                Step 3: Track Selection & Project Details
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Select Competition Track / Theme *
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-cyan-500/40 text-cyan-300 text-sm font-bold font-['Orbitron'] focus:outline-none"
                >
                  {THEMES.map(t => (
                    <option key={t.id} value={t.name}>{t.name} — {t.badge}</option>
                  ))}
                  <option value="Open Innovation">Open Innovation — AI & Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Project Title / Proposed Idea *
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => handleChange('projectTitle', e.target.value)}
                  placeholder="e.g., Autonomous Edge-AI Swarm Robotics System"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Problem Statement / Use Case
                </label>
                <input
                  type="text"
                  value={formData.problemStatement}
                  onChange={(e) => handleChange('problemStatement', e.target.value)}
                  placeholder="Briefly state the real-world problem you aim to solve"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Short Project Summary / Abstract *
                </label>
                <textarea
                  rows={4}
                  value={formData.projectDescription}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  placeholder="Describe your tech stack, architecture, expected output, and AI models..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 4: OPTIONAL DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3">
                Step 4: Supporting Document Uploads (Optional)
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <label className="block text-xs font-bold uppercase text-gray-300 font-['Orbitron']">
                    Project Proposal / Presentation Slide (PDF / PPT)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => handleChange('proposalFile', e.target.files[0])}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900"
                  />
                  <p className="text-[10px] text-gray-500">Max size: 10MB. Optional proposal draft.</p>
                </div>

                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <label className="block text-xs font-bold uppercase text-gray-300 font-['Orbitron']">
                    Student ID Card Verification (Optional / JPG / PNG / PDF)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleChange('studentIdFile', e.target.files[0])}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900"
                  />
                  <p className="text-[10px] text-gray-500">Max size: 5MB. Verified during desk check-in.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONSENT & SUBMIT */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3">
                Step 5: Consent & Final Submission
              </h2>

              <div className="p-4 rounded-xl bg-gray-950 border border-cyan-500/20 text-xs space-y-2 text-gray-300">
                <span className="font-extrabold uppercase text-amber-400 font-['Orbitron'] block">Summary Review</span>
                <p><strong>Team Leader:</strong> {formData.fullName} ({formData.email})</p>
                <p><strong>Institution:</strong> {formData.college}</p>
                <p><strong>Team:</strong> {formData.teamName} ({formData.teamSize} Members)</p>
                <p><strong>Track:</strong> {formData.theme}</p>
                <p><strong>Project Title:</strong> {formData.projectTitle}</p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start space-x-3 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentRules}
                    onChange={(e) => handleChange('consentRules', e.target.checked)}
                    className="mt-0.5 rounded accent-cyan-400"
                    required
                  />
                  <span>
                    I accept the INNOSPRINT{' '}
                    <Link
                      to="/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:text-amber-400 underline font-bold transition-colors"
                    >
                      competition rules, eligibility conditions, and code of conduct
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex items-start space-x-3 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAccuracy}
                    onChange={(e) => handleChange('consentAccuracy', e.target.checked)}
                    className="mt-0.5 rounded accent-cyan-400"
                    required
                  />
                  <span>I confirm that all provided participant details and team information are accurate.</span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* CONTROLS */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-gray-300 hover:text-white font-bold text-xs uppercase font-['Orbitron'] flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={checkingEmail || loading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider font-['Orbitron'] shadow-md hover:bg-cyan-400 flex items-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {checkingEmail ? (
                  <span>Verifying Email...</span>
                ) : (
                  <>
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider font-['Orbitron'] shadow-xl hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>SUBMITTING REGISTRATION...</span>
                ) : (
                  <>
                    <span>SUBMIT REGISTRATION</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </section>

    </div>
  );
}
