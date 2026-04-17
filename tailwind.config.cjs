/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B21A8",
        "primary-light": "#9333EA",
        "primary-glow": "#A855F7",
        accent: "#D4AF37",
        "accent-light": "#E5C76B",
        background: "#0F172A",
        surface: "#1E293B",
        "text-primary": "#F8FAFC",
        "text-secondary": "#CBD5E1",
        ohaeng: {
          wood: "#22C55E",
          fire: "#EF4444",
          earth: "#EAB308",
          metal: "#F8FAFC",
          water: "#3B82F6",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Helvetica Neue",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
        display: [
          "Noto Serif KR",
          "Georgia",
          "serif",
        ],
      },
      keyframes: {
        "moon-glow": {
          "0%, 100%": {
            boxShadow: "0 0 60px 20px rgba(212,175,55,0.15), 0 0 120px 60px rgba(107,33,168,0.1)",
          },
          "50%": {
            boxShadow: "0 0 80px 30px rgba(212,175,55,0.25), 0 0 160px 80px rgba(107,33,168,0.15)",
          },
        },
        "card-flip": {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        "bar-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-width)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "reveal-line": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "expand-polygon": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "moon-glow": "moon-glow 4s ease-in-out infinite",
        "card-flip": "card-flip 0.6s ease-out forwards",
        "bar-fill": "bar-fill 1s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "reveal-line": "reveal-line 0.8s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "twinkle-slow": "twinkle 5s ease-in-out infinite",
        "twinkle-fast": "twinkle 2s ease-in-out infinite",
        "count-up": "count-up 0.5s ease-out forwards",
        "expand-polygon": "expand-polygon 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
