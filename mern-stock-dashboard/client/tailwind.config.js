/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0c0d0f',
                slate: {
                    850: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                accent: '#2563eb', // Electric Blue
                buy: '#10b981',    // Green
                sell: '#ef4444',   // Red
                alpha: '#06b6d4',  // Cyan
            },
            fontFamily: {
                sans: ['"Instrument Sans"', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
