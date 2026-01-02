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
      backgroundColor: {
        base: "var(--background)",
        secondary: "var(--background-secondary)",
        tertiary: "var(--background-tertiary)",
      },
      textColor: {
        base: "var(--foreground)",
        secondary: "var(--foreground-secondary)",
        tertiary: "var(--foreground-tertiary)",
      },
      borderColor: {
        base: "var(--border-color)",
        light: "var(--border-color-light)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
    },
  },
  plugins: [],
}
