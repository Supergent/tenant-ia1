import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/design-tokens/tailwind.preset";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
};

export default config;
