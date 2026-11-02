import * as React from "react";
import { ExternalLink, LogOut, Rocket } from "lucide-react";
import { signInWithGoogle, signOut, useAuth } from "@/lib/auth";
import { latestDeploy, pendingChanges, triggerDeploy, type DeployRun } from "@/lib/admin-api";
import { url } from "@/lib/url";
import { Button, Notice, Spinner } from "./ui";
import SailList from "./SailList";
import SailNew from "./SailNew";
import SailEditor from "./SailEditor";
import BoatList from "./BoatList";
import BoatEditor from "./BoatEditor";

type Route = { page: "sails" } | { page: "sail-new" } | { page: "sail"; id: string } | { page: "boats" } | { page: "boat"; id: string | null };

function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "sails" && parts[1] === "new") return { page: "sail-new" };
  if (parts[0] === "sails" && parts[1]) return { page: "sail", id: parts[1] };
  if (parts[0] === "boats" && parts[1]) return { page: "boat", id: parts[1] === "new" ? null : parts[1] };
  if (parts[0] === "boats") return { page: "boats" };
  return { page: "sails" };
}

function useRoute() {
  const [route, setRoute] = React.useState<Route>(() => parseRoute(typeof window === "undefined" ? "" : window.location.hash));
  React.useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/** Shared deploy state so editors can trigger a deploy after publishing. */
export const DeployContext = React.createContext<{ deploy: () => Promise<void>; refresh: () => void }>({
  deploy: async () => {},
  refresh: () => {},
});

function DeployBar({ children }: { children: React.ReactNode }) {
  const [run, setRun] = React.useState<DeployRun | null>(null);
  const [pending, setPending] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const { latest, lastSuccess } = await latestDeploy();
      setRun(latest);
      setPending(lastSuccess ? await pendingChanges(lastSuccess.createdAt) : null);
    } catch {
      setRun(null);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const running = run && run.status !== "completed";
  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [running, refresh]);

  const deploy = React.useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      await triggerDeploy();
      setMessage({ tone: "ok", text: "Deploy started. The site updates in about 2 minutes." });
      window.setTimeout(() => void refresh(), 4_000);
    } catch (e) {
      setMessage({ tone: "error", text: `Deploy failed: ${(e as Error).message}` });
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const status = !run
    ? "Deploy status unknown"
    : running
      ? "Deploying…"
      : run.conclusion === "success"
        ? `Live · deployed ${new Date(run.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
        : `Last deploy ${run.conclusion}`;

  return (
    <DeployContext.Provider value={{ deploy, refresh: () => void refresh() }}>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm">
        <span className="flex items-center gap-2">
          {running ? <Spinner className="h-3.5 w-3.5 text-primary" /> : <span className={`h-2.5 w-2.5 rounded-full ${run?.conclusion === "success" ? "bg-emerald-500" : run ? "bg-destructive" : "bg-muted-foreground"}`} />}
          {run ? (
            <a href={run.url} target="_blank" rel="noopener" className="hover:underline">
              {status}
            </a>
          ) : (
            status
          )}
        </span>
        {pending != null && pending > 0 && !running && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
            {pending} {pending === 1 ? "change" : "changes"} not live yet
          </span>
        )}
        <Button variant="primary" size="sm" className="ml-auto" onClick={() => void deploy()} disabled={busy || Boolean(running)}>
          {busy ? <Spinner className="h-3.5 w-3.5" /> : <Rocket className="h-3.5 w-3.5" />} Deploy site
        </Button>
      </div>
      {message && (
        <div className="mt-2">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}
      <div className="mt-5">{children}</div>
    </DeployContext.Provider>
  );
}

function SignIn({ error }: { error?: string }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Logbook admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to add sails, photos and boats.</p>
      {error && (
        <div className="mt-4 text-left">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <Button variant="secondary" className="mt-6 h-11 w-full gap-3 text-sm" onClick={() => void signInWithGoogle()}>
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Sign in with Google
      </Button>
    </div>
  );
}

export default function AdminApp() {
  const auth = useAuth();
  const route = useRoute();

  if (auth.status === "loading") {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Spinner />
      </div>
    );
  }
  if (auth.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Notice tone="warn">
          This build has no Supabase settings. Set <code>PUBLIC_SUPABASE_URL</code> and <code>PUBLIC_SUPABASE_ANON_KEY</code> (see docs/SETUP.md) and rebuild.
        </Notice>
      </div>
    );
  }
  if (auth.status === "signed-out") return <SignIn error={auth.error} />;
  if (!auth.isAdmin) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {auth.session.user.email} is not an admin of this logbook.
        </p>
        <Button className="mt-6" onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    );
  }

  const tab = route.page.startsWith("boat") ? "boats" : "sails";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted/70 p-1 text-sm font-medium">
          <a href="#/sails" className={`rounded-md px-3 py-1.5 ${tab === "sails" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Sails
          </a>
          <a href="#/boats" className={`rounded-md px-3 py-1.5 ${tab === "boats" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Boats
          </a>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <a href={url("/")} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-foreground">
            View site <ExternalLink className="h-3 w-3" />
          </a>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">{auth.session.user.email}</span>
          <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <DeployBar>
        {route.page === "sails" && <SailList />}
        {route.page === "sail-new" && <SailNew />}
        {route.page === "sail" && <SailEditor key={route.id} id={route.id} />}
        {route.page === "boats" && <BoatList />}
        {route.page === "boat" && <BoatEditor key={route.id ?? "new"} id={route.id} />}
      </DeployBar>
    </div>
  );
}
