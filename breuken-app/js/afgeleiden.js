/* ═══════════════════════════════════════════════════════════════════════════
   D – Differentiëren
   ═══════════════════════════════════════════════════════════════════════════
   Drie leerlijnen:
     D.M1  machtsfuncties met de somregel
     D.R1  productregel, quotiëntregel en kettingregel
     D.E1  e^x, g^x, ln en log, gecombineerd met alle regels

   Opgave, antwoord en uitwerking komen uit één model, zodat ze per constructie
   bij elkaar horen:
   - Een term is een product  c · F1^k1 · F2^k2 · …  waarin c en elke k een
     breuk {n, d} zijn. Een factor F is x, een som, e^{u}, ln(u), ln(g), …
   - Bij het uitschrijven komt een negatieve k onder de breukstreep en wordt
     een gebroken k een wortel ('terug'); in de stijl 'macht' blijft alles een
     macht met een negatieve of gebroken exponent.
   - Een "deel" is een stuk functie met zijn eigen model, zijn afgeleide (een
     som van termen) en de stappen van de uitwerking. De product-, quotiënt- en
     kettingregel bouwen een nieuw deel uit bestaande delen.

   Dit bestand staat vóór questions.js in index.html: de LEERDOELEN-lijst daar
   verwijst naar de generators hieronder. Hulpfuncties uit questions.js (uid,
   _randNietNul) worden pas aangeroepen als er een opgave gemaakt wordt.      */

/* ── Breuken {n, d} ─────────────────────────────────────────────────────── */
function _dQ(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1;
  return { n: n / g, d: d / g };
}
const _D1 = { n: 1, d: 1 };
const _dQmaal   = (a, b) => _dQ(a.n * b.n, a.d * b.d);
const _dQplus   = (a, b) => _dQ(a.n * b.d + b.n * a.d, a.d * b.d);
const _dQmin    = a => _dQ(-a.n, a.d);
const _dQgelijk = (a, b) => a.n === b.n && a.d === b.d;
const _dQwaarde = a => a.n / a.d;
const _dQexpTeX = q => q.d === 1 ? `${q.n}` : `${q.n < 0 ? '-' : ''}\\frac{${Math.abs(q.n)}}{${q.d}}`;

/* ── Termen ─────────────────────────────────────────────────────────────────
   Factor: { b: grondtal-TeX, k: exponent, rang: volgorde in een product,
             atoom: kan een exponent krijgen zonder haakjes (alleen x),
             som: b is een som, S: de termen als het een som van x-machten is,
             vouw: hier mag de coëfficiënt in (zie _dNetjes),
             exp: { g, U } bij g^{u}, zodat (e^{x})^{2} als e^{2x} uitkomt } */
const _dX = k => ({ b: 'x', k, rang: 0, atoom: true });
const _dLnG = g => ({ b: `\\ln(${g})`, k: _D1, rang: 8 });

function _dTerm(c, fs = []) {
  return { c, fs: c.n === 0 ? [] : fs.filter(f => f.k.n !== 0) };
}
const _dXTerm = (c, p) => (p.n === 0 ? _dTerm(c) : _dTerm(c, [_dX(p)]));
const _dPuur = m => m.fs.every(f => f.b === 'x');
const _dXMacht = m => (m.fs.length ? m.fs[0].k : _dQ(0));

/* Vermenigvuldigen: gelijke grondtallen tellen hun exponenten op, dus x · x^{-1}
   valt weg en e^{x} / (e^{x})^{2} wordt 1 / e^{x}. */
function _dMaal(a, b) {
  const fs = a.fs.map(f => ({ ...f }));
  for (const f of b.fs) {
    const zelfde = fs.find(g => g.b === f.b);
    if (zelfde) zelfde.k = _dQplus(zelfde.k, f.k);
    else fs.push({ ...f });
  }
  return _dTerm(_dQmaal(a.c, b.c), fs);
}
const _dOmgekeerd = a => _dTerm(_dQ(a.c.d, a.c.n), a.fs.map(f => ({ ...f, k: _dQmin(f.k) })));
const _dGedeeld   = (a, b) => _dMaal(a, _dOmgekeerd(b));
const _dSchaal    = (a, q) => _dTerm(_dQmaal(a.c, q), a.fs);
const _dMaalSom   = (S1, S2) => S1.flatMap(a => S2.map(b => _dMaal(a, b)));

/* Gelijksoortige x-machten samennemen, van hoog naar laag. */
function _dCombineer(termen) {
  const per = new Map();
  for (const m of termen) {
    const p = _dXMacht(m), sleutel = `${p.n}/${p.d}`;
    const oud = per.get(sleutel);
    per.set(sleutel, { p, c: oud ? _dQplus(oud.c, m.c) : m.c });
  }
  return [...per.values()].filter(t => t.c.n !== 0)
    .sort((s, t) => _dQwaarde(t.p) - _dQwaarde(s.p))
    .map(t => _dXTerm(t.c, t.p));
}

/* Een som van termen als één term: een som wordt één factor tussen haakjes. */
function _dAlsTerm(termen) {
  const S = termen.every(_dPuur) ? _dCombineer(termen) : null;
  const lijst = S || termen.filter(m => m.c.n !== 0);
  if (!lijst.length) return _dTerm(_dQ(0));
  if (lijst.length === 1) return lijst[0];
  return _dTerm(_D1, [{ b: _dSomTeX(lijst), k: _D1, rang: S ? 1 : 2, som: true, S, vouw: true }]);
}

/* ── Uitschrijven ───────────────────────────────────────────────────────── */
const _dExponentTeX = t => t.replace(/\\dfrac/g, '\\frac');

