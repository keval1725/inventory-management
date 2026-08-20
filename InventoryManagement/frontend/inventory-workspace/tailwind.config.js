const { join } = require('path');

/**
 * Design tokens for the Inventory admin UI.
 *
 * The visual language is borrowed from the warehouse floor rather than from
 * generic SaaS dashboards: stamped-ink black, label-stock paper, galvanised
 * steel greys, and safety-tape amber used *only* as a structural signal.
 *
 * Two rules are enforced here rather than left to code review:
 *
 * 1. `boxShadow` is REPLACED, not extended — Tailwind's `shadow-sm`/`shadow-md`
 *    no longer exist. Structure on the page plane comes from hairline borders
 *    (`border-line`); shadow is reserved for things physically above the plane
 *    (drawers, dialogs, menus, toasts). A stray `shadow-sm` simply emits nothing.
 * 2. `fontSize` is REPLACED with a denser scale — `text-base` is 13px, not 16px.
 *    This is a tool people scan for hours, not a marketing page.
 */
module.exports = {
  content: [join(__dirname, 'apps/**/*.{html,ts}'), join(__dirname, 'libs/**/*.{html,ts}')],
  theme: {
    extend: {
      colors: {
        // Stamped ink — sidebar, primary actions, headings.
        ink: {
          DEFAULT: '#12141A',
          900: '#12141A',
          800: '#1C1F27',
          700: '#272B35',
          600: '#343945',
        },
        // Galvanised steel — secondary text, icons, inactive states.
        steel: {
          DEFAULT: '#5B6472',
          700: '#414957',
          600: '#5B6472',
          500: '#7A8494',
          400: '#9BA3B0',
          300: '#C3C8D0',
          200: '#DDE1E6',
        },
        // Label stock — the page ground. Faintly warm, never pure white.
        paper: '#FBFBF9',
        surface: {
          DEFAULT: '#FFFFFF',
          sunken: '#F4F5F3',
        },
        line: {
          DEFAULT: '#E3E5E4',
          strong: '#CFD2D0',
        },
        // Safety tape. Structural only: active nav marker, focus ring, low-stock spine.
        hazard: {
          DEFAULT: '#FFC400',
          600: '#D9A400',
          100: '#FFF6D6',
        },
        ok: { DEFAULT: '#0E7C5A', 100: '#E3F3ED' },
        warn: { DEFAULT: '#B45309', 100: '#FDF1E3' },
        danger: { DEFAULT: '#B42318', 700: '#8F1B12', 100: '#FBE9E7' },
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        // Every quantity, SKU, id and timestamp in the app is set in this face,
        // with tabular figures, so numeric columns align like a physical count sheet.
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      spacing: {
        // Fixed chrome dimensions, referenced in more than one place.
        rail: '60px',
        sidebar: '248px',
        topbar: '56px',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.97)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        'slide-in-right': 'slide-in-right 180ms cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in-left': 'slide-in-left 180ms cubic-bezier(0.32, 0.72, 0, 1)',
        'toast-in': 'toast-in 160ms cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-in': 'scale-in 140ms cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 140ms ease-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },

    // --- Replaced, not extended (see the header comment) ---
    fontSize: {
      // Micro-labels: column headers, eyebrows. Always uppercase + tracked.
      '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.08em' }],
      xs: ['11px', { lineHeight: '16px' }],
      sm: ['12px', { lineHeight: '18px' }],
      base: ['13px', { lineHeight: '20px' }],
      md: ['14px', { lineHeight: '21px' }],
      lg: ['16px', { lineHeight: '24px' }],
      xl: ['19px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
      '2xl': ['23px', { lineHeight: '30px', letterSpacing: '-0.015em' }],
      '3xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
    },
    boxShadow: {
      none: 'none',
      popover: '0 8px 24px -8px rgb(18 20 26 / 0.20), 0 2px 6px -2px rgb(18 20 26 / 0.10)',
      overlay: '0 16px 48px -12px rgb(18 20 26 / 0.24), 0 4px 12px -4px rgb(18 20 26 / 0.12)',
    },
  },
  plugins: [],
};
