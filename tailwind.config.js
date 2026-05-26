/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3bbdc4',
          dark: '#2ea5ab',
          light: '#e6f8f9',
        },
        gqg: {
          bg: '#f5f6fa',
          card: '#ffffff',
          border: '#e2e5eb',
          gold: '#3bbdc4',
          'gold-dark': '#2ea5ab',
          teal: '#16a34a',
          red: '#dc2626',
          muted: '#6b7280',
          text: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
