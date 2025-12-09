/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#F5F7FA",
          100: "#EBEEF2",
          200: "#D8DEE6",
          300: "#C5CCD3",
          400: "#A6AEB8",
          500: "#87909C",
          600: "#6C7581",
          700: "#535C69",
          800: "#3B444F",
          900: "#252C35",
        },
        accent: {
          50: "#F3F7FA",
          100: "#E1EEF9",
          200: "#BDD9F2",
          300: "#99C4EA",
          400: "#72AADD",
          500: "#4D91D0",
          600: "#3A74B0",
          700: "#2B5888",
          800: "#1D3C60",
          900: "#11243C",
        },
        sage: {
          50: "#F5F7F4",
          100: "#E6EBE5",
          200: "#CBD7CC",
          300: "#AFC2B3",
          400: "#8CA691",
          500: "#6A8970",
          600: "#527059",
          700: "#3C5642",
          800: "#29402E",
          900: "#182419",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}