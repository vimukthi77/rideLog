/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'lak-dark': '#1B262C',
        'lak-medium': '#0F4C75',
        'lak-blue': '#3282B8',
        'lak-light': '#BBE1FA',
        'lak-green': '#27AE60',
        'lak-warning': '#F39C12',
        'lak-danger': '#E74C3C',
        'lak-muted': '#7F8C8D',
        'lak-border': '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'lak': '0 4px 6px -1px rgba(27, 38, 44, 0.1), 0 2px 4px -1px rgba(27, 38, 44, 0.06)',
        'lak-lg': '0 10px 15px -3px rgba(27, 38, 44, 0.12), 0 4px 6px -2px rgba(27, 38, 44, 0.08)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
