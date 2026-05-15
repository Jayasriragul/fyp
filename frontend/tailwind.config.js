/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3eeff',
          100: '#e5dbff',
          200: '#cbb8ff',
          300: '#a98aff',
          400: '#8b5cf6',
          500: '#6c3ce1',
          600: '#5a2dc7',
          700: '#4a22a3',
          800: '#3b1b80',
          900: '#2d1466',
        },
        dark: {
          50: '#e8e8ee',
          100: '#c4c4d4',
          200: '#9d9db8',
          300: '#76769c',
          400: '#585888',
          500: '#3a3a74',
          600: '#30306a',
          700: '#24245b',
          800: '#1a1a4e',
          900: '#0f0f35',
          950: '#0a0a1a',
        },
        accent: {
          cyan: '#00d4ff',
          pink: '#ff2d7b',
          green: '#00e676',
          orange: '#ff9100',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(108,60,225,0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(108,60,225,0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
