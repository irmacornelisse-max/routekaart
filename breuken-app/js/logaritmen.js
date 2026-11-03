/* ── Exponentiële en logaritmische vergelijkingen ─────────────────────────────
   EV.1  exponentiële vergelijkingen: g^A = g^B, met +, −, ×, :, met de
         machtsregels, en met een logaritme
   EV.2  exponentiële vergelijkingen exact: gemengd en met substitutie
   LOG.1 logaritmen uitrekenen en herleiden tot één logaritme
   LOG.2 logaritmische vergelijkingen: basis, lineair, kwadratisch,
         schijnoplossing
   LOG.3 logaritmen herleiden: getallen, los getal of ander grondtal, letters,
         en schrijven als a + ᵍlog(b)
   LOG.4 exponentiële en logaritmische formules omschrijven

   Elke generator kiest eerst de oplossing (of de waarden van u) en bouwt de
   opgave daaruit op. Opgave, antwoord en uitwerking komen zo uit hetzelfde
   model en kunnen niet uiteenlopen.

   Logaritmen staan in de Nederlandse notatie: ${}^{2}\!\log(x)$. Voor de
   antwoordcontrole schrijven we \log_{2}(x); _algEval leest allebei.
   Dit bestand staat in index.html vóór questions.js. */

/* ── Rationale getallen als [teller, noemer] ────────────────────────────── */
function _Q(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1;
  return [n / g, d / g];
}
const _Qadd = (a, b) => _Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const _Qsub = (a, b) => _Qadd(a, [-b[0], b[1]]);
const _Qmul = (a, b) => _Q(a[0] * b[0], a[1] * b[1]);
const _Qdiv = (a, b) => _Q(a[0] * b[1], a[1] * b[0]);
const _Qval = a => a[0] / a[1];
const _Qis  = (a, n) => a[1] === 1 && a[0] === n;

function _Qtex(a) {
  if (a[1] === 1) return `${a[0]}`;
  return `${a[0] < 0 ? '-' : ''}\\frac{${Math.abs(a[0])}}{${a[1]}}`;
}

/* ── Opmaak ─────────────────────────────────────────────────────────────── */

/* ${}^{g}\!\log(arg)$ voor de leerling, \log_{g}(arg) voor de nakijkfunctie. */
const _lgLog  = (g, arg) => `{}^{${g}}\\!\\log(${arg})`;
const _lgLogA = (g, arg) => `\\log_{${g}}(${arg})`;

/* px + q met rationale coëfficiënten, zonder 1x, +- of een losse 0.
   Met p < 0 < q komt het getal vooraan: 6 - x in plaats van -x + 6. */
function _lgLinQ(p, q) {
  if (p[0] < 0 && q[0] > 0) return `${_Qtex(q)} - ${_lgLinQ([-p[0], p[1]], _Q(0))}`;
  let s = '';
  if (!_Qis(p, 0)) {
    if (_Qis(p, 1)) s = 'x';
    else if (_Qis(p, -1)) s = '-x';
    else s = `${_Qtex(p)}x`;
  }
  if (!_Qis(q, 0)) {
    if (!s) s = _Qtex(q);
    else s += q[0] > 0 ? ` + ${_Qtex(q)}` : ` - ${_Qtex([-q[0], q[1]])}`;
  }
  return s || '0';
}
const _lgLin = (p, q) => _lgLinQ(_Q(p), _Q(q));

/* Een term met coëfficiënt achter iets anders: + 3 \cdot 2^{x}, - 2^{x}. */
function _lgTerm(c, tex, eerste = false) {
  if (c === 0) return '';
  const teken = c < 0 ? (eerste ? '-' : ' - ') : (eerste ? '' : ' + ');
  const abs = Math.abs(c);
  if (!tex) return `${teken}${abs}`;
  return `${teken}${abs === 1 ? '' : `${abs} \\cdot `}${tex}`;
}

/* Kwadratische vorm x^2 + bx + c (in variabele v). */
function _lgKwadr(b, c, v = 'x') {
  const midden = b === 0 ? '' : `${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}${v}`;
  return `${v}^{2}${midden}${_lgTerm(c, '')}`;
}

/* De factor (x - r) uit een ontbinding. */
function _lgFactor(r, v = 'x') {
  if (r === 0) return v;
  return r > 0 ? `(${v} - ${r})` : `(${v} + ${-r})`;
}

/* Een macht met basis b: haakjes om een breuk heen. */
function _lgMacht(basis, exp) {
  const b = /\\frac|\\sqrt/.test(basis) ? `\\left(${basis}\\right)` : basis;
  return `${b}^{${exp}}`;
}

/* Het getal g^k als LaTeX, met k rationaal (noemer 1, 2 of 3):
   2^3 = 8, 2^-3 = 1/8, 2^(5/2) = 4√2, 3^(-1/2) = 1/√3, 2^(2/3) = ∛4. */
function _lgGetal(g, k) {
  if (k[0] < 0) return `\\frac{1}{${_lgGetal(g, [-k[0], k[1]])}}`;
  const heel = Math.floor(k[0] / k[1]);
  const rest = k[0] - heel * k[1];
  const voor = heel > 0 ? `${Math.pow(g, heel)}` : '';
  if (!rest) return voor || '1';
  const inhoud = Math.pow(g, rest);
  const wortel = k[1] === 2 ? `\\sqrt{${inhoud}}` : `\\sqrt[${k[1]}]{${inhoud}}`;
  return voor + wortel;
}

/* Is n een gehele macht van g? Geeft de exponent, of null. */
function _lgExponent(g, n) {
  if (n <= 0) return null;
  let k = 0, m = 1;
  while (m < n) { m *= g; k++; }
  return m === n ? k : null;
}

/* De waarde van ᵍlog(n); bij een gehele macht exact. */
function _lgWaarde(g, n) {
  const k = _lgExponent(g, n);
  return k !== null ? k : Math.log(n) / Math.log(g);
}

/* ── Een lineaire vergelijking oplossen ─────────────────────────────────────
   p1·x + q1 = p2·x + q2 (rationaal). Geeft de regels ná de beginregel en de
   oplossing. Elke stap staat op een eigen regel. */
function _lgLosLineair(p1, q1, p2, q2) {
  const a = _Qsub(p1, p2), b = _Qsub(q2, q1);
  const x = _Qdiv(b, a);
  const stappen = [];
  const alVerzameld = _Qis(p2, 0) && _Qis(q1, 0);
  if (!alVerzameld) stappen.push(`${_lgLinQ(a, _Q(0))} = ${_Qtex(b)}`);
  if (!_Qis(a, 1)) stappen.push(`x = ${_Qtex(x)}`);
  return { stappen, x };
}

/* px + q = L, met L een logaritme als tekst (p = -1 of p ≥ 1, geheel). */
function _lgLosMetLog(p, q, L) {
  const stappen = [];
  if (p === 1 && q === 0) return stappen;
  const rechts = q === 0 ? L : `${L} ${q > 0 ? '-' : '+'} ${Math.abs(q)}`;
  if (q !== 0) stappen.push(`${_lgLin(p, 0)} = ${rechts}`);
  if (p === -1) stappen.push(`x = ${q === 0 ? `-${L}` : `${q} - ${L}`}`);
  else if (p !== 1) stappen.push(`x = \\frac{${rechts}}{${p}}`);
  return stappen;
}

/* Van g^{px + q} = N naar x. Is N een macht van g, dan via g^A = g^B; anders
   met een logaritme. Geeft de regels ná "g^{..} = N" en de waarde van x. */
function _lgMachtIsGetal(g, p, q, N) {
  const E = _lgLin(p, q);
  const k = _lgExponent(g, N);
  if (k !== null) {
    const { stappen, x } = _lgLosLineair(_Q(p), _Q(q), _Q(0), _Q(k));
    return { stappen: [`${g}^{${E}} = ${g}^{${k}}`, `${E} = ${k}`, ...stappen], x: _Qval(x) };
  }
  const L = _lgLog(g, N);
  return {
    stappen: [`${E} = ${L}`, ..._lgLosMetLog(p, q, L)],
    x: (Math.log(N) / Math.log(g) - q) / p,
  };
}

/* Elke vraag krijgt een id en het logaritmetoetsenbord. */
function _lgVraag(leerdoel, vraag, sols, hints, regels, extra = {}) {
  return {
    id: uid(), leerdoel,
    vraag,
    antwoordType: 'vergelijking-mv',
    antwoord: { sols, ...extra },
    logToetsen: true,
    hints,
    oplossing: regels.map(r => (r.startsWith('$') || /^[A-Z]/.test(r) ? r : `$${r}$`)).join('\n'),
  };
}

/* De grootste exponent waarbij g^k nog een handzaam getal is. */
const _LG_KMAX = { 2: 6, 3: 4, 5: 3, 6: 2, 7: 2 };

/* Machten van g die als grondtal voorkomen: 4 = 2², 1/2 = 2^-1, ... */
const _LG_BASISEXP = { 2: [1, 2, 3, 4, -1, -2], 3: [1, 2, 3, -1, -2], 5: [1, 2, -1] };
const _lgBasisTex = (g, e) => (e > 0 ? `${Math.pow(g, e)}` : `\\frac{1}{${Math.pow(g, -e)}}`);

/* ── EV.1a – g^A = g^B ──────────────────────────────────────────────────── */
function genLogEV1a() {
  const g = pick([2, 3, 5, 6, 7]);
  for (;;) {
    const p1 = rand(1, 5), p2 = rand(0, 5);
    const q1 = rand(-8, 8), q2 = rand(-8, 8);
    if (p1 === p2 || (q1 === 0 && q2 === 0)) continue;
    if (p2 === 0 && (q2 === 0 || q2 === 1)) continue;     // geen g^{0} of g^{1} in de opgave
    const x = _Q(q2 - q1, p1 - p2);
    if (x[1] > 3) continue;

    // Soms staat de eenvoudigste macht links; de uitwerking volgt dezelfde kanten.
    const [L, R] = Math.random() < 0.3 ? [[p2, q2], [p1, q1]] : [[p1, q1], [p2, q2]];
    const opg = `${g}^{${_lgLin(...L)}} = ${g}^{${_lgLin(...R)}}`;
    const begin = `${_lgLin(...L)} = ${_lgLin(...R)}`;
    const { stappen } = _lgLosLineair(_Q(L[0]), _Q(L[1]), _Q(R[0]), _Q(R[1]));
    return _lgVraag('EV.1a', `Los op: $${opg}$`, [_Qval(x)],
      ['Links en rechts staat een macht met hetzelfde grondtal. Als $g^{A} = g^{B}$, dan is $A = B$.',
       'Stel de exponenten aan elkaar gelijk en los de lineaire vergelijking op.'],
      [opg, begin, ...stappen]);
  }
}

/* ── EV.1b – met +, −, × en : ───────────────────────────────────────────────
   De macht staat in een som, product of quotiënt. Eerst de macht vrijmaken,
   dan het getal schrijven als macht van g. */

