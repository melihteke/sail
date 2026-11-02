/** The four free-text parts of a log entry, each Markdown. */
export interface SailSections {
  howItWent: string;
  whatIPractised: string;
  learnings: string;
  notes: string;
}

export const SECTION_TITLES: Record<keyof SailSections, string> = {
  howItWent: "How it went",
  whatIPractised: "What I practised",
  learnings: "Learnings",
  notes: "Notes",
};

const HEADINGS: [keyof SailSections, RegExp][] = [
  ["howItWent", /^how it went$/i],
  ["whatIPractised", /^what i practi[sc]ed$/i],
  ["learnings", /^(learnings?|lessons?( learned)?)$/i],
];

/**
 * Splits a Markdown body written with "## How it went / ## What I practised / ## Learnings" headings into
 * sections. Text before the first heading and under any other heading goes to `notes`.
 */
export function splitSections(markdown: string): SailSections {
  const out: SailSections = { howItWent: "", whatIPractised: "", learnings: "", notes: "" };
  const body = markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\r\n/g, "\n");
  let current: keyof SailSections = "notes";
  const buckets: Record<keyof SailSections, string[]> = { howItWent: [], whatIPractised: [], learnings: [], notes: [] };
  for (const line of body.split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const match = HEADINGS.find(([, re]) => re.test(heading[1]!.trim()));
      if (match) {
        current = match[0];
        continue;
      }
      current = "notes";
    }
    buckets[current].push(line);
  }
  for (const key of Object.keys(buckets) as (keyof SailSections)[]) out[key] = buckets[key].join("\n").trim();
  return out;
}

/** URL-safe slug: lower-case ASCII words joined by dashes. */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function sailSlug(date: string, title: string) {
  return [date, slugify(title) || "sail"].join("-");
}
