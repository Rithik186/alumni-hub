export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    DEFAULT: '#0ea5e9',
                },
                secondary: '#64748b',
                dark: '#0f172a',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
                'glass': '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
