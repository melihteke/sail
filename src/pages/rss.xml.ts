import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { marked } from "marked";
import { SITE } from "@/config";
import { getSails } from "@/lib/sails";
import { SECTION_TITLES, type SailSections } from "@/lib/sections";
import { formatDuration, formatNm } from "@/lib/units";
import { url } from "@/lib/url";

export async function GET(context: APIContext) {
  const sails = await getSails();
  return rss({
    title: `${SITE.title} · new sails`,
    description: SITE.description,
    site: new URL(url("/"), context.site).toString(),
    customData: "<language>en-gb</language>",
    items: sails.slice(0, 50).map((sail) => {
      const facts = `${formatNm(sail.stats.distanceNm)} · ${formatDuration(sail.stats.elapsedSec)} · ${sail.location}`;
      const body = (Object.keys(SECTION_TITLES) as (keyof SailSections)[])
        .filter((k) => sail.sections[k].trim())
        .map((k) => `<h2>${SECTION_TITLES[k]}</h2>${marked.parse(sail.sections[k], { async: false })}`)
        .join("");
      return {
        title: sail.title,
        link: url(`/logbook/${sail.slug}/`),
        pubDate: new Date(sail.stats.start),
        description: `${sail.summary} (${facts})`,
        content: `<p><strong>${facts}</strong></p><p>${sail.summary}</p>${body}`,
        categories: sail.tags,
      };
    }),
  });
}
