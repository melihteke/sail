import * as React from "react";
import { Moon, Sunrise, Sunset } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { useSiteSettings } from "@/lib/settings-store";
import { moonInfo, sunTimes, type MoonPhase } from "@/lib/sun";

const MOON_NAMES: Record<MoonPhase, string> = {
  new: "New moon",
  waxingCrescent: "Waxing crescent",
  firstQuarter: "First quarter",
  waxingGibbous: "Waxing gibbous",
  full: "Full moon",
  waningGibbous: "Waning gibbous",
  lastQuarter: "Last quarter",
  waningCrescent: "Waning crescent",
};

const hm = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

/** Moon disc lit from the right while waxing and from the left while waning. */
function MoonIcon({ age, illumination }: { age: number; illumination: number }) {
  const waxing = age < 29.530588853 / 2;
  const k = 1 - 2 * illumination; // terminator ellipse: 1 = new, -1 = full
  const rx = Math.abs(k) * 10;
  const lit = waxing ? 1 : 0;
  const d = `M12 2 A10 10 0 0 ${lit} 12 22 A${rx} 10 0 0 ${k > 0 ? 1 - lit : lit} 12 2Z`;
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="color-mix(in srgb, var(--muted-foreground) 25%, transparent)" />
      <path d={d} fill="#fde68a" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="color-mix(in srgb, var(--muted-foreground) 45%, transparent)" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Daylight at the live-wind spot: sunrise, sunset, civil twilight and the moon, all computed in the
 * browser. A bar shows night / twilight / day across today with a marker for now.
 */
export default function Daylight({ settings: initial, timeZone }: { settings: SiteSettings; timeZone: string }) {
  const { lat, lon, name } = useSiteSettings(initial).daylight;
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const fmt = React.useMemo(() => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }), [timeZone]);
  const t = (d: Date | null) => (d ? fmt.format(d) : "–");

  if (!now) return <div className="h-full min-h-48 animate-pulse rounded-2xl border border-border bg-card" aria-label="Loading daylight" />;

  const sun = sunTimes(now, lat, lon);
  const moon = moonInfo(now);
  // Bar spans a local "solar day": from 12 h before solar noon to 12 h after.
  const start = sun.noon.getTime() - 12 * 3_600_000;
  const pct = (d: Date | null, fallback: number) => (d ? Math.min(100, Math.max(0, ((d.getTime() - start) / 864_000))) : fallback);
  const dawn = pct(sun.dawn, 0);
  const rise = pct(sun.sunrise, sun.sunrise ? 0 : 50);
  const set = pct(sun.sunset, sun.sunset ? 100 : 50);
  const dusk = pct(sun.dusk, 100);
  const nowPct = pct(now, 50);

  let status: string;
  if (sun.sunrise && sun.sunset) {
    if (now < sun.sunrise) status = `Sunrise in ${hm(sun.sunrise.getTime() - now.getTime())}`;
    else if (now < sun.sunset) status = `${hm(sun.sunset.getTime() - now.getTime())} of daylight left`;
    else if (sun.dusk && now < sun.dusk) status = `Twilight until ${t(sun.dusk)}`;
    else status = "After dark: navigation lights on";
  } else status = sun.dusk ? "Sun stays below the horizon today" : "Sun stays up all day";

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Daylight</p>
      <h2 className="mt-1 truncate text-base font-semibold tracking-tight">{status}</h2>

      <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-[#0b3a5c]/80" aria-hidden="true">
        <div className="absolute inset-y-0 bg-sky-300/70" style={{ left: `${dawn}%`, width: `${Math.max(0, dusk - dawn)}%` }} />
        <div className="absolute inset-y-0 bg-amber-300" style={{ left: `${rise}%`, width: `${Math.max(0, set - rise)}%` }} />
      </div>
      <div className="relative h-3" aria-hidden="true">
        <div className="absolute -top-3.5 h-4 w-0.5 -translate-x-1/2 rounded bg-foreground" style={{ left: `${nowPct}%` }} />
      </div>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-secondary px-2.5 py-2">
          <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sunrise className="h-3.5 w-3.5" aria-hidden="true" /> Sunrise
          </dt>
          <dd className="text-base font-semibold tabular-nums">{t(sun.sunrise)}</dd>
          <dd className="text-[10px] text-muted-foreground">light {t(sun.dawn)}</dd>
        </div>
        <div className="rounded-xl bg-secondary px-2.5 py-2">
          <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sunset className="h-3.5 w-3.5" aria-hidden="true" /> Sunset
          </dt>
          <dd className="text-base font-semibold tabular-nums">{t(sun.sunset)}</dd>
          <dd className="text-[10px] text-muted-foreground">dark {t(sun.dusk)}</dd>
        </div>
        <div className="rounded-xl bg-secondary px-2.5 py-2" title={MOON_NAMES[moon.phase]}>
          <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" /> Moon
          </dt>
          <dd className="flex items-center gap-1.5">
            <MoonIcon age={moon.age} illumination={moon.illumination} />
            <span className="text-base font-semibold tabular-nums">{Math.round(moon.illumination * 100)}%</span>
          </dd>
          <dd className="truncate text-[10px] text-muted-foreground">{MOON_NAMES[moon.phase]}</dd>
        </div>
      </dl>
      <p className="mt-2 truncate text-[11px] text-muted-foreground">
        {name}
        {sun.sunrise && sun.sunset ? ` · ${hm(sun.sunset.getTime() - sun.sunrise.getTime())} of daylight` : ""}
        {moon.phase === "new" || moon.phase === "full" ? " · spring tides likely" : ""}
      </p>
    </div>
  );
}
