import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isValidUuid } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LayoutDashboard, User, Users, FileCode, Award, Save, LogOut, Download, Zap, Bell, CheckCircle2, Clock, Sliders, ExternalLink, ShieldCheck } from 'lucide-react';
import { resolveVerifiedParticipantCertificate, downloadVerifiedParticipantCertificate } from '../lib/certificates';

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const [registration, setRegistration] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');

  // Notification Preferences State (saved locally per participant)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(`inno_sprint_prefs_${user?.email || 'default'}`);
      return stored ? JSON.parse(stored) : { scheduleReminders: true, workshopAlerts: true };
    } catch {
      return { scheduleReminders: true, workshopAlerts: true };
    }
  });
  const [prefSaveMsg, setPrefSaveMsg] = useState('');

  // Editable Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [mobile, setMobile] = useState(profile?.mobile || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [degreeBranch, setDegreeBranch] = useState(profile?.degree_branch || '');

  // Project Submission form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [slidesUrl, setSlidesUrl] = useState('');
  const [isFinalized, setIsFinalized] = useState(false);
  const [submissionMsg, setSubmissionMsg] = useState('');
  const [savingSubmission, setSavingSubmission] = useState(false);

  const [certResolution, setCertResolution] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [certError, setCertError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);

      let activeReg = null;

      if (isSupabaseConfigured) {
        try {
          const cleanEmail = (user.email || '').trim().toLowerCase();

          // 1. Fetch registration by user_id or applicant_email
          let regQuery = supabase
            .from('registrations')
            .select('*, teams(*, team_members(*))');

          if (user.id && /^[0-9a-f-]{36}$/i.test(String(user.id))) {
            regQuery = regQuery.or(`user_id.eq.${user.id},applicant_email.ilike.${cleanEmail}`);
          } else if (cleanEmail) {
            regQuery = regQuery.ilike('applicant_email', cleanEmail);
          }

          const { data: regList } = await regQuery.order('created_at', { ascending: false }).limit(1);
          let regData = regList && regList.length > 0 ? regList[0] : null;

          // 2. If not leader, check if user is a registered team member
          if (!regData && cleanEmail) {
            const { data: memberMatches } = await supabase
              .from('team_members')
              .select('team_id')
              .ilike('member_email', cleanEmail)
              .limit(1);

            if (memberMatches && memberMatches.length > 0 && memberMatches[0].team_id) {
              const { data: teamRegs } = await supabase
                .from('registrations')
                .select('*, teams(*, team_members(*))')
                .eq('team_id', memberMatches[0].team_id)
                .order('created_at', { ascending: false })
                .limit(1);

              if (teamRegs && teamRegs.length > 0) {
                regData = teamRegs[0];
              }
            }
          }

          if (regData) {
            const deletedList = JSON.parse(localStorage.getItem('inno_sprint_deleted_regs') || '[]');
            if (
              regData.reference_code?.startsWith('SYS-') ||
              (regData.organizer_notes && regData.organizer_notes.includes('__DELETED__')) ||
              deletedList.includes(regData.id) ||
              deletedList.includes(regData.reference_code)
            ) {
              regData = null;
            }
          }

          if (regData) {
            activeReg = regData;
            setRegistration(regData);

            // Fetch submission
            const { data: subData } = await supabase
              .from('project_submissions')
              .select('*')
              .eq('registration_id', regData.id)
              .maybeSingle();

            if (subData) {
              setSubmission(subData);
              setProjectTitle(subData.title || regData.project_title || '');
              setProjectSummary(subData.summary || regData.project_description || '');
              setRepoUrl(subData.repo_url || '');
              setDemoUrl(subData.demo_url || '');
              setVideoUrl(subData.video_url || '');
              setSlidesUrl(subData.slides_url || '');
              setIsFinalized(subData.is_finalized || false);
            } else {
              setProjectTitle(regData.project_title || '');
              setProjectSummary(regData.project_description || '');
            }
          }

          // 3. Fetch recent official announcements
          try {
            const { data: annData } = await supabase
              .from('announcements')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(3);
            if (annData && Array.isArray(annData)) {
              setAnnouncements(annData);
            }
          } catch {}
        } catch (err) {
          console.error('[Dashboard Load Error]', err);
        }
      } else {
        // Fallback local storage
        const storedRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
        const found = storedRegs.find(r => r.user_email === user.email || r.applicant_email === user.email);
        if (found) {
          activeReg = found;
          setRegistration(found);
          setProjectTitle(found.project_title || '');
        }
      }

      if (activeReg && user?.email) {
        try {
          const resolved = await resolveVerifiedParticipantCertificate({
            registration: activeReg,
            verifiedEmail: user.email,
          });
          setCertResolution(resolved);
        } catch (cErr) {
          console.warn('[Dashboard Certificate Check]', cErr);
        }
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [user]);

  const handleTogglePref = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      localStorage.setItem(`inno_sprint_prefs_${user?.email || 'default'}`, JSON.stringify(updated));
      setPrefSaveMsg('Notification preferences updated.');
      setTimeout(() => setPrefSaveMsg(''), 2500);
    } catch {}
  };

  const handleDownloadDashboardCertificate = async () => {
    if (!registration || !user?.email) return;
    setDownloadingCert(true);
    setCertError('');
    try {
      await downloadVerifiedParticipantCertificate({
        registration,
        verifiedEmail: user.email,
        targetParticipantKey: certResolution?.participant?.participantKey || null,
      });
    } catch (err) {
      setCertError(err.message || 'Unable to download certificate.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const { error } = await updateProfile({
      full_name: fullName,
      mobile,
      college,
      degree_branch: degreeBranch,
    });
    if (!error) {
      setProfileMessage('Profile information saved successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const handleSaveSubmission = async (e) => {
    e.preventDefault();
    setSavingSubmission(true);
    setSubmissionMsg('');

    try {
      if (isSupabaseConfigured && registration) {
        let submissionUserId = isValidUuid(user?.id)
          ? user.id
          : (isValidUuid(registration.user_id) ? registration.user_id : null);

        if (!submissionUserId) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id && isValidUuid(session.user.id)) {
              submissionUserId = session.user.id;
            }
          } catch {}
        }

        const payload = {
          registration_id: registration.id,
          team_id: registration.team_id || null,
          user_id: submissionUserId,
          title: projectTitle,
          summary: projectSummary,
          repo_url: repoUrl,
          demo_url: demoUrl,
          video_url: videoUrl,
          slides_url: slidesUrl,
          is_finalized: isFinalized,
          updated_at: new Date().toISOString()
        };

        if (submission) {
          await supabase
            .from('project_submissions')
            .update(payload)
            .eq('id', submission.id);
        } else {
          const { data } = await supabase
            .from('project_submissions')
            .insert(payload)
            .select()
            .single();
          if (data) setSubmission(data);
        }
      }

      setSubmissionMsg('Project submission saved successfully!');
      setTimeout(() => setSubmissionMsg(''), 3000);
    } catch (err) {
      console.error('[Save Submission Error]', err);
      setSubmissionMsg('Failed to save project submission.');
    } finally {
      setSavingSubmission(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-28 pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto animate-pulse">
            <Zap className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
          <h2 className="text-lg font-bold font-['Orbitron'] text-cyan-300 uppercase tracking-wider">
            Loading Workspace...
          </h2>
          <p className="text-xs text-gray-400">Synchronizing team details and project status from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      {/* HEADER */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-gray-900 to-amber-950 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-['Orbitron'] uppercase">
              PARTICIPANT DASHBOARD
            </span>
            <h1 className="text-3xl font-black uppercase text-white font-['Orbitron']">
              WELCOME, <span className="text-cyan-400">{profile?.full_name || user?.email}</span>
            </h1>
            <p className="text-xs text-gray-300 font-medium">
              Track registration status, manage team members, and submit your 48-hour sprint deliverables.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-red-950/60 border border-gray-700 hover:border-red-500/40 text-red-300 text-xs font-bold uppercase font-['Orbitron'] transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* IN-SITE NOTIFICATION BANNER */}
      {registration && (
        <section className="max-w-7xl mx-auto px-4 mb-6">
          {registration.status === 'approved' ? (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-gray-900 to-cyan-950/80 border border-emerald-500/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase font-['Orbitron']">
                      Official Shortlist Notice
                    </span>
                    <span className="text-xs text-amber-400 font-mono font-bold">Ref: {registration.reference_code}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-['Orbitron'] mt-1">
                    Your Innovation Project Has Been Shortlisted!
                  </h2>
                  <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                    Congratulations! Your team <strong className="text-white">{registration.teams?.team_name || registration.applicant_name}</strong> is selected for the next stage of INNOSPRINT 2026. Please report on <strong>October 26, 2026 at 09:00 AM IST</strong> at the VVIT University Campus, Guntur.
                  </p>
                </div>
              </div>
              <a
                href={`/register/status?ref=${encodeURIComponent(registration.reference_code)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase font-['Orbitron'] tracking-wider shrink-0 transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
              >
                <span>Live Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : registration.status === 'pending' ? (
            <div className="p-5 rounded-2xl bg-gray-900/90 border border-cyan-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <span className="text-xs font-bold uppercase font-['Orbitron'] text-cyan-300">
                    Application Under Technical Review
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Your registration ({registration.reference_code}) is actively queued with our jury. Decisions will reflect here automatically.
                  </p>
                </div>
              </div>
              <a
                href={`/register/status?ref=${encodeURIComponent(registration.reference_code)}`}
                className="text-xs text-cyan-400 hover:underline shrink-0 font-mono"
              >
                Track Status &rarr;
              </a>
            </div>
          ) : null}
        </section>
      )}

      {/* DASHBOARD GRID */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Registration Status & Team Info */}
        <div className="space-y-8">
          
          {/* Status Box */}
          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
            <h2 className="text-lg font-extrabold uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
              <span>Registration Status</span>
            </h2>

            {registration ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase">Ref Code:</span>
                  <span className="font-mono text-amber-400 font-bold text-sm">{registration.reference_code}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase">Approval Status:</span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-extrabold uppercase">
                    {registration.status || 'Pending'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase">Track:</span>
                  <strong className="text-cyan-300 font-['Orbitron']">{registration.theme}</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 p-4 rounded-xl bg-gray-950 text-center space-y-3">
                <p>No active registration record found for your account.</p>
                <a
                  href="/register"
                  className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-extrabold uppercase font-['Orbitron'] text-[11px]"
                >
                  Register Now
                </a>
              </div>
            )}
          </div>

          {/* Team Info Box */}
          {registration?.teams && (
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
              <h2 className="text-lg font-extrabold uppercase text-amber-400 font-['Orbitron'] border-b border-gray-800 pb-3 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Roster ({registration.teams.team_name})</span>
              </h2>

              <div className="space-y-2 text-xs">
                {registration.teams.team_members?.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                    <div>
                      <strong className="text-white block font-['Orbitron']">{m.member_name}</strong>
                      <span className="text-[10px] text-gray-400">{m.member_email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-900 text-cyan-400 text-[10px] font-bold">
                      {m.role_in_team}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificate Download Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-amber-500/30 space-y-3 text-center">
            <Award className="w-8 h-8 text-amber-400 mx-auto" />
            {certResolution?.status === 'Available' && certResolution?.certificate ? (
              <>
                <span className="inline-block px-3 py-0.5 rounded-full bg-amber-950 border border-amber-400/50 text-amber-300 text-[10px] font-extrabold uppercase font-['Orbitron']">
                  Available
                </span>
                <h3 className="font-extrabold uppercase text-sm font-['Orbitron'] text-white">
                  Your Certificate Is Ready!
                </h3>
                <p className="text-[11px] text-amber-300 font-mono truncate" title={certResolution.certificate.downloadFilename}>
                  {certResolution.certificate.downloadFilename}
                </p>
                {certError && (
                  <p className="text-[11px] text-red-400">{certError}</p>
                )}
                <button
                  type="button"
                  onClick={handleDownloadDashboardCertificate}
                  disabled={downloadingCert}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black uppercase font-['Orbitron'] shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingCert ? 'Downloading...' : 'Download Certificate'}</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="font-extrabold uppercase text-sm font-['Orbitron'] text-gray-200">
                  Certificate Not Available Yet
                </h3>
                <p className="text-[11px] text-gray-400">
                  Your certificate has not been published yet. Please check again later.
                </p>
              </>
            )}
          </div>

          {/* NOTIFICATION HISTORY & ANNOUNCEMENTS CARD */}
          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
            <h2 className="text-lg font-extrabold uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-3 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <span>Notice History</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold font-mono">
                LIVE
              </span>
            </h2>

            <div className="space-y-3">
              {/* Event 1: Shortlist Event */}
              {registration && (
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-['Orbitron'] text-[11px] flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${registration.status === 'approved' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
                      <span>{registration.status === 'approved' ? 'Shortlist Notification' : 'Application Review'}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {registration.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    {registration.status === 'approved'
                      ? 'Official shortlist status confirmed. Team invited to reporting desk on October 26, 2026.'
                      : 'Your registration is queued in the review pipeline.'}
                  </p>
                </div>
              )}

              {/* Event 2: Registration Submission */}
              {registration && (
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-['Orbitron'] text-[11px] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Registration Confirmed</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {registration.created_at ? new Date(registration.created_at).toLocaleDateString() : 'Received'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Registration received under reference code <strong className="text-amber-400 font-mono">{registration.reference_code}</strong>.
                  </p>
                </div>
              )}

              {/* Broadcast Announcements */}
              {announcements && announcements.length > 0 && (
                <div className="pt-2 border-t border-gray-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 font-['Orbitron'] tracking-wider block">
                    Official Broadcasts
                  </span>
                  {announcements.map((ann, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-cyan-300 text-[11px] font-['Orbitron'] truncate">{ann.title}</strong>
                        <span className="text-[9px] text-gray-400 font-mono shrink-0 ml-2">
                          {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES CARD */}
          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
            <h2 className="text-lg font-extrabold uppercase text-gray-200 font-['Orbitron'] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Notification Preferences</span>
            </h2>

            {prefSaveMsg && (
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold text-center">
                {prefSaveMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Mandatory Transactional Status */}
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white">Shortlist & Result Notices</strong>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Mandatory transactional emails</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  Always Active
                </span>
              </div>

              {/* Schedule Reminders Toggle */}
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">Milestone Reminders</strong>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Check-in, schedule, and deadline updates</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('scheduleReminders')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notifPrefs.scheduleReminders ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${notifPrefs.scheduleReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Workshop Alerts Toggle */}
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">Workshop & Mentorship</strong>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Speaker sessions & technical AMAs</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('workshopAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${notifPrefs.workshopAlerts ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${notifPrefs.workshopAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2 Spans): Project Deliverables & Profile Manager */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Project Deliverables Form */}
          <div className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-6">
            <h2 className="text-2xl font-black uppercase text-cyan-300 font-['Orbitron'] border-b border-gray-800 pb-4 flex items-center justify-between">
              <span className="flex items-center space-x-3">
                <FileCode className="w-6 h-6 text-cyan-400" />
                <span>Project Deliverables & Repository Links</span>
              </span>
              {isFinalized && (
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  FINALIZED
                </span>
              )}
            </h2>

            {submissionMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                {submissionMsg}
              </div>
            )}

            <form onSubmit={handleSaveSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Final Project Title *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Autonomous Edge-AI Swarm System"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Public GitHub Repository URL *
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/innosprint-project"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                    Live Video Demo Link (YouTube / Drive)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/xxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                    Presentation Deck / Slides URL
                  </label>
                  <input
                    type="url"
                    value={slidesUrl}
                    onChange={(e) => setSlidesUrl(e.target.value)}
                    placeholder="https://canva.com/xxx or Drive link"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Project Abstract / Summary *
                </label>
                <textarea
                  rows={4}
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  placeholder="Explain your technical architecture, model training/inference pipeline, and key innovation..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="finalized-check"
                  checked={isFinalized}
                  onChange={(e) => setIsFinalized(e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                <label htmlFor="finalized-check" className="text-xs text-amber-300 font-bold cursor-pointer">
                  Mark submission as finalized for judging evaluation
                </label>
              </div>

              <button
                type="submit"
                disabled={savingSubmission}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase text-xs tracking-wider font-['Orbitron'] transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingSubmission ? 'SAVING DELIVERABLES...' : 'SAVE DELIVERABLES'}</span>
              </button>
            </form>
          </div>

          {/* Profile Editor */}
          <div className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-6">
            <h2 className="text-xl font-black uppercase text-amber-400 font-['Orbitron'] border-b border-gray-800 pb-4 flex items-center space-x-3">
              <User className="w-5 h-5" />
              <span>Participant Profile Settings</span>
            </h2>

            {profileMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Degree & Branch
                </label>
                <input
                  type="text"
                  value={degreeBranch}
                  onChange={(e) => setDegreeBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase font-['Orbitron'] transition-colors"
                >
                  Update Profile Details
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
