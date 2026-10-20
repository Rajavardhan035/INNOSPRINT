import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth, checkIsAdminEmail, checkIsAdminEmailAsync } from '../lib/auth';
import { Zap, Mail, Lock, User, Phone, School, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';

  const { signIn, signUp, resetPassword, user, isOrganizerOrAdmin, loginAsDemoAdmin } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [college, setCollege] = useState('');
  const [degreeBranch, setDegreeBranch] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const { data, error } = await signIn({ email, password });
        if (error) throw error;

        setSuccessMsg('Authentication successful! Redirecting...');
        
        const clean = (email || '').toLowerCase().trim();
        const adminMeta = checkIsAdminEmail(clean) || (await checkIsAdminEmailAsync(clean));
        const isAdmin = Boolean(adminMeta);

        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 500);

      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        const { data, error } = await signUp({
          email,
          password,
          fullName,
          mobile,
          college,
          degreeBranch,
        });

        if (error) throw error;
        setSuccessMsg('Account created successfully! You are now logged in.');
        setTimeout(() => navigate('/dashboard'), 1000);

      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMsg('Password reset link has been dispatched to your email address.');
      }
    } catch (err) {
      console.error('[Auth Exception]', err);
      setErrorMsg(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
      
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-gray-900/80 border border-cyan-500/40 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Top Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-purple-500" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/30 mx-auto">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-widest font-['Orbitron']">
            INNOSPRINT <span className="text-cyan-400">AUTH</span>
          </h1>

          <p className="text-xs text-gray-400 font-medium">
            {mode === 'login' && 'Sign in to access participant dashboard or organizer tools.'}
            {mode === 'signup' && 'Create your participant account.'}
            {mode === 'forgot' && 'Reset your account password.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-gray-950 p-1 border border-gray-800 text-xs font-bold font-['Orbitron']">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg uppercase transition-colors ${mode === 'login' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg uppercase transition-colors ${mode === 'signup' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
                  College / University
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="VVITU / University Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron'] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@vvitu.ac.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold uppercase text-gray-400 font-['Orbitron']">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold uppercase text-xs tracking-wider font-['Orbitron'] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'SIGN IN'
                : mode === 'signup'
                ? 'CREATE ACCOUNT'
                : 'SEND RESET LINK'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
