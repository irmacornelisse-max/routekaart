/* ── App State ───────────────────────────────────────────────────────────── */
const APP = {
  student: null,
  huidigLeerdoel: null,
  huidigVraag: null,
  hintIdx: 0,
  pogingen: 0,
  opgaveNr: 1,
  nlMarkerPos: null,
  mcKeuze: null,
  mqField1: null,
  mqField2: null,
  activeMQField: null,
  stappen: [],
  resultaatOpgeslagen: false,
};
window.APP = APP;

function dotKlasse(r) {
  if (r.staat === 'goed') return 'dot-goed';
  if (r.staat === 'goed_na_fouten') return 'dot-geel';
  if (r.goed) return 'dot-goed';
  return 'dot-fout';
}

function maakVoortgangDots(resultaten, leerdoelId) {
  const last5 = resultaten.filter(r => r.leerdoel === leerdoelId).slice(-5);
  return last5.map(r => `<span class="voortgang-dot ${dotKlasse(r)}"></span>`).join('')
    + Array(Math.max(0, 5 - last5.length)).fill('<span class="voortgang-dot"></span>').join('');
}

/* ── Routing ─────────────────────────────────────────────────────────────── */
function route() {
  const hash = window.location.hash || '#login';
  const [page, param] = hash.slice(1).split('/');

  APP.student = getHuidigeStudent();

  if (page !== 'login' && page !== 'docent' && !APP.student) {
    window.location.hash = '#login';
    return;
  }

  const app = document.getElementById('app');
  switch (page) {
    case 'login':      app.innerHTML = renderLogin();      break;
    case 'dashboard':  app.innerHTML = renderDashboard();  break;
    case 'oefenen':    app.innerHTML = renderOefenen(param); break;
    case 'resultaten': app.innerHTML = renderResultaten(); break;
    case 'docent':     app.innerHTML = renderDocent();     break;
    default:           app.innerHTML = renderLogin();
  }

  renderKatex(app);
  bindEvents(page, param);
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => { initMathKeyboard(); route(); });

