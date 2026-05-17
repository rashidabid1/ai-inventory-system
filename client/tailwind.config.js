/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0B0F19',
        surface: 'rgba(255, 255, 255, 0.03)',
        surfaceHover: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
