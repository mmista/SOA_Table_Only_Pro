/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'header-dark-blue': 'rgb(31 41 54)',
      },
    },
  },
  plugins: [],
};
