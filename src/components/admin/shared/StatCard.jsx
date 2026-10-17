import React from 'react';
import { motion } from 'framer-motion';
import AdminCard from './AdminCard';
import CountUp from './CountUp';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const COLOR_MAP = {
  cyan: {
    iconBg: 'bg-cyan-950/80',
    iconBorder: 'border-cyan-400/40',
    iconColor: 'text-cyan-400',
    glow: 'rgba(34, 211, 238, 0.25)',
    sparkline: '#22d3ee',
  },
  blue: {
    iconBg: 'bg-blue-950/80',
    iconBorder: 'border-blue-400/40',
    iconColor: 'text-blue-400',
    glow: 'rgba(59, 130, 246, 0.25)',
    sparkline: '#3b82f6',
  },
  emerald: {
    iconBg: 'bg-emerald-950/80',
    iconBorder: 'border-emerald-400/40',
    iconColor: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.25)',
    sparkline: '#10b981',
  },
  amber: {
    iconBg: 'bg-amber-950/80',
    iconBorder: 'border-amber-400/40',
    iconColor: 'text-amber-400',
    glow: 'rgba(251, 191, 36, 0.25)',
    sparkline: '#fbbf24',
  },
  purple: {
    iconBg: 'bg-purple-950/80',
    iconBorder: 'border-purple-400/40',
    iconColor: 'text-purple-400',
    glow: 'rgba(168, 85, 247, 0.25)',
    sparkline: '#a855f7',
  },
  rose: {
    iconBg: 'bg-rose-950/80',
    iconBorder: 'border-rose-400/40',
    iconColor: 'text-rose-400',
    glow: 'rgba(244, 63, 94, 0.25)',
    sparkline: '#f43f5e',
  },
};

// SVG Mini Sparkline
function MiniSparkline({ data = [2, 5, 4, 8, 7, 10, 9, 13], color = '#22d3ee' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-75 group-hover:opacity-100 transition-opacity">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  sparklineData,
  onClick,
  className = '',
}) {
  const theme = COLOR_MAP[color] || COLOR_MAP.cyan;
  const isNumeric = typeof value === 'number' || (!isNaN(Number(value)) && value !== '');

  return (
    <AdminCard
      onClick={onClick}
      className={`relative overflow-hidden group hover:border-${color}-500/40 ${className}`}
    >
      {/* Background Soft Glow Orb */}
      <div
        className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
        style={{ backgroundColor: theme.glow }}
      />

      <div className="flex items-start justify-between gap-3">
        {/* Title & Numeric Display */}
        <div className="space-y-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block font-mono">
            {title}
          </span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {isNumeric ? <CountUp value={Number(value)} /> : value}
            </h2>
          </div>
        </div>

        {/* Floating Icon Orb */}
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl ${theme.iconBg} border ${theme.iconBorder} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
          >
            <Icon className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
        )}
      </div>

      {/* Footer: Trend Delta + Sparkline */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
        {trend ? (
          <div className="flex items-center space-x-1.5 min-w-0">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono ${
                trend.direction === 'down'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {trend.direction === 'down' ? (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              )}
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-slate-400 truncate text-[11px]">{trend.label}</span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] truncate">
            {subtitle || 'Realtime Supabase Telemetry'}
          </span>
        )}

        {/* Mini Sparkline Graphic */}
        <div className="flex-shrink-0">
          <MiniSparkline data={sparklineData} color={theme.sparkline} />
        </div>
      </div>
    </AdminCard>
  );
}
