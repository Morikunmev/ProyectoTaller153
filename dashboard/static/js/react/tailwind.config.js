/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./templates/**/*.html",
    "../../templates/**/*.html", // Para alcanzar templates de Django
  ],
  theme: {
    extend: {
      // Animaciones personalizadas
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": {
            transform: "translateY(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
      // Aquí puedes añadir otras personalizaciones de tema si las necesitas
    },
  },
  plugins: [],
  // Asegurarnos que Tailwind se ejecute en modo JIT (Just-In-Time)
  mode: "jit",
};
