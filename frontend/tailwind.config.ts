import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "sans-serif"]
      },
      colors: {
        brand: {
          deep: "#0f2d46",
          sunrise: "#ff7a59",
          mint: "#19a78c",
          sand: "#f8f4eb"
        }
      },
      boxShadow: {
        panel: "0 30px 80px -35px rgba(15, 45, 70, 0.35)",
        soft: "0 10px 35px -20px rgba(15, 45, 70, 0.4)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        reveal: "reveal 500ms ease-out both"
      }
    }
  },
  plugins: []
} satisfies Config;
