import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendEmailNotification } from '../lib/email';
import { EVENT_DETAILS } from '../lib/constants';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Zap, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    registrationIdRef: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Validation
    const cleanName = (formData.name || '').trim();
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const cleanSubject = (formData.subject || '').trim() || 'General Enquiry';
    const cleanMessage = (formData.message || '').trim();
    const cleanRef = (formData.registrationIdRef || '').trim().toUpperCase() || null;

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g., student@university.edu).');
      return;
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      setErrorMsg('Please provide a message with at least 10 characters so our team can assist you effectively.');
      return;
    }

    if (cleanMessage.length > 2000) {
      setErrorMsg('Your message is too long (max 2000 characters). Please condense your message.');
      return;
    }

    // 2. Prevent rapid duplicate submissions within 15 seconds
    const now = Date.now();
    if (now - lastSubmissionTime < 15000) {
      setErrorMsg('Please wait a few seconds before submitting another inquiry.');
      return;
    }

    setLoading(true);

    try {
      const refCode = 'MSG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const messagePayload = {
        reference_code: refCode,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        registration_id_ref: cleanRef,
        status: 'new',
      };

      let insertSucceeded = false;

      // 3. Submit to Supabase if configured
      if (isSupabaseConfigured) {
        // IMPORTANT: Do NOT chain .select() to .insert() so PostgreSQL does not trigger SELECT RLS for anonymous visitors
        const { error } = await supabase.from('contact_messages').insert(messagePayload);

        if (error) {
          console.error('[ContactPage Supabase Insert Error]:', error);
          throw new Error(error.message || 'Database error occurred');
        }
        insertSucceeded = true;
      }

      // 4. Update localStorage cache dual-store for admin resilience
      try {
        const localMsgs = JSON.parse(localStorage.getItem('inno_sprint_contact_messages') || '[]');
        const newRecord = {
          id: 'local_' + refCode,
          ...messagePayload,
          created_at: new Date().toISOString()
        };
        const updatedMsgs = [newRecord, ...localMsgs.filter(m => m.reference_code !== refCode)];
        localStorage.setItem('inno_sprint_contact_messages', JSON.stringify(updatedMsgs));
      } catch (storageErr) {
        console.warn('[ContactPage localStorage notice]:', storageErr);
      }

      // 5. Send acknowledgment notification
      try {
        await sendEmailNotification({
          to: cleanEmail,
          subject: `[INNOSPRINT] Message Received (${refCode})`,
          template: 'contact_acknowledgement',
          data: { name: cleanName, referenceCode: refCode }
        });
      } catch (emailErr) {
        console.warn('[ContactPage Email notice]:', emailErr);
      }

      setLastSubmissionTime(now);
      setSuccessMsg(`Thank you! Your enquiry has been received under reference code: ${refCode}. Our organizing team will respond shortly.`);
      setFormData({ name: '', email: '', subject: '', message: '', registrationIdRef: '' });
    } catch (err) {
      console.error('[Contact Error]', err);
      setErrorMsg(err.message ? `Submission failed: ${err.message}` : 'Failed to submit message. Please try again or reach out to organizers directly via phone/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      <section className="py-12 px-4 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>HELP & ORGANIZER DESK</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase font-['Orbitron']">
          CONTACT <span className="text-cyan-400">ORGANIZERS</span>
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto font-medium">
          Have questions regarding team registration, venue logistics, or hackathon tracks? Reach out to our organizing team.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-2xl space-y-6">
          <h2 className="text-2xl font-black uppercase text-white font-['Orbitron'] border-b border-gray-800 pb-3">
            Send Us a Message
          </h2>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sarah Smith"
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@univ.edu"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Registration Inquiry / Track Question"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                  Registration ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.registrationIdRef}
                  onChange={(e) => setFormData({ ...formData, registrationIdRef: e.target.value })}
                  placeholder="INNO-XXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 font-['Orbitron'] mb-2">
                Message Content *
              </label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can our organizing committee assist you?"
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold uppercase text-xs tracking-wider font-['Orbitron'] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-gray-900/70 border border-gray-800 space-y-6">
            <h2 className="text-2xl font-black uppercase text-amber-400 font-['Orbitron'] border-b border-gray-800 pb-3">
              Organizer Contact Info
            </h2>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white uppercase font-['Orbitron'] block">Event Venue:</strong>
                  <span>{EVENT_DETAILS.venue}</span>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white uppercase font-['Orbitron'] block">Official Email:</strong>
                  <a href={`mailto:${EVENT_DETAILS.organizers.contactEmail}`} className="text-cyan-300 hover:underline">
                    {EVENT_DETAILS.organizers.contactEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white uppercase font-['Orbitron'] block">Phone / WhatsApp Helpline:</strong>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <a
                      href={`tel:${(EVENT_DETAILS.organizers.contactPhone || '+919014509649').replace(/\s+/g, '')}`}
                      className="text-purple-300 hover:text-purple-200 hover:underline font-mono text-sm font-semibold transition-colors"
                    >
                      {EVENT_DETAILS.organizers.contactPhone}
                    </a>
                    <span className="text-xs text-gray-500">•</span>
                    <a
                      href="https://wa.me/919014509649"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-medium transition-colors"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Map Directions Box */}
          <div className="p-8 rounded-3xl bg-gray-950 border border-cyan-500/30 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-['Orbitron'] block">
              VENUE MAP & NAVIGATION
            </span>
            <p className="text-xs text-gray-400">
              Vasireddy Venkatadri Institute of Technology (VVITU), Nambur, Guntur District, Andhra Pradesh.
            </p>
            <a
              href="https://maps.google.com/?q=VVITU+Guntur"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase text-xs tracking-wider font-['Orbitron'] transition-colors"
            >
              <span>Open Directions in Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
