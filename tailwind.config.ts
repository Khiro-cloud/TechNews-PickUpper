import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#f6f1e8",
        accent: "#0f766e",
        accentSoft: "#d7f3ef",
      },
      boxShadow: {
        card: "0 14px 30px rgba(20, 20, 20, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
