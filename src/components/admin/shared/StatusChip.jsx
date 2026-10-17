import React from 'react';
import { motion } from 'framer-motion';

const STATUS_CONFIGS = {
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-950/60',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-950/60',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
  },
  waitlisted: {
    label: 'Waitlisted',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
  },
};

export default function StatusChip({ status = 'pending', className = '', size = 'md' }) {
  const key = (status || 'pending').toLowerCase();
  const config = STATUS_CONFIGS[key] || STATUS_CONFIGS.pending;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] space-x-1'
      : 'px-2.5 py-1 text-xs space-x-1.5';

  return (
    <motion.span
      layout
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full font-mono font-medium border capitalize ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
    </motion.span>
  );
}
