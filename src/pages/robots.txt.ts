import type { APIRoute } from "astro";
import { url } from "@/lib/url";

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nDisallow: ${url("/admin/")}\n\nSitemap: ${new URL(url("/sitemap-index.xml"), site)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
