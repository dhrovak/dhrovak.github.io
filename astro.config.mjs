// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://dhrovak.github.io",
  output: "static",
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  build: {
    inlineStylesheets: "always",
  },
});
