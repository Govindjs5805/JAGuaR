/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark green theme
        background: {
          DEFAULT: '#0a0f0d',
          surface: '#111816',
          card: '#1a2420',
          elevated: '#1f2b25',
        },
        primary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          darker: '#047857',
        },
        secondary: {
          DEFAULT: '#6ee7b7',
          light: '#a7f3d0',
          dark: '#5eead4',
        },
        accent: {
          DEFAULT: '#14b8a6',
          light: '#2dd4bf',
          dark: '#0d9488',
        },
        text: {
          primary: '#f0fdf4',
          secondary: '#d1fae5',
          tertiary: '#a7f3d0',
          muted: '#6ee7b7',
        },
        status: {
          danger: '#ef4444',
          warning: '#f59e0b',
          safe: '#22c55e',
          info: '#3b82f6',
        },
        border: {
          DEFAULT: '#1f2b25',
          light: '#2d3e35',
          lighter: '#3d4f45',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(16, 185, 129, 0.3)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-lg': '0 0 30px rgba(16, 185, 129, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
