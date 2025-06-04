/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // blue-600
        accent: '#1E40AF',  // blue-800
        background: '#F3F4F6', // gray-100
        text: '#111827',    // gray-900
        teal: {
          500: '#14B8A6',
          600: '#0D9488',
        },
        neutral: '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode support
};