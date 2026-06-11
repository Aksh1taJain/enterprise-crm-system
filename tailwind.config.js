/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe6',
          300: '#a6bdd3',
          400: '#769bbb',
          500: '#537da4',
          600: '#416388',
          700: '#35506f',
          800: '#2f455d',
          900: '#2a3a4e',
          950: '#1b2432',
        }
      }
    },
  },
  plugins: [],
}
