/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070d",
          900: "#080b14",
          850: "#0a0e18",
          800: "#0d1220",
          700: "#131a2c",
          600: "#1a2338",
          500: "#232e48",
          400: "#334063",
        },
        cyan: {
          glow: "#5eead4",
        },
        accent: {
          client: "#38bdf8",
          server: "#a78bfa",
          legit: "#34d399",
          flag: "#f87171",
          warn: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,234,212,0.08), 0 0 24px -6px rgba(94,234,212,0.25)",
        "glow-client": "0 0 0 1px rgba(56,189,248,0.12), 0 0 28px -8px rgba(56,189,248,0.35)",
        "glow-server": "0 0 0 1px rgba(167,139,250,0.12), 0 0 28px -8px rgba(167,139,250,0.35)",
        "glow-flag": "0 0 0 1px rgba(248,113,113,0.15), 0 0 28px -6px rgba(248,113,113,0.4)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      keyframes: {
        "packet-move": {
          "0%": { left: "0%", opacity: "0" },
          "8%": { opacity: "1" },
          "92%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.9" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "packet-move": "packet-move 2.6s ease-in-out forwards",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.2,0.6,0.4,1) infinite",
        "fade-in": "fade-in 0.25s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer: "shimmer 2.4s linear infinite",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
