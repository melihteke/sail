import { SITE, SUPABASE } from "@/config";

export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** Map zoom, only used by the map cards (wind map, rain radar) */
  zoom?: number;
}

export interface SiteSettings {
  /** The home page's live wind box */
  live_wind: Place;
  /** Sea area for the wave / sea temperature card (Open-Meteo Marine needs open water) */
  sea: Place;
  /** 3-day sailing forecast */
  forecast: Place;
  /** Sunrise / sunset / moon card */
  daylight: Place;
  /** Windy.com live wind map */
  wind_map: Place;
  /** RainViewer rain radar */
  radar: Place;
}

export type SettingKey = keyof SiteSettings;
/** Cards that follow the live wind location until the admin gives them their own place. */
export const FOLLOWS_LIVE_WIND: SettingKey[] = ["forecast", "daylight", "radar"];
export const SETTING_KEYS: SettingKey[] = ["live_wind", "sea", "forecast", "daylight", "wind_map", "radar"];

const HOME: Place = { name: SITE.homeWaters.name, lat: SITE.homeWaters.lat, lon: SITE.homeWaters.lon };
export const DEFAULT_SETTINGS: SiteSettings = {
  live_wind: HOME,
  sea: { name: "North Sea off IJmuiden", lat: 52.47, lon: 4.5 },
  forecast: HOME,
  daylight: HOME,
  wind_map: { name: "the Netherlands", lat: 52.2, lon: 5.2, zoom: 8 },
  radar: { ...HOME, zoom: 7 },
};

export function isPlace(v: unknown): v is Place {
  const p = v as Place;
  return !!p && typeof p.name === "string" && Number.isFinite(p.lat) && Number.isFinite(p.lon) && (p.zoom === undefined || Number.isFinite(p.zoom));
}

/** Builds settings from the stored rows; cards without their own row follow the live wind place. */
export function settingsFromRows(rows: { key: string; value: unknown }[]): { settings: SiteSettings; custom: Set<SettingKey> } {
  const out: SiteSettings = { ...DEFAULT_SETTINGS };
  const custom = new Set<SettingKey>();
  for (const row of rows) {
    if ((SETTING_KEYS as string[]).includes(row.key) && isPlace(row.value)) {
      out[row.key as SettingKey] = row.value;
      custom.add(row.key as SettingKey);
    }
  }
  for (const k of FOLLOWS_LIVE_WIND) {
    if (!custom.has(k)) out[k] = k === "radar" ? { ...out.live_wind, zoom: DEFAULT_SETTINGS.radar.zoom } : out.live_wind;
  }
  return { settings: out, custom };
}

/** Reads settings over the public REST API (works at build time and in the browser). Falls back to defaults. */
export async function fetchSettings(fetcher: typeof fetch = fetch): Promise<SiteSettings> {
  return (await fetchSettingsDetailed(fetcher)).settings;
}

/** Like fetchSettings, plus which keys have their own stored value (the admin page needs that). */
export async function fetchSettingsDetailed(fetcher: typeof fetch = fetch): Promise<{ settings: SiteSettings; custom: Set<SettingKey> }> {
  const fallback = { settings: DEFAULT_SETTINGS, custom: new Set<SettingKey>() };
  if (!SUPABASE.url || !SUPABASE.anonKey) return fallback;
  try {
    const res = await fetcher(`${SUPABASE.url.replace(/\/+$/, "")}/rest/v1/site_settings?select=key,value`, {
      headers: { apikey: SUPABASE.anonKey, Authorization: `Bearer ${SUPABASE.anonKey}` },
    });
    if (!res.ok) return fallback;
    return settingsFromRows((await res.json()) as { key: string; value: unknown }[]);
  } catch {
    return fallback;
  }
}

export interface PlaceSuggestion extends Place {
  detail: string;
  city?: string;
}

/** Address / place autocomplete via Photon (OpenStreetMap data, free, no key). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 3) return [];
  const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6&lang=en`, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = (await res.json()) as {
    features: { geometry: { coordinates: [number, number] }; properties: Record<string, string | undefined> }[];
  };
  return json.features.map((f) => {
    const p = f.properties;
    const street = [p.street, p.housenumber].filter(Boolean).join(" ");
    const name = p.name ?? (street || p.city || "Unnamed place");
    const detail = [p.name ? street : "", p.city ?? p.county, p.state, p.country].filter((x) => x && x !== name).join(", ");
    return { name, detail, city: p.city ?? p.county, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
  });
}
