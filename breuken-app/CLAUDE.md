# Breuken-app — reminder voor Claude

## Afspraken met Irma

1. **Stel altijd vragen voordat je begint met bouwen.** Wat voor soort opgaven? Welke niveaus? Welke regels/variabelen? Wacht op antwoord.
2. **Getallen altijd random genereren.** Gebruik `rand()`, `pick()`, `Math.random()`. Sinds augustus 2026 geldt dit ook voor dubbele haakjes en ontbinden: die kiezen nu $p$ en $q$ random en bouwen de opgave daaruit op. Alleen `B.H1b` en `B.H1c` (herleiden door ontbinden) hebben nog een vaste pool.
   - `generateVraag()` in `questions.js` onthoudt per leerdoel de laatste vijf opgaven en trekt opnieuw bij een herhaling. Nieuwe generators hoeven daar niets voor te doen.
   - Let bij het opbouwen van een opgavetekst op de coëfficiënt 1: gebruik `_alM` / `_plusTerm` in plaats van `${c}${v}`, anders komt er `1x` te staan.
   - Decimalen hoeven niet met de hand omgezet: `generateVraag()` zet elke `1.5` binnen `$...$` om naar `1{,}5` (Nederlandse notatie). Buiten `$...$` gebeurt dat bewust niet, zodat HTML in een hint intact blijft. Het invoerveld accepteert zowel een punt als een komma.
3. **Code moet altijd veilig en kwalitatief goed zijn** — geen magic numbers zonder reden, geen kwetsbaarheden, geen onnodige complexiteit.
4. **Git write commands voert alleen de gebruiker uit.** Claude voert nooit `git add`, `git commit`, `git push` of andere schrijfcommando's uit.

## Git workflow

- Git root: `C:\Users\iace\OneDrive\Xplore\IOL\routekaart`
- Remote: `https://github.com/irmacornelisse-max/routekaart.git`
- Na wijzigingen voert de gebruiker zelf uit — **altijd eerst naar de juiste map navigeren**:
  ```
  cd C:\Users\iace\OneDrive\Xplore\IOL\routekaart
  git add breuken-app/js/app.js breuken-app/js/questions.js  [etc.]
  git commit -m "Omschrijving"
  git push
  ```

---

## Projectstructuur

```
breuken-app/
  index.html
  favicon.svg
  css/style.css
  js/
    afgeleiden.js  ← generators differentiëren (D-doelen); staat vóór questions.js in index.html
    meetkunde.js   ← generators, SVG-figuren en nakijken meetkunde (MK-doelen); ook vóór questions.js
    questions.js   ← vraag-generators + LEERDOELEN
    app.js         ← TOC-structuur + feedback tips
    utils.js       ← algebra-evaluatie + validatie
    storage.js
    keyboard.js
```

---

## Nieuw soort opgaven toevoegen — stappenplan

### Stap 1 — `questions.js`: schrijf een generator

**Helpers:**
```javascript
_aQ(id, vraag, antwoord, vars, hints, opl)   // standaard algebra
_aQF(id, ...)   // gefactoriseerd antwoord (vereist haakjes, geen top-level som)
_aQM(id, ...)   // merkwaardig product (vereist ^2, verbiedt (x+a)(x+a))
_alM(c, v, p)   // monooom formatteren: _alM(3,'x',2) → '3x^{2}'
```

**Antwoord-object:**
```javascript
// Standaard algebra: { expr: '6x^{3}', vars: ['x'] }
// Gefactoriseerd:    { expr: '(x+2)(x+3)', vars: ['x'], vorm: 'factored' }
// Merkwaardig:       { expr: '(x+3)^{2}', vars: ['x'], vorm: 'merkwaardig' }
// Grafiek (L.G1x):   { m: number, b: number }  ← beide punten moeten op de lijn liggen
```

**Grafiek-vragen (`antwoordType: 'grafiek'`):**
- Vraagobject bevat `data: { m, b, mDisplay, xMin, xMax, yMin, yMax, stap, initA, initB }`
- SVG-rooster met sleepbare punten A en B, lijn wordt dynamisch bijgewerkt
- Validatie: `Math.abs(y - (m*x + b)) < 1e-9` voor beide punten
- Helpers: `renderGrafiekArea(vraag)` (SVG HTML), `initGrafiek(vraag)` (drag-events)
- Interne geometrie: CELL=30px/stap, PL=40, PT=24 — zelfde waarden in render én init

**Voorbeeld random generator (patroon voor eenvoudige algebra):**
```javascript
function genXX() {
  const letters = ['x','y','a','b','n'];
  const v = pick(letters);
  const c = rand(2, 9);
  const p = rand(1, 4);
  // ... bereken antwoord ...
  const ans = `${c}${v}^{${p}}`;
  return _aQ('X.X1a', `Bereken: $...$`, ans, [v],
    ['Hint 1 algemeen', `Hint 2 specifiek: $${c}...$`],
    `$...$\n$= ${ans}$`);
}
```

