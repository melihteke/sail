// Structured logbook helpers shared by the admin (editor, export) and the public sail page.

import { summarizeLog, type SailEvent } from "./events";
import { sunTimes } from "./sun";
import type { PassageType, SailRow, SeaState, Visibility } from "./types";

export const PASSAGE_LABEL: Record<PassageType, string> = {
  day_sail: "Day sail",
  passage: "Passage",
  training: "Training",
  race: "Race",
  delivery: "Delivery",
  cruise: "Cruise",
};

export const SEA_STATE_LABEL: Record<SeaState, string> = {
  calm: "Calm",
  smooth: "Smooth",
  slight: "Slight",
  moderate: "Moderate",
  rough: "Rough",
  very_rough: "Very rough",
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  good: "Good",
  moderate: "Moderate",
  poor: "Poor",
  fog: "Fog",
};

const STEP_MS = 5 * 60_000;

/** Hours between sunset and sunrise during [startIso, endIso], to 0.1 h. */
export function nightHours(startIso: string, endIso: string, lat: number, lon: number): number {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!(end > start)) return 0;
  let nightMs = 0;
  for (let t = start; t < end; t += STEP_MS) {
    const mid = Math.min(t + STEP_MS / 2, (t + end) / 2);
    const sun = sunTimes(new Date(mid), lat, lon);
    if (sun.sunrise && sun.sunset && (mid < sun.sunrise.getTime() || mid > sun.sunset.getTime())) {
      nightMs += Math.min(STEP_MS, end - t);
    }
  }
  return Math.round(nightMs / 360_000) / 10;
}

/** Minutes under engine from the event log, or null when the log has no engine events. */
export function engineMinutesFromEvents(events: SailEvent[], endIso: string): number | null {
  if (!events.some((e) => e.kind === "engine_on")) return null;
  return Math.round(summarizeLog(events, Date.parse(endIso)).engineMs / 60_000);
}

export const toNumber = (v: number | string | null | undefined) => (v === null || v === undefined || v === "" ? null : Number(v));

export interface LogFacts {
  passageType: PassageType | null;
  departure: string | null;
  arrival: string | null;
  skipper: string | null;
  nightHours: number | null;
  tidal: boolean;
  observedBft: number | null;
  seaState: SeaState | null;
  visibility: Visibility | null;
  engineMinutes: number | null;
}

/** Structured fields of a sail row; engine time falls back to the event log. Missing columns read as empty. */
export function logFacts(row: Partial<SailRow>, events: SailEvent[] = [], endIso?: string): LogFacts {
  return {
    passageType: row.passage_type ?? null,
    departure: row.departure?.trim() || null,
    arrival: row.arrival?.trim() || null,
    skipper: row.skipper?.trim() || null,
    nightHours: toNumber(row.night_hours),
    tidal: row.tidal ?? false,
    observedBft: row.observed_bft ?? null,
    seaState: row.sea_state ?? null,
    visibility: row.visibility ?? null,
    engineMinutes: row.engine_minutes ?? (endIso ? engineMinutesFromEvents(events, endIso) : null),
  };
}

export function hasLogFacts(f: LogFacts) {
  return Boolean(
    f.passageType || f.departure || f.arrival || f.skipper || f.nightHours || f.tidal || f.observedBft !== null || f.seaState || f.visibility || f.engineMinutes,
  );
}

export interface CheckItem {
  key: string;
  label: string;
  done: boolean;
  /** Only asked for in the detailed mode */
  detailed?: boolean;
}

/** What a complete log entry has. Advisory only: publishing is never blocked. */
export function completeness(sail: SailRow, opts: { mediaCount: number }): CheckItem[] {
  const story = [sail.how_it_went, sail.what_i_practised, sail.learnings].some((s) => s.trim());
  return [
    { key: "track", label: "Track, or distance & time", done: Boolean(sail.gpx_path) || toNumber(sail.manual_distance_nm) !== null || sail.manual_duration_min !== null },
    { key: "title", label: "Title & summary", done: Boolean(sail.title.trim() && sail.summary.trim()) },
    { key: "boat", label: "Boat", done: Boolean(sail.boat_id) },
    { key: "type", label: "Passage type", done: Boolean(sail.passage_type) },
    { key: "route", label: "Departure & arrival", done: Boolean(sail.departure?.trim() && sail.arrival?.trim()) },
    { key: "conditions", label: "Observed conditions", done: sail.observed_bft !== null && Boolean(sail.sea_state) },
    { key: "story", label: "Story (how it went, practised or learnings)", done: story },
    { key: "skipper", label: "Skipper", done: Boolean(sail.skipper?.trim()) || sail.role === "skipper", detailed: true },
    { key: "visibility", label: "Visibility", done: Boolean(sail.visibility), detailed: true },
    { key: "learnings", label: "Learnings", done: Boolean(sail.learnings.trim()), detailed: true },
    { key: "media", label: "Photo or video", done: opts.mediaCount > 0, detailed: true },
  ];
}

// --- CSV export ---------------------------------------------------------------------------------

export interface LogbookRow {
  date: string;
  title: string;
  boat: string;
  role: string;
  skipper: string;
  passageType: string;
  departure: string;
  arrival: string;
  distanceNm: number | null;
  hours: number | null;
  nightHours: number | null;
  engineMinutes: number | null;
  tidal: boolean;
  observedBft: number | null;
  seaState: string;
  visibility: string;
  status: string;
  privateNotes?: string;
}

const CSV_COLUMNS: [keyof LogbookRow, string][] = [
  ["date", "Date"],
  ["title", "Title"],
  ["boat", "Boat"],
  ["role", "Role"],
  ["skipper", "Skipper"],
  ["passageType", "Type"],
  ["departure", "Departure"],
  ["arrival", "Arrival"],
  ["distanceNm", "Distance (nm)"],
  ["hours", "Hours"],
  ["nightHours", "Night hours"],
  ["engineMinutes", "Engine (min)"],
  ["tidal", "Tidal"],
  ["observedBft", "Bft"],
  ["seaState", "Sea state"],
  ["visibility", "Visibility"],
  ["status", "Status"],
];

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "yes" : "no") : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function logbookCsv(rows: LogbookRow[], withPrivate = false) {
  const cols: [keyof LogbookRow, string][] = withPrivate ? [...CSV_COLUMNS, ["privateNotes", "Private notes"]] : CSV_COLUMNS;
  return [cols.map(([, h]) => csvCell(h)).join(","), ...rows.map((r) => cols.map(([k]) => csvCell(r[k])).join(","))].join("\r\n");
}
