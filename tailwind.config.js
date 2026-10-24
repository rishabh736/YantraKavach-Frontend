const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        raised: c('raised'),
        line: c('line'),
        ink: c('ink'),
        muted: c('muted'),
        brand: c('brand'),
        'on-brand': c('on-brand'),
        ok: c('ok'),
        warn: c('warn'),
        crit: c('crit'),
        info: c('info'),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Consolas', 'monospace'],
        display: ['"IBM Plex Sans Condensed"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
      },
      keyframes: {
        flow: { to: { strokeDashoffset: '-24' } },
        blink: { '50%': { opacity: '0.35' } },
      },
      animation: {
        flow: 'flow 1.2s linear infinite',
        blink: 'blink 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
