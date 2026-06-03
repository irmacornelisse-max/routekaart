/* ── Math Keyboard ───────────────────────────────────────────────────── */

function initMathKeyboard() {
  const kbd = document.createElement('div');
  kbd.id = 'math-keyboard';
  kbd.className = 'math-keyboard';
  // Layout: numbers + operators needed for free-text fraction input
  // Students type e.g. "3/4", "1 3/4", "2:3", "0,75"
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
      <button class="kbd-btn kbd-btn-op" data-val="/">/</button>
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
      <button class="kbd-btn kbd-btn-op" data-val="SPC">␣</button>
      <button class="kbd-btn kbd-btn-clear" data-val="CLR">C</button>
    </div>
  `;
  document.body.appendChild(kbd);

  let activeInput = null;

  const INPUT_SEL = 'input.math-input, input.math-input-single';

  document.addEventListener('focusin', e => {
    if (e.target.matches(INPUT_SEL)) {
      activeInput = e.target;
      kbd.classList.add('visible');
    }
  });

  document.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!kbd.contains(document.activeElement) &&
          !document.activeElement.matches(INPUT_SEL)) {
        kbd.classList.remove('visible');
        activeInput = null;
      }
    }, 200);
  });

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
    if (!activeInput) return;
    const max = 20; // allow longer strings for "1 3/4" type input
    if (val === 'DEL') {
      activeInput.value = activeInput.value.slice(0, -1);
    } else if (val === 'CLR') {
      activeInput.value = '';
    } else if (val === 'SPC') {
      if (activeInput.value.length < max && !activeInput.value.endsWith(' '))
        activeInput.value += ' ';
    } else {
      if (activeInput.value.length < max) activeInput.value += val;
    }
    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
