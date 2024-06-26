/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const animate = require("tailwindcss-animate")
const forms = require('@tailwindcss/forms')
const typography = require('@tailwindcss/typography')

module.exports = {
  darkMode: ["class"],
  content: [
    '.src/pages/**/*.{js,jsx}',
    '.src/components/**/*.{js,jsx}',
    '.src/app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        swishjam: {
          DEFAULT: '#7487F7',
          light: '#cbd2fc',
          medium: '#95a4ff',
          dark: '#46518f',
          yellow: '#F7E474',
          green: '#6ee7b7',
          orange: '#EF7136',
          pink: '#F774C9',
          red: '#F77487',
          'off-white': '#FFFDF2',
          'dark-blue': '#1F2D37',
          'blue-gray': '#394150',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '4xl': '2rem',
      },
      keyframes: {
        "green-glow": {
          '0%': { boxShadow: '0 0 5px #30bb78, 0 0 10px #30bb78' },
          '50%': { boxShadow: '0 0 15px #30bb78, 0 0 20px #30bb78' },
          '100%': { boxShadow: '0 0 5px #30bb78, 0 0 10px #30bb78' },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'slide-up': {
          from: { transform: 'translate(-50%, 100vh)' },
          to: { transform: 'translate(-50%, -50%)' },
        },
        'slide-down': {
          from: { transform: 'translate(-50%, -50%)' },
          to: { transform: 'translate(-50%, 100vh)' },
        },
      },
      animation: {
        "green-glow": "green-glow 2s infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      extend: {
        'animation': {
          'text': 'text 5s ease infinite',
        },
        'keyframes': {
          'text': {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
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
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        'xxs': '.625rem',
      },
      maxWidth: {
        '2xl': '40rem',
      },
      backgroundImage: theme => ({
        'striped': "repeating-linear-gradient(45deg, rgb(229 231 235), rgb(229 231 235) 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 12px)",
        ...theme.backgroundImage,
      }),
    },
  },
  plugins: [
    animate,
    forms,
    typography
  ],
}