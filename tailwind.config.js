const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: 'class', // use 'media' if system-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', ...fontFamily.sans],
        inter: ['Inter'],
        interMedium: ['InterMedium'],
        interBold: ['InterBold'],
      },
      colors: {
        primary: '#6A0DAD',
        background: '#FFFFFF',
        text: '#000000',
        dark: {
          background: '#000000',
          text: '#FFFFFF',
        },
        light: {
          background: '#FFFFFF',
          text: '#000000',
        },
      },
    },
  },
  plugins: [],
};
