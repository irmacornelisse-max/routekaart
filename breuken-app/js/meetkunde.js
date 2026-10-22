/* ═══════════════════════════════════════════════════════════════════════════
   MK – Meetkunde
   ═══════════════════════════════════════════════════════════════════════════
   Leerlijnen:
     MK.O1  omtrek (rechthoek, driehoek, cirkel afgerond en exact in π)
     MK.A1  oppervlakte (idem)
     MK.P1  Pythagoras: zijden in een rechthoekige driehoek
     MK.P2  Pythagoras: afstand in een assenstelsel en in een balk
     MK.G1  sin, cos, tan: hoek berekenen
     MK.G2  sin, cos, tan: zijde berekenen (in de teller of in de noemer)
     MK.S1  sinusregel (zijde, hoek, twee mogelijke driehoeken)
     MK.C1  cosinusregel (zijde, hoek)
     MK.V1  gelijkvormigheid (snavel, zandloper, twee losse driehoeken)

   Elke figuur wordt getekend uit dezelfde coördinaten waaruit de maten
   berekend zijn. Figuur, opgave en antwoord kunnen dus niet uiteenlopen.

   Nakijken (antwoordType 'meetkunde'): het antwoordobject kent
     sets    [{ waarde, g }]: per mogelijke oplossing de waarde en alle bekende
             grootheden (zijde 'AB' als gesorteerd letterpaar, hoek 'A' in
             graden). Meer dan één set = meer oplossingen (sinusregel c).
     naam    sleutel van de gevraagde grootheid ('AC', 'C') of null
     dec     aantal decimalen waarop afgerond moet worden; null = exact getal
     exact   'pi' als het antwoord exact in π moet
     tussen  waarden die als losse tussenuitkomst goed zijn (AC², sin A, ...)
   Een regel wordt gelezen als keten  deel = deel ≈ deel. Namen van zijden en
   hoeken worden vervangen door hun waarde; een kale kleine letter (x) en een
   los label vooraan (O, opp) staan voor de gevraagde grootheid. Klopt de
   keten, dan is het een tussenstap.

   Dit bestand staat vóór questions.js in index.html: de LEERDOELEN-lijst daar
   verwijst naar de generators hieronder. uid() uit questions.js wordt pas
   aangeroepen als er een opgave gemaakt wordt.                              */

/* ── Getallen ───────────────────────────────────────────────────────────── */
const _mkRad = d => d * Math.PI / 180;
const _mkDeg = r => r * 180 / Math.PI;

function _mkRond(x, dec) {
  const f = 10 ** dec;
  return Math.round(x * f + Math.sign(x) * 1e-9) / f;
}

/* Een waarde die vlak bij een afrondgrens ligt (6,449 of 6,451 bij één
   decimaal) geeft verwarring: een iets andere tussenafronding levert dan een
   ander eindantwoord. Zulke opgaven trekken we opnieuw. */
const MK_AFROND_MARGE = 0.05;
function _mkVeilig(x, dec) {
  if (dec === null || dec === undefined) return true;
  const s = Math.abs(x) * 10 ** dec;
  return Math.abs(s - Math.floor(s) - 0.5) > MK_AFROND_MARGE;
}

/* Getal in LaTeX (punt; generateVraag maakt er binnen $...$ een komma van). */
function _mkT(x, dec) {
  return dec === undefined || dec === null ? String(_mkRond(x, 6)) : _mkRond(x, dec).toFixed(dec);
}
/* Getal in een SVG-label: daar komt _kommaNotatie niet, dus zelf de komma. */
const _mkL = x => String(_mkRond(x, 2)).replace('.', ',');
const _mkGr = x => `${x}^{\\circ}`;
const _mkZ = (p, q) => [p, q].sort().join('');

function _mkRondTekst(dec, hoek = false) {
  if (dec === 0) return hoek ? 'Rond af op hele graden.' : 'Rond af op een geheel getal.';
  return dec === 1 ? 'Rond af op één decimaal.' : 'Rond af op twee decimalen.';
}

/* Exact antwoord: een getal met hoogstens twee decimalen hoeft niet afgerond.
   Anders vragen we om één decimaal. */
function _mkDecVoor(w) {
  return Math.abs(w * 100 - Math.round(w * 100)) < 1e-9 ? null : 1;
}

const MK_NAMEN = [['A', 'B', 'C'], ['P', 'Q', 'R'], ['K', 'L', 'M'], ['D', 'E', 'F']];

/* ── Tekenen ────────────────────────────────────────────────────────────── */
const MK_KLEUR = { lijn: '#1A3A5C', gevraagd: '#E06C20', hulp: '#718096', tekst: '#1A2332' };
const MK_B = 340, MK_H = 240, MK_MARGE = 36;
const MK_BOOG = 20;          // straal van een hoekboog in px
const MK_RECHT = 11;         // zijde van het rechte-hoekvierkantje in px
const MK_LABEL_AFSTAND = 14; // afstand van een label tot lijn of hoekpunt

const _mkV = {
  min: (a, b) => [a[0] - b[0], a[1] - b[1]],
  plus: (a, b) => [a[0] + b[0], a[1] + b[1]],
  maal: (a, k) => [a[0] * k, a[1] * k],
  lengte: a => Math.hypot(a[0], a[1]),
  een: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
  midden: pts => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]),
};

/* Draait (en spiegelt eventueel) een figuur, zodat niet elke driehoek op
   dezelfde manier op het scherm staat. */
function _mkTransformeer(punten, draai = rand(0, 359), spiegel = Math.random() < 0.5) {
  const t = _mkRad(draai), c = Math.cos(t), s = Math.sin(t);
  const uit = {};
  for (const [k, [x, y]] of Object.entries(punten)) {
    const xx = spiegel ? -x : x;
    uit[k] = [c * xx - s * y, s * xx + c * y];
  }
  return uit;
}

/* Schaalt wiskundige coördinaten naar het tekenvlak (y-as omhoog). */
function _mkSchaal(pts, b, h, marge) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = (maxX - minX) || 1, hh = (maxY - minY) || 1;
  const s = Math.min((b - 2 * marge) / w, (h - 2 * marge) / hh);
  const ox = (b - s * w) / 2 - s * minX;
  const oy = (h - s * hh) / 2 + s * maxY;
  return { s, f: ([x, y]) => [ox + s * x, oy - s * y] };
}

const _mkF = x => x.toFixed(1);

function _mkTekst([x, y], tekst, { kleur = MK_KLEUR.tekst, cursief = false, vet = false } = {}) {
  return `<text x="${_mkF(x)}" y="${_mkF(y)}" text-anchor="middle" dominant-baseline="central" font-size="15"`
    + `${cursief ? ' font-style="italic"' : ''}${vet ? ' font-weight="700"' : ''} fill="${kleur}"`
    + ` stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${tekst}</text>`;
}

function _mkLijn(a, b, { kleur = MK_KLEUR.lijn, stippel = false, dik = 2 } = {}) {
  return `<line x1="${_mkF(a[0])}" y1="${_mkF(a[1])}" x2="${_mkF(b[0])}" y2="${_mkF(b[1])}" stroke="${kleur}"`
    + ` stroke-width="${dik}" stroke-linecap="round"${stippel ? ' stroke-dasharray="6 5"' : ''}/>`;
}

/* spec:
     punten   { A: [x, y], ... }               wiskundige coördinaten
     namen    welke punten een letter krijgen  (standaard alle)
     lijnen   [[p, q, {kleur, stippel, dik}]]
     zijden   [{ van, naar, tekst, kleur, ref }]  label naast een lijnstuk
     hoeken   [{ bij, van, naar, tekst, kleur, recht, bogen }]
     cirkels  [{ m, r, boog: [vanGraden, totGraden], stippel }]
     stippen  [punt]                           dikke stip (middelpunt)
     ref      referentiepunt (wiskundig) waar labels van weg wijzen         */
function _mkFiguur(spec) {
  const B = spec.breedte ?? MK_B, H = spec.hoogte ?? MK_H;
  const P = spec.punten;
  const bereik = [...Object.values(P)];
  for (const c of spec.cirkels ?? []) {
    const [mx, my] = P[c.m];
    if (c.boog) {                    // een boog: neem punten langs de boog mee
      const [a1, a2] = c.boog, stappen = 12;
      for (let i = 0; i <= stappen; i++) {
        const t = _mkRad(a1 + ((a2 - a1 + 360) % 360) * i / stappen);
        bereik.push([mx + c.r * Math.cos(t), my + c.r * Math.sin(t)]);
      }
      continue;
    }
    bereik.push([mx - c.r, my - c.r], [mx + c.r, my + c.r]);
  }
  const { s, f } = _mkSchaal(bereik, B, H, spec.marge ?? MK_MARGE);
  const S = {};
  for (const k of Object.keys(P)) S[k] = f(P[k]);
  const refAlg = spec.ref ? f(spec.ref) : _mkV.midden(Object.values(S));

  let svg = '';

  for (const c of spec.cirkels ?? []) {
    const [cx, cy] = S[c.m], r = c.r * s;
    const stip = c.stippel ? ' stroke-dasharray="6 5"' : '';
    if (c.boog) {
      const [a1, a2] = c.boog;
      const p1 = f([P[c.m][0] + c.r * Math.cos(_mkRad(a1)), P[c.m][1] + c.r * Math.sin(_mkRad(a1))]);
      const p2 = f([P[c.m][0] + c.r * Math.cos(_mkRad(a2)), P[c.m][1] + c.r * Math.sin(_mkRad(a2))]);
      const groot = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
      svg += `<path d="M${_mkF(p1[0])},${_mkF(p1[1])} A${_mkF(r)},${_mkF(r)} 0 ${groot} 0 ${_mkF(p2[0])},${_mkF(p2[1])}"`
        + ` fill="none" stroke="${c.kleur ?? MK_KLEUR.hulp}" stroke-width="1.5"${stip}/>`;
    } else {
      svg += `<circle cx="${_mkF(cx)}" cy="${_mkF(cy)}" r="${_mkF(r)}" fill="none" stroke="${c.kleur ?? MK_KLEUR.lijn}" stroke-width="2"${stip}/>`;
    }
  }

  for (const [p, q, o = {}] of spec.lijnen ?? []) svg += _mkLijn(S[p], S[q], o);

  for (const h of spec.hoeken ?? []) {
    const V = S[h.bij];
    const u1 = _mkV.een(_mkV.min(S[h.van], V)), u2 = _mkV.een(_mkV.min(S[h.naar], V));
    const kleur = h.kleur ?? MK_KLEUR.lijn;
    if (h.recht) {
      const a = _mkV.plus(V, _mkV.maal(u1, MK_RECHT));
      const c = _mkV.plus(V, _mkV.maal(u2, MK_RECHT));
      const b = _mkV.plus(a, _mkV.maal(u2, MK_RECHT));
      svg += `<polyline points="${_mkF(a[0])},${_mkF(a[1])} ${_mkF(b[0])},${_mkF(b[1])} ${_mkF(c[0])},${_mkF(c[1])}" fill="none" stroke="${kleur}" stroke-width="1.5"/>`;
      continue;
    }
    const kruis = u1[0] * u2[1] - u1[1] * u2[0];
    const veeg = kruis > 0 ? 1 : 0;
    const bogen = h.bogen ?? 1;
    for (let i = 0; i < bogen; i++) {
      const r = MK_BOOG + 4 * i;
      const a = _mkV.plus(V, _mkV.maal(u1, r)), b = _mkV.plus(V, _mkV.maal(u2, r));
      svg += `<path d="M${_mkF(a[0])},${_mkF(a[1])} A${r},${r} 0 0 ${veeg} ${_mkF(b[0])},${_mkF(b[1])}" fill="none" stroke="${kleur}" stroke-width="1.5"/>`;
    }
    if (h.tekst) {
      const hoek = _mkDeg(Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))));
      const extra = hoek < 35 ? (35 - hoek) * 0.9 : 0;    // smalle hoek: label verder weg
      const d = MK_BOOG + 4 * (bogen - 1) + 15 + extra;
      svg += _mkTekst(_mkV.plus(V, _mkV.maal(_mkV.een(_mkV.plus(u1, u2)), d)), h.tekst, { kleur });
    }
  }

  for (const z of spec.zijden ?? []) {
    const a = S[z.van], b = S[z.naar];
    const m = _mkV.maal(_mkV.plus(a, b), 0.5);
    const r = _mkV.een(_mkV.min(b, a));
    let n = [-r[1], r[0]];
    const ref = z.ref ? f(z.ref) : refAlg;
    const naarRef = _mkV.min(ref, m);
    if (n[0] * naarRef[0] + n[1] * naarRef[1] > 0) n = _mkV.maal(n, -1);
    // Een label van meer tekens schuift iets verder van een steile lijn af.
    const breed = Math.max(0, String(z.tekst).length - 1) * 3.5 * Math.abs(n[0]);
    svg += _mkTekst(_mkV.plus(m, _mkV.maal(n, MK_LABEL_AFSTAND + breed)), z.tekst,
      { kleur: z.kleur ?? MK_KLEUR.tekst, vet: z.kleur === MK_KLEUR.gevraagd });
  }

  for (const p of spec.stippen ?? []) {
    svg += `<circle cx="${_mkF(S[p][0])}" cy="${_mkF(S[p][1])}" r="3" fill="${MK_KLEUR.lijn}"/>`;
  }

  for (const k of spec.namen ?? Object.keys(P)) {
    const ref = spec.naamRef?.[k] ? f(spec.naamRef[k]) : refAlg;
    let r = _mkV.min(S[k], ref);
    if (_mkV.lengte(r) < 1e-6) r = [0, -1];
    const tekst = k.replace(/(\d)$/, '<tspan font-size="11" dy="4">$1</tspan>');
    svg += _mkTekst(_mkV.plus(S[k], _mkV.maal(_mkV.een(r), MK_LABEL_AFSTAND + 2)), tekst, { cursief: true });
  }

  return `<svg viewBox="0 0 ${B} ${H}" width="${B}" height="${H}" xmlns="http://www.w3.org/2000/svg"`
    + ` style="display:block;margin:8px auto;max-width:100%;height:auto" role="img" aria-label="figuur">${svg}</svg>`;
}