/* Bouwt een vergelijking rond de macht M = g^E met waarde N. Geeft de opgave
   en de regels tot en met "M = N". */
function _lgRondMacht(M, N, vormen) {
  const vorm = pick(vormen);
  if (vorm === 'plus') {
    const b = pick([-1, 1]) * rand(1, 12);
    const opg = `${M}${_lgTerm(b, '')} = ${N + b}`;
    return { opg, regels: [opg, `${M} = ${N}`] };
  }
  if (vorm === 'maal' || vorm === 'maalplus') {
    const a = rand(2, 6);
    const b = vorm === 'maalplus' ? pick([-1, 1]) * rand(1, 15) : 0;
    const opg = `${a} \\cdot ${M}${_lgTerm(b, '')} = ${a * N + b}`;
    const regels = [opg];
    if (b) regels.push(`${a} \\cdot ${M} = ${a * N}`);
    regels.push(`${M} = ${N}`);
    return { opg, regels };
  }
  // deel: de noemer is een deler van N, zodat rechts een geheel getal staat
  const delers = [];
  for (let d = 2; d <= Math.min(N, 12); d++) if (N % d === 0) delers.push(d);
  if (!delers.length) return _lgRondMacht(M, N, vormen.filter(v => v !== 'deel'));
  const d = pick(delers);
  const b = Math.random() < 0.5 ? pick([-1, 1]) * rand(1, 9) : 0;
  const opg = `\\frac{${M}}{${d}}${_lgTerm(b, '')} = ${N / d + b}`;
  const regels = [opg];
  if (b) regels.push(`\\frac{${M}}{${d}} = ${N / d}`);
  regels.push(`${M} = ${N}`);
  return { opg, regels };
}

/* Exponent px + q kiezen bij een gewenste waarde k van de exponent. */
function _lgExponentBij(k) {
  for (;;) {
    const p = pick([1, 1, 1, 2, 3]);
    const x = rand(-3, 5);
    const q = k - p * x;
    if (Math.abs(q) <= 6) return { p, q };
  }
}

function genLogEV1b() {
  const g = pick([2, 3, 5]);
  const k = Math.random() < 0.1 ? 0 : rand(1, _LG_KMAX[g]);
  const N = Math.pow(g, k);
  const { p, q } = _lgExponentBij(k);
  const M = `${g}^{${_lgLin(p, q)}}`;
  const { opg, regels } = _lgRondMacht(M, N, ['plus', 'maal', 'maalplus', 'deel']);
  const { stappen, x } = _lgMachtIsGetal(g, p, q, N);
  return _lgVraag('EV.1b', `Los op: $${opg}$`, [x],
    ['Maak eerst de macht vrij: werk het optellen of aftrekken weg, daarna het vermenigvuldigen of delen.',
     'Schrijf het getal aan de andere kant als macht van hetzelfde grondtal. Stel dan de exponenten gelijk.'],
    [...regels, ...stappen]);
}

/* ── EV.1c – met de machtsregels naar g^A = g^B ─────────────────────────── */
function genLogEV1c() {
  const g = pick([2, 3, 5]);
  const soort = pick(['twee', 'twee', 'getal', 'product']);
  const fam = _LG_BASISEXP[g];

  for (;;) {
    if (soort === 'twee') {
      // b1^{E1} = b2^{E2}, met b1 = g^e1 en b2 = g^e2
      const [e1, e2] = shuffle(fam).slice(0, 2);
      const x = rand(-3, 4), p1 = rand(1, 3), q1 = rand(-3, 3), p2 = rand(1, 3);
      const teller = e1 * (p1 * x + q1) - e2 * p2 * x;
      if (teller % e2 !== 0) continue;
      const q2 = teller / e2;
      if (Math.abs(q2) > 6 || e1 * p1 === e2 * p2) continue;
      const opg = `${_lgMacht(_lgBasisTex(g, e1), _lgLin(p1, q1))} = ${_lgMacht(_lgBasisTex(g, e2), _lgLin(p2, q2))}`;
      const A = _lgLin(e1 * p1, e1 * q1), B = _lgLin(e2 * p2, e2 * q2);
      const { stappen } = _lgLosLineair(_Q(e1 * p1), _Q(e1 * q1), _Q(e2 * p2), _Q(e2 * q2));
      return _lgVraag('EV.1c', `Los op: $${opg}$`, [x],
        ['Schrijf beide grondtallen als macht van hetzelfde getal. Een breuk $\\frac{1}{g^{n}}$ is $g^{-n}$.',
         'Gebruik $(g^{a})^{b} = g^{a \\cdot b}$ en stel daarna de exponenten gelijk.'],
        [opg, `${g}^{${A}} = ${g}^{${B}}`, `${A} = ${B}`, ...stappen]);
    }

    if (soort === 'getal') {
      // b1^{E1} = N, met N = g^k (k geheel of een half)
      const e1 = pick(fam);
      const k = _Q(rand(-6, 2 * _LG_KMAX[g] - 2), pick([1, 2, 2]));
      if (_Qval(k) > _LG_KMAX[g] - 1 || _Qval(k) < -3 || _Qis(k, 0)) continue;
      const p1 = rand(1, 3), q1 = rand(-3, 3);
      if (Math.abs(e1) === 1 && k[1] === 1 && Math.random() < 0.6) continue;  // te kaal
      const x = _Qdiv(_Qsub(_Qdiv(k, _Q(e1)), _Q(q1)), _Q(p1));
      if (x[1] > 4) continue;
      const opg = `${_lgMacht(_lgBasisTex(g, e1), _lgLin(p1, q1))} = ${_lgGetal(g, k)}`;
      const A = _lgLin(e1 * p1, e1 * q1);
      const { stappen } = _lgLosLineair(_Q(e1 * p1), _Q(e1 * q1), _Q(0), k);
      return _lgVraag('EV.1c', `Los op: $${opg}$`, [_Qval(x)],
        ['Schrijf beide kanten als macht van hetzelfde getal. Een wortel is een macht met exponent $\\frac{1}{2}$, en $\\frac{1}{g^{n}} = g^{-n}$.',
         'Gebruik $g^{a} \\cdot g^{b} = g^{a + b}$ en $(g^{a})^{b} = g^{a \\cdot b}$, en stel daarna de exponenten gelijk.'],
        [opg, `${g}^{${A}} = ${g}^{${_Qtex(k)}}`, `${A} = ${_Qtex(k)}`, ...stappen]);
    }

    // product of quotiënt: b1^{E1} · b2^{E2} = N
    const [e1, e2] = [pick(fam.filter(e => e > 0)), pick(fam.filter(e => e > 0))];
    const quotient = Math.random() < 0.35;
    const x = rand(-2, 4), p1 = rand(1, 2), q1 = rand(-2, 3), p2 = rand(1, 2), q2 = rand(-2, 3);
    const s = quotient ? -1 : 1;
    const pt = e1 * p1 + s * e2 * p2, qt = e1 * q1 + s * e2 * q2;
    const k = pt * x + qt;
    if (pt === 0 || k < -3 || k > _LG_KMAX[g] || k === 0) continue;
    const M1 = _lgMacht(_lgBasisTex(g, e1), _lgLin(p1, q1));
    const M2 = _lgMacht(_lgBasisTex(g, e2), _lgLin(p2, q2));
    const opg = quotient ? `\\frac{${M1}}{${M2}} = ${_lgGetal(g, _Q(k))}` : `${M1} \\cdot ${M2} = ${_lgGetal(g, _Q(k))}`;
    const G1 = `${g}^{${_lgLin(e1 * p1, e1 * q1)}}`, G2 = `${g}^{${_lgLin(e2 * p2, e2 * q2)}}`;
    const herschreven = quotient ? `\\frac{${G1}}{${G2}}` : `${G1} \\cdot ${G2}`;
    const T = _lgLin(pt, qt);
    const { stappen } = _lgLosLineair(_Q(pt), _Q(qt), _Q(0), _Q(k));
    return _lgVraag('EV.1c', `Los op: $${opg}$`, [x],
      ['Schrijf elke macht en het getal rechts als macht van hetzelfde getal.',
       quotient ? 'Bij delen trek je de exponenten af: $\\frac{g^{a}}{g^{b}} = g^{a - b}$. Stel daarna de exponenten gelijk.'
                : 'Bij vermenigvuldigen tel je de exponenten op: $g^{a} \\cdot g^{b} = g^{a + b}$. Stel daarna de exponenten gelijk.'],
      [opg, `${herschreven} = ${g}^{${k}}`, `${g}^{${T}} = ${g}^{${k}}`, `${T} = ${k}`, ...stappen]);
  }
}

/* ── EV.1d – met een logaritme ──────────────────────────────────────────── */

/* Een getal dat géén macht van g is, zodat er een logaritme nodig is. */
function _lgGeenMacht(g, max = 30) {
  for (;;) {
    const N = rand(2, max);
    if (_lgExponent(g, N) === null) return N;
  }
}

/* Exponent voor EV.1d en EV.2a: x, x + q, px, px + q of q − x. */
function _lgExponentVorm() {
  const vorm = pick(['x', 'x', 'xq', 'px', 'pxq', 'qmx']);
  if (vorm === 'x')   return { p: 1, q: 0 };
  if (vorm === 'xq')  return { p: 1, q: pick([-1, 1]) * rand(1, 5) };
  if (vorm === 'px')  return { p: rand(2, 4), q: 0 };
  if (vorm === 'pxq') return { p: rand(2, 4), q: pick([-1, 1]) * rand(1, 5) };
  return { p: -1, q: rand(1, 6) };
}

function genLogEV1d() {
  const g = pick([2, 3, 5, 6, 7]);
  const N = _lgGeenMacht(g);
  const { p, q } = _lgExponentVorm();
  const opg = `${g}^{${_lgLin(p, q)}} = ${N}`;
  const { stappen, x } = _lgMachtIsGetal(g, p, q, N);
  return _lgVraag('EV.1d', `Los exact op: $${opg}$`, [x],
    ['Het getal rechts is geen macht van het grondtal. Gebruik de definitie: $g^{A} = N$ betekent $A = {}^{g}\\!\\log(N)$.',
     'Los daarna de vergelijking in $x$ op. Laat de logaritme staan: het antwoord is exact.'],
    [opg, ...stappen]);
}

