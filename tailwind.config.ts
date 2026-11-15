import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#fbf5ea",
          deep: "#f3e7d5",
        },
        ink: {
          DEFAULT: "#211610",
          soft: "#3a2a20",
        },
        muted: "#756253",
        line: "#e6d6c2",
        tomato: {
          DEFAULT: "#cf4a20",
          deep: "#a83a16",
          soft: "#f8e3d8",
        },
        butter: {
          DEFAULT: "#f1bf57",
          soft: "#faedcb",
        },
        olive: {
          DEFAULT: "#5c693f",
          soft: "#e8edda",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(32 22 17 / 0.04), 0 14px 36px -18px rgb(32 22 17 / 0.24)",
        lift: "0 2px 4px rgb(32 22 17 / 0.05), 0 28px 70px -28px rgb(32 22 17 / 0.38)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
