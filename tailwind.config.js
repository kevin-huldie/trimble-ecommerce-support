/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trimble: {
          blue: '#0063A3',       // Modus Primary Blue
          blueHover: '#004B7A',  // Hover State
          iceBlue: '#E5F1F8',    // Badge & Lens Backgrounds
          charcoal: '#121212',  // High-Contrast Primary Text
          subtext: '#5B63A3',   // Muted Text
          border: '#CBCDD6',    // Card/Table Borders
          grayBg: '#F1F1F6',    // Card/Banner Neutral Background
          danger: '#DA212C',    // Modus Red (Bounced / Inline Errors)
          dangerBg: '#FDF2F2',  // Error Chip Background
          success: '#056A36',   // Modus Green (Delivered)
          warning: '#E06D00',   // Modus Amber (Deferred)
        }
      }
    },
  },
  plugins: [],
}
