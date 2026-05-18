/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        aura: {
          50: "#fbf7ff",
          100: "#f3eafe",
          200: "#e7d7fb",
          300: "#d3b7f5",
          400: "#b984ea",
          500: "#9f5ed8",
          600: "#843fc0",
          700: "#6a309c",
          800: "#512777",
          900: "#32194b",
        },
        blush: {
          50: "#fff7f9",
          100: "#ffe8ee",
          200: "#ffcfdc",
          300: "#fba8be",
          400: "#ef7599",
          500: "#dc4d7b",
        },
        sage: {
          50: "#f2fbf7",
          100: "#ddf4ea",
          500: "#3aa879",
          700: "#1f7856",
        },
        ink: {
          900: "#16111f",
          800: "#241c2f",
          700: "#393044",
          600: "#5c5269",
        },
      },
      boxShadow: {
        soft: "0 24px 80px -40px rgba(50, 25, 75, 0.35)",
        card: "0 16px 45px -35px rgba(22, 17, 31, 0.45)",
      },
    },
  },
  plugins: [],
};
