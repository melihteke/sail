import type { ImageMetadata } from "astro";
import boatPhoto from "@/assets/boat/polyvalk.jpg";
import { BOAT_DATA } from "./boat-data";

/** Legacy boat (Markdown mode) with its photo; the plain data lives in boat-data.ts so Node scripts can read it. */
export const BOAT = { ...BOAT_DATA, photo: boatPhoto as ImageMetadata | undefined };
