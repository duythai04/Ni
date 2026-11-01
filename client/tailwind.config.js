/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EC4899',
          light: '#FCE7F3',
          dark: '#DB2777',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
        },
        sakura: {
          bg: '#FFF9FC',
          card: '#FFFFFF',
          border: '#FCE7F3',
          soft: '#FFF1F8',
          accent: '#FDA4AF',
        },
        navy: {
          dark: '#172554',
          muted: '#334155',
          light: '#64748B',
        },
        sky: {
          pastel: '#DBEAFE',
          accent: '#3B82F6',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', '"Hiragino Kaku Gothic ProN"', 'sans-serif'],
      },
      boxShadow: {
        'sakura': '0 4px 20px -2px rgba(236, 72, 153, 0.08), 0 2px 6px -2px rgba(236, 72, 153, 0.04)',
        'sakura-lg': '0 10px 30px -4px rgba(236, 72, 153, 0.12), 0 4px 12px -2px rgba(236, 72, 153, 0.06)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
