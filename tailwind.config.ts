import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from design
        primary: {
          pink: "#F98B9E",
          purple: "#A594F9",
          blue: "#4FC3DC",
          mint: "#5ECFCF",
        },
        // Brand colors from EMBEAU logo
        brand: {
          red: "#E94D4D",
          orange: "#F5A623",
          yellow: "#F5D547",
          green: "#4CAF50",
          mint: "#4DD0C9",
          blue: "#4A90D9",
          purple: "#9B59B6",
        },
        // Neutral colors
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        // Semantic colors
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
        // Background gradient colors
        sky: {
          light: "#E8F4FC",
          DEFAULT: "#C5E5F7",
        },
      },
      fontFamily: {
        sans: [
          "GmarketSans",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-1": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-2": ["2rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-1": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-2": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-1": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-2": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
        button: "0 2px 4px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [],
};

export default config;
