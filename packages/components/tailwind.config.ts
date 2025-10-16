import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
