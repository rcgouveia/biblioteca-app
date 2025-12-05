/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "book-cover": "#5A3825",
        "book-cover-dark": "#3C2416",
        "book-spine": "#4C2D1B",
        "book-pages": "#F3E9D7",
        "book-page-edge": "#E8DCC5",
        parchment: "#F9F3E7",
        primary: "#3B3025",
        secondary: "#EFE6D9",
      },
    },
  },
  plugins: [],
};