/* Assenstelsel met rooster en twee punten. */
function _mkAssenSVG(A, B) {
  const MIN = -7, MAX = 7, CEL = 18, MARGE = 16;
  const grootte = (MAX - MIN) * CEL + 2 * MARGE;
  const X = x => MARGE + (x - MIN) * CEL, Y = y => MARGE + (MAX - y) * CEL;
  let svg = '';
  for (let i = MIN; i <= MAX; i++) {
    svg += `<line x1="${X(i)}" y1="${Y(MIN)}" x2="${X(i)}" y2="${Y(MAX)}" stroke="#E2E6EA" stroke-width="1"/>`;
    svg += `<line x1="${X(MIN)}" y1="${Y(i)}" x2="${X(MAX)}" y2="${Y(i)}" stroke="#E2E6EA" stroke-width="1"/>`;
  }
  svg += `<line x1="${X(MIN)}" y1="${Y(0)}" x2="${X(MAX)}" y2="${Y(0)}" stroke="${MK_KLEUR.lijn}" stroke-width="1.5"/>`;
  svg += `<line x1="${X(0)}" y1="${Y(MIN)}" x2="${X(0)}" y2="${Y(MAX)}" stroke="${MK_KLEUR.lijn}" stroke-width="1.5"/>`;
  svg += `<text x="${X(MAX) - 4}" y="${Y(0) + 14}" font-size="13" font-style="italic" fill="${MK_KLEUR.tekst}">x</text>`;
  svg += `<text x="${X(0) + 6}" y="${Y(MAX) + 10}" font-size="13" font-style="italic" fill="${MK_KLEUR.tekst}">y</text>`;
  for (const i of [-5, 5]) {
    svg += `<text x="${X(i)}" y="${Y(0) + 14}" text-anchor="middle" font-size="11" fill="${MK_KLEUR.hulp}">${i < 0 ? '−' + -i : i}</text>`;
    svg += `<text x="${X(0) - 6}" y="${Y(i) + 4}" text-anchor="end" font-size="11" fill="${MK_KLEUR.hulp}">${i < 0 ? '−' + -i : i}</text>`;
  }
  svg += `<text x="${X(0) - 6}" y="${Y(0) + 14}" text-anchor="end" font-size="11" fill="${MK_KLEUR.hulp}">0</text>`;
  for (const [naam, [x, y]] of [['A', A], ['B', B]]) {
    svg += `<circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="${MK_KLEUR.gevraagd}"/>`;
    svg += _mkTekst([X(x) + 11, Y(y) - 11], naam, { cursief: true });
  }
  return `<svg viewBox="0 0 ${grootte} ${grootte}" width="${grootte}" height="${grootte}" xmlns="http://www.w3.org/2000/svg"`
    + ` style="display:block;margin:8px auto;max-width:100%;height:auto" role="img" aria-label="assenstelsel">${svg}</svg>`;
}

/* ── Vraagobject ────────────────────────────────────────────────────────── */
function _mkVraag(leerdoel, o) {
  return {
    id: uid(), leerdoel,
    vraag: `${o.tekst}\n${o.svg}`,
    antwoordType: 'meetkunde',
    antwoord: {
      sets: o.sets, naam: o.naam ?? null, dec: o.dec ?? null,
      exact: o.exact ?? null, tussen: o.tussen ?? [],
    },
    data: o.data ?? {},
    hints: o.hints,
    oplossing: o.oplossing.join('\n'),
  };
}

/* Bekende zijden van een veelhoek als { 'AB': lengte, ... }. */
function _mkZijden(P, paren) {
  const g = {};
  for (const [p, q] of paren) g[_mkZ(p, q)] = _mkV.lengte(_mkV.min(P[p], P[q]));
  return g;
}

/* Alle zijden en hoeken van driehoek pqr. */
function _mkDriehoekG(P, [p, q, r]) {
  const g = _mkZijden(P, [[p, q], [q, r], [r, p]]);
  const hoek = (v, a, b) => {
    const u1 = _mkV.een(_mkV.min(P[a], P[v])), u2 = _mkV.een(_mkV.min(P[b], P[v]));
    return _mkDeg(Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))));
  };
  g[p] = hoek(p, q, r); g[q] = hoek(q, r, p); g[r] = hoek(r, p, q);
  return g;
}

/* ═══ Omtrek ══════════════════════════════════════════════════════════════ */

function _mkRechthoek() {
  const l = rand(4, 15) + (Math.random() < 0.3 ? 0.5 : 0);
  let b;
  do { b = rand(2, 12); } while (b >= l - 0.5 || b < l / 4);   // geen vierkant, geen reep
  const namen = pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['K', 'L', 'M', 'N']]);
  const [A, B, C, D] = namen;
  const P = { [A]: [0, 0], [B]: [l, 0], [C]: [l, b], [D]: [0, b] };
  const svg = _mkFiguur({
    punten: P,
    lijnen: [[A, B], [B, C], [C, D], [D, A]],
    hoeken: namen.map((p, i) => ({ bij: p, van: namen[(i + 3) % 4], naar: namen[(i + 1) % 4], recht: true })),
    zijden: [{ van: A, naar: B, tekst: _mkL(l) }, { van: B, naar: C, tekst: _mkL(b) }],
  });
  const g = _mkZijden(P, [[A, B], [B, C], [C, D], [D, A]]);
  return { l, b, naam: namen.join(''), svg, g };
}

function genMKO1a() {
  const { l, b, naam, svg, g } = _mkRechthoek();
  const w = 2 * (l + b);
  return _mkVraag('MK.O1a', {
    tekst: `Bereken de omtrek van rechthoek $${naam}$.`, svg,
    sets: [{ waarde: w, g }], tussen: [l + b],
    hints: [
      'De omtrek is de lengte van de hele rand: tel alle vier de zijden op.',
      'Tegenover elkaar liggende zijden van een rechthoek zijn even lang.',
    ],
    oplossing: [`$\\text{omtrek} = ${l} + ${b} + ${l} + ${b} = ${_mkT(w)}$`],
  });
}

function genMKO1b() {
  const half = Math.random() < 0.3;
  let a, b, c;
  do {
    c = rand(5, 14); a = rand(3, 12); b = rand(3, 12);
  } while (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1);
  if (half) c += 0.5;
  const [A, B, C] = pick(MK_NAMEN);
  const x = (b * b + c * c - a * a) / (2 * c);
  const P = { [A]: [0, 0], [B]: [c, 0], [C]: [x, Math.sqrt(b * b - x * x)] };
  const svg = _mkFiguur({
    punten: P,
    lijnen: [[A, B], [B, C], [C, A]],
    zijden: [{ van: A, naar: B, tekst: _mkL(c) }, { van: B, naar: C, tekst: _mkL(a) }, { van: C, naar: A, tekst: _mkL(b) }],
  });
  const w = a + b + c;
  return _mkVraag('MK.O1b', {
    tekst: `Bereken de omtrek van driehoek $${A}${B}${C}$.`, svg,
    sets: [{ waarde: w, g: _mkDriehoekG(P, [A, B, C]) }],
    hints: [
      'De omtrek is de lengte van de hele rand.',
      'Tel de lengtes van de drie zijden op.',
    ],
    oplossing: [`$\\text{omtrek} = ${c} + ${a} + ${b} = ${_mkT(w)}$`],
  });
}

/* Cirkel met middelpunt M; getekend is een straal of een middellijn. */
function _mkCirkel() {
  const diameter = Math.random() < 0.5;
  const maat = diameter ? rand(3, 20) : rand(2, 12);
  const r = diameter ? maat / 2 : maat;
  const t = rand(0, 359);
  const dir = [Math.cos(_mkRad(t)), Math.sin(_mkRad(t))];
  const P = { M: [0, 0], S: _mkV.maal(dir, r), T: _mkV.maal(dir, -r) };
  const svg = _mkFiguur({
    punten: P, namen: ['M'], naamRef: { M: _mkV.maal([-dir[1], dir[0]], -1) },
    cirkels: [{ m: 'M', r }],
    lijnen: [[diameter ? 'T' : 'M', 'S']],
    stippen: ['M'],
    // Ook bij een middellijn staat het label bij de helft M-S, niet op M.
    zijden: [{ van: 'M', naar: 'S', tekst: _mkL(maat), ref: [-dir[1] * r, dir[0] * r] }],
    breedte: 260, hoogte: 220, marge: 20,
  });
  return { diameter, maat, r, svg };
}

