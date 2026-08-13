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
    ticks += `<line x1="${tx.toFixed(1)}" y1="${(lineY - 7).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${(lineY + 7).toFixed(1)}" stroke="#1A3A5C" stroke-width="1.5"/>`;
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
  if (/^\d+$/.test(s)) return true;
  if (/^-\d+$/.test(s)) return true; // negatief geheel getal
  if (/[+]|(?<![\\])[-]|\\cdot|\\times|\\div|\\sqrt/.test(s)) return false;
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

/* ── Algebra Utilities ─────────────────────────────────────────────── */

function _algTokenize(s, varVals) {
  const tokens = [];
  let i = 0;

  function readBlock() {
    if (s[i] !== '{') return i < s.length ? s[i++] : '';
    let depth = 0, j = i;
    while (j < s.length) {
      if (s[j] === '{') depth++;
      else if (s[j] === '}') { if (--depth === 0) break; }
      j++;
    }
    const c = s.slice(i + 1, j); i = j + 1; return c;
  }

  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    const prev = tokens[tokens.length - 1];
    const needsMul = prev && (prev.t === 'n' || prev.t === 'v' || prev.t === 'rp');

    if (s[i] === '^') {
      i++;
      const exp = readBlock();
      const expVal = _algEval(exp, varVals);
      const base = tokens.pop();
      tokens.push({ t: 'v', v: base ? Math.pow(base.v, expVal) : 1 });
      continue;
    }

    if (s[i] === '\\') {
      i++;
      let cmd = '';
      while (i < s.length && /[a-zA-Z]/.test(s[i])) cmd += s[i++];
      if (cmd === 'frac' || cmd === 'dfrac') {
        if (needsMul) tokens.push({ t: 'op', v: '*' });
        const nb = readBlock(), db = readBlock();
        const dv = _algEval(db, varVals);
        tokens.push({ t: 'v', v: dv ? _algEval(nb, varVals) / dv : 0 });
      } else if (cmd === 'cdot' || cmd === 'times') {
        tokens.push({ t: 'op', v: '*' });
      } else if (cmd === 'div')   { tokens.push({ t: 'op', v: '/' }); }
      else if (cmd === 'left')   { if (i < s.length) { i++; if (needsMul) tokens.push({t:'op',v:'*'}); tokens.push({t:'lp'}); } }
      else if (cmd === 'right')  { if (i < s.length) { i++; tokens.push({t:'rp'}); } }
      else if (cmd === 'sqrt')   {
        if (needsMul) tokens.push({t:'op',v:'*'});
        const ab = readBlock();
        tokens.push({ t: 'v', v: Math.sqrt(Math.max(0, _algEval(ab, varVals))) });
      }
      continue;
    }

    if (/\d/.test(s[i])) {
      if (needsMul) tokens.push({ t: 'op', v: '*' });
      let n = '';
      while (i < s.length && /\d/.test(s[i])) n += s[i++];
      if (i < s.length && (s[i] === '.' || s[i] === ',')) { n += '.'; i++; while (i < s.length && /\d/.test(s[i])) n += s[i++]; }
      tokens.push({ t: 'n', v: parseFloat(n) });
      continue;
    }

    if (/[a-zA-Z]/.test(s[i])) {
      let first = true;
      while (i < s.length && /[a-zA-Z]/.test(s[i])) {
        const vname = s[i++];
        if (!first || needsMul) tokens.push({ t: 'op', v: '*' });
        first = false;
        tokens.push({ t: 'v', v: (varVals && varVals[vname] !== undefined) ? varVals[vname] : NaN });
      }
      continue;
    }

    const ch = s[i++];
    if (ch === '+') tokens.push({ t: 'op', v: '+' });
    else if (ch === '-') tokens.push({ t: 'op', v: '-' });
    else if (ch === '*') tokens.push({ t: 'op', v: '*' });
    else if (ch === '/') tokens.push({ t: 'op', v: '/' });
    else if (ch === '(') { if (needsMul) tokens.push({t:'op',v:'*'}); tokens.push({ t: 'lp' }); }
    else if (ch === ')') tokens.push({ t: 'rp' });
  }
  return tokens;
}

