/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Garantizar que las clases críticas de dark mode se generen siempre
    'dark:bg-v0-900', 'dark:bg-v0-950', 'dark:bg-v0-800',
    'dark:text-v0-50', 'dark:text-v0-100', 'dark:text-v0-200', 'dark:text-v0-300',
    'dark:border-v0-700', 'dark:border-v0-800',
    'dark:hover:bg-v0-800', 'dark:hover:bg-v0-900',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Geist es la fuente de Vercel — la aplicamos en TODO.
        sans: [
          'Geist',
          'Geist Fallback',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['Geist', 'Geist Fallback', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          'Geist Mono',
          'Geist Mono Fallback',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        // Escala neutral Vercel
        v0: {
          DEFAULT: '#FFFFFF',
          50: '#FAFAFA',
          75: '#F5F5F5',
          100: '#EFEFEF',
          150: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0A0A0A',
          950: '#000000',
        },
        accent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#0070F3',
          600: '#0070F3',
          700: '#0050B3',
        },
        // Aliases para no romper nada
        ink: {
          50: '#FAFAFA', 100: '#F5F5F5', 150: '#E5E5E5', 200: '#D4D4D4',
          300: '#A3A3A3', 400: '#737373', 500: '#525252', 600: '#404040',
          700: '#262626', 800: '#171717', 900: '#0A0A0A', 950: '#000000',
        },
        brand: {
          50: '#EFF6FF', 100: '#DBEAFE', 500: '#0070F3', 600: '#0070F3', 700: '#0050B3',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '0.875rem',
        '3xl': '1rem',
      },
      boxShadow: {
        none: 'none',
        xs: '0 0 0 1px rgb(0 0 0 / 0.05)',
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 0 0 1px rgb(0 0 0 / 0.05), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
        elevated:
          '0 0 0 1px rgb(0 0 0 / 0.06), 0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        glow: '0 0 0 1px rgb(0 112 243 / 0.16), 0 4px 16px -4px rgb(0 112 243 / 0.20)',
        'ring-v0': '0 0 0 4px rgb(10 10 10 / 0.08)',
        'ring-v0-dark': '0 0 0 4px rgb(250 250 250 / 0.10)',
      },
      letterSpacing: {
        'tightest': '-0.045em',
        'tighter': '-0.030em',
        'vercel': '-0.025em',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.7)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'progress': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2.4s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'marquee': 'marquee 40s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'progress': 'progress 1.6s ease-in-out infinite',
      },
      backgroundImage: {
        'dots-light':
          'radial-gradient(circle, rgba(10,10,10,0.10) 1px, transparent 1px)',
        'dots-dark':
          'radial-gradient(circle, rgba(250,250,250,0.10) 1px, transparent 1px)',
        'grid-light':
          'linear-gradient(rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(10,10,10,0.04) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(rgba(250,250,250,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(250,250,250,0.04) 1px, transparent 1px)',
        'vercel-gradient':
          'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))',
      },
      backgroundSize: {
        'dots': '24px 24px',
        'grid': '32px 32px',
      },
    },
  },
  plugins: [],
};
