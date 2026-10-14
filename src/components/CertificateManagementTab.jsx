import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Award,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  X,
  ShieldCheck,
  Filter,
  FolderUp,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Users,
  Copy,
  FolderCheck,
} from 'lucide-react';
import {
  groupRegistrationsIntoTeamCertificateCards,
  fetchAllCertificatesMap,
  uploadOrReplaceParticipantCertificate,
  validateCertificateFile,
  downloadVerifiedParticipantCertificate,
  MAX_CERTIFICATE_FILE_SIZE_MB,
} from '../lib/certificates';

export default function CertificateManagementTab({
  registrations = [],
  adminUser,
  adminRole,
  onRefreshRegistrations,
}) {
  const [certificatesMap, setCertificatesMap] = useState({});
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [failedUploadsByUid, setFailedUploadsByUid] = useState({});

  // Expand / collapse state for teams (keyed by registrationId)
  const [expandedTeamIds, setExpandedTeamIds] = useState(() => {
    // Default: expand all teams so admins can see all members immediately
    const initial = {};
    registrations.forEach((r) => {
      if (r?.id) initial[r.id] = true;
    });
    return initial;
  });

  // Filters required by Section 1 & 7:
  // - Search by participant name or email
  // - Search by team name or registration ID
  // - Filter by uploaded or pending certificate
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [teamOrRegIdSearchTerm, setTeamOrRegIdSearchTerm] = useState('');
  const [certFilterMode, setCertFilterMode] = useState('all'); // 'all' | 'pending' | 'complete'

  // Individual Upload / Replace Modal State
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileValidation, setFileValidation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ percent: 0, stage: '' });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Bulk Upload Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkSummary, setBulkSummary] = useState(null);
  const bulkInputRef = useRef(null);

  // Admin preview download state
  const [downloadingUid, setDownloadingUid] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  const loadCertificates = useCallback(async () => {
    setLoadingCerts(true);
    try {
      const map = await fetchAllCertificatesMap(registrations);
      setCertificatesMap(map);
    } catch (err) {
      console.error('[CertificateManagement] Load error:', err);
    } finally {
      setLoadingCerts(false);
    }
  }, [registrations]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // Keep expandedTeamIds in sync when registrations change
  useEffect(() => {
    setExpandedTeamIds((prev) => {
      const updated = { ...prev };
      registrations.forEach((r) => {
        if (r?.id && updated[r.id] === undefined) {
          updated[r.id] = true;
        }
      });
      return updated;
    });
  }, [registrations]);

  // Group registrations into structured Team Cards with individual member rosters
  const teamCards = useMemo(() => {
    const cards = groupRegistrationsIntoTeamCertificateCards(registrations, certificatesMap);

    // Attach any in-session failure states to specific members
    return cards.map((team) => {
      const updatedMembers = team.members.map((member) => {
        const failedError = failedUploadsByUid[member.uid];
        if (failedError && member.certificateStatus !== 'Available') {
          return {
            ...member,
            certificateStatus: 'Upload Failed',
            uploadError: failedError,
          };
        }
        return {
          ...member,
          uploadError: failedError || null,
        };
      });

      const uploadedCount = updatedMembers.filter((m) => m.certificateStatus === 'Available').length;
      const totalMembersCount = updatedMembers.length;
      const pendingCount = totalMembersCount - uploadedCount;
      const completionPercentage =
        totalMembersCount > 0 ? Math.round((uploadedCount / totalMembersCount) * 100) : 0;

      return {
        ...team,
        members: updatedMembers,
        uploadedCount,
        pendingCount,
        completionPercentage,
        statusText: `${uploadedCount} of ${totalMembersCount} certificates uploaded`,
        isComplete: uploadedCount === totalMembersCount && totalMembersCount > 0,
      };
    });
  }, [registrations, certificatesMap, failedUploadsByUid]);

  // Flattened participant list for global stats & bulk suggestions
  const allParticipantRows = useMemo(() => {
    return teamCards.flatMap((t) => t.members);
  }, [teamCards]);

  // Filtered teams list based on search and certificate status filters
  const filteredTeams = useMemo(() => {
    const qParticipant = participantSearchTerm.trim().toLowerCase();
    const qTeamOrRef = teamOrRegIdSearchTerm.trim().toLowerCase();

    return teamCards.filter((team) => {
      // 1. Team name or Registration ID match
      const matchesTeamOrRef =
        !qTeamOrRef ||
        team.teamName.toLowerCase().includes(qTeamOrRef) ||
        team.referenceCode.toLowerCase().includes(qTeamOrRef);

      // 2. Participant name or email match (matches if ANY member matches)
      const matchesParticipant =
        !qParticipant ||
        team.members.some(
          (m) =>
            m.fullName.toLowerCase().includes(qParticipant) ||
            m.email.toLowerCase().includes(qParticipant)
        );

      // 3. Certificate upload status filter
      let matchesCertStatus = true;
      if (certFilterMode === 'pending') {
        matchesCertStatus = team.uploadedCount < team.totalMembersCount;
      } else if (certFilterMode === 'complete') {
        matchesCertStatus = team.isComplete;
      }

      return matchesTeamOrRef && matchesParticipant && matchesCertStatus;
    });
  }, [teamCards, participantSearchTerm, teamOrRegIdSearchTerm, certFilterMode]);

  // Overall summary statistics (Section 7)
  const totalRegisteredParticipants = allParticipantRows.length;
  const totalRegisteredTeams = teamCards.length;
  const totalTeamMembersCount = allParticipantRows.filter((m) => m.roleInTeam !== 'Team Leader' && m.roleInTeam !== 'Individual Participant').length;
  const totalCertificatesUploaded = allParticipantRows.filter((m) => m.certificateStatus === 'Available').length;
  const totalCertificatesPending = totalRegisteredParticipants - totalCertificatesUploaded;
  const overallCompletionPercentage =
    totalRegisteredParticipants > 0
      ? Math.round((totalCertificatesUploaded / totalRegisteredParticipants) * 100)
      : 0;

  const toggleTeamExpand = (registrationId) => {
    setExpandedTeamIds((prev) => ({
      ...prev,
      [registrationId]: !prev[registrationId],
    }));
  };

  const expandAllTeams = () => {
    const all = {};
    teamCards.forEach((t) => {
      all[t.registrationId] = true;
    });
    setExpandedTeamIds(all);
  };

  const collapseAllTeams = () => {
    setExpandedTeamIds({});
  };

  const copyRefCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Open Individual Upload Modal for a specific participant
  const openUploadModal = (participant) => {
    setActiveParticipant(participant);
    setSelectedFile(null);
    setFileValidation(null);
    setUploading(false);
    setUploadProgress({ percent: 0, stage: '' });
    setModalError('');
    setModalSuccess('');
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setActiveParticipant(null);
    setSelectedFile(null);
    setFileValidation(null);
    setModalError('');
    setModalSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setModalError('');
    setModalSuccess('');
    if (!file) {
      setSelectedFile(null);
      setFileValidation(null);
      return;
    }
    setSelectedFile(file);
    const check = validateCertificateFile(file);
    setFileValidation(check);
    if (!check.valid) {
      setModalError(check.error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      const check = validateCertificateFile(file);
      setFileValidation(check);
      if (!check.valid) {
        setModalError(check.error);
      } else {
        setModalError('');
      }
    }
  };

  const handleIndividualUploadSubmit = async (e) => {
    e.preventDefault();
    if (!activeParticipant || !selectedFile) return;

    const check = validateCertificateFile(selectedFile);
    setFileValidation(check);
    if (!check.valid) {
      setModalError(check.error);
      return;
    }

    setUploading(true);
    setModalError('');
    setModalSuccess('');
    setUploadProgress({ percent: 5, stage: 'Starting upload...' });

    try {
      const result = await uploadOrReplaceParticipantCertificate({
        participantRow: activeParticipant,
        file: selectedFile,
        adminActor: { user: adminUser, email: adminUser?.email, role: adminRole },
        onProgress: (p) => setUploadProgress(p),
      });

      // Update local state only after both Storage and Database operations succeed
      const updatedMap = {
        ...certificatesMap,
        [activeParticipant.uid]: result.certificate,
      };
      setCertificatesMap(updatedMap);

      // Clear any previous failure state for this participant
      setFailedUploadsByUid((prev) => {
        const copy = { ...prev };
        delete copy[activeParticipant.uid];
        return copy;
      });

      setActiveParticipant((prev) =>
        prev
          ? {
              ...prev,
              certificate: result.certificate,
              certificateStatus: 'Available',
              uploadedAt: result.certificate.updated_at,
            }
          : null
      );

      setModalSuccess(
        result.replacedPrevious
          ? `Certificate successfully replaced for ${activeParticipant.fullName}. Previous storage file cleaned up safely.`
          : `Certificate successfully uploaded and published for ${activeParticipant.fullName}!`
      );

      if (typeof onRefreshRegistrations === 'function') {
        onRefreshRegistrations();
      }
    } catch (err) {
      console.error('[Individual Certificate Upload Failed]', err);
      const errMsg = err.message || 'Certificate upload failed.';
      setModalError(errMsg);
      setFailedUploadsByUid((prev) => ({
        ...prev,
        [activeParticipant.uid]: errMsg,
      }));
    } finally {
      setUploading(false);
    }
  };

  // Admin preview / test download of an uploaded certificate
  const handleAdminDownloadPreview = async (member) => {
    if (!member.certificate) return;
    setDownloadingUid(member.uid);
    setBannerNotice(null);

    try {
      const parentReg = registrations.find((r) => r.id === member.registrationId);
      if (!parentReg) {
        throw new Error('Parent registration record not found.');
      }
      const res = await downloadVerifiedParticipantCertificate({
        registration: parentReg,
        verifiedEmail: member.email,
        targetParticipantKey: member.participantKey,
      });
      setBannerNotice({
        type: 'success',
        message: `Downloaded "${res.downloadFilename}" (${(res.byteLength / 1024).toFixed(1)} KB) for ${member.fullName}.`,
      });
    } catch (err) {
      setBannerNotice({
        type: 'error',
        message: `Failed to download certificate for ${member.fullName}: ${err.message}`,
      });
    } finally {
      setDownloadingUid(null);
    }
  };

  // ============================================================================
  // BULK CERTIFICATE UPLOAD WORKFLOW (Section 5)
  // ============================================================================

  const openBulkModal = () => {
    setBulkModalOpen(true);
    setBulkItems([]);
    setBulkConfirmed(false);
    setBulkSummary(null);
  };

  const handleBulkFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file, idx) => {
      const validation = validateCertificateFile(file);
      const lowerBase = file.name.toLowerCase();

      let suggestedUid = '';
      let suggestionReason = 'Manual selection required';

      for (const p of allParticipantRows) {
        const cleanEmail = (p.email || '').toLowerCase();
        const emailPrefix = cleanEmail.split('@')[0];
        const cleanNameSlug = p.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanFileSlug = lowerBase.replace(/[^a-z0-9]/g, '');

        if (cleanEmail && lowerBase.includes(cleanEmail)) {
          suggestedUid = p.uid;
          suggestionReason = 'Draft match by email in filename (Please verify)';
          break;
        }
        if (
          cleanNameSlug.length >= 4 &&
          cleanFileSlug.includes(cleanNameSlug) &&
          lowerBase.includes(p.referenceCode.toLowerCase())
        ) {
          suggestedUid = p.uid;
          suggestionReason = 'Draft match by Registration ID + Name (Please verify)';
          break;
        }
        if (
          emailPrefix.length >= 5 &&
          lowerBase.includes(emailPrefix) &&
          allParticipantRows.filter((x) => x.email.toLowerCase().startsWith(emailPrefix)).length === 1
        ) {
          suggestedUid = p.uid;
          suggestionReason = 'Draft match by email handle (Please verify)';
          break;
        }
      }

      return {
        id: `bulk_${Date.now()}_${idx}`,
        file,
        validation,
        assignedUid: suggestedUid,
        suggestionReason,
        status: validation.valid ? 'pending' : 'invalid',
        error: validation.valid ? '' : validation.error,
        progress: 0,
      };
    });

    setBulkItems(mapped);
    setBulkConfirmed(false);
    setBulkSummary(null);
  };

  const updateBulkItemParticipant = (itemId, assignedUid) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assignedUid,
              suggestionReason: assignedUid ? 'Explicitly selected by admin' : 'Unassigned',
            }
          : item
      )
    );
    setBulkConfirmed(false);
  };

  const removeBulkItem = (itemId) => {
    setBulkItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const executeBulkUpload = async () => {
    if (!bulkConfirmed || bulkRunning) return;

    setBulkRunning(true);
    setBulkSummary(null);

    let successCount = 0;
    let failCount = 0;
    const newCerts = { ...certificatesMap };
    const newFailures = { ...failedUploadsByUid };

    for (let i = 0; i < bulkItems.length; i++) {
      const item = bulkItems[i];
      if (!item.validation.valid || !item.assignedUid) {
        failCount += 1;
        continue;
      }

      const targetParticipant = allParticipantRows.find((p) => p.uid === item.assignedUid);
      if (!targetParticipant) {
        failCount += 1;
        setBulkItems((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? { ...x, status: 'failed', error: 'Assigned participant not found.' }
              : x
          )
        );
        continue;
      }

      setBulkItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading', progress: 20, error: '' } : x))
      );

      try {
        const res = await uploadOrReplaceParticipantCertificate({
          participantRow: targetParticipant,
          file: item.file,
          adminActor: { user: adminUser, email: adminUser?.email, role: adminRole },
          onProgress: ({ percent }) => {
            setBulkItems((prev) =>
              prev.map((x) => (x.id === item.id ? { ...x, progress: percent } : x))
            );
          },
        });

        newCerts[targetParticipant.uid] = res.certificate;
        delete newFailures[targetParticipant.uid];
        successCount += 1;

        setBulkItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, status: 'uploaded', progress: 100, error: '' } : x
          )
        );
      } catch (err) {
        failCount += 1;
        const msg = err.message || 'Upload failed';
        newFailures[targetParticipant.uid] = msg;
        setBulkItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, status: 'failed', progress: 0, error: msg } : x
          )
        );
      }
    }

    setCertificatesMap(newCerts);
    setFailedUploadsByUid(newFailures);
    setBulkRunning(false);
    setBulkSummary({ successCount, failCount });

    if (typeof onRefreshRegistrations === 'function' && successCount > 0) {
      onRefreshRegistrations();
    }
  };

  const validBulkItems = bulkItems.filter((i) => i.validation.valid);
  const allValidItemsAssigned =
    validBulkItems.length > 0 && validBulkItems.every((i) => Boolean(i.assignedUid));
  const assignedUidsList = validBulkItems.map((i) => i.assignedUid).filter(Boolean);
  const hasDuplicateBulkAssignments =
    new Set(assignedUidsList).size !== assignedUidsList.length;

  const renderMemberCertBadge = (member) => {
    if (member.certificateStatus === 'Available' && member.certificate) {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50 text-[11px] font-medium font-body shadow-sm shadow-amber-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Available</span>
        </span>
      );
    }

    if (member.certificateStatus === 'Upload Failed' || member.uploadError) {
      return (
        <span
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/90 text-red-300 border border-red-500/50 text-[11px] font-medium font-body"
          title={member.uploadError || 'Upload failed'}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span>Upload Failed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gray-900 text-gray-400 border border-gray-700 text-[11px] font-medium font-body">
        <Clock className="w-3 h-3 text-gray-500" />
        <span>Not Uploaded</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 font-body">
      {/* ========================================================================
          1. HEADER & SUMMARY METRICS BAR (Section 7)
      ======================================================================== */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#111B2D] border border-[#1D2A40] text-amber-400 text-[10px] font-semibold uppercase font-mono tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Individual Credential Issuance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
              Certificate <span className="text-amber-400">Control Center</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-body">
              Manage, verify, and publish participant certificates. Every team contains 2–4 members, and each individual team member receives their own separate certificate linked to their identity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openBulkModal}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#070b14] font-semibold text-xs font-body flex items-center space-x-2 transition-all shadow-sm"
            >
              <FolderUp className="w-4 h-4" />
              <span>Bulk Upload Certificates</span>
            </button>

            <button
              type="button"
              onClick={loadCertificates}
              disabled={loadingCerts}
              className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-cyan-400 font-medium text-xs font-body flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCerts ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </button>
          </div>
        </div>

        {/* Summary Statistics Cards (Section 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <span className="text-[11px] text-slate-400 font-medium font-body block">
              Registered Participants
            </span>
            <span className="text-2xl font-bold text-cyan-400 font-heading mt-0.5 block">
              {totalRegisteredParticipants}
            </span>
            <span className="text-[10px] text-slate-500 font-body">Across {totalRegisteredTeams} teams</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <span className="text-[11px] text-slate-400 font-medium font-body block">
              Total Team Members
            </span>
            <span className="text-2xl font-bold text-violet-400 font-heading mt-0.5 block">
              {totalTeamMembersCount}
            </span>
            <span className="text-[10px] text-slate-500 font-body">Excluding team leaders</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <span className="text-[11px] text-slate-400 font-medium font-body block">
              Certificates Uploaded
            </span>
            <span className="text-2xl font-bold text-amber-400 font-heading mt-0.5 block">
              {totalCertificatesUploaded}
            </span>
            <span className="text-[10px] text-amber-400/80 font-body">Available to participants</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <span className="text-[11px] text-slate-400 font-medium font-body block">
              Certificates Pending
            </span>
            <span className="text-2xl font-bold text-slate-300 font-heading mt-0.5 block">
              {totalCertificatesPending}
            </span>
            <span className="text-[10px] text-slate-500 font-body">Awaiting upload</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40] col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium font-body block">
              Completion Rate
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-heading mt-0.5 block">
              {overallCompletionPercentage}%
            </span>
            <div className="w-full h-1.5 rounded-full bg-[#070b14] overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BANNER NOTICES */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================
          2. SEARCH & MULTI-FILTER BAR (Section 7)
      ======================================================================== */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4 font-body">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-2 font-heading tracking-wide">
            <Filter className="w-4 h-4" />
            <span>Search & Filter Registered Teams</span>
          </span>

          <div className="flex items-center space-x-3 text-xs font-body">
            <button
              type="button"
              onClick={expandAllTeams}
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              Expand All
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={collapseAllTeams}
              className="text-slate-400 hover:text-white font-medium hover:underline"
            >
              Collapse All
            </button>
            {(participantSearchTerm || teamOrRegIdSearchTerm || certFilterMode !== 'all') && (
              <>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setParticipantSearchTerm('');
                    setTeamOrRegIdSearchTerm('');
                    setCertFilterMode('all');
                  }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Reset Filters
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Search by participant name or email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 font-body mb-1.5">
              Participant Name or Email
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={participantSearchTerm}
                onChange={(e) => setParticipantSearchTerm(e.target.value)}
                placeholder="e.g., Alice, student@college.edu..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-body"
              />
            </div>
          </div>

          {/* 2. Search by team name or registration ID */}
          <div>
            <label className="block text-xs font-medium text-slate-300 font-body mb-1.5">
              Team Name or Registration ID
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={teamOrRegIdSearchTerm}
                onChange={(e) => setTeamOrRegIdSearchTerm(e.target.value)}
                placeholder="e.g., Team Alpha, INNO-..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-body"
              />
            </div>
          </div>

          {/* 3. Filter by uploaded or pending certificate */}
          <div>
            <label className="block text-xs font-medium text-slate-300 font-body mb-1.5">
              Certificate Status Filter
            </label>
            <select
              value={certFilterMode}
              onChange={(e) => setCertFilterMode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-body"
            >
              <option value="all">All Teams ({teamCards.length})</option>
              <option value="pending">Incomplete / Pending Certificates ({teamCards.filter((t) => !t.isComplete).length})</option>
              <option value="complete">All Certificates Uploaded (100%) ({teamCards.filter((t) => t.isComplete).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================
          3. REGISTERED TEAMS & INDIVIDUAL MEMBERS LIST (Section 1 & 7)
      ======================================================================== */}
      {filteredTeams.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#0D1424] border border-[#1D2A40] text-center space-y-2">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300 font-heading">
            No matching registered teams found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or reset filters to display all registered teams.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTeams.map((team) => {
            const isExpanded = Boolean(expandedTeamIds[team.registrationId]);

            return (
              <div
                key={team.registrationId}
                className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-hidden transition-colors hover:border-[#2a3c5a]"
              >
                {/* Team Card Header */}
                <div
                  onClick={() => toggleTeamExpand(team.registrationId)}
                  className="p-4 sm:p-5 bg-[#0D1424] border-b border-[#1D2A40] cursor-pointer hover:bg-[#111B2D]/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Team Name, Registration ID, Track */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white font-heading">
                        {team.teamName}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-[#111B2D] text-violet-400 border border-[#1D2A40] text-[10px] font-mono font-medium">
                        {team.totalMembersCount} {team.totalMembersCount === 1 ? 'Member' : 'Members'}
                      </span>
                      {team.theme && (
                        <span className="px-2 py-0.5 rounded bg-[#111B2D] text-slate-300 border border-[#1D2A40] text-[10px] font-medium">
                          {team.theme}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-body">
                      <span className="flex items-center space-x-1.5 font-mono">
                        <span>Reg ID:</span>
                        <strong className="text-cyan-400 font-semibold">{team.referenceCode}</strong>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyRefCode(team.referenceCode);
                          }}
                          className="text-slate-400 hover:text-cyan-300 p-0.5"
                          title="Copy Registration ID"
                        >
                          {copiedCode === team.referenceCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </button>
                      </span>

                      <span className="text-slate-600">•</span>
                      <span>College: <strong className="text-slate-300">{team.college}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-medium text-slate-300">
                        Status: <span className="text-cyan-300 capitalize">{team.registrationStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Team Certificate Upload Progress */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 font-body">
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end space-x-2">
                        {team.isComplete ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-body">
                            <FolderCheck className="w-3.5 h-3.5" />
                            <span>100% Uploaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium font-body">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{team.pendingCount} Pending</span>
                          </span>
                        )}

                        <span className="text-xs font-semibold font-mono text-white">
                          {team.statusText}
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-36 sm:w-44 h-1.5 rounded-full bg-[#111B2D] overflow-hidden ml-auto">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${team.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTeamExpand(team.registrationId);
                      }}
                      className="p-1.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse Team Members' : 'Expand Team Members'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Individual Team Members Table (Section 1) */}
                {isExpanded && (
                  <div className="overflow-x-auto p-4 sm:p-5 bg-[#090F1D] animate-fadeIn font-body">
                    <div className="rounded-lg border border-[#1D2A40] overflow-hidden bg-[#0D1424]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#111B2D] border-b border-[#1D2A40] text-[11px] font-semibold uppercase text-slate-400 font-body tracking-wider">
                            <th className="py-2.5 px-3.5">Participant</th>
                            <th className="py-2.5 px-3.5">Role in Team</th>
                            <th className="py-2.5 px-3.5">Registered Email</th>
                            <th className="py-2.5 px-3.5">Certificate Status</th>
                            <th className="py-2.5 px-3.5">Uploaded File</th>
                            <th className="py-2.5 px-3.5 text-right">Individual Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D2A40]">
                          {team.members.map((member) => {
                            const isAvailable = member.certificateStatus === 'Available' && Boolean(member.certificate);

                            return (
                              <tr key={member.uid} className="hover:bg-[#111B2D]/50 transition-colors">
                                {/* 1. Participant Full Name */}
                                <td className="py-3 px-3.5">
                                  <strong className="text-white text-xs font-semibold block">
                                    {member.fullName}
                                  </strong>
                                  {member.mobile && (
                                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                      {member.mobile}
                                    </span>
                                  )}
                                </td>

                                {/* 2. Role in Team */}
                                <td className="py-3 px-3.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                                      member.roleInTeam === 'Team Leader'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-[#111B2D] text-slate-300 border border-[#1D2A40]'
                                    }`}
                                  >
                                    {member.roleInTeam}
                                  </span>
                                </td>

                                {/* 3. Registered Email */}
                                <td className="py-3 px-3.5 font-mono text-xs text-slate-300">
                                  {member.email || <span className="text-slate-500 italic">No email</span>}
                                </td>

                                {/* 4. Individual Certificate Status */}
                                <td className="py-3 px-3.5">
                                  {renderMemberCertBadge(member)}
                                </td>

                                {/* 5. Uploaded File & Timestamp */}
                                <td className="py-3 px-3.5 text-slate-400 font-body">
                                  {member.certificate?.original_filename ? (
                                    <div>
                                      <span
                                        className="text-cyan-400 font-mono text-xs block truncate max-w-[180px]"
                                        title={member.certificate.original_filename}
                                      >
                                        {member.certificate.original_filename}
                                      </span>
                                      {member.uploadedAt && (
                                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                                          {new Date(member.uploadedAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 font-mono text-xs">—</span>
                                  )}
                                </td>

                                {/* 6. Individual Action */}
                                <td className="py-3 px-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openUploadModal(member)}
                                      className={`px-3 py-1.5 rounded-lg font-medium text-xs font-body flex items-center space-x-1.5 transition-all ${
                                        isAvailable
                                          ? 'bg-[#111B2D] hover:bg-[#162238] text-amber-400 hover:text-amber-300 border border-[#1D2A40]'
                                          : 'bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold'
                                      }`}
                                    >
                                      <Upload className="w-3 h-3" />
                                      <span>
                                        {isAvailable ? 'Replace' : 'Upload'}
                                      </span>
                                    </button>

                                    {isAvailable && (
                                      <button
                                        type="button"
                                        onClick={() => handleAdminDownloadPreview(member)}
                                        disabled={downloadingUid === member.uid}
                                        className="p-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                                        title="Download & Verify Certificate"
                                      >
                                        <Download
                                          className={`w-3.5 h-3.5 ${
                                            downloadingUid === member.uid ? 'animate-bounce' : ''
                                          }`}
                                        />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================
          4. INDIVIDUAL CERTIFICATE UPLOAD / REPLACE MODAL (Section 2)
      ======================================================================== */}
      {activeParticipant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0D1424] border border-[#1D2A40] shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 sm:p-6 space-y-5 font-body">
              <div className="flex items-start justify-between gap-4 border-b border-[#1D2A40] pb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase font-mono tracking-wider text-amber-400 block">
                    {activeParticipant.certificate ? 'Replace Individual Certificate' : 'Upload Individual Certificate'}
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    {activeParticipant.fullName}
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{activeParticipant.email}</p>
                </div>

                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="p-1.5 rounded-lg bg-[#111B2D] text-slate-400 hover:text-white disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Exact Participant & Team Binding Notice */}
              <div className="p-3.5 rounded-xl bg-[#111B2D] border border-[#1D2A40] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 font-body block">
                    Team Name
                  </span>
                  <strong className="text-white font-medium">{activeParticipant.teamName}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 font-body block">
                    Role in Team
                  </span>
                  <span className="text-cyan-400 font-medium font-body">{activeParticipant.roleInTeam}</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 font-body block">
                    Registration ID
                  </span>
                  <strong className="font-mono text-cyan-400 text-xs">{activeParticipant.referenceCode}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 font-body block">
                    Current Status
                  </span>
                  <span className="text-slate-300 font-medium font-body">{activeParticipant.certificateStatus}</span>
                </div>
              </div>

              {activeParticipant.certificate && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 font-semibold text-xs">
                      Existing Certificate Active
                    </strong>
                    <span className="font-body text-xs text-slate-300">
                      File: <code className="text-white font-mono">{activeParticipant.certificate.original_filename}</code>.
                      Remains active until replaced.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleIndividualUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 font-body mb-2">
                    Select Certificate File (PDF, PNG, JPG, WEBP • Max {MAX_CERTIFICATE_FILE_SIZE_MB} MB) *
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : selectedFile
                        ? fileValidation?.valid
                          ? 'border-emerald-500/60 bg-emerald-500/10'
                          : 'border-rose-500/60 bg-rose-500/10'
                        : 'border-[#1D2A40] hover:border-cyan-400 bg-[#070b14]'
                    }`}
                  >
                    <Upload className={`w-7 h-7 mx-auto mb-2 transition-transform ${isDragging ? 'text-cyan-300 scale-110' : 'text-cyan-400'}`} />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-white break-all font-mono">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-400 font-body">
                          {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                          {fileValidation?.mimeType || selectedFile.type || 'Unknown type'}
                        </p>
                        {fileValidation?.valid && (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-medium font-body">
                            <Check className="w-3.5 h-3.5" />
                            <span>File ready for upload</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-200 font-body">
                          {isDragging ? 'Release to drop certificate file' : 'Drag & drop certificate file here or click to browse'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-body">
                          PDF, PNG, JPG, WEBP (Max {MAX_CERTIFICATE_FILE_SIZE_MB} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2 p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
                    <div className="flex justify-between text-xs font-semibold font-body">
                      <span className="text-cyan-300">{uploadProgress.stage || 'Uploading...'}</span>
                      <span className="font-mono text-cyan-400">{uploadProgress.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#070b14] overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${uploadProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {modalError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2 font-body">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {modalSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2 font-body">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1D2A40]">
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    disabled={uploading}
                    className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 text-xs font-medium font-body disabled:opacity-50"
                  >
                    {modalSuccess ? 'Close' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile || !fileValidation?.valid}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs font-body disabled:opacity-40 flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploading
                        ? 'Uploading...'
                        : activeParticipant.certificate
                        ? 'Confirm Replacement'
                        : 'Upload & Publish'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          5. BULK CERTIFICATE UPLOAD & REVIEW MODAL (Section 5)
      ======================================================================== */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0D1424] border border-[#1D2A40] shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#1D2A40] flex items-center justify-between font-body">
              <div>
                <span className="text-[10px] font-semibold uppercase font-mono tracking-wider text-amber-400 block">
                  Batch Credential Assignment
                </span>
                <h3 className="text-lg font-bold text-white font-heading">
                  Bulk Certificate Upload & Review
                </h3>
                <p className="text-xs text-slate-400 font-body">
                  Select multiple certificate files and review each file assignment before uploading.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !bulkRunning && setBulkModalOpen(false)}
                disabled={bulkRunning}
                className="p-1.5 rounded-lg bg-[#111B2D] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 font-body">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40]">
                <div className="text-xs text-slate-300">
                  <strong className="text-white font-semibold block">
                    Step 1: Select Certificate Files
                  </strong>
                  <span className="font-body text-slate-400">Choose PDF, PNG, JPG, or WEBP files.</span>
                </div>
                <div>
                  <input
                    ref={bulkInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleBulkFilesSelect}
                    disabled={bulkRunning}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bulkInputRef.current?.click()}
                    disabled={bulkRunning}
                    className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs font-body flex items-center space-x-1.5"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Select Files</span>
                  </button>
                </div>
              </div>

              {bulkItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-semibold text-amber-400">
                      Step 2: Assign Each File to a Team Member ({bulkItems.length} files)
                    </strong>
                    {hasDuplicateBulkAssignments && (
                      <span className="text-xs text-rose-400 font-medium flex items-center space-x-1 font-body">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Duplicate member assignment detected!</span>
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-[#1D2A40] overflow-hidden font-body">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#111B2D] border-b border-[#1D2A40] text-[11px] font-semibold uppercase font-body text-slate-400 tracking-wider">
                          <th className="py-2.5 px-3.5">Selected File</th>
                          <th className="py-2.5 px-3.5">Assign to Member *</th>
                          <th className="py-2.5 px-3.5">Status</th>
                          <th className="py-2.5 px-3.5 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1D2A40] bg-[#0D1424]">
                        {bulkItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3.5">
                              <strong className="text-white block truncate max-w-[200px] font-mono text-xs" title={item.file.name}>
                                {item.file.name}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(item.file.size / 1024).toFixed(1)} KB
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5">
                              <select
                                value={item.assignedUid}
                                onChange={(e) => updateBulkItemParticipant(item.id, e.target.value)}
                                disabled={bulkRunning || !item.validation.valid || item.status === 'uploaded'}
                                className="w-full px-3 py-1.5 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white focus:border-cyan-400 focus:outline-none font-body"
                              >
                                <option value="">-- Select Member --</option>
                                {allParticipantRows.map((p) => (
                                  <option key={p.uid} value={p.uid}>
                                    {p.fullName} ({p.email || 'no-email'}) — {p.teamName} [{p.roleInTeam}] • {p.referenceCode}
                                  </option>
                                ))}
                              </select>
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-body">
                                {item.suggestionReason}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5">
                              {item.status === 'uploaded' && (
                                <span className="text-emerald-400 font-medium flex items-center space-x-1 font-body text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Uploaded</span>
                                </span>
                              )}
                              {item.status === 'uploading' && (
                                <span className="text-cyan-400 font-medium font-body text-xs">
                                  Uploading ({item.progress}%)...
                                </span>
                              )}
                              {item.status === 'pending' && (
                                <span className="text-slate-400 font-body text-xs">Ready</span>
                              )}
                              {(item.status === 'failed' || item.status === 'invalid') && (
                                <span className="text-rose-400 font-medium block font-body text-xs" title={item.error}>
                                  {item.error || 'Failed'}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => removeBulkItem(item.id)}
                                disabled={bulkRunning}
                                className="p-1 rounded-md bg-[#111B2D] hover:bg-rose-950 text-slate-400 hover:text-rose-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <label className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkConfirmed}
                      onChange={(e) => setBulkConfirmed(e.target.checked)}
                      disabled={bulkRunning || !allValidItemsAssigned || hasDuplicateBulkAssignments}
                      className="mt-0.5 accent-amber-400"
                    />
                    <span className="text-xs text-slate-200 leading-relaxed font-body">
                      <strong className="text-amber-300 block font-semibold text-xs">
                        Step 3: Confirm Assignments
                      </strong>
                      I confirm each certificate file is matched to the correct individual team member.
                    </span>
                  </label>
                </div>
              )}

              {bulkSummary && (
                <div className="p-3.5 rounded-xl bg-[#111B2D] border border-cyan-500/40 text-xs flex items-center justify-between font-body">
                  <div>
                    <strong className="text-white font-semibold block">
                      Batch Upload Complete
                    </strong>
                    <span className="text-slate-300 font-body">
                      Successfully published: <strong className="text-emerald-400 font-mono">{bulkSummary.successCount}</strong> •{' '}
                      Failed: <strong className="text-rose-400 font-mono">{bulkSummary.failCount}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-[#1D2A40] flex items-center justify-end gap-2.5 bg-[#0D1424] font-body">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                disabled={bulkRunning}
                className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 text-xs font-medium font-body"
              >
                Close
              </button>

              <button
                type="button"
                onClick={executeBulkUpload}
                disabled={
                  bulkRunning ||
                  !bulkConfirmed ||
                  !allValidItemsAssigned ||
                  hasDuplicateBulkAssignments
                }
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#070b14] font-semibold text-xs font-body disabled:opacity-40 flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{bulkRunning ? 'Uploading Batch...' : 'Upload Confirmed Certificates'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
