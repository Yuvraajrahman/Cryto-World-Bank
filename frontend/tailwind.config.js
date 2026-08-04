import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Channel CSS vars from tokens.css — flip under [data-theme="light"] */
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
        },
        gold: {
          50:  "rgb(var(--gold-50) / <alpha-value>)",
          100: "rgb(var(--gold-100) / <alpha-value>)",
          200: "rgb(var(--gold-200) / <alpha-value>)",
          300: "rgb(var(--gold-300) / <alpha-value>)",
          400: "rgb(var(--gold-400) / <alpha-value>)",
          500: "rgb(var(--gold-500) / <alpha-value>)",
          600: "rgb(var(--gold-600) / <alpha-value>)",
          700: "rgb(var(--gold-700) / <alpha-value>)",
          800: "rgb(var(--gold-800) / <alpha-value>)",
          900: "rgb(var(--gold-900) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "radial-gold":
          "radial-gradient(600px 300px at 50% -10%, rgb(var(--gold-500) / 0.20), transparent 60%)",
        "grid-gold":
          "linear-gradient(rgb(var(--gold-500) / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--gold-500) / 0.08) 1px, transparent 1px)",
        "gold-sheen":
          "linear-gradient(135deg, rgb(var(--gold-100)) 0%, rgb(var(--gold-500)) 40%, rgb(var(--gold-700)) 70%, rgb(var(--gold-100)) 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 0 1px rgb(var(--gold-500) / 0.35), 0 10px 30px -10px rgb(var(--gold-500) / 0.35)",
        "gold-soft": "0 10px 30px -12px rgb(var(--gold-500) / 0.25)",
        "inset-gold": "inset 0 0 0 1px rgb(var(--gold-500) / 0.25)",
        "card": "0 1px 0 rgb(255 255 255 / 0.04) inset, 0 20px 40px -24px rgb(0 0 0 / 0.8)",
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
