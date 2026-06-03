/* ── Utilities ───────────────────────────────────────────────────────────── */

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Math Utilities ────────────────────────────────────────────────────── */

function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

function simplifyFrac(n, d) {
  if (d === 0) return [0, 1];
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}

function fracEqual(n1, d1, n2, d2) {
  const [a, b] = simplifyFrac(n1, d1);
  const [c, d] = simplifyFrac(n2, d2);
  return a === c && b === d;
}

function mixedToImproper(w, n, d) {
  return [w * d + n, d];
}

function improperToMixed(n, d) {
  const w = Math.floor(n / d);
  return [w, n - w * d, d];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function decimalToFrac(d) {
  const str = d.toString();
  const decimals = (str.split('.')[1] || '').length;
  const den = Math.pow(10, decimals);
  const num = Math.round(d * den);
  return simplifyFrac(num, den);
}

function renderKatex(element) {
  if (!element) element = document.body;
  if (typeof renderMathInElement === 'undefined') return;
  renderMathInElement(element, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });
}

/* Format a fraction for display in KaTeX */
function fmtFrac(n, d) {
  return `\\dfrac{${n}}{${d}}`;
}

function fmtMixed(w, n, d) {
  if (n === 0) return `${w}`;
  if (w === 0) return `\\dfrac{${n}}{${d}}`;
  return `${w}\\dfrac{${n}}{${d}}`;
}