function _mkCirkelVraag(leerdoel, soort, exact) {
  let c, w, dec = null;
  do {
    c = _mkCirkel();
    w = soort === 'omtrek' ? 2 * Math.PI * c.r : Math.PI * c.r * c.r;
    if (!exact) dec = pick([1, 1, 2]);
  } while (!exact && !_mkVeilig(w, dec));
  const k = soort === 'omtrek' ? 2 * c.r : c.r * c.r;      // w = k·π
  const slot = exact ? `${_mkT(k)}\\pi` : `${_mkT(k)}\\pi \\approx ${_mkT(w, dec)}`;
  let regel;
  if (soort === 'omtrek') {
    regel = c.diameter
      ? `$\\text{omtrek} = \\pi \\cdot d = \\pi \\cdot ${c.maat} = ${slot}$`
      : `$\\text{omtrek} = 2 \\cdot \\pi \\cdot r = 2 \\cdot \\pi \\cdot ${c.maat} = ${slot}$`;
  } else {
    regel = c.diameter
      ? `$\\text{oppervlakte} = \\pi \\cdot r^2 = \\pi \\cdot ${_mkT(c.r)}^2 = ${slot}$`
      : `$\\text{oppervlakte} = \\pi \\cdot r^2 = \\pi \\cdot ${c.maat}^2 = ${slot}$`;
  }
  const oplossing = c.diameter && soort === 'oppervlakte'
    ? [`$r = ${c.maat} \\div 2 = ${_mkT(c.r)}$`, regel]
    : [regel];
  const opdracht = soort === 'omtrek' ? 'Bereken de omtrek van de cirkel.' : 'Bereken de oppervlakte van de cirkel.';
  return _mkVraag(leerdoel, {
    tekst: `${opdracht} ${exact ? 'Geef je antwoord exact, met $\\pi$ erin.' : _mkRondTekst(dec)}`,
    svg: c.svg, sets: [{ waarde: w, g: { r: c.r, d: 2 * c.r } }], dec, exact: exact ? 'pi' : null,
    tussen: [c.r, 2 * c.r, c.r * c.r],
    hints: [
      'Kijk goed naar het getekende lijnstuk: gaat het door het hele midden (middellijn $d$) of van het middelpunt naar de rand (straal $r$)?',
      soort === 'omtrek'
        ? 'Omtrek van een cirkel: $2 \\cdot \\pi \\cdot r$, of $\\pi \\cdot d$.'
        : 'Oppervlakte van een cirkel: $\\pi \\cdot r^2$. Gebruik de straal, niet de middellijn.',
      exact
        ? 'Exact betekent: laat $\\pi$ staan en schrijf het antwoord als getal maal $\\pi$, bijvoorbeeld $7\\pi$.'
        : 'Gebruik de $\\pi$-knop van je rekenmachine en rond pas aan het eind af.',
    ],
    oplossing,
  });
}

const genMKO1c = () => _mkCirkelVraag('MK.O1c', 'omtrek', false);
const genMKO1d = () => _mkCirkelVraag('MK.O1d', 'omtrek', true);

/* ═══ Oppervlakte ═════════════════════════════════════════════════════════ */

function genMKA1a() {
  const { l, b, naam, svg, g } = _mkRechthoek();
  const w = l * b;
  return _mkVraag('MK.A1a', {
    tekst: `Bereken de oppervlakte van rechthoek $${naam}$.`, svg,
    sets: [{ waarde: w, g }],
    hints: [
      'Oppervlakte van een rechthoek: lengte keer breedte.',
      'Je hebt twee zijden nodig die in een hoekpunt bij elkaar komen.',
    ],
    oplossing: [`$\\text{oppervlakte} = ${l} \\cdot ${b} = ${_mkT(w)}$`],
  });
}

/* Driehoek met basis op de x-as en een getekende hoogte. Bij een stompe
   driehoek valt het voetpunt van de hoogte buiten de basis. */
function genMKA1b() {
  const basis = rand(5, 14), hoogte = rand(3, Math.min(10, basis));   // niet te spits
  const stomp = Math.random() < 0.4;
  const [A, B, C] = pick(MK_NAMEN);
  const xTop = stomp ? basis + rand(1, 4) : rand(1, basis - 1);
  const spiegel = Math.random() < 0.5;
  const sx = x => spiegel ? basis - x : x;
  const P = { [A]: [sx(0), 0], [B]: [sx(basis), 0], [C]: [sx(xTop), hoogte], H: [sx(xTop), 0] };
  const lijnen = [[A, B], [B, C], [C, A], [C, 'H', { stippel: true, kleur: MK_KLEUR.hulp, dik: 1.5 }]];
  if (stomp) lijnen.push([B, 'H', { stippel: true, kleur: MK_KLEUR.hulp, dik: 1.5 }]);
  // Het hoogtelabel komt aan de ruimste kant: weg van het dichtstbijzijnde
  // hoekpunt van de basis.
  const dichtbij = stomp || xTop > basis / 2 ? B : A;
  const zijden = [
    { van: A, naar: B, tekst: _mkL(basis) },
    { van: C, naar: 'H', tekst: _mkL(hoogte), ref: P[dichtbij] },
  ];
  // Soms staat er ook een schuine zijde bij. Die heb je niet nodig.
  if (Math.random() < 0.5) {
    const lAC = _mkRond(_mkV.lengte(_mkV.min(P[A], P[C])), 1);
    zijden.push({ van: C, naar: A, tekst: _mkL(lAC) });
  }
  const svg = _mkFiguur({
    punten: P, namen: [A, B, C], lijnen, zijden,
    hoeken: [{ bij: 'H', van: C, naar: stomp ? B : A, recht: true }],
    ref: [sx(xTop), hoogte / 3],
  });
  const w = basis * hoogte / 2;
  return _mkVraag('MK.A1b', {
    tekst: `Bereken de oppervlakte van driehoek $${A}${B}${C}$.`, svg,
    sets: [{ waarde: w, g: _mkDriehoekG(P, [A, B, C]) }], tussen: [basis * hoogte],
    hints: [
      'Oppervlakte van een driehoek: $\\frac{1}{2} \\cdot \\text{basis} \\cdot \\text{hoogte}$.',
      'De hoogte staat loodrecht op de basis (de stippellijn met de rechte hoek). Een schuine zijde is geen hoogte.',
    ],
    oplossing: [`$\\text{oppervlakte} = \\frac{1}{2} \\cdot ${basis} \\cdot ${hoogte} = ${_mkT(w)}$`],
  });
}

const genMKA1c = () => _mkCirkelVraag('MK.A1c', 'oppervlakte', false);
const genMKA1d = () => _mkCirkelVraag('MK.A1d', 'oppervlakte', true);

/* ═══ Rechthoekige driehoek (Pythagoras en goniometrie) ═══════════════════
   X = hoekpunt van de scherpe hoek waar het om draait, R = rechte hoek,
   Y = het derde hoekpunt. Aanliggend = XR, overstaand = YR, schuin = XY.   */
function _mkRechtDriehoek(aanliggend, overstaand) {
  const namen = shuffle(pick(MK_NAMEN));
  const [X, R, Y] = namen;
  const P = _mkTransformeer({ [X]: [0, 0], [R]: [aanliggend, 0], [Y]: [aanliggend, overstaand] });
  return { X, R, Y, P, g: _mkDriehoekG(P, [X, R, Y]) };
}

/* Pythagoras: schuine zijde (a) of rechthoekszijde (b). */
function _mkPythagoras(leerdoel, schuinGevraagd) {
  let p, q, s, dec, w;
  do {
    dec = pick([1, 1, 2]);
    if (schuinGevraagd) {
      p = rand(3, 15); q = rand(3, 15);
      s = Math.hypot(p, q); w = s;
    } else {
      s = rand(6, 20); p = rand(3, s - 2);
      q = Math.sqrt(s * s - p * p); w = q;
    }
  } while (Math.max(p, q) / Math.min(p, q) > 3.5 || !_mkVeilig(w, dec));
  const d = _mkRechtDriehoek(p, q);
  const { X, R, Y, P, g } = d;
  const XR = _mkZ(X, R), YR = _mkZ(Y, R), XY = _mkZ(X, Y);
  const vraagZijde = schuinGevraagd ? XY : YR;
  const lab = (a, b, tekst, gevraagd) => ({ van: a, naar: b, tekst, kleur: gevraagd ? MK_KLEUR.gevraagd : undefined });
  const svg = _mkFiguur({
    punten: P, lijnen: [[X, R], [R, Y], [Y, X]],
    hoeken: [{ bij: R, van: X, naar: Y, recht: true }],
    zijden: schuinGevraagd
      ? [lab(X, R, _mkL(p)), lab(R, Y, _mkL(q)), lab(X, Y, '?', true)]
      : [lab(X, R, _mkL(p)), lab(X, Y, _mkL(s)), lab(R, Y, '?', true)],
  });
  const wortel = schuinGevraagd ? p * p + q * q : s * s - p * p;
  const isGeheel = Number.isInteger(Math.sqrt(wortel));
  const slot = isGeheel ? `= ${Math.sqrt(wortel)}` : `\\approx ${_mkT(w, dec)}`;
  const oplossing = schuinGevraagd
    ? [`$${XY}^2 = ${p}^2 + ${q}^2 = ${p * p} + ${q * q} = ${wortel}$`,
       `$${XY} = \\sqrt{${wortel}} ${slot}$`]
    : [`$${XR}^2 + ${YR}^2 = ${XY}^2$`,
       `$${p}^2 + ${YR}^2 = ${s}^2$`,
       `$${YR}^2 = ${s * s} - ${p * p} = ${wortel}$`,
       `$${YR} = \\sqrt{${wortel}} ${slot}$`];
  return _mkVraag(leerdoel, {
    tekst: `Bereken de lengte van $${vraagZijde}$. ${_mkRondTekst(dec)}`, svg,
    sets: [{ waarde: w, g }], naam: vraagZijde, dec, tussen: [wortel],
    hints: [
      'Zoek eerst de schuine zijde: die ligt tegenover de rechte hoek.',
      'Stelling van Pythagoras: $\\text{rechthoekszijde}^2 + \\text{rechthoekszijde}^2 = \\text{schuine zijde}^2$.',
      schuinGevraagd
        ? 'Tel de twee kwadraten op en neem daarna de wortel.'
        : 'De gevraagde zijde is een rechthoekszijde: trek de kwadraten van elkaar af en neem daarna de wortel.',
    ],
    oplossing,
  });
}

const genMKP1a = () => _mkPythagoras('MK.P1a', true);
const genMKP1b = () => _mkPythagoras('MK.P1b', false);

