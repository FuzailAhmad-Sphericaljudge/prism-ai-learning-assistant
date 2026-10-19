import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#07080D",
        surface: {
          DEFAULT: "#0E1018",
          glass: "rgba(14, 16, 24, 0.75)",
          card: "rgba(14, 16, 24, 0.85)",
          light: "#161926",
          elevated: "#1D2133",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
          glow: "rgba(139, 92, 246, 0.3)",
          highlight: "rgba(255, 255, 255, 0.16)",
        },
        prism: {
          cyan: "#22D3EE",
          violet: "#8B5CF6",
          pink: "#F472B6",
          amber: "#FBBF24",
        },
        foreground: {
          DEFAULT: "#F1F5F9",
          muted: "#94A3B8",
          subtle: "#64748B",
          dark: "#0F172A",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "14px",
        sm: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "prism-gradient":
          "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 35%, #F472B6 70%, #FBBF24 100%)",
        "prism-gradient-subtle":
          "linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(139,92,246,0.15) 35%, rgba(244,114,182,0.15) 70%, rgba(251,191,36,0.15) 100%)",
        "radial-prism":
          "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22) 0%, rgba(34, 211, 238, 0.12) 30%, rgba(7, 8, 13, 0) 70%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "prism-glow":
          "0 0 25px -5px rgba(139, 92, 246, 0.35), 0 0 15px -5px rgba(34, 211, 238, 0.25)",
        "prism-cyan": "0 0 20px -3px rgba(34, 211, 238, 0.4)",
        "prism-violet": "0 0 20px -3px rgba(139, 92, 246, 0.4)",
        "prism-pink": "0 0 20px -3px rgba(244, 114, 182, 0.4)",
        "prism-amber": "0 0 20px -3px rgba(251, 191, 36, 0.4)",
      },
      animation: {
        "gradient-shift": "gradientShift 8s ease infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 6s linear infinite",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        borderGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