/* ── EV.2a – exact oplossen, met +, −, × en : ───────────────────────────── */
function genLogEV2a() {
  const g = pick([2, 3, 5]);
  const macht = Math.random() < 0.35;
  const N = macht ? Math.pow(g, rand(0, _LG_KMAX[g] - 1)) : _lgGeenMacht(g, 20);
  const soort = pick(['rond', 'rond', 'beide', 'som']);

  let p = 1, q = 0, regels;
  if (soort === 'rond') {
    ({ p, q } = _lgExponentVorm());
    ({ regels } = _lgRondMacht(`${g}^{${_lgLin(p, q)}}`, N, ['plus', 'maal', 'maalplus', 'deel']));
  } else if (soort === 'beide') {
    // a·g^x + b = c·g^x + d
    const M = `${g}^{x}`;
    const c = rand(1, 4), a = c + rand(1, 4);
    const b = pick([-1, 1]) * rand(1, 12);
    const d = (a - c) * N + b;
    const opg = `${_lgTerm(a, M, true)}${_lgTerm(b, '')} = ${_lgTerm(c, M, true)}${_lgTerm(d, '')}`;
    regels = [opg];
    if (a - c !== 1) regels.push(`${a - c} \\cdot ${M} = ${(a - c) * N}`);
    regels.push(`${M} = ${N}`);
  } else {
    // g^{x + j} + m·g^x = R: haal g^x buiten haakjes
    const j = rand(1, 2);
    const m = Math.pow(g, j) === 2 ? pick([1, 2, 3]) : pick([-1, 1, 2, 3]);   // geen factor 1
    const factor = Math.pow(g, j) + m;
    const M = `${g}^{x}`;
    const opg = `${g}^{x + ${j}}${_lgTerm(m, M)} = ${factor * N}`;
    regels = [opg, `${Math.pow(g, j)} \\cdot ${M}${_lgTerm(m, M)} = ${factor * N}`,
              `${factor} \\cdot ${M} = ${factor * N}`, `${M} = ${N}`];
  }
  const { stappen, x } = _lgMachtIsGetal(g, p, q, N);
  const hint2 = soort === 'som'
    ? 'Schrijf $g^{x + j}$ als $g^{j} \\cdot g^{x}$ en neem de termen met $g^{x}$ samen.'
    : soort === 'beide'
      ? 'Breng alle termen met de macht naar één kant en de getallen naar de andere kant.'
      : 'Maak eerst de macht vrij: werk het optellen of aftrekken weg, daarna het vermenigvuldigen of delen.';
  return _lgVraag('EV.2a', `Los exact op: $${regels[0]}$`, [x],
    [hint2,
     'Is het getal een macht van het grondtal, stel dan de exponenten gelijk. Anders gebruik je $g^{A} = N \\Leftrightarrow A = {}^{g}\\!\\log(N)$.'],
    [...regels, ...stappen]);
}

/* ── EV.2b – exact oplossen met substitutie ─────────────────────────────── */
const _LG_UMACHT = { 2: [1, 2, 4, 8, 16], 3: [1, 3, 9, 27], 5: [1, 5, 25] };
const _LG_UANDER = { 2: [3, 5, 6, 7, 10, 12], 3: [2, 4, 5, 6, 7], 5: [2, 3, 4, 6] };

function genLogEV2b() {
  const g = pick([2, 3, 5]);
  const schijn = Math.random() < 0.3;
  let u1, u2;
  for (;;) {
    u1 = pick(Math.random() < 0.6 ? _LG_UMACHT[g] : _LG_UANDER[g]);
    u2 = schijn ? -rand(1, 8) : pick(Math.random() < 0.6 ? _LG_UMACHT[g] : _LG_UANDER[g]);
    if (u1 === u2 || u1 + u2 === 0) continue;
    if (Math.abs(u1 + u2) > 20 || Math.abs(u1 * u2) > 80) continue;
    break;
  }
  if (u2 > 0 && u2 < u1) [u1, u2] = [u2, u1];
  const B = -(u1 + u2), C = u1 * u2;
  const gx = `${g}^{x}`;
  const kwadraat = `(${gx})^{2}${_lgTerm(B, gx)}${_lgTerm(C, '')} = 0`;

  const soort = pick(['kwadr', 'verborgen', 'negatief']);
  const regels = [];
  if (soort === 'kwadr') {
    const opg = Math.random() < 0.5
      ? `${g}^{2x}${_lgTerm(B, gx)}${_lgTerm(C, '')} = 0`
      : `${g}^{2x}${_lgTerm(C, '')} = ${_lgTerm(-B, gx, true)}`;
    regels.push(opg);
    regels.push(kwadraat);
  } else if (soort === 'verborgen') {
    // (g²)^x en eventueel g^{x+1}
    const metPlusEen = B % g === 0 && Math.random() < 0.7;
    const midden = metPlusEen ? _lgTerm(B / g, `${g}^{x + 1}`) : _lgTerm(B, gx);
    regels.push(`${g * g}^{x}${midden}${_lgTerm(C, '')} = 0`);
    regels.push(kwadraat);
  } else {
    // g^x + C·g^{-x} = S: vermenigvuldig met g^x
    const S = u1 + u2;
    const opg = Math.random() < 0.5
      ? `${gx}${_lgTerm(C, `${g}^{-x}`)} = ${S}`
      : `${gx} ${C < 0 ? '-' : '+'} \\frac{${Math.abs(C)}}{${gx}} = ${S}`;
    regels.push(opg);
    regels.push(`(${gx})^{2}${_lgTerm(C, '')} = ${_lgTerm(S, gx, true)}`);
    regels.push(kwadraat);
  }

  regels.push(`Stel $u = ${gx}$.`);
  regels.push(`${_lgKwadr(B, C, 'u')} = 0`);
  regels.push(`${_lgFactor(u1, 'u')}${_lgFactor(u2, 'u')} = 0`);
  regels.push(`u = ${u1} \\vee u = ${u2}`);
  regels.push(`${gx} = ${u1} \\vee ${gx} = ${u2}`);

  const sols = [], eind = [];
  for (const u of [u1, u2]) {
    if (u <= 0) { regels.push(`$${gx} = ${u}$ heeft geen oplossing, want een macht van $${g}$ is altijd positief.`); continue; }
    sols.push(_lgWaarde(g, u));
    const k = _lgExponent(g, u);
    eind.push(`x = ${k !== null ? k : _lgLog(g, u)}`);
  }
  regels.push(eind.join(' \\vee '));

  const hints = [
    `Stel $u = ${gx}$. Schrijf eerst elke macht als iets met $${gx}$, bijvoorbeeld $${g}^{2x} = (${gx})^{2}$.`,
    'Los de kwadratische vergelijking in $u$ op. Zet daarna elke $u$ terug: $g^{x} = u$. Let op: $g^{x}$ is altijd positief.',
  ];
  if (soort === 'negatief') hints[0] = `Vermenigvuldig beide kanten met $${gx}$. Stel daarna $u = ${gx}$.`;
  if (soort === 'verborgen') hints[0] = `Schrijf $${g * g}^{x}$ als $(${gx})^{2}$${B % g === 0 ? ` en $${g}^{x + 1}$ als $${g} \\cdot ${gx}$` : ''}. Stel daarna $u = ${gx}$.`;
  return _lgVraag('EV.2b', `Los exact op: $${regels[0]}$`, sols, hints, regels,
    { hulp: { letter: 'u', waarden: [u1, u2] } });
}

/* ── LOG.1a – logaritmen uitrekenen ──────────────────────────────────────────
   Door elkaar: gewone machten, negatieve machten, wortels en een grondtal dat
   zelf een macht is. Het antwoord is een (gebroken) getal. */
function genLOG1a() {
  const soort = pick(['normaal', 'negatief', 'wortel', 'grondtal']);
  const g = pick([2, 3, 5]);
  let basis = g, k, getal;

  if (soort === 'normaal') {
    k = _Q(rand(0, _LG_KMAX[g]));
    getal = _lgGetal(g, k);
    if (Math.random() < 0.15) { basis = pick([6, 7, 10]); k = _Q(rand(0, 2)); getal = `${Math.pow(basis, k[0])}`; }
  } else if (soort === 'negatief') {
    k = _Q(-rand(1, Math.min(4, _LG_KMAX[g])));
    getal = _lgGetal(g, k);
  } else if (soort === 'wortel') {
    const noemer = pick([2, 2, 2, 3]);
    let teller;
    do { teller = rand(-3, 2 * noemer + 1); } while (teller % noemer === 0 || Math.abs(teller / noemer) > _LG_KMAX[g] - 1);
    k = _Q(teller, noemer);
    getal = _lgGetal(g, k);
  } else {
    // grondtal g^e, getal g^m: ᵍᵉlog(g^m) = m/e
    const e = pick([2, 3].filter(n => Math.pow(g, n) <= 27));
    const m = pick([-2, -1, 1, 2, 3, 4, 5].filter(n => n % e !== 0 && Math.pow(g, Math.abs(n)) <= 64));
    basis = Math.pow(g, e);
    k = _Q(m, e);
    getal = _lgGetal(g, _Q(m));
  }

  const opg = _lgLog(basis, getal);
  const machtTex = `${basis}^{${_Qtex(k)}}`;
  const regel = _Qis(k, 0) || _Qis(k, 1)
    ? `${opg} = ${_Qtex(k)}`
    : `${opg} = ${_lgLog(basis, machtTex)} = ${_Qtex(k)}`;

  const hint2 = {
    normaal: 'Schrijf het getal als macht van het grondtal.',
    negatief: 'Een breuk $\\frac{1}{g^{n}}$ schrijf je als $g^{-n}$.',
    wortel: 'Een wortel is een macht met een breuk als exponent: $\\sqrt{g} = g^{\\frac{1}{2}}$ en $\\sqrt[3]{g} = g^{\\frac{1}{3}}$.',
    grondtal: 'Schrijf het grondtal en het getal allebei als macht van hetzelfde kleine getal. Welke macht van het grondtal geeft dan het getal?',
  }[soort];
  return {
    id: uid(), leerdoel: 'LOG.1a',
    vraag: `Bereken zonder rekenmachine: $${opg}$`,
    antwoordType: 'algebra',
    antwoord: { expr: `${_Qval(k)}`, vars: [], vorm: 'log-getal', waarde: _Qval(k) },
    logToetsen: true,
    hints: ['${}^{g}\\!\\log(a)$ is de exponent waarmee je $g$ moet verheffen om $a$ te krijgen.', hint2],
    oplossing: `$${regel}$`,
  };
}

/* ── LOG.2a – basis-logaritmische vergelijkingen ───────────────────────────
   Zonder rekenregels voor logaritmen: één logaritme, eventueel met een getal
   ervoor of erachter. ᵍlog(A) = k betekent A = g^k. */
