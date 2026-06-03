/* ── Math Keyboard ───────────────────────────────────────────────────── */

function initMathKeyboard() {
  const kbd = document.createElement('div');
  kbd.id = 'math-keyboard';
  kbd.className = 'math-keyboard';
  kbd.innerHTML = `
    <div class="kbd-row">
      <button class="kbd-btn" data-val="7">7</button>
      <button class="kbd-btn" data-val="8">8</button>
      <button class="kbd-btn" data-val="9">9</button>
      <button class="kbd-btn kbd-btn-del" data-val="DEL">⌫</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn" data-val="4">4</button>
      <button class="kbd-btn" data-val="5">5</button>
      <button class="kbd-btn" data-val="6">6</button>
      <button class="kbd-btn kbd-btn-op" data-val="NEXT">→</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn" data-val="1">1</button>
      <button class="kbd-btn" data-val="2">2</button>
      <button class="kbd-btn" data-val="3">3</button>
      <button class="kbd-btn kbd-btn-op" data-val=":">:</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn kbd-btn-zero" data-val="0">0</button>
      <button class="kbd-btn" data-val=",">,</button>
      <button class="kbd-btn kbd-btn-frac" data-val="FRAC">a/b</button>
      <button class="kbd-btn kbd-btn-clear" data-val="CLR">C</button>
    </div>
  `;
  document.body.appendChild(kbd);

  window.showKbd = () => kbd.classList.add('visible');
  window.hideKbd = () => kbd.classList.remove('visible');

  kbd.addEventListener('mousedown', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (btn) handleKey(btn.dataset.val);
  });

  kbd.addEventListener('touchstart', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (btn) handleKey(btn.dataset.val);
  }, { passive: false });

  function handleKey(val) {
    const mq = window.APP?.activeMQField;
    if (!mq) return;
    switch (val) {
      case 'DEL':  mq.keystroke('Backspace'); break;
      case 'CLR':  mq.latex(''); mq.focus(); break;
      case 'NEXT': mq.keystroke('Right'); break;
      case 'FRAC': mq.typedText('/'); break;
      default:     mq.typedText(val); break;
    }
  }
}
