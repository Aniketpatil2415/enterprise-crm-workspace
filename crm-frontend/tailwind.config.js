/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fusion Byte Signature Deep Blue Theme
        brand: {
          900: '#0B132B', // Deepest background
          800: '#1C2541', // Secondary background
          500: '#3A506B', // Borders and accents
          400: '#5BC0BE', // Highlights
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      backgroundImage: {
        'blue-mesh': 'radial-gradient(at 0% 0%, #1C2541 0px, transparent 50%), radial-gradient(at 100% 100%, #0B132B 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}