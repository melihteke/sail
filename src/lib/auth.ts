import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { url } from "@/lib/url";

export type AuthState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "signed-out"; error?: string }
  | { status: "signed-in"; session: Session; isAdmin: boolean };

/** Session of the current visitor plus whether they are an admin, kept in sync with Supabase auth events. */
export function useAuth() {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });

  const load = React.useCallback(async (session: Session | null) => {
    const supabase = getSupabase();
    if (!supabase) return setState({ status: "unconfigured" });
    if (!session) {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error_description") ?? undefined;
      return setState({ status: "signed-out", error });
    }
    const { data, error } = await supabase.rpc("is_admin");
    setState({ status: "signed-in", session, isAdmin: !error && data === true });
  }, []);

  React.useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer: calling Supabase inside the callback can deadlock the auth lock.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setTimeout(() => active && load(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  return state;
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) return;
  const redirectTo = new URL(url("/admin/"), window.location.origin).toString();
  await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, queryParams: { prompt: "select_account" } } });
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
  window.location.href = url("/");
}
