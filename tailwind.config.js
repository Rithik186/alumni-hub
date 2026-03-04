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
                teal: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                },
                secondary: '#64748b',
                dark: '#0f172a',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(124, 58, 237, 0.5)',
                'glass': '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
                'violet': '0 10px 40px -10px rgba(124, 58, 237, 0.3)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
