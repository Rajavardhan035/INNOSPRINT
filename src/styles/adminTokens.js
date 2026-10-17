// Premium SaaS Design Tokens for INNO SPRINT Admin Mission Control
export const ADMIN_TOKENS = {
  colors: {
    // Layered Dark Surfaces
    bg0: '#040711', // Deepest canvas background
    bg1: '#070C18', // Primary shell & sidebar
    bg2: '#0D1527', // Card surfaces & table containers
    bg3: '#131E36', // Elevated panels, hover states & inputs
    bgGlass: 'rgba(13, 21, 39, 0.75)',
    bgGlassElevated: 'rgba(19, 30, 54, 0.85)',

    // Hairline Borders (~8% to 15% white opacity)
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderMedium: 'rgba(255, 255, 255, 0.14)',
    borderHighlight: 'rgba(255, 255, 255, 0.22)',
    borderHover: 'rgba(56, 189, 248, 0.45)',

    // Accent Gradient & Colors
    accentCyan: '#22d3ee',
    accentSky: '#38bdf8',
    accentBlue: '#3b82f6',
    accentViolet: '#8b5cf6',
    accentAmber: '#fbbf24',
    accentRose: '#f43f5e',
    accentEmerald: '#10b981',

    // Semantic Status Colors
    status: {
      pending: {
        bg: 'rgba(251, 191, 36, 0.12)',
        border: 'rgba(251, 191, 36, 0.3)',
        text: '#fde047',
        glow: 'rgba(251, 191, 36, 0.25)',
      },
      approved: {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#6ee7b7',
        glow: 'rgba(16, 185, 129, 0.25)',
      },
      rejected: {
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.3)',
        text: '#fda4af',
        glow: 'rgba(244, 63, 94, 0.25)',
      },
      waitlisted: {
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.3)',
        text: '#7dd3fc',
        glow: 'rgba(56, 189, 248, 0.25)',
      },
    },
  },

  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    cardHover: '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.15)',
    glowCyan: '0 0 25px rgba(34, 211, 238, 0.35)',
    glowViolet: '0 0 25px rgba(139, 92, 246, 0.35)',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
};
