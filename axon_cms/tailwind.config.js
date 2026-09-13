// tailwind.config.js

module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // Add other directories if needed
  ],
  theme: {
    extend: {
      screens: {
        xxl: "1700px",
      },
      colors: {
        theme: "var(--theme)",
        "theme-dark": "var(--theme-dark)",
        themelite: "var(--themelite)",
        themes: "var(--themes)",
        brand: {
          DEFAULT: "#3a8ee6",
          dark: "#2d7fd4",
          light: "#edf5fc",
        },
        warning: {
          DEFAULT: "var(--warning)",
          dark: "var(--warning-dark)",
          light: "var(--warning-light)",
        },
        success: {
          DEFAULT: "var(--success)",
          dark: "var(--success-dark)",
          light: "var(--success-light)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          dark: "var(--danger-dark)",
          light: "var(--danger-light)",
        },
        white: "#ffffff",
        black: "#3d4349",
        bggray: "#f7f8fa",
        themelight: "#edf5fc",
        themedark: "#2d7fd4",
        darkgray: "#6b7280",
        themetransparent: "#edf5fc",
        surface: "var(--surface)",
        border: "var(--border)",
      },
      spacing: {
        80: "20rem",
        260: "65rem",
      },
      borderRadius: {
        xl: "1rem",
      },
      spacing: {
        "5%": "5%",
      },
    },
  },
  plugins: [],
};
