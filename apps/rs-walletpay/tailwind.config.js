/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFEF0',
          100: '#FFFACD',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFD700',
          600: '#FFC700',
          700: '#FFB300',
          800: '#FFA000',
          900: '#FF8F00',
        },
        dark: {
          50: '#2a2a2a',
          100: '#1f1f1f',
          200: '#1a1a1a',
          300: '#141414',
          400: '#0f0f0f',
          500: '#0a0a0a',
          600: '#050505',
          700: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.39)',
        'gold-lg': '0 10px 40px 0 rgba(255, 215, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
