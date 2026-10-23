#!/usr/bin/env node
// Convert phone photos/videos (iCloud HEIC/MOV, WhatsApp JPG/MP4) into web-ready files for a sail.
//
//   npm run add-media -- <sail> [files...] [--mute] [--max-seconds N]
//
// <sail>  folder name or a unique part of it, e.g. 2026-10-17 or morning-sail
// files   photos/videos to add. If omitted, everything in ./inbox/ is used and the
//         originals are moved to ./inbox/processed/<sail>/ afterwards.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import exifr from "exifr";
import heicConvert from "heic-convert";
import sharp from "sharp";

const run = promisify(execFile);

const SAILS_DIR = join("src", "content", "sails");
const INBOX = "inbox";
const PHOTO_EXT = new Set([".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v", ".3gp", ".webm", ".mkv", ".avi"]);
const PHOTO_MAX_PX = 2400;
const VIDEO_MAX_PX = 1280;
const VIDEO_WARN_MB = 50;
const VIDEO_LIMIT_MB = 95; // GitHub rejects files over 100 MB

const args = process.argv.slice(2);
const flags = { mute: false, maxSeconds: 0 };
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mute") flags.mute = true;
  else if (args[i] === "--max-seconds") flags.maxSeconds = Number(args[++i]);
  else positional.push(args[i]);
}
const [sailArg, ...fileArgs] = positional;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!sailArg) fail('Usage: npm run add-media -- <sail> [files...] [--mute] [--max-seconds N]');
if (!ffmpegPath || !existsSync(ffmpegPath)) fail("ffmpeg binary missing. Run: npm install");

const sails = readdirSync(SAILS_DIR).filter((d) => statSync(join(SAILS_DIR, d)).isDirectory());
const matches = sails.filter((d) => d === sailArg || d.includes(sailArg));
const sail = sails.includes(sailArg) ? sailArg : matches.length === 1 ? matches[0] : null;
if (!sail) fail(matches.length ? `"${sailArg}" matches several sails: ${matches.join(", ")}` : `No sail folder matches "${sailArg}". Create it first with npm run new-sail.`);

const fromInbox = fileArgs.length === 0;
const inputs = (fromInbox ? (existsSync(INBOX) ? readdirSync(INBOX).map((f) => join(INBOX, f)) : []) : fileArgs)
  .filter((f) => existsSync(f) && statSync(f).isFile())
  .filter((f) => {
    const ext = extname(f).toLowerCase();
    const ok = PHOTO_EXT.has(ext) || VIDEO_EXT.has(ext);
    if (!ok) console.warn(`• skipping ${basename(f)} (unsupported type)`);
    return ok;
  });
if (!inputs.length) fail(fromInbox ? `No photos or videos found in ./${INBOX}/` : "No valid files given.");

const sailDir = join(SAILS_DIR, sail);
const photoDir = join(sailDir, "photos");
const videoDir = join(sailDir, "videos");
mkdirSync(photoDir, { recursive: true });
mkdirSync(videoDir, { recursive: true });

// Continue numbering after existing media so new files sort after old ones.
let counter = Math.max(0, ...[...readdirSync(photoDir), ...readdirSync(videoDir)].map((f) => Number.parseInt(f, 10)).filter(Number.isFinite));
function nextName(input) {
  counter += 1;
  const stem = basename(input, extname(input)).toLowerCase().normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return `${String(counter).padStart(2, "0")}-${stem || "media"}`;
}

