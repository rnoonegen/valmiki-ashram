/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#dce8da',
          muted: '#c5d4c2',
          foreground: '#1a3d24',
        },
        secondary: {
          DEFAULT: '#f5efe6',
          muted: '#ebe3d6',
        },
        accent: {
          DEFAULT: '#1e4d2b',
          light: '#2d6b3c',
          muted: '#4a7c59',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        nav: '0 4px 24px rgba(30, 77, 43, 0.08)',
        'nav-dark': '0 4px 24px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