/* ── Number Line SVG Helper ──────────────────────────────────────────── */
function maakGetallenlijnSVG(num, den, showArrow) {
  const W = 340, H = 80;
  const x0 = 24, x1 = 316;
  const lineY = 44;
  const arrowX = x0 + (x1 - x0) * (num / den);

  let ticks = '';
  for (let i = 1; i < den; i++) {
    const tx = x0 + (x1 - x0) * (i / den);
    const label = i + '/' + den;
    ticks += `<line x1="${tx.toFixed(1)}" y1="${(lineY - 7).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${(lineY + 7).toFixed(1)}" stroke="#1A3A5C" stroke-width="1.5"/>`;
    ticks += `<text x="${tx.toFixed(1)}" y="${(lineY + 20).toFixed(1)}" text-anchor="middle" font-size="10" fill="#4A5568">${label}</text>`;
  }

  let arrowSVG = '';
  if (showArrow) {
    arrowSVG = `<line x1="${arrowX.toFixed(1)}" y1="${(lineY - 30).toFixed(1)}" x2="${arrowX.toFixed(1)}" y2="${(lineY - 6).toFixed(1)}" stroke="#C62828" stroke-width="2.5" marker-end="url(#arrowhead)"/>`;
  }

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto;">
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="#C62828"/>
      </marker>
    </defs>
    <line x1="${x0}" y1="${lineY}" x2="${x1}" y2="${lineY}" stroke="#1A3A5C" stroke-width="2"/>
    <line x1="${x0}" y1="${lineY - 10}" x2="${x0}" y2="${lineY + 10}" stroke="#1A3A5C" stroke-width="2.5"/>
    <line x1="${x1}" y1="${lineY - 10}" x2="${x1}" y2="${lineY + 10}" stroke="#1A3A5C" stroke-width="2.5"/>
    <text x="${x0}" y="${lineY + 20}" text-anchor="middle" font-size="12" font-weight="700" fill="#1A2332">0</text>
    <text x="${x1}" y="${lineY + 20}" text-anchor="middle" font-size="12" font-weight="700" fill="#1A2332">1</text>
    ${ticks}
    ${arrowSVG}
  </svg>`;
}

/* ── LaTeX Expression Evaluator ────────────────────────────────────────────────── */

function tokenizeFracLatex(s) {
  const tokens = [];
  let i = 0;

  function readBlock() {
    if (s[i] !== '{') return '';
    let depth = 0, j = i;
    while (j < s.length) {
      if (s[j] === '{') depth++;
      else if (s[j] === '}') { if (--depth === 0) break; }
      j++;
    }
    const content = s.slice(i + 1, j);
    i = j + 1;
    return content;
  }

  while (i < s.length) {
    if (/[\s ]/.test(s[i])) { i++; continue; }

    if (s[i] === '\\') {
      i++;
      let cmd = '';
      while (i < s.length && /[a-zA-Z]/.test(s[i])) cmd += s[i++];

      if (cmd === 'frac') {
        const nb = readBlock(), db = readBlock();
        const nv = evaluateLatex(nb), dv = evaluateLatex(db);
        const prev = tokens[tokens.length - 1];
        if (prev && prev.t === 'n') {
          tokens.pop();
          tokens.push({ t: 'v', v: prev.v + (dv ? nv / dv : 0) });
        } else {
          tokens.push({ t: 'v', v: dv ? nv / dv : 0 });
        }
      } else if (cmd === 'sqrt') {
        const ab = readBlock();
        tokens.push({ t: 'v', v: Math.sqrt(Math.max(0, evaluateLatex(ab) ?? 0)) });
      } else if (cmd === 'cdot' || cmd === 'times') {
        tokens.push({ t: 'op', v: '*' });
      } else if (cmd === 'div') {
        tokens.push({ t: 'op', v: '/' });
      } else if (cmd === 'left') {
        if (i < s.length) { i++; tokens.push({ t: 'lp' }); }
      } else if (cmd === 'right') {
        if (i < s.length) { i++; tokens.push({ t: 'rp' }); }
      }
      continue;
    }

    if (/\d/.test(s[i])) {
      let n = '';
      while (i < s.length && /\d/.test(s[i])) n += s[i++];
      if (i < s.length && (s[i] === '.' || s[i] === ',')) {
        n += '.'; i++;
        while (i < s.length && /\d/.test(s[i])) n += s[i++];
      }
      tokens.push({ t: 'n', v: parseFloat(n) });
      continue;
    }

    const ch = s[i++];
    if (ch === '+') tokens.push({ t: 'op', v: '+' });
    else if (ch === '-') tokens.push({ t: 'op', v: '-' });
    else if (ch === '*') tokens.push({ t: 'op', v: '*' });
    else if (ch === '/') tokens.push({ t: 'op', v: '/' });
    else if (ch === ':') tokens.push({ t: 'op', v: ':' });
    else if (ch === '(') tokens.push({ t: 'lp' });
    else if (ch === ')') tokens.push({ t: 'rp' });
  }

  return tokens;
}

function evaluateLatex(latex) {
  if (latex === null || latex === undefined) return null;
  const s = latex.trim();
  if (!s) return null;
  try {
    const tokens = tokenizeFracLatex(s);
    if (!tokens.length) return null;
    let pos = 0;

    const eat = fn => (pos < tokens.length && fn(tokens[pos])) ? tokens[pos++] : null;

    function parseExpr() {
      let l = parseTerm();
      let op;
      while ((op = eat(t => t.t === 'op' && (t.v === '+' || t.v === '-')))) {
        l = op.v === '+' ? l + parseTerm() : l - parseTerm();
      }
      return l;
    }

    function parseTerm() {
      let l = parseAtom();
      let op;
      while ((op = eat(t => t.t === 'op' && (t.v === '*' || t.v === '/' || t.v === ':')))) {
        const r = parseAtom();
        l = op.v === '*' ? l * r : l / r;
      }
      return l;
    }

    function parseAtom() {
      if (eat(t => t.t === 'op' && t.v === '-')) return -parseAtom();
      if (eat(t => t.t === 'lp')) {
        const v = parseExpr();
        eat(t => t.t === 'rp');
        return v;
      }
      const tok = eat(t => t.t === 'v' || t.t === 'n');
      if (tok) return tok.v;
      throw new Error('unexpected');
    }

    const result = parseExpr();
    return isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function isEindvorm(latex) {
  const s = (latex || '').trim();
  if (!s) return false;
  if (/[+]|(?<![\\])[-]|\\cdot|\\times|\\div|\\sqrt/.test(s)) return false;
  if (/^\d+$/.test(s)) return true;
  if (/^\d+[.,]\d+$/.test(s)) return true;
  const ratioM = s.match(/^(\d+):(\d+)$/);
  if (ratioM) return gcd(+ratioM[1], +ratioM[2]) === 1;
  const mixedM = s.match(/^(\d+)\\frac\{(\d+)\}\{(\d+)\}$/);
  if (mixedM) {
    const [, , n, d] = mixedM.map(Number);
    return n > 0 && d > n && gcd(n, d) === 1;
  }
  const fracM = s.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
  if (fracM) {
    const [, n, d] = fracM.map(Number);
    return d > 0 && gcd(n, d) === 1;
  }
  return false;
}

function parseSingleFracFromLatex(latex) {
  const m = (latex || '').trim().match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
  return m ? { n: parseInt(m[1]), d: parseInt(m[2]) } : null;
}

function correcteWaarde(vraag) {
  const { antwoordType: type, antwoord: a } = vraag;
  if (type === 'fraction')   return a.teller / a.noemer;
  if (type === 'mixed')      return a.geheel + a.teller / a.noemer;
  if (type === 'integer')    return a.waarde;
  if (type === 'decimal')    return a.waarde;
  if (type === 'percentage') return a.waarde;
  if (type === 'ratio')      return a.deel1 / a.deel2;
  return null;
}
