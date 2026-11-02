import type { SailAnalysis } from "./analysis";
import type { TrackPoint, TrackStats } from "./gpx";
import type { WindSummary } from "./wind";

/** Track stats as stored in `sails.stats` (the track itself lives in `sails.track`). */
export type StoredStats = Omit<TrackStats, "track">;

export type SailRole = "skipper" | "helm" | "crew" | "trimmer" | "student";
export const SAIL_ROLES: SailRole[] = ["helm", "skipper", "crew", "trimmer", "student"];

export interface BoatSpec {
  label: string;
  value: string;
  hint?: string;
}

export interface PhotoCredit {
  text: string;
  url?: string;
  license?: string;
  licenseUrl?: string;
}

export interface BoatRow {
  id: string;
  slug: string;
  name: string;
  model: string | null;
  builder: string | null;
  builder_url: string | null;
  designer: string | null;
  design_year: number | null;
  sail_number: string | null;
  home_water: string | null;
  description: string;
  specs: BoatSpec[];
  photo_path: string | null;
  photo_credit: PhotoCredit | null;
  is_default: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface SailRow {
  id: string;
  slug: string;
  status: "draft" | "published";
  title: string;
  date: string;
  location: string;
  summary: string;
  boat_id: string | null;
  role: SailRole;
  crew: string[];
  rating: number;
  sails_used: string | null;
  reef: boolean;
  tags: string[];
  how_it_went: string;
  what_i_practised: string;
  learnings: string;
  notes: string;
  gpx_path: string | null;
  stats: StoredStats | null;
  track: TrackPoint[] | null;
  wind: WindSummary | null;
  analysis: Omit<SailAnalysis, "twa"> & { twa?: (number | null)[] } | null;
  cover_media_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type MediaKind = "photo" | "video" | "youtube" | "link";

export interface MediaRow {
  id: string;
  sail_id: string;
  kind: MediaKind;
  storage_path: string | null;
  thumb_path: string | null;
  url: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  poster_path: string | null;
  taken_at: string | null;
  sort: number;
  created_at: string;
}
