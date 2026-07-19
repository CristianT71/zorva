/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  // Preflight OFF — the project's own reset in styles.scss still owns base
  // typography/margins while legacy (non-Tailwind) screens are migrated.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // ---- Design-system tokens (fintech/crypto dark theme) ----
        // Usage: bg-base, bg-surface, bg-surface-card, bg-surface-muted
        base: '#0a0e17', // app background — deep blue-black
        surface: {
          DEFAULT: '#121722', // panels / cards
          card: '#0f141d', // nested cards, slightly darker than surface
          muted: '#1e2430', // chips, toggle buttons, inputs
        },
        // Accent — dark blue (moved off the old #8b5cf6 violet reference).
        // #2563eb is deliberately a notch deeper than a stock "bright blue"
        // so large filled areas still read as premium/dark, not neon.
        accent: {
          DEFAULT: '#2563eb',
          50: '#eaf1fe',
          100: '#d3e3fd',
          200: '#a6c8fb',
          300: '#74a8f5',
          400: '#4a86f0',
          500: '#2563eb', // primary accent
          600: '#1d4ed8',
          700: '#1e40af',
        },
        positive: '#34d399', // emerald-400 — gains
        negative: '#f87171', // red-400 — losses
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};