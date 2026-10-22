/* ── Math Keyboard ───────────────────────────────────────────────────── */

/* Extra rij bij differentiëren. De ᵍlog-knop zet een macht zonder grondtal
   neer: daarin typ je het grondtal, en met → komt er log( achter. */
const KBD_RIJ_AFGELEIDE = `<div class="kbd-row">
      <button class="kbd-btn kbd-btn-op" data-val="EMACHT" aria-label="e-macht">e<sup>x</sup></button>
      <button class="kbd-btn kbd-btn-op" data-val="LN">ln</button>
      <button class="kbd-btn kbd-btn-op" data-val="GLOG" aria-label="Logaritme met grondtal"><sup>g</sup>log</button>
      <button class="kbd-btn kbd-btn-op" data-val="LOG">log</button>
    </div>`;

/* Extra rij bij meetkunde: sin, cos, tan en hun inverse, π, ∠ en °. */
const KBD_RIJ_MEETKUNDE = `<div class="kbd-row">
      <button class="kbd-btn kbd-btn-op" data-val="SIN">sin</button>
      <button class="kbd-btn kbd-btn-op" data-val="COS">cos</button>
      <button class="kbd-btn kbd-btn-op" data-val="TAN">tan</button>
      <button class="kbd-btn kbd-btn-op" data-val="PI" aria-label="pi">π</button>
      <button class="kbd-btn kbd-btn-op" data-val="HOEK" aria-label="Hoek">∠</button>
      <button class="kbd-btn kbd-btn-op" data-val="GRADEN" aria-label="Graden">°</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn kbd-btn-op" data-val="ASIN">sin<sup>−1</sup></button>
      <button class="kbd-btn kbd-btn-op" data-val="ACOS">cos<sup>−1</sup></button>
      <button class="kbd-btn kbd-btn-op" data-val="ATAN">tan<sup>−1</sup></button>
    </div>`;

function getKeyboardHTML(metAfgeleide = false, metMeetkunde = false) {
  return `<div id="math-keyboard" class="math-keyboard">
    ${metAfgeleide ? KBD_RIJ_AFGELEIDE : ''}
    ${metMeetkunde ? KBD_RIJ_MEETKUNDE : ''}
    <div class="kbd-row">
      <button class="kbd-btn" data-val="7">7</button>
      <button class="kbd-btn" data-val="8">8</button>
      <button class="kbd-btn" data-val="9">9</button>
      <button class="kbd-btn kbd-btn-op" data-val="+">+</button>
      <button class="kbd-btn kbd-btn-del" data-val="DEL">⌫</button>
      <button class="kbd-btn kbd-btn-op" data-val="SQRT">√</button>
      <button class="kbd-btn kbd-btn-op kbd-btn-macht" data-val="MACHT" aria-label="Macht">x<sup>n</sup></button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn" data-val="4">4</button>
      <button class="kbd-btn" data-val="5">5</button>
      <button class="kbd-btn" data-val="6">6</button>
      <button class="kbd-btn kbd-btn-op" data-val="-">−</button>
      <button class="kbd-btn kbd-btn-op" data-val="NEXT">→</button>
      <button class="kbd-btn kbd-btn-op" data-val="NTHROOT">ⁿ√</button>
      <button class="kbd-btn kbd-btn-op kbd-btn-macht" data-val="KWADRAAT" aria-label="Kwadraat">x<sup>2</sup></button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn" data-val="1">1</button>
      <button class="kbd-btn" data-val="2">2</button>
      <button class="kbd-btn" data-val="3">3</button>
      <button class="kbd-btn kbd-btn-op" data-val="TIMES">×</button>
      <button class="kbd-btn kbd-btn-op" data-val=":">:</button>
      <button class="kbd-btn kbd-btn-op" data-val="v">v</button>
      <button class="kbd-btn kbd-btn-op" data-val="VORIGE" aria-label="Vorige regel kopiëren">↑</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn kbd-btn-breed" data-val="0">0</button>
      <button class="kbd-btn" data-val=",">,</button>
      <button class="kbd-btn kbd-btn-frac" data-val="FRAC">a/b</button>
      <button class="kbd-btn kbd-btn-mixed" data-val="MIXED">1 a/b</button>
      <button class="kbd-btn kbd-btn-clear" data-val="CLR">C</button>
      <button class="kbd-btn kbd-btn-op" data-val="(">(</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn kbd-btn-op kbd-btn-breed" data-val="=">=</button>
      <button class="kbd-btn kbd-btn-op" data-val="<">&lt;</button>
      <button class="kbd-btn kbd-btn-op" data-val=">">&gt;</button>
      <button class="kbd-btn kbd-btn-op" data-val="LE">≤</button>
      <button class="kbd-btn kbd-btn-op" data-val="GE">≥</button>
      <button class="kbd-btn kbd-btn-op" data-val=")">)</button>
    </div>
  </div>`;
}