function genLOG2a() {
  const g = pick([2, 3, 5]);
  const soort = pick(['kaal', 'lin', 'lin', 'rond']);
  let k, p = 1, q = 0;

  if (soort === 'kaal') {
    k = Math.random() < 0.2 ? _Q(pick([1, -1]), 2) : _Q(rand(-2, _LG_KMAX[g] - 1));
  } else {
    k = _Q(rand(-1, Math.min(3, _LG_KMAX[g] - 1)));
    p = rand(1, 3);
    q = pick([-1, 1]) * rand(1, 8);
  }
  const A = _lgLin(p, q);
  const logA = _lgLog(g, A);
  const regels = [];

  if (soort === 'rond') {
    const a = rand(2, 4), b = pick([-1, 1]) * rand(1, 9);
    const rechts = a * k[0] + b;
    regels.push(`${a} \\cdot ${logA}${_lgTerm(b, '')} = ${rechts}`);
    regels.push(`${a} \\cdot ${logA} = ${a * k[0]}`);
  }
  regels.push(`${logA} = ${_Qtex(k)}`);

  // A = g^k, uitgerekend
  const gk = _lgGetal(g, k);
  const gkWaarde = Math.pow(g, _Qval(k));
  regels.push(`${A} = ${g}^{${_Qtex(k)}}`);
  if (gk !== `${g}^{${_Qtex(k)}}`) regels.push(`${A} = ${gk}`);
  let x;
  if (k[1] === 1) {
    const gkQ = k[0] >= 0 ? _Q(Math.pow(g, k[0])) : _Q(1, Math.pow(g, -k[0]));
    const opl = _lgLosLineair(_Q(p), _Q(q), _Q(0), gkQ);
    regels.push(...opl.stappen);
    x = _Qval(opl.x);
  } else {
    x = gkWaarde;    // alleen bij 'kaal': x = √g of 1/√g
  }
  return _lgVraag('LOG.2a', `Los op: $${regels[0]}$`, [x],
    [soort === 'rond' ? 'Maak eerst de logaritme vrij.' : 'Gebruik de definitie van de logaritme.',
     '${}^{g}\\!\\log(A) = k$ betekent $A = g^{k}$. Reken $g^{k}$ uit en los de vergelijking op.'],
    regels);
}

/* ── LOG.1b – herleiden tot één logaritme ────────────────────────────────────
   Elke term draagt een factor bij aan het argument: een getal (rationaal) en
   een macht van x (een veelvoud van ½). Het eindantwoord is ᵍlog(C·x^e). */

/* LaTeX voor x^e, met e een veelvoud van ½ (e > 0). */
function _lgXmacht(e2) {        // e2 = 2·e
  const heel = Math.floor(e2 / 2), half = e2 % 2 === 1;
  let s = heel === 0 ? '' : heel === 1 ? 'x' : `x^{${heel}}`;
  if (half) s += '\\sqrt{x}';
  return s;
}

/* Het argument C·x^e als één uitdrukking. */
function _lgArgument(C, e2) {
  const boven = [], onder = [];
  if (e2 > 0) boven.push(_lgXmacht(e2)); else if (e2 < 0) onder.push(_lgXmacht(-e2));
  const t = Math.abs(C[0]), n = C[1];
  const tTex = (t === 1 && boven.length) ? '' : `${t}`;
  const nTex = (n === 1 && onder.length) ? '' : `${n}`;
  const tel = tTex + boven.join('');
  const noem = onder.length ? (n === 1 ? onder.join('') : `${nTex}${onder.join('')}`) : nTex;
  if (!onder.length && n === 1) return tel;
  return `\\frac{${tel}}{${noem}}`;
}

function genLOG1b() {
  const g = pick([2, 3]);
  // Termen: { tex, als log (herschreven), C, e2 }
  const termSoorten = {
    log: () => ({ tex: _lgLog(g, 'x'), nieuw: _lgLog(g, 'x'), C: _Q(1), e2: 2 }),
    logax: () => { const a = rand(2, 7); return { tex: _lgLog(g, `${a}x`), nieuw: _lgLog(g, `${a}x`), C: _Q(a), e2: 2 }; },
    getalLog: () => { const a = pick([3, 5, 6, 7, 10].filter(n => n !== g)); return { tex: _lgLog(g, a), nieuw: _lgLog(g, a), C: _Q(a), e2: 0 }; },
    keerLog: () => {
      const n = pick([2, 3, 4, -1, -2]);
      const arg = _lgArgument(_Q(1), 2 * n);
      const tex = n === -1 ? `-${_lgLog(g, 'x')}` : `${n} \\cdot ${_lgLog(g, 'x')}`;
      return { tex, nieuw: _lgLog(g, arg), C: _Q(1), e2: 2 * n, coefTerm: true };
    },
    halfLog: () => ({ tex: `\\frac{1}{2} \\cdot ${_lgLog(g, 'x')}`, nieuw: _lgLog(g, '\\sqrt{x}'), C: _Q(1), e2: 1, coefTerm: true }),
    // een los getal k is ᵍlog(g^k); aftrekken regelt het teken van de term
    los: () => { const k = rand(1, 3); const gk = Math.pow(g, k);
                 return { tex: `${k}`, nieuw: _lgLog(g, gk), C: _Q(gk), e2: 0 }; },
    grondtal: () => ({ tex: _lgLog(g * g, 'x'), nieuw: _lgLog(g, '\\sqrt{x}'), C: _Q(1), e2: 1 }),
  };

  // Een vaste kern zodat elk ingrediënt voorkomt, plus een of twee andere termen.
  const kern = pick(['log', 'logax', 'keerLog', 'halfLog', 'los', 'grondtal', 'keerLog', 'los', 'grondtal']);
  const extra = shuffle(['log', 'getalLog', 'getalLog', 'los', 'keerLog', 'logax'].filter(s => s !== kern))
    .slice(0, Math.random() < 0.4 ? 2 : 1);
  const termen = shuffle([kern, ...extra]).map(s => ({ ...termSoorten[s](), teken: 1 }));
  // Losse getallen en kale logaritmen mogen ook afgetrokken worden.
  termen.forEach((t, i) => { if (i > 0 && !t.coefTerm && Math.random() < 0.4) t.teken = -1; });

  let C = _Q(1), e2 = 0;
  for (const t of termen) {
    C = t.teken > 0 ? _Qmul(C, t.C) : _Qdiv(C, t.C);
    e2 += t.teken * t.e2;
  }
  if (e2 === 0 || termen.length < 2) return genLOG1b();   // x valt weg: geen goede opgave

  const samen = (eigen) => termen.map((t, i) => {
    const s = eigen(t);
    if (i === 0) return t.teken < 0 ? `-${s}` : s;
    if (s.startsWith('-')) return ` - ${s.slice(1)}`;
    return t.teken < 0 ? ` - ${s}` : ` + ${s}`;
  }).join('');
  const opg = samen(t => t.tex);
  const tussen = samen(t => t.nieuw);
  const arg = _lgArgument(C, e2);
  const eind = _lgLog(g, arg);
  const regel = tussen === opg ? `${opg} = ${eind}` : `${opg} = ${tussen} = ${eind}`;

  return {
    id: uid(), leerdoel: 'LOG.1b',
    vraag: `Herleid tot één logaritme: $${opg}$`,
    antwoordType: 'algebra',
    antwoord: { expr: _lgLogA(g, arg), vars: ['x'], vorm: 'een-log' },
    logToetsen: true,
    hints: [
      'Schrijf eerst elke term als één logaritme met hetzelfde grondtal: $n \\cdot {}^{g}\\!\\log(a) = {}^{g}\\!\\log(a^{n})$, een los getal $k = {}^{g}\\!\\log(g^{k})$ en ${}^{g^{2}}\\!\\log(a) = \\frac{1}{2} \\cdot {}^{g}\\!\\log(a)$.',
      'Neem daarna alles samen: ${}^{g}\\!\\log(a) + {}^{g}\\!\\log(b) = {}^{g}\\!\\log(ab)$ en ${}^{g}\\!\\log(a) - {}^{g}\\!\\log(b) = {}^{g}\\!\\log(\\frac{a}{b})$.',
    ],
    oplossing: `$${regel}$`,
  };
}

/* ── LOG.2b – logaritmische vergelijkingen, lineair ─────────────────────── */

/* c(px + q) uitgewerkt. */
const _lgUit = (c, p, q) => _lgLin(c * p, c * q);
const _lgMetHaakjes = (c, A) => `${c}(${A})`;

function genLOG2b() {
  const g = pick([2, 3, 5]);
  const k = rand(1, { 2: 4, 3: 3, 5: 2 }[g]);
  const gk = Math.pow(g, k);
  const soort = pick(['getal', 'verschil', 'rechts', 'gelijk']);

  for (;;) {
    if (soort === 'getal') {
      // ᵍlog(px + q) + ᵍlog(c) = k
      const c = pick([2, 3, 4, 5, 6].filter(n => n !== g && n !== gk));
      const p = rand(1, 3), q = pick([-1, 1]) * rand(1, 6);
      const x = _Qdiv(_Qsub(_Q(gk, c), _Q(q)), _Q(p));
      if (x[1] > 3) continue;
      const A = _lgLin(p, q);
      const opg = Math.random() < 0.5 ? `${_lgLog(g, A)} + ${_lgLog(g, c)} = ${k}` : `${_lgLog(g, c)} + ${_lgLog(g, A)} = ${k}`;
      const { stappen } = _lgLosLineair(_Q(c * p), _Q(c * q), _Q(0), _Q(gk));
      return _lgVraag('LOG.2b', `Los op: $${opg}$`, [_Qval(x)], _LV_HINTS,
        [opg, `${_lgLog(g, _lgMetHaakjes(c, A))} = ${k}`, `${_lgMetHaakjes(c, A)} = ${gk}`,
         `${_lgUit(c, p, q)} = ${gk}`, ...stappen]);
    }

    // Twee lineaire argumenten A en B met A = factor · B in de oplossing.
    const x = rand(1, 8);
    const p2 = rand(1, 2), b0 = rand(1, 4), q2 = b0 - p2 * x;
    const factor = soort === 'gelijk' ? pick([2, 3, 4, 5].filter(n => n !== g)) : gk;
    const p1 = rand(1, 4);
    const q1 = factor * b0 - p1 * x;
    if (p1 === factor * p2 || Math.abs(q1) > 15 || Math.abs(q2) > 10 || q2 === 0) continue;
    const A = _lgLin(p1, q1), B = _lgLin(p2, q2);
    const { stappen } = _lgLosLineair(_Q(p1), _Q(q1), _Q(factor * p2), _Q(factor * q2));
    const slot = [`${A} = ${_lgMetHaakjes(factor, B)}`, `${A} = ${_lgUit(factor, p2, q2)}`, ...stappen];

    if (soort === 'verschil') {
      const opg = `${_lgLog(g, A)} - ${_lgLog(g, B)} = ${k}`;
      return _lgVraag('LOG.2b', `Los op: $${opg}$`, [x], _LV_HINTS,
        [opg, `${_lgLog(g, `\\frac{${A}}{${B}}`)} = ${k}`, `\\frac{${A}}{${B}} = ${gk}`, ...slot]);
    }
    if (soort === 'rechts') {
      const opg = `${_lgLog(g, A)} = ${k} + ${_lgLog(g, B)}`;
      return _lgVraag('LOG.2b', `Los op: $${opg}$`, [x], _LV_HINTS,
        [opg, `${_lgLog(g, A)} = ${_lgLog(g, gk)} + ${_lgLog(g, B)}`,
         `${_lgLog(g, A)} = ${_lgLog(g, _lgMetHaakjes(gk, B))}`, ...slot]);
    }
    // gelijk: ᵍlog(B) + ᵍlog(factor) = ᵍlog(A), dus factor · B = A
    const opg = `${_lgLog(g, B)} + ${_lgLog(g, factor)} = ${_lgLog(g, A)}`;
    const omgekeerd = _lgLosLineair(_Q(factor * p2), _Q(factor * q2), _Q(p1), _Q(q1));
    return _lgVraag('LOG.2b', `Los op: $${opg}$`, [x], _LV_HINTS,
      [opg, `${_lgLog(g, _lgMetHaakjes(factor, B))} = ${_lgLog(g, A)}`,
       `${_lgMetHaakjes(factor, B)} = ${A}`, `${_lgUit(factor, p2, q2)} = ${A}`, ...omgekeerd.stappen]);
  }
}

