/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./templates/**/*.html",
    "../../templates/**/*.html",  // Para alcanzar templates de Django
  ],
  theme: {
    extend: {
      // Aquí puedes añadir personalizaciones de tema si las necesitas
    },
  },
  plugins: [],
  // Asegurarnos que Tailwind se ejecute en modo JIT (Just-In-Time)
  mode: 'jit',
}