**Voeg toe aan `LEERDOELEN` onderaan questions.js:**
```javascript
{ id: 'X.X1a', titel: 'Omschrijving leerdoel', groep: 'Algebra', gen: genXX },
```

### Stap 2 — `app.js`: voeg toe aan TOC

**Sectie toevoegen:**
```javascript
{
  id: 'sectie-id', label: 'Sectielabel',
  items: [
    { label: 'Rijnaam', knoppen: [{l:'a',id:'X.X1a'},{l:'b',id:'X.X1b'}] },
  ]
},
```

**Feedback tip toevoegen** in de `tips`-object in `getTip()`:
```javascript
'X.X1a': 'Tip voor de leerling over deze soort opgaven.',
```

### Stap 3 — `utils.js`: alleen aanpassen bij nieuwe antwoordtypes

Nieuwe `vorm`-waarden vereisen een nieuwe check-functie (zie `checkAlgebraAntwoordGefactoriseerd`/`Merkwaardig` als voorbeeld).

---

## Algebra-evaluatie — hoe het werkt

- `_algEval(latex, varVals)` — parseert en evalueert LaTeX algebraïsch (handles `^`, `\frac`, `\left(`, impliciete vermenigvuldiging)
- `isAlgebraVereenvoudigd(latex)` — keurt af: `\cdot`/`\times`, expliciete coëff 1 (`1x`), gelijksoortige termen, herhaalde variabeleletters in één term (`mm` i.p.v. `m^{2}`)
- Validatie gebruikt drie testpuntenparen: `[[2,3,5],[3,5,7],[5,7,11]]`
- **MathQuill-normalisatie:** MathQuill output gebruikt `\left(` en `\right)` — normaliseer dit naar `(` en `)` vóór string-checks (zie `isAlgebraMerkwaardigGefactoriseerd`)

## Huidige algebra-sectie indeling

| Sectie | Leerdoelen |
|---|---|
| alg-optellen | A.O1a |
| alg-wortels | W.R1a, W.R1b, W.R1c |
| alg-vermenigvuldigen | A.M1a, A.M1b |
| alg-gemengd | — |
| alg-delen | A.D1a, A.D1b |
| alg-haakjes | A.H1a, A.H1b, A.H1c, A.H1d |
| alg-factoren | A.F1a, A.F1b, A.F1c |
| alg-machten | A.MV1a, A.MV1b, A.MV1c, A.MV1d |
| alg-wortels | W.R1a, W.R1b, W.R1c |
| alg-ontbinden-herleiden | B.H1a, B.H1b, B.H1c |
| lin-grafiek | L.G1a, L.G1b, L.G1c, L.G2a, L.G2b, L.G2c |
| lin-formule | L.F1a, L.F1b, L.F1c, L.F2a, L.F2b, L.F2c |
| lin-vergelijking | L.V1a, L.V1b, L.V1c, L.V1d, L.V1e |
| lin-ongelijkheid | L.O1a, L.O1b, L.O1c |
| lin-stelsel | S.1a, S.1b, S.1c |
| kw-vergelijking | K.A1a, K.B1a, K.C1a, K.D1a, K.E1a, K.F1a |
| machts-vergelijking | M.V1a, M.V1b, M.V1c, M.V1d, M.V2a, M.V2b, M.V3a, M.V3b, M.V3c, M.V3d, M.V3e |
| wortel-vergelijking | W.V1a, W.V1b |
| gebroken-vergelijking | G.V1a, G.V1b, G.V2a, G.V2b, G.V2c, G.V2d, G.V2e, G.V2f |
| modulus-vergelijking | MO.V1a, MO.V1b, MO.V1c, MO.V1d |
| exp-omschrijven | EX.1a, EX.1b, EX.1c, EX.1d, EX.1e, EX.1f |
| afg-machten | D.M1a, D.M1b, D.M1c, D.M1d |
| afg-regels | D.R1a, D.R1b, D.R1c, D.R1d, D.R1e |
| afg-exp-log | D.E1a, D.E1b, D.E1c, D.E1d, D.E1e |
| mk-omtrek-opp | MK.O1a–d, MK.A1a–d |
| mk-pythagoras | MK.P1a, MK.P1b, MK.P2a, MK.P2b |
| mk-goniometrie | MK.G1a, MK.G2a, MK.G2b |
| mk-sinus-cosinusregel | MK.S1a, MK.S1b, MK.S1c, MK.C1a, MK.C1b |
| mk-gelijkvormig | MK.V1a, MK.V1b, MK.V1c |

## Meetkunde (MK-doelen)

- **Figuur en antwoord uit één model.** Elke generator rekent coördinaten uit
  en tekent daaruit de SVG (`_mkFiguur`), dus de figuur is op schaal en klopt
  met het antwoord. SVG-labels krijgen zelf een komma (`_mkL`), want
  `_kommaNotatie` werkt alleen binnen `$...$`.
