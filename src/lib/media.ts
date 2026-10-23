import type { ImageMetadata } from "astro";

export type MediaItem =
  | { kind: "photo"; file: string; image: ImageMetadata; caption?: string }
  | { kind: "video"; file: string; src: string; poster?: ImageMetadata; caption?: string };

// Files are discovered from each sail's photos/ and videos/ folders (created by `npm run add-media`).
const photos = import.meta.glob<ImageMetadata>("/src/content/sails/*/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}", {
  eager: true,
  import: "default",
});
const videos = import.meta.glob<string>("/src/content/sails/*/videos/*.{mp4,webm,MP4}", { eager: true, import: "default" });
const posters = import.meta.glob<ImageMetadata>("/src/content/sails/*/videos/*.{jpg,jpeg,JPG}", { eager: true, import: "default" });

const PATH = /^\/src\/content\/sails\/([^/]+)\/(?:photos|videos)\/(.+)$/;
const stem = (file: string) => file.replace(/\.[^.]+$/, "");

/** Photos and videos of a sail, mixed and ordered by file name (add-media numbers them). */
export function sailMedia(slug: string, captions: Record<string, string> = {}): MediaItem[] {
  const items: MediaItem[] = [];
  const posterByStem = new Map<string, ImageMetadata>();
  for (const [path, image] of Object.entries(posters)) {
    const [, s, file] = path.match(PATH) ?? [];
    if (s === slug && file) posterByStem.set(stem(file), image);
  }
  for (const [path, image] of Object.entries(photos)) {
    const [, s, file] = path.match(PATH) ?? [];
    if (s === slug && file) items.push({ kind: "photo", file, image, caption: captions[file] });
  }
  for (const [path, src] of Object.entries(videos)) {
    const [, s, file] = path.match(PATH) ?? [];
    if (s === slug && file) items.push({ kind: "video", file, src, poster: posterByStem.get(stem(file)), caption: captions[file] });
  }
  return items.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
}

/** Explicit cover, else the first photo, else a video poster. */
export function sailCover(slug: string, explicit?: ImageMetadata) {
  if (explicit) return explicit;
  const media = sailMedia(slug);
  const photo = media.find((m) => m.kind === "photo");
  if (photo?.kind === "photo") return photo.image;
  const video = media.find((m) => m.kind === "video" && m.poster);
  return video?.kind === "video" ? video.poster : undefined;
}
