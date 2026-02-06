/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark1: "#0A0918",
        dark2: "#1A1838",
        dark3: "#252550",
        accentYellow1: "#F5C518",
        accentYellow2: "#FFD93D",
      },
    },
  },
  plugins: [],
}

