/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f7f5',
          100: '#e4ece7',
          200: '#cbdbd1',
          300: '#a3c2b1',
          400: '#75a18a',
          500: '#54836d',
          600: '#416956',
          700: '#355546',
          800: '#2d453b',
          900: '#273b32',
          950: '#13211b',
        },
        clay: {
          50: '#faf6f0',
          100: '#f4ebd9',
          200: '#e7d4b4',
          300: '#d7ba8c',
          400: '#c79d66',
          500: '#ba8349',
          600: '#aa713d',
          700: '#8e5b34',
          800: '#73492d',
          900: '#5e3d27',
          950: '#332014',
        },
        earth: {
          50: '#f6f7f4',
          100: '#e8ebdf',
          200: '#d1dcbf',
          300: '#afc494',
          400: '#8ea86f',
          500: '#6e8d4f',
          600: '#55713b',
          700: '#42572e',
          800: '#374727',
          900: '#303d24',
          950: '#182111',
        },
        cream: {
          50: '#fdfcf7',
          100: '#fbf8ee',
          200: '#f6ecd4',
          300: '#efdbb9',
          400: '#e6c594',
          500: '#dbab6e',
          600: '#ce8f4e',
          700: '#b8733d',
          800: '#945c36',
          900: '#784c2e',
          950: '#412716',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
