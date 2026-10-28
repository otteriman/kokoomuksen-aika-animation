# Kokoomuksen aika

Lyhyt MP4-animaatio: juokseva aikajana 1987–2027, joka näyttää kokoomuksen
olleen lähes tauotta pääministeri- tai valtiovarainministeripuolue.

- Suunnitelma (tyyli, visualisointi, käsikirjoitus, tekninen toteutus): [SUUNNITELMA.md](SUUNNITELMA.md)
- Faktapohja: [data/hallitukset.json](data/hallitukset.json). Animaation luvut lasketaan tästä tiedostosta.
- Esikatselu: [esikatselu/kokoomuksen-aika-9x16.mp4](esikatselu/kokoomuksen-aika-9x16.mp4)

## Tila

Kohtaukset 1–4 on toteutettu (noin 46 s, 9:16):

1. Koukku: "Kuka on pitänyt Suomen kassaa hallussaan viimeiset 40 vuotta?"
2. Juokseva aikajana 1987 → 2027 milestone-kortteineen
3. Koko jana kerralla: "32 vuotta 40:stä."
4. Pylväsvertailu puolueittain ja "Millään muulla puolueella…"

## Käyttö

Vaatii Node.js 18+.

```bash
npm install
```

```bash
npm run studio
```

```bash
npm run render
```

`studio` avaa esikatselun selaimeen. `render` kirjoittaa videon tiedostoon
`out/kokoomuksen-aika-9x16.mp4`.

Ajoitukset ovat tiedostossa `src/timing.ts`, värit ja fontti tiedostossa
`src/theme.ts`, ja kohtaukset tiedostoissa `src/Hook.tsx` ja `src/Story.tsx`.
