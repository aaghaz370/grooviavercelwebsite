/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'groovia-dark': '#0A0A0F',
        'groovia-purple': '#8B5CF6',
        'groovia-accent': '#C084FC',
        'groovia-card': '#1A1A24',
        'groovia-border': '#2D2D3F',
        'groovia-hover': '#2D1B4E',
      },
      backgroundImage: {
        'groovia-gradient': 'linear-gradient(135deg, #1A1A24 0%, #2D1B4E 50%, #1A1A24 100%)',
        'groovia-text': 'linear-gradient(90deg, #A78BFA 0%, #C084FC 100%)',
      },
      boxShadow: {
        'groovia': '0 8px 32px rgba(139, 92, 246, 0.3)',
        'groovia-lg': '0 12px 48px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