function _algEval(latex, varVals) {
  const s = (latex || '').trim();
  if (!s) return NaN;
  try {
    const tokens = _algTokenize(s, varVals);
    if (!tokens.length) return NaN;
    let pos = 0;
    const eat = fn => (pos < tokens.length && fn(tokens[pos])) ? tokens[pos++] : null;
    function expr() {
      let l = term(); let op;
      while ((op = eat(t => t.t === 'op' && (t.v === '+' || t.v === '-'))))
        l = op.v === '+' ? l + term() : l - term();
      return l;
    }
    function term() {
      let l = atom(); let op;
      while ((op = eat(t => t.t === 'op' && (t.v === '*' || t.v === '/'))))
        l = op.v === '*' ? l * atom() : l / atom();
      return l;
    }
    function atom() {
      if (eat(t => t.t === 'op' && t.v === '-')) return -atom();
      if (eat(t => t.t === 'lp')) { const v = expr(); eat(t => t.t === 'rp'); return v; }
      const tok = eat(t => t.t === 'v' || t.t === 'n');
      if (tok) return tok.v;
      throw new Error('?');
    }
    const r = expr();
    return isFinite(r) ? r : NaN;
  } catch { return NaN; }
}

function _algSplitTermen(latex) {
  const s = (latex || '').replace(/\s+/g, '');
  const terms = []; let cur = ''; let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '{' || c === '(') depth++;
    else if (c === '}' || c === ')') depth--;
    else if (depth === 0 && (c === '+' || c === '-') && i > 0) { if (cur) terms.push(cur); cur = c; continue; }
    cur += c;
  }
  if (cur) terms.push(cur);
  return terms.length ? terms : [latex];
}

function _algVarDeel(term) {
  let s = term.replace(/^[+\-]/, '').replace(/^\d+\.?\d*\*?/, '');
  const pieces = []; const re = /([a-zA-Z])(?:\^\{(\d+)\}|\^(\d+))?/g; let m;
  while ((m = re.exec(s)) !== null) {
    const p = m[2] || m[3] || '1';
    pieces.push(m[1] + (p !== '1' ? p : ''));
  }
  pieces.sort(); return pieces.join('');
}

function isAlgebraVereenvoudigd(latex) {
  const s = (latex || '').trim();
  if (!s) return false;
  if (/\\cdot|\\times/.test(s)) return false;
  if (/\d\*/.test(s)) return false;
  const terms = _algSplitTermen(s);
  // Reject explicit coefficient 1 before a variable (e.g. '1b' instead of 'b', '-1x' instead of '-x')
  for (const t of terms) {
    if (/^[+\-]?1[a-zA-Z]/.test(t.replace(/\s+/g, ''))) return false;
  }
  const seen = new Set();
  for (const t of terms) {
    // Reject repeated variable letters within one term (e.g. 'mm' instead of 'm^{2}')
    const ts = t.replace(/^[+\-]/, '').replace(/^\d+\.?\d*\*?/, '');
    const lc = {}; const re2 = /([a-zA-Z])(?:\^\{?\d+\}?)?/g; let m2;
    while ((m2 = re2.exec(ts)) !== null) {
      lc[m2[1]] = (lc[m2[1]] || 0) + 1;
      if (lc[m2[1]] > 1) return false;
    }
    const vd = _algVarDeel(t);
    if (seen.has(vd)) return false;
    seen.add(vd);
  }
  return true;
}

function checkAlgebraAntwoord(gegeven, verwacht, vars) {
  const sets = [[2,3,5],[3,5,7],[5,7,11]];
  for (const vals of sets) {
    const vv = {}; vars.forEach((v, i) => { vv[v] = vals[i % vals.length]; });
    const g = _algEval(gegeven, vv), e = _algEval(verwacht, vv);
    if (!isFinite(g) || !isFinite(e) || Math.abs(g - e) > 1e-6) return 'fout';
  }
  return isAlgebraVereenvoudigd(gegeven) ? 'goed' : 'tussenstap';
}

function correcteWaarde(vraag) {
  const { antwoordType: type, antwoord: a } = vraag;
  if (type === 'fraction')   return a.teller / a.noemer;
  if (type === 'mixed')      return a.geheel + a.teller / a.noemer;
  if (type === 'integer')    return a.waarde;
  if (type === 'decimal')    return a.waarde;
  if (type === 'percentage') return a.waarde;
  if (type === 'ratio')      return a.deel1 / a.deel2;
  if (type === 'kruistabel') return a.waarde;
  return null;
}