/* ── Header ──────────────────────────────────────────────────────────────── */
function header(title, backHash, rightHTML = '') {
  const back = backHash
    ? `<button class="btn-header btn-header-back" onclick="window.location.hash='${backHash}'">&#8592;</button>`
    : '';
  return `<header class="app-header">
    <div style="display:flex;align-items:center;gap:10px;min-width:60px">
      ${back}
      <span class="header-logo"><span class="logo-x">X</span><span class="logo-rest">plore</span></span>
    </div>
    <div class="header-title">${title}</div>
    <div class="header-right" style="min-width:60px">${rightHTML}</div>
  </header>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════════════════ */
function renderLogin() {
  return `<div class="login-page">
    <div class="login-card fade-in">
      <div class="login-logo">
        <span class="logo-big"><span class="logo-x">X</span><span class="logo-rest">plore</span></span>
      </div>
      <p class="login-subtitle">Oefenen met breuken</p>
      <div class="form-group">
        <label class="form-label" for="inp-naam">Jouw naam</label>
        <input class="form-input" id="inp-naam" type="text" placeholder="Voornaam" autocomplete="given-name"/>
      </div>
      <button class="btn btn-primary btn-block btn-lg" id="btn-login">Inloggen</button>
      <div class="login-teacher-link mt-12">
        <a href="#docent">Docentenomgeving →</a>
      </div>
    </div>
  </div>`;
}

function bindLogin() {
  const btn = document.getElementById('btn-login');
  const inp = document.getElementById('inp-naam');
  btn.addEventListener('click', () => {
    const naam = inp.value.trim();
    if (!naam) { inp.focus(); return; }
    APP.student = registreerStudent(naam);
    window.location.hash = '#dashboard';
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const resultaten = getResultatenVoorStudent(APP.student.id);

  function getStats(id) {
    const r = resultaten.filter(x => x.leerdoel === id);
    return { totaal: r.length, goed: r.filter(x => x.goed).length };
  }

  function statusClass(s) {
    if (s.totaal === 0) return '';
    return s.goed / s.totaal >= 0.7 ? 'goed' : 'started';
  }

  function maakDots(id) { return maakVoortgangDots(resultaten, id); }

  const groepen = [...new Set(LEERDOELEN.map(l => l.groep))];
  let html = `${header('Oefenen met breuken', '',
    `<button class="btn-header" onclick="doUitloggen()">Uitloggen</button>`)}
  <div class="main-content">
    <div class="dashboard-welcome">
      <div>
        <div class="welcome-name">👋 Hallo, ${APP.student.naam}!</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="window.location.hash='#resultaten'">📊 Mijn resultaten</button>
    </div>`;

  groepen.forEach(groep => {
    html += `<div class="groep-header">${groep}</div><div class="leerdoel-grid">`;
    LEERDOELEN.filter(l => l.groep === groep).forEach(ld => {
      const s = getStats(ld.id);
      const sc = statusClass(s);
      const dots = maakDots(ld.id);
      html += `<div class="leerdoel-card" onclick="window.location.hash='#oefenen/${ld.id}'">
        <div class="leerdoel-top">
          <span class="leerdoel-badge">${ld.id}</span>
          <span class="badge-status ${sc}" style="margin-left:auto"></span>
        </div>
        <div class="leerdoel-titel">${ld.titel}</div>
        <div class="leerdoel-voortgang">
          <div class="voortgang-dots">${dots}</div>
          <span class="voortgang-label">${s.goed}/${s.totaal}</span>
        </div>
      </div>`;
    });
    html += `</div>`;
  });

  html += `</div><div id="deel-modal" style="display:none"></div>`;
  return html;
}

function doUitloggen() { uitloggen(); window.location.hash = '#login'; }

/* ═══════════════════════════════════════════════════════════════════════════
   OEFENEN
═══════════════════════════════════════════════════════════════════════════ */
function renderOefenen(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld) return renderDashboard();

  if (APP.huidigLeerdoel !== leerdoelId) {
    APP.huidigLeerdoel = leerdoelId;
    APP.huidigVraag = null;
    APP.hintIdx = 0;
    APP.pogingen = 0;
    APP.opgaveNr = 1;
    APP.nlMarkerPos = null;
    APP.mcKeuze = null;
    APP.stappen = [];
    APP.resultaatOpgeslagen = false;
  }
  if (!APP.huidigVraag) APP.huidigVraag = generateVraag(leerdoelId);

  const resultaten = getResultatenVoorStudent(APP.student.id);
  const dots = maakVoortgangDots(resultaten, leerdoelId);

  const vraag = APP.huidigVraag;
  const type = vraag.antwoordType;
  const useStepList = type !== 'mc' && type !== 'drag' && type !== 'two-fracs';
  const needsKbd = useStepList || type === 'two-fracs';

  let antwoordInhoud = '';
  if (type === 'two-fracs') {
    antwoordInhoud = `<div class="two-mq-wrap" style="padding:10px 14px 4px">
      <div>
        <div class="two-mq-label">Eerste breuk:</div>
        <div class="mq-field-box" id="mq-input1"></div>
      </div>
      <div>
        <div class="two-mq-label">Tweede breuk:</div>
        <div class="mq-field-box" id="mq-input2"></div>
      </div>
    </div>`;
  } else if (useStepList) {
    antwoordInhoud = `<div class="stap-lijst" id="stap-lijst"></div>
    <div class="stap-hint">Typ <kbd>3</kbd><kbd>/</kbd><kbd>4</kbd> voor een breuk &nbsp;·&nbsp; <kbd>→</kbd> om verder &nbsp;·&nbsp; <kbd>↑</kbd> om vorige te kopiëren</div>`;
  }

  return `${header(ld.id + ' – ' + ld.titel, '#dashboard')}
  <div class="main-content">
    <div class="oefenen-grid">
      <div class="oefenen-main">
        <div class="card fade-in">
          <div class="opgave-meta">
            <span class="opgave-nr">Opgave ${APP.opgaveNr}</span>
            <div class="opgave-dots">${dots}</div>
          </div>
          <div class="vraag-tekst" id="vraag-tekst">${vraag.vraag}</div>
          ${type === 'drag' ? renderDragArea(vraag) : ''}
          ${type === 'mc' ? `<div class="mc-sectie">${renderMcOpties(vraag)}</div>` : ''}
        </div>
        <div class="oefenen-antwoord">
          ${antwoordInhoud}
          <div id="feedback-zone"></div>
          ${needsKbd ? getKeyboardHTML() : ''}
          <div class="actie-bar" id="actie-bar">
            <button class="btn btn-outline btn-sm" id="btn-hint">💡 Hint</button>
            <button class="btn btn-ghost btn-sm" id="btn-oplossing">📖 Oplossing</button>
            <button class="btn btn-primary" id="btn-controleer">✓ Controleer</button>
          </div>
        </div>
      </div>
      <aside class="oefenen-zij">
        <div id="hint-zone"></div>
        <div id="oplossing-zone"></div>
      </aside>
    </div>
  </div>`;
}

/* ── MC options ──────────────────────────────────────────────────────────── */
function renderMcOpties(vraag) {
  return `<div class="mc-grid">${vraag.data.opties.map((o, i) =>
    `<button class="mc-btn" data-idx="${i}" id="mc-${i}">${o.label}</button>`
  ).join('')}</div>`;
}

/* ── Drag area for B.01c ─────────────────────────────────────────────────── */
function renderDragArea(vraag) {
  const t = vraag.antwoord.teller;
  const n = vraag.antwoord.noemer;
  const den = vraag.data.den;
  const svgStr = maakGetallenlijnSVG(0, den, false);
  return `<div class="nl-drag-area" id="nl-drag-area">
    <div class="nl-drag-tile" id="nl-tile">$\\dfrac{${t}}{${n}}$</div>
    <div id="nl-svg-wrap" style="position:relative">${svgStr}
      <div id="nl-marker" class="nl-marker" style="display:none"></div>
    </div>
    <p style="font-size:.82rem;color:var(--text-soft);margin-top:6px;text-align:center">
      Sleep de breuk naar de juiste plek op de getallenlijn.
    </p>
  </div>`;
}

/* ── Read student answer ─────────────────────────────────────────────────── */
function leesAntwoord(vraag) {
  const type = vraag.antwoordType;
  if (type === 'mc')   return { keuze: APP.mcKeuze };
  if (type === 'drag') return { positie: APP.nlMarkerPos };
  if (type === 'two-fracs') {
    return { latex1: APP.mqField1?.latex() || '', latex2: APP.mqField2?.latex() || '' };
  }
  return { latex: APP.mqField1?.latex() || '' };
}

function valideerAntwoord(type, gegeven) {
  if (type === 'mc')        return gegeven.keuze !== null && gegeven.keuze !== undefined;
  if (type === 'drag')      return gegeven.positie !== null && gegeven.positie !== undefined;
  if (type === 'two-fracs') return !!(gegeven.latex1?.trim()) && !!(gegeven.latex2?.trim());
  return !!(gegeven.latex?.trim());
}

/* ── Check answer ────────────────────────────────────────────────────────── */
function checkAntwoord(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;

  if (type === 'mc')   return gegeven.keuze === correct.correct ? 'goed' : 'fout';
  if (type === 'drag') return Math.abs(gegeven.positie - correct.positie) <= 0.08 ? 'goed' : 'fout';

  if (type === 'two-fracs') {
    const f1 = parseSingleFracFromLatex(gegeven.latex1);
    const f2 = parseSingleFracFromLatex(gegeven.latex2);
    if (!f1 || !f2) return 'fout';
    if (f1.d !== f2.d) return 'fout';
    const cv1 = correct.teller1 / correct.noemer1;
    const cv2 = correct.teller2 / correct.noemer2;
    if (Math.abs(f1.n / f1.d - cv1) > 1e-9 || Math.abs(f2.n / f2.d - cv2) > 1e-9) return 'fout';
    return f1.d === correct.noemer1 ? 'goed' : 'tussenstap';
  }

  const sv = evaluateLatex(gegeven.latex);
  if (sv === null || !isFinite(sv)) return 'fout';
  const cv = correcteWaarde(vraag);
  if (cv === null || Math.abs(sv - cv) > 1e-9) return 'fout';
  return isEindvorm(gegeven.latex) ? 'goed' : 'tussenstap';
}

/* ── Specific feedback ───────────────────────────────────────────────────── */
function feedbackBoodschap(vraag, gegeven) {
  if (vraag.antwoordType === 'two-fracs') {
    const f1 = parseSingleFracFromLatex(gegeven.latex1 || '');
    const f2 = parseSingleFracFromLatex(gegeven.latex2 || '');
    if (!f1 || !f2) return 'Voer twee breuken in, bijv. <em>4/12</em>.';
    if (f1 && f2 && f1.d !== f2.d) return 'De noemers zijn niet gelijk. Zorg dat beide breuken dezelfde noemer hebben.';
  }
  const tips = {
    'B.0':  'De teller staat boven de breukstreep, de noemer eronder.',
    'B.01a':'Tel de gelijke delen op de getallenlijn — dat is de noemer.',
    'B.1':  'Zoek de GGD van teller en noemer en deel daardoor.',
    'B.3':  'Zoek het KGV van de noemers en verleng beide breuken.',
    'B.5':  'Maak gelijknamig (KGV), tel tellers op, vereenvoudig.',
    'B.6':  'Zet om naar onechte breuken, maak gelijknamig, tel op.',
    'B.7':  'Maak gelijknamig (KGV), trek tellers af, vereenvoudig.',
    'B.8':  'Zet om naar onechte breuken, maak gelijknamig, trek af.',
    'B.9':  'Vermenigvuldig teller × teller en noemer × noemer.',
    'B.10': 'Zet de gemengde getallen om naar onechte breuken.',
    'B.11': 'Keer de tweede breuk om en vermenigvuldig.',
    'B.12': 'Zet om naar onechte breuken, keer de tweede om, vermenigvuldig.',
    'BP.1': 'Bereken teller ÷ noemer × 100 voor het percentage.',
    'BP.2': 'Schrijf procent als breuk met noemer 100 en vereenvoudig.',
    'BD.1': 'Deel de teller door de noemer (gebruik een komma).',
    'BD.2': 'Tel decimalen, schrijf als breuk/10 of /100, vereenvoudig.',
    'BV.1': 'Tel de delen op voor het totaal: breuk = deel/totaal.',
    'BV.2': 'Breuk n/d → verhouding n:(d−n), vereenvoudig.',
  };
  return tips[vraag.leerdoel] || 'Controleer je berekening stap voor stap.';
}

/* ── Solution HTML ───────────────────────────────────────────────────────── */
function renderOplossing(vraag) {
  const stappen = vraag.oplossing.split('\n').filter(s => s.trim());
  const items = stappen.map((s, i) =>
    `<div class="oplossing-stap">
      <span class="stap-nr">Stap ${i + 1}</span>
      <span>${s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
    </div>`
  ).join('');
  return `<div class="oplossing-box fade-in"><h4>📖 Uitgewerkte oplossing</h4>${items}</div>`;
}

/* ── Feedback display ────────────────────────────────────────────────────── */
function toonFeedback(staat, boodschap) {
  const zone = document.getElementById('feedback-zone');
  const klassen = { goed: 'correct', tussenstap: 'tussenstap', fout: 'wrong' };
  const icons   = { goed: '✓', tussenstap: '→', fout: '✗' };
  zone.innerHTML = `<div class="feedback-box ${klassen[staat]} fade-in">
    <span class="feedback-icon">${icons[staat]}</span>
    <div class="feedback-text">${boodschap}</div>
  </div>`;
  renderKatex(zone);
}

function toonNieuweVraagKnop() {
  const bar = document.getElementById('actie-bar');
  if (!bar || bar.querySelector('#btn-nieuw')) return;
  const btn = document.createElement('button');
  btn.id = 'btn-nieuw';
  btn.className = 'btn btn-green';
  btn.textContent = 'Nieuwe vraag →';
  btn.addEventListener('click', nieuweVraag);
  bar.appendChild(btn);
  const c = document.getElementById('btn-controleer');
  if (c) c.disabled = true;
}

function kleurMcKnoppen(vraag) {
  document.querySelectorAll('.mc-btn').forEach((btn, i) => {
    if (i === vraag.antwoord.correct) btn.classList.add('correct');
    else if (i === APP.mcKeuze) btn.classList.add('wrong');
    btn.disabled = true;
  });
}

/* ── New question ────────────────────────────────────────────────────────── */
function nieuweVraag() {
  APP.huidigVraag = generateVraag(APP.huidigLeerdoel);
  APP.hintIdx = 0;
  APP.pogingen = 0;
  APP.opgaveNr++;
  APP.nlMarkerPos = null;
  APP.mcKeuze = null;
  APP.mqField1 = null;
  APP.mqField2 = null;
  APP.activeMQField = null;
  APP.stappen = [];
  APP.resultaatOpgeslagen = false;
  const app = document.getElementById('app');
  app.innerHTML = renderOefenen(APP.huidigLeerdoel);
  renderKatex(app);
  bindOefenen(APP.huidigLeerdoel);
}

/* ── Event binding ───────────────────────────────────────────────────────── */
function bindEvents(page, param) {
  switch (page) {
    case 'login':      bindLogin();          break;
    case 'oefenen':    bindOefenen(param);   break;
    case 'resultaten': /* inline onclick */  break;
    case 'docent':     bindDocent();         break;
  }
}

function bindOefenen(leerdoelId) {
  const vraag = APP.huidigVraag;
  if (!vraag) return;

  APP.mqField1 = null;
  APP.mqField2 = null;

  bindKeyboardHandlers();

  const type = vraag.antwoordType;

  if (typeof MathQuill !== 'undefined' && type !== 'mc' && type !== 'drag') {
    const MQ = MathQuill.getInterface(2);

    if (type === 'two-fracs') {
      function setupTwoFracsMQ(el, onEnter) {
        if (!el) return null;
        const mq = MQ.MathField(el, {
          spaceBehavesLikeTab: true,
          handlers: { enter: onEnter || (() => {}) }
        });
        const ta = el.querySelector('textarea');
        if (ta) ta.addEventListener('focus', () => { APP.activeMQField = mq; });
        return mq;
      }
      APP.mqField1 = setupTwoFracsMQ(document.getElementById('mq-input1'),
        () => APP.mqField2?.focus());
      APP.mqField2 = setupTwoFracsMQ(document.getElementById('mq-input2'),
        () => document.getElementById('btn-controleer')?.click());
      APP.activeMQField = APP.mqField1;
      APP.mqField1?.focus();
    } else {
      addNewActiveRow();
    }
  }

  if (type === 'mc') {
    document.querySelectorAll('.mc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mc-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        APP.mcKeuze = parseInt(btn.dataset.idx);
      });
    });
    renderKatex(document.querySelector('.mc-grid'));
  }

  if (type === 'drag') initDrag(vraag);

  document.getElementById('btn-hint')?.addEventListener('click', () => {
    if (APP.hintIdx >= vraag.hints.length) APP.hintIdx = 0;
    const hint = vraag.hints[APP.hintIdx++];
    const zone = document.getElementById('hint-zone');
    zone.innerHTML = `<div class="hint-box fade-in">
      <strong>💡 Hint ${APP.hintIdx} van ${vraag.hints.length}</strong>${hint}
    </div>`;
    renderKatex(zone);
    zone.closest('.oefenen-zij')?.classList.add('heeft-inhoud');
  });

  document.getElementById('btn-oplossing')?.addEventListener('click', () => {
    const zone = document.getElementById('oplossing-zone');
    if (zone.innerHTML) return;
    if (!APP.resultaatOpgeslagen) {
      slaResultaatOp(APP.student.id, vraag.leerdoel, 'fout');
      APP.resultaatOpgeslagen = true;
    }
    zone.innerHTML = renderOplossing(vraag);
    renderKatex(zone);
    document.getElementById('btn-oplossing').disabled = true;
    zone.closest('.oefenen-zij')?.classList.add('heeft-inhoud');
    toonNieuweVraagKnop();
  });

  document.getElementById('btn-controleer')?.addEventListener('click', () => controleer(vraag));
}

/* ── Step list helpers ───────────────────────────────────────────────────── */
function addNewActiveRow() {
  if (typeof MathQuill === 'undefined') return;
  const lijst = document.getElementById('stap-lijst');
  if (!lijst) return;

  const rij = document.createElement('div');
  rij.className = 'stap-rij stap-actief';
  rij.innerHTML = `<div class="mq-field-box stap-mq-input"></div><span class="stap-status"></span>`;
  lijst.appendChild(rij);

  const el = rij.querySelector('.stap-mq-input');
  const MQ = MathQuill.getInterface(2);
  const mq = MQ.MathField(el, {
    spaceBehavesLikeTab: true,
    handlers: { enter: () => document.getElementById('btn-controleer')?.click() }
  });

  const ta = el.querySelector('textarea');
  if (ta) {
    ta.addEventListener('focus', () => { APP.activeMQField = mq; });
    ta.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' && mq.latex() === '') {
        const prev = APP.stappen.length ? APP.stappen[APP.stappen.length - 1].latex : null;
        if (prev) { mq.latex(prev); e.preventDefault(); e.stopPropagation(); }
      }
    });
  }

  APP.mqField1 = mq;
  APP.activeMQField = mq;
  rij.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  mq.focus();
}

function freezeActiveRow(staat) {
  const lijst = document.getElementById('stap-lijst');
  if (!lijst) return;
  const rij = lijst.querySelector('.stap-actief');
  if (!rij) return;

  const latex = APP.mqField1?.latex() || '';
  APP.stappen.push({ latex, staat });

  const mqBox = rij.querySelector('.mq-field-box');
  if (mqBox && typeof MathQuill !== 'undefined') {
    const MQ = MathQuill.getInterface(2);
    const staticEl = document.createElement('span');
    staticEl.className = 'stap-mq-static';
    mqBox.replaceWith(staticEl);
    MQ.StaticMath(staticEl).latex(latex);
  }

  const statusEl = rij.querySelector('.stap-status');
  if (statusEl) statusEl.textContent = staat === 'goed' ? '✓' : '✓';

  rij.classList.remove('stap-actief');
  rij.classList.add('stap-frozen', `stap-${staat}`);
  APP.mqField1 = null;
  APP.activeMQField = null;
}

function controleer(vraag) {
  const gegeven = leesAntwoord(vraag);
  if (!valideerAntwoord(vraag.antwoordType, gegeven)) {
    toonFeedback('fout', 'Vul eerst je antwoord in.');
    return;
  }

  const staat = checkAntwoord(vraag, gegeven);
  const type = vraag.antwoordType;
  const useStepList = type !== 'mc' && type !== 'drag' && type !== 'two-fracs';

  if (staat === 'goed') {
    if (!APP.resultaatOpgeslagen) {
      slaResultaatOp(APP.student.id, vraag.leerdoel, APP.pogingen > 0 ? 'goed_na_fouten' : 'goed');
      APP.resultaatOpgeslagen = true;
    }
    if (useStepList) freezeActiveRow('goed');
    toonFeedback('goed', 'Goed zo! Je antwoord is correct.');
    if (type === 'mc') kleurMcKnoppen(vraag);
    toonNieuweVraagKnop();
  } else if (staat === 'tussenstap') {
    if (useStepList) {
      freezeActiveRow('tussenstap');
      toonFeedback('tussenstap', 'Juist! Schrijf nu het eindantwoord in de meest vereenvoudigde vorm.');
      addNewActiveRow();
    } else {
      toonFeedback('tussenstap', 'Juist! Dit is een correcte tussenstap. Schrijf het eindantwoord in de meest vereenvoudigde vorm.');
    }
  } else {
    APP.pogingen++;
    toonFeedback('fout', feedbackBoodschap(vraag, gegeven));
    if (type === 'mc') kleurMcKnoppen(vraag);
    if (APP.pogingen >= 3) {
      const zone = document.getElementById('oplossing-zone');
      if (!zone.innerHTML) {
        if (!APP.resultaatOpgeslagen) {
          slaResultaatOp(APP.student.id, vraag.leerdoel, 'fout');
          APP.resultaatOpgeslagen = true;
        }
        zone.innerHTML = renderOplossing(vraag);
        renderKatex(zone);
        zone.closest('.oefenen-zij')?.classList.add('heeft-inhoud');
        toonNieuweVraagKnop();
      }
    }
  }
}

/* ── Drag & Drop (B.01c) ─────────────────────────────────────────────────── */
function initDrag(vraag) {
  const tile = document.getElementById('nl-tile');
  const svgWrap = document.getElementById('nl-svg-wrap');
  const marker = document.getElementById('nl-marker');
  if (!tile || !svgWrap) return;

  renderKatex(tile);

  const X0 = 24, X1 = 316, SVG_W = 340;
  const den = vraag.data.den;
  let dragging = false;

  function posFromEvent(e) {
    const rect = svgWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scale = rect.width / SVG_W;
    const pos = ((clientX - rect.left) - X0 * scale) / ((X1 - X0) * scale);
    return Math.max(0, Math.min(1, pos));
  }

  function placeMarker(pos) {
    const rect = svgWrap.getBoundingClientRect();
    const scale = rect.width / SVG_W;
    marker.style.left = (X0 * scale + pos * (X1 - X0) * scale) + 'px';
    marker.style.top  = (44 * scale) + 'px';
    marker.style.display = 'block';
  }

  tile.addEventListener('mousedown', e => { e.preventDefault(); dragging = true; tile.style.opacity = '0.5'; });
  tile.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; tile.style.opacity = '0.5'; }, { passive: false });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const pos = Math.round(posFromEvent(e) * den) / den;
    APP.nlMarkerPos = pos;
    placeMarker(pos);
  });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const pos = Math.round(posFromEvent(e) * den) / den;
    APP.nlMarkerPos = pos;
    placeMarker(pos);
  }, { passive: false });

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    tile.style.opacity = '1';
    if (APP.nlMarkerPos !== null) tile.style.visibility = 'hidden';
  }
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTATEN
═══════════════════════════════════════════════════════════════════════════ */
function renderResultaten() {
  const resultaten = getResultatenVoorStudent(APP.student.id);

  if (resultaten.length === 0) {
    return `${header('Mijn resultaten', '#dashboard')}
    <div class="main-content">
      <div class="empty-state"><div class="icon">📊</div><p>Je hebt nog geen opgaven gemaakt.</p></div>
    </div>`;
  }

  let tableRows = '';
  LEERDOELEN.forEach(ld => {
    const r = resultaten.filter(x => x.leerdoel === ld.id);
    if (r.length === 0) return;
    const dots = maakVoortgangDots(resultaten, ld.id);
    tableRows += `<tr>
      <td><strong>${ld.id}</strong><br/>
        <span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span>
      </td>
      <td style="text-align:center">${r.length}</td>
      <td><div class="voortgang-dots">${dots}</div></td>
    </tr>`;
  });

  return `${header('Mijn resultaten', '#dashboard',
    `<button class="btn-header" onclick="openDeelModal()">📤 Delen</button>`)}
  <div class="main-content">
    <div class="card">
      <div style="margin-bottom:14px">
        <strong>${APP.student.naam}</strong><br/>
        <span style="font-size:.85rem;color:var(--text-soft)">${resultaten.length} opgaven gemaakt</span>
      </div>
      <table class="resultaten-tabel">
        <thead><tr>
          <th>Leerdoel</th>
          <th style="text-align:center">Gemaakt</th>
          <th>Laatste 5</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>
  <div id="deel-modal" style="display:none"></div>`;
}

/* ── Share modal ─────────────────────────────────────────────────────────── */
function openDeelModal() {
  const code = volledigeDeelCode(APP.student.id);
  const modal = document.getElementById('deel-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal fade-in">
    <h3>📤 Resultaten delen met docent</h3>
    <p>Kopieer de code hieronder en geef hem aan je docent. De docent plakt hem in de docentenomgeving.</p>
    <textarea id="share-code-area" class="code-display" readonly
      style="min-height:100px;resize:none;cursor:text;font-size:.75rem"
    >${code}</textarea>
    <div class="modal-btns" style="margin-top:12px">
      <button class="btn btn-primary" id="btn-copy">📋 Kopieer code</button>
      <button class="btn btn-ghost" onclick="document.getElementById('deel-modal').style.display='none'">Sluiten</button>
    </div>
  </div>`;
  const area = document.getElementById('share-code-area');
  area.addEventListener('focus', () => area.select());
  document.getElementById('btn-copy').addEventListener('click', () => {
    area.select();
    navigator.clipboard.writeText(code).then(() => {
      document.getElementById('btn-copy').textContent = '✓ Gekopieerd!';
    }).catch(() => {
      // fallback: execCommand for older browsers
      try { document.execCommand('copy'); document.getElementById('btn-copy').textContent = '✓ Gekopieerd!'; }
      catch { document.getElementById('btn-copy').textContent = 'Selecteer en kopieer handmatig'; }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOCENT
═══════════════════════════════════════════════════════════════════════════ */
function renderDocent() {
  return `${header('Docentenomgeving', APP.student ? '#dashboard' : '#login')}
  <div class="main-content">
    <div class="card">
      <h2 style="color:var(--secondary);margin-bottom:8px">👩‍🏫 Docentenomgeving</h2>
      <p class="docent-intro">Plak hieronder de code die een leerling met je heeft gedeeld (begint met XPLORE:).</p>
      <textarea class="code-input-area" id="code-invoer" placeholder="XPLORE:..."></textarea>
      <div style="margin-top:12px">
        <button class="btn btn-primary" id="btn-decodeer">Bekijk resultaten</button>
      </div>
    </div>
    <div id="docent-resultaten"></div>
  </div>`;
}

function bindDocent() {
  document.getElementById('btn-decodeer').addEventListener('click', () => {
    const code = document.getElementById('code-invoer').value;
    const data = decodeerDeelCode(code);
    const zone = document.getElementById('docent-resultaten');
    if (!data || !data.student) {
      zone.innerHTML = `<div class="feedback-box wrong fade-in">
        <span class="feedback-icon">✗</span>
        <div>Ongeldige code. Zorg dat je de volledige code plakt (begint met XPLORE:).</div>
      </div>`;
      return;
    }
    toonDocentResultaten(data, zone);
  });
}

function toonDocentResultaten(data, zone) {
  const { student, resultaten } = data;
  if (!resultaten || resultaten.length === 0) {
    zone.innerHTML = `<div class="card"><p>Geen resultaten voor ${student.naam}.</p></div>`;
    return;
  }

  let rows = '';
  LEERDOELEN.forEach(ld => {
    const r = resultaten.filter(x => x.leerdoel === ld.id);
    if (r.length === 0) return;
    const last = new Date(r[r.length - 1].tijdstip).toLocaleDateString('nl-NL');
    const dots = maakVoortgangDots(resultaten, ld.id);
    rows += `<tr>
      <td><strong>${ld.id}</strong><br/>
        <span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span>
      </td>
      <td style="text-align:center">${r.length}</td>
      <td><div class="voortgang-dots">${dots}</div></td>
      <td style="font-size:.82rem;color:var(--text-soft)">${last}</td>
    </tr>`;
  });

  zone.innerHTML = `<div class="card fade-in">
    <div class="student-header">
      <h3>${student.naam}</h3>
      <p>${resultaten.length} opgaven gemaakt</p>
    </div>
    <table class="resultaten-tabel">
      <thead><tr>
        <th>Leerdoel</th>
        <th style="text-align:center">Gemaakt</th>
        <th>Laatste 5</th>
        <th>Laatste poging</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}
