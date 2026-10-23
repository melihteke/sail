import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";
import { getSails, type Sail } from "@/lib/sails";

export const getStaticPaths = (async () => {
  const sails = await getSails();
  return sails.map((sail) => ({ params: { slug: sail.slug }, props: { sail } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { entry } = (props as { sail: Sail }).sail;
  const xml = await readFile(join(process.cwd(), dirname(entry.filePath!), entry.data.gpx), "utf8");
  return new Response(xml, { headers: { "Content-Type": "application/gpx+xml" } });
};