function bindKeyboardHandlers() {
  const kbd = document.getElementById('math-keyboard');
  if (!kbd) return;

  kbd.addEventListener('mousedown', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (btn) handleKbdKey(btn.dataset.val);
  });

  kbd.addEventListener('touchstart', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (btn) handleKbdKey(btn.dataset.val);
  }, { passive: false });
}

function handleKbdKey(val) {
  const mq = window.APP?.activeMQField;
  if (!mq) return;
  switch (val) {
    case 'DEL':   mq.keystroke('Backspace'); break;
    case 'CLR':   mq.latex(''); mq.focus(); break;
    case 'NEXT':  mq.keystroke('Right'); sluitLogGrondtal(mq); break;
    case 'EMACHT': mq.typedText('e'); mq.cmd('^'); break;
    case 'LN':     mq.typedText('ln('); break;
    case 'LOG':    mq.typedText('log('); break;
    case 'GLOG':   mq.cmd('^'); APP.logGrondtal = true; break;
    case 'SIN': case 'COS': case 'TAN':
      mq.typedText(`${val.toLowerCase()}(`); break;
    // De inverse: sin, dan de exponent -1, uit de exponent stappen en haakje.
    case 'ASIN': case 'ACOS': case 'ATAN':
      mq.typedText(val.slice(1).toLowerCase()); mq.cmd('^'); mq.typedText('-1');
      mq.keystroke('Right'); mq.typedText('('); break;
    case 'PI':     mq.cmd('\\pi'); break;
    case 'HOEK':   mq.cmd('\\angle'); break;
    case 'GRADEN': mq.cmd('^'); mq.cmd('\\circ'); mq.keystroke('Right'); break;
    case 'FRAC':  mq.typedText('/'); break;
    // Bij een verhouding hoort een echte dubbele punt (3 : 4). Overal elders is
    // deze toets het deelteken en levert hij, net als a/b, een breukstreep op.
    case ':':
      mq.typedText(APP.huidigVraag?.antwoordType === 'ratio' ? ':' : '/');
      break;
    case 'MIXED': mq.cmd('\\frac'); break;
    case '+':     mq.typedText('+'); break;
    case '-':     mq.typedText('-'); break;
    case 'TIMES': mq.cmd('\\times'); break;
    case 'LE':     mq.cmd('\\le'); break;
    case 'GE':     mq.cmd('\\ge'); break;
    case 'SQRT':   mq.cmd('\\sqrt'); break;
    case 'NTHROOT': mq.cmd('\\nthroot'); break;
    // De cursor blijft ín de exponent staan; met → stap je eruit. Bij het
    // kwadraat doen we dat meteen zelf, want daar valt niets meer te typen.
    case 'MACHT':    mq.cmd('^'); break;
    case 'KWADRAAT': mq.cmd('^'); mq.typedText('2'); mq.keystroke('Right'); break;
    case 'VORIGE': {
      const vorige = APP.stappen?.length ? APP.stappen[APP.stappen.length - 1].latex : null;
      if (vorige) mq.latex(vorige);
      break;
    }

    case '(':      mq.typedText('('); break;
    case ')':      mq.typedText(')'); break;
    case 'v':     mq.write('\\quad v\\quad'); break;
    default:      mq.typedText(val); break;
  }
}

/* Na de ᵍlog-knop staat de cursor in het grondtal. Stapt de leerling daar met
   → uit, dan volgt log( vanzelf. Geeft true als dat gebeurde. */
function sluitLogGrondtal(mq) {
  if (!APP.logGrondtal) return false;
  APP.logGrondtal = false;
  mq.typedText('log(');
  return true;
}

function initMathKeyboard() {
  window.showKbd = () => {};
  window.hideKbd = () => {};
}