/* Afstand tussen twee roosterpunten. */
function genMKP2a() {
  let A, B, dx, dy, w, dec;
  do {
    A = [rand(-6, 6), rand(-6, 6)];
    B = [rand(-6, 6), rand(-6, 6)];
    dx = Math.abs(B[0] - A[0]); dy = Math.abs(B[1] - A[1]);
    w = Math.hypot(dx, dy);
    dec = pick([1, 1, 2]);
  } while (dx < 2 || dy < 2 || !_mkVeilig(w, dec));
  const coord = ([x, y]) => `(${x}, ${y})`;
  const haakje = n => n < 0 ? `(${n})` : `${n}`;
  const verschil = (p, q) => `${Math.max(p, q)} - ${haakje(Math.min(p, q))} = ${Math.abs(p - q)}`;
  const som = dx * dx + dy * dy;
  const slot = Number.isInteger(w) ? `= ${w}` : `\\approx ${_mkT(w, dec)}`;
  return _mkVraag('MK.P2a', {
    tekst: `Bereken de afstand tussen $A${coord(A)}$ en $B${coord(B)}$. ${_mkRondTekst(dec)}`,
    svg: _mkAssenSVG(A, B),
    sets: [{ waarde: w, g: {} }], naam: 'AB', dec, tussen: [dx, dy, dx * dx, dy * dy, som],
    hints: [
      'Teken een rechthoekige driehoek met $AB$ als schuine zijde en de andere twee zijden langs de roosterlijnen.',
      'De rechthoekszijden zijn het verschil in $x$-coördinaat en het verschil in $y$-coördinaat. Gebruik daarna de stelling van Pythagoras.',
    ],
    oplossing: [
      `Verschil in $x$ is $${verschil(A[0], B[0])}$.`,
      `Verschil in $y$ is $${verschil(A[1], B[1])}$.`,
      `$AB^2 = ${dx}^2 + ${dy}^2 = ${dx * dx} + ${dy * dy} = ${som}$`,
      `$AB = \\sqrt{${som}} ${slot}$`,
    ],
  });
}

