import React from 'react';

export function Skeleton({ className = '', rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.04] border border-white/[0.04] ${rounded} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-[#0B1220]/80 border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/[0.06] space-x-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
