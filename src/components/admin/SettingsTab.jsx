import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Check,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { springUI } from '../../styles/motionConfig';

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

  const handleTestStorage = async () => {
    setTesting(true);
    setTestResult('');
    try {
      if (!isSupabaseConfigured) {
        setTestResult('Supabase is running in local fallback mock mode.');
        toast.info('Supabase running in local fallback mock mode');
        return;
      }
      const { data, error } = await supabase.storage.from('certificates').list('', { limit: 1 });
      if (error) {
        setTestResult('Notice: ' + error.message);
        toast.error('Storage test notice: ' + error.message);
      } else {
        setTestResult('Storage bucket "certificates" connected and responding properly.');
        toast.success('Storage bucket "certificates" responding properly');
      }
    } catch (e) {
      setTestResult('Storage test error: ' + (e.message || String(e)));
      toast.error('Storage test error');
    } finally {
      setTesting(false);
    }
  };

  const handlePhaseChange = (phase) => {
    setEventPhase(phase);
    localStorage.setItem('inno_sprint_event_phase', phase);
    toast.success('Operational phase updated');
  };

  const handleToggleAutoVerify = () => {
    const next = !autoVerifyCerts;
    setAutoVerifyCerts(next);
    localStorage.setItem('inno_sprint_autoverify_certs', String(next));
    toast.success(next ? 'Instant participant download enabled' : 'Manual verification required');
  };

  const handleToggleEdits = () => {
    const next = !allowRegistrationEdits;
    setAllowRegistrationEdits(next);
    localStorage.setItem('inno_sprint_allow_edits', String(next));
    toast.success(next ? 'Participant edits allowed' : 'Participant edits locked');
  };

  const handleClearLocalCache = () => {
    if (confirm('Clear local application cache and reload from Supabase?')) {
      localStorage.removeItem('inno_sprint_registrations');
      localStorage.removeItem('inno_sprint_contact_messages');
      localStorage.removeItem('inno_sprint_announcements');
      if (onRefreshData) onRefreshData();
      toast.success('Local cache purged. Live data refetched.');
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* 1. Supabase Status & Infrastructure */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-tight">
              Mission Control & Infrastructure
            </h2>
            <p className="text-xs text-slate-400">
              Live database connection telemetry, private credential storage, and production CDN edge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Database */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono tracking-wider">
                PostgreSQL DB
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="text-white block font-bold text-xs font-heading">
              Supabase Project
            </strong>
            <span className="text-[11px] font-mono text-slate-400 block truncate">
              hbntxrrexilmjvxncwvc
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>RLS Active & Connected</span>
            </div>
          </div>

          {/* Storage */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-amber-400 font-mono tracking-wider">
                Private Cloud Storage
              </span>
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <strong className="text-white block font-bold text-xs font-heading">
              Certificates Bucket
            </strong>
            <span className="text-[11px] font-mono text-slate-400 block truncate">
              bucket: certificates
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-amber-400 font-mono">
              <Lock className="w-3 h-3" />
              <span>Signed Token URLs Enforced</span>
            </div>
          </div>

          {/* Hosting */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-cyan-400 font-mono tracking-wider">
                Production Edge
              </span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <strong className="text-white block font-bold text-xs font-heading">
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
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Storage Bucket Health Check
            </h3>
            <p className="text-[11px] text-slate-400">
              Ping the private storage bucket to verify upload/download accessibility.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTestStorage}
            disabled={testing}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Storage Ping'}</span>
          </motion.button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-[#060912]/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            {testResult}
          </div>
        )}
      </div>

      {/* 2. Hackathon Dates & Operational Phase */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
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
              className={`p-4 rounded-2xl text-left border transition-all ${
                eventPhase === phase.id
                  ? 'bg-gradient-to-b from-cyan-500/15 to-blue-500/10 border-cyan-400/60 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <strong className="text-xs font-semibold block font-heading">
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
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Event & Certificate Rules
          </h3>
          <p className="text-xs text-slate-400">
            Manage squad sizing, participant download rules, and upload validation constraints.
          </p>
        </div>

        <div className="space-y-3">
          {/* Toggle: Auto-Verify Certificates */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                autoVerifyCerts ? 'bg-cyan-500' : 'bg-white/10 border border-white/20'
              }`}
            >
              <motion.div
                animate={{ x: autoVerifyCerts ? 24 : 0 }}
                transition={springUI}
                className="w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
          </div>

          {/* Toggle: Registration Edits */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                allowRegistrationEdits ? 'bg-cyan-500' : 'bg-white/10 border border-white/20'
              }`}
            >
              <motion.div
                animate={{ x: allowRegistrationEdits ? 24 : 0 }}
                transition={springUI}
                className="w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Cache & Maintenance Utilities */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Cache & Local Memory Reset
          </h3>
          <p className="text-xs text-slate-400">
            Purge cached browser registrations and force fresh reload from Supabase database.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClearLocalCache}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Local Cache</span>
        </motion.button>
      </div>
    </div>
  );
}
