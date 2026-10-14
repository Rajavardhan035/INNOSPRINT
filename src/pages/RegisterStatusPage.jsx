import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Copy,
  Check,
  FileText,
  MapPin,
  Calendar,
  Printer,
  ArrowRight,
  RefreshCw,
  Award,
  Download,
  Lock,
} from 'lucide-react';
import { EVENT_DETAILS } from '../lib/constants';
import {
  resolveVerifiedParticipantCertificate,
  downloadVerifiedParticipantCertificate,
  checkVerificationRateLimit,
  fetchAllCertificatesMap,
  expandRegistrationsToParticipantRows,
} from '../lib/certificates';

export default function RegisterStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const initialEmail = searchParams.get('email') || searchParams.get('ref') || '';

  // Start with clean empty search bar unless a parameter is explicitly passed in URL
  const [query, setQuery] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  // Certificate verification & download state
  const [verifiedEmailInput, setVerifiedEmailInput] = useState('');
  const [certResolution, setCertResolution] = useState(null);
  const [teamMembersRoster, setTeamMembersRoster] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const evaluateCertificateForRegistration = async (regRecord, candidateEmail) => {
    if (!regRecord) {
      setCertResolution(null);
      setTeamMembersRoster([]);
      return;
    }

    setCertLoading(true);
    setDownloadError('');
    setDownloadSuccess('');

    try {
      // 1. Expand all team members and their individual certificate statuses
      const certMap = await fetchAllCertificatesMap([regRecord]);
      const members = expandRegistrationsToParticipantRows([regRecord], certMap);
      setTeamMembersRoster(members);

      // 2. Resolve the specific verified participant if email provided
      const emailToVerify = (candidateEmail || '').trim().toLowerCase();
      const resolution = await resolveVerifiedParticipantCertificate({
        registration: regRecord,
        verifiedEmail: emailToVerify,
      });
      setCertResolution(resolution);
    } catch (err) {
      setCertResolution({
        verified: false,
        status: 'Error',
        error: err.message || 'Unable to verify certificate status.',
      });
    } finally {
      setCertLoading(false);
    }
  };

  const handleSearch = async (searchQuery) => {
    const rawTerm = (searchQuery !== undefined ? searchQuery : query).trim();
    if (!rawTerm) return;

    // Rate limiting protection on public status lookup
    const rateCheck = checkVerificationRateLimit(`status_lookup:${rawTerm}`);
    if (!rateCheck.allowed) {
      setErrorMsg(rateCheck.error);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setDownloadError('');
    setDownloadSuccess('');

    const termClean = rawTerm.toLowerCase();
    const termUpper = rawTerm.toUpperCase().replace(/\s+/g, '-');
    const isEmailSearch = termClean.includes('@');

    try {
      let matchedData = null;

      if (isSupabaseConfigured) {
        // 1. Primary search: by registered leader email or reference code
        try {
          const { data, error } = await supabase
            .from('registrations')
            .select('*, teams(id, team_name, theme, team_members(*))')
            .or(
              `applicant_email.ilike.${termClean},reference_code.ilike.${termClean},reference_code.eq.${termUpper}`
            )
            .order('created_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            matchedData = data[0];
          }
        } catch (e) {
          console.warn('[Status Search] Primary email query fallback:', e);
        }

        // 2. Check if this email belongs to a registered team member
        if (isEmailSearch) {
          try {
            const { data: memberMatches } = await supabase
              .from('team_members')
              .select('team_id, member_name, member_email, role_in_team')
              .ilike('member_email', termClean)
              .order('joined_at', { ascending: false });

            if (memberMatches && memberMatches.length > 0) {
              for (const mMatch of memberMatches) {
                if (!mMatch.team_id) continue;
                const { data: teamRegs } = await supabase
                  .from('registrations')
                  .select('*, teams(id, team_name, theme, team_members(*))')
                  .eq('team_id', mMatch.team_id)
                  .order('created_at', { ascending: false })
                  .limit(1);

                if (teamRegs && teamRegs.length > 0) {
                  // Prefer an approved/team registration if the primary match was not found or was rejected
                  if (!matchedData || (matchedData.status === 'rejected' && teamRegs[0].status !== 'rejected')) {
                    matchedData = teamRegs[0];
                  }
                  break;
                }
              }
            }
          } catch (e) {
            console.warn('[Status Search] Team member email fallback:', e);
          }
        }
      }

      // 3. Check localStorage fallback if Supabase had no match
      if (!matchedData) {
        try {
          const stored = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
          const found = stored.find(
            (r) =>
              (r.applicant_email && r.applicant_email.toLowerCase() === termClean) ||
              (r.user_email && r.user_email.toLowerCase() === termClean) ||
              (r.reference_code && r.reference_code.toUpperCase() === termUpper) ||
              (r.reference_code && r.reference_code.toUpperCase() === rawTerm.toUpperCase())
          );
          if (found) matchedData = found;
        } catch {
          // Ignore localStorage parse error
        }
      }

      // 4. Check last registration record in localStorage
      if (!matchedData) {
        try {
          const lastReg = JSON.parse(localStorage.getItem('inno_sprint_last_registration') || 'null');
          if (
            lastReg &&
            ((lastReg.applicant_email && lastReg.applicant_email.toLowerCase() === termClean) ||
              (lastReg.user_email && lastReg.user_email.toLowerCase() === termClean) ||
              (lastReg.reference_code && lastReg.reference_code.toUpperCase() === termUpper))
          ) {
            matchedData = lastReg;
          }
        } catch {
          // Ignore localStorage parse error
        }
      }

      if (!matchedData) {
        setResult(null);
        setCertResolution(null);
        setErrorMsg(
          `No registration record found for "${rawTerm}". Please ensure you entered the exact email address used during registration.`
        );
      } else {
        setResult(matchedData);
        setErrorMsg('');

        // Determine verified email for certificate lookup:
        // Never treat a publicly known Registration ID (INNO-XXXX) alone as sufficient authorization!
        const activeVerifiedEmail = isEmailSearch
          ? termClean
          : user?.email
          ? user.email.toLowerCase()
          : '';

        setVerifiedEmailInput(activeVerifiedEmail);
        await evaluateCertificateForRegistration(matchedData, activeVerifiedEmail);
      }
    } catch (err) {
      console.error('[Status Search Error]', err);
      setErrorMsg('Failed to check status due to a network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search only when an email or ref is passed via the URL
  useEffect(() => {
    if (initialEmail && initialEmail.trim()) {
      const term = initialEmail.trim();
      setQuery(term);
      handleSearch(term);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);


  const handleVerifyEmailForCertificate = async (e) => {
    e.preventDefault();
    if (!result || !verifiedEmailInput.trim()) return;
    await evaluateCertificateForRegistration(result, verifiedEmailInput.trim());
  };

  const handleDownloadCertificate = async () => {
    if (!result || !certResolution?.verified || certResolution?.status !== 'Available') return;

    setDownloadingCert(true);
    setDownloadError('');
    setDownloadSuccess('');

    try {
      const downloadRes = await downloadVerifiedParticipantCertificate({
        registration: result,
        verifiedEmail: certResolution.participant?.email || verifiedEmailInput,
        targetParticipantKey: certResolution.participant?.participantKey || null,
      });

      setDownloadSuccess(
        `Your official certificate (${downloadRes.downloadFilename}) has started downloading.`
      );
    } catch (err) {
      console.error('[Certificate Download Error]', err);
      setDownloadError(
        err.message || 'Unable to download your certificate at this time. Please try again.'
      );
    } finally {
      setDownloadingCert(false);
    }
  };

  const copyRefCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs uppercase flex items-center space-x-2 shadow-lg shadow-emerald-950/60 font-['Orbitron']">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>APPROVED & CONFIRMED</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-4 py-1.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 font-extrabold text-xs uppercase flex items-center space-x-2 shadow-lg shadow-red-950/60 font-['Orbitron']">
            <XCircle className="w-4 h-4 text-red-400" />
            <span>NOT SELECTED</span>
          </span>
        );
      case 'waitlisted':
        return (
          <span className="px-4 py-1.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-extrabold text-xs uppercase flex items-center space-x-2 shadow-lg shadow-amber-950/60 font-['Orbitron']">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>WAITLISTED</span>
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-extrabold text-xs uppercase flex items-center space-x-2 shadow-lg shadow-cyan-950/60 font-['Orbitron']">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>UNDER REVIEW (PENDING)</span>
          </span>
        );
    }
  };

  // Resolved participant identity (shows the specific team member or leader who searched)
  const displayParticipantName =
    certResolution?.participant?.fullName ||
    result?.applicant_name ||
    result?.profiles?.full_name ||
    result?.user_name ||
    'Participant';

  const displayParticipantEmail =
    certResolution?.participant?.email ||
    result?.applicant_email ||
    result?.profiles?.email ||
    result?.user_email ||
    query;

  const displayParticipantRole =
    certResolution?.participant?.roleInTeam ||
    (result?.participation_type === 'team' ? 'Team Leader' : 'Participant');

  const displayTeamName =
    result?.teams?.team_name ||
    result?.team_name ||
    (result?.participation_type === 'team' ? 'Team Entry' : 'Individual');

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-32 pb-24 selection:bg-cyan-500 selection:text-black">
      {/* HEADER SECTION */}
      <section className="py-8 px-4 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>INNOSPRINT 2026 APPLICANT & CERTIFICATE PORTAL</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase font-['Orbitron']">
          CHECK REGISTRATION{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400">
            STATUS & CERTIFICATE
          </span>
        </h1>

        <p className="text-gray-300 text-sm font-medium max-w-xl mx-auto leading-relaxed">
          Enter the email address you used during registration to check your team approval status and download your official participation certificate.
        </p>

        {/* SEARCH FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const term = query.trim();
            if (term) {
              setSearchParams({ email: term }, { replace: true });
              handleSearch(term);
            }
          }}
          className="pt-4 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your registered email (e.g. student@gmail.com)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs uppercase font-['Orbitron'] shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Searching...' : 'Check Status'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* RESULT DISPLAY */}
      <section className="max-w-3xl mx-auto px-4 pt-4">
        {errorMsg && (
          <div className="p-6 rounded-2xl bg-red-950/60 border border-red-500/40 text-center text-red-300 text-sm font-semibold space-y-2 shadow-xl">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p>{errorMsg}</p>
            <p className="text-xs text-gray-400">
              Need assistance? Contact our organizing desk at{' '}
              <a
                href={`mailto:${EVENT_DETAILS.organizers.contactEmail}`}
                className="text-cyan-400 underline"
              >
                {EVENT_DETAILS.organizers.contactEmail}
              </a>
              .
            </p>
          </div>
        )}

        {result && (
          <div className="p-6 sm:p-10 rounded-3xl bg-gray-900/80 border border-cyan-500/40 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Top Glow Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-purple-500" />

            {/* HEADER OF DOSSIER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-gray-400 font-bold uppercase font-['Orbitron'] tracking-wider">
                    Registration Dossier
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase font-['Orbitron']">
                    {displayParticipantRole}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Orbitron'] pt-1">
                  {displayParticipantName}
                </h3>
                <span className="text-xs text-cyan-400 font-mono block pt-1">
                  {displayParticipantEmail}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {renderStatusBadge(result.status)}
                <button
                  type="button"
                  onClick={() => handleSearch(query || result.reference_code)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-['Orbitron'] font-bold disabled:opacity-50 shadow-md"
                  title="Refresh Live Status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{loading ? 'Checking...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* ====================================================================
                OFFICIAL CERTIFICATE STATUS & DOWNLOAD SECTION (Section 4 & 5)
            ==================================================================== */}
            <div
              className={`p-6 rounded-2xl border shadow-xl transition-all ${
                certResolution?.status === 'Available'
                  ? 'bg-gradient-to-br from-amber-950/50 via-gray-950 to-emerald-950/30 border-amber-500/50'
                  : 'bg-gray-950/90 border-gray-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      certResolution?.status === 'Available'
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase font-['Orbitron'] text-gray-400 block">
                      Official Credential Status
                    </span>
                    <h4 className="text-base sm:text-lg font-black uppercase font-['Orbitron'] text-white">
                      {certLoading
                        ? 'Checking Certificate...'
                        : certResolution?.status === 'Available'
                        ? 'Your Certificate Is Ready!'
                        : certResolution?.requiresEmailVerification
                        ? 'Verify Email to View Certificate'
                        : 'Certificate Not Available Yet'}
                    </h4>
                  </div>
                </div>

                {/* Certificate Status Badge */}
                <div>
                  {certResolution?.status === 'Available' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-950 border border-amber-400/60 text-amber-300 text-xs font-extrabold uppercase font-['Orbitron'] shadow-md shadow-amber-950/50">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Available</span>
                    </span>
                  ) : certResolution?.requiresEmailVerification ? (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase font-['Orbitron']">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verification Required</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-700 text-gray-400 text-xs font-bold uppercase font-['Orbitron']">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Not Uploaded</span>
                    </span>
                  )}
                </div>
              </div>

              {/* STATE 1: Requires Email Verification (when searched by Registration ID alone) */}
              {certResolution?.requiresEmailVerification && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    For participant privacy, a Registration ID alone cannot unlock individual certificates. Please enter your personal registered email address below to verify your identity and access your certificate:
                  </p>
                  <form
                    onSubmit={handleVerifyEmailForCertificate}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="email"
                      value={verifiedEmailInput}
                      onChange={(e) => setVerifiedEmailInput(e.target.value)}
                      placeholder="Enter your registered participant email..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={certLoading}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase font-['Orbitron']"
                    >
                      Verify My Email
                    </button>
                  </form>
                  {certResolution?.reason === 'EMAIL_MISMATCH' && (
                    <p className="text-xs text-red-400 font-semibold">{certResolution.error}</p>
                  )}
                </div>
              )}

              {/* STATE 2: Certificate Not Uploaded Yet (Section 4.A) */}
              {!certLoading &&
                !certResolution?.requiresEmailVerification &&
                certResolution?.status !== 'Available' && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300 font-medium">
                      Your certificate has not been published yet. Please check again later.
                    </p>
                    <p className="text-xs text-gray-500">
                      Verified Participant: <strong className="text-gray-300">{displayParticipantName}</strong> ({displayParticipantRole})
                    </p>
                  </div>
                )}

              {/* STATE 3: Certificate Available (Section 4.B & 4.C) */}
              {!certLoading &&
                certResolution?.verified &&
                certResolution?.status === 'Available' &&
                certResolution?.certificate && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-black/50 border border-amber-500/20 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-['Orbitron'] block">
                          Certificate Recipient
                        </span>
                        <strong className="text-white text-sm font-['Orbitron'] block mt-0.5">
                          {certResolution.participant.fullName}
                        </strong>
                        <span className="text-[11px] text-cyan-400 font-mono">
                          {certResolution.participant.email}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-['Orbitron'] block">
                          Certificate Filename
                        </span>
                        <strong
                          className="text-amber-300 font-mono text-xs block mt-0.5 truncate"
                          title={certResolution.certificate.downloadFilename}
                        >
                          {certResolution.certificate.downloadFilename}
                        </strong>
                        <span className="text-[11px] text-gray-400">
                          Status: <strong className="text-emerald-400">Available</strong>
                        </span>
                      </div>
                    </div>

                    {downloadError && (
                      <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{downloadError}</span>
                      </div>
                    )}

                    {downloadSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{downloadSuccess}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      disabled={downloadingCert}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase font-['Orbitron'] shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50"
                    >
                      <Download className={`w-4 h-4 ${downloadingCert ? 'animate-bounce' : ''}`} />
                      <span>
                        {downloadingCert ? 'Generating Secure Link & Downloading...' : 'Download Certificate'}
                      </span>
                    </button>
                  </div>
                )}

              {/* TEAM MEMBERS & INDIVIDUAL CERTIFICATES ROSTER (Section 4) */}
              {teamMembersRoster.length > 0 && (
                <div className="pt-6 border-t border-gray-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase font-['Orbitron'] text-amber-400 block">
                        Team Credential Roster
                      </span>
                      <h4 className="text-sm font-black uppercase font-['Orbitron'] text-white">
                        {displayTeamName} ({teamMembersRoster.length} {teamMembersRoster.length === 1 ? 'Member' : 'Members'})
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400 font-['Orbitron']">
                      {teamMembersRoster.filter((m) => m.certificateStatus === 'Available').length} of {teamMembersRoster.length} Certificates Available
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {teamMembersRoster.map((member) => {
                      const isCurrentVerified =
                        certResolution?.verified &&
                        certResolution?.participant?.email?.toLowerCase() === member.email?.toLowerCase();
                      const isAvailable =
                        member.certificateStatus === 'Available' && Boolean(member.certificate);

                      return (
                        <div
                          key={member.uid}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isCurrentVerified
                              ? 'bg-amber-950/30 border-amber-500/50'
                              : 'bg-black/40 border-gray-800'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <strong className="text-white text-sm font-bold">{member.fullName}</strong>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-['Orbitron'] ${
                                  member.roleInTeam === 'Team Leader'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                    : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                }`}
                              >
                                {member.roleInTeam}
                              </span>
                              {isCurrentVerified && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold font-['Orbitron'] uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-mono block">{member.email}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {isAvailable ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 text-[10px] font-extrabold uppercase font-['Orbitron']">
                                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                <span>Certificate Available</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-400 text-[10px] font-bold uppercase font-['Orbitron']">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span>Certificate Not Available Yet</span>
                              </span>
                            )}

                            {/* If verified as this member and certificate is available: direct download */}
                            {isCurrentVerified && isAvailable && (
                              <button
                                type="button"
                                onClick={handleDownloadCertificate}
                                disabled={downloadingCert}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase font-['Orbitron'] flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Certificate</span>
                              </button>
                            )}

                            {/* If certificate available but user hasn't verified this email yet: verify action */}
                            {!isCurrentVerified && isAvailable && (
                              <button
                                type="button"
                                onClick={() => {
                                  setVerifiedEmailInput(member.email);
                                  evaluateCertificateForRegistration(result, member.email);
                                }}
                                className="px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-cyan-300 text-[10px] font-bold uppercase font-['Orbitron']"
                                title={`Click to verify as ${member.fullName} and download`}
                              >
                                Verify & Download
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DYNAMIC STATUS EXPLANATION BANNER */}
            {result.status?.toLowerCase() === 'approved' && (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <h4 className="font-extrabold uppercase font-['Orbitron'] text-sm tracking-wide text-white">
                    Congratulations! Your Registration is Approved & Confirmed
                  </h4>
                </div>
                <p className="text-xs text-emerald-300 leading-relaxed">
                  Your application has been vetted and officially approved by the INNOSPRINT technical committee. Your team is cleared to participate in the 48-hour hackathon.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-emerald-500/30">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>
                      <strong>Event Dates:</strong> {EVENT_DETAILS.dates}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      <strong>Reporting Time:</strong> Oct 26, 2026 by 09:00 AM
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Venue Desk:</strong> {EVENT_DETAILS.venue}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400/90 bg-emerald-950/80 p-3 rounded-xl border border-emerald-500/20">
                  ⚡ <strong>What To Bring:</strong> College ID card, registered email confirmation, laptops with chargers, and any specialized hardware development kits.
                </div>
              </div>
            )}

            {(!result.status || result.status?.toLowerCase() === 'pending') && (
              <div className="p-5 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <h4 className="font-bold uppercase font-['Orbitron'] text-xs tracking-wider text-white">
                    Application Under Review
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your registration is logged and is currently being evaluated by the hackathon technical review board. Approvals are rolled out on an ongoing basis. Please check back here periodically.
                </p>
              </div>
            )}

            {result.status?.toLowerCase() === 'waitlisted' && (
              <div className="p-5 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <h4 className="font-bold uppercase font-['Orbitron'] text-xs tracking-wider text-white">
                    Application on Reserve Waitlist
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your entry meets all hackathon criteria and has been placed on our reserve shortlist. In case an allocated slot frees up, the organizing team will reach out directly to your registered email.
                </p>
              </div>
            )}

            {result.status?.toLowerCase() === 'rejected' && (
              <div className="p-5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <h4 className="font-bold uppercase font-['Orbitron'] text-xs tracking-wider text-white">
                    Application Status: Not Selected
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Thank you for applying for INNOSPRINT 2026. Due to venue seat caps and track quotas, we were unable to accommodate your application for this edition. We look forward to seeing your innovation in future hackathons!
                </p>
              </div>
            )}

            {/* REGISTRATION DETAILS GRID (Section 4 required fields) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-['Orbitron'] text-gray-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Application Summary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Participant Name */}
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                  <span className="text-gray-400 uppercase block font-bold font-['Orbitron'] text-[10px]">
                    Participant Name ({displayParticipantRole})
                  </span>
                  <strong className="text-white text-sm font-['Orbitron'] block pt-0.5">
                    {displayParticipantName}
                  </strong>
                  <span className="text-gray-400 text-[11px]">{displayParticipantEmail}</span>
                </div>

                {/* Registration ID */}
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 uppercase block font-bold font-['Orbitron'] text-[10px]">
                      Registration ID
                    </span>
                    <strong className="text-amber-400 text-sm font-mono font-bold block pt-0.5">
                      {result.reference_code}
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Status: <strong className="uppercase text-gray-200">{result.status || 'Pending'}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyRefCode(result.reference_code)}
                    className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300"
                    title="Copy Registration ID"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                </div>

                {/* Team Name */}
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                  <span className="text-gray-400 uppercase block font-bold font-['Orbitron'] text-[10px]">
                    Team Name
                  </span>
                  <strong className="text-amber-400 uppercase font-['Orbitron'] text-sm block pt-0.5">
                    {displayTeamName}
                  </strong>
                  <span className="text-gray-400 text-[11px]">
                    Leader: {result.applicant_name || 'N/A'}
                  </span>
                </div>

                {/* Chosen Track / Theme & Institution */}
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                  <span className="text-gray-400 uppercase block font-bold font-['Orbitron'] text-[10px]">
                    Track & Institution
                  </span>
                  <strong className="text-cyan-300 font-['Orbitron'] text-sm block pt-0.5">
                    {result.theme}
                  </strong>
                  <span className="text-gray-400 text-[11px]">
                    {result.applicant_college || result.profiles?.college || 'VVITU'}
                  </span>
                </div>

                {result.project_title && (
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 col-span-1 sm:col-span-2">
                    <span className="text-gray-400 uppercase block font-bold font-['Orbitron'] text-[10px]">
                      Project Concept Title
                    </span>
                    <strong className="text-white text-sm font-['Orbitron'] block pt-0.5">
                      {result.project_title}
                    </strong>
                    {result.problem_statement && (
                      <p className="text-gray-300 text-[11px] pt-1 leading-relaxed">
                        {result.problem_statement}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DOCUMENTS ON FILE */}
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-['Orbitron'] block">
                Verification Documents On File
              </span>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">Proposal Presentation:</span>
                  <span
                    className={`font-bold font-['Orbitron'] text-[11px] ${
                      result.proposal_url ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {result.proposal_url ? 'UPLOADED & VERIFIED ✓' : 'NOT ATTACHED'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Student ID Verification:</span>
                  <span
                    className={`font-bold font-['Orbitron'] text-[11px] ${
                      result.student_id_url ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {result.student_id_url ? 'UPLOADED & VERIFIED ✓' : 'NOT ATTACHED'}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold uppercase font-['Orbitron'] flex items-center justify-center space-x-2 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier / Confirmation</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setResult(null);
                    setCertResolution(null);
                    setErrorMsg('');
                    setDownloadError('');
                    setDownloadSuccess('');
                    setQuery('');
                    setSearchParams({}, { replace: true });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white text-xs font-bold font-['Orbitron'] uppercase"
                >
                  Check Another Email
                </button>

                <Link
                  to="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase font-['Orbitron'] flex items-center justify-center shadow-md transition-colors"
                >
                  Homepage
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
