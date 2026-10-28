import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ALKUVUOSI,
  KAUDEN_PITUUS,
  LOPPUVUOSI,
  PUOLUEIDEN_NIMET,
  PUOLUEIDEN_VUODET,
  VAALIKAUDET,
} from "./data";
import { COLORS, FONT } from "./theme";
import {
  AJO_ALKU,
  KAUSIEN_AJAT,
  KUTISTUS_ALKU,
  KUTISTUS_KESTO,
  LOPPULAUSE_ALKU,
  PALKIT_ALKU,
  YHTEENVETO_ALKU,
  ZOOM_ALKU,
  ZOOM_KESTO,
  kameraVuosiRuudulla,
  vuosiRuudulla,
} from "./timing";

// Asettelu 9:16 (1080×1920). Kolme tilaa: juokseva jana → koko jana → pylväskaavio.
const AJO = { vasen: 100, ppy: 200, palkkiY: 1250, palkkiH: 18 };
const KOKO = { x0: 100, ppy: 22, palkkiY: 1000, palkkiH: 28 };
const KAAVIO = { riviY: [560, 770, 980, 1190], palkkiH: 56 };
const SAUMA = 4; // rako vaalikausien välissä
const PM_TOLPPA = 470;
const VM_TOLPPA = 320;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pehmeä = Easing.inOut(Easing.cubic);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const vaihe = (frame: number, alku: number, kesto: number, easing = pehmeä) =>
  interpolate(frame, [alku, alku + kesto], [0, 1], { ...clamp, easing });
const esiin = (frame: number, alku: number, kesto = 15) =>
  interpolate(frame, [alku, alku + kesto], [0, 1], clamp);

const ROOLIT = { PM: "PÄÄMINISTERI", VM: "VALTIOVARAIN­MINISTERI" } as const;

const teksti: React.CSSProperties = { position: "absolute", fontFamily: FONT, color: COLORS.text };

