import type { APIRoute, GetStaticPaths } from "astro";
import { getSails, readGpx, type Sail } from "@/lib/sails";

export const getStaticPaths = (async () => {
  const sails = await getSails();
  return sails.map((sail) => ({ params: { slug: sail.slug }, props: { sail } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const xml = await readGpx((props as { sail: Sail }).sail);
  return new Response(xml, { headers: { "Content-Type": "application/gpx+xml" } });
};
