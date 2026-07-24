/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: {
          50:  '#e6f4ea',
          100: '#cce9d5',
          200: '#99d3ab',
          300: '#66be81',
          400: '#33a856',
          500: '#009246', // Italian Green
          600: '#007a3b',
          700: '#00612f',
          800: '#004923',
          900: '#003017',
          950: '#00180b',
        },
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Accent colors (Standard Tailwind colors)
        success: {
          400: '#4ade80',
          500: '#22c55e', // Requested green
          600: '#16a34a',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444', // Requested red
          600: '#dc2626',
        },
        warning: {
          400: '#fbbf24',
          500: '#facc15', // Requested yellow
          600: '#eab308',
        },
        info: {
          400: '#60a5fa',
          500: '#3b82f6', // Requested blue
          600: '#2563eb',
        },
        // Surface colors for the new theme
        surface: {
          50:  '#F3F4F6', // Light background
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#A1A1AA', // Secondary Text
          500: '#6B7280', // Muted Text
          600: '#374151',
          700: '#242B36', // Borders
          800: '#11151D', // Cards
          900: '#0E1118', // Secondary Background
          950: '#07090D', // Background
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 146, 70, 0.35)',
        'glow-accent':  '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-success': '0 0 20px rgba(0, 146, 70, 0.35)',
        'glow-danger':  '0 0 20px rgba(206, 43, 55, 0.35)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-dark':    '0 4px 24px rgba(0, 0, 0, 0.4)',
        'float':        '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #009246 0%, #33a856 100%)',
        'gradient-success':  'linear-gradient(135deg, #009246 0%, #33a856 100%)',
        'gradient-danger':   'linear-gradient(135deg, #ce2b37 0%, #e56f6a 100%)',
        'gradient-warning':  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-dark':     'linear-gradient(135deg, #11151F 0%, #161C29 100%)',
        'gradient-surface':  'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-in-out',
        'fade-up':       'fadeUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'scale-in':      'scaleIn 0.2s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
