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
      <button class="kbd-btn kbd-btn-clear" data-val="CLR">C</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn" data-val="1">1</button>
      <button class="kbd-btn" data-val="2">2</button>
      <button class="kbd-btn" data-val="3">3</button>
      <button class="kbd-btn kbd-btn-next" data-val="NEXT">→</button>
    </div>
    <div class="kbd-row">
      <button class="kbd-btn kbd-btn-zero" data-val="0">0</button>
      <button class="kbd-btn" data-val=",">,</button>
      <button class="kbd-btn" data-val="NEG">±</button>
    </div>
  `;
  document.body.appendChild(kbd);

  let activeInput = null;

  function getAllMathInputs() {
    return [...document.querySelectorAll('input.math-input, input.math-input-lg, input.math-input-single')];
  }

  document.addEventListener('focusin', e => {
    if (e.target.matches('input.math-input, input.math-input-lg, input.math-input-single')) {
      activeInput = e.target;
      kbd.classList.add('visible');
    }
  });

  document.addEventListener('focusout', () => {
    setTimeout(() => {
      const focused = document.activeElement;
      if (!kbd.contains(focused) &&
          !focused.matches('input.math-input, input.math-input-lg, input.math-input-single')) {
        kbd.classList.remove('visible');
        activeInput = null;
      }
    }, 200);
  });

  kbd.addEventListener('mousedown', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (!btn) return;
    const val = btn.dataset.val;
    handleKey(val);
  });

  kbd.addEventListener('touchstart', e => {
    e.preventDefault();
    const btn = e.target.closest('.kbd-btn');
    if (!btn) return;
    const val = btn.dataset.val;
    handleKey(val);
  }, { passive: false });

  function handleKey(val) {
    if (!activeInput) return;

    if (val === 'DEL') {
      activeInput.value = activeInput.value.slice(0, -1);
    } else if (val === 'CLR') {
      activeInput.value = '';
    } else if (val === 'NEXT') {
      const inputs = getAllMathInputs();
      const idx = inputs.indexOf(activeInput);
      if (idx < inputs.length - 1) {
        inputs[idx + 1].focus();
        return;
      }
    } else if (val === 'NEG') {
      if (activeInput.value.startsWith('-')) {
        activeInput.value = activeInput.value.slice(1);
      } else {
        activeInput.value = '-' + activeInput.value;
      }
    } else {
      if (activeInput.value.length < 5) {
        activeInput.value += val;
      }
    }
    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
