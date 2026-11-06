# ⛵ sail.mteke.com: Melih's Sailing

A sailing logbook built with **Astro + React islands + Tailwind v4 + shadcn/ui**, deployed to **GitHub Pages** at
[https://sail.mteke.com](https://sail.mteke.com). The public site is static; **Supabase** stores the sails, boats and
media and handles the Google login of the admin panel.

**Public site**

- **Logbook:** one page per sail.
  - Speed-coloured track on OpenStreetMap + OpenSeaMap.
  - **Strava-style replay:** play/pause, 1×–60×, and a live readout of speed, course, wind, point of sail and tack.
  - Speed chart, linked to the map.
  - Hourly wind during the sail (Open-Meteo).
  - Tack/gybe count and time on each point of sail.
  - Story: *How it went · What I practised · Learnings · Notes*.
  - Gallery of photos, videos, YouTube videos and links.
  - GPX download.
- **Home:**
  - Career stats and the activity heatmap.
  - **Live wind** for a place you pick in the admin (address search), a **3-day sailing forecast** with a rough
    go/no-go for small boats, sunrise and sunset.
  - **Sea now:** waves, sea temperature and tide (Open-Meteo Marine).
  - The Windy.com wind map of the Netherlands and an animated **rain radar** (RainViewer).
  - Latest sails as route-map cards.
- **Boats** (`/boats`, `/boats/<slug>`): photo, specs, description and miles logged on each boat.
- **Records** (`/records`): top speed, longest, windiest, most manoeuvres, totals.
- **About** (`/about`).
- **Sailing Academy** (`/academy/`): public, interactive training modules (route & passage planning, buoys and lights,
  COLREG, man overboard, sail trim, race). Source in `src/academy` (ported from the
  sail-games project), mounted as one React island with hash routes.
  - **Race** (`#/race`): a windward-leeward course (committee boat, pin, 1, offset 1a, gate 4S/4P, finish) on real
    lakes, raced against the clock with shifting wind and puffs. Anonymous players enter a name; the browser sends
    only the helm commands and `race_submit` re-sails the race in Postgres (`supabase/migrations/0003_race.sql`,
    the twin of `src/academy/games/race/sim.ts`) before it goes on the course's top-30 scoreboard. Courses are built
    from OpenStreetMap water polygons by `npx tsx scripts/make-race-courses.ts` (writes `courses.json` and
    `0004_race_courses.sql`). The admin **Races** tab opens/closes courses, picks the current one, deletes entries and
    adds scores.
  - **Sextant & celestial navigation** (`#/sextant`): a plain-language "start here", a 3D sextant (three.js, loaded
    only on that tab), a guided noon sight from index error to a fix on the map, an almanac guide, terms & units,
    other methods with an intercept calculator, and photo credits (Wikimedia Commons, files in
    `public/academy/sextant`). Sun almanac values are computed in `src/academy/games/sextant/almanac.ts`.
- **Languages:** English (default), Dutch and Turkish via the flag switcher. Site chrome uses `data-i18n` keys from
  `src/i18n/site.ts`; the academy has full dictionaries in `src/academy/i18n`. Choice is kept in `localStorage.lang`.
- **Copy deterrent:** right-click, copy and text selection are blocked on public pages (not on `/admin`). It's
  client-side only, so it discourages casual copying but can't fully prevent it.
- **SEO / feeds:** RSS feed of new sails (`/rss.xml`), sitemap, `robots.txt`, OpenGraph/Twitter cards (default image
  `public/og.png`, map or cover per sail) and schema.org data (WebSite, BlogPosting, Person).
- Dark mode, mobile menu.

**Admin panel** (`/admin/`, Google login, only `melihteke@gmail.com`)

- **New sail:** drop a GPX file (Upwind, Strava, Garmin…).
  - Stats, map, wind and the tack/gybe analysis are worked out in the browser.
  - Title, date, location and boat are suggested.
- **Editor:** basics, the four story sections (Markdown with preview), boat picker, autosave, publish/unpublish.
- **Media:**
  - Photos: iPhone HEIC/JPG/PNG are converted to JPG, resized, and EXIF/GPS is stripped.
  - Short videos: up to 50 MB, with a poster frame.
  - YouTube links and other links.
  - Captions, ordering and a cover pick.
- **Boats:** add/edit boats, photo with credit, specs table, main boat.
- **Settings:** live wind and sea locations (address autocomplete). Changes show on the site without a deploy.
- **Deploy site:** rebuilds the static site through the `publish` edge function (about 2 minutes) and shows
  whether the latest changes are live.

## Set up

See **[docs/SETUP.md](docs/SETUP.md)**: Supabase project and SQL, Google login, the deploy edge function, GitHub
variables, and importing the existing Markdown logbook. Without the Supabase variables the site still builds
from the legacy Markdown content in `src/content/sails`.

Adding a sail day to day (Turkish): **[ADDING-A-SAIL.md](ADDING-A-SAIL.md)**.

## Project layout

```
supabase/migrations/0001_schema.sql  tables, row level security, storage buckets, admin list
supabase/functions/publish/          edge function: admin check → GitHub workflow_dispatch
supabase/tests/rls.test.ts           runs the migration in PGlite and tests the security rules
src/lib/sails.ts                     build-time data layer (Supabase, or the Markdown fallback)
src/lib/gpx.ts · analysis.ts · wind.ts   GPX stats, tack/gybe + point-of-sail analysis, Open-Meteo wind
src/lib/admin-api.ts · media-process.ts  admin CRUD, uploads, in-browser photo/video processing
src/components/admin/                admin panel (React)
src/components/SailTrack.tsx         track map, replay and speed chart
scripts/make-maps.ts                 route-map thumbnails for the cards (runs before every build)
scripts/migrate-to-supabase.ts       one-off import of the Markdown logbook
```

## Develop

```powershell
Copy-Item .env.example .env   # PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY (optional)
npm install
npm run dev      # http://localhost:4321 (admin: /admin/)
npm test         # vitest: RLS rules (PGlite), analysis, parsers
npm run build    # route maps + astro check + static build into dist/
```

Pushing to `main` runs the tests and deploys. The admin panel's **Deploy site** button runs the same workflow.

## Hosting: GitHub Pages + Cloudflare

- GitHub → repo → **Settings → Pages**: *Source* = **GitHub Actions**, custom domain `sail.mteke.com`
  (also in `public/CNAME`), **Enforce HTTPS**.
- Cloudflare DNS: `CNAME sail → melihteke.github.io`, **DNS only** (grey cloud).
- The workflow reads the serving path from `actions/configure-pages`, so the build also works on
  `melihteke.github.io/sail/`. CSS is inlined into every page, so a cached page never points at an old stylesheet.

## Data sources & credits

- Wind: [Open-Meteo](https://open-meteo.com/) (historical forecast / ERA5 archive, CC BY 4.0)
- Wind map: [Windy.com](https://www.windy.com/) embed widget (logo must stay visible and clickable; personal, non-commercial use)
- Sea: [Open-Meteo Marine](https://open-meteo.com/en/docs/marine-weather-api) · Rain radar: [RainViewer](https://www.rainviewer.com/) · Address search: [Photon](https://photon.komoot.io/) (OpenStreetMap)
- Maps: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, seamarks © [OpenSeaMap](https://www.openseamap.org)
- Boat photo: [Arjuno3, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sailing_on_the_Zijl_in_Leiden,_Netherlands-P3190020.jpg), CC BY-SA 4.0
- Activity heatmap component adapted from the CCgather team's shadcn `ActivityHeatmap`.

## Ideas for later

- Wind rose of sailed conditions; VMG / upwind performance per sail
- RSS feed and a yearly "year in review" page
- Export the replay as a video (MP4/GIF)
- Geotagged photos pinned on the route; privacy trim of track start/end
- Water level and current (Rijkswaterstaat) for coastal sails
