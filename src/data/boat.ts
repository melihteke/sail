import type { ImageMetadata } from "astro";

/**
 * Boat details for /boat. Fill in the personal fields (name, sail number, home port).
 * To use your own photo, replace src/assets/boat/polyvalk.jpg and set photoCredit to undefined.
 */
import boatPhoto from "@/assets/boat/polyvalk.jpg";

export const BOAT = {
  name: "Polyvalk",
  model: "Polyvalk Classic",
  builder: "Ottenhome Heeg (hull by Breehorn, Woudsend)",
  builderUrl: "https://ottenhomeheegverkoop.nl/polyvalk-classic/",
  designer: "E.G. van de Stadt",
  designYear: 1939,
  sailNumber: undefined as string | undefined,
  homePort: "De Poel, Amstelveen",
  photo: boatPhoto as ImageMetadata | undefined,
  /** Required attribution for the CC BY-SA 4.0 stock photo (Wikimedia Commons). */
  photoCredit: {
    text: "A Polyvalk sailing on the Zijl, Leiden. Photo: Arjuno3",
    url: "https://commons.wikimedia.org/wiki/File:Sailing_on_the_Zijl_in_Leiden,_Netherlands-P3190020.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  } as { text: string; url: string; license: string; licenseUrl: string } | undefined,
  description:
    "The Polyvalk is the polyester descendant of the classic wooden Valk, designed by E.G. van de Stadt in 1939 for Bruynzeel and a national racing class since 1940. Today it is one of the most popular open keelboats in the Netherlands: stable, forgiving, practically unsinkable with a self-draining cockpit, and still lively enough to sail sportily. Its shallow draft makes it perfect for Dutch lakes and canals; the low bow means it is not meant for the IJsselmeer or open sea.",
  specs: [
    { label: "Length overall", value: "6.50 m", hint: "21 ft 4 in" },
    { label: "Beam", value: "2.00 m", hint: "6 ft 7 in" },
    { label: "Draft", value: "≈ 0.85 m", hint: "fixed keel" },
    { label: "Displacement", value: "≈ 530 kg", hint: "class figure (wooden Valk)" },
    { label: "Mainsail", value: "12.0 m²" },
    { label: "Jib (touring)", value: "4.0 m²" },
    { label: "Genoa (racing)", value: "6.5 m²" },
    { label: "Spinnaker (racing)", value: "14.5 m²" },
    { label: "Rig", value: "Sloop, aluminium spars", hint: "mast easily lowered for bridges" },
    { label: "Hull", value: "Polyester (GRP)", hint: "self-draining cockpit" },
    { label: "Rudder", value: "Transom-hung" },
    { label: "Crew", value: "2–3 racing, up to 5 touring" },
    { label: "SW yardstick", value: "104", hint: "Dutch handicap number" },
  ],
  sources: [
    { label: "Valk (boot), Wikipedia NL", url: "https://nl.wikipedia.org/wiki/Valk_(boot)" },
    { label: "Polyvalk Classic, Ottenhome Heeg", url: "https://ottenhomeheegverkoop.nl/polyvalk-classic/" },
  ],
};