/* Stukken aan elkaar zetten; vóór een getal komt een maalpunt (3 · 2^{x}). */
function _dPlak(coef, stukken) {
  let s = coef;
  for (const st of stukken) s += (s && /^[\d{]/.test(st)) ? ` \\cdot ${st}` : st;
  return s;
}

function _dMachtTeX(f, k, haakjes) {
  if (_dQgelijk(k, _D1)) return (f.som && haakjes) ? `(${f.b})` : f.b;
  if (f.exp) return `${f.exp.g}^{${_dExponentTeX(_dSomTeX(f.exp.U.map(m => _dSchaal(m, k))))}}`;
  return `${f.atoom ? f.b : `(${f.b})`}^{${_dQexpTeX(k)}}`;
}

/* k > 0. Met k = q + r/d is F^k = F^q · ᵈ√(F^r): x^{5/2} = x²√x. */
function _dWortelTeX(f, k, haakjes) {
  if (k.d === 1 || f.exp) return _dMachtTeX(f, k, haakjes);
  const q = Math.floor(k.n / k.d), r = k.n - q * k.d;
  const buiten = q === 0 ? '' : _dMachtTeX(f, _dQ(q), true);
  const binnen = r === 1 ? f.b : `${f.atoom ? f.b : `(${f.b})`}^{${r}}`;
  return buiten + (k.d === 2 ? `\\sqrt{${binnen}}` : `\\sqrt[${k.d}]{${binnen}}`);
}

/* Een wortel van x staat achter de haakjes: 3(5x − 3)√x, niet 3√x(5x − 3). */
const _dRang = f => (f.b === 'x' && f.k.d > 1 ? 1.5 : f.rang);

function _dTermTeX(m, stijl = 'terug') {
  const a = Math.abs(m.c.n), b = m.c.d, teken = m.c.n < 0 ? '-' : '';
  const fs = [...m.fs].sort((f, g) => _dRang(f) - _dRang(g));
  const coefVoor = stukken => (b !== 1 ? `\\dfrac{${a}}{${b}}` : (a === 1 && stukken.length ? '' : `${a}`));
  if (stijl === 'macht') {
    const meer = fs.length > 1 || a !== 1 || b !== 1 || !!teken;
    const stukken = fs.map(f => _dMachtTeX(f, f.k, meer));
    return teken + _dPlak(coefVoor(stukken), stukken);
  }
  const boven = fs.filter(f => f.k.n > 0);
  const onder = fs.filter(f => f.k.n < 0).map(f => ({ ...f, k: _dQmin(f.k) }));
  if (!onder.length) {
    const meer = boven.length > 1 || a !== 1 || b !== 1 || !!teken;
    const stukken = boven.map(f => _dWortelTeX(f, f.k, meer));
    return teken + _dPlak(coefVoor(stukken), stukken);
  }
  const N = boven.map(f => _dWortelTeX(f, f.k, boven.length > 1 || a !== 1));
  const D = onder.map(f => _dWortelTeX(f, f.k, onder.length > 1 || b !== 1));
  const teller = _dPlak(a === 1 && N.length ? '' : `${a}`, N);
  return `${teken}\\dfrac{${teller}}{${_dPlak(b === 1 ? '' : `${b}`, D)}}`;
}

/* Staat er op het hoogste niveau een + of −? Dan zijn haakjes nodig. */
function _dIsSom(t) {
  let diepte = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '{' || ch === '(') diepte++;
    else if (ch === '}' || ch === ')') diepte--;
    else if (diepte === 0 && i > 0 && (ch === '+' || ch === '-')) return true;
  }
  return false;
}
const _dHaak = (t, eerste = false) => ((_dIsSom(t) || (!eerste && t.startsWith('-'))) ? `(${t})` : t);

function _dSomTeX(termen, stijlen = 'terug') {
  let s = '';
  termen.forEach((m, i) => {
    if (m.c.n === 0) return;
    let t = _dTermTeX(m, Array.isArray(stijlen) ? stijlen[i] : stijlen);
    const neg = t.startsWith('-');
    if (neg) t = t.slice(1);
    if (_dIsSom(t) && (s || neg)) t = `(${t})`;
    s += !s ? (neg ? `-${t}` : t) : (neg ? ` - ${t}` : ` + ${t}`);
  });
  return s || '0';
}

/* Teksten optellen. Een minteken vooraan hoort alleen bij de eerste term,
   dus "-3x + 2" wordt " - 3x + 2" en krijgt geen haakjes. */
function _dPlusTeX(teksten) {
  return teksten.filter(t => t && t !== '0').reduce((s, t) =>
    !s ? t : t.startsWith('-') ? `${s} - ${t.slice(1)}` : `${s} + ${t}`, '') || '0';
}