/* Lichaamsdiagonaal AG van balk ABCD.EFGH (schuine projectie). */
function genMKP2b() {
  let l, b, h, w, dec;
  do {
    l = rand(3, 12); b = rand(2, 9); h = rand(2, 10);
    w = Math.sqrt(l * l + b * b + h * h);
    dec = pick([1, 1, 2]);
  } while (!_mkVeilig(w, dec));
  const diep = _mkV.maal([Math.cos(_mkRad(35)), Math.sin(_mkRad(35))], b * 0.6);
  const A = [0, 0], B = [l, 0], C = _mkV.plus(B, diep), D = _mkV.plus(A, diep);
  const om = p => _mkV.plus(p, [0, h]);
  const P = { A, B, C, D, E: om(A), F: om(B), G: om(C), H: om(D) };
  const verborgen = { stippel: true, kleur: MK_KLEUR.hulp, dik: 1.5 };
  // D en F liggen vlak bij diagonaal AG: hun letter gaat loodrecht van AG af.
  const ag = _mkV.een(_mkV.min(P.G, A));
  const vanAG = p => {
    let n = [-ag[1], ag[0]];
    const ap = _mkV.min(p, A);
    if (n[0] * ap[0] + n[1] * ap[1] < 0) n = _mkV.maal(n, -1);
    return _mkV.min(p, n);
  };
  const svg = _mkFiguur({
    punten: P, naamRef: { D: vanAG(D), F: vanAG(P.F) },
    lijnen: [
      ['A', 'B'], ['B', 'C'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'],
      ['A', 'E'], ['B', 'F'], ['C', 'G'],
      ['A', 'D', verborgen], ['D', 'C', verborgen], ['D', 'H', verborgen],
      ['A', 'G', { kleur: MK_KLEUR.gevraagd, dik: 2 }],
    ],
    zijden: [
      { van: 'A', naar: 'B', tekst: _mkL(l), ref: _mkV.midden([A, B, om(A), om(B)]) },
      { van: 'B', naar: 'C', tekst: _mkL(b), ref: A },
      { van: 'C', naar: 'G', tekst: _mkL(h), ref: A },
    ],
    breedte: 320, hoogte: 260,
  });
  const AC2 = l * l + b * b, AG2 = AC2 + h * h;
  const slot = Number.isInteger(w) ? `= ${w}` : `\\approx ${_mkT(w, dec)}`;
  return _mkVraag('MK.P2b', {
    tekst: `Bereken de lengte van lichaamsdiagonaal $AG$ van balk $ABCD.EFGH$. ${_mkRondTekst(dec)}`, svg,
    sets: [{ waarde: w, g: { AB: l, BC: b, CG: h, AC: Math.sqrt(AC2), AF: Math.hypot(l, h), BG: Math.hypot(b, h) } }],
    naam: 'AG', dec, tussen: [AC2, Math.sqrt(AC2), AG2],
    hints: [
      'Gebruik twee keer Pythagoras. Bereken eerst de diagonaal $AC$ van het grondvlak.',
      'Driehoek $ACG$ heeft een rechte hoek bij $C$. Daarin is $AG$ de schuine zijde.',
    ],
    oplossing: [
      `$AC^2 = ${l}^2 + ${b}^2 = ${l * l} + ${b * b} = ${AC2}$`,
      `$AG^2 = AC^2 + CG^2 = ${AC2} + ${h}^2 = ${AG2}$`,
      `$AG = \\sqrt{${AG2}} ${slot}$`,
    ],
  });
}

/* ═══ Sinus, cosinus en tangens ═══════════════════════════════════════════ */
const MK_GONIO = {
  sin: { teller: 'overstaande', noemer: 'schuine' },
  cos: { teller: 'aanliggende', noemer: 'schuine' },
  tan: { teller: 'overstaande', noemer: 'aanliggende' },
};
const MK_SOS_TIP = 'SOS CAS TOA: $\\sin = \\frac{\\text{overstaande}}{\\text{schuine}}$, $\\cos = \\frac{\\text{aanliggende}}{\\text{schuine}}$, $\\tan = \\frac{\\text{overstaande}}{\\text{aanliggende}}$.';

/* De drie zijden van de rechthoekige driehoek, met naam, bij hoek X. */
function _mkRolZijden(d, aan, over) {
  const { X, R, Y } = d;
  return {
    aanliggende: { naam: _mkZ(X, R), van: X, naar: R, lengte: aan },
    overstaande: { naam: _mkZ(Y, R), van: Y, naar: R, lengte: over },
    schuine: { naam: _mkZ(X, Y), van: X, naar: Y, lengte: Math.hypot(aan, over) },
  };
}

function genMKG1a() {
  let fn, aan, over, hoek, dec, teller, noemer;
  do {
    fn = pick(['sin', 'cos', 'tan']);
    dec = pick([0, 1, 1]);
    if (fn === 'tan') {
      aan = rand(3, 15); over = rand(3, 15);
      teller = over; noemer = aan;
    } else {
      const s = rand(6, 20), z = rand(2, s - 2);
      if (fn === 'sin') { over = z; aan = Math.sqrt(s * s - z * z); }
      else { aan = z; over = Math.sqrt(s * s - z * z); }
      teller = z; noemer = s;
    }
    hoek = _mkDeg(Math.atan2(over, aan));
  } while (hoek < 15 || hoek > 75 || !_mkVeilig(hoek, dec));
  const d = _mkRechtDriehoek(aan, over);
  const rol = _mkRolZijden(d, aan, over);
  const zT = rol[MK_GONIO[fn].teller], zN = rol[MK_GONIO[fn].noemer];
  const svg = _mkFiguur({
    punten: d.P, lijnen: [[d.X, d.R], [d.R, d.Y], [d.Y, d.X]],
    hoeken: [
      { bij: d.R, van: d.X, naar: d.Y, recht: true },
      { bij: d.X, van: d.R, naar: d.Y, tekst: '?', kleur: MK_KLEUR.gevraagd },
    ],
    zijden: [zT, zN].map(z => ({ van: z.van, naar: z.naar, tekst: _mkL(z.lengte) })),
  });
  const breuk = `\\frac{${teller}}{${noemer}}`;
  return _mkVraag('MK.G1a', {
    tekst: `Bereken $\\angle ${d.X}$. ${_mkRondTekst(dec, true)}`, svg,
    sets: [{ waarde: hoek, g: d.g }], naam: d.X, dec, tussen: [teller / noemer],
    hints: [
      `Bekijk de zijden vanuit $\\angle ${d.X}$: welke is de overstaande, welke de aanliggende en welke de schuine zijde? Welke twee zijn gegeven?`,
      MK_SOS_TIP,
      'Bereken de hoek met de inverse knop van je rekenmachine ($\\sin^{-1}$, $\\cos^{-1}$ of $\\tan^{-1}$). Zet je rekenmachine in graden.',
    ],
    oplossing: [
      `$\\${fn}(\\angle ${d.X}) = \\frac{${zT.naam}}{${zN.naam}} = ${breuk}$`,
      `$\\angle ${d.X} = \\${fn}^{-1}\\left(${breuk}\\right) \\approx ${_mkGr(_mkT(hoek, dec))}$`,
    ],
  });
}

/* Zijde berekenen. inTeller: de gevraagde zijde staat in de teller van de
   verhouding (vermenigvuldigen), anders in de noemer (delen). */
function _mkGonioZijde(leerdoel, inTeller) {
  let fn, alfa, bekend, aan, over, w, dec, gevraagdRol, bekendRol;
  do {
    fn = pick(['sin', 'cos', 'tan']);
    alfa = rand(20, 70);
    bekend = rand(4, 20);
    dec = pick([1, 1, 2]);
    const { teller, noemer } = MK_GONIO[fn];
    gevraagdRol = inTeller ? teller : noemer;
    bekendRol = inTeller ? noemer : teller;
    // Bereken uit de bekende zijde en de hoek de hele driehoek.
    const t = Math.tan(_mkRad(alfa)), s = Math.sin(_mkRad(alfa)), c = Math.cos(_mkRad(alfa));
    if (bekendRol === 'aanliggende') { aan = bekend; over = bekend * t; }
    else if (bekendRol === 'overstaande') { over = bekend; aan = bekend / t; }
    else { aan = bekend * c; over = bekend * s; }
    w = gevraagdRol === 'aanliggende' ? aan : gevraagdRol === 'overstaande' ? over : Math.hypot(aan, over);
  } while (!_mkVeilig(w, dec));
  const d = _mkRechtDriehoek(aan, over);
  const rol = _mkRolZijden(d, aan, over);
  const zG = rol[gevraagdRol], zB = rol[bekendRol];
  const svg = _mkFiguur({
    punten: d.P, lijnen: [[d.X, d.R], [d.R, d.Y], [d.Y, d.X]],
    hoeken: [
      { bij: d.R, van: d.X, naar: d.Y, recht: true },
      { bij: d.X, van: d.R, naar: d.Y, tekst: `${alfa}°` },
    ],
    zijden: [
      { van: zB.van, naar: zB.naar, tekst: _mkL(bekend) },
      { van: zG.van, naar: zG.naar, tekst: '?', kleur: MK_KLEUR.gevraagd },
    ],
  });
  const f = `\\${fn}(${_mkGr(alfa)})`;
  const { teller, noemer } = MK_GONIO[fn];
  const oplossing = [
    `$\\${fn}(\\angle ${d.X}) = \\frac{${rol[teller].naam}}{${rol[noemer].naam}}$`,
    inTeller ? `$${f} = \\frac{${zG.naam}}{${bekend}}$` : `$${f} = \\frac{${bekend}}{${zG.naam}}$`,
    inTeller
      ? `$${zG.naam} = ${bekend} \\cdot ${f} \\approx ${_mkT(w, dec)}$`
      : `$${zG.naam} = \\frac{${bekend}}{${f}} \\approx ${_mkT(w, dec)}$`,
  ];
  return _mkVraag(leerdoel, {
    tekst: `Bereken de lengte van $${zG.naam}$. ${_mkRondTekst(dec)}`, svg,
    sets: [{ waarde: w, g: { ...d.g, [d.X]: alfa } }], naam: zG.naam, dec,
    tussen: [Math[fn](_mkRad(alfa))],
    hints: [
      `Bekijk de zijden vanuit de gegeven hoek: welke is gegeven en welke wordt gevraagd? Kies de verhouding (sin, cos of tan) waarin precies die twee zitten.`,
      MK_SOS_TIP,
      inTeller
        ? 'De gevraagde zijde staat in de teller. Vermenigvuldig beide kanten met de noemer.'
        : 'De gevraagde zijde staat in de noemer. Wissel de gevraagde zijde en de sinus, cosinus of tangens om: deel de gegeven zijde door de verhouding.',
    ],
    oplossing,
  });
}

const genMKG2a = () => _mkGonioZijde('MK.G2a', true);
const genMKG2b = () => _mkGonioZijde('MK.G2b', false);

/* ═══ Sinusregel en cosinusregel ═════════════════════════════════════════
   Driehoek met hoekpunten p, q, r. De zijde tegenover hoek p heet
   tegen(p). */
function _mkDriehoekUitHoeken(alfa, beta, c) {
  // A in de oorsprong, B op de x-as, hoek A = alfa, hoek B = beta.
  const gamma = 180 - alfa - beta;
  const b = c * Math.sin(_mkRad(beta)) / Math.sin(_mkRad(gamma));
  return [[0, 0], [c, 0], [b * Math.cos(_mkRad(alfa)), b * Math.sin(_mkRad(alfa))]];
}

function _mkDriehoekUitZijden(a, b, c) {
  const x = (b * b + c * c - a * a) / (2 * c);
  return [[0, 0], [c, 0], [x, Math.sqrt(Math.max(0, b * b - x * x))]];
}

function _mkAlgDriehoek(coords) {
  const namen = pick(MK_NAMEN);
  const [pA, pB, pC] = coords;
  const P = _mkTransformeer({ [namen[0]]: pA, [namen[1]]: pB, [namen[2]]: pC }, rand(-25, 25));
  const g = _mkDriehoekG(P, namen);
  const tegen = p => _mkZ(...namen.filter(n => n !== p));
  return { namen, P, g, tegen };
}

const MK_SINUSREGEL_TIP = 'Sinusregel: $\\frac{a}{\\sin(\\angle A)} = \\frac{b}{\\sin(\\angle B)} = \\frac{c}{\\sin(\\angle C)}$. Elke zijde staat bij de hoek die er tegenover ligt.';

/* MK.S1a: twee hoeken en een zijde gegeven, gevraagd een andere zijde. Soms
   zijn juist de twee andere hoeken gegeven en moet eerst de hoek tegenover
   de gevraagde zijde berekend worden. */
function genMKS1a() {
  for (;;) {
    const alfa = rand(25, 110), beta = rand(25, 110), gamma = 180 - alfa - beta;
    if (gamma < 20) continue;
    const dec = pick([1, 1, 2]);
    const bekend = rand(4, 15);
    const d = _mkAlgDriehoek(_mkDriehoekUitHoeken(alfa, beta, 1));
    const hoek = { [d.namen[0]]: alfa, [d.namen[1]]: beta, [d.namen[2]]: gamma };
    const [pBekend, pGevraagd, pDerde] = shuffle(d.namen);
    const zBekend = d.tegen(pBekend), zGevraagd = d.tegen(pGevraagd);
    // Schaal de driehoek zo dat de gegeven zijde een geheel getal is.
    const schaal = bekend / d.g[zBekend];
    for (const k of d.namen) d.P[k] = _mkV.maal(d.P[k], schaal);
    const g = { ..._mkDriehoekG(d.P, d.namen), ...hoek, [zBekend]: bekend };
    const w = g[zGevraagd];
    if (!_mkVeilig(w, dec)) continue;

    const eerstDerde = Math.random() < 0.35;
    const gegevenHoeken = eerstDerde ? [pBekend, pDerde] : [pBekend, pGevraagd];
    const [n0, n1, n2] = d.namen;
    const svg = _mkFiguur({
      punten: d.P, lijnen: [[n0, n1], [n1, n2], [n2, n0]],
      hoeken: gegevenHoeken.map(p => {
        const [q, r] = d.namen.filter(n => n !== p);
        return { bij: p, van: q, naar: r, tekst: `${hoek[p]}°` };
      }),
      zijden: [
        { van: zBekend[0], naar: zBekend[1], tekst: _mkL(bekend) },
        { van: zGevraagd[0], naar: zGevraagd[1], tekst: '?', kleur: MK_KLEUR.gevraagd },
      ],
    });
    const sG = `\\sin(${_mkGr(hoek[pGevraagd])})`, sB = `\\sin(${_mkGr(hoek[pBekend])})`;
    const oplossing = [];
    if (eerstDerde) {
      oplossing.push(`$\\angle ${pGevraagd} = 180^{\\circ} - ${_mkGr(hoek[pBekend])} - ${_mkGr(hoek[pDerde])} = ${_mkGr(hoek[pGevraagd])}$`);
    }
    oplossing.push(
      `$\\frac{${zGevraagd}}{\\sin(\\angle ${pGevraagd})} = \\frac{${zBekend}}{\\sin(\\angle ${pBekend})}$`,
      `$\\frac{${zGevraagd}}{${sG}} = \\frac{${bekend}}{${sB}}$`,
      `$${zGevraagd} = \\frac{${bekend} \\cdot ${sG}}{${sB}} \\approx ${_mkT(w, dec)}$`,
    );
    return _mkVraag('MK.S1a', {
      tekst: `Bereken de lengte van $${zGevraagd}$. ${_mkRondTekst(dec)}`, svg,
      sets: [{ waarde: w, g }], naam: zGevraagd, dec,
      tussen: [hoek[pGevraagd], bekend / Math.sin(_mkRad(hoek[pBekend]))],
      hints: [
        'Er is geen rechte hoek, dus SOS CAS TOA werkt hier niet. Je kent een zijde en de hoek die er tegenover ligt: gebruik de sinusregel.',
        eerstDerde
          ? `Voor de sinusregel heb je de hoek tegenover $${zGevraagd}$ nodig. De hoeken van een driehoek zijn samen $180^{\\circ}$.`
          : MK_SINUSREGEL_TIP,
        `Zet $${zGevraagd}$ met de hoek ertegenover in de ene breuk en de gegeven zijde met de hoek ertegenover in de andere.`,
      ],
      oplossing,
    });
  }
}

/* MK.S1b: twee zijden en de hoek tegenover de langste gegeven zijde. De
   gevraagde hoek ligt dan tegenover de kortere zijde en is scherp: één
   oplossing. */
function genMKS1b() {
  let a, b, alfa, beta, dec;
  do {
    alfa = rand(30, 120);
    a = rand(6, 15); b = rand(3, a - 1);
    beta = _mkDeg(Math.asin(b * Math.sin(_mkRad(alfa)) / a));
    dec = pick([0, 1, 1]);
  } while (180 - alfa - beta < 15 || beta < 12 || !_mkVeilig(beta, dec));
  const d = _mkAlgDriehoek(_mkDriehoekUitHoeken(alfa, beta, a * Math.sin(_mkRad(180 - alfa - beta)) / Math.sin(_mkRad(alfa))));
  const [pA, pB, pC] = d.namen;
  const zA = d.tegen(pA), zB = d.tegen(pB);
  const svg = _mkFiguur({
    punten: d.P, lijnen: [[pA, pB], [pB, pC], [pC, pA]],
    hoeken: [
      { bij: pA, van: pB, naar: pC, tekst: `${alfa}°` },
      { bij: pB, van: pA, naar: pC, tekst: '?', kleur: MK_KLEUR.gevraagd },
    ],
    zijden: [
      { van: zA[0], naar: zA[1], tekst: _mkL(a) },
      { van: zB[0], naar: zB[1], tekst: _mkL(b) },
    ],
  });
  const g = { ...d.g, [pA]: alfa, [zA]: a, [zB]: b };
  const sA = `\\sin(${_mkGr(alfa)})`;
  return _mkVraag('MK.S1b', {
    tekst: `Bereken $\\angle ${pB}$. ${_mkRondTekst(dec, true)}`, svg,
    sets: [{ waarde: beta, g }], naam: pB, dec,
    tussen: [Math.sin(_mkRad(beta))],
    hints: [
      `Je kent een zijde met de hoek ertegenover. Gebruik de sinusregel met $\\angle ${pB}$ en de zijde tegenover $\\angle ${pB}$.`,
      MK_SINUSREGEL_TIP,
      `Los eerst $\\sin(\\angle ${pB})$ op en gebruik dan $\\sin^{-1}$. Zet je rekenmachine in graden.`,
    ],
    oplossing: [
      `$\\frac{\\sin(\\angle ${pB})}{${zB}} = \\frac{\\sin(\\angle ${pA})}{${zA}}$`,
      `$\\frac{\\sin(\\angle ${pB})}{${b}} = \\frac{${sA}}{${a}}$`,
      `$\\sin(\\angle ${pB}) = \\frac{${b} \\cdot ${sA}}{${a}}$`,
      `$\\angle ${pB} = \\sin^{-1}\\left(\\frac{${b} \\cdot ${sA}}{${a}}\\right) \\approx ${_mkGr(_mkT(beta, dec))}$`,
    ],
  });
}

/* MK.S1c: twee mogelijke driehoeken. Gegeven hoek A, zijde AB = c en
   BC = a met c·sin A < a < c. De cirkel om B met straal a snijdt de halve
   lijn vanuit A twee keer: hoek C is scherp of stomp. */
function genMKS1c() {
  let alfa, c, a, gamma, dec;
  do {
    alfa = rand(25, 55); c = rand(6, 14);
    a = rand(Math.ceil(c * Math.sin(_mkRad(alfa)) + 0.8), c - 1);
    gamma = _mkDeg(Math.asin(c * Math.sin(_mkRad(alfa)) / a));
    dec = pick([0, 1, 1]);
  } while (a >= c || gamma > 75 || !_mkVeilig(gamma, dec));
  const [nA, nB, nC] = pick(MK_NAMEN);
  const Bp = [c * Math.cos(_mkRad(alfa)), c * Math.sin(_mkRad(alfa))];
  const wortel = Math.sqrt(a * a - Bp[1] * Bp[1]);
  const x1 = Bp[0] + wortel, x2 = Bp[0] - wortel;   // x1: C scherp, x2: C stomp
  const eind = x1 + 0.25 * c;
  const hoekVanuitB = x => _mkDeg(Math.atan2(-Bp[1], x - Bp[0]));
  const h1 = hoekVanuitB(x1), h2 = hoekVanuitB(x2);
  const P = { [nA]: [0, 0], [nB]: Bp, E: [eind, 0] };
  const svg = _mkFiguur({
    punten: P, namen: [nA, nB],
    lijnen: [[nA, nB], [nA, 'E']],
    cirkels: [{ m: nB, r: a, boog: [h2 - 10, h1 + 10], stippel: true }],
    hoeken: [{ bij: nA, van: 'E', naar: nB, tekst: `${alfa}°` }],
    zijden: [{ van: nA, naar: nB, tekst: _mkL(c), ref: [eind, 0] }],
    ref: [Bp[0], -a * 0.2],
  });
  const zAB = _mkZ(nA, nB), zBC = _mkZ(nB, nC);
  const sA = `\\sin(${_mkGr(alfa)})`;
  const g1 = { [nA]: alfa, [zAB]: c, [zBC]: a, [nB]: 180 - alfa - gamma, [_mkZ(nA, nC)]: x1 };
  const g2 = { [nA]: alfa, [zAB]: c, [zBC]: a, [nB]: gamma - alfa, [_mkZ(nA, nC)]: x2 };
  const r1 = _mkT(gamma, dec), r2 = _mkT(180 - gamma, dec);
  return _mkVraag('MK.S1c', {
    tekst: `Van driehoek $${nA}${nB}${nC}$ is gegeven: $\\angle ${nA} = ${_mkGr(alfa)}$, $${zAB} = ${c}$ en $${zBC} = ${a}$. `
      + `Punt $${nC}$ ligt op de halve lijn vanuit $${nA}$. De stippelboog heeft middelpunt $${nB}$ en straal $${zBC}$.\n`
      + `Bereken alle mogelijke waarden van $\\angle ${nC}$. ${_mkRondTekst(dec, true)}`,
    svg, sets: [{ waarde: gamma, g: g1 }, { waarde: 180 - gamma, g: g2 }], naam: nC, dec,
    tussen: [Math.sin(_mkRad(gamma))],
    hints: [
      `Gebruik de sinusregel met $\\angle ${nC}$ (tegenover $${zAB}$) en $\\angle ${nA}$ (tegenover $${zBC}$).`,
      `Kijk naar de stippelboog: hoe vaak snijdt die de halve lijn? Elk snijpunt is een mogelijke plaats voor $${nC}$.`,
      `Je rekenmachine geeft bij $\\sin^{-1}$ alleen een scherpe hoek. Een stompe hoek heeft dezelfde sinus: $\\sin(180^{\\circ} - x) = \\sin(x)$. Geef beide met de <strong>v</strong>-knop.`,
    ],
    oplossing: [
      `$\\frac{\\sin(\\angle ${nC})}{${zAB}} = \\frac{\\sin(\\angle ${nA})}{${zBC}}$`,
      `$\\sin(\\angle ${nC}) = \\frac{${c} \\cdot ${sA}}{${a}}$`,
      `$\\angle ${nC} = \\sin^{-1}\\left(\\frac{${c} \\cdot ${sA}}{${a}}\\right) \\approx ${_mkGr(r1)}$`,
      `$\\angle ${nC} \\approx ${_mkGr(r1)} \\vee \\angle ${nC} \\approx 180^{\\circ} - ${_mkGr(r1)} = ${_mkGr(r2)}$`,
    ],
  });
}

const MK_COSINUSREGEL_TIP = 'Cosinusregel: $a^2 = b^2 + c^2 - 2bc \\cdot \\cos(\\angle A)$. Links staat de zijde tegenover de hoek.';

/* MK.C1a: twee zijden en de ingesloten hoek, gevraagd de derde zijde. */
function genMKC1a() {
  let b, c, alfa, w, dec;
  do {
    b = rand(3, 15); c = rand(3, 15); alfa = rand(25, 140);
    w = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(_mkRad(alfa)));
    dec = pick([1, 1, 2]);
  } while (Math.max(b, c) / Math.min(b, c) > 3 || !_mkVeilig(w, dec));
  const P0 = [[0, 0], [c, 0], [b * Math.cos(_mkRad(alfa)), b * Math.sin(_mkRad(alfa))]];
  const d = _mkAlgDriehoek(P0);
  const [pA, pB, pC] = d.namen;
  const zAB = _mkZ(pA, pB), zAC = _mkZ(pA, pC), zBC = _mkZ(pB, pC);
  const svg = _mkFiguur({
    punten: d.P, lijnen: [[pA, pB], [pB, pC], [pC, pA]],
    hoeken: [{ bij: pA, van: pB, naar: pC, tekst: `${alfa}°` }],
    zijden: [
      { van: pA, naar: pB, tekst: _mkL(c) },
      { van: pA, naar: pC, tekst: _mkL(b) },
      { van: pB, naar: pC, tekst: '?', kleur: MK_KLEUR.gevraagd },
    ],
  });
  const kw = `${c}^2 + ${b}^2 - 2 \\cdot ${c} \\cdot ${b} \\cdot \\cos(${_mkGr(alfa)})`;
  return _mkVraag('MK.C1a', {
    tekst: `Bereken de lengte van $${zBC}$. ${_mkRondTekst(dec)}`, svg,
    sets: [{ waarde: w, g: { ...d.g, [pA]: alfa, [zAB]: c, [zAC]: b } }], naam: zBC, dec,
    tussen: [w * w],
    hints: [
      'Je kent twee zijden en de hoek die ze insluiten. Dan werkt de sinusregel niet: gebruik de cosinusregel.',
      MK_COSINUSREGEL_TIP,
      'Bereken eerst het kwadraat van de gevraagde zijde en neem daarna de wortel.',
    ],
    oplossing: [
      `$${zBC}^2 = ${zAB}^2 + ${zAC}^2 - 2 \\cdot ${zAB} \\cdot ${zAC} \\cdot \\cos(\\angle ${pA})$`,
      `$${zBC}^2 = ${kw}$`,
      `$${zBC} = \\sqrt{${kw}} \\approx ${_mkT(w, dec)}$`,
    ],
  });
}

