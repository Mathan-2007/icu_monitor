/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // dark medical theme, easy on night-shift eyes
        surface: { 900: '#0f172a', 800: '#1e293b', 700: '#334155' }
      }
    }
  },
  plugins: []
};