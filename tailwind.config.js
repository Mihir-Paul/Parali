/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          900: '#173226',
          700: '#2C5940',
          100: '#E4EEE6',
        },
        soil: {
          700: '#8A5A2B',
          100: '#F1E4D3',
        },
        ash: {
          500: '#D98A2B',
        },
        ember: {
          600: '#C1402A',
        },
        paper: {
          50: '#FAF8F4',
        },
        surface: {
          0: '#FFFFFF',
        },
        line: {
          200: '#E3DFD5',
        },
        ink: {
          900: '#211E19',
          500: '#6B6558',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
