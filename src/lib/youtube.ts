export interface YouTubeVideo {
  id: string;
  /** Start offset in seconds */
  start: number;
  /** Shorts are portrait (9:16) */
  shorts: boolean;
  caption?: string;
  url: string;
}

const ID = /^[\w-]{11}$/;

function parseTime(value: string | null) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

/** Accepts watch, youtu.be, shorts, embed and live URLs (or a bare 11-char id). */
export function parseYouTube(input: string, caption?: string): YouTubeVideo | null {
  const raw = input.trim();
  if (ID.test(raw)) return { id: raw, start: 0, shorts: false, caption, url: `https://www.youtube.com/watch?v=${raw}` };
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | undefined;
  let shorts = false;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, value] = url.pathname.split("/");
    if (kind === "watch") id = url.searchParams.get("v") ?? undefined;
    else if (kind === "shorts" || kind === "embed" || kind === "live") {
      id = value;
      shorts = kind === "shorts";
    }
  }
  if (!id || !ID.test(id)) return null;
  return { id, start: parseTime(url.searchParams.get("t") ?? url.searchParams.get("start")), shorts, caption, url: raw };
}
