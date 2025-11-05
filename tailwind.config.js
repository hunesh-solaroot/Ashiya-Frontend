/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f0ff',
          100: '#e9e5ff',
          200: '#d6ceff',
          300: '#b8a6ff',
          400: '#9575ff',
          500: '#7c3aed',
          600: '#533293',
          700: '#A4496A',
          800: '#4c1d95',
          900: '#3b0764',
        },
        gradient: {
          start: '#533293',
          end: '#A4496A',
        },
      },
    },
  },
  plugins: [],
}
