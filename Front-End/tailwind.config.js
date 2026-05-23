/** @type {import('tailwindcss').Config} */
export default {
  // EN: 'class' strategy = dark mode is toggled by adding/removing 'dark' class on <html>
  // AR: استراتيجية 'class' = الوضع الداكن يُفعَّل بإضافة/إزالة كلاس 'dark' على <html>
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gisaah Gold Palette
        gold: {
          50: '#FBF8F1',
          100: '#F7F0E2',
          200: '#F0E2C5',
          300: '#E8D4A8',
          400: '#B8860B', // Night Mode Gisaah Gold
          500: '#DAA520', // Light Mode Gisaah Gold
          600: '#DAA520', // Light Mode Gisaah Gold
          700: '#B8860B', // Night Mode Gisaah Gold
          800: '#916A09',
          900: '#6D5007',
          950: '#362803',
        },
        // Gisaah Neutral Overrides
        slate: {
          900: '#232323', // Gisaah Text (LIGHT)
          950: '#0F0F0F', // Screen Background (NIGHT)
        },
        gray: {
          900: '#232323', // Gisaah Text (LIGHT)
          950: '#0F0F0F', // Screen Background (NIGHT)
        },
        // Bone Palette (Background/Light) - Centers on #F8F6EF
        bone: {
          DEFAULT: '#F8F6EF',
          50: '#FCFBF8',
          100: '#F8F6EF', // Primary Bone White
          200: '#EFEADD',
          300: '#E4DBCA',
          400: '#D6C8B2',
          500: '#C7B49A',
          600: '#B59E81',
          700: '#9E8669',
          800: '#867056',
          900: '#6D5B46',
          950: '#40352A',
        },
      },
      fontFamily: {
        sans: ['"Tajawal"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        arabic: ['"Tajawal"', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
