import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
      photos: z.array(z.object({ src: image(), caption: z.string().optional() })).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { sails };
