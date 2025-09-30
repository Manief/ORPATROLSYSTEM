/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F8BFF',
          '50': '#EAF1FF',
          '100': '#D6E3FF',
          '200': '#B9CEFF',
          '300': '#9CB9FF',
          '400': '#7E9FFF',
          '500': '#6185FF',
          '600': '#4F8BFF',
          '700': '#3A6ADA',
          '800': '#2C50A7',
          '900': '#1E3674',
        },
        dark: {
          'bg': '#1a202c',
          'card': '#2d3748',
          'border': '#4a5568',
          'text': '#e2e8f0',
          'text-secondary': '#a0aec0',
        }
      }
    }
  },
  plugins: [],
}
