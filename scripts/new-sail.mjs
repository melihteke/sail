#!/usr/bin/env node
// Scaffold a new logbook entry from a GPX file:
//   npm run new-sail -- path/to/Activity.gpx ["Optional title"]
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const [gpxPath, titleArg] = process.argv.slice(2);
if (!gpxPath || !existsSync(gpxPath)) {
  console.error('Usage: npm run new-sail -- <file.gpx> ["Title"]');
  process.exit(1);
}

const xml = readFileSync(gpxPath, "utf8");
const firstTime = xml.match(/<trkpt[\s\S]*?<time>([^<]+)<\/time>/)?.[1];
if (!firstTime) {
  console.error("Could not find a timestamped track point in the GPX file.");
  process.exit(1);
}
const trackName = xml.match(/<trk>\s*<name>([^<]+)<\/name>/)?.[1]?.trim();
const title = titleArg || trackName || basename(gpxPath, ".gpx").replace(/[_-]+/g, " ");
const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(firstTime));
const slugBase = title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");
const slug = `${date}-${slugBase || "sail"}`;
const dir = join("src", "content", "sails", slug);

if (existsSync(dir)) {
  console.error(`Entry already exists: ${dir}`);
  process.exit(1);
}
mkdirSync(join(dir, "photos"), { recursive: true });
copyFileSync(gpxPath, join(dir, "track.gpx"));
writeFileSync(
  join(dir, "index.md"),
  `---
title: ${JSON.stringify(title)}
date: ${date}
gpx: track.gpx
location: Grote Poel, Amsterdamse Bos
summary: One-line summary of the sail.
boat: Polyvalk
crew: []
role: helm # skipper | helm | crew | trimmer | student
rating: 3 # 1-5
sails: Main + jib
reef: false
tags: []
# cover: ./photos/01.jpg
# photos:
#   - src: ./photos/01.jpg
#     caption: Leaving the jetty
draft: true
---

## How it went

## What I practised

## Learnings
`,
);
console.log(`Created ${dir}\n- Edit index.md (set draft: false to publish)\n- Put photos in ${join(dir, "photos")}`);
