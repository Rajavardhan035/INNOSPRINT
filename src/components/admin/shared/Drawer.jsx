import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { springUI } from '../../../styles/motionConfig';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-xl',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer Body Sliding in from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springUI}
            className={`relative w-full ${width} bg-[#080E1C] border-l border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col h-full z-10`}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#0A1224]/80 backdrop-blur-md">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate font-mono">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0A1224]/90 backdrop-blur-md">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
