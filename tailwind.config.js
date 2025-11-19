/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode per UI design spec
  theme: {
    extend: {
      colors: {
        // Custom theme colors can be added here
      },
      spacing: {
        // Custom spacing if needed
      },
    },
  },
  plugins: [],
}
