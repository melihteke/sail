import * as React from "react";
import { Waves } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { useSiteSettings } from "@/lib/settings-store";
import { compass } from "@/lib/units";
import { WindArrow } from "./LiveWind";

type Marine = {
  wave: number | null;
  waveDir: number | null;
  period: number | null;
  swell: number | null;
  seaTemp: number | null;
  level: number | null;
  tide: { time: string; level: number }[];
};

/** Next high and low water from the hourly sea level (local extremes). */
function nextTides(tide: Marine["tide"]) {
  const out: { kind: "High" | "Low"; time: string; level: number }[] = [];
  for (let i = 1; i < tide.length - 1; i++) {
    const [a, b, c] = [tide[i - 1]!.level, tide[i]!.level, tide[i + 1]!.level];
    if (b > a && b >= c) out.push({ kind: "High", ...tide[i]! });
    else if (b < a && b <= c) out.push({ kind: "Low", ...tide[i]! });
  }
  return out.slice(0, 2);
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-10 w-full" aria-hidden="true">
      <polyline points={`0,30 ${pts} 100,30`} fill="color-mix(in srgb, var(--sea) 18%, transparent)" stroke="none" />
      <polyline points={pts} fill="none" stroke="var(--sea)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SeaConditions({ settings: initial, timeZone }: { settings: SiteSettings; timeZone: string }) {
  const { lat, lon, name } = useSiteSettings(initial).sea;
  const [data, setData] = React.useState<Marine | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setData(null);
    setError(false);
    const url =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      `&current=wave_height,wave_direction,wave_period,swell_wave_height,sea_surface_temperature,sea_level_height_msl` +
      `&hourly=sea_level_height_msl&forecast_hours=26&timezone=${encodeURIComponent(timeZone)}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (!active) return;
        const c = json.current ?? {};
        const h = json.hourly ?? { time: [], sea_level_height_msl: [] };
        setData({
          wave: c.wave_height ?? null,
          waveDir: c.wave_direction ?? null,
          period: c.wave_period ?? null,
          swell: c.swell_wave_height ?? null,
          seaTemp: c.sea_surface_temperature ?? null,
          level: c.sea_level_height_msl ?? null,
          tide: (h.time as string[]).map((time, i) => ({ time, level: h.sea_level_height_msl[i] as number })).filter((t) => t.level != null),
        });
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [lat, lon, timeZone]);

  const noSea = data && data.wave == null && data.seaTemp == null;
  const tides = data ? nextTides(data.tide) : [];

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sea now</p>
      <h2 className="mt-1 flex items-center gap-1.5 truncate text-base font-semibold tracking-tight">
        <Waves className="h-4 w-4 shrink-0 text-sea" aria-hidden="true" />
        <span className="truncate">{name}</span>
      </h2>
      {error && <p className="mt-6 text-sm text-muted-foreground">Sea data is unavailable right now.</p>}
      {!data && !error && <div className="mt-5 h-40 animate-pulse rounded-xl bg-muted" aria-label="Loading sea conditions" />}
      {noSea && <p className="mt-6 text-sm text-muted-foreground">No sea data for this spot. Pick a place on open water in the admin settings.</p>}
      {data && !noSea && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-[11px] text-muted-foreground">Waves</p>
              <p className="flex items-center gap-1.5 text-xl font-semibold tabular-nums">
                {data.wave?.toFixed(1) ?? "–"}
                <span className="text-xs font-medium text-muted-foreground">m</span>
                {data.waveDir != null && <WindArrow deg={data.waveDir} className="h-4 w-4 fill-current text-sea" />}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {data.period != null && `${data.period.toFixed(0)} s`}
                {data.waveDir != null && ` · from ${compass(data.waveDir)}`}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-[11px] text-muted-foreground">Sea temperature</p>
              <p className="text-xl font-semibold tabular-nums">
                {data.seaTemp?.toFixed(1) ?? "–"}
                <span className="ml-0.5 text-xs font-medium text-muted-foreground">°C</span>
              </p>
              <p className="text-[11px] text-muted-foreground">{data.swell != null && `swell ${data.swell.toFixed(1)} m`}</p>
            </div>
          </div>
          {data.tide.length > 2 && (
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
                <span>Tide, next 24 h</span>
                {data.level != null && <span className="tabular-nums">now {data.level >= 0 ? "+" : ""}{data.level.toFixed(2)} m</span>}
              </div>
              <Sparkline values={data.tide.map((t) => t.level)} />
              <div className="flex gap-4 text-xs">
                {tides.map((t) => (
                  <span key={t.time}>
                    <span className="text-muted-foreground">{t.kind} water</span>{" "}
                    <span className="font-semibold tabular-nums">{t.time.slice(11, 16)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground">Modelled values · Open-Meteo Marine. Not for navigation.</p>
    </div>
  );
}
