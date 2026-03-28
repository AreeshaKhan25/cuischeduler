import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          hover: "var(--bg-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          blue: "var(--accent-blue)",
          "blue-soft": "var(--accent-blue-soft)",
          teal: "var(--accent-teal)",
          "teal-soft": "var(--accent-teal-soft)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        os: {
          bg: "var(--os-bg)",
          border: "var(--os-border)",
          text: "var(--os-text)",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "os-glow": "0 0 12px var(--os-glow)",
        "os-glow-lg": "0 0 20px var(--os-glow)",
        "blue-glow": "0 0 12px rgba(79, 142, 247, 0.25)",
        "teal-glow": "0 0 12px rgba(45, 212, 191, 0.25)",
        "success-glow": "0 0 12px rgba(34, 197, 94, 0.25)",
        "warning-glow": "0 0 12px rgba(245, 158, 11, 0.25)",
        "danger-glow": "0 0 12px rgba(239, 68, 68, 0.25)",
      },
      animation: {
        "os-pulse": "osPulse 2s ease-in-out infinite",
        "live-pulse": "livePulse 2s ease-in-out infinite",
        "glow-hover": "glowHover 0.3s ease forwards",
      },
      keyframes: {
        osPulse: {
          "0%, 100%": { boxShadow: "0 0 8px var(--os-glow)" },
          "50%": { boxShadow: "0 0 20px var(--os-glow)" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        glowHover: {
          "0%": { boxShadow: "0 0 0px transparent" },
          "100%": { boxShadow: "0 0 16px var(--accent-blue)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