/* MK.C1b: drie zijden gegeven, gevraagd een hoek. */
function genMKC1b() {
  let a, b, c, alfa, dec;
  do {
    a = rand(3, 15); b = rand(3, 15); c = rand(3, 15);
    dec = pick([0, 1, 1]);
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    alfa = Math.abs(cosA) < 1 ? _mkDeg(Math.acos(cosA)) : NaN;
  } while (!(alfa > 15 && alfa < 150) || a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1 || !_mkVeilig(alfa, dec));
  const d = _mkAlgDriehoek(_mkDriehoekUitZijden(a, b, c));
  const [pA, pB, pC] = d.namen;
  const zAB = _mkZ(pA, pB), zAC = _mkZ(pA, pC), zBC = _mkZ(pB, pC);
  const svg = _mkFiguur({
    punten: d.P, lijnen: [[pA, pB], [pB, pC], [pC, pA]],
    hoeken: [{ bij: pA, van: pB, naar: pC, tekst: '?', kleur: MK_KLEUR.gevraagd }],
    zijden: [
      { van: pA, naar: pB, tekst: _mkL(c) },
      { van: pA, naar: pC, tekst: _mkL(b) },
      { van: pB, naar: pC, tekst: _mkL(a) },
    ],
  });
  const som = b * b + c * c, factor = 2 * b * c, rest = som - a * a;   // factor·cos A = rest
  const gd = gcd(Math.abs(rest), factor) || 1;
  const breuk = rest === 0 ? '0'
    : `${rest < 0 ? '-' : ''}\\frac{${Math.abs(rest) / gd}}{${factor / gd}}`;
  return _mkVraag('MK.C1b', {
    tekst: `Bereken $\\angle ${pA}$. ${_mkRondTekst(dec, true)}`, svg,
    sets: [{ waarde: alfa, g: { ...d.g, [zAB]: c, [zAC]: b, [zBC]: a } }], naam: pA, dec,
    tussen: [rest / factor],
    hints: [
      'Je kent alle drie de zijden. Gebruik de cosinusregel met de zijde tegenover de gevraagde hoek links van het isgelijkteken.',
      MK_COSINUSREGEL_TIP,
      `Vul in, werk de kwadraten uit en los eerst $\\cos(\\angle ${pA})$ op. Gebruik daarna $\\cos^{-1}$.`,
    ],
    oplossing: [
      `$${zBC}^2 = ${zAB}^2 + ${zAC}^2 - 2 \\cdot ${zAB} \\cdot ${zAC} \\cdot \\cos(\\angle ${pA})$`,
      `$${a}^2 = ${c}^2 + ${b}^2 - 2 \\cdot ${c} \\cdot ${b} \\cdot \\cos(\\angle ${pA})$`,
      `$${a * a} = ${som} - ${factor}\\cos(\\angle ${pA})$`,
      `$${factor}\\cos(\\angle ${pA}) = ${rest}$`,
      `$\\cos(\\angle ${pA}) = ${breuk}$`,
      `$\\angle ${pA} = \\cos^{-1}\\left(${breuk}\\right) \\approx ${_mkGr(_mkT(alfa, dec))}$`,
    ],
  });
}

/* ═══ Gelijkvormigheid ════════════════════════════════════════════════════ */
const MK_GELIJKVORMIG_TIP = 'Zet de overeenkomstige zijden in een verhoudingstabel: bovenin de zijden van de ene driehoek, eronder die van de andere. Elke kolom heeft dezelfde vermenigvuldigingsfactor.';

/* Gegeven twee overeenkomstige zijden (k1 hoort bij k2) en zijde z1, gevraagd
   de zijde die bij z1 hoort. Geeft { w, dec, regels }. */
function _mkVerhouding(gevraagd, z1, k1, k2, z1Naam, k1Naam, k2Naam) {
  const w = z1 * k2 / k1;
  return {
    w,
    regels: [
      `$\\frac{${gevraagd}}{${z1Naam}} = \\frac{${k2Naam}}{${k1Naam}}$`,
      `$\\frac{${gevraagd}}{${_mkT(z1)}} = \\frac{${_mkT(k2)}}{${_mkT(k1)}}$`,
      `$${gevraagd} = \\frac{${_mkT(k2)} \\cdot ${_mkT(z1)}}{${_mkT(k1)}}`,
    ],
  };
}

function _mkSluitAf(regels, w, dec) {
  const laatste = regels.pop();
  regels.push(dec === null ? `${laatste} = ${_mkT(w)}$` : `${laatste} \\approx ${_mkT(w, dec)}$`);
  return regels;
}

const _mkHonderdsten = x => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;

