/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          300: '#64748b',
          400: '#2a3d52',
          500: '#1e2d3d',
          600: '#1a2535',
          700: '#16202b',
          800: '#111820',
          900: '#0a0f14',
        },
      },
    },
  },
  plugins: [],
}
