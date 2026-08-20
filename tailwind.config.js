/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Legacy design tokens (keep for backwards compat) ── */
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

        /* ── Parali primary green palette (forest) ── */
        forest: {
          50:  '#F3F7F4',
          100: '#E8F1EB',
          150: '#D5E2DA',
          200: '#C0D4C5',
          300: '#9CBAA3',
          400: '#6E9878',
          500: '#4E7F5A',
          600: '#2F6B4F',  /* Agricultural green — secondary buttons, icons */
          700: '#245840',
          800: '#1C4733',
          850: '#163B2A',
          900: '#12372A',  /* Deep Parali green — primary buttons, headings */
          950: '#0D2920',
        },

        /* ── Clay / warm terracotta palette ── */
        clay: {
          50:  '#FDF5EF',
          100: '#F7E6D4',
          200: '#EEC9A3',
          300: '#E3A86E',
          400: '#D98A2B',
          500: '#C97832',
          600: '#B0642A',
          700: '#8A5A2B',
          800: '#6B4420',
          900: '#4A2F16',
        },

        /* ── Cream / off-white palette ── */
        cream: {
          50:  '#FAF9F6',
          100: '#F3F0E8',
          200: '#E8E2D3',
          300: '#D9D0BA',
          400: '#C4B89A',
          500: '#ADA07F',
          600: '#8F8465',
          700: '#6E654E',
          800: '#52493A',
          900: '#3A3329',
        },

        /* ── Parali text / semantic colors ── */
        parali: {
          text:        '#102F24',
          'text-sec':  '#40594D',
          'text-muted':'#64786D',
          label:       '#18382C',
          border:      '#D5E2DA',
          bg:          '#FAF9F6',
          card:        '#FFFFFF',
          'card-soft': '#F3F7F4',
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
        card:       '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 2px 8px rgba(0,0,0,0.08)',
        'green-sm': '0 4px 20px rgba(18, 55, 42, 0.06)',
        'green-md': '0 8px 28px rgba(18, 55, 42, 0.10)',
      },
    },
  },
  plugins: [],
}
