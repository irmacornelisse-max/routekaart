/* ── Math Keyboard ───────────────────────────────────────────────────── */

function getKeyboardHTML() {
  return `<div id="math-keyboard" class="math-keyboard">
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
    case 'NEXT':  mq.keystroke('Right'); break;
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

function initMathKeyboard() {
  window.showKbd = () => {};
  window.hideKbd = () => {};
}
