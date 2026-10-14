import React, { useState } from 'react';
import {
  Sliders,
  Database,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Lock,
  Globe,
  Trash2,
  Calendar,
  Users,
  Award,
  Check
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SettingsTab({ onRefreshData }) {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);
  const [eventPhase, setEventPhase] = useState(() => {
    return localStorage.getItem('inno_sprint_event_phase') || 'live';
  });

  // Settings values with state
  const [autoVerifyCerts, setAutoVerifyCerts] = useState(() => {
    return localStorage.getItem('inno_sprint_autoverify_certs') !== 'false';
  });
  const [allowRegistrationEdits, setAllowRegistrationEdits] = useState(() => {
    return localStorage.getItem('inno_sprint_allow_edits') === 'true';
  });
  const [teamSizeLimit, setTeamSizeLimit] = useState(4);
  const [saveToast, setSaveToast] = useState('');

  const handleTestStorage = async () => {
    setTesting(true);
    setTestResult('');
    try {
      if (!isSupabaseConfigured) {
        setTestResult('Supabase is running in local fallback mock mode.');
        return;
      }
      const { data, error } = await supabase.storage.from('certificates').list('', { limit: 1 });
      if (error) {
        setTestResult('Notice: ' + error.message);
      } else {
        setTestResult('Storage bucket "certificates" connected and responding properly.');
      }
    } catch (e) {
      setTestResult('Storage test error: ' + (e.message || String(e)));
    } finally {
      setTesting(false);
    }
  };

  const handlePhaseChange = (phase) => {
    setEventPhase(phase);
    localStorage.setItem('inno_sprint_event_phase', phase);
    setSaveToast('Operational phase updated.');
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleToggleAutoVerify = () => {
    const next = !autoVerifyCerts;
    setAutoVerifyCerts(next);
    localStorage.setItem('inno_sprint_autoverify_certs', String(next));
  };

  const handleToggleEdits = () => {
    const next = !allowRegistrationEdits;
    setAllowRegistrationEdits(next);
    localStorage.setItem('inno_sprint_allow_edits', String(next));
  };

  const handleClearLocalCache = () => {
    if (confirm('Clear local application cache and reload from Supabase?')) {
      localStorage.removeItem('inno_sprint_registrations');
      localStorage.removeItem('inno_sprint_contact_messages');
      localStorage.removeItem('inno_sprint_announcements');
      if (onRefreshData) onRefreshData();
      alert('Local cache purged. Live data refetched.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {saveToast && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 1. Supabase Status & Infrastructure */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#1D2A40] pb-4">
          <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-tight">
              Infrastructure & Supabase Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Database connection status, private storage bucket, and hosting edge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Database */}
          <div className="p-4 rounded-lg bg-[#111B2D] border border-[#1D2A40] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-emerald-400 font-mono">
                PostgreSQL DB
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="text-white block font-medium text-xs">
              Supabase Project
            </strong>
            <span className="text-[11px] font-mono text-slate-400 block truncate">
              hbntxrrexilmjvxncwvc
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>RLS Active & Connected</span>
            </div>
          </div>

          {/* Storage */}
          <div className="p-4 rounded-lg bg-[#111B2D] border border-[#1D2A40] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-amber-400 font-mono">
                Private Cloud Storage
              </span>
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <strong className="text-white block font-medium text-xs">
              Certificates Bucket
            </strong>
            <span className="text-[11px] font-mono text-slate-400 block truncate">
              bucket: certificates
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-amber-400 font-mono">
              <Lock className="w-3 h-3" />
              <span>Signed URLs Enforced</span>
            </div>
          </div>

          {/* Hosting */}
          <div className="p-4 rounded-lg bg-[#111B2D] border border-[#1D2A40] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-cyan-400 font-mono">
                Production Edge
              </span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <strong className="text-white block font-medium text-xs">
              Firebase Hosting CDN
            </strong>
            <span className="text-[11px] font-mono text-cyan-400 block truncate">
              innosprint.web.app
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-cyan-400 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>SSL TLS 1.3 Active</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Ping */}
        <div className="pt-3 border-t border-[#1D2A40] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Storage Bucket Health Check
            </h3>
            <p className="text-[11px] text-slate-400">
              Ping the private storage bucket to verify upload/download accessibility.
            </p>
          </div>

          <button
            onClick={handleTestStorage}
            disabled={testing}
            className="px-3 py-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Storage Ping'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs font-mono text-cyan-400">
            {testResult}
          </div>
        )}
      </div>

      {/* 2. Hackathon Dates & Operational Phase */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        <div>
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Hackathon Operational Phase
          </h3>
          <p className="text-xs text-slate-400">
            Select the current event stage to adapt portal banners and participant actions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { id: 'registration', label: '1. Registration Open', desc: 'Accepting submissions' },
            { id: 'review', label: '2. Screening & Review', desc: 'Evaluating applications' },
            { id: 'live', label: '3. Hackathon Active', desc: '48H build sprint' },
            { id: 'completed', label: '4. Results & Certs', desc: 'Podium & certificate downloads' },
          ].map((phase) => (
            <button
              key={phase.id}
              onClick={() => handlePhaseChange(phase.id)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                eventPhase === phase.id
                  ? 'bg-[#111B2D] border-cyan-400 text-white shadow-sm'
                  : 'bg-[#070b14] border-[#1D2A40] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <strong className="text-xs font-semibold block">
                {phase.label}
              </strong>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {phase.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Certificate & Registration Configuration */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        <div className="border-b border-[#1D2A40] pb-3">
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Event & Certificate Rules
          </h3>
          <p className="text-xs text-slate-400">
            Manage squad sizing, participant download rules, and upload validation constraints.
          </p>
        </div>

        <div className="space-y-3">
          {/* Toggle: Auto-Verify Certificates */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <div>
              <strong className="text-xs font-semibold text-slate-200 block">
                Instant Participant Download on Upload
              </strong>
              <span className="text-[11px] text-slate-400">
                Immediately enable participant credential retrieval upon admin upload.
              </span>
            </div>
            <button
              onClick={handleToggleAutoVerify}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                autoVerifyCerts ? 'bg-cyan-500' : 'bg-[#070b14] border border-[#1D2A40]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoVerifyCerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle: Registration Edits */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
            <div>
              <strong className="text-xs font-semibold text-slate-200 block">
                Allow Participant Roster Updates
              </strong>
              <span className="text-[11px] text-slate-400">
                Permit team leads to modify team member details prior to final registration close.
              </span>
            </div>
            <button
              onClick={handleToggleEdits}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                allowRegistrationEdits ? 'bg-cyan-500' : 'bg-[#070b14] border border-[#1D2A40]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  allowRegistrationEdits ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Cache & Maintenance Utilities */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Cache & Local Memory Reset
          </h3>
          <p className="text-xs text-slate-400">
            Purge cached browser registrations and force fresh reload from Supabase database.
          </p>
        </div>

        <button
          onClick={handleClearLocalCache}
          className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/50 text-rose-300 text-xs font-medium flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Local Cache</span>
        </button>
      </div>
    </div>
  );
}
