import { SITE, SUPABASE } from "@/config";

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface SiteSettings {
  /** Where the home page's live wind, forecast and rain radar point */
  live_wind: Place;
  /** Sea area for the wave / sea temperature card (Open-Meteo Marine needs open water) */
  sea: Place;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  live_wind: { name: SITE.homeWaters.name, lat: SITE.homeWaters.lat, lon: SITE.homeWaters.lon },
  sea: { name: "North Sea off IJmuiden", lat: 52.47, lon: 4.5 },
};

function isPlace(v: unknown): v is Place {
  const p = v as Place;
  return !!p && typeof p.name === "string" && Number.isFinite(p.lat) && Number.isFinite(p.lon);
}

/** Reads settings over the public REST API (works at build time and in the browser). Falls back to defaults. */
export async function fetchSettings(fetcher: typeof fetch = fetch): Promise<SiteSettings> {
  if (!SUPABASE.url || !SUPABASE.anonKey) return DEFAULT_SETTINGS;
  try {
    const res = await fetcher(`${SUPABASE.url.replace(/\/+$/, "")}/rest/v1/site_settings?select=key,value`, {
      headers: { apikey: SUPABASE.anonKey, Authorization: `Bearer ${SUPABASE.anonKey}` },
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    const rows = (await res.json()) as { key: string; value: unknown }[];
    const out: SiteSettings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if ((row.key === "live_wind" || row.key === "sea") && isPlace(row.value)) out[row.key] = row.value;
    }
    return out;
  } catch {
    return DEFAULT_SETTINGS;
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
