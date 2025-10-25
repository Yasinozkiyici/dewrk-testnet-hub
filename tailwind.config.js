/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.{ts,tsx,css}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-soft)',
        surface: 'var(--surface)',
        ink: {
          900: 'var(--ink-1)',
          700: 'var(--ink-2)',
          500: 'var(--ink-3)'
        }
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }]
      },
      borderRadius: {
        lg: '16px',
        xl: '24px'
      },
      boxShadow: {
        glass: '0 20px 45px -30px rgba(13, 19, 33, 0.45)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
