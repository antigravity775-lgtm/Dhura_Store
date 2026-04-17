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
        // DHURA Brand Gold Palette
        dhura: {
          50:  '#FDF8EE',
          100: '#FAF0D7',
          200: '#F3DCAA',
          300: '#E8C96A',
          400: '#D9B050',
          500: '#C9A84C', // Primary Gold
          600: '#A07830', // Gold Deep
          700: '#7A5C20',
          800: '#5A4118',
          900: '#3A2A0E',
          950: '#1A1510', // Midnight BG
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
