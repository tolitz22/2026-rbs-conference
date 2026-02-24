import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f7efe1",
        sepia: {
          50: "#fbf6ec",
          100: "#f4e9d2",
          700: "#6d4d2e",
          900: "#3c2514"
        }
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "var(--font-playfair)", "serif"],
        body: ["var(--font-playfair)", "serif"]
      },
      boxShadow: {
        soft: "0 8px 25px rgba(77, 52, 28, 0.15)"
      },
      backgroundImage: {
        parchment: "radial-gradient(circle at top, #f9f2e6 0%, #f4e8d3 50%, #efe0c6 100%)"
      }
    }
  },
  plugins: []
};

export default config;
