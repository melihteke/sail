import * as React from "react";
import { CloudRain, Sunrise, Sunset, Thermometer } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { useSiteSettings } from "@/lib/settings-store";
import { beaufort, compass } from "@/lib/units";
import { WindArrow } from "./LiveWind";

type Day = {
  date: string;
  wind: number;
  gust: number;
  dir: number;
  rain: number;
  rainChance: number | null;
  tMax: number;
  tMin: number;
  sunrise: string;
  sunset: string;
};

/** Rough go/no-go for a small open keelboat or dinghy, from the day's strongest wind and gusts (kn). */
function verdict(wind: number, gust: number) {
  if (wind >= 21 || gust >= 28) return { label: "Too windy", tone: "bg-red-500/15 text-red-700 dark:text-red-300" };
  if (wind >= 16 || gust >= 22) return { label: "Fresh · reef early", tone: "bg-amber-500/15 text-amber-800 dark:text-amber-200" };
  if (wind < 4) return { label: "Very light", tone: "bg-sky-500/15 text-sky-800 dark:text-sky-200" };
  return { label: "Good sailing", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
}

export default function SailingForecast({ settings: initial, timeZone }: { settings: SiteSettings; timeZone: string }) {
  const { lat, lon, name } = useSiteSettings(initial).forecast;
  const [days, setDays] = React.useState<Day[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setDays(null);
    setError(false);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
      `&wind_speed_unit=kn&forecast_days=3&timezone=${encodeURIComponent(timeZone)}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        const d = json.daily;
        if (!active) return;
        setDays(
          (d.time as string[]).map((date, i) => ({
            date,
            wind: d.wind_speed_10m_max[i],
            gust: d.wind_gusts_10m_max[i],
            dir: d.wind_direction_10m_dominant[i],
            rain: d.precipitation_sum[i],
            rainChance: d.precipitation_probability_max?.[i] ?? null,
            tMax: d.temperature_2m_max[i],
            tMin: d.temperature_2m_min[i],
            sunrise: d.sunrise[i],
            sunset: d.sunset[i],
          })),
        );
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [lat, lon, timeZone]);

  const dayName = (date: string, i: number) =>
    i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">3-day sailing forecast</p>
      <h2 className="mt-1 truncate text-base font-semibold tracking-tight">{name}</h2>
      {error && <p className="mt-6 text-sm text-muted-foreground">The forecast is unavailable right now.</p>}
      {!days && !error && <div className="mt-5 h-40 animate-pulse rounded-xl bg-muted" aria-label="Loading forecast" />}
      {days && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {days.map((d, i) => {
            const v = verdict(d.wind, d.gust);
            const bft = beaufort(d.wind);
            return (
              <div key={d.date} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{dayName(d.date, i)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.tone}`}>{v.label}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <WindArrow deg={d.dir} className="h-7 w-7 shrink-0 fill-current text-sea" />
                  <div>
                    <p className="text-xl font-semibold tabular-nums leading-tight">
                      {d.wind.toFixed(0)}
                      <span className="ml-0.5 text-xs font-medium text-muted-foreground">kn</span>
                      <span className="ml-1.5 text-xs font-medium text-muted-foreground">gusts {d.gust.toFixed(0)}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {compass(d.dir)} · Bft {bft.force}
                    </p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />
                    <dt className="sr-only">Rain</dt>
                    <dd>
                      {d.rain.toFixed(1)} mm{d.rainChance != null && ` · ${d.rainChance}%`}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />
                    <dt className="sr-only">Temperature</dt>
                    <dd>
                      {d.tMin.toFixed(0)}–{d.tMax.toFixed(0)} °C
                    </dd>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-3.5 w-3.5" aria-hidden="true" />
                    <dt className="sr-only">Sunrise</dt>
                    <dd>{d.sunrise.slice(11, 16)}</dd>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="h-3.5 w-3.5" aria-hidden="true" />
                    <dt className="sr-only">Sunset</dt>
                    <dd>{d.sunset.slice(11, 16)}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground">
        Daily maximum wind and gusts · Open-Meteo. The label is a rough guide for small open boats, not a safety advice.
      </p>
    </div>
  );
}
