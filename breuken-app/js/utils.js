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
