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
  - **Race** (`#/race`): 12 real courses (Dutch lakes, Garda, Marmaris, Bodrum, Cowes, Kiel, Porto Cervo, Sydney),
    either windward-leeward (committee boat, pin, 1, offset 1a, gate 4S/4P, finish) or triangle (1, 2, 3, finish),
    raced against the clock with shifting wind and puffs. Anonymous players enter a name; the browser sends
    only the helm commands and `race_submit` re-sails the race in Postgres (`supabase/migrations/0003_race.sql`,
    the twin of `src/academy/games/race/sim.ts`) before it goes on the course's top-30 scoreboard. Courses are built
    from OpenStreetMap water polygons (lakes) or a land/water grid classified from OSM map tiles (sea areas, stored
    as a bit mask the server also checks) by `npx tsx scripts/make-race-courses.ts` (writes `courses.json` and
    `0004_race_courses.sql`). The admin **Races** tab opens/closes courses, picks the current one, deletes entries and
    adds scores.
  - **Sextant & celestial navigation** (`#/sextant`): a plain-language "start here", a 3D sextant (three.js, loaded
    only on that tab), a guided noon sight from index error to a fix on the map, an almanac guide, terms & units,
    other methods with an intercept calculator, and photo credits (Wikimedia Commons, files in
    `public/academy/sextant`). Sun almanac values are computed in `src/academy/games/sextant/almanac.ts`.
  - **RYA courses** (`#/rya`): a syllabus page with a clickable roadmap from Start Yachting to Yachtmaster Ocean
    (prerequisites, what you can do afterwards, an "Am I ready?" sea-time calculator), plus game-based training for
    **Competent Crew** (`#/rya/competent-crew`) and **Day Skipper** (`#/rya/day-skipper`). Each course has six or seven
    games, a briefing, a quiz and an "I can…" checklist (stars and progress live in `localStorage`). The harbour
    handling and lines & fenders games share a small yacht physics model (`src/academy/core/yacht.ts`: prop walk,
    windage, stream, mooring lines and fendered contact). Source in `src/academy/games/rya`, texts in
    `src/academy/i18n/rya`. Coastal Skipper and the Yachtmaster levels are on the roadmap as "coming soon".
  - **3D Rig Explorer** (`#/rya/competent-crew/rig3d`): a three.js yacht (loaded on demand) where you pull or ease the
    halyard, mainsheet, traveller, kicker, topping lift, outhaul, reefing pennant, furling line and both jib sheets, with
    clickable line names, camera presets and the moving parts highlighted, plus a "Which line?" challenge. The same
    explorer is embedded in the sails lesson. Model in `src/academy/games/rya/rig3d/rigModel.ts`, scene in `scene.ts`.
  - **RYA topic lessons** (`#/rya/learn`): nine step-by-step lessons (sails, knots & lines, handling under power, tides,
    anchoring, collision rules, lights, passage planning & pilotage, distress & emergencies) with worked examples,
    calculators (rule of twelfths, scope, points of sail, lights viewer), a quick check and links to the games they
    prepare for. Each game page links back to its lessons. Content per language in `src/academy/games/rya/lessons/content.*.ts`.
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
- **Settings:** the place behind each home page card (live wind, 3-day forecast, daylight, sea now, Windy wind map and rain radar, the maps with a zoom level), with address autocomplete. Forecast, daylight and radar follow the live wind place until they get their own. Changes show on the site without a deploy.
- **Deploy site:** rebuilds the static site through the `publish` edge function (about 2 minutes) and shows
  whether the latest changes are live.

**Sail Tracker app** ([melihteke/sail-tracker](https://github.com/melihteke/sail-tracker), Android)

- Records sails on the phone (offline, screen off): track only, or a full log of engine, sails, reef, tacks, MOB,
  anchor, notes, weather and photos, each with time and position.
- Uploads a sail as a **draft** through `app_save_sail` (`supabase/migrations/0005_sail_log.sql`). The GPX goes to the
  `gpx` bucket, the log to `sail_events`, and photos (with their position) to `sail_media`. Re-uploads are matched by id
  and never duplicate.
- Opening an app draft in the admin fills in stats, wind and the manoeuvre analysis automatically, and shows a "From
  the app" badge and the event log.
- Published sails with a log get an "On the boat" timeline, the under sail / under engine split, event pins on the map,
  dashed engine sections and photos pinned where they were taken.

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

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.7 | 2026-11-15 | Melih Teke | Tides lesson: redrawn Moon/Earth animation with Moon-phase view and phase strip; adjustable cross-stream correction angle with the calculation (rule of 60, arcsin, vector triangle). |
| 1.6 | 2026-11-15 | Melih Teke | Tides & anchoring: kinds of current, Moon/springs-neaps animation, interactive tidal stream atlas and tidal diamond, scope table, guided tasks in the anchored-through-the-tide widget, step-by-step Anchor Bay guide. |
| 1.5 | 2026-11-15 | Melih Teke | Tides lesson: richer tidal streams, tidal gates and tide & anchoring sections with animated stream, gate-planner and anchored-through-the-tide widgets. |
| 1.4 | 2026-11-15 | Melih Teke | Added the 3D Rig Explorer (pull/ease every sail control line, see what moves) with a "Which line?" challenge, in Competent Crew and the sails lesson. |
| 1.3 | 2026-11-15 | Melih Teke | Animated RYA roadmap scene (sun, clouds, gulls, waves, sailing boat) with reduced-motion support. |
| 1.2 | 2026-11-15 | Melih Teke | Added RYA topic lessons with worked examples, calculators and quick checks. |
| 1.1 | 2026-11-15 | Melih Teke | Added the RYA courses section (syllabus roadmap, Competent Crew and Day Skipper games). |
