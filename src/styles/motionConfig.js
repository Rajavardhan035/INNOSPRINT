// Shared Motion System for INNO SPRINT Admin Panel
// Spring physics tuned for crisp, tactile SaaS feedback (Linear / Raycast feel)

export const springUI = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
  mass: 0.8,
};

export const springSnappy = {
  type: 'spring',
  stiffness: 380,
  damping: 24,
};

export const springGentle = {
  type: 'spring',
  stiffness: 200,
  damping: 28,
};

export const fadeEase = [0.22, 1, 0.36, 1];

// Page Transition: Smooth fade + slight elevation + crisp focus
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: 'blur(3px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.28,
      ease: fadeEase,
      when: 'beforeChildren',
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(2px)',
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
};

// Staggered Container
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.stagger || 0.05,
      delayChildren: custom.delay || 0.02,
    },
  }),
};

// Staggered Item
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

// Micro-interaction presets
export const hoverLift = {
  y: -2,
  transition: { duration: 0.2, ease: fadeEase },
};

export const buttonPress = {
  scale: 0.97,
  transition: { duration: 0.08 },
};

export const pulseGlow = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 2.2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
