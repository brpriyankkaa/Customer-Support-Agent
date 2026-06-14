/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'sans-serif'],
      },
      colors: {
        capgemini: {
          blue:      '#0070AD',
          darkblue:  '#1565C0',
          navy:      '#1155a8',
          teal:      '#00C8C8',
          text:      '#333333',
          border:    '#e0e0e0',
          pagebg:    '#e8e8e8',
          disabled:  '#d4d4d4',
        },
      },
    },
  },
  plugins: [],
}
