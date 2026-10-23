# ⛵ sail.mteke.com: Melih's Sailing Logbook

A static sailing logbook built with **Astro + React islands + Tailwind v4 + shadcn/ui**, deployed to
**GitHub Pages** at <https://sail.mteke.com>.

- **Logbook:** one page per sail with a speed-coloured track (OpenStreetMap + OpenSeaMap seamarks),
  a speed-over-ground chart linked to the map, distance/time/avg/max SOG, notes and photos.
- **Wind:** the real hourly wind during each sail (Open-Meteo, cached in `src/data/wind-cache.json`)
  plus a **live wind** widget on the home page.
- **Activity heatmap** of nautical miles per day (calendar / weekdays / months views).
- **Boat page** with Polyvalk Classic specs.
- Career stats, dark mode, GPX download, sitemap.

## Add a sail

1. Export the GPX (e.g. Strava → activity → ⋯ → *Export GPX*).
2. Scaffold the entry:

   ```powershell
   npm run new-sail -- "C:\path\to\Morning_Sail.gpx" "Windy afternoon on the Poel"
   ```

   This creates `src/content/sails/<date>-<slug>/` with `index.md` and `track.gpx`.
3. Edit `index.md`: summary, crew, role, rating, sails/reef, tags and the story. Set
   **`draft: false`** to publish (drafts are visible in `npm run dev` only).
4. Photos: put JPGs in the entry's `photos/` folder and list them:

   ```yaml
   cover: ./photos/01.jpg
   photos:
     - src: ./photos/01.jpg
       caption: Leaving the jetty
   ```

   Images are resized and re-encoded at build time (which also strips EXIF/GPS metadata).
5. Run `npm run build` once locally so the wind for the new sail is cached, then commit and push.
   GitHub Actions deploys automatically.

### Frontmatter reference

| Field | Type | Notes |
| --- | --- | --- |
| `title`, `summary`, `location` | string | required |
| `date` | YYYY-MM-DD | local date; exact times come from the GPX |
| `gpx` | string | defaults to `track.gpx` |
| `boat` | string | defaults to `Polyvalk` |
| `crew` | string[] | |
| `role` | `skipper` · `helm` · `crew` · `trimmer` · `student` | |
| `rating` | 1–5 | |
| `sails`, `reef` | string, boolean | e.g. `Main + jib`, `true` |
| `tags` | string[] | |
| `cover`, `photos` | image paths | relative to the entry folder |
| `draft` | boolean | hidden from production builds |

## Boat details

Edit [`src/data/boat.ts`](src/data/boat.ts): sail number, home water, description and specs. To show
your own photo, save it as `src/assets/boat/polyvalk.jpg` and uncomment the import at the top of the file.

Site-wide settings (title, home water coordinates for live wind, time zone) are in
[`src/config.ts`](src/config.ts).

## Develop

```powershell
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build into dist/
npm run preview
```

## Deploy: GitHub Pages + Cloudflare (one-time setup)

1. **Create the repo** `melihteke/sail` on GitHub (empty, no README) and push:

   ```powershell
   git remote add origin https://github.com/melihteke/sail.git
   git push -u origin main
   ```

2. **GitHub → repo → Settings → Pages**: *Source* = **GitHub Actions**. The workflow in
   `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
3. **Cloudflare → mteke.com → DNS → Add record**:

   | Type | Name | Target | Proxy |
   | --- | --- | --- | --- |
   | CNAME | `sail` | `melihteke.github.io` | **DNS only** (grey cloud) |

   Keep it *DNS only* so GitHub can issue the Let's Encrypt certificate. If you enable the orange
   cloud later, set Cloudflare SSL/TLS mode to **Full (strict)**.
4. **GitHub → repo → Settings → Pages → Custom domain**: `sail.mteke.com` (also stored in
   `public/CNAME`). After the DNS check passes, tick **Enforce HTTPS**.
5. Recommended: **GitHub → your profile Settings → Pages → Add a verified domain** → `mteke.com`
   and add the TXT record it shows in Cloudflare. This prevents subdomain takeover.

## Data sources & credits

- Wind: [Open-Meteo](https://open-meteo.com/) (historical forecast / ERA5 archive, CC BY 4.0)
- Maps: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, seamarks © [OpenSeaMap](https://www.openseamap.org)
- Activity heatmap component adapted from the CCgather team's shadcn `ActivityHeatmap`.

## Roadmap (v2 ideas)

- "Everywhere I've sailed": all tracks on one map
- Wind rose of sailed conditions and points-of-sail breakdown
- Tack/gybe detection and VMG / upwind performance per sail
- Learnings section: knots, manoeuvres, theory and skill progression
- RSS feed and auto-generated OpenGraph map cards
- Geotagged photos pinned on the route; privacy trim of track start/end
- Water level and current (Rijkswaterstaat) for coastal sails
