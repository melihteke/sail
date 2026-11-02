import * as React from "react";
import { ArrowDown, ArrowUp, CirclePlay, ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { addLink, addYouTube, deleteMedia, listMedia, publicUrl, reorderMedia, updateMedia, uploadMediaFiles, MEDIA_BUCKET } from "@/lib/admin-api";
import type { MediaRow } from "@/lib/types";
import { parseYouTube } from "@/lib/youtube";
import { Button, Card, DropZone, Field, Input, Notice, Spinner } from "./ui";

function Thumb({ item }: { item: MediaRow }) {
  if (item.kind === "photo" && (item.thumb_path || item.storage_path)) {
    return <img src={publicUrl(MEDIA_BUCKET, item.thumb_path ?? item.storage_path!)} alt="" className="h-full w-full object-cover" loading="lazy" />;
  }
  if (item.kind === "video") {
    return item.poster_path ? (
      <img src={publicUrl(MEDIA_BUCKET, item.poster_path)} alt="" className="h-full w-full object-cover" loading="lazy" />
    ) : (
      <span className="flex h-full items-center justify-center bg-black text-xs text-white">Video</span>
    );
  }
  if (item.kind === "youtube") {
    const v = item.url ? parseYouTube(item.url) : null;
    return v ? <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" loading="lazy" /> : null;
  }
  return (
    <span className="flex h-full items-center justify-center bg-gradient-to-br from-[#0b3a5c] to-[#1b7fb3] text-white">
      <Link2 className="h-6 w-6" />
    </span>
  );
}

const KIND_LABEL: Record<MediaRow["kind"], string> = { photo: "Photo", video: "Video", youtube: "YouTube", link: "Link" };

export default function MediaManager({ sailId, coverId, onCoverChange }: { sailId: string; coverId: string | null; onCoverChange: (id: string | null) => void }) {
  const [items, setItems] = React.useState<MediaRow[] | null>(null);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);
  const [yt, setYt] = React.useState({ url: "", caption: "" });
  const [link, setLink] = React.useState({ url: "", caption: "" });

  const reload = React.useCallback(async () => {
    try {
      setItems(await listMedia(sailId));
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    }
  }, [sailId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const onFiles = async (files: File[]) => {
    setNotice(null);
    try {
      const warnings = await uploadMediaFiles(sailId, files, (done, total, name) => setProgress(`Processing ${Math.min(done + 1, total)} of ${total}: ${name}`));
      setNotice(warnings.length ? { tone: "warn", text: warnings.join(" ") } : { tone: "ok", text: `${files.length} ${files.length === 1 ? "file" : "files"} added.` });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setProgress(null);
      await reload();
    }
  };

  const run = async (fn: () => Promise<void>) => {
    setNotice(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    }
  };

  const move = (index: number, delta: number) => {
    if (!items) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    setItems(next.map((m, i) => ({ ...m, sort: i })));
    // `next` still carries the old sort values, so only rows that actually moved are updated.
    void run(() => reorderMedia(next));
  };

  return (
    <Card title="Photos, videos & links">
      <DropZone accept="image/*,.heic,.heif,video/mp4,video/quicktime,video/webm,.mov,.mp4,.m4v" multiple onFiles={(f) => void onFiles(f)} disabled={progress !== null}>
        {progress ? (
          <>
            <Spinner className="text-primary" />
            <span className="mt-2 text-sm font-medium">{progress}</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-7 w-7 text-muted-foreground" />
            <span className="mt-2 font-medium">Drop photos and short videos, or click to choose</span>
            <span className="text-xs text-muted-foreground">
              iPhone HEIC/JPG/PNG are converted to JPG and GPS data is removed · videos up to 50 MB (MP4 plays everywhere)
            </span>
          </>
        )}
      </DropZone>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form
          className="rounded-xl border border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await addYouTube(sailId, yt.url, yt.caption);
              setYt({ url: "", caption: "" });
            });
          }}
        >
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <CirclePlay className="h-4 w-4 text-red-600" /> YouTube video
          </p>
          <div className="grid gap-2">
            <Field label="Link">
              <Input value={yt.url} onChange={(e) => setYt({ ...yt, url: e.currentTarget.value })} placeholder="https://youtu.be/…" required />
            </Field>
            <Field label="Caption (optional)">
              <Input value={yt.caption} onChange={(e) => setYt({ ...yt, caption: e.currentTarget.value })} />
            </Field>
            <Button type="submit" size="sm" className="justify-self-start" disabled={!yt.url}>
              Add video
            </Button>
          </div>
        </form>
        <form
          className="rounded-xl border border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await addLink(sailId, link.url, link.caption);
              setLink({ url: "", caption: "" });
            });
          }}
        >
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Link2 className="h-4 w-4" /> Link
          </p>
          <div className="grid gap-2">
            <Field label="URL">
              <Input type="url" value={link.url} onChange={(e) => setLink({ ...link, url: e.currentTarget.value })} placeholder="https://photos.app.goo.gl/…" required />
            </Field>
            <Field label="Title (optional)">
              <Input value={link.caption} onChange={(e) => setLink({ ...link, caption: e.currentTarget.value })} placeholder="Full photo album" />
            </Field>
            <Button type="submit" size="sm" className="justify-self-start" disabled={!link.url}>
              Add link
            </Button>
          </div>
        </form>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}

      {items === null ? (
        <div className="mt-4 flex justify-center text-muted-foreground">
          <Spinner />
        </div>
      ) : items.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const isCover = coverId === item.id;
            const canCover = item.kind === "photo" || (item.kind === "video" && item.poster_path);
            return (
              <li key={item.id} className={`overflow-hidden rounded-xl border bg-background ${isCover ? "border-amber-500 ring-2 ring-amber-500/40" : "border-border"}`}>
                <div className="relative aspect-video bg-muted">
                  <Thumb item={item} />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    {KIND_LABEL[item.kind]}
                    {isCover ? " · Cover" : ""}
                  </span>
                </div>
                <div className="space-y-2 p-2.5">
                  <Input
                    defaultValue={item.caption ?? ""}
                    placeholder={item.kind === "link" ? "Title" : "Caption"}
                    aria-label="Caption"
                    className="h-8 py-1 text-xs"
                    onBlur={(e) => {
                      const caption = e.currentTarget.value.trim() || null;
                      if (caption !== item.caption) void run(() => updateMedia(item.id, { caption }));
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Move later" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    {canCover && (
                      <Button size="sm" variant="ghost" aria-pressed={isCover} onClick={() => onCoverChange(isCover ? null : item.id)} title={isCover ? "Remove as cover" : "Use as cover (cards show it instead of the map)"}>
                        <Star className={`h-3.5 w-3.5 ${isCover ? "fill-amber-500 text-amber-500" : ""}`} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-destructive hover:text-destructive"
                      aria-label="Delete"
                      onClick={() => {
                        if (!confirm("Delete this item?")) return;
                        if (isCover) onCoverChange(null);
                        void run(() => deleteMedia(item));
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No media yet. It's all optional.</p>
      )}
    </Card>
  );
}
