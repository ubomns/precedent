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
        body: "var(--text-body)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "2rem",
        "card-inner": "calc(2rem - 0.375rem)",
      },
      keyframes: {
        softPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.92)" },
        },
        screenEnter: {
          "0%": { opacity: "0", transform: "translateY(8px)", filter: "blur(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
      },
      animation: {
        "soft-pulse": "softPulse 2.4s ease-in-out infinite",
        "screen-enter": "screenEnter .55s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
};