const _LV_HINTS = [
  'Schrijf elke kant als één logaritme met de rekenregels. Een los getal $k$ is ${}^{g}\\!\\log(g^{k})$.',
  'Gebruik daarna ${}^{g}\\!\\log(A) = k \\Leftrightarrow A = g^{k}$, of ${}^{g}\\!\\log(A) = {}^{g}\\!\\log(B) \\Leftrightarrow A = B$, en los de lineaire vergelijking op.',
];

/* ── LOG.2c – kwadratisch, twee oplossingen ─────────────────────────────── */
function genLOG2c() {
  const g = pick([2, 3, 5]);
  const soort = pick(['kwadr', 'product', 'quotient']);
  let regels, r1, r2;

  if (soort === 'kwadr') {
    // ᵍlog(x² + bx + c) = k: het argument is in beide oplossingen g^k > 0
    const k = rand(1, { 2: 4, 3: 2, 5: 1 }[g]);
    const N = Math.pow(g, k);
    do { r1 = rand(-6, 6); r2 = rand(-6, 6); } while (r1 >= r2 || r1 * r2 + N === 0);
    const b = -(r1 + r2), c = r1 * r2 + N;
    const opg = `${_lgLog(g, _lgKwadr(b, c))} = ${k}`;
    regels = [opg, `${_lgKwadr(b, c)} = ${N}`, `${_lgKwadr(b, c - N)} = 0`];
  } else {
    // ᵍlog(x) + ᵍlog(m − x) = k  of  ᵍlog(x² + c) − ᵍlog(x) = k:
    // beide oplossingen zijn positief, dus beide voldoen
    const k = rand(1, { 2: 4, 3: 3, 5: 2 }[g]);
    const N = Math.pow(g, k);
    const paren = [];
    if (soort === 'product') {
      for (let a = 1; a * a < N; a++) if (N % a === 0) paren.push([a, N / a]);
    } else {
      for (let a = 1; 2 * a < N; a++) paren.push([a, N - a]);
    }
    if (!paren.length) return genLOG2c();
    [r1, r2] = pick(paren);
    if (soort === 'product') {
      const m = r1 + r2;
      const opg = Math.random() < 0.6
        ? `${_lgLog(g, 'x')} + ${_lgLog(g, `${m} - x`)} = ${k}`
        : `${_lgLog(g, 'x')} = ${k} - ${_lgLog(g, `${m} - x`)}`;
      regels = [opg];
      if (!opg.includes(`= ${k} -`)) regels.push(`${_lgLog(g, `x(${m} - x)`)} = ${k}`);
      else regels.push(`${_lgLog(g, 'x')} + ${_lgLog(g, `${m} - x`)} = ${k}`, `${_lgLog(g, `x(${m} - x)`)} = ${k}`);
      regels.push(`x(${m} - x) = ${N}`, `${m}x - x^{2} = ${N}`, `${_lgKwadr(-m, N)} = 0`);
    } else {
      const c = r1 * r2;
      const opg = `${_lgLog(g, `x^{2} + ${c}`)} - ${_lgLog(g, 'x')} = ${k}`;
      regels = [opg, `${_lgLog(g, `\\frac{x^{2} + ${c}}{x}`)} = ${k}`, `\\frac{x^{2} + ${c}}{x} = ${N}`,
                `x^{2} + ${c} = ${N}x`, `${_lgKwadr(-N, c)} = 0`];
    }
  }
  regels.push(`${_lgFactor(r1)}${_lgFactor(r2)} = 0`, `x = ${r1} \\vee x = ${r2}`, 'Beide oplossingen voldoen.');
  return _lgVraag('LOG.2c', `Los op: $${regels[0]}$`, [r1, r2],
    ['Schrijf de vergelijking als ${}^{g}\\!\\log(A) = k$ en gebruik $A = g^{k}$.',
     'Je krijgt een kwadratische vergelijking. Breng alles naar één kant en ontbind in factoren. Controleer daarna of de logaritmen bestaan.'],
    regels);
}

/* ── LOG.2d – kwadratisch met een schijnoplossing ───────────────────────────
   Na het wegwerken van de logaritmen komen er twee oplossingen uit, maar bij
   één ervan staat er een logaritme van een negatief getal (of nul). */
function genLOG2d() {
  const g = pick([2, 3, 5]);
  const soort = pick(['xplus', 'tweeplus', 'twee']);
  let regels, goed, schijn, args;

  for (;;) {
    if (soort === 'twee') {
      // 2·ᵍlog(x) = ᵍlog(px + q): x² = px + q, één positieve en één negatieve wortel
      const r = rand(2, 7), s = -rand(1, 6);
      const p = r + s, q = -r * s;
      if (p === 0) continue;
      const B = _lgLin(p, q);
      const opg = `2 \\cdot ${_lgLog(g, 'x')} = ${_lgLog(g, B)}`;
      regels = [opg, `${_lgLog(g, 'x^{2}')} = ${_lgLog(g, B)}`, `x^{2} = ${B}`, `${_lgKwadr(-p, -q)} = 0`];
      goed = r; schijn = s; args = ['x', B];
      break;
    }
    const k = rand(1, { 2: 4, 3: 3, 5: 2 }[g]);
    const N = Math.pow(g, k);
    const paren = [];
    for (let a = 1; a * a < N; a++) if (N % a === 0) paren.push([a, N / a]);
    if (!paren.length) continue;
    const [d1, d2] = pick(paren);
    if (soort === 'xplus') {
      // ᵍlog(x) + ᵍlog(x + a) = k, met x(x + a) = N
      const a = d2 - d1;
      goed = d1; schijn = -d2;
      const A2 = `x + ${a}`;
      const opg = `${_lgLog(g, 'x')} + ${_lgLog(g, A2)} = ${k}`;
      regels = [opg, `${_lgLog(g, `x(${A2})`)} = ${k}`, `x(${A2}) = ${N}`, `${_lgKwadr(a, 0)} = ${N}`, `${_lgKwadr(a, -N)} = 0`];
      args = ['x', A2];
    } else {
      // ᵍlog(x + p) + ᵍlog(x + q) = k, met (x + p)(x + q) = N
      const x0 = rand(-3, 6);
      const [a, b] = Math.random() < 0.5 ? [d1, d2] : [d2, d1];
      const p = a - x0, q = b - x0;
      if (p === 0 || q === 0 || p === q) continue;
      goed = x0; schijn = -x0 - p - q;
      const A1 = _lgLin(1, p), A2 = _lgLin(1, q);
      const opg = `${_lgLog(g, A1)} + ${_lgLog(g, A2)} = ${k}`;
      regels = [opg, `${_lgLog(g, `(${A1})(${A2})`)} = ${k}`, `(${A1})(${A2}) = ${N}`,
                `${_lgKwadr(p + q, p * q)} = ${N}`, `${_lgKwadr(p + q, p * q - N)} = 0`];
      args = [A1, A2];
    }
    break;
  }

  // Bij welk argument gaat het mis bij de schijnoplossing?
  const fout = args.map(a => ({ a, w: _algEval(a, { x: schijn }) })).find(o => o.w <= 0);
  const [r1, r2] = [goed, schijn].sort((a, b) => a - b);
  regels.push(`${_lgFactor(r1)}${_lgFactor(r2)} = 0`, `x = ${r1} \\vee x = ${r2}`,
              `$x = ${schijn}$ voldoet niet, want dan staat er $${_lgLog(g, fout.w)}$ en die bestaat niet.`,
              `x = ${goed}`);
  return _lgVraag('LOG.2d', `Los op: $${regels[0]}$`, [goed],
    ['Schrijf beide kanten als één logaritme met de rekenregels en werk de logaritmen weg.',
     'Je krijgt een kwadratische vergelijking. Controleer elke oplossing: het getal achter log moet positief zijn.'],
    regels, { verworpen: [schijn] });
}

/* ── LOG.3 – logaritmen herleiden ────────────────────────────────────────────
   Het grondtal is een breuk [teller, noemer], want ½log hoort erbij; grondtal
   10 schrijven we als log(..). Elke generator kiest eerst de termen en bouwt
   daaruit opgave, antwoord en uitwerking. */
const _lhLog  = (g, arg) => (_Qis(g, 10) ? `\\log(${arg})` : _lgLog(_Qtex(g), arg));
const _lhLogA = (g, arg) => (_Qis(g, 10) ? `\\log(${arg})` : _lgLogA(_Qtex(g), arg));

const _LH_GRONDTAL = [_Q(2), _Q(3), _Q(4), _Q(5), _Q(6), _Q(10), _Q(1, 2), _Q(1, 3)];
const _LH_MAX_ARG = 5000;

/* Grootste k waarbij g^k nog een handzaam getal is. */
const _lhKmax = g => Math.max(1, Math.floor(Math.log(1000) / Math.abs(Math.log(_Qval(g)))));

function _Qpow(a, n) {
  if (n < 0) return _Qpow(_Q(a[1], a[0]), -n);
  return _Q(Math.pow(a[0], n), Math.pow(a[1], n));
}

/* Is w een macht van g, ook met een breuk als exponent? Dan valt de logaritme
   weg en is "herleid tot één logaritme" geen zinnige opgave. */
function _lhIsMacht(g, w) {
  const k = Math.log(w) / Math.log(_Qval(g));
  return Math.abs(k * 12 - Math.round(k * 12)) < 1e-9;
}

const _lhArgOk = (g, C) => !_Qis(C, 1) && C[0] <= _LH_MAX_ARG && C[1] <= _LH_MAX_ARG && !_lhIsMacht(g, _Qval(C));

/* Een term: p · ᵍlog(a), met a een breuk. Een negatieve p gaat in de exponent
   (-2 · ⁴log(6) = ⁴log(6⁻²)); anders staat het teken voor de term. Bij p = ½
   moet a een kwadraat zijn. */
function _lhTerm(g, a, p = _Q(1), teken = 1) {
  const log = _lhLog(g, _Qtex(a));
  if (_Qis(p, 1)) return { opg: log, macht: _Qtex(a), arg: _Qtex(a), w: a, teken };
  const w = p[1] === 2 ? _Q(Math.round(Math.sqrt(a[0])), Math.round(Math.sqrt(a[1]))) : _Qpow(a, p[0]);
  return { opg: `${_Qtex(p)} \\cdot ${log}`, macht: _lgMacht(_Qtex(a), _Qtex(p)), arg: _Qtex(w), w, teken };
}

