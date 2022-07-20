/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{mustache,html}", "./src/*.{mustache,html}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
  ],
}
