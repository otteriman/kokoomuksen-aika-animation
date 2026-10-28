import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT = "Inter";

for (const weight of ["400", "500", "700", "800"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`),
    weight,
  });
}

export const COLORS = {
  bg: "#0E1116",
  text: "#F4F4F2",
  textMuted: "#8A93A0",
  textFaint: "#5C6470",
  kok: "#2A78C2",
  kokGlow: "rgba(42, 120, 194, 0.45)",
  opposition: "#3A414C",
  otherParty: "#5A6370",
  track: "#1B2029",
  card: "#151A21",
};

export const FPS = 30;
