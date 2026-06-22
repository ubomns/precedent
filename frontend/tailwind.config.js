/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--fg)",
        ground: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        body: "var(--text-body)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        accent: "var(--accent)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        overlay: "var(--overlay-weak)",
        "overlay-strong": "var(--overlay-strong)",
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        card: "var(--radius-card)",
        "card-lg": "var(--radius-card-lg)",
        "card-inner": "calc(var(--radius-card) - 0.375rem)",
        pill: "var(--radius-pill)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      fontSize: {
        display: [
          "var(--text-display)",
          { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "600" },
        ],
        h1: [
          "var(--text-h1)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h2: [
          "var(--text-h2)",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        h3: [
          "var(--text-h3)",
          { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        "body-lg": [
          "var(--text-body-lg)",
          { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" },
        ],
        body: [
          "var(--text-body)",
          { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" },
        ],
        "body-sm": [
          "var(--text-body-sm)",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" },
        ],
        caption: [
          "var(--text-caption)",
          { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "500" },
        ],
        eyebrow: [
          "var(--text-eyebrow)",
          { lineHeight: "1.2", letterSpacing: "0.18em", fontWeight: "600" },
        ],
        mono: [
          "var(--text-mono)",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" },
        ],
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        softPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.92)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
      animation: {
        "soft-pulse": "softPulse 2.4s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
