/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        violeta: {
          100: "#F3E8FF",
          300: "#C084FC",
          500: "#9B5DE5",
          700: "#7A1FA2",
          900: "#4A0072"
        }
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