function _dCoefTeX(c, rest) {
  if (_dQgelijk(c, _D1)) return rest;
  if (c.n === -1 && c.d === 1) return `-${rest}`;
  const a = Math.abs(c.n), teken = c.n < 0 ? '-' : '';
  const coef = c.d === 1 ? `${a}` : `\\dfrac{${a}}{${c.d}}`;
  return teken + coef + (/^[\d{]/.test(rest) ? ' \\cdot ' : '') + rest;
}

/* Netter opschrijven: een coëfficiënt gaat de haakjes van de afgeleide van de
   binnenfunctie in. 5 · (6x − 4) wordt 30x − 20, en ½ · (2x + 4) wordt x + 2.
   Lukt dat niet in hele getallen, dan alleen de gemeenschappelijke deler. */
function _dNetjes(m) {
  const i = m.fs.findIndex(f => f.vouw && f.S && _dQgelijk(f.k, _D1));
  const a = Math.abs(m.c.n);
  if (i < 0 || (a === 1 && m.c.d === 1)) return m;
  const f = m.fs[i];
  let S, c;
  const geschaald = f.S.map(t => _dSchaal(t, _dQ(a, m.c.d)));
  if (geschaald.every(t => t.c.d === 1)) {
    S = geschaald; c = _dQ(Math.sign(m.c.n));
  } else {
    if (!f.S.every(t => t.c.d === 1)) return m;
    const g = gcd(f.S.reduce((h, t) => gcd(h, Math.abs(t.c.n)), 0), m.c.d);
    if (g <= 1) return m;
    S = f.S.map(t => _dSchaal(t, _dQ(1, g))); c = _dQmaal(m.c, _dQ(g));
  }
  const fs = m.fs.slice();
  fs[i] = { ...f, b: _dSomTeX(S), S };
  return { c, fs };
}

/* Haalt een gemeenschappelijke e-macht buiten haakjes:
   2xe^{x} + x^{2}e^{x} = (x^{2} + 2x)e^{x}. Geeft null als dat niet kan. */
function _dBuitenHaakjes(termen) {
  if (termen.length < 2) return null;
  const kandidaat = termen[0].fs.find(f => f.exp && f.k.n > 0);
  if (!kandidaat) return null;
  const rest = [];
  for (const m of termen) {
    const f = m.fs.find(g => g.b === kandidaat.b);
    if (!f || !_dQgelijk(f.k, kandidaat.k)) return null;
    rest.push(_dTerm(m.c, m.fs.filter(g => g !== f)));
  }
  return _dMaal(_dAlsTerm(rest.flatMap(_dUitvouwen)), _dTerm(_D1, [kandidaat]));
}

/* c · (som van x-machten) · x^k uitschrijven als losse x-machten, zodat
   (x - 2) - 1 samen x - 3 wordt. Andere termen blijven zoals ze zijn. */
function _dUitvouwen(m) {
  const f = m.fs.find(g => g.S && _dQgelijk(g.k, _D1));
  const rest = _dTerm(m.c, m.fs.filter(g => g !== f));
  return (f && _dPuur(rest)) ? _dMaalSom(f.S, [rest]) : [m];
}

const _dEindTeX = termen => _dSomTeX(termen.map(_dNetjes));

/* Opeenvolgende gelijke regels weglaten. */
function _dUniek(regels) {
  const kaal = t => t.replace(/\s+/g, '');
  return regels.filter((r, i) => i === 0 || kaal(r) !== kaal(regels[i - 1]));
}
const _dLaatste = deel => deel.stappen[deel.stappen.length - 1];

/* "a · b" in een regel van de uitwerking; een factor 1 schrijven we niet op. */
const _dMaalTeX = (a, b) => (b === '1' ? a : a === '1' ? b : `${a} \\cdot ${b}`);

/* ── Delen ──────────────────────────────────────────────────────────────────
   { soort, tex, model, d, stappen, dom, herschrijf?, termen?, som? }
   - tex: zoals het in de opgave staat
   - model: het deel als één term (voor product en quotiënt)
   - d: de afgeleide als som van termen
   - stappen: de uitwerking van de afgeleide; de laatste is de eindvorm
   - dom: uitdrukkingen die positief moeten zijn (onder een wortel, in een ln)
   - nul: uitdrukkingen die niet 0 mogen zijn (een noemer)
   - herschrijf: f(x) eerst anders opgeschreven (als macht), of null
   - termen: alleen bij een som van x-machten                               */

/* Som van x-machten. spec: [{ c, p, vorm }], vorm 'terug' of 'macht'. */
function _dXSom(spec) {
  const termen = spec.map(t => _dXTerm(t.c, t.p));
  const tex = _dSomTeX(termen, spec.map(t => t.vorm || 'terug'));
  const macht = _dSomTeX(termen, 'macht');
  const d = _dCombineer(termen.filter(m => m.fs.length).map(m => {
    const p = _dXMacht(m);
    return _dXTerm(_dQmaal(m.c, p), _dQplus(p, _dQ(-1)));
  }));
  const som = termen.length > 1;
  const model = som ? _dTerm(_D1, [{ b: tex, k: _D1, rang: 1, som: true, S: termen }]) : termen[0];
  return { soort: 'xsom', tex, model, d, termen, som, dom: [], nul: [],
           stappen: _dUniek([_dSomTeX(d, 'macht'), _dSomTeX(d)]),
           herschrijf: macht !== tex ? macht : null };
}
const _dT = (c, p, vorm) => ({ c: typeof c === 'number' ? _dQ(c) : c, p: typeof p === 'number' ? _dQ(p) : p, vorm });
const _dXalleen = () => _dXSom([_dT(1, 1)]);

/* Kettingregel: buitenste afgeleide maal de afgeleide van de binnenfunctie.
   Is de binnenfunctie gewoon x, dan is er geen ketting. */
function _dKetting(deel, u, buitenTeX) {
  const eind = _dEindTeX(deel.d);
  if (u.tex === 'x') return { ...deel, stappen: [eind] };
  const regel = _dMaalTeX(buitenTeX, _dHaak(_dLaatste(u)));
  return { ...deel, stappen: _dUniek([regel, eind]) };
}

/* c · g^{u}, met g = 'e' of een getal. */
function _dExp(u, g = 'e', c = _D1) {
  const b = `${g}^{${_dExponentTeX(u.tex)}}`;
  const f = { b, k: _D1, rang: 3, exp: u.termen ? { g, U: u.termen } : null };
  let d = _dMaal(_dSchaal(_dAlsTerm(u.d), c), _dTerm(_D1, [f]));
  if (g !== 'e') d = _dMaal(d, _dTerm(_D1, [_dLnG(g)]));
  const tex = _dCoefTeX(c, b);
  const buiten = tex + (g === 'e' ? '' : ` \\cdot \\ln(${g})`);
  return _dKetting({ soort: 'exp', tex, model: _dTerm(c, [f]), d: [d], dom: u.dom, nul: u.nul }, u, buiten);
}

/* c · ln(u) (g = null) of c · ᵍlog(u). Grondtal 10 schrijven we als log. */
function _dLn(u, g = null, c = _D1) {
  const b = g === null ? `\\ln(${u.tex})`
          : g === 10   ? `\\log(${u.tex})`
          : `{}^{${g}}\\!\\log(${u.tex})`;
  let d = _dGedeeld(_dSchaal(_dAlsTerm(u.d), c), u.model);
  if (g !== null) d = _dGedeeld(d, _dTerm(_D1, [_dLnG(g)]));
  const noemer = g === null ? u.tex : `${_dHaak(u.tex, true)}\\ln(${g})`;
  const buiten = `${c.n < 0 ? '-' : ''}\\dfrac{${Math.abs(c.n)}}{${noemer}}`;
  return _dKetting({ soort: 'ln', tex: _dCoefTeX(c, b), model: _dTerm(c, [{ b, k: _D1, rang: 5 }]),
                     d: [d], dom: [...u.dom, u.tex], nul: u.nul }, u, buiten);
}

/* c · u^k (kettingregel met een macht als buitenste functie). */
function _dMacht(u, k, c = _D1) {
  const basis = (u.model.fs.length === 1 && _dQgelijk(u.model.c, _D1)) ? u.model.fs[0]
              : { b: u.tex, k: _D1, rang: 2, som: u.som };
  // Iets achter u' in een product: (18x − 3)(3x² − x − 3)².
  const F = { ...basis, rang: basis.rang + 0.2 };
  const model = _dTerm(c, [{ ...F, k: _dQmaal(F.k, k) }]);
  const buitenM = _dTerm(_dQmaal(c, k), [{ ...F, k: _dQmaal(F.k, _dQplus(k, _dQ(-1))) }]);
  const tex = _dTermTeX(model), macht = _dTermTeX(model, 'macht');
  const deel = { soort: 'macht', tex, model, d: [_dMaal(buitenM, _dAlsTerm(u.d))],
                 dom: k.d > 1 ? [...u.dom, u.tex] : u.dom,
                 nul: k.n < 0 ? [...u.nul, u.tex] : u.nul, herschrijf: macht !== tex ? macht : null };
  return _dKetting(deel, u, _dTermTeX(buitenM, 'macht'));
}

/* Som van delen. */
function _dSom(delen) {
  const tex = _dPlusTeX(delen.map(p => p.tex));
  const eerste = _dPlusTeX(delen.map(p => p.stappen[0]));
  const eind = _dPlusTeX(delen.map(_dLaatste));
  const herschrijf = delen.some(p => p.herschrijf) ? _dPlusTeX(delen.map(p => p.herschrijf || p.tex)) : null;
  return { soort: 'som', tex, som: true, d: delen.flatMap(p => p.d),
           model: _dTerm(_D1, [{ b: tex, k: _D1, rang: 2, som: true }]),
           dom: delen.flatMap(p => p.dom), nul: delen.flatMap(p => p.nul),
           stappen: _dUniek([eerste, eind]), herschrijf };
}

/* Haakjes om een factor in een product, en een maalpunt waar je het anders
   als één getal of één macht zou lezen: (3x − 3)(4x − 1), x · 2^{x}. */
function _dProductTeX(A, B) {
  const b = _dHaak(B.tex);
  return _dHaak(A.tex, true) + (/^(\d|\\dfrac|\{|\\log)/.test(b) ? ' \\cdot ' : '') + b;
}

/* Productregel: (A · B)' = A' · B + A · B'. Met `uitwerken` (twee sommen van
   x-machten) worden de haakjes in de eindvorm weggewerkt. */
function _dProduct(A, B, uitwerken = false) {
  const tex = _dProductTeX(A, B);
  const regel = `${_dMaalTeX(_dHaak(_dLaatste(A), true), _dHaak(B.tex))} + ${_dMaalTeX(_dHaak(A.tex), _dHaak(_dLaatste(B)))}`;
  const deel = { soort: 'product', tex, model: _dMaal(A.model, B.model),
                 dom: [...A.dom, ...B.dom], nul: [...A.nul, ...B.nul] };
  if (uitwerken) {
    const d = _dCombineer([..._dMaalSom(A.d, B.termen), ..._dMaalSom(A.termen, B.d)]);
    return { ...deel, d, stappen: _dUniek([regel, _dSomTeX(d)]) };
  }
  const d = [_dMaal(_dAlsTerm(A.d), B.model), _dMaal(A.model, _dAlsTerm(B.d))].filter(m => m.c.n !== 0);
  const buiten = _dBuitenHaakjes(d);
  const stappen = [regel, _dEindTeX(d)];
  if (buiten) stappen.push(_dTermTeX(_dNetjes(buiten)));
  return { ...deel, d: buiten ? [buiten] : d, stappen: _dUniek(stappen) };
}

/* Quotiëntregel: (T / N)' = (N · T' − T · N') / N², ezelsbruggetje NAT − TAN.
   De noemer blijft staan.
   `bekendeTeller` is de vereenvoudigde teller, als de aanroeper die al kent. */
function _dQuotient(T, N, uitwerken = false, bekendeTeller = null) {
  const tex = `\\dfrac{${T.tex}}{${N.tex}}`;
  const kwadraat = N.tex === 'x' ? 'x^{2}' : `(${N.tex})^{2}`;
  const regel = `\\dfrac{${_dMaalTeX(_dHaak(N.tex, true), _dHaak(_dLaatste(T)))} - ${_dMaalTeX(_dHaak(T.tex), _dHaak(_dLaatste(N)))}}{${kwadraat}}`;
  const N2 = _dMaal(N.model, N.model);
  const deel = { soort: 'quotient', tex, model: _dGedeeld(T.model, N.model),
                 dom: [...T.dom, ...N.dom], nul: [...T.nul, ...N.nul, N.tex] };
  if (bekendeTeller) {
    const eind = _dGedeeld(bekendeTeller, N2);
    return { ...deel, d: [eind], stappen: _dUniek([regel, _dTermTeX(_dNetjes(eind))]) };
  }
  if (uitwerken) {
    const teller = _dCombineer([..._dMaalSom(T.d, N.termen),
                                ..._dMaalSom(T.termen, N.d).map(m => _dSchaal(m, _dQ(-1)))]);
    const eind = teller.length ? _dGedeeld(_dAlsTerm(teller), N2) : _dTerm(_dQ(0));
    return { ...deel, d: [eind], stappen: _dUniek([regel, _dTermTeX(eind)]) };
  }
  const teller = [_dMaal(_dAlsTerm(T.d), N.model),
                  _dSchaal(_dMaal(T.model, _dAlsTerm(N.d)), _dQ(-1))].filter(m => m.c.n !== 0);
  const midden = `\\dfrac{${_dEindTeX(teller)}}{${_dTermTeX(N2)}}`;
  const buiten = _dBuitenHaakjes(teller);
  const eind = _dGedeeld(buiten || _dAlsTerm(teller), N2);
  return { ...deel, d: [eind], stappen: _dUniek([regel, midden, _dTermTeX(_dNetjes(eind))]) };
}

/* ── Opgave maken ───────────────────────────────────────────────────────────
   De testwaarden voor de antwoordcontrole liggen in het domein van f: alles
   onder een wortel en in een logaritme is daar positief. Geen x = 1, want
   daar is ln(x) = 0 en zou een ln in de noemer ontploffen. */
const _D_TESTX = [0.35, 0.6, 0.85, 1.3, 1.7, 2.2, 2.6, 3.1, 3.7, 4.3];
const _D_MIN_TESTPUNTEN = 4;
const _D_MAX_POGINGEN = 200;

/* Afstand tot een nulpunt van een noemer: dicht bij een pool zegt een
   vergelijking van waarden niets meer. */
const _D_MIN_NOEMER = 0.05;

function _dTestpunten(f, fd, dom, nul) {
  return _D_TESTX.filter(x => {
    if (!dom.every(t => _algEval(t, { x }) > 1e-3)) return false;
    if (!nul.every(t => Math.abs(_algEval(t, { x })) > _D_MIN_NOEMER)) return false;
    const y = _algEval(f, { x }), dy = _algEval(fd, { x });
    return isFinite(y) && isFinite(dy) && Math.abs(y) < 1e8 && Math.abs(dy) < 1e8;
  });
}

function _dVraag(id, maak) {
  for (let poging = 0; poging < _D_MAX_POGINGEN; poging++) {
    const { f, hints } = maak();
    const expr = _dLaatste(f);
    if (expr === '0') continue;
    const testX = _dTestpunten(f.tex, expr, f.dom, f.nul);
    if (testX.length < _D_MIN_TESTPUNTEN) continue;
    const regels = [];
    if (f.herschrijf) regels.push(`$f(x) = ${f.herschrijf}$`);
    f.stappen.forEach((s, i) => regels.push(i === 0 ? `$f'(x) = ${s}$` : `$= ${s}$`));
    return {
      id: uid(), leerdoel: id,
      // De formule staat op een eigen regel en breekt niet af (zie .vraag-formule).
      vraag: `Bereken de afgeleide van<span class="vraag-formule">$f(x) = ${f.tex}$</span>`,
      antwoordType: 'algebra',
      antwoord: { expr, vars: ['x'], vorm: 'afgeleide', functie: f.tex, testX },
      data: {}, hints, oplossing: regels.join('\n'),
    };
  }
  throw new Error(`Geen bruikbare opgave voor ${id}`);
}

/* ── Hints (aanpak en notatie, nooit de uitkomst) ───────────────────────── */
const _DH = {
  macht:    'De afgeleide van $ax^{n}$ is $n \\cdot ax^{n-1}$. Dat geldt ook als $n$ negatief of een breuk is.',
  som:      'Differentieer elke term apart (somregel). Een constante term valt weg.',
  neg:      'Schrijf een breuk eerst als macht van $x$: $\\dfrac{a}{x^{n}} = ax^{-n}$.',
  wortel:   'Schrijf een wortel eerst als macht van $x$: $\\sqrt[n]{x^{m}} = x^{\\frac{m}{n}}$.',
  product:  'Productregel: bij $f(x) = u \\cdot v$ is $f\'(x) = u\' \\cdot v + u \\cdot v\'$.',
  quotient: 'Quotiëntregel: bij $f(x) = \\dfrac{T}{N}$ is $f\'(x) = \\dfrac{N \\cdot T\' - T \\cdot N\'}{N^{2}}$ (NAT min TAN).',
  ketting:  'Kettingregel: differentieer de buitenste functie, laat de binnenfunctie $u$ staan, en vermenigvuldig met $u\'$.',
  kettingMacht: 'Kettingregel: bij $f(x) = u^{n}$ is $f\'(x) = n \\cdot u^{n-1} \\cdot u\'$. Schrijf een wortel of breuk eerst als macht: $\\sqrt{u} = u^{\\frac{1}{2}}$, $\\dfrac{1}{u^{n}} = u^{-n}$.',
  e:   'De afgeleide van $e^{x}$ is $e^{x}$.',
  g:   'De afgeleide van $g^{x}$ is $g^{x} \\cdot \\ln(g)$.',
  ln:  'De afgeleide van $\\ln(x)$ is $\\dfrac{1}{x}$.',
  log: 'De afgeleide van ${}^{g}\\!\\log(x)$ is $\\dfrac{1}{x \\ln(g)}$.',
};

/* ── D.M1 – machtsfuncties ──────────────────────────────────────────────── */
const _dVorm = () => (Math.random() < 0.55 ? 'terug' : 'macht');
const _D_MAX_TERMEN = 3;

function _dTermGeheel(p) {
  if (p >= 2 && Math.random() < 0.2) return _dT(_dQ(pick([1, 2, 3, 4, 5]) * pick([1, -1]), p), p);
  return _dT(_randNietNul(p === 0 ? -12 : -9, p === 0 ? 12 : 9), p);
}
function _dTermNeg(vorm) {
  const c = Math.random() < 0.3 ? _dQ(pick([1, 1, 2, 3, 5]) * pick([1, -1]), pick([2, 3, 4]))
                                : _dQ(_randNietNul(-9, 9));
  return _dT(c, -rand(1, 4), vorm);
}
function _dTermBreuk(vorm) {
  const d = pick([2, 2, 2, 3, 3, 4]);
  const n = pick({ 2: [1, 1, 3, -1, -1, -3, 5], 3: [1, 2, -1, -2, 4, 5], 4: [1, 3, -1, -3, 5] }[d]);
  // De helft van de keren een veelvoud van d, zodat c · n/d een geheel getal wordt.
  const c = Math.random() < 0.5 ? d * _randNietNul(-3, 3) : _randNietNul(-8, 8);
  return _dT(c, _dQ(n, d), vorm);
}
const _dHeeftVerschillendeMachten = spec => new Set(spec.map(t => _dQwaarde(t.p))).size === spec.length;
const _dSorteer = spec => [...spec].sort((s, t) => _dQwaarde(t.p) - _dQwaarde(s.p));

function _dMaakM1(soort) {
  for (;;) {
    let spec = [];
    if (soort === 'a') {
      const machten = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, rand(2, 4));
      if (Math.max(...machten) < 2) continue;
      spec = machten.map(_dTermGeheel);
    } else if (soort === 'b') {
      spec = [_dTermNeg(_dVorm())];
      if (Math.random() < 0.35) spec.push(_dTermNeg(_dVorm()));
      shuffle([0, 1, 2, 3, 4]).slice(0, rand(1, 2)).forEach(p => spec.push(_dTermGeheel(p)));
    } else if (soort === 'c') {
      spec = [_dTermBreuk(_dVorm())];
      if (Math.random() < 0.4) spec.push(_dTermBreuk(_dVorm()));
      shuffle([0, 1, 2, 3]).slice(0, rand(spec.length > 1 ? 0 : 1, 2)).forEach(p => spec.push(_dTermGeheel(p)));
    } else {
      spec = [_dTermNeg(_dVorm()), _dTermBreuk(_dVorm())];
      shuffle([0, 1, 2, 3, 4]).slice(0, rand(1, 2)).forEach(p => spec.push(_dTermGeheel(p)));
    }
    if (spec.length < 2 || !_dHeeftVerschillendeMachten(spec)) continue;
    // Met breuken en wortels passen vier termen niet meer op één regel van een telefoon.
    if (soort !== 'a' && spec.length > _D_MAX_TERMEN) continue;
    const hints = [];
    if (spec.some(t => t.p.n < 0 && t.vorm === 'terug')) hints.push(_DH.neg);
    if (spec.some(t => t.p.d > 1 && t.vorm === 'terug')) hints.push(_DH.wortel);
    hints.push(_DH.macht, _DH.som);
    return { f: _dXSom(_dSorteer(spec)), hints };
  }
}

function genDM1a() { return _dVraag('D.M1a', () => _dMaakM1('a')); }
function genDM1b() { return _dVraag('D.M1b', () => _dMaakM1('b')); }
function genDM1c() { return _dVraag('D.M1c', () => _dMaakM1('c')); }
function genDM1d() {
  return _dVraag('D.M1d', () => _dMaakM1(Math.random() < 0.5 ? 'mix' : pick(['a', 'b', 'c'])));
}

/* ── D.R1 – product-, quotiënt- en kettingregel ─────────────────────────── */

/* Een som van x-machten met hele exponenten; de hoogste macht meestal positief. */
function _dVeelterm(machten, max = 6) {
  const spec = _dSorteer(machten.map(p => _dT(_randNietNul(-max, max), p)));
  if (Math.random() < 0.8) spec[0].c = _dQ(Math.abs(spec[0].c.n));
  return _dXSom(spec);
}
function _dTweeMachten(min, max) {
  const hoog = rand(Math.max(1, min + 1), max);
  return [hoog, rand(min, hoog - 1)];
}

/* Binnenfuncties voor de kettingregel: alle soorten machtsfuncties. */
function _dBinnen(soorten) {
  const b = () => _randNietNul(-9, 9);
  const a = () => (Math.random() < 0.75 ? rand(1, 5) : -rand(1, 5));
  switch (pick(soorten)) {
    case 'lin':    return _dXSom([_dT(a(), 1), _dT(b(), 0)]);
    case 'mon':    return _dXSom([_dT(pick([2, 3, 4, 5, -1, -2]), 1)]);
    case 'kwad':   return Math.random() < 0.5 ? _dXSom([_dT(a(), 2), _dT(b(), 0)])
                                              : _dXSom([_dT(a(), 2), _dT(_randNietNul(-6, 6), 1), _dT(b(), 0)]);
    case 'macht':  return _dXSom([_dT(1, rand(3, 4)), _dT(b(), 0)]);
    case 'wortel': return _dXSom([_dT(rand(1, 4), _dQ(1, 2)), _dT(rand(1, 6), 0)]);
    default:       return Math.random() < 0.5 ? _dXSom([_dT(1, 1), _dT(rand(1, 4), -1)])
                                              : _dXSom([_dT(rand(1, 5), -1), _dT(rand(1, 6), 0)]);
  }
}

function _dMaakR1a() {
  const A = Math.random() < 0.25 ? _dVeelterm([rand(1, 3)]) : _dVeelterm(_dTweeMachten(0, 2));
  const B = _dVeelterm(_dTweeMachten(0, 3));
  return { f: _dProduct(A, B, true),
           hints: [_DH.product, 'Je mag ook eerst de haakjes wegwerken en daarna term voor term differentiëren.'] };
}

function _dMaakR1b() {
  const A = _dVeelterm(_dTweeMachten(0, 2));
  const p = pick([_dQ(1, 2), _dQ(1, 2), _dQ(1, 3), _dQ(2, 3), _dQ(3, 2), _dQ(-1), _dQ(-1), _dQ(-2), _dQ(-1, 2)]);
  const B = _dXSom([_dT(Math.random() < 0.6 ? 1 : rand(2, 4), p, 'terug')]);
  return { f: _dProduct(A, B),
           hints: [_DH.product, 'Schrijf de wortel of breuk als macht van $x$ om $v\'$ te vinden: $\\sqrt{x} = x^{\\frac{1}{2}}$, $\\dfrac{1}{x^{n}} = x^{-n}$.'] };
}

function _dMaakR1c() {
  const r = Math.random();
  const T = r < 0.2 ? _dVeelterm([0]) : r < 0.5 ? _dVeelterm([rand(1, 2)]) : _dVeelterm(_dTweeMachten(0, 2));
  const N = _dVeelterm(pick([[1, 0], [1, 0], [2, 0], [2, 1]]));
  return { f: _dQuotient(T, N, true), hints: [_DH.quotient, 'De noemer hoef je niet uit te werken: laat $N^{2}$ als kwadraat staan.'] };
}

function _dMaakR1d() {
  const u = _dBinnen(['lin', 'lin', 'kwad', 'kwad', 'macht', 'wortel', 'breuk']);
  const k = pick([_dQ(2), _dQ(3), _dQ(4), _dQ(5), _dQ(6), _dQ(3), _dQ(-1), _dQ(-2), _dQ(-3),
                  _dQ(1, 2), _dQ(1, 2), _dQ(1, 3), _dQ(2, 3), _dQ(3, 2), _dQ(-1, 2)]);
  const c = Math.random() < 0.65 ? _D1 : _dQ(_randNietNul(-4, 4));
  // u^{3/2} staat er als u·√u: met drie termen in u past dat niet op één regel.
  if (u.termen.length > 2 && Math.abs(_dQwaarde(k)) > 1 && k.d > 1) return _dMaakR1d();
  return { f: _dMacht(u, k, c), hints: [_DH.kettingMacht] };
}

function genDR1a() { return _dVraag('D.R1a', _dMaakR1a); }
function genDR1b() { return _dVraag('D.R1b', _dMaakR1b); }
function genDR1c() { return _dVraag('D.R1c', _dMaakR1c); }
function genDR1d() { return _dVraag('D.R1d', _dMaakR1d); }
function genDR1e() { return _dVraag('D.R1e', () => pick([_dMaakR1a, _dMaakR1b, _dMaakR1c, _dMaakR1d])()); }

/* ── D.E1 – e^x, g^x, ln en log met alle regels ─────────────────────────── */

/* Het basisdeel van een soort: e^{u}, g^{u}, ln(u) of ᵍlog(u). */
function _dBasis(soort, u, c = _D1) {
  if (soort === 'e')  return _dExp(u, 'e', c);
  // 10^{u} loopt bij een binnenfunctie al snel uit de hand: dan kleinere grondtallen.
  if (soort === 'g')  return _dExp(u, pick(u.tex === 'x' ? [2, 3, 4, 5, 10] : [2, 3, 5]), c);
  if (soort === 'ln') return _dLn(u, null, c);
  return _dLn(u, pick([2, 3, 5, 10]), c);
}
const _dCoef = () => (Math.random() < 0.6 ? _D1 : _dQ(_randNietNul(-5, 5)));
const _dConstante = () => _dXSom([_dT(rand(1, 6), 0)]);
const _dMachtTerm = () => pick([
  () => _dXSom([_dT(1, rand(1, 3))]),
  () => _dXSom([_dT(rand(2, 5), rand(1, 3))]),
  () => _dVeelterm([1, 0], 5),
  () => _dXSom([_dT(1, _dQ(1, 2), 'terug')]),
])();

function _dMaakE1(soort) {
  const regel = pick(['som', 'ketting', 'ketting', 'product', 'product', 'quotient', 'buiten']);
  const basisHint = _DH[soort];
  if (regel === 'som') {
    const B = _dBasis(soort, _dXalleen(), _dCoef());
    // Kort houden, zodat de hele functie op één regel past.
    const rest = pick([
      () => _dVeelterm(_dTweeMachten(0, 3)),
      () => _dXSom([_dTermNeg(_dVorm())]),
      () => _dXSom([_dTermBreuk(_dVorm())]),
    ])();
    const delen = Math.random() < 0.5 ? [B, rest] : [rest, B];
    return { f: _dSom(delen), hints: [basisHint, _DH.som] };
  }
  if (regel === 'ketting') {
    const u = _dBinnen(['lin', 'lin', 'mon', 'mon', 'kwad', 'macht', 'wortel', 'breuk']);
    return { f: _dBasis(soort, u, _dCoef()), hints: [basisHint, _DH.ketting] };
  }
  if (regel === 'product') {
    const u = Math.random() < 0.6 ? _dXalleen() : _dBinnen(['lin', 'mon']);
    return { f: _dProduct(_dMachtTerm(), _dBasis(soort, u)), hints: [basisHint, _DH.product] };
  }
  if (regel === 'quotient') {
    const B = _dBasis(soort, _dXalleen());
    const keuze = rand(1, 3);
    const A = pick([() => _dXalleen(), () => _dXSom([_dT(1, 2)]), () => _dVeelterm([1, 0], 5)])();
    if (keuze === 3) {
      // B / (B + c): de teller B'(B + c) − B · B' is gewoon c · B'.
      const c = _dConstante();
      const teller = _dSchaal(_dAlsTerm(B.d), c.termen[0].c);
      return { f: _dQuotient(B, _dSom([B, c]), false, teller), hints: [basisHint, _DH.quotient] };
    }
    return { f: keuze === 1 ? _dQuotient(B, A) : _dQuotient(A, B), hints: [basisHint, _DH.quotient] };
  }
  // Een macht met e^{x}, g^{x}, ln(x) of log(x) als binnenfunctie.
  const B = _dBasis(soort, _dXalleen());
  const u = (soort === 'ln' || soort === 'log') && Math.random() < 0.6 ? B : _dSom([B, _dConstante()]);
  const k = pick([_dQ(2), _dQ(3), _dQ(-1), _dQ(1, 2)]);
  return { f: _dMacht(u, k), hints: [basisHint, _DH.kettingMacht] };
}

/* Twee soorten in één functie: e^{x} · ln(x), ln(e^{x} + 3), … */
function _dMaakE1Mix() {
  const groei = () => _dBasis(pick(['e', 'g']), _dXalleen());
  const log = () => _dBasis(pick(['ln', 'log']), _dXalleen());
  const keuze = rand(1, 3);
  if (keuze === 1) return { f: _dProduct(groei(), log()), hints: [_DH.product] };
  if (keuze === 2) return { f: _dQuotient(log(), groei()), hints: [_DH.quotient] };
  return { f: _dLn(_dSom([groei(), _dConstante()]), pick([null, null, 2, 10])), hints: [_DH.ln, _DH.ketting] };
}

/* ── D.H1 – havo-route ──────────────────────────────────────────────────────
   Zonder product- en quotiëntregel: een product werk je eerst uit, een breuk
   of wortel is één term, en de kettingregel heeft alleen een lineaire
   binnenfunctie ax + b.                                                     */
const _DH_HAAKJES = 'Werk eerst de haakjes weg. Let op: $(a+b)^{2} = (a+b)(a+b)$, dus niet $a^{2}+b^{2}$.';
const _DH_KETTING_LIN = 'Kettingregel: bij $f(x) = (ax+b)^{n}$ is $f\'(x) = n(ax+b)^{n-1} \\cdot a$. '
  + 'Schrijf een wortel of breuk eerst als macht: $\\sqrt{u} = u^{\\frac{1}{2}}$, $\\dfrac{1}{u^{n}} = u^{-n}$.';

/* Een product van veeltermen, opgelost door eerst de haakjes weg te werken.
   De uitgewerkte vorm komt in de uitwerking als f(x) = …, de afgeleide
   daarna term voor term. */
function _dMaakH1b() {
  const r = Math.random();
  let A, B, tex = null;
  if (r < 0.25) {
    A = B = _dVeelterm([1, 0], 5);
    tex = `(${A.tex})^{2}`;
  } else if (r < 0.5) {
    A = _dVeelterm([rand(1, 2)]); B = _dVeelterm(_dTweeMachten(0, 2));
  } else {
    A = _dVeelterm(_dTweeMachten(0, 2)); B = _dVeelterm(_dTweeMachten(0, 2));
  }
  const uit = _dXSom(_dCombineer(_dMaalSom(A.termen, B.termen)).map(m => ({ c: m.c, p: _dXMacht(m) })));
  return { f: { ...uit, tex: tex || _dProductTeX(A, B), herschrijf: uit.tex }, hints: [_DH_HAAKJES, _DH.macht] };
}

/* Eén breuk a / (b·xⁿ), dus één term met een negatieve exponent. */
function _dMaakH1c() {
  const c = Math.random() < 0.4 ? _dQ(pick([1, 2, 3, 5]) * pick([1, 1, -1]), pick([2, 3, 4]))
                                : _dQ(_randNietNul(-9, 9));
  return { f: _dXSom([_dT(c, -rand(1, 4), 'terug')]), hints: [_DH.neg, _DH.macht] };
}

/* Eén wortelterm, dus één term met een gebroken exponent. */
function _dMaakH1d() {
  return { f: _dXSom([_dTermBreuk('terug')]), hints: [_DH.wortel, _DH.macht] };
}

/* Kettingregel met binnenfunctie ax + b. */
function _dMaakH1e() {
  const k = pick([_dQ(2), _dQ(3), _dQ(4), _dQ(5), _dQ(6), _dQ(-1), _dQ(-2), _dQ(-3),
                  _dQ(1, 2), _dQ(1, 2), _dQ(-1, 2)]);
  const c = Math.random() < 0.65 ? _D1 : _dQ(_randNietNul(-4, 4));
  return { f: _dMacht(_dBinnen(['lin']), k, c), hints: [_DH_KETTING_LIN] };
}

/* Afgewisseld: één soort uit a tot en met e, of een som van twee soorten.
   De delen van een som hebben altijd verschillende machten van x (hele,
   negatieve en gebroken), dus er valt niets samen te nemen. */
function _dMaakH1f() {
  if (Math.random() < 0.5) {
    return pick([() => _dMaakM1('a'), _dMaakH1b, _dMaakH1c, _dMaakH1d, _dMaakH1e])();
  }
  const soorten = {
    veelterm: () => ({ f: _dVeelterm(_dTweeMachten(0, 3)), hints: [_DH.macht] }),
    breuk: _dMaakH1c, wortel: _dMaakH1d, ketting: _dMaakH1e,
  };
  const [s1, s2] = shuffle(Object.keys(soorten)).slice(0, 2);
  const a = soorten[s1](), b = soorten[s2]();
  return { f: _dSom([a.f, b.f]), hints: [_DH.som, ...new Set([...a.hints, ...b.hints])] };
}

function genDH1a() { return _dVraag('D.H1a', () => _dMaakM1('a')); }
function genDH1b() { return _dVraag('D.H1b', _dMaakH1b); }
function genDH1c() { return _dVraag('D.H1c', _dMaakH1c); }
function genDH1d() { return _dVraag('D.H1d', _dMaakH1d); }
function genDH1e() { return _dVraag('D.H1e', _dMaakH1e); }
function genDH1f() { return _dVraag('D.H1f', _dMaakH1f); }

function genDE1a() { return _dVraag('D.E1a', () => _dMaakE1('e')); }
function genDE1b() { return _dVraag('D.E1b', () => _dMaakE1('g')); }
function genDE1c() { return _dVraag('D.E1c', () => _dMaakE1('ln')); }
function genDE1d() { return _dVraag('D.E1d', () => _dMaakE1('log')); }
function genDE1e() {
  return _dVraag('D.E1e', () => (Math.random() < 0.3 ? _dMaakE1Mix() : _dMaakE1(pick(['e', 'g', 'ln', 'log']))));
}