- **Afronden:** de opgave noemt het aantal decimalen (`dec`); alleen precies
  die afronding is goed. Meer decimalen = tussenstap ("rond nog af"), net
  verkeerd afgerond = fout met uitleg. `_mkVeilig` gooit waarden vlak bij een
  afrondgrens weg. `dec: null` = exact getal; `exact: 'pi'` = antwoord als
  getal maal π.
- **Nakijken** (`antwoordType: 'meetkunde'`, `checkMeetkunde`): een regel is
  een keten `deel = deel ≈ deel`. Zijden (`AB`), hoeken (`\angle A` of `A`) en
  `r`/`d` worden vervangen door hun waarde uit `sets[i].g`; een kale kleine
  letter of een woord vooraan is de gevraagde grootheid. Klopt de keten
  (marge 0,5 %), dan is het een tussenstap. Meer `sets` = meer oplossingen
  (MK.S1c); één ervan geven is een tussenstap.
- **Parser:** `_algEval` kent nu `\pi` en `\sin`, `\cos`, `\tan` in graden,
  plus de inverse (`\sin^{-1}`, `\arcsin`).
- **Toetsenbord:** bij MK-doelen twee extra rijen (sin, cos, tan, π, ∠, °,
  en de inverse). "pi" typen wordt π.
- **Lokaal bekijken:** Node staat niet op deze pc; `.claude/launch.json` heeft
  daarom ook een configuratie `breuken-app-python` (`python -m http.server`).

## Differentiëren (D-doelen)

- **Eén model.** `afgeleiden.js` bouwt elke functie uit "delen" (som van
  x-machten, e^u, g^u, ln, log, macht van u, product, quotiënt). Elk deel kent
  zijn afgeleide en de stappen van de uitwerking, dus opgave, antwoord en
  uitwerking kunnen niet uiteenlopen.
- **Antwoordcontrole** (`vorm: 'afgeleide'`, `checkAfgeleide` in utils.js):
  elke juiste vorm van f'(x) is goed, herleiden hoeft niet. f(x) anders
  opschrijven (als macht, haakjes weg) is een tussenstap. `f'(x) =` vooraan
  mag. Getoetst op de punten `testX` uit de opgave: binnen het domein (wortels,
  ln) en niet vlak bij een pool.
- **Parser:** `_algEval` kent nu `e`, `\ln`, `\log` (grondtal 10) en
  `\log_{g}`. Nederlandse notatie: een macht **zonder grondtal** vlak voor
  `\log` is het grondtal (`{}^{2}\log`, of `^{2}\log` zoals MathQuill het
  schrijft). Met iets ervoor is het een exponent: `x^{2}\log(x)` = x² · log x.
  Een losse `e` is het getal e, tenzij `e` in `vars` staat.
- **Toetsenbord:** bij D-doelen een extra rij (eˣ, ln, ᵍlog, log). Na ᵍlog
  staat de cursor in het grondtal; met → komt er `log(` achter.
- **Controleren na een wijziging:** genereer per leerdoel een paar honderd
  opgaven en vergelijk de afgeleide met een numerieke afgeleide van f, en elke
  uitwerkingsregel met f'. Node staat niet op deze pc; headless Edge met een
  testpagina die de js-bestanden via `file:///` laadt werkt wel.

## Antwoordcontrole – twee dingen om te weten

- **Tussenstappen.** Een tussenstap mag de oplossingen inperken (één tak van de
  nulproductregel), maar nooit een waarde toelaten die geen oplossing is. Zie
  `_isGeldigeTussenstap` in `app.js`. Vreemde wortels worden gezocht via
  tekenwisseling plus bisectie, dus ook irrationale.
- **Vorm in plaats van waarde (EX-doelen).** Bij "schrijf zonder negatieve
  exponenten" is de waarde niet het hele antwoord; het gaat om de schrijfwijze.
  Daarvoor zijn er twee `vorm`-waarden: `exp-zonder` (met `verboden: ['negatief',
  'gebroken']`) en `exp-macht` (met `basis`). Klopt de waarde maar staat de
  verboden vorm er nog, dan is het een **tussenstap**, geen fout — de leerling is
  immers goed op weg. Alle zes de EX-generators bouwen opgave én antwoord uit
  hetzelfde model (`_exRender` met een andere `vorm`), dus ze kunnen per
  constructie niet uiteenlopen.
- **`strikt` in het antwoordobject.** Zet je dat bij `vergelijking-mv`, dan wordt
  een rij kale `x = getal`-waarden als eindantwoord gelezen: het aantal moet dan
  precies kloppen. Zonder die vlag telt alleen dat elke oplossing gedekt is —
  nodig bij G.V2d en verwanten, waar een verworpen schijnoplossing juist in de
  tussenstap thuishoort.
