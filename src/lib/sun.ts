// Sun and moon times computed locally (formulas after Astronomy Answers / the suncalc approach).
// Accurate to about a minute, which is plenty for planning a sail.

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440587.5;
const J2000 = 2451545;
const J0 = 0.0009;
const OBLIQUITY = 23.4397 * RAD;

const toJulian = (d: Date) => d.getTime() / DAY_MS + J1970;
const fromJulian = (j: number) => new Date((j - J1970) * DAY_MS);

const meanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d);
function eclipticLongitude(M: number) {
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  return M + C + RAD * 102.9372 + Math.PI;
}
const transitJ = (ds: number, M: number, L: number) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

export interface SunTimes {
  /** null when the sun never gets that low / high on this day (polar day or night) */
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  noon: Date;
}

/** Sunrise/sunset (-0.833°) and civil twilight (-6°) for the solar day nearest to `date`. */
export function sunTimes(date: Date, lat: number, lon: number): SunTimes {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toJulian(date) - J2000;
  const n = Math.round(d - J0 - lw / (2 * Math.PI));
  const ds = J0 + lw / (2 * Math.PI) + n;
  const M = meanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = Math.asin(Math.sin(L) * Math.sin(OBLIQUITY));
  const noon = transitJ(ds, M, L);

  const pair = (h: number): [Date | null, Date | null] => {
    const cosW = (Math.sin(h * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
    if (cosW < -1 || cosW > 1) return [null, null];
    const w = Math.acos(cosW);
    const set = transitJ(J0 + (w + lw) / (2 * Math.PI) + n, M, L);
    return [fromJulian(noon - (set - noon)), fromJulian(set)];
  };
  const [sunrise, sunset] = pair(-0.833);
  const [dawn, dusk] = pair(-6);
  return { sunrise, sunset, dawn, dusk, noon: fromJulian(noon) };
}

const SYNODIC = 29.530588853;
/** A known new moon: 2000-01-06 18:14 UTC. */
const NEW_MOON_J = 2451550.26;

export type MoonPhase = "new" | "waxingCrescent" | "firstQuarter" | "waxingGibbous" | "full" | "waningGibbous" | "lastQuarter" | "waningCrescent";

export interface MoonInfo {
  /** days since new moon, 0..29.53 */
  age: number;
  /** illuminated fraction 0..1 */
  illumination: number;
  phase: MoonPhase;
}

export function moonInfo(date: Date): MoonInfo {
  const age = (((toJulian(date) - NEW_MOON_J) % SYNODIC) + SYNODIC) % SYNODIC;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2;
  const phases: MoonPhase[] = ["new", "waxingCrescent", "firstQuarter", "waxingGibbous", "full", "waningGibbous", "lastQuarter", "waningCrescent"];
  const phase = phases[Math.floor(((age / SYNODIC) * 8 + 0.5) % 8)]!;
  return { age, illumination, phase };
}
