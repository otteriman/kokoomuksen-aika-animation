import raw from "../data/hallitukset.json";

export type Puolue = "KOK" | "SDP" | "KESK" | "PS";
export type Rooli = "PM" | "VM";

type Hallitus = {
  nimi: string;
  alku: string;
  loppu: string | null;
  pm: { puolue: Puolue; henkilot: string[] };
  vm: { puolue: Puolue; henkilot: string[] };
};

export const ALKUVUOSI = 1987;
export const LOPPUVUOSI = 2027;
export const KAUDEN_PITUUS = 4;

export type Vaalikausi = {
  alku: number;
  loppu: number;
  hallitukset: string[];
  pm: Puolue;
  vm: Puolue;
  /** Kokoomuksen rooli kaudella, null = oppositiossa. PM ohittaa VM:n. */
  kokRooli: Rooli | null;
  kokHenkilot: string[];
};

const hallitukset = (raw as { hallitukset: Hallitus[] }).hallitukset;

const ainoa = <T,>(arvot: T[], mita: string, kausi: number): T => {
  const uniikit = [...new Set(arvot)];
  if (uniikit.length !== 1) {
    throw new Error(`Vaalikausi ${kausi}: ${mita} vaihtelee (${uniikit.join(", ")})`);
  }
  return uniikit[0];
};

// Hallitus kuuluu vaalikauteen, joka on alkanut viimeisimpänä ennen sen aloituspäivää.
export const VAALIKAUDET: Vaalikausi[] = Array.from(
  { length: (LOPPUVUOSI - ALKUVUOSI) / KAUDEN_PITUUS },
  (_, i) => {
    const alku = ALKUVUOSI + i * KAUDEN_PITUUS;
    const kauden = hallitukset.filter((h) => {
      const vuosi = Number(h.alku.slice(0, 4));
      return vuosi >= alku && vuosi < alku + KAUDEN_PITUUS;
    });
    const pm = ainoa(kauden.map((h) => h.pm.puolue), "PM-puolue", alku);
    const vm = ainoa(kauden.map((h) => h.vm.puolue), "VM-puolue", alku);
    const kokRooli: Rooli | null = pm === "KOK" ? "PM" : vm === "KOK" ? "VM" : null;
    const kokHenkilot = kokRooli
      ? [...new Set(kauden.flatMap((h) => (kokRooli === "PM" ? h.pm : h.vm).henkilot))]
      : [];
    return {
      alku,
      loppu: alku + KAUDEN_PITUUS,
      hallitukset: kauden.map((h) => h.nimi),
      pm,
      vm,
      kokRooli,
      kokHenkilot,
    };
  },
);

export const PUOLUEIDEN_NIMET: Record<Puolue, string> = {
  KOK: "Kokoomus",
  SDP: "SDP",
  KESK: "Keskusta",
  PS: "Perussuomalaiset",
};

export type PuolueenVuodet = { puolue: Puolue; pm: number; vm: number; yhteensa: number };

export const PUOLUEIDEN_VUODET: PuolueenVuodet[] = (["KOK", "SDP", "KESK", "PS"] as Puolue[])
  .map((puolue) => {
    const pm = VAALIKAUDET.filter((k) => k.pm === puolue).length * KAUDEN_PITUUS;
    const vm = VAALIKAUDET.filter((k) => k.vm === puolue).length * KAUDEN_PITUUS;
    return { puolue, pm, vm, yhteensa: pm + vm };
  })
  .sort((a, b) => b.yhteensa - a.yhteensa);
