// Supabase Edge Function: runs the GitHub Pages deploy workflow for sail.mteke.com.
// Only signed-in admins (public.is_admin()) may call it. The GitHub token never leaves Supabase.
//
// Secrets (Supabase dashboard → Edge Functions → Secrets):
//   GITHUB_TOKEN     fine-grained PAT, repository melihteke/sail only, permission "Actions: Read and write"
//   GITHUB_REPO      optional, default "melihteke/sail"
//   GITHUB_WORKFLOW  optional, default "deploy.yml"
//   ALLOWED_ORIGINS  optional, comma separated; default "https://sail.mteke.com,http://localhost:4321"
// No imports on purpose: the function only needs fetch, so it boots fast and has nothing to download.

const REPO = Deno.env.get("GITHUB_REPO") ?? "melihteke/sail";
const WORKFLOW = Deno.env.get("GITHUB_WORKFLOW") ?? "deploy.yml";
const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://sail.mteke.com,http://localhost:4321").split(",").map((o) => o.trim());

function cors(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0]!,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json(req, { error: "Sign in first" }, 401);

  // Ask Postgres as the calling user; is_admin() checks their email against public.admins.
  const rpc = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { Authorization: authorization, apikey: Deno.env.get("SUPABASE_ANON_KEY")!, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!rpc.ok) return json(req, { error: `is_admin: ${rpc.status} ${await rpc.text()}` }, rpc.status === 401 ? 401 : 500);
  if ((await rpc.json()) !== true) return json(req, { error: "Only the logbook admin can deploy" }, 403);

  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) return json(req, { error: "GITHUB_TOKEN secret is not set" }, 500);

  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sail-logbook-publish",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  if (res.status !== 204) return json(req, { error: `GitHub ${res.status}: ${await res.text()}` }, 502);
  return json(req, { ok: true });
});
