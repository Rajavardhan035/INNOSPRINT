import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Calendar, MapPin, Award, Mail, Phone, ExternalLink, Search, ArrowRight } from 'lucide-react';
import { EVENT_DETAILS } from '../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-cyan-500/20 text-gray-400 font-['Rajdhani'] relative z-10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-gray-950 rounded-[7px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-amber-400 font-['Orbitron']">
                  {EVENT_DETAILS.name}
                </span>
                <span className="text-[10px] tracking-widest text-cyan-400 font-bold uppercase -mt-1 font-['Chakra_Petch']">
                  NATIONAL LEVEL HACKATHON
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              48-Hour National Level Hackathon dedicated to Agentic AI, Robotic AI, and Generative AI innovations. Organized at {EVENT_DETAILS.venueShort}.
            </p>
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
              ⚡ <strong>Poster Note:</strong> {EVENT_DETAILS.posterNote}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-extrabold uppercase tracking-wider text-base mb-4 font-['Orbitron'] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">About Hackathon</Link>
              </li>
              <li>
                <Link to="/themes" className="hover:text-cyan-400 transition-colors">Themes & Tracks</Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:text-cyan-400 transition-colors">Event Schedule</Link>
              </li>
              <li>
                <Link to="/rules" className="hover:text-cyan-400 transition-colors">Rules & Eligibility</Link>
              </li>
              <li>
                <Link to="/prizes" className="hover:text-cyan-400 transition-colors">Prizes & Benefits</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-400 transition-colors font-bold text-cyan-300">Register Your Team</Link>
              </li>
            </ul>

            {/* Check Status Feature Card */}
            <div className="mt-4 pt-3 border-t border-gray-900">
              <Link
                to="/status"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 text-xs font-bold font-['Orbitron'] uppercase transition-all shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                  <span>Check Status</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[10px] text-gray-400 block mt-1.5 pl-1">
                Check approval using your registered email
              </span>
            </div>
          </div>

          {/* Event Key Highlights */}
          <div>
            <h4 className="text-white font-extrabold uppercase tracking-wider text-base mb-4 font-['Orbitron'] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>Event Details</span>
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                <span><strong>Dates:</strong> {EVENT_DETAILS.dates}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Venue:</strong> {EVENT_DETAILS.venue}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Award className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                <span><strong>Prize Pool:</strong> {EVENT_DETAILS.prizePool} Grand Cash Rewards</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-extrabold uppercase tracking-wider text-base mb-4 font-['Orbitron'] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              <span>Contact Organizers</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <a href={`mailto:${EVENT_DETAILS.organizers.contactEmail}`} className="hover:text-cyan-300 transition-colors truncate">
                  {EVENT_DETAILS.organizers.contactEmail}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`tel:${(EVENT_DETAILS.organizers.contactPhone || '+919014509649').replace(/\s+/g, '')}`}
                  className="hover:text-amber-300 font-mono transition-colors"
                >
                  {EVENT_DETAILS.organizers.contactPhone}
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-cyan-500/50 text-white text-xs font-bold uppercase transition-all"
                >
                  <span>Contact Form & Map</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 INNOSPRINT • {EVENT_DETAILS.organizers.institute}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center space-x-3 mt-4 sm:mt-0 font-medium">
            <Link to="/status" className="text-cyan-400 font-bold hover:underline flex items-center space-x-1">
              <span>Check Status</span>
            </Link>
            <span>•</span>
            <Link to="/rules" className="hover:text-gray-400">Rules</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-gray-400">Support</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-gray-400">Organizer Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
