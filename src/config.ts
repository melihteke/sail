export const SITE = {
  title: "Melih's Sailing Logbook",
  shortTitle: "Logbook",
  description:
    "Sailing log of Melih Teke: tracks, wind, notes and photos from every sail on a Polyvalk around Amsterdam and beyond.",
  author: "Melih Teke",
  url: "https://sail.mteke.com",
  github: "https://github.com/melihteke/sail",
  timeZone: "Europe/Amsterdam",
  homeWaters: {
    name: "De Poel, Amstelveen",
    lat: 52.2984,
    lon: 4.8395,
  },
} as const;

/**
 * Supabase project (public URL + anon key; both are safe to ship, row level security protects the data).
 * Without them the site builds from the legacy markdown content in src/content/sails.
 */
export const SUPABASE = {
  url: (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined) ?? "",
  anonKey: (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? "",
};

/** GitHub repo + workflow the admin "Deploy" button runs (through the `publish` edge function). */
export const DEPLOY = {
  repo: "melihteke/sail",
  workflow: "deploy.yml",
};
