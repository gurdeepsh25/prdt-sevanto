import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e8edff",
          500: "#3b5bdb",
          600: "#2f4cc7",
          700: "#253a99",
        },
      },
    },
  },
  plugins: [],
};

export default config;
