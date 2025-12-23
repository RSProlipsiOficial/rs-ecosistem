/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rs: {
          dark: '#0F1115',
          card: '#1A1D23',
          gold: '#C8A74E',
          goldHover: '#B69642',
          text: '#E5E7EB',
          muted: '#9CA3AF',
          border: '#2A2E37'
        },
        // Paleta Oficial RS Prólipsi (PRD)
        'rs-gold': {
          DEFAULT: '#C8A74E',
          hover: '#B8943F',
          muted: '#E6D7A5',
        },
        'graphite': {
          900: '#0F1115',
          800: '#161A21',
          750: '#1B2029',
          650: '#2A303B',
        },
        'zircon': {
          50: '#F2F4F8',
          200: '#B7C0CD',
          350: '#93A0B1',
        },
        'status': {
          info: '#3BAFDA',
          success: '#38C793',
          warning: '#E6A23C',
          danger: '#EF5A5A',
        },
        dark: {
          950: '#0F1115',
          900: '#161A21',
          800: '#1B2029',
          700: '#2A303B',
        },
        gold: {
          400: '#C8A74E',
          500: '#C8A74E',
          600: '#B8943F',
        },
      },
      borderRadius: {
        'rs': '16px', // Padrão RS
      },
      boxShadow: {
        'rs': '0 10px 30px rgba(0,0,0,0.45)', // Shadow oficial
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideInRight: { '0%': { transform: 'translateX(1rem)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        slideInLeft: { '0%': { transform: 'translateX(-1rem)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        zoomIn: { '0%': { transform: 'scale(0.95)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'zoom-in': 'zoomIn 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
