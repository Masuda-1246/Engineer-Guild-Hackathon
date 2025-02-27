/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#06c9b3',
          50: '#ebfefa',
          100: '#cefcf3',
          200: '#a2f7e9',
          300: '#67edd9',
          400: '#2adac5',
          500: '#06c9b3',
          600: '#039686',
          700: '#07776c',
          800: '#0b5f58',
          900: '#0c4e49',
          950: '#042f2c',
        },
      },
    },
  },
  plugins: [],
};