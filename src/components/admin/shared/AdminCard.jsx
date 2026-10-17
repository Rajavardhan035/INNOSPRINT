import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { hoverLift, springUI } from '../../../styles/motionConfig';

export default function AdminCard({
  children,
  title,
  subtitle,
  badge,
  action,
  className = '',
  headerClassName = '',
  enableSpotlight = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e) => {
    if (!enableSpotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={onClick ? hoverLift : undefined}
      transition={springUI}
      className={`relative rounded-2xl bg-[#0B1220]/80 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.35)] overflow-hidden transition-colors group ${
        onClick ? 'cursor-pointer hover:border-cyan-500/40 hover:bg-[#0E1626]/90' : ''
      } ${className}`}
      {...props}
    >
      {/* Top Hairline Light Reflection */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent pointer-events-none" />

      {/* Mouse Follow Spotlight Radial Glow */}
      {enableSpotlight && mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.08), transparent 70%)`,
          }}
        />
      )}

      {/* Optional Card Header */}
      {(title || subtitle || badge || action) && (
        <div className={`flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/[0.06] ${headerClassName}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {title && (
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {title}
                </h3>
              )}
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
