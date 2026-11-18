/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sun: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        flame: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        sindoor: {
          500: '#DC4C1B',
          600: '#C2410C',
          700: '#9A3412',
        },
        bamboo: {
          600: '#7A5028',
          700: '#6B4A24',
          800: '#5A3A1A',
          900: '#412913',
        },
        ink: '#2B1A0E',
        cream: '#FFF8EC',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        devanagari: ['"Noto Serif Devanagari"', '"Noto Sans Devanagari"', 'serif'],
      },
      boxShadow: {
        warm: '0 10px 30px -10px rgba(234, 88, 12, 0.35)',
        'warm-lg': '0 24px 60px -20px rgba(234, 88, 12, 0.45)',
        soft: '0 8px 24px -12px rgba(43, 26, 14, 0.22)',
      },
      backgroundImage: {
        sunrise: 'linear-gradient(135deg, #FBBF24 0%, #F97316 60%, #EA580C 100%)',
        'sunrise-soft': 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 45%, #FFEDD5 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ripple: {
          '0%': { transform: 'scaleX(1)', opacity: '0.38' },
          '50%': { transform: 'scaleX(1.06)', opacity: '0.18' },
          '100%': { transform: 'scaleX(1)', opacity: '0.38' },
        },
        drawerIn: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'spin-slow': 'spinSlow 18s linear infinite',
        'glow-pulse': 'glowPulse 3.6s ease-in-out infinite',
        'float-y': 'floatY 6s ease-in-out infinite',
        ripple: 'ripple 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
