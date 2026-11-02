// Browser-only helpers that turn phone photos/videos into web-ready uploads before they reach Supabase.

export const PHOTO_MAX_PX = 2400;
export const THUMB_MAX_PX = 960;
export const BOAT_PHOTO_MAX_PX = 1800;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export interface ProcessedPhoto {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  takenAt: string | null;
}

export interface ProcessedVideo {
  file: File;
  poster: Blob | null;
  width: number | null;
  height: number | null;
  takenAt: string | null;
  warning: string | null;
}

const isHeic = (file: File) => /\.(heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type);
export const isVideo = (file: File) => file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(file.name);
export const isPhoto = (file: File) => file.type.startsWith("image/") || isHeic(file);

async function takenAt(file: File) {
  try {
    const exifr = (await import("exifr")).default;
    const tags = await exifr.parse(file, ["DateTimeOriginal", "CreateDate"]);
    const date: Date | undefined = tags?.DateTimeOriginal ?? tags?.CreateDate;
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
  } catch {
    return null;
  }
}

async function decode(file: File): Promise<ImageBitmap> {
  let source: Blob = file;
  if (isHeic(file)) {
    const { heicTo } = await import("heic-to");
    source = await heicTo({ blob: file, type: "image/jpeg", quality: 0.95 });
  }
  // Applies the EXIF orientation so portrait phone photos stay upright.
  return createImageBitmap(source, { imageOrientation: "from-image" });
}

function encode(bitmap: ImageBitmap, maxPx: number, quality: number) {
  const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  // Re-encoding through a canvas drops all EXIF metadata, including GPS.
  return new Promise<{ blob: Blob; width: number; height: number }>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve({ blob, width, height }) : reject(new Error("Could not encode image"))), "image/jpeg", quality),
  );
}

/** HEIC/JPG/PNG/WebP → JPEG (max 2400 px) + thumbnail (max 960 px), metadata stripped. */
export async function processPhoto(file: File, maxPx = PHOTO_MAX_PX): Promise<ProcessedPhoto> {
  const [bitmap, date] = await Promise.all([decode(file), takenAt(file)]);
  try {
    const full = await encode(bitmap, maxPx, 0.85);
    const thumb = await encode(bitmap, THUMB_MAX_PX, 0.8);
    return { full: full.blob, thumb: thumb.blob, width: full.width, height: full.height, takenAt: date };
  } finally {
    bitmap.close();
  }
}

/** Checks a video and grabs a poster frame. The file itself is uploaded unchanged. */
export async function processVideo(file: File): Promise<ProcessedVideo> {
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error(`${file.name} is ${(file.size / 1024 / 1024).toFixed(0)} MB; the limit is 50 MB. Trim it or upload it to YouTube and add the link.`);
  }
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = objectUrl;
  let poster: Blob | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let playable = true;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("unsupported"));
      setTimeout(() => reject(new Error("timeout")), 15_000);
    });
    width = video.videoWidth || null;
    height = video.videoHeight || null;
    video.currentTime = Math.min(1, (video.duration || 2) / 2);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 5_000);
    });
    if (width && height) {
      const scale = Math.min(1, THUMB_MAX_PX / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      poster = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    }
  } catch {
    playable = false;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  const mov = /\.mov$/i.test(file.name) || file.type === "video/quicktime";
  const warning = !playable
    ? "This browser can't play this video (often iPhone HEVC). It may not play for visitors either; MP4 (H.264) or YouTube is safer."
    : mov
      ? "QuickTime (.mov) videos don't play in every browser. MP4 (H.264) is safer."
      : null;
  return { file, poster, width, height, takenAt: new Date(file.lastModified).toISOString(), warning };
}

export function extensionOf(file: File, fallback: string) {
  return file.name.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ?? fallback;
}