/* MK.V1a: snavelfiguur. Driehoek T B C met D op TB en E op TC, DE ∥ BC. */
function genMKV1a() {
  for (;;) {
    const TD = rand(2, 9), DB = rand(2, 9), DE = rand(2, 10);
    const TB = TD + DB, BC = DE * TB / TD;
    const variant = pick(['BC', 'DE', 'DB']);
    const w = variant === 'BC' ? BC : variant === 'DE' ? DE : DB;
    const dec = _mkDecVoor(w);
    if (!_mkVeilig(w, dec)) continue;
    if (variant !== 'BC' && !_mkHonderdsten(BC)) continue;   // BC staat dan in de figuur

    const [T, B, C, D, E] = pick([['A', 'B', 'C', 'D', 'E'], ['T', 'P', 'Q', 'R', 'S'], ['S', 'K', 'L', 'M', 'N']]);
    const tri = _mkDriehoekUitHoeken(rand(55, 80), rand(45, 75), BC);   // B, C, top
    const k = TD / TB, top = tri[2];
    const P = _mkTransformeer({
      [B]: tri[0], [C]: tri[1], [T]: top,
      [D]: _mkV.plus(top, _mkV.maal(_mkV.min(tri[0], top), k)),
      [E]: _mkV.plus(top, _mkV.maal(_mkV.min(tri[1], top), k)),
    }, rand(-20, 20), Math.random() < 0.5);
    const zij = (a, b, waarde, gevraagd) => gevraagd
      ? { van: a, naar: b, tekst: '?', kleur: MK_KLEUR.gevraagd }
      : { van: a, naar: b, tekst: _mkL(waarde) };
    const svg = _mkFiguur({
      punten: P, lijnen: [[T, B], [B, C], [C, T], [D, E]],
      zijden: [
        zij(T, D, TD), zij(D, B, DB, variant === 'DB'),
        { ...zij(D, E, DE, variant === 'DE'), ref: P[T] }, zij(B, C, BC, variant === 'BC'),
      ],
    });
    const zTD = _mkZ(T, D), zTB = _mkZ(T, B), zDE = _mkZ(D, E), zBC = _mkZ(B, C), zDB = _mkZ(D, B);
    const gevraagd = variant === 'BC' ? zBC : variant === 'DE' ? zDE : zDB;
    const g = { [zTD]: TD, [zDB]: DB, [zTB]: TB, [zDE]: DE, [zBC]: BC };
    const somTB = `$${zTB} = ${zTD} + ${zDB} = ${TD} + ${DB} = ${TB}$`;
    let oplossing;
    if (variant === 'BC') {
      oplossing = [somTB, ..._mkSluitAf(_mkVerhouding(zBC, DE, TD, TB, zDE, zTD, zTB).regels, w, dec)];
    } else if (variant === 'DE') {
      oplossing = [somTB, ..._mkSluitAf(_mkVerhouding(zDE, BC, TB, TD, zBC, zTB, zTD).regels, w, dec)];
    } else {
      oplossing = [..._mkSluitAf(_mkVerhouding(zTB, TD, DE, BC, zTD, zDE, zBC).regels, TB, null),
        `$${zDB} = ${zTB} - ${zTD} = ${TB} - ${TD} = ${DB}$`];
    }
    return _mkVraag('MK.V1a', {
      tekst: `In de figuur is $${zDE}$ evenwijdig aan $${zBC}$. Bereken de lengte van $${gevraagd}$.${dec === null ? '' : ' ' + _mkRondTekst(dec)}`,
      svg, sets: [{ waarde: w, g }], naam: gevraagd, dec,
      tussen: [TB, TB / TD, TD / TB],
      hints: [
        `Driehoek $${T}${D}${E}$ en driehoek $${T}${B}${C}$ zijn gelijkvormig: ze hebben $\\angle ${T}$ gemeen en door de evenwijdige lijnen zijn ook de andere hoeken gelijk.`,
        `Let op: de zijde van de grote driehoek is $${zTB}$, niet $${zDB}$.`,
        MK_GELIJKVORMIG_TIP,
      ],
      oplossing,
    });
  }
}

/* MK.V1b: zandloperfiguur. AC en BD snijden elkaar in S, AB ∥ CD. Driehoek
   SAB is gelijkvormig met driehoek SCD (A hoort bij C, B bij D). De hoek bij
   S volgt met de cosinusregel uit SA, SB en AB, zodat de figuur op schaal is. */
function genMKV1b() {
  for (;;) {
    const SA = rand(2, 9), SB = rand(2, 9), AB = rand(2, 10), SC = rand(2, 12);
    // Geen gelijke driehoeken en geen piepkleine of reusachtige tweede driehoek.
    if (SA === SC || SC / SA < 0.4 || SC / SA > 2.5) continue;
    const cosS = (SA * SA + SB * SB - AB * AB) / (2 * SA * SB);
    if (!(cosS > -0.6 && cosS < 0.85)) continue;
    const CD = AB * SC / SA, SD = SB * SC / SA;
    const variant = pick(['CD', 'SD', 'SC']);
    const w = variant === 'CD' ? CD : variant === 'SD' ? SD : SC;
    const dec = _mkDecVoor(w);
    if (!_mkVeilig(w, dec)) continue;
    if (variant === 'SC' && !_mkHonderdsten(CD)) continue;     // CD staat dan in de figuur

    const [A, B, C, D, S] = pick([['A', 'B', 'C', 'D', 'S'], ['P', 'Q', 'R', 'T', 'M'], ['K', 'L', 'N', 'O', 'S']]);
    const half = _mkDeg(Math.acos(cosS)) / 2;
    const uA = [Math.cos(_mkRad(180 + half)), Math.sin(_mkRad(180 + half))];
    const uB = [Math.cos(_mkRad(180 - half)), Math.sin(_mkRad(180 - half))];
    const P = _mkTransformeer({
      [S]: [0, 0], [A]: _mkV.maal(uA, SA), [B]: _mkV.maal(uB, SB),
      [C]: _mkV.maal(uA, -SC), [D]: _mkV.maal(uB, -SD),
    }, rand(-30, 30), Math.random() < 0.5);
    // Een label op een lijn door S wijst weg van de andere lijn aan dezelfde kant.
    const midden = (p, q) => _mkV.maal(_mkV.plus(P[p], P[q]), 0.5);
    const ref = { [A]: midden(S, B), [B]: midden(S, A), [C]: midden(S, D), [D]: midden(S, C) };
    const lab = (p, q, waarde, gevraagd) => ({
      van: p, naar: q, tekst: gevraagd ? '?' : _mkL(waarde),
      kleur: gevraagd ? MK_KLEUR.gevraagd : undefined,
      ref: p === S ? ref[q] : P[S],
    });
    const zijden = [lab(S, A, SA), lab(A, B, AB)];
    if (variant === 'CD') zijden.push(lab(S, C, SC), lab(C, D, CD, true));
    if (variant === 'SD') zijden.push(lab(S, C, SC), lab(S, B, SB), lab(S, D, SD, true));
    if (variant === 'SC') zijden.push(lab(C, D, CD), lab(S, C, SC, true));
    const uA2 = _mkV.een(_mkV.min(P[A], P[S])), uD2 = _mkV.een(_mkV.min(P[D], P[S]));
    const svg = _mkFiguur({
      punten: P, lijnen: [[A, C], [B, D], [A, B], [C, D]], zijden,
      naamRef: { [S]: _mkV.min(P[S], _mkV.plus(uA2, uD2)) },
    });
    const zSA = _mkZ(S, A), zSB = _mkZ(S, B), zSC = _mkZ(S, C), zSD = _mkZ(S, D), zAB = _mkZ(A, B), zCD = _mkZ(C, D);
    const g = { [zSA]: SA, [zSB]: SB, [zSC]: SC, [zSD]: SD, [zAB]: AB, [zCD]: CD };
    let r;
    if (variant === 'CD') r = _mkVerhouding(zCD, AB, SA, SC, zAB, zSA, zSC);
    else if (variant === 'SD') r = _mkVerhouding(zSD, SB, SA, SC, zSB, zSA, zSC);
    else r = _mkVerhouding(zSC, SA, AB, CD, zSA, zAB, zCD);
    const gevraagd = variant === 'CD' ? zCD : variant === 'SD' ? zSD : zSC;
    return _mkVraag('MK.V1b', {
      tekst: `In de figuur is $${zAB}$ evenwijdig aan $${zCD}$. Bereken de lengte van $${gevraagd}$.${dec === null ? '' : ' ' + _mkRondTekst(dec)}`,
      svg, sets: [{ waarde: w, g }], naam: gevraagd, dec,
      tussen: [SC / SA, SA / SC, CD / AB, AB / CD],
      hints: [
        `Driehoek $${S}${A}${B}$ en driehoek $${S}${C}${D}$ zijn gelijkvormig: de hoeken bij $${S}$ zijn overstaande hoeken en door de evenwijdige lijnen zijn ook de andere hoeken gelijk.`,
        `Kijk goed welke punten bij elkaar horen: $${A}$ hoort bij $${C}$ en $${B}$ bij $${D}$.`,
        MK_GELIJKVORMIG_TIP,
      ],
      oplossing: _mkSluitAf(r.regels, w, dec),
    });
  }
}

/* MK.V1c: twee losse gelijkvormige driehoeken, gedraaid en soms gespiegeld.
   Gelijke hoeken hebben dezelfde markering (één, twee of drie boogjes). */
// Niet groter dan 5/2: anders wordt de kleine driehoek te klein om de
// hoekmarkeringen te lezen.
const MK_FACTOREN = [[3, 2], [2, 1], [5, 2], [1, 2], [4, 3], [2, 3], [5, 4]];
function genMKV1c() {
  for (;;) {
    const z = [rand(3, 12), rand(3, 12), rand(3, 12)];        // zijde i ligt tegenover hoekpunt i
    const [a, b, c] = z;
    if (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1) continue;
    if (new Set(z).size < 3) continue;          // gelijke zijden maken de markering dubbelzinnig
    const [kT, kN] = pick(MK_FACTOREN), k = kT / kN;
    const [vraagIdx, bekendIdx] = shuffle([0, 1, 2]);
    if (!_mkHonderdsten(z[bekendIdx] * k)) continue;
    const w = z[vraagIdx] * k;
    const dec = _mkDecVoor(w);
    if (!_mkVeilig(w, dec)) continue;

    const tri = _mkDriehoekUitZijden(a, b, c);
    const namen1 = pick(MK_NAMEN);
    const namen2 = shuffle(pick(MK_NAMEN.filter(n => n !== namen1)));
    const P1 = _mkTransformeer(Object.fromEntries(namen1.map((n, i) => [n, tri[i]])), rand(-20, 20), false);
    const P2r = _mkTransformeer(Object.fromEntries(namen2.map((n, i) => [n, _mkV.maal(tri[i], k)])),
      rand(0, 359), Math.random() < 0.5);
    // Leg driehoek 2 rechts naast driehoek 1, verticaal gecentreerd.
    const bbox = pts => {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), midY: (Math.min(...ys) + Math.max(...ys)) / 2 };
    };
    const b1 = bbox(Object.values(P1)), b2 = bbox(Object.values(P2r));
    const verschuif = [b1.maxX - b2.minX + Math.max(a, b, c) * Math.max(1, k) * 0.35, b1.midY - b2.midY];
    const P2 = Object.fromEntries(Object.entries(P2r).map(([n, p]) => [n, _mkV.plus(p, verschuif)]));
    const m1 = _mkV.midden(Object.values(P1)), m2 = _mkV.midden(Object.values(P2));
    const anders = (namen, i) => namen.filter((_, j) => j !== i);
    const zNaam = (namen, i) => _mkZ(...anders(namen, i));
    const markering = namen => namen.map((p, i) => {
      const [q, r] = anders(namen, i);
      return { bij: p, van: q, naar: r, bogen: i + 1 };
    });
    const zijden = z.map((l, i) => {
      const [q, r] = anders(namen1, i);
      return { van: q, naar: r, tekst: _mkL(l), ref: m1 };
    });
    const [qb, rb] = anders(namen2, bekendIdx), [qv, rv] = anders(namen2, vraagIdx);
    zijden.push({ van: qb, naar: rb, tekst: _mkL(z[bekendIdx] * k), ref: m2 },
                { van: qv, naar: rv, tekst: '?', kleur: MK_KLEUR.gevraagd, ref: m2 });
    const driehoekLijnen = n => [[n[0], n[1]], [n[1], n[2]], [n[2], n[0]]];
    const svg = _mkFiguur({
      punten: { ...P1, ...P2 },
      lijnen: [...driehoekLijnen(namen1), ...driehoekLijnen(namen2)],
      hoeken: [...markering(namen1), ...markering(namen2)],
      zijden,
      naamRef: Object.fromEntries([...namen1.map(n => [n, m1]), ...namen2.map(n => [n, m2])]),
      breedte: 360, hoogte: 230, marge: 30,
    });
    const gevraagd = zNaam(namen2, vraagIdx);
    const g = {};
    z.forEach((l, i) => { g[zNaam(namen1, i)] = l; g[zNaam(namen2, i)] = l * k; });
    const r = _mkVerhouding(gevraagd, z[vraagIdx], z[bekendIdx], z[bekendIdx] * k,
      zNaam(namen1, vraagIdx), zNaam(namen1, bekendIdx), zNaam(namen2, bekendIdx));
    return _mkVraag('MK.V1c', {
      tekst: `De driehoeken $${namen1.join('')}$ en $${[...namen2].sort().join('')}$ zijn gelijkvormig. Gelijke hoeken hebben dezelfde markering. `
        + `Bereken de lengte van $${gevraagd}$.${dec === null ? '' : ' ' + _mkRondTekst(dec)}`,
      svg, sets: [{ waarde: w, g }], naam: gevraagd, dec, tussen: [k, 1 / k],
      hints: [
        'Zoek bij elke zijde van de ene driehoek de overeenkomstige zijde van de andere: die ligt tegenover dezelfde hoekmarkering.',
        MK_GELIJKVORMIG_TIP,
        'Bereken de vermenigvuldigingsfactor met het paar zijden waarvan je beide lengtes kent.',
      ],
      oplossing: _mkSluitAf(r.regels, w, dec),
    });
  }
}

