/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#1e40af",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#f87171",
        },
        info: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
        },
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
}

