# Breuken-app — reminder voor Claude

## Afspraken met Irma

1. **Stel altijd vragen voordat je begint met bouwen.** Wat voor soort opgaven? Welke niveaus? Welke regels/variabelen? Wacht op antwoord.
2. **Getallen altijd random genereren** — geen vaste pools voor eenvoudige opgaven. Gebruik `rand()`, `pick()`, `Math.random()`. Vaste pools zijn alleen acceptabel voor structureel complexe opgaven (bijv. FOIL, factoriseren merkwaardige producten).
3. **Code moet altijd veilig en kwalitatief goed zijn** — geen magic numbers zonder reden, geen kwetsbaarheden, geen onnodige complexiteit.
4. **Git write commands voert alleen de gebruiker uit.** Claude voert nooit `git add`, `git commit`, `git push` of andere schrijfcommando's uit.

## Git workflow

- Git root: `C:\Users\iace\OneDrive\Xplore\IOL\routekaart`
- Remote: `https://github.com/irmacornelisse-max/routekaart.git`
- Na wijzigingen voert de gebruiker zelf uit:
  ```
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
| alg-vermenigvuldigen | A.M1a, A.M1b |
| alg-gemengd | — |
| alg-delen | A.D1a, A.D1b |
| alg-haakjes | A.H1a, A.H1b, A.H1c, A.H1d |
| alg-factoren | A.F1a, A.F1b, A.F1c |
| alg-machten | A.MV1a, A.MV1b, A.MV1c, A.MV1d |
| lin-grafiek | L.G1a, L.G1b, L.G1c, L.G2a, L.G2b, L.G2c |
| lin-formule | L.F1a, L.F1b, L.F1c, L.F2a, L.F2b, L.F2c |
| lin-vergelijking | L.V1a, L.V1b, L.V1c |
| lin-ongelijkheid | L.O1a, L.O1b, L.O1c |
| kw-vergelijking | K.A1a, K.B1a, K.C1a, K.D1a, K.E1a |
| machts-vergelijking | M.V1a, M.V1b, M.V1c, M.V1d |
