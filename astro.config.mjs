// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The deploy workflow passes these from actions/configure-pages, so the build matches where
// GitHub actually serves the site: https://sail.mteke.com (custom domain) or
// https://melihteke.github.io/sail (before the custom domain is configured).
const site = process.env.SITE_ORIGIN || "https://sail.mteke.com";
const base = process.env.SITE_BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
