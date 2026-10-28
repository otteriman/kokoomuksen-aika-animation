import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "./theme";
import { KYSYMYS } from "./timing";

const RIVI1 = "Jos kokoomuksen lääkkeet toimisivat,";
// Viimeinen kysymysmerkki on oma sanansa, jotta se voi liukua "Miksi"-sanan perään.
const RIVI2 = ["Miksi", "Suomen", "talous", "ei", "ole", "jo", "huippukunnossa", "?"];
const SÄILYVÄT = new Set([0, RIVI2.length - 1]);

const KOKO2 = 84;
const KOKO_LOPPU = 230;
const RIVIVÄLI = 1.12;
const PAINO = 800;
const VÄLISTYS = -0.02; // em
const MAKSIMILEVEYS = 900;
const RIVI2_Y = 900;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const mittaa = (() => {
  let ctx: CanvasRenderingContext2D | null = null;
  return (teksti: string, koko: number) => {
    ctx ??= document.createElement("canvas").getContext("2d");
    if (!ctx) return teksti.length * koko * 0.6;
    ctx.font = `${PAINO} ${koko}px ${FONT}`;
    ctx.letterSpacing = `${VÄLISTYS * koko}px`;
    return ctx.measureText(teksti).width;
  };
})();

type Sana = { teksti: string; x: number; y: number };

/** Asettelee sanat keskitetyille riveille, jotta jokaisen sanan paikka tiedetään animointia varten. */
const asettele = (leveys: number): Sana[] => {
  const väli = mittaa(" ", KOKO2);
  const rivit: { sanat: { teksti: string; w: number; ennenVäli: number }[]; w: number }[] = [];
  RIVI2.forEach((teksti) => {
    const w = mittaa(teksti, KOKO2);
    const liitetty = teksti === "?";
    const rivi = rivit[rivit.length - 1];
    const ennenVäli = liitetty ? 0 : väli;
    if (rivi && (liitetty || rivi.w + ennenVäli + w <= MAKSIMILEVEYS)) {
      rivi.sanat.push({ teksti, w, ennenVäli });
      rivi.w += ennenVäli + w;
    } else {
      rivit.push({ sanat: [{ teksti, w, ennenVäli: 0 }], w });
    }
  });
  const sanat: Sana[] = [];
  rivit.forEach((rivi, r) => {
    let x = (leveys - rivi.w) / 2;
    for (const sana of rivi.sanat) {
      x += sana.ennenVäli;
      sanat.push({ teksti: sana.teksti, x, y: RIVI2_Y + r * KOKO2 * RIVIVÄLI });
      x += sana.w;
    }
  });
  return sanat;
};

export const Kysymys: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sanat = asettele(width);
  const muutPois = 1 - interpolate(frame, [KYSYMYS.muutPois, KYSYMYS.muutPois + 15], [0, 1], clamp);
  const k = interpolate(frame, [KYSYMYS.kokoontuminen, KYSYMYS.kokoontuminen + KYSYMYS.kokoontumisKesto], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const kaikkiPois = 1 - interpolate(frame, [KYSYMYS.pois, KYSYMYS.kesto], [0, 1], clamp);

  // "Miksi?" kootaan ruudun keskelle isona.
  const skaala = 1 + (KOKO_LOPPU / KOKO2 - 1) * k;
  const miksiW = mittaa("Miksi", KOKO_LOPPU);
  const loppuW = miksiW + mittaa("?", KOKO_LOPPU);
  const loppuY = height / 2 - (KOKO_LOPPU * RIVIVÄLI) / 2;
  const loppuX = [(width - loppuW) / 2, (width - loppuW) / 2 + miksiW];

  const rivi1 = spring({ frame: frame - KYSYMYS.rivi1, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: COLORS.text, opacity: kaikkiPois }}>
      <div
        style={{
          position: "absolute",
          top: RIVI2_Y - 190,
          left: 90,
          width: width - 180,
          textAlign: "center",
          fontSize: 64,
          fontWeight: 500,
          lineHeight: 1.2,
          color: COLORS.textMuted,
          opacity: rivi1 * muutPois,
          transform: `translateY(${(1 - rivi1) * 24}px)`,
        }}
      >
        {RIVI1}
      </div>

      {sanat.map((sana, i) => {
        const sisään = spring({ frame: frame - KYSYMYS.rivi2 - i * 5, fps, config: { damping: 200 } });
        const säilyy = SÄILYVÄT.has(i);
        const x = säilyy ? interpolate(k, [0, 1], [sana.x, loppuX[i === 0 ? 0 : 1]]) : sana.x;
        const y = säilyy ? interpolate(k, [0, 1], [sana.y, loppuY]) : sana.y;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: KOKO2,
              fontWeight: PAINO,
              lineHeight: RIVIVÄLI,
              letterSpacing: `${VÄLISTYS}em`,
              whiteSpace: "pre",
              transformOrigin: "0 0",
              opacity: sisään * (säilyy ? 1 : muutPois),
              transform: `translateY(${(1 - sisään) * 24}px) scale(${säilyy ? skaala : 1})`,
              filter: säilyy ? undefined : `blur(${(1 - muutPois) * 8}px)`,
            }}
          >
            {sana.teksti}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
