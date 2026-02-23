/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./auth/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./consultant/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // RS Prólipsi Brand Colors - Unified Standard
                gold: {
                    DEFAULT: '#C8A74E',
                    hover: '#B8943F',
                    muted: '#E6D7A5',
                },
                base: {
                    DEFAULT: '#0F1115',
                    light: '#161A21',
                    dark: '#000000',
                },
                surface: {
                    DEFAULT: '#161A21',
                    light: '#1B2029',
                    dark: '#0F1115',
                },
                card: {
                    DEFAULT: '#1B2029',
                    hover: '#222A36',
                },
                border: {
                    DEFAULT: '#2A303B',
                    light: '#3A4252',
                },
                text: {
                    title: '#F2F4F8',
                    body: '#B7C0CD',
                    soft: '#93A0B1',
                    muted: '#6B7A90',
                },
                success: '#38C793',
                danger: '#EF5A5A',
                warning: '#E6A23C',
                info: '#3BAFDA',
                // Legacy Brand Mapping
                brand: {
                    gold: '#C8A74E',
                    dark: '#0F1115',
                    gray: '#1B2029',
                    'gray-light': '#2A303B',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
            },
            boxShadow: {
                'custom-sm': '0 2px 8px rgba(200, 167, 78, 0.1)',
                'custom-md': '0 4px 16px rgba(200, 167, 78, 0.15)',
                'custom-lg': '0 8px 24px rgba(200, 167, 78, 0.2)',
                'gold': '0 0 20px rgba(200, 167, 78, 0.3)',
            },
        },
    },
    plugins: [],
}