export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const vuosi = vuosiRuudulla(frame);
  const z = vaihe(frame, ZOOM_ALKU, ZOOM_KESTO);
  const k = vaihe(frame, KUTISTUS_ALKU, KUTISTUS_KESTO);

  // Vuoden x-koordinaatti: juoksevassa tilassa kamera näyttää käynnissä olevan kauden, zoomissa koko jana näkyy.
  const kameraVuosi = kameraVuosiRuudulla(frame);
  const xAjo = (y: number) => AJO.vasen + (y - kameraVuosi) * AJO.ppy;
  const xKoko = (y: number) => KOKO.x0 + (y - ALKUVUOSI) * KOKO.ppy;
  const X = (y: number) => lerp(xAjo(y), xKoko(y), z);
  const palkkiY = lerp(AJO.palkkiY, KOKO.palkkiY, z);
  const palkkiH = lerp(AJO.palkkiH, KOKO.palkkiH, z);

  const ajoNäkyvyys = 1 - vaihe(frame, ZOOM_ALKU, ZOOM_KESTO * 0.5);
  const kokoNäkyvyys = esiin(frame, YHTEENVETO_ALKU - 10, 20) * (1 - esiin(frame, KUTISTUS_ALKU, 12));

  const kokVuodet = VAALIKAUDET.reduce(
    (summa, kausi) => summa + (kausi.kokRooli ? Math.min(Math.max(vuosi - kausi.alku, 0), KAUDEN_PITUUS) : 0),
    0,
  );

  let kokIndeksi = 0;
  const kokPuolue = PUOLUEIDEN_VUODET.find((p) => p.puolue === "KOK")!;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: esiin(frame, 0, 12) }}>
      {/* Iso juokseva vuosiluku */}
      <div
        style={{
          ...teksti,
          top: 210,
          width,
          textAlign: "center",
          fontSize: 230,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
          opacity: ajoNäkyvyys,
        }}
      >
        {Math.min(LOPPUVUOSI, Math.floor(vuosi))}
      </div>

      {/* Taustaraita koko 40 vuodelle */}
      <div
        style={{
          position: "absolute",
          left: X(ALKUVUOSI),
          width: X(LOPPUVUOSI) - X(ALKUVUOSI),
          top: palkkiY - palkkiH / 2,
          height: palkkiH,
          borderRadius: 4,
          background: COLORS.track,
          opacity: 1 - esiin(frame, KUTISTUS_ALKU, 15),
        }}
      />

      {VAALIKAUDET.map((kausi, i) => {
        const ajat = KAUSIEN_AJAT[i];
        const seuraava = KAUSIEN_AJAT[i + 1];
        const täyttö = Math.min(Math.max(vuosi, kausi.alku), kausi.loppu);
        if (täyttö <= kausi.alku) return null;

        const vasen = X(kausi.alku) + SAUMA / 2;
        const oikea = X(täyttö) - (täyttö === kausi.loppu ? SAUMA / 2 : 0);
        const himmennys = seuraava ? interpolate(frame, [seuraava.alku, seuraava.alku + 15], [1, 0.3], clamp) : 1;
        const korttiNäkyvyys = himmennys * ajoNäkyvyys;

        if (!kausi.kokRooli) {
          return (
            <React.Fragment key={kausi.alku}>
              <div
                style={{
                  position: "absolute",
                  left: vasen,
                  width: oikea - vasen,
                  top: palkkiY - palkkiH / 2,
                  height: palkkiH,
                  borderRadius: 4,
                  background: `repeating-linear-gradient(90deg, ${COLORS.opposition} 0 14px, transparent 14px 22px)`,
                  opacity: 1 - esiin(frame, KUTISTUS_ALKU, 15),
                }}
              />
              <div
                style={{
                  ...teksti,
                  left: X(kausi.alku) + 6,
                  top: palkkiY - 82,
                  fontSize: 30,
                  fontWeight: 500,
                  color: COLORS.textMuted,
                  opacity: esiin(frame, ajat.alku + 6) * korttiNäkyvyys,
                }}
              >
                Kokoomus oppositiossa
              </div>
            </React.Fragment>
          );
        }

        // Kokoomuksen kausi: segmentti liukuu kutistuksessa yhtenäiseksi pylvääksi.
        const j = kokIndeksi++;
        const kaavioVasen = KOKO.x0 + j * KAUDEN_PITUUS * KOKO.ppy + SAUMA / 2;
        const segH = lerp(palkkiH, KAAVIO.palkkiH, k);
        const segY = lerp(palkkiY, KAAVIO.riviY[0] + KAAVIO.palkkiH / 2, k);
        const segVasen = lerp(vasen, kaavioVasen, k);
        const segLeveys = lerp(oikea - vasen, KAUDEN_PITUUS * KOKO.ppy - SAUMA, k);

        const nousu = spring({ frame: frame - ajat.alku, fps, config: { damping: 18, mass: 0.8 } });
        const tolppa = (kausi.kokRooli === "PM" ? PM_TOLPPA : VM_TOLPPA) * nousu;
        const kortti = spring({ frame: frame - ajat.alku - 8, fps, config: { damping: 200 } });

        return (
          <React.Fragment key={kausi.alku}>
            <div
              style={{
                position: "absolute",
                left: segVasen,
                width: segLeveys,
                top: segY - segH / 2,
                height: segH,
                borderRadius: 4,
                background: COLORS.kok,
                zIndex: 1,
                boxShadow: `0 0 ${lerp(24, 0, z)}px ${COLORS.kokGlow}`,
              }}
            />
            {/* Tolppa ja kortti */}
            <div
              style={{
                position: "absolute",
                left: X(kausi.alku),
                width: 4,
                top: palkkiY - tolppa,
                height: tolppa,
                background: COLORS.kok,
                opacity: korttiNäkyvyys,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: X(kausi.alku),
                bottom: 1920 - (palkkiY - tolppa),
                width: AJO.ppy * KAUDEN_PITUUS - 28,
                padding: "24px 28px 26px",
                boxSizing: "border-box",
                background: COLORS.card,
                borderLeft: `4px solid ${COLORS.kok}`,
                borderRadius: "0 8px 8px 0",
                opacity: kortti * korttiNäkyvyys,
                transform: `translateY(${(1 - kortti) * 24}px)`,
                fontFamily: FONT,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.14em", color: COLORS.textMuted }}>
                {kausi.alku} · KOKOOMUS
              </div>
              <div
                style={{
                  fontSize: 50,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  marginTop: 8,
                  color: COLORS.text,
                  hyphens: "manual",
                }}
              >
                {ROOLIT[kausi.kokRooli]}
              </div>
              <div style={{ fontSize: 34, fontWeight: 500, marginTop: 12, color: COLORS.textMuted }}>
                {kausi.kokHenkilot.join(", ")}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Vaalivuodet janan alla (juokseva tila) */}
      {VAALIKAUDET.map((kausi) => (
        <div
          key={`v${kausi.alku}`}
          style={{
            ...teksti,
            left: X(kausi.alku) + 6,
            top: palkkiY + 26,
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.textFaint,
            fontVariantNumeric: "tabular-nums",
            opacity: ajoNäkyvyys * (kausi.alku <= vuosi ? 1 : 0.5),
          }}
        >
          {kausi.alku}
        </div>
      ))}

      {/* Toistopää */}
      <div
        style={{
          position: "absolute",
          left: X(Math.max(vuosi, ALKUVUOSI)) - 16,
          top: palkkiY - 16,
          width: 32,
          height: 32,
          borderRadius: 16,
          background: COLORS.text,
          boxShadow: `0 0 0 ${frame > ZOOM_ALKU - 30 ? 8 + 6 * Math.sin(frame / 5) : 8}px rgba(244,244,242,0.15)`,
          opacity: ajoNäkyvyys * esiin(frame, AJO_ALKU - 10),
        }}
      />

      {/* Kertyvä laskuri */}
      <div style={{ ...teksti, left: 0, width, top: 1380, textAlign: "center", opacity: ajoNäkyvyys }}>
        <div style={{ fontSize: 30, fontWeight: 500, color: COLORS.textMuted }}>
          Kokoomus pääministerinä tai
          <br />
          valtiovarainministerinä
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            marginTop: 8,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {Math.floor(kokVuodet)} vuotta
        </div>
      </div>

      {/* Yhteenveto koko janan päällä */}
      <div style={{ ...teksti, left: 0, width, top: 560, textAlign: "center", opacity: kokoNäkyvyys }}>
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: "-0.03em" }}>
          {kokPuolue.yhteensa} vuotta {LOPPUVUOSI - ALKUVUOSI}:stä.
        </div>
      </div>
      <div style={{ ...teksti, left: X(ALKUVUOSI), top: KOKO.palkkiY + 34, fontSize: 30, fontWeight: 500, color: COLORS.textMuted, opacity: kokoNäkyvyys }}>
        {ALKUVUOSI}
      </div>
      <div
        style={{
          ...teksti,
          left: X(LOPPUVUOSI) - 200,
          width: 200,
          textAlign: "right",
          top: KOKO.palkkiY + 34,
          fontSize: 30,
          fontWeight: 500,
          color: COLORS.textMuted,
          opacity: kokoNäkyvyys,
        }}
      >
        {LOPPUVUOSI}
      </div>
      {VAALIKAUDET.filter((kausi) => !kausi.kokRooli).map((kausi) => (
        <div
          key={`aukko${kausi.alku}`}
          style={{
            ...teksti,
            left: X(kausi.alku + KAUDEN_PITUUS / 2) - 100,
            width: 200,
            top: KOKO.palkkiY - 80,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.25,
            color: COLORS.textMuted,
            opacity: kokoNäkyvyys,
          }}
        >
          oppositiossa
          <br />
          {kausi.alku}–{String(kausi.loppu).slice(2)}
        </div>
      ))}
      <div
        style={{
          ...teksti,
          left: 90,
          width: width - 180,
          top: 1150,
          textAlign: "center",
          opacity: kokoNäkyvyys * esiin(frame, YHTEENVETO_ALKU + 20),
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.25 }}>
          Kokoomus on ollut lähes tauotta joko pääministeri- tai valtiovarainministeripuolue.
        </div>
        <div style={{ fontSize: 34, fontWeight: 500, marginTop: 28, color: COLORS.textMuted }}>
          {VAALIKAUDET.length} vaalikaudesta {VAALIKAUDET.filter((kausi) => kausi.kokRooli).length}.
        </div>
      </div>

      {/* Vertailu: pylväät puolueittain */}
      <div style={{ ...teksti, left: KOKO.x0, top: 300, width: width - 2 * KOKO.x0, opacity: esiin(frame, KUTISTUS_ALKU + 20, 20) }}>
        <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Pääministeri tai
          <br />
          valtiovarainministeri
        </div>
        <div style={{ fontSize: 30, fontWeight: 500, marginTop: 14, color: COLORS.textMuted }}>
          Vuosia puolueittain 1987–2027
        </div>
      </div>

      {PUOLUEIDEN_VUODET.map((p, rivi) => {
        const y = KAAVIO.riviY[rivi];
        const onKok = p.puolue === "KOK";
        const kasvuAlku = onKok ? KUTISTUS_ALKU : PALKIT_ALKU + (rivi - 1) * 18;
        const kasvu = onKok ? 1 : vaihe(frame, kasvuAlku, 30, Easing.out(Easing.cubic));
        const tekstit = onKok ? esiin(frame, PALKIT_ALKU - 10) : esiin(frame, kasvuAlku + 6);
        const pituus = p.yhteensa * KOKO.ppy;
        const näkyvä = pituus * kasvu;
        const lohkot = p.yhteensa / KAUDEN_PITUUS;

        return (
          <React.Fragment key={p.puolue}>
            {/* 40 vuoden taustaraita */}
            <div
              style={{
                position: "absolute",
                left: KOKO.x0,
                top: y,
                width: (LOPPUVUOSI - ALKUVUOSI) * KOKO.ppy,
                height: KAAVIO.palkkiH,
                borderRadius: 4,
                background: COLORS.track,
                opacity: esiin(frame, onKok ? KUTISTUS_ALKU + 20 : kasvuAlku - 10, 20),
              }}
            />
            {!onKok &&
              Array.from({ length: lohkot }, (_, b) => {
                const l = b * KAUDEN_PITUUS * KOKO.ppy;
                const w = Math.min(KAUDEN_PITUUS * KOKO.ppy, näkyvä - l) - SAUMA;
                if (w <= 0) return null;
                return (
                  <div
                    key={b}
                    style={{
                      position: "absolute",
                      left: KOKO.x0 + l + SAUMA / 2,
                      top: y,
                      width: w,
                      height: KAAVIO.palkkiH,
                      borderRadius: 4,
                      background: COLORS.otherParty,
                    }}
                  />
                );
              })}
            <div style={{ ...teksti, left: KOKO.x0, top: y - 50, fontSize: 34, fontWeight: 700, opacity: tekstit }}>
              {PUOLUEIDEN_NIMET[p.puolue]}
            </div>
            <div
              style={{
                ...teksti,
                left: KOKO.x0 + näkyvä + 22,
                top: y - 2,
                fontSize: 52,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                opacity: tekstit,
              }}
            >
              {Math.round(p.yhteensa * kasvu)} v
            </div>
            <div
              style={{
                ...teksti,
                left: KOKO.x0,
                top: y + KAAVIO.palkkiH + 12,
                fontSize: 26,
                fontWeight: 500,
                color: COLORS.textMuted,
                opacity: tekstit,
              }}
            >
              {[p.pm && `pääministeri ${p.pm} v`, p.vm && `valtiovarainministeri ${p.vm} v`].filter(Boolean).join(" · ")}
            </div>
          </React.Fragment>
        );
      })}

      <div
        style={{
          ...teksti,
          left: 90,
          width: width - 180,
          top: 1400,
          textAlign: "center",
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          opacity: esiin(frame, LOPPULAUSE_ALKU, 20),
          transform: `translateY(${(1 - vaihe(frame, LOPPULAUSE_ALKU, 20)) * 20}px)`,
        }}
      >
        Millään muulla puolueella ei ole ollut yhtä paljon valtaa Suomen julkiseen talouteen.
      </div>

      {/* Lähde */}
      <div style={{ ...teksti, left: 0, width, top: 1650, textAlign: "center", fontSize: 24, fontWeight: 500, color: COLORS.textFaint }}>
        Lähde: valtioneuvosto.fi – hallitukset ja ministerit
      </div>
    </AbsoluteFill>
  );
};
