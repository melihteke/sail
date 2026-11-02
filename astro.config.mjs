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
  // GitHub Pages caches HTML for 10 minutes while every deploy renames the hashed CSS file, so a cached page
  // would point at a CSS file that no longer exists ("raw HTML"). Inlining the CSS keeps page and styles together.
  build: { inlineStylesheets: "always" },
  integrations: [react(), sitemap({ filter: (page) => !/\/admin\b/.test(page) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
