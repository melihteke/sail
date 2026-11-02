import * as React from "react";
import { fetchSettings, type Place, type SiteSettings } from "./settings";

// One shared copy of the site settings for every island on the page.
let current: SiteSettings | null = null;
let loading: Promise<SiteSettings> | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

function publish(next: SiteSettings) {
  current = next;
  for (const l of listeners) l(next);
}

/** Settings baked in at build time first, then the live values from Supabase (so admin changes show without a deploy). */
export function useSiteSettings(initial: SiteSettings) {
  const [settings, setSettings] = React.useState<SiteSettings>(current ?? initial);
  React.useEffect(() => {
    listeners.add(setSettings);
    if (current) setSettings(current);
    loading ??= fetchSettings().then((s) => {
      publish(s);
      return s;
    });
    return () => {
      listeners.delete(setSettings);
    };
  }, []);
  return settings;
}

/** True when the visitor is the signed-in admin. Only loads Supabase if a session is stored in this browser. */
export function useIsAdmin() {
  const [admin, setAdmin] = React.useState(false);
  React.useEffect(() => {
    const hasSession = Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!hasSession) return;
    let active = true;
    import("./supabase").then(async ({ getSupabase }) => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      if (!data.session) return;
      const { data: isAdmin } = await sb.rpc("is_admin");
      if (active) setAdmin(isAdmin === true);
    });
    return () => {
      active = false;
    };
  }, []);
  return admin;
}

export async function saveSetting(key: keyof SiteSettings, value: Place) {
  const { db } = await import("./supabase");
  const { error } = await db().from("site_settings").upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  publish({ ...(current ?? (await fetchSettings())), [key]: value });
}
