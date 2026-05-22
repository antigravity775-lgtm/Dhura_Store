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
        // Agate Palette (Brand Red/Burgundy) - Centers on #791C2E
        agate: {
          50: '#FAF0F2',
          100: '#F2D7DD',
          200: '#E6B2BE',
          300: '#D6899A',
          400: '#C25D73',
          500: '#A63B54',
          600: '#8a2337',
          700: '#791C2E', // Primary Dark Agate
          800: '#631423',
          900: '#4D101A',
          950: '#210609',
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
