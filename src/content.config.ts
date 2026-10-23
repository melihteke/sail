import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { parseYouTube } from "./lib/youtube";

const youtubeEntry = z
  .union([z.string(), z.object({ url: z.string(), caption: z.string().optional() })])
  .transform((value, ctx) => {
    const { url, caption } = typeof value === "string" ? { url: value, caption: undefined } : value;
    const video = parseYouTube(url, caption);
    if (!video) {
      ctx.addIssue({ code: "custom", message: `Not a valid YouTube link: ${url}` });
      return z.NEVER;
    }
    return video;
  });

const sails = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/sails" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Local date of the sail (YYYY-MM-DD). The GPX supplies exact times. */
      date: z.coerce.date(),
      gpx: z.string().default("track.gpx"),
      location: z.string(),
      summary: z.string(),
      boat: z.string().default("Polyvalk"),
      crew: z.array(z.string()).default([]),
      role: z.enum(["skipper", "helm", "crew", "trimmer", "student"]).default("helm"),
      rating: z.number().int().min(1).max(5).default(3),
      sails: z.string().optional(),
      reef: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      /** Optional captions keyed by media file name, e.g. { "01-img-1234.jpg": "Leaving the jetty" } */
      captions: z.record(z.string(), z.string()).default({}),
      /** Optional YouTube videos: plain links, or { url, caption } */
      youtube: z.array(youtubeEntry).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { sails };
