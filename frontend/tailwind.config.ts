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
        // M3 surface tokens
        surface: {
          DEFAULT: "#f9f9f9",
          dim: "#dadada",
          bright: "#f9f9f9",
          container: "#eeeeee",
          "container-low": "#f3f3f3",
          "container-high": "#e8e8e8",
          "container-highest": "#e2e2e2",
          "container-lowest": "#ffffff",
        },
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",
          fixed: "#dbe1ff",
          "fixed-dim": "#b4c5ff",
        },
        "on-primary": "#ffffff",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#434655",
        "on-primary-container": "#eeefff",
        tertiary: {
          DEFAULT: "#6a1edb",
          container: "#8343f4",
          fixed: "#eaddff",
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#c3c6d7",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        label: ["Space Grotesk", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        "os-glow": "0 0 12px var(--os-glow)",
        "blue-glow": "0 4px 12px rgba(37, 99, 235, 0.2)",
      },
      animation: {
        "os-pulse": "osPulse 2s ease-in-out infinite",
        "live-pulse": "livePulse 2s ease-in-out infinite",
      },
      keyframes: {
        osPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
