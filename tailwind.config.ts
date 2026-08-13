import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        pearl: "var(--color-pearl)",
        porcelain: "var(--color-porcelain)",
        ivory: "var(--color-ivory)",
        frost: "var(--color-frost)",
        silver: "var(--color-soft-silver)",
        mist: {
          blue: "var(--color-mist-blue)",
          cyan: "var(--color-pale-cyan)",
          lavender: "var(--color-lavender-mist)",
          blush: "var(--color-blush)",
          mint: "var(--color-soft-mint)",
          champagne: "var(--color-champagne)"
        },
        memory: {
          electric: "var(--color-memory-electric)",
          accessible: "var(--color-memory-accessible)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-interface)", "sans-serif"]
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        focus: "var(--shadow-focus)"
      },
      keyframes: {
        "slow-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(18px, -14px, 0) scale(1.03)" }
        },
        "fine-shimmer": {
          "0%, 100%": { opacity: "0.18", transform: "translateX(-8%)" },
          "50%": { opacity: "0.34", transform: "translateX(8%)" }
        }
      },
      animation: {
        "slow-drift": "slow-drift var(--motion-ambient-slow) ease-in-out infinite",
        "fine-shimmer": "fine-shimmer var(--motion-ambient-slower) ease-in-out infinite"
      }
    },
  },
  plugins: [],
};

export default config;
