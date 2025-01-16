/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        dropIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },   extend: {
        boxShadow: {
          textShadow: '0 4px 6px rgba(0, 0, 0, 0.8)',
        },
      },
      animation: {
        dropIn: 'dropIn 1s ease-out',
      },
    },
  },
  plugins: [],
}