/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a1a',
        ember: '#b22222',
        orange: '#ff4500',
        warm: '#ff8c00',
      },
    },
  },
  plugins: [],
};
