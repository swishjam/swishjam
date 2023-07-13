const { Tokens } = require('./.mirrorful/theme_cjs');

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      extend: {
        'animation': {
              'text':'text 5s ease infinite',
          },
          'keyframes': {
              'text': {
                  '0%, 100%': {
                     'background-size':'200% 200%',
                      'background-position': 'left center'
                  },
                  '50%': {
                     'background-size':'200% 200%',
                      'background-position': 'right center'
                  }
              },
          }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch', // add required value here
          }
        }
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        '2xl': '40rem',
      },
      colors: {
        swishjam: {
          DEFAULT: '#7487F7',
          dark: '#46518f',
          yellow: '#FAD831',
          orange: '#EF7136',
          purple: '#A343BA',
          'off-white': '#FFFDF2',
          'dark-blue': '#1F2D37',
          'blue-gray': '#394150',
        },
      },
    },
  },
  plugins: [
    forms,
    typography
  ],
}