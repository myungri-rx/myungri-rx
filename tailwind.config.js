/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B21A8",
        accent: "#D4AF37",
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
      },
    },
  },
  plugins: [],
};
