/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gqg: {
          bg: '#0b1120',
          card: '#131d2f',
          border: '#1e2d44',
          gold: '#f0c756',
          'gold-dark': '#c9a22e',
          teal: '#34d5b0',
          red: '#ff5c5c',
          muted: '#5a7090',
          text: '#d8e0ec',
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
