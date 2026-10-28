import { ALKUVUOSI, KAUDEN_PITUUS, LOPPUVUOSI, VAALIKAUDET } from "./data";

// Kaikki luvut ovat ruutuja (30 fps).

export const HOOK_KESTO = 120;

// Story-kohtauksen (aikajana → zoom → vertailu) sisäiset ajat.
export const AJO_ALKU = 20;
const KOK_KAUSI_KESTO = 75;
const OPP_KAUSI_KESTO = 45;

/** Kunkin vaalikauden alkuruutu ja kesto. Oppositiokaudet kuluvat nopeammin. */
export const KAUSIEN_AJAT = VAALIKAUDET.reduce<{ alku: number; kesto: number }[]>((acc, k) => {
  const edellinen = acc[acc.length - 1];
  const alku = edellinen ? edellinen.alku + edellinen.kesto : AJO_ALKU;
  acc.push({ alku, kesto: k.kokRooli ? KOK_KAUSI_KESTO : OPP_KAUSI_KESTO });
  return acc;
}, []);

const viimeinen = KAUSIEN_AJAT[KAUSIEN_AJAT.length - 1];
export const AJO_LOPPU = viimeinen.alku + viimeinen.kesto;

export const ZOOM_ALKU = AJO_LOPPU + 30;
export const ZOOM_KESTO = 60;
export const YHTEENVETO_ALKU = ZOOM_ALKU + ZOOM_KESTO;
export const KUTISTUS_ALKU = YHTEENVETO_ALKU + 165;
export const KUTISTUS_KESTO = 45;
export const PALKIT_ALKU = KUTISTUS_ALKU + KUTISTUS_KESTO;
export const KAAVIO_POIS = PALKIT_ALKU + 135;
export const LOPPULAUSE_ALKU = KAAVIO_POIS + 15;
export const STORY_KESTO = LOPPULAUSE_ALKU + 120;

// Kysymys: "Jos kokoomuksen lääkkeet toimisivat, miksi…?" → "Miksi?"
export const KYSYMYS = {
  rivi1: 10,
  rivi2: 45,
  muutPois: 165,
  kokoontuminen: 180,
  kokoontumisKesto: 40,
  pois: 300,
  kesto: 320,
};

export const LOPETUS = { rivi1: 15, rivi2: 75, kesto: 240 };

export const KOKONAISKESTO = HOOK_KESTO + STORY_KESTO + KYSYMYS.kesto + LOPETUS.kesto;

/** Aikajanan vuosi (desimaaleina) annetulla Story-ruudulla. */
export const vuosiRuudulla = (ruutu: number): number => {
  if (ruutu <= AJO_ALKU) return ALKUVUOSI;
  for (let i = 0; i < KAUSIEN_AJAT.length; i++) {
    const { alku, kesto } = KAUSIEN_AJAT[i];
    if (ruutu < alku + kesto) {
      return VAALIKAUDET[i].alku + (KAUDEN_PITUUS * (ruutu - alku)) / kesto;
    }
  }
  return LOPPUVUOSI;
};

const KAMERAN_SIIRTO = 20;

/** Vuosi, jonka kohdalla kameran vasen reuna on: kamera liukuu kauden alkuun kauden ensimmäisten ruutujen aikana. */
export const kameraVuosiRuudulla = (ruutu: number): number => {
  let i = KAUSIEN_AJAT.findIndex(({ alku, kesto }) => ruutu < alku + kesto);
  if (i === -1) i = KAUSIEN_AJAT.length - 1;
  if (i === 0) return VAALIKAUDET[0].alku;
  const t = Math.min(Math.max((ruutu - KAUSIEN_AJAT[i].alku) / KAMERAN_SIIRTO, 0), 1);
  const pehmeä = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return VAALIKAUDET[i - 1].alku + (VAALIKAUDET[i].alku - VAALIKAUDET[i - 1].alku) * pehmeä;
};
