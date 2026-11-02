import { describe, expect, it } from "vitest";
import { sailSlug, slugify, splitSections } from "./sections";
import { parseYouTube } from "./youtube";

describe("splitSections", () => {
  it("splits the standard headings and keeps the rest as notes", () => {
    const md = `<!-- draft -->
Intro line.

## How it went

Windy!

## What I practised

- Tacks

## Learnings

- Ease early

## Gear

New gloves.`;
    const s = splitSections(md);
    expect(s.howItWent).toBe("Windy!");
    expect(s.whatIPractised).toBe("- Tacks");
    expect(s.learnings).toBe("- Ease early");
    expect(s.notes).toBe("Intro line.\n\n## Gear\n\nNew gloves.");
  });

  it("accepts American spelling and lessons learned", () => {
    const s = splitSections("## What I Practiced\nA\n## Lessons learned\nB");
    expect(s.whatIPractised).toBe("A");
    expect(s.learnings).toBe("B");
  });
});

describe("slugs", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Windy morning on De Poel!")).toBe("windy-morning-on-de-poel");
    expect(slugify("Çeşme — Ilıca koyu")).toBe("cesme-ilica-koyu");
    expect(sailSlug("2026-10-25", "  ")).toBe("2026-10-25-sail");
  });
});

describe("parseYouTube", () => {
  it("understands common link formats", () => {
    expect(parseYouTube("https://www.youtube.com/watch?v=YTIL6oU7hag&t=405s")).toMatchObject({ id: "YTIL6oU7hag", start: 405 });
    expect(parseYouTube("https://youtu.be/YTIL6oU7hag?t=1m30s")?.start).toBe(90);
    expect(parseYouTube("https://www.youtube.com/shorts/aqz-KE-bpKQ")?.shorts).toBe(true);
    expect(parseYouTube("https://vimeo.com/1")).toBeNull();
  });
});