/* ═══ Nakijken ════════════════════════════════════════════════════════════ */
const MK_TOL = 5e-3;           // relatieve marge voor een tussenstap (afgeronde sinus e.d.)
let _mkMelding = null;         // toelichting bij de laatste beoordeling

function meetkundeMelding() { return _mkMelding; }

function _mkNormaliseer(latex) {
  return (latex || '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\[ ,;!:]/g, ' ')
    .replace(/\{,\}/g, ',')
    .replace(/\^\s*\{\s*\\circ\s*\}|\^\s*\\circ|°|\\degree/g, '')
    .replace(/\\operatorname\{(sin|cos|tan)\}/g, '\\$1')
    .replace(/\\text\{\s*(?:cm|m)\s*\}(?:\^\{?[23]\}?)?/g, '')
    .replace(/(\d|\})\s*cm(?:\^\{?[23]\}?)?\s*$/g, '$1')
    .trim();
}

const _mkIsGetal = s => /^-?\d+(?:[.,]\d+)?$/.test(s.replace(/\s+/g, ''));
const _mkGetal = s => parseFloat(s.replace(/\s+/g, '').replace(',', '.'));
const _mkDecimalen = s => (s.replace(/\s+/g, '').split(/[.,]/)[1] || '').length;

/* Sleutel van een los label vooraan in een regel: 'AC', 'C' (hoek), een
   kleine letter ('r', 'x'), of '?label' voor een woord (omtrek, opp). null
   als het geen kaal label is. Een label dat geen bekende grootheid is, staat
   voor de gevraagde grootheid. */
function _mkLabel(deel) {
  const s = deel.replace(/\s+/g, '');
  let m = s.match(/^\\angle\{?([A-Z])\}?$/);
  if (m) return m[1];
  if (/^[A-Z]$/.test(s) || /^[a-z]$/.test(s)) return s;
  if (/^[A-Z]{2}$/.test(s)) return _mkZ(s[0], s[1]);
  if (/^[a-zA-Z]+$/.test(s) || /^\\text\{[a-zA-Z ]+\}$/.test(s)) return '?label';
  return null;
}

/* Vervangt namen door waarden en rekent een deel uit. */
function _mkEval(deel, set, naam) {
  const kaart = { ...set.g };
  if (naam) kaart[naam] = set.waarde;
  const waarde = n => (kaart[n] === undefined ? '(0/0)' : `(${kaart[n]})`);
  const s = deel.replace(/\\angle\s*\{?\s*([A-Z])\s*\}?|\\[a-zA-Z]+|([A-Z])([A-Z])?|([a-z])/g,
    (m, hoek, h1, h2, klein) => {
      if (hoek) return waarde(hoek);
      if (m[0] === '\\') return m;
      if (h1 && h2) return waarde(_mkZ(h1, h2));
      if (h1) return waarde(h1);
      // r en d bij de cirkel zijn bekend; elke andere kleine letter (x, y)
      // is de gevraagde grootheid.
      return kaart[klein] === undefined ? `(${set.waarde})` : waarde(klein);
    });
  return _algEval(s, {});
}

const _mkDichtbij = (a, b) => Math.abs(a - b) <= MK_TOL * Math.max(1, Math.abs(b));

/* Waarde van deel i in de keten; een kaal label vooraan is de gevraagde
   grootheid, tenzij het een bekende grootheid is. */
function _mkDeelWaarde(delen, i, set, naam) {
  if (i === 0) {
    const label = _mkLabel(delen[0]);
    if (label && (label === '?label' || set.g[label] === undefined)) return set.waarde;
  }
  return _mkEval(delen[i], set, naam);
}

function _mkKetenKlopt(delen, set, naam) {
  const w = delen.map((_, i) => _mkDeelWaarde(delen, i, set, naam));
  if (w.some(v => !isFinite(v))) return false;
  return w.every(v => _mkDichtbij(v, w[0]));
}

function _mkIsPiVorm(s) {
  const t = s.replace(/\s+/g, '');
  return (t.match(/\\pi/g) || []).length === 1 && !/[+\-^]|\\sqrt|\\cdot|\\times/.test(t);
}

/* Beoordeelt één alternatief (zonder 'v') tegen één set.
   Geeft { staat, eind, getal } terug. */
function _mkBeoordeel(delen, set, a) {
  const laatste = delen[delen.length - 1];
  const label = _mkLabel(delen[0]);
  const eersteGevraagd = delen.length === 1
    || label === '?label' || (label !== null && label === a.naam)
    || (label !== null && set.g[label] === undefined)
    || !/[a-zA-Z]/.test(delen[0].replace(/\\[a-zA-Z]+/g, ''));
  const voorKlopt = delen.length === 1
    || delen.slice(0, -1).every((_, i) => _mkDichtbij(_mkDeelWaarde(delen, i, set, a.naam), set.waarde));

  if (eersteGevraagd && voorKlopt && _mkIsGetal(laatste)) {
    const p = _mkGetal(laatste), d = _mkDecimalen(laatste), w = set.waarde;
    if (a.exact === 'pi') {
      if (Math.abs(p - w) <= 0.5 * 10 ** -d + 1e-9) return { staat: 'fout', melding: 'pi' };
    } else if (a.dec === null) {
      if (Math.abs(p - w) < 1e-9) return { staat: 'goed', eind: true, getal: p };
    } else {
      if (Math.abs(p - _mkRond(w, a.dec)) < 1e-9) return { staat: 'goed', eind: true, getal: p };
      if (d > a.dec && Math.abs(p - w) <= 0.5 * 10 ** -d + 1e-9) return { staat: 'tussenstap', melding: 'afronden' };
      if (Math.abs(p - w) < 1.5 * 10 ** -a.dec) return { staat: 'fout', melding: 'afronding' };
    }
  }
  if (a.exact === 'pi' && eersteGevraagd && voorKlopt && _mkIsPiVorm(laatste)) {
    const v = _mkEval(laatste, set, a.naam);
    if (isFinite(v) && Math.abs(v - set.waarde) < 1e-9 * Math.max(1, set.waarde)) return { staat: 'goed', eind: true };
  }
  if (delen.length === 1) {
    if (_mkIsGetal(laatste)) {
      const p = _mkGetal(laatste), d = _mkDecimalen(laatste);
      const marge = d > 0 ? 0.5 * 10 ** -d + 1e-9 : 1e-9;
      if (a.tussen.some(t => Math.abs(p - t) <= marge)) return { staat: 'tussenstap' };
      return { staat: 'fout' };
    }
    const v = _mkEval(laatste, set, a.naam);
    if (isFinite(v) && (_mkDichtbij(v, set.waarde) || a.tussen.some(t => _mkDichtbij(v, t)))) return { staat: 'tussenstap' };
    return { staat: 'fout' };
  }
  return _mkKetenKlopt(delen, set, a.naam) ? { staat: 'tussenstap' } : { staat: 'fout' };
}

function checkMeetkunde(vraag, latex) {
  _mkMelding = null;
  const a = vraag.antwoord;
  const s = _mkNormaliseer(latex);
  if (!s) return 'fout';
  const alternatieven = s.split(/\\quad\s*v\s*\\quad|\\vee|\s+v\s+/).map(t => t.trim()).filter(Boolean);
  const ketens = alternatieven.map(alt => alt.split(/=|\\approx/).map(t => t.trim()));
  if (ketens.some(k => k.some(d => !d))) return 'fout';

  // Per alternatief: de beste beoordeling over alle sets.
  const RANG = { goed: 2, tussenstap: 1, fout: 0 };
  const uitslagen = ketens.map(delen => {
    let beste = null;
    a.sets.forEach((set, idx) => {
      const u = { ...(_mkBeoordeel(delen, set, a)), set: idx };
      if (!beste || RANG[u.staat] > RANG[beste.staat] || (u.melding && !beste.melding && u.staat === beste.staat)) beste = u;
    });
    return beste;
  });

  const eind = uitslagen.filter(u => u.eind);
  if (eind.length === uitslagen.length) {
    const gedekt = new Set(eind.map(u => u.set));
    if (gedekt.size === eind.length && gedekt.size === a.sets.length) return 'goed';
    // Een deel van de oplossingen: goed op weg, maar nog niet af.
    if (gedekt.size === eind.length && gedekt.size < a.sets.length) { _mkMelding = 'meer'; return 'tussenstap'; }
    return 'fout';
  }
  const metMelding = uitslagen.find(u => u.melding);
  if (uitslagen.every(u => u.staat !== 'fout')) {
    if (metMelding) _mkMelding = metMelding.melding;
    return 'tussenstap';
  }
  if (metMelding) _mkMelding = metMelding.melding;
  return 'fout';
}

/* Toelichting bij een tussenstap of een fout antwoord. Verklapt geen
   antwoordwaarden. */
function meetkundeTekst(vraag, staat) {
  const a = vraag.antwoord;
  const dec = a.dec === 0 ? 'een geheel getal' : a.dec === 1 ? 'één decimaal' : 'twee decimalen';
  const m = _mkMelding;
  if (staat === 'tussenstap') {
    if (m === 'afronden') return `Goed, ga door! Rond nu nog af op ${dec}.`;
    if (m === 'meer') return 'Deze waarde klopt, maar er is nog een mogelijkheid. Geef alle waarden, met de <strong>v</strong>-knop ertussen.';
    return null;
  }
  if (m === 'afronding') return `Bijna goed, maar de afronding klopt niet. Reken met de onafgeronde waarden verder en rond pas aan het eind af, op ${dec}.`;
  if (m === 'pi') return 'Je antwoord is afgerond. Geef het exacte antwoord: laat $\\pi$ staan, bijvoorbeeld $6\\pi$.';
  return null;
}