/* Een los getal k als logaritme: k = ᵍlog(g^k). */
function _lhLos(g, k, teken = 1) {
  const w = _Qpow(g, k);
  return { opg: `${k}`, macht: k === 1 ? _Qtex(g) : _lgMacht(_Qtex(g), k), arg: _Qtex(w), w, teken };
}

/* De termen als som. In de opgave kan een teken anders zijn dan verderop:
   + ½log(8) wordt - 3. */
function _lhSom(termen, veld, opgave = false) {
  return termen.map((t, i) => {
    const teken = opgave && t.tekenOpg !== undefined ? t.tekenOpg : t.teken;
    if (i === 0) return teken < 0 ? `-${veld(t)}` : veld(t);
    return `${teken < 0 ? ' - ' : ' + '}${veld(t)}`;
  }).join('');
}

/* De keten van opgave naar één logaritme. Elke tussenvorm staat erin zolang
   hij verschilt van de vorige, zoals in de uitwerkingen van het boek. */
function _lhKeten(g, termen, samen, eind) {
  const delen = [
    _lhSom(termen, t => t.opg, true),
    _lhSom(termen, t => t.los ?? t.opg),
    _lhSom(termen, t => _lhLog(g, t.macht)),
    _lhSom(termen, t => _lhLog(g, t.arg)),
    _lhLog(g, samen),
    _lhLog(g, eind),
  ];
  return delen.filter((d, i) => i === 0 || d !== delen[i - 1]).join(' = ');
}

/* Twee termen samennemen: A · B of A/B als breuk binnen de logaritme. */
function _lhSamen(t1, t2) {
  const C = t2.teken < 0 ? _Qdiv(t1.w, t2.w) : _Qmul(t1.w, t2.w);
  return { C, samen: t2.teken < 0 ? `\\frac{${t1.arg}}{${t2.arg}}` : `${t1.arg} \\cdot ${t2.arg}` };
}

const _LH_REGELS = 'Gebruik ${}^{g}\\!\\log(a) + {}^{g}\\!\\log(b) = {}^{g}\\!\\log(ab)$ en ${}^{g}\\!\\log(a) - {}^{g}\\!\\log(b) = {}^{g}\\!\\log(\\frac{a}{b})$.';

function _lhVraag(id, g, termen, samen, eind, vars, hint1) {
  return {
    id: uid(), leerdoel: id,
    vraag: `Herleid tot één logaritme: $${_lhSom(termen, t => t.opg, true)}$`,
    antwoordType: 'algebra',
    antwoord: { expr: _lhLogA(g, eind), vars, vorm: 'een-log', eenvoudig: true },
    logToetsen: 'ook-log',
    hints: [hint1, _LH_REGELS],
    oplossing: `$${_lhKeten(g, termen, samen, eind)}$`,
  };
}

/* ── LOG.3a – getallen, hetzelfde grondtal ──────────────────────────────── */
function genLOG3a() {
  for (;;) {
    const g = pick(_LH_GRONDTAL);
    const vorm = pick(['som', 'verschil', 'verschil', 'keerSom', 'keerVerschil', 'minKeer', 'half']);
    let t1, t2;
    if (vorm === 'som') {
      t1 = _lhTerm(g, _Q(rand(2, 15))); t2 = _lhTerm(g, _Q(rand(2, 15)));
    } else if (vorm === 'verschil') {
      const b = rand(2, 12);
      t1 = _lhTerm(g, _Q(Math.random() < 0.5 ? b * rand(2, 8) : rand(2, 40))); t2 = _lhTerm(g, _Q(b), _Q(1), -1);
    } else if (vorm === 'keerSom') {
      const p = rand(2, 3);
      t1 = _lhTerm(g, _Q(rand(2, p === 2 ? 7 : 4)), _Q(p));
      t2 = _lhTerm(g, Math.random() < 0.5 ? _Q(1, rand(2, 5)) : _Q(rand(2, 12)));
    } else if (vorm === 'keerVerschil') {
      const p = rand(2, 4);
      t1 = _lhTerm(g, _Q(rand(2, 50))); t2 = _lhTerm(g, _Q(rand(2, p === 2 ? 7 : 3)), _Q(p), -1);
    } else if (vorm === 'minKeer') {
      const p = rand(2, 3), a = rand(2, p === 2 ? 6 : 3);
      t1 = _lhTerm(g, _Q(a), _Q(-p)); t2 = _lhTerm(g, _Q(a * rand(2, 6)));
    } else {
      const s = rand(2, 9);
      t1 = _lhTerm(g, _Q(s * s), _Q(1, 2)); t2 = _lhTerm(g, _Q(rand(2, 15)), _Q(1), pick([-1, 1]));
    }
    const { C, samen } = _lhSamen(t1, t2);
    if (!_lhArgOk(g, C) || t1.opg === t2.opg) continue;
    return _lhVraag('LOG.3a', g, [t1, t2], samen, _Qtex(C), [],
      'Haal eerst een getal voor de logaritme naar binnen: $p \\cdot {}^{g}\\!\\log(a) = {}^{g}\\!\\log(a^{p})$.');
  }
}

/* ── LOG.3b – met een los getal of een ander grondtal ───────────────────── */
function genLOG3b() {
  for (;;) {
    const g = pick(_LH_GRONDTAL);
    const vorm = pick(['plus', 'min', 'achter', 'ander', 'ander', 'half']);
    const kmax = Math.min(_lhKmax(g), 4);
    let t1, t2;

    if (vorm === 'plus') {
      t1 = _lhLos(g, rand(1, kmax)); t2 = _lhTerm(g, _Q(rand(2, 12)));
    } else if (vorm === 'min') {
      t1 = _lhLos(g, rand(1, kmax)); t2 = _lhTerm(g, _Q(rand(2, 20)), _Q(1), -1);
    } else if (vorm === 'achter') {
      t2 = _lhLos(g, rand(1, kmax), -1);
      t1 = _lhTerm(g, Math.random() < 0.5 && t2.w[1] === 1 ? _Q(t2.w[0] * rand(2, 9)) : _Q(rand(2, 80)));
    } else {
      // De tweede logaritme komt precies uit, in een ander grondtal.
      const h = pick([_Q(2), _Q(3), _Q(5), _Q(10), _Q(1, 2)].filter(x => x[0] !== g[0] || x[1] !== g[1]));
      const m = rand(1, Math.min(3, _lhKmax(h)));
      const breuk = h[1] > 1;                            // ½log(8) = -3
      const tekenOpg = pick([-1, 1]);
      const teken = breuk ? -tekenOpg : tekenOpg;
      t2 = { ..._lhLos(g, m, teken), tekenOpg, opg: _lhLog(h, Math.pow(Math.max(h[0], h[1]), m)), los: `${m}` };
      if (vorm === 'ander') {
        t1 = _lhTerm(g, _Q(rand(2, 60)));
      } else {
        const s = rand(2, 7);
        t1 = _lhTerm(g, _Q(s * s), _Q(1, 2));
      }
    }
    const { C, samen } = _lhSamen(t1, t2);
    if (!_lhArgOk(g, C)) continue;
    return _lhVraag('LOG.3b', g, [t1, t2], samen, _Qtex(C), [],
      'Schrijf een los getal als logaritme met het goede grondtal: $k = {}^{g}\\!\\log(g^{k})$. Staat er een logaritme met een ander grondtal, reken die dan eerst uit.');
  }
}

/* ── LOG.3c – met letters ───────────────────────────────────────────────── */

/* Een term met een letter, en de macht of wortel die daaruit komt. */
function _lhLetter(g, v, p = 1, teken = 1) {
  const log = _lhLog(g, v);
  if (p === 1) return { opg: log, macht: v, arg: v, teken };
  if (p === 0.5) return { opg: `\\frac{1}{2} \\cdot ${log}`, macht: `${v}^{\\frac{1}{2}}`, arg: `\\sqrt{${v}}`, teken };
  return { opg: `${p} \\cdot ${log}`, macht: `${v}^{${p}}`, arg: `${v}^{${p}}`, teken };
}

function genLOG3c() {
  const [v1, v2] = pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['p', 'q']]);
  const g = pick([_Q(2), _Q(3), _Q(5), _Q(6), _Q(10)]);
  const vorm = pick(['plusKeer', 'keerMin', 'losPlus', 'losMin', 'achterLos', 'half']);
  const k = rand(1, Math.min(3, _lhKmax(g)));
  const gk = Math.pow(g[0], k);
  let termen, samen, eind, vars = [v1, v2];

  if (vorm === 'plusKeer') {
    const p = rand(2, 5);
    termen = [_lhLetter(g, v1), _lhLetter(g, v2, p)];
    samen = `${v1} \\cdot ${v2}^{${p}}`; eind = `${v1}${v2}^{${p}}`;
  } else if (vorm === 'keerMin') {
    const p = rand(2, 5), q = rand(2, 3);
    termen = [_lhLetter(g, v1, p), _lhLetter(g, v2, q, -1)];
    samen = eind = `\\frac{${v1}^{${p}}}{${v2}^{${q}}}`;
  } else if (vorm === 'half') {
    const p = rand(2, 4);
    termen = [_lhLetter(g, v2, p), _lhLetter(g, v1, 0.5)];
    samen = `${v2}^{${p}} \\cdot \\sqrt{${v1}}`; eind = `${v2}^{${p}}\\sqrt{${v1}}`;
  } else {
    vars = [v1];
    const los = teken => ({ opg: `${k}`, macht: k === 1 ? `${gk}` : `${g[0]}^{${k}}`, arg: `${gk}`, teken });
    if (vorm === 'losPlus') {
      termen = [los(1), _lhLetter(g, v1)];
      samen = `${gk} \\cdot ${v1}`; eind = `${gk}${v1}`;
    } else if (vorm === 'losMin') {
      termen = [los(1), _lhLetter(g, v1, 1, -1)];
      samen = eind = `\\frac{${gk}}{${v1}}`;
    } else {
      termen = [_lhLetter(g, v1), los(-1)];
      samen = eind = `\\frac{${v1}}{${gk}}`;
    }
  }
  return _lhVraag('LOG.3c', g, termen, samen, eind, vars,
    'Haal een getal voor de logaritme naar binnen: $p \\cdot {}^{g}\\!\\log(a) = {}^{g}\\!\\log(a^{p})$. Een los getal schrijf je als ${}^{g}\\!\\log(g^{k})$.');
}

/* ── LOG.3d – schrijven als a + ᵍlog(b) ─────────────────────────────────────
   N = g^k · b met b niet deelbaar door g, zodat a echt zo groot mogelijk is. */
