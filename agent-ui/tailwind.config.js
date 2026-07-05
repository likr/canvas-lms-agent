/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0D1117',
        darkSidebar: '#161B22',
        darkCard: '#21262D',
        brandBlue: '#58A6FF',
        brandPurple: '#BC8CFF',
      }
    },
  },
  plugins: [],
}