async function addPhoto(input) {
  const ext = extname(input).toLowerCase();
  let source = await readFile(input);
  if (ext === ".heic" || ext === ".heif") source = Buffer.from(await heicConvert({ buffer: source, format: "JPEG", quality: 0.95 }));
  const out = join(photoDir, `${nextName(input)}.jpg`);
  // sharp drops EXIF (incl. GPS) unless withMetadata() is used; rotate() bakes in the orientation.
  await sharp(source)
    .rotate()
    .resize({ width: PHOTO_MAX_PX, height: PHOTO_MAX_PX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  return out;
}

async function probe(input) {
  // ffmpeg -i without an output exits non-zero; the stream info is on stderr.
  const { stderr } = await run(ffmpegPath, ["-hide_banner", "-i", input]).catch((e) => e);
  const video = stderr.split("\n").find((l) => /Stream #.*Video:/.test(l)) ?? "";
  const created = stderr.match(/com\.apple\.quicktime\.creationdate\s*:\s*(\S+)/)?.[1] ?? stderr.match(/creation_time\s*:\s*(\S+)/)?.[1];
  return {
    hdr: /arib-std-b67|smpte2084/.test(video),
    hasAudio: /Stream #.*Audio:/.test(stderr),
    created: created ? Date.parse(created.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")) : NaN,
  };
}

/** Best-effort capture time so iCloud and WhatsApp files end up in shooting order. */
async function captureTime(input) {
  const ext = extname(input).toLowerCase();
  let time = NaN;
  if (PHOTO_EXT.has(ext)) {
    const exif = await exifr.parse(input, ["DateTimeOriginal", "CreateDate"]).catch(() => null);
    time = (exif?.DateTimeOriginal ?? exif?.CreateDate)?.getTime?.() ?? NaN;
  } else {
    time = (await probe(input)).created;
  }
  if (Number.isFinite(time) && time > Date.UTC(2000, 0, 1)) return time;
  // WhatsApp strips metadata but keeps the date in the name: IMG-20261025-WA0003.jpg
  const wa = basename(input).match(/(?:IMG|VID|PTT|AUD)-(\d{4})(\d{2})(\d{2})-WA(\d+)/i);
  if (wa) return new Date(+wa[1], +wa[2] - 1, +wa[3], 12, 0, Number(wa[4])).getTime();
  return statSync(input).mtimeMs;
}

async function addVideo(input) {
  const info = await probe(input);
  const name = nextName(input);
  const out = join(videoDir, `${name}.mp4`);
  const poster = join(videoDir, `${name}.jpg`);
  const even = (expr) => `trunc(${expr}/2)*2`;
  const filters = [
    `scale='if(gte(iw,ih),${even(`min(${VIDEO_MAX_PX},iw)`)},-2)':'if(gte(iw,ih),-2,${even(`min(${VIDEO_MAX_PX},ih)`)})'`,
  ];
  if (info.hdr) {
    // iPhone HDR (HLG / Dolby Vision) → SDR, otherwise colours look washed out on most screens.
    filters.push("zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709", "tonemap=tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv");
  }
  filters.push("format=yuv420p");

  const audio = info.hasAudio && !flags.mute ? ["-map", "0:a:0", "-c:a", "aac", "-b:a", "128k", "-ac", "2"] : ["-an"];
  await run(
    ffmpegPath,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", input,
      ...(flags.maxSeconds > 0 ? ["-t", String(flags.maxSeconds)] : []),
      "-map", "0:v:0", ...audio,
      "-vf", filters.join(","),
      "-fpsmax", "30",
      "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-profile:v", "high",
      "-map_metadata", "-1", "-map_chapters", "-1",
      "-movflags", "+faststart",
      out,
    ],
    { maxBuffer: 16 * 1024 * 1024 },
  );

  const mb = statSync(out).size / 1024 / 1024;
  if (mb > VIDEO_LIMIT_MB) {
    unlinkSync(out);
    throw new Error(`result is ${mb.toFixed(0)} MB (GitHub limit 100 MB). Try --max-seconds 60 to trim it.`);
  }
  if (mb > VIDEO_WARN_MB) console.warn(`  ⚠ ${basename(out)} is ${mb.toFixed(0)} MB; consider trimming with --max-seconds.`);

  for (const at of ["1", "0"]) {
    await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-ss", at, "-i", out, "-frames:v", "1", "-q:v", "3", poster]).catch(() => {});
    if (existsSync(poster)) break;
  }
  return `${out}${info.hdr ? " (HDR → SDR)" : ""}, ${mb.toFixed(1)} MB`;
}

const ordered = (await Promise.all(inputs.map(async (file) => ({ file, time: await captureTime(file) }))))
  .sort((a, b) => a.time - b.time || a.file.localeCompare(b.file, undefined, { numeric: true }))
  .map((x) => x.file);

const done = [];
let failed = 0;
for (const input of ordered) {
  const ext = extname(input).toLowerCase();
  process.stdout.write(`→ ${basename(input)} … `);
  try {
    const result = PHOTO_EXT.has(ext) ? await addPhoto(input) : await addVideo(input);
    console.log(`✓ ${result}`);
    done.push(input);
  } catch (error) {
    failed += 1;
    console.log(`✖ ${error.message?.split("\n")[0] ?? error}`);
  }
}

if (fromInbox && done.length) {
  const archive = join(INBOX, "processed", sail);
  mkdirSync(archive, { recursive: true });
  for (const f of done) renameSync(f, join(archive, basename(f)));
  console.log(`\nOriginals moved to ${archive}`);
}

console.log(`\n${done.length} added${failed ? `, ${failed} failed` : ""} → ${resolve(sailDir)}`);
console.log("Optional captions in index.md:\ncaptions:\n  01-example.jpg: Leaving the jetty");
if (failed) process.exitCode = 1;
