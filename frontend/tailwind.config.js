import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#060606",
          900: "#0a0a0b",
          800: "#101013",
          700: "#16171b",
          600: "#1c1d22",
          500: "#2a2b31",
          400: "#3a3b42",
          300: "#5a5b63",
          200: "#8a8b93",
          100: "#c8c9d1",
        },
        gold: {
          50:  "#fff8e1",
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#ffca28",
          500: "#d4af37",
          600: "#c69c2a",
          700: "#a6801f",
          800: "#7a5c13",
          900: "#4d3a0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "radial-gold":
          "radial-gradient(600px 300px at 50% -10%, rgba(212,175,55,0.20), transparent 60%)",
        "grid-gold":
          "linear-gradient(rgba(212,175,55,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.08) 1px, transparent 1px)",
        "gold-sheen":
          "linear-gradient(135deg, #fff4c4 0%, #d4af37 40%, #a6801f 70%, #fff4c4 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 0 1px rgba(212,175,55,0.35), 0 10px 30px -10px rgba(212,175,55,0.35)",
        "gold-soft": "0 10px 30px -12px rgba(212,175,55,0.25)",
        "inset-gold": "inset 0 0 0 1px rgba(212,175,55,0.25)",
        "card": "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};