function genLOG3d() {
  const g = pick([2, 3, 5, 10]);
  const G = _Q(g);
  const L = arg => _lhLog(G, arg);
  const vorm = pick(['kaal', 'kaal', 'keer', 'achter', 'voor']);
  const kMax = { 2: 6, 3: 4, 5: 3, 10: 3 }[g];
  const k = rand(vorm === 'achter' ? 2 : 1, vorm === 'keer' ? Math.min(kMax, 4) : kMax);
  const gk = Math.pow(g, k);
  const kandidaten = [2, 3, 5, 6, 7, 9, 11, 12, 13, 15, 16, 25].filter(n => n % g !== 0);
  const b = pick(vorm === 'keer' ? kandidaten.filter(n => n <= 5) : kandidaten);
  const N = gk * b;
  const product = L(`${gk} \\cdot ${b}`);
  const splits = `${L(gk)} + ${L(b)}`;
  let opg, a, bEind = b, keten;

  if (vorm === 'keer') {
    const p = rand(2, b === 2 ? 4 : 3);
    a = p * k; bEind = Math.pow(b, p);
    opg = `${p} \\cdot ${L(N)}`;
    keten = [opg, `${p} \\cdot ${product}`, `${p} \\cdot (${splits})`, `${p} \\cdot (${k} + ${L(b)})`,
             `${a} + ${p} \\cdot ${L(b)}`, `${a} + ${L(`${b}^{${p}}`)}`, `${a} + ${L(bEind)}`];
  } else if (vorm === 'achter') {
    const m = rand(1, k - 1);
    a = k - m;
    opg = `${L(N)} - ${m}`;
    keten = [opg, `${product} - ${m}`, `${splits} - ${m}`, `${k} + ${L(b)} - ${m}`, `${a} + ${L(b)}`];
  } else if (vorm === 'voor') {
    const m = rand(1, 9);
    a = m + k;
    opg = `${m} + ${L(N)}`;
    keten = [opg, `${m} + ${product}`, `${m} + ${splits}`, `${m} + ${k} + ${L(b)}`, `${a} + ${L(b)}`];
  } else {
    a = k;
    opg = L(N);
    keten = [opg, product, splits, `${a} + ${L(b)}`];
  }
  return {
    id: uid(), leerdoel: 'LOG.3d',
    vraag: `Schrijf $${opg}$ in de vorm $a + ${L('b')}$ met $a$ een zo groot mogelijk geheel getal en $b$ geheel.`,
    antwoordType: 'algebra',
    antwoord: { vorm: 'log-a-plus', expr: `${a} + ${_lhLogA(G, bEind)}`, vars: [], a, b: bEind, g },
    logToetsen: 'ook-log',
    hints: [
      'Schrijf het getal achter log als een product met een zo groot mogelijke macht van het grondtal.',
      'Splits daarna met ${}^{g}\\!\\log(pq) = {}^{g}\\!\\log(p) + {}^{g}\\!\\log(q)$ en reken de macht van het grondtal uit. Staat er een getal voor de logaritme, haal dat aan het eind naar binnen.',
    ],
    oplossing: `$${keten.join(' = ')}$`,
  };
}

/* ── LOG.4 – exponentiële en logaritmische formules omschrijven ─────────────
   De doelformule is altijd een van deze twee:
     exp: v = a + b · G^(c·u)
     log: v = a + b · ʰlog(c·u)
   De getallen a, b, c en G staan exact in `par`; `dec` zegt welke afgerond
   moeten worden. checkFormuleOm (utils.js) rekent daarmee na. */
const _FM_LETTERS = [['N', 't'], ['y', 'x'], ['P', 't'], ['M', 'n'], ['K', 'x'], ['H', 't'], ['W', 'q']];

/* Past dit getal exact in hoogstens drie decimalen? Anders moet het afgerond. */
const _fmEindig = x => Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-9;

const _FM_DEC_WOORD = { 2: 'twee', 3: 'drie' };
function _fmRondTekst(namen, dec) {
  if (!namen.length) return '';
  return ` Rond ${[...namen].sort().map(n => `$${n}$`).join(' en ')} af op ${_FM_DEC_WOORD[dec]} decimalen.`;
}

/* Is elke af te ronden waarde veilig, dus niet vlak bij een afrondgrens? */
const _fmVeilig = (par, dec) => Object.keys(dec).every(n => _mkVeilig(par[n], dec[n]));

/* c · tex als som: [[c, tex], ...], met c een breuk. Lege tex = alleen c. */
function _fmSom(termen) {
  let s = '';
  for (const [c, tex] of termen) {
    if (_Qis(c, 0)) continue;
    const abs = _Q(Math.abs(c[0]), c[1]);
    const inhoud = !tex ? _Qtex(abs) : _Qis(abs, 1) ? tex : `${_Qtex(abs)} \\cdot ${tex}`;
    s += s ? (c[0] < 0 ? ` - ${inhoud}` : ` + ${inhoud}`) : (c[0] < 0 ? `-${inhoud}` : inhoud);
  }
  return s || '0';
}

/* a·v + b als exponent of argument; a mag een decimaal getal zijn (0.1q - 3). */
function _fmLin(a, b, v) {
  const voor = a === 1 ? v : `${a}${v}`;
  return b === 0 ? voor : `${voor} ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
}

/* a + b · rest in de doelvorm, met de afgeronde waarden. */
function _fmDoel(a, b, rest, dec) {
  const bTex = Math.abs(b - 1) < 1e-12 ? rest : `${_mkT(b, dec.b)} \\cdot ${rest}`;
  if (a === 0) return bTex;
  return `${_mkT(a, dec.a)} + ${bTex}`;
}

function _fmVraag(id, opg, vormTex, rondTekst, a, hints, regels) {
  return {
    id: uid(), leerdoel: id,
    vraag: `${opg} de vorm $${vormTex}$.${rondTekst}`,
    antwoordType: 'algebra',
    antwoord: { vorm: 'formule-om', vars: [a.u, a.v], ...a },
    logToetsen: 'ook-log',
    hints,
    oplossing: regels.filter((r, i) => i === 0 || r !== regels[i - 1])
      .map(r => (r.startsWith('Dus') ? r : `$${r}$`)).join('\n'),
  };
}

const _FM_HINTS_EXP = [
  'Maak eerst de macht vrij. Gebruik dan $g^{A} = B \\Leftrightarrow A = {}^{g}\\!\\log(B)$.',
  'Maak de gevraagde letter vrij en splits de logaritme met de rekenregels. Rond pas aan het eind af.',
];
const _FM_HINTS_LOG = [
  'Maak eerst de logaritme vrij. Gebruik dan ${}^{g}\\!\\log(A) = B \\Leftrightarrow A = g^{B}$.',
  'Splits de macht met $g^{p + q} = g^{p} \\cdot g^{q}$ en $g^{pq} = (g^{p})^{q}$. Rond pas aan het eind af.',
];

/* u = A · g^E: de eerste regels van elke uitwerking. */
function _fmExpBegin(u, A, g, E) {
  return [`${u} = ${A} \\cdot ${g}^{${E}}`, `${A} \\cdot ${g}^{${E}} = ${u}`, `${g}^{${E}} = \\frac{1}{${A}}${u}`];
}

/* ── LOG.4a – exponentieel naar logaritme ───────────────────────────────── */
function genLOG4a() {
  for (;;) {
    const [u, v] = pick(_FM_LETTERS);
    const g = pick([2, 3, 5]);
    const A = rand(2, 60), p = rand(1, 4), q = pick([-1, 1]) * rand(1, 5);
    if (_lgExponent(g, A) !== null) continue;
    const E = _fmLin(p, q, v);
    const begin = _fmExpBegin(u, A, g, E);
    const eenA = `\\frac{1}{${A}}`;
    const links = _fmLin(p, 0, v);
    const b = 1 / p;
    const bVorm = p === 1 ? '' : 'b \\cdot ';

    if (Math.random() < 0.5) {
      // v = a + b · ᵍlog(u)
      const a = (-q - Math.log(A) / Math.log(g)) / p;
      const dec = { a: 2 };
      if (!_fmEindig(b)) dec.b = 2;
      const par = { a, b, c: 1, h: g };
      if (!_fmVeilig(par, dec) || Math.abs(a) < 0.05) continue;
      const doel = _fmDoel(a, b, _lgLog(g, u), dec);
      return _fmVraag('LOG.4a', `Werk de formule $${begin[0]}$ om tot`, `${v} = a + ${bVorm}${_lgLog(g, u)}`,
        _fmRondTekst(Object.keys(dec), 2),
        { soort: 'log', u, v, par, dec, testU: [A, 5 * A, 20 * A] }, _FM_HINTS_EXP,
        [...begin, `${E} = ${_lgLog(g, `${eenA}${u}`)}`,
         `${links} = ${_fmSom([[_Q(-q), ''], [_Q(1), _lgLog(g, eenA)], [_Q(1), _lgLog(g, u)]])}`,
         `${v} = ${_fmSom([[_Q(-q, p), ''], [_Q(1, p), _lgLog(g, eenA)], [_Q(1, p), _lgLog(g, u)]])}`,
         `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
    }

    // v = b · ᵍlog(c·u)
    const c = Math.pow(g, -q) / A;
    const cQ = q < 0 ? _Q(Math.pow(g, -q), A) : _Q(1, A * Math.pow(g, q));
    const dec = {};
    if (Math.abs(c - _mkRond(c, 2)) > 1e-9) dec.c = 2;
    if (!_fmEindig(b)) dec.b = 2;
    const par = { a: 0, b, c, h: g };
    if (!_fmVeilig(par, dec) || c < 0.1 || c > 100) continue;
    const logC = _lgLog(g, `${_Qtex(cQ)}${u}`);
    const doel = _fmDoel(0, b, _lgLog(g, `${_mkT(c, dec.c)}${u}`), dec);
    const benader = Object.keys(dec).length ? '\\approx' : '=';
    return _fmVraag('LOG.4a', `Herleid de formule $${begin[0]}$ tot`, `${v} = ${bVorm}${_lgLog(g, `c${u}`)}`,
      _fmRondTekst(Object.keys(dec), 2),
      { soort: 'log', u, v, par, dec, testU: [A, 5 * A, 20 * A] }, _FM_HINTS_EXP,
      [...begin, `${E} = ${_lgLog(g, `${eenA}${u}`)}`,
       `${links} = ${_fmSom([[_Q(-q), ''], [_Q(1), _lgLog(g, `${eenA}${u}`)]])}`,
       `${links} = ${_lgLog(g, _lgGetal(g, _Q(-q)))} + ${_lgLog(g, `${eenA}${u}`)}`,
       `${links} = ${logC}`,
       `${v} = ${_fmSom([[_Q(1, p), logC]])}`, `${v} ${benader} ${doel}`, `Dus $${v} = ${doel}$.`]);
  }
}

/* ── LOG.4b – logaritme naar exponentieel ───────────────────────────────── */
const _lgMachtKaal = (g, k) => (k === 1 ? `${g}` : `${g}^{${k}}`);

