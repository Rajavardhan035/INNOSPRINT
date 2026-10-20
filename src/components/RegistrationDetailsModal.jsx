import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, ExternalLink, Download, FileText, Image as ImageIcon, 
  Shield, Users, Mail, Phone, School, BookOpen, Layers, CheckCircle2, 
  Clock, XCircle, AlertCircle, Eye, Sparkles, Building, Presentation,
  Trash2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function RegistrationDetailsModal({ 
  registration, 
  onClose, 
  onUpdateStatus, 
  onDeleteRegistration,
  onSendNotificationEmail 
}) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!registration) return;

    // Handle ESC key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (imagePreview) {
          setImagePreview(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Load team members if team registration
    const existingMembers = registration.teams?.team_members;
    if (existingMembers && Array.isArray(existingMembers) && existingMembers.length > 0) {
      setTeamMembers(existingMembers);
    } else if (registration.team_id && isSupabaseConfigured) {
      setLoadingMembers(true);
      supabase
        .from('team_members')
        .select('*')
        .eq('team_id', registration.team_id)
        .then(({ data, error }) => {
          if (!error && data) {
            setTeamMembers(data);
          }
          setLoadingMembers(false);
        })
        .catch(() => setLoadingMembers(false));
    } else {
      setTeamMembers([]);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [registration]);

  if (!registration) return null;

  // Safe field extractions
  const refCode = registration.reference_code || 'N/A';
  const applicantName = registration.applicant_name || registration.profiles?.full_name || registration.user_name || 'Participant';
  const applicantEmail = registration.applicant_email || registration.profiles?.email || registration.user_email || 'N/A';
  const applicantMobile = registration.applicant_mobile || registration.profiles?.mobile || 'N/A';
  const applicantCollege = registration.applicant_college || registration.profiles?.college || 'N/A';
  const degreeBranch = registration.degree_branch || 'Not Specified';
  const yearOfStudy = registration.year_of_study || 'N/A';
  const trackTheme = registration.theme || 'Open Innovation';
  const participationMode = registration.participation_type || 'individual';
  const teamName = registration.teams?.team_name || registration.team_name || (participationMode === 'team' ? 'Squad' : null);
  const projectTitle = registration.project_title || 'Untitled Innovation Pitch';
  const problemStatement = registration.problem_statement || 'No detailed problem statement provided.';
  const projectDescription = registration.project_description || 'No detailed description provided.';
  const currentStatus = (registration.status || 'pending').toLowerCase();

  // File URLs
  const resolveUrl = (urlOrPath) => {
    if (!urlOrPath) return null;
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      return urlOrPath;
    }
    const { data } = supabase.storage.from('participant-uploads').getPublicUrl(urlOrPath);
    return data?.publicUrl || `https://hbntxrrexilmjvxncwvc.supabase.co/storage/v1/object/public/participant-uploads/${urlOrPath}`;
  };

  const proposalUrl = resolveUrl(registration.proposal_url);
  const studentIdUrl = resolveUrl(registration.student_id_url);

  const isImage = (url) => {
    if (!url) return false;
    const clean = url.toLowerCase().split('?')[0];
    return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.svg');
  };

  const getFormatBadge = (url) => {
    if (!url) return 'File';
    const clean = url.toLowerCase().split('?')[0];
    if (clean.endsWith('.pdf')) return 'PDF Document';
    if (clean.endsWith('.pptx') || clean.endsWith('.ppt')) return 'PowerPoint (.pptx)';
    if (clean.endsWith('.docx') || clean.endsWith('.doc')) return 'Word (.docx)';
    if (clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'Image File';
    if (clean.endsWith('.zip')) return 'ZIP Archive';
    return 'Document';
  };

  const copyToClipboard = (text, type = 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Status Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'waitlisted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Waitlisted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#0D1424] border border-[#1D2A40] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-body">

        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#1D2A40] bg-[#0D1424] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#111B2D] border border-[#1D2A40] text-[11px] font-mono text-cyan-400 font-semibold">
                {refCode}
              </span>
              <button
                onClick={() => copyToClipboard(refCode, 'ref')}
                className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 text-[11px] font-mono"
                title="Copy Registration ID"
              >
                {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white font-heading tracking-tight">
              {teamName ? `Team: ${teamName}` : applicantName}
            </h2>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Submitted: <span className="font-mono text-slate-300">{registration.created_at ? new Date(registration.created_at).toLocaleString() : 'N/A'}</span></span>
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div>{getStatusBadge(currentStatus)}</div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] text-slate-400 hover:text-white border border-[#1D2A40] transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
          
          {/* METRIC BADGES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Participation</span>
              <span className="text-xs font-semibold text-violet-400">
                {participationMode === 'team' ? `Team (${teamMembers.length > 0 ? teamMembers.length + 1 : '2-4'})` : 'Individual Solo'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Track</span>
              <span className="text-xs font-semibold text-cyan-400">
                {trackTheme}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Institution</span>
              <span className="text-xs font-medium text-white truncate block">
                {applicantCollege}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Degree & Year</span>
              <span className="text-xs font-medium text-slate-200 block truncate font-mono">
                {degreeBranch} • Year {yearOfStudy}
              </span>
            </div>
          </div>

          {/* PRIMARY APPLICANT / TEAM LEADER */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40] space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#1D2A40] pb-2.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-xs text-white">
                {participationMode === 'team' ? 'Team Lead / Primary Contact' : 'Participant Profile'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Full Name</span>
                <span className="text-xs font-semibold text-white">{applicantName}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Email Address</span>
                <div className="flex items-center space-x-2">
                  <a href={`mailto:${applicantEmail}`} className="text-cyan-400 hover:underline font-mono text-xs truncate">
                    {applicantEmail}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(applicantEmail, 'email')}
                    className="text-slate-500 hover:text-white"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Mobile Contact</span>
                <a href={`tel:${applicantMobile}`} className="text-emerald-400 hover:underline font-mono text-xs font-medium">
                  {applicantMobile}
                </a>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">College / University</span>
                <span className="text-xs font-medium text-slate-200 truncate block">{applicantCollege}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Degree & Branch</span>
                <span className="text-xs font-medium text-slate-200 truncate block">{degreeBranch}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Year of Study</span>
                <span className="text-xs font-medium text-slate-200 font-mono">Year {yearOfStudy}</span>
              </div>
            </div>
          </div>

          {/* TEAM MEMBERS (IF TEAM MODE) */}
          {participationMode === 'team' && (
            <div className="p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1D2A40] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <h3 className="font-semibold text-xs text-white">
                    Team Members Roster ({teamMembers.length + 1} Total)
                  </h3>
                </div>
                {loadingMembers && <span className="text-[10px] text-slate-500 font-mono">Loading roster...</span>}
              </div>

              <div className="space-y-2 pt-1">
                {/* Leader entry */}
                <div className="p-2.5 rounded-lg bg-[#0D1424] border border-[#1D2A40] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-medium text-white block">{applicantName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{applicantEmail} • {applicantMobile}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium font-mono uppercase">
                    Team Lead
                  </span>
                </div>

                {/* Other members */}
                {teamMembers.length === 0 && !loadingMembers ? (
                  <p className="text-xs text-slate-500 italic p-1">
                    No additional team members logged.
                  </p>
                ) : (
                  teamMembers.map((m, idx) => (
                    <div key={m.id || idx} className="p-2.5 rounded-lg bg-[#0D1424] border border-[#1D2A40] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-xs font-medium text-white block">{m.member_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{m.member_email} {m.member_phone ? `• ${m.member_phone}` : ''}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#111B2D] text-slate-300 border border-[#1D2A40] text-[10px] font-medium font-mono uppercase">
                        {m.role_in_team || `Member ${idx + 2}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PROJECT CONCEPT & DETAILS */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40] space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#1D2A40] pb-2.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-xs text-white">
                Project & Innovation Submission
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Project Title</span>
                <span className="text-sm font-bold text-white">{projectTitle}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block mb-1">Problem Statement</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#0D1424] p-3 rounded-lg border border-[#1D2A40] whitespace-pre-wrap">
                  {problemStatement}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block mb-1">Proposed Solution</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#0D1424] p-3 rounded-lg border border-[#1D2A40] whitespace-pre-wrap">
                  {projectDescription}
                </p>
              </div>
            </div>
          </div>

          {/* UPLOADED FILES SECTION */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1D2A40] pb-2.5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-xs text-white">
                  Attached Dossier Files
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Supabase Cloud Storage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Proposal File */}
              <div className="p-3.5 rounded-lg bg-[#0D1424] border border-[#1D2A40] flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center flex-shrink-0 text-cyan-400">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">
                        Project Slide Deck / Doc
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {proposalUrl ? getFormatBadge(proposalUrl) : 'No file attached'}
                      </span>
                    </div>
                  </div>
                </div>

                {proposalUrl ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={proposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-md bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </a>

                    {(proposalUrl.includes('.ppt') || proposalUrl.includes('.pptx') || proposalUrl.includes('.doc') || proposalUrl.includes('.docx')) && (
                      <a
                        href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(proposalUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-cyan-400 text-xs flex items-center justify-center space-x-1 transition-colors"
                        title="Preview PPTX slides in browser"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Slides</span>
                      </a>
                    )}

                    <a
                      href={proposalUrl}
                      download
                      className="py-1.5 px-2.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white text-xs flex items-center justify-center space-x-1 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No proposal document uploaded.</span>
                )}
              </div>

              {/* Student ID */}
              <div className="p-3.5 rounded-lg bg-[#0D1424] border border-[#1D2A40] flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center flex-shrink-0 text-violet-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">
                        Student ID Verification
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {studentIdUrl ? (isImage(studentIdUrl) ? 'ID Photo / Image' : getFormatBadge(studentIdUrl)) : 'No file attached'}
                      </span>
                    </div>
                  </div>
                </div>

                {studentIdUrl ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={studentIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-violet-300 hover:text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full ID</span>
                    </a>

                    <a
                      href={studentIdUrl}
                      download
                      className="py-1.5 px-2.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white text-xs flex items-center justify-center space-x-1 transition-colors"
                      title="Download Student ID"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No student ID uploaded.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL STICKY FOOTER (APPROVAL CONTROLS & DELETE) */}
        <div className="p-4 sm:p-5 bg-[#0D1424] border-t border-[#1D2A40] flex flex-col gap-3">
          {showDeleteConfirm ? (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center space-x-2.5 text-xs text-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Permanently delete this registration?</span>
                  <span className="text-[11px] text-rose-300">
                    Removes team <strong className="text-white">{teamName || applicantName}</strong> ({refCode}) and all member records. This cannot be undone.
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!onDeleteRegistration) return;
                    setIsDeleting(true);
                    const success = await onDeleteRegistration(registration);
                    setIsDeleting(false);
                    if (success) {
                      onClose();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Status:</span>
                {getStatusBadge(currentStatus)}
                {currentStatus === 'approved' && (
                  Boolean(registration?.organizer_notes && registration.organizer_notes.includes('EMAIL_SHORTLIST_SENT')) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Email Dispatched</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Email Pending
                    </span>
                  )
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onUpdateStatus(registration, 'approved')}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    currentStatus === 'approved'
                      ? 'bg-emerald-500 text-[#070b14]'
                      : 'bg-[#111B2D] hover:bg-emerald-950/60 border border-[#1D2A40] hover:border-emerald-500/50 text-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentStatus === 'approved' ? 'Approved' : 'Approve'}</span>
                </button>

                {currentStatus === 'approved' && onSendNotificationEmail && (
                  <button
                    type="button"
                    disabled={sendingEmail}
                    onClick={async () => {
                      setSendingEmail(true);
                      await onSendNotificationEmail(registration, true);
                      setSendingEmail(false);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white font-medium text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50 shadow-sm"
                    title="Dispatch official shortlist email notification to registered applicant via Google Apps Script"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {sendingEmail
                        ? 'Sending...'
                        : Boolean(registration?.organizer_notes && registration.organizer_notes.includes('EMAIL_SHORTLIST_SENT'))
                        ? 'Resend Shortlist Email'
                        : 'Send Shortlist Email'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus(registration, 'waitlisted')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    currentStatus === 'waitlisted'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#111B2D] hover:bg-blue-950/60 border border-[#1D2A40] hover:border-blue-500/50 text-blue-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Waitlist</span>
                </button>

                <button
                  onClick={() => onUpdateStatus(registration, 'rejected')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    currentStatus === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/50 text-rose-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                {/* Delete Registration Option */}
                {onDeleteRegistration && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white font-medium text-xs flex items-center space-x-1.5 transition-colors"
                    title="Delete this unwanted registration"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-1.5 px-3 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white font-medium text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FULLSCREEN IMAGE VIEWER MODAL IF CLICKED */}
      {imagePreview && (
        <div 
          className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg bg-[#111B2D] text-white hover:text-rose-400 border border-[#1D2A40]"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={imagePreview} 
              alt="Enlarged Document" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-[#1D2A40] shadow-2xl"
            />
            <div className="mt-3 flex items-center space-x-2.5">
              <a 
                href={imagePreview} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-[#070b14] font-semibold text-xs flex items-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
              <a 
                href={imagePreview} 
                download
                className="px-3.5 py-1.5 rounded-lg bg-[#111B2D] text-white border border-[#1D2A40] font-medium text-xs flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
