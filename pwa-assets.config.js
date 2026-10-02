import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the app icons from the logo: `npm run icons`.
// Maskable/Apple icons get padding on the brand navy so Android's circle or
// squircle crop never cuts into the logo.
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.32, resizeOptions: { background: "#1f2a6b" } },
    apple: { ...minimal2023Preset.apple, padding: 0.32, resizeOptions: { background: "#1f2a6b" } },
  },
  images: ["public/favicon.svg"],
});