function genLOG4b() {
  for (;;) {
    const [v, u] = pick(_FM_LETTERS);     // v staat in de logaritme, u is de uitkomst
    if (Math.random() < 0.5) {
      // u = A · log(v) + B  →  v = b · 10^(c·u)
      const A = pick([2, 3, 4, 5, 6]), B = pick([-1, 1]) * rand(1, 9);
      if (B % A === 0) continue;
      const b = Math.pow(10, -B / A), c = 1 / A;
      const dec = { b: 2 };
      if (!_fmEindig(c)) dec.c = 2;
      const par = { a: 0, b, c, G: 10 };
      if (!_fmVeilig(par, dec) || b < 0.1 || b > 2000) continue;
      const opg = `${u} = ${A} \\cdot \\log(${v})${B < 0 ? ' - ' : ' + '}${Math.abs(B)}`;
      const teken = B < 0 ? '+' : '-';
      const cT = _Qtex(_Q(1, A)), rest = _Qtex(_Q(Math.abs(B), A));
      const doel = _fmDoel(0, b, `10^{${_mkT(c, dec.c)}${u}}`, dec);
      return _fmVraag('LOG.4b', `Werk de formule $${opg}$ om tot`,
        `${v} = b \\cdot 10^{c${u}}`, _fmRondTekst(Object.keys(dec), 2),
        { soort: 'exp', u, v, par, dec, testU: [1, 2, 3] }, _FM_HINTS_LOG,
        [opg, `${A} \\cdot \\log(${v}) = ${u} ${teken} ${Math.abs(B)}`,
         `\\log(${v}) = ${cT}${u} ${teken} ${rest}`,
         `${v} = 10^{${cT}${u} ${teken} ${rest}}`,
         `${v} = 10^{${cT}${u}} \\cdot 10^{${B < 0 ? '' : '-'}${rest}}`,
         `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
    }

    // u = B ± r · ᵍlog(C·v)  →  v = b · G^u, exact
    const g = pick([2, 3, 5]);
    const m = pick([1, 2, 2, 3]), s = pick([-1, -1, 1]);
    const B = rand(1, 3), C = pick([2, 3, 4, 5, 6].filter(n => n % g !== 0));
    const macht = s * m;
    if (Math.abs(macht * B) > 4 || Math.pow(g, m) > 125) continue;
    const G = _Qpow(_Q(g), macht), b = _Qdiv(_Qpow(_Q(g), -macht * B), _Q(C));
    if (_Qis(b, 1)) continue;
    const r = m === 1 ? '' : `${_Qtex(_Q(1, m))} \\cdot `;
    const L = _lgLog(g, `${C}${v}`);
    const rechts = `${B} ${s < 0 ? '-' : '+'} ${r}${L}`;
    const binnen = macht === -1 ? `${B} - ${u}` : _fmSom([[_Q(macht), u], [_Q(-macht * B), '']]);
    const machtU = macht === 1 ? `${g}^{${u}}` : `(${g}^{${macht}})^{${u}}`;
    const doel = `${_Qtex(b)} \\cdot ${_lgMacht(_Qtex(G), u)}`;
    return _fmVraag('LOG.4b', `Herleid de formule $${u} = ${rechts}$ tot`, `${v} = b \\cdot g^{${u}}`, '',
      { soort: 'exp', u, v, par: { a: 0, b: _Qval(b), c: 1, G: _Qval(G) }, dec: {}, testU: [1, 2, 3] }, _FM_HINTS_LOG,
      [`${u} = ${rechts}`,
       `${r}${L} = ${s < 0 ? `${B} - ${u}` : `${u} - ${B}`}`,
       `${L} = ${binnen}`,
       `${C}${v} = ${g}^{${binnen}}`,
       `${v} = ${_Qtex(_Q(1, C))} \\cdot ${_lgMachtKaal(g, -macht * B)} \\cdot ${machtU}`,
       `${v} = ${doel}`, `Dus $${v} = ${doel}$.`]);
  }
}

/* ── LOG.4c – exponentieel naar log met grondtal 10 ─────────────────────── */
function genLOG4c() {
  for (;;) {
    const [u, v] = pick(_FM_LETTERS);
    if (Math.random() < 0.5) {
      // u = A · h^(p·v + q)  →  v = a + b · log(u)
      const h = pick([1.2, 1.3, 1.5, 2, 3, 5]);
      const A = rand(2, 40), p = rand(2, 5), q = pick([-1, 1]) * rand(1, 5);
      const a = (-q - Math.log(A) / Math.log(h)) / p, b = 1 / (p * Math.log10(h));
      const dec = { a: 2, b: 2 };
      const par = { a, b, c: 1, h: 10 };
      if (!_fmVeilig(par, dec) || Math.abs(a) < 0.05) continue;
      const E = _fmLin(p, q, v);
      const eenA = `\\frac{1}{${A}}`;
      const voor = `${-q} + ${_lgLog(h, eenA)}`;
      const doel = _fmDoel(a, b, `\\log(${u})`, dec);
      return _fmVraag('LOG.4c', `Herleid de formule $${u} = ${A} \\cdot ${h}^{${E}}$ tot`, `${v} = a + b \\cdot \\log(${u})`,
        _fmRondTekst(['a', 'b'], 2),
        { soort: 'log', u, v, par, dec, testU: [A, 5 * A, 20 * A] }, _FM_HINTS_EXP,
        [..._fmExpBegin(u, A, h, E), `${E} = ${_lgLog(h, `${eenA}${u}`)}`,
         `${p}${v} = ${voor} + ${_lgLog(h, u)}`,
         `${p}${v} = ${voor} + \\frac{\\log(${u})}{\\log(${h})}`,
         `${v} = \\frac{${voor}}{${p}} + \\frac{\\log(${u})}{${p} \\cdot \\log(${h})}`,
         `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
    }

    // u = A · g^(r·v − s)  →  v = b · log(c·u), c is exact
    const g = pick([2, 3, 5]), r = pick([0.1, 0.2, 0.5]), s = rand(1, 4);
    const A = pick([2, 4, 5, 8, 10, 20, 25, 40, 50]);
    const c = Math.pow(g, s) / A;
    const b = 1 / (r * Math.log10(g));
    const dec = { b: 2 };
    const par = { a: 0, b, c, h: 10 };
    if (!_fmEindig(c) || c < 0.1 || c === 1 || !_fmVeilig(par, dec)) continue;
    const E = _fmLin(r, -s, v);
    const eenA = `\\frac{1}{${A}}`;
    const cu = `${_mkT(c)}${u}`;
    const doel = _fmDoel(0, b, `\\log(${cu})`, dec);
    return _fmVraag('LOG.4c', `Werk de formule $${u} = ${A} \\cdot ${g}^{${E}}$ om tot`, `${v} = b \\cdot \\log(c${u})`,
      _fmRondTekst(['b'], 2),
      { soort: 'log', u, v, par, dec, testU: [A, 5 * A, 20 * A] }, _FM_HINTS_EXP,
      [..._fmExpBegin(u, A, g, E), `${E} = ${_lgLog(g, `${eenA}${u}`)}`,
       `${r}${v} = ${s} + ${_lgLog(g, `${eenA}${u}`)}`,
       `${r}${v} = ${_lgLog(g, Math.pow(g, s))} + ${_lgLog(g, `${eenA}${u}`)}`,
       `${r}${v} = ${_lgLog(g, cu)}`,
       `${r}${v} = \\frac{\\log(${cu})}{\\log(${g})}`,
       `${v} = \\frac{${Math.round(1 / r)} \\cdot \\log(${cu})}{\\log(${g})}`,
       `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
  }
}

/* ── LOG.4d – logaritme naar a + b · 10^(c·u) of a + b · g^u ────────────── */
function genLOG4d() {
  for (;;) {
    const [v, u] = pick(_FM_LETTERS);
    const P = pick([2, 3, 4, 5]), Q0 = pick([-1, 1]) * rand(1, 9);
    if (gcd(P, Math.abs(Q0)) !== 1 && P !== Math.abs(Q0)) continue;
    const a = -Q0 / P;
    const arg = _fmLin(P, Q0, v);

    if (Math.random() < 0.5) {
      // ᵍlog(P·v + Q) = r·u + s  →  v = a + b · 10^(c·u), a en b exact
      const g = pick([2, 3, 5]), r = rand(2, 4), s = rand(1, 3);
      const Gr = Math.pow(g, r), gs = Math.pow(g, s);
      const b = gs / P, c = r * Math.log10(g);
      const dec = { c: 2 };
      const par = { a, b, c, G: 10 };
      if (Gr > 200 || !_fmEindig(a) || !_fmEindig(b) || !_fmVeilig(par, dec)) continue;
      const E = _fmLin(r, s, u);
      const cT = _mkT(c, 2);
      const doel = _fmDoel(a, b, `10^{${cT}${u}}`, dec);
      const som = tex => _fmSom([[_Q(-Q0), ''], [_Q(gs), tex]]);
      return _fmVraag('LOG.4d', `Schrijf de formule $${_lgLog(g, arg)} = ${E}$ in`, `${v} = a + b \\cdot 10^{c${u}}`,
        _fmRondTekst(['c'], 2),
        { soort: 'exp', u, v, par, dec, testU: [0.2, 0.5, 1] }, _FM_HINTS_LOG,
        [`${_lgLog(g, arg)} = ${E}`, `${arg} = ${g}^{${E}}`,
         `${P}${v} = ${som(`${Gr}^{${u}}`)}`,
         `${P}${v} = ${som(`(10^{\\log(${Gr})})^{${u}}`)}`,
         `${P}${v} \\approx ${som(`(10^{${cT}})^{${u}}`)}`,
         `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
    }

    // u = A · log(P·v + Q) + B  →  v = a + b · g^u, b en g afgerond
    const A = pick([2, 4, 5, 10, 25, 50, 100, 125]);
    const B = pick([-1, 1]) * rand(1, Math.min(20, A));
    if (B % A === 0 || !_fmEindig(a)) continue;
    const c0 = -B / A, G = Math.pow(10, 1 / A), b = Math.pow(10, c0) / P;
    const dec = { b: 3, G: 3 };
    const par = { a, b, c: 1, G };
    if (!_fmVeilig(par, dec) || b < 0.1 || b > 100) continue;
    const cT = _mkT(1 / A), rT = _mkT(Math.abs(c0));
    const teken = B < 0 ? '+' : '-';
    const doel = _fmDoel(a, b, `${_mkT(G, 3)}^{${u}}`, dec);
    const opg = `${u} = ${A} \\cdot \\log(${arg})${B < 0 ? ' - ' : ' + '}${Math.abs(B)}`;
    return _fmVraag('LOG.4d', `Schrijf de formule $${opg}$ in`, `${v} = a + b \\cdot g^{${u}}`,
      _fmRondTekst(['b', 'g'], 3),
      { soort: 'exp', u, v, par, dec, testU: [1, 2, 3] }, _FM_HINTS_LOG,
      [opg, `${A} \\cdot \\log(${arg}) = ${u} ${teken} ${Math.abs(B)}`,
       `\\log(${arg}) = ${cT}${u} ${teken} ${rT}`,
       `${arg} = 10^{${cT}${u} ${teken} ${rT}}`,
       `${P}${v} = ${_fmSom([[_Q(-Q0), '']])} + (10^{${cT}})^{${u}} \\cdot 10^{${c0 < 0 ? '-' : ''}${rT}}`,
       `${v} \\approx ${doel}`, `Dus $${v} = ${doel}$.`]);
  }
}
