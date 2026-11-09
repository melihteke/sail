// The event log recorded by the Sail Tracker app (Android) and shown on the site.
// Keep the kinds in sync with the app's EventKind (com.mteke.sail.core.EventKind).

export type EventKind =
  | "start"
  | "stop"
  | "cast_off"
  | "docked"
  | "engine_on"
  | "engine_off"
  | "sail_up"
  | "sail_down"
  | "reef_in"
  | "reef_out"
  | "tack"
  | "gybe"
  | "mob"
  | "anchor_down"
  | "anchor_up"
  | "note"
  | "photo"
  | "weather";

export interface SailEvent {
  at: string;
  kind: EventKind | string;
  lat: number | null;
  lon: number | null;
  data: {
    sail?: string;
    text?: string;
    bft?: number;
    sea_state?: string;
    clouds?: string;
    media_client_id?: string;
  };
}

export interface EventRow extends SailEvent {
  id: string;
  sail_id: string;
}

const SAIL_NAMES: Record<string, string> = { main: "Main", jib: "Jib", gennaker: "Gennaker", genoa: "Genoa", spinnaker: "Spinnaker" };

export const EVENT_META: Record<string, { icon: string; label: string; tone: "neutral" | "engine" | "sail" | "alert" }> = {
  start: { icon: "⏺", label: "Recording started", tone: "neutral" },
  stop: { icon: "⏹", label: "Recording stopped", tone: "neutral" },
  cast_off: { icon: "⚓", label: "Cast off", tone: "neutral" },
  docked: { icon: "🛟", label: "Docked", tone: "neutral" },
  engine_on: { icon: "⚙️", label: "Engine on", tone: "engine" },
  engine_off: { icon: "⚙️", label: "Engine off", tone: "engine" },
  sail_up: { icon: "⛵", label: "Sail up", tone: "sail" },
  sail_down: { icon: "⛵", label: "Sail down", tone: "sail" },
  reef_in: { icon: "🪢", label: "Reef in", tone: "sail" },
  reef_out: { icon: "🪢", label: "Reef out", tone: "sail" },
  tack: { icon: "↔️", label: "Tack", tone: "sail" },
  gybe: { icon: "↩️", label: "Gybe", tone: "sail" },
  mob: { icon: "🆘", label: "Man overboard", tone: "alert" },
  anchor_down: { icon: "⚓", label: "Anchor down", tone: "neutral" },
  anchor_up: { icon: "⚓", label: "Anchor up", tone: "neutral" },
  note: { icon: "📝", label: "Note", tone: "neutral" },
  photo: { icon: "📷", label: "Photo", tone: "neutral" },
  weather: { icon: "🌬️", label: "Weather", tone: "neutral" },
};

/** Short human text for one event, e.g. "Main up", "Weather · Bft 4 · moderate". */
export function describeEvent(e: SailEvent): string {
  const meta = EVENT_META[e.kind];
  const sail = e.data.sail ? SAIL_NAMES[e.data.sail] ?? e.data.sail : null;
  if ((e.kind === "sail_up" || e.kind === "sail_down") && sail) return `${sail} ${e.kind === "sail_up" ? "up" : "down"}`;
  if (e.kind === "weather") {
    const parts = [e.data.bft != null ? `Bft ${e.data.bft}` : null, e.data.sea_state, e.data.clouds, e.data.text].filter(Boolean);
    return parts.length ? `Weather · ${parts.join(" · ")}` : "Weather";
  }
  if (e.kind === "note" && e.data.text) return e.data.text;
  if (e.kind === "photo" && e.data.text) return `Photo · ${e.data.text}`;
  return meta?.label ?? e.kind;
}

export interface Interval {
  from: number;
  to: number;
}

export interface LogSummary {
  /** Periods with the engine running (ms since epoch) */
  engine: Interval[];
  /** Periods with at least one sail up and the engine off */
  sailing: Interval[];
  engineMs: number;
  sailingMs: number;
}

/**
 * Engine and sailing periods from the event log. An engine still running (or a sail still up) at the end
 * runs until `endMs`. Sailing time does not count while the engine is on (motor-sailing counts as engine).
 */
export function summarizeLog(events: SailEvent[], endMs: number): LogSummary {
  const sorted = [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const engine: Interval[] = [];
  const sailing: Interval[] = [];
  let engineSince: number | null = null;
  let sailingSince: number | null = null;
  const up = new Set<string>();

  const update = (t: number) => {
    const shouldSail = up.size > 0 && engineSince === null;
    if (shouldSail && sailingSince === null) sailingSince = t;
    if (!shouldSail && sailingSince !== null) {
      if (t > sailingSince) sailing.push({ from: sailingSince, to: t });
      sailingSince = null;
    }
  };

  for (const e of sorted) {
    const t = Date.parse(e.at);
    if (!Number.isFinite(t)) continue;
    switch (e.kind) {
      case "engine_on":
        if (engineSince === null) engineSince = t;
        break;
      case "engine_off":
        if (engineSince !== null) {
          if (t > engineSince) engine.push({ from: engineSince, to: t });
          engineSince = null;
        }
        break;
      case "sail_up":
        up.add(e.data.sail ?? "sail");
        break;
      case "sail_down":
        if (e.data.sail) up.delete(e.data.sail);
        else up.clear();
        break;
      case "docked":
      case "stop":
        up.clear();
        if (engineSince !== null) {
          if (t > engineSince) engine.push({ from: engineSince, to: t });
          engineSince = null;
        }
        break;
    }
    update(t);
  }
  if (engineSince !== null && endMs > engineSince) engine.push({ from: engineSince, to: endMs });
  if (sailingSince !== null && endMs > sailingSince) sailing.push({ from: sailingSince, to: endMs });
  const sum = (xs: Interval[]) => xs.reduce((a, x) => a + (x.to - x.from), 0);
  return { engine, sailing, engineMs: sum(engine), sailingMs: sum(sailing) };
}

/** True when `t` (ms) falls inside one of the intervals. */
export const within = (xs: Interval[], t: number) => xs.some((x) => t >= x.from && t < x.to);
