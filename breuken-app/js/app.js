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
};

/* ── Input parser ────────────────────────────────────────────────────────── */
/* Parses free-form student input: "3/4", "1 3/4", "2", "0,75", "2:3" */
function parseInput(str) {
  if (!str || !str.trim()) return null;
  str = str.trim();

  // Ratio: "2:3"
  if (/^\d+\s*:\s*\d+$/.test(str)) {
    const parts = str.split(':').map(s => parseInt(s.trim()));
    if (parts[1] === 0) return null;
    return { type: 'ratio', deel1: parts[0], deel2: parts[1] };
  }

  // Mixed number: "1 3/4"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const [, w, t, n] = mixedMatch.map(Number);
    if (n === 0) return null;
    return { type: 'mixed', geheel: w, teller: t, noemer: n };
  }

  // Fraction: "3/4"
  if (/^\d+\/\d+$/.test(str)) {
    const [t, n] = str.split('/').map(Number);
    if (n === 0) return null;
    return { type: 'fraction', teller: t, noemer: n };
  }

  // Decimal: "0,75" or "0.75"
  const decStr = str.replace(',', '.');
  if (/^\d+\.\d+$/.test(decStr)) {
    return { type: 'decimal', waarde: parseFloat(decStr) };
  }

  // Integer: "2"
  if (/^\d+$/.test(str)) {
    return { type: 'integer', waarde: parseInt(str) };
  }

  return null;
}

/* Convert any parsed input to an equivalent [numerator, denominator] pair */
function toFrac(parsed) {
  if (!parsed) return null;
  if (parsed.type === 'integer')  return [parsed.waarde, 1];
  if (parsed.type === 'fraction') return [parsed.teller, parsed.noemer];
  if (parsed.type === 'mixed')    return mixedToImproper(parsed.geheel, parsed.teller, parsed.noemer);
  if (parsed.type === 'decimal')  return decimalToFrac(parsed.waarde);
  return null;
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
      const last5 = resultaten.filter(x => x.leerdoel === ld.id).slice(-5);
      const dots = last5.map(r =>
        `<span class="voortgang-dot ${r.goed ? 'dot-goed' : 'dot-fout'}"></span>`
      ).join('') + Array(5 - last5.length).fill('<span class="voortgang-dot"></span>').join('');
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
  }
  if (!APP.huidigVraag) APP.huidigVraag = generateVraag(leerdoelId);

  const resultaten = getResultatenVoorStudent(APP.student.id);
  const last5 = resultaten.filter(r => r.leerdoel === leerdoelId).slice(-5);
  const dots = last5.map(r =>
    `<span class="voortgang-dot ${r.goed ? 'dot-goed' : 'dot-fout'}"></span>`
  ).join('') + Array(Math.max(0, 5 - last5.length)).fill('<span class="voortgang-dot"></span>').join('');

  const vraag = APP.huidigVraag;
  const antwoordHTML = renderAntwoordInput(vraag);

  return `${header(ld.id + ' – ' + ld.titel, '#dashboard')}
  <div class="main-content">
    <div class="card fade-in">
      <div class="opgave-meta">
        <span class="opgave-nr">Opgave ${APP.opgaveNr}</span>
        <div class="opgave-dots">${dots}</div>
      </div>
      <div class="vraag-tekst" id="vraag-tekst">${vraag.vraag}</div>
      ${vraag.antwoordType === 'drag' ? renderDragArea(vraag) : ''}
      <div class="antwoord-sectie" id="antwoord-sectie">
        <div class="antwoord-label">Jouw antwoord:</div>
        ${antwoordHTML}
      </div>
      <div id="feedback-zone"></div>
      <div id="hint-zone"></div>
      <div id="oplossing-zone"></div>
      <div class="actie-bar" id="actie-bar">
        <button class="btn btn-outline btn-sm" id="btn-hint">💡 Hint</button>
        <button class="btn btn-ghost btn-sm" id="btn-oplossing">📖 Oplossing</button>
        <button class="btn btn-primary" id="btn-controleer">✓ Controleer</button>
      </div>
    </div>
  </div>`;
}

/* ── Answer input widgets ────────────────────────────────────────────────── */
function renderAntwoordInput(vraag) {
  const type = vraag.antwoordType;

  if (type === 'mc') {
    return `<div class="mc-grid">${vraag.data.opties.map((o, i) =>
      `<button class="mc-btn" data-idx="${i}" id="mc-${i}">${o.label}</button>`
    ).join('')}</div>`;
  }

  if (type === 'drag') return '';

  // B.3: two separate fraction inputs (student must show both gelijknamige breuken)
  if (type === 'two-fracs') {
    return `<div style="display:flex;flex-direction:column;gap:12px">
      <div class="single-input-wrap">
        <span style="font-size:.9rem;color:var(--text-mid);min-width:110px">Eerste breuk:</span>
        <input class="math-input-single math-input" id="inp-frac1" type="text" inputmode="text"
          placeholder="bijv. 4/12" autocomplete="off"/>
      </div>
      <div class="single-input-wrap">
        <span style="font-size:.9rem;color:var(--text-mid);min-width:110px">Tweede breuk:</span>
        <input class="math-input-single math-input" id="inp-frac2" type="text" inputmode="text"
          placeholder="bijv. 3/12" autocomplete="off"/>
      </div>
    </div>`;
  }

  // All other types: single free-text input
  let placeholder = 'Bijv. 3/4 of 1 3/4 of 2';
  let suffix = '';
  if (type === 'percentage') { placeholder = 'Bijv. 75'; suffix = '<span class="input-unit">%</span>'; }
  if (type === 'decimal')    placeholder = 'Bijv. 0,75';
  if (type === 'ratio')      placeholder = 'Bijv. 2:3';
  if (type === 'integer')    placeholder = 'Jouw antwoord';

  return `<div class="single-input-wrap">
    <input class="math-input-single math-input" id="inp-single" type="text" inputmode="text"
      placeholder="${placeholder}" autocomplete="off" style="width:200px"/>
    ${suffix}
  </div>`;
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
    const v1 = document.getElementById('inp-frac1')?.value.trim() || '';
    const v2 = document.getElementById('inp-frac2')?.value.trim() || '';
    return { parsed1: parseInput(v1), parsed2: parseInput(v2), raw1: v1, raw2: v2 };
  }

  const raw = document.getElementById('inp-single')?.value.trim() || '';
  return { raw, parsed: parseInput(raw) };
}

function valideerAntwoord(type, gegeven) {
  if (type === 'mc')        return gegeven.keuze !== null && gegeven.keuze !== undefined;
  if (type === 'drag')      return gegeven.positie !== null && gegeven.positie !== undefined;
  if (type === 'two-fracs') return gegeven.parsed1 !== null && gegeven.parsed2 !== null;
  return gegeven.parsed !== null && gegeven.parsed !== undefined;
}

/* ── Check answer ────────────────────────────────────────────────────────── */
function checkAntwoord(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;

  if (type === 'mc')   return gegeven.keuze === correct.correct;
  if (type === 'drag') return Math.abs(gegeven.positie - correct.positie) <= 0.08;

  if (type === 'two-fracs') {
    const p1 = gegeven.parsed1, p2 = gegeven.parsed2;
    if (!p1 || !p2 || p1.type !== 'fraction' || p2.type !== 'fraction') return false;
    // Both fractions must have the same denominator (that's what gelijknamig means)
    if (p1.noemer !== p2.noemer) return false;
    return fracEqual(p1.teller, p1.noemer, correct.teller1, correct.noemer1) &&
           fracEqual(p2.teller, p2.noemer, correct.teller2, correct.noemer2);
  }

  const p = gegeven.parsed;
  if (!p) return false;

  if (type === 'percentage') {
    const val = p.type === 'integer' ? p.waarde : p.type === 'decimal' ? p.waarde : null;
    return val !== null && Math.abs(val - correct.waarde) < 0.01;
  }

  if (type === 'ratio') {
    if (p.type !== 'ratio') return false;
    const [ga, gb] = simplifyFrac(p.deel1, p.deel2);
    const [ca, cb] = simplifyFrac(correct.deel1, correct.deel2);
    return ga === ca && gb === cb;
  }

  if (type === 'decimal') {
    const f = toFrac(p);
    if (!f) return false;
    const [cn, cd] = decimalToFrac(correct.waarde);
    return fracEqual(f[0], f[1], cn, cd);
  }

  // fraction, mixed, integer — all compare as fractions (accepts any equivalent form)
  const f = toFrac(p);
  if (!f) return false;

  let cf;
  if (type === 'fraction') cf = [correct.teller, correct.noemer];
  else if (type === 'mixed')   cf = mixedToImproper(correct.geheel, correct.teller, correct.noemer);
  else if (type === 'integer') cf = [correct.waarde, 1];
  else return false;

  return fracEqual(f[0], f[1], cf[0], cf[1]);
}

/* ── Specific feedback ───────────────────────────────────────────────────── */
function feedbackBoodschap(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;

  if (type === 'two-fracs') {
    const p1 = gegeven.parsed1, p2 = gegeven.parsed2;
    if (!p1 || !p2) return 'Controleer je invoer. Vul beide breuken in als bijv. <em>4/12</em>.';
    if (p1.type === 'fraction' && p2.type === 'fraction' && p1.noemer !== p2.noemer)
      return 'De noemers van je twee breuken zijn niet gelijk. Zorg dat beide breuken dezelfde noemer hebben.';
    const ok1 = p1 && fracEqual(p1.teller, p1.noemer || 1, correct.teller1, correct.noemer1);
    const ok2 = p2 && fracEqual(p2.teller, p2.noemer || 1, correct.teller2, correct.noemer2);
    if (ok1 && !ok2) return 'De eerste breuk klopt! Controleer de tweede breuk.';
    if (!ok1 && ok2) return 'De tweede breuk klopt! Controleer de eerste breuk.';
  }

  if (type === 'drag') return 'Niet helemaal goed. Probeer de breuk nauwkeuriger te plaatsen.';

  if (type === 'decimal') return 'Controleer je deling. Gebruik een komma voor decimalen (bijv. 0,75).';

  if (type === 'percentage') return 'Controleer je berekening. Vul alleen het getal in (bijv. 75 voor 75%).';

  if (type === 'ratio') return 'Controleer je verhouding. Gebruik het formaat bijv. 2:3.';

  // For fraction/mixed/integer: check if the student gave an un-simplified fraction
  const p = gegeven.parsed;
  if (p && (p.type === 'fraction' || p.type === 'mixed')) {
    const f = toFrac(p);
    if (f) {
      const [sn, sd] = simplifyFrac(f[0], f[1]);
      let cf;
      if (type === 'fraction') cf = [correct.teller, correct.noemer];
      else if (type === 'mixed') cf = mixedToImproper(correct.geheel, correct.teller, correct.noemer);
      else cf = [correct.waarde, 1];
      if (fracEqual(f[0], f[1], cf[0], cf[1])) {
        // Value is correct but not simplified
        return `Bijna! Je breuk is gelijkwaardig aan het antwoord, maar nog niet vereenvoudigd. Wat is de GGD?`;
      }
    }
  }

  const tips = {
    'B.1':  'Zoek de GGD van teller en noemer en deel daardoor.',
    'B.3':  'Zoek het KGV van de noemers en verleng beide breuken.',
    'B.5':  'Maak de noemers gelijk (KGV) en tel de tellers op.',
    'B.6':  'Zet de gemengde getallen om naar onechte breuken, maak gelijknamig, tel op.',
    'B.7':  'Maak de noemers gelijk (KGV) en trek de tellers af.',
    'B.8':  'Zet om naar onechte breuken, maak gelijknamig, trek af.',
    'B.9':  'Vermenigvuldig teller × teller en noemer × noemer, vereenvoudig daarna.',
    'B.10': 'Zet de gemengde getallen om naar onechte breuken en vermenigvuldig.',
    'B.11': 'Keer de tweede breuk om en vermenigvuldig.',
    'B.12': 'Zet om naar onechte breuken, keer de tweede om en vermenigvuldig.',
    'BP.1': 'Bereken teller ÷ noemer × 100.',
    'BP.2': 'Schrijf als breuk met noemer 100 en vereenvoudig.',
    'BD.1': 'Deel de teller door de noemer.',
    'BD.2': 'Schrijf het decimaal als breuk en vereenvoudig.',
    'BV.1': 'Tel de delen op voor het totaal. De breuk is deel/totaal.',
    'BV.2': 'De verhouding is teller : (noemer − teller).',
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

/* ── New question ────────────────────────────────────────────────────────── */
function nieuweVraag() {
  APP.huidigVraag = generateVraag(APP.huidigLeerdoel);
  APP.hintIdx = 0;
  APP.pogingen = 0;
  APP.opgaveNr++;
  APP.nlMarkerPos = null;
  APP.mcKeuze = null;
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

  if (vraag.antwoordType === 'mc') {
    document.querySelectorAll('.mc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mc-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        APP.mcKeuze = parseInt(btn.dataset.idx);
      });
    });
    renderKatex(document.querySelector('.mc-grid'));
  }

  if (vraag.antwoordType === 'drag') initDrag(vraag);

  document.getElementById('btn-hint')?.addEventListener('click', () => {
    if (APP.hintIdx >= vraag.hints.length) APP.hintIdx = 0;
    const hint = vraag.hints[APP.hintIdx++];
    const zone = document.getElementById('hint-zone');
    zone.innerHTML = `<div class="hint-box fade-in">
      <strong>💡 Hint ${APP.hintIdx} van ${vraag.hints.length}</strong>${hint}
    </div>`;
    renderKatex(zone);
  });

  document.getElementById('btn-oplossing')?.addEventListener('click', () => {
    const zone = document.getElementById('oplossing-zone');
    zone.innerHTML = renderOplossing(vraag);
    renderKatex(zone);
    document.getElementById('btn-oplossing').disabled = true;
    toonNieuweVraagKnop();
  });

  document.getElementById('btn-controleer')?.addEventListener('click', () => controleer(vraag));
}

function controleer(vraag) {
  const gegeven = leesAntwoord(vraag);
  if (!valideerAntwoord(vraag.antwoordType, gegeven)) {
    const zone = document.getElementById('feedback-zone');
    zone.innerHTML = `<div class="feedback-box wrong fade-in">
      <span class="feedback-icon">!</span>
      <div class="feedback-text">Vul eerst je antwoord in.</div>
    </div>`;
    return;
  }

  APP.pogingen++;
  const goed = checkAntwoord(vraag, gegeven);
  slaResultaatOp(APP.student.id, vraag.leerdoel, goed);

  if (goed) {
    toonFeedback(true, 'Goed zo! Je antwoord is correct. 🎉');
    if (vraag.antwoordType === 'mc') kleurMcKnoppen(vraag);
    toonNieuweVraagKnop();
  } else {
    toonFeedback(false, feedbackBoodschap(vraag, gegeven));
    if (vraag.antwoordType === 'mc') kleurMcKnoppen(vraag);
    if (APP.pogingen >= 3) {
      const zone = document.getElementById('oplossing-zone');
      if (!zone.innerHTML) {
        zone.innerHTML = renderOplossing(vraag);
        renderKatex(zone);
        toonNieuweVraagKnop();
      }
    }
  }
}

function toonFeedback(goed, boodschap) {
  const zone = document.getElementById('feedback-zone');
  zone.innerHTML = `<div class="feedback-box ${goed ? 'correct' : 'wrong'} fade-in">
    <span class="feedback-icon">${goed ? '✓' : '✗'}</span>
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
    const goed = r.filter(x => x.goed).length;
    const pct = Math.round((goed / r.length) * 100);
    const fillClass = pct >= 70 ? '' : pct >= 40 ? 'amber' : 'red';
    tableRows += `<tr>
      <td><strong>${ld.id}</strong><br/>
        <span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span>
      </td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goed}</td>
      <td>
        <div class="pct-bar">
          <div class="pct-track"><div class="pct-fill ${fillClass}" style="width:${pct}%"></div></div>
          <span style="font-size:.82rem;min-width:32px">${pct}%</span>
        </div>
      </td>
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
          <th style="text-align:center">Goed</th>
          <th>Score</th>
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
    const goed = r.filter(x => x.goed).length;
    const pct = Math.round((goed / r.length) * 100);
    const last = new Date(r[r.length - 1].tijdstip).toLocaleDateString('nl-NL');
    const fillClass = pct >= 70 ? '' : pct >= 40 ? 'amber' : 'red';
    rows += `<tr>
      <td><strong>${ld.id}</strong><br/>
        <span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span>
      </td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goed}</td>
      <td>
        <div class="pct-bar">
          <div class="pct-track"><div class="pct-fill ${fillClass}" style="width:${pct}%"></div></div>
          <span style="font-size:.82rem;min-width:32px">${pct}%</span>
        </div>
      </td>
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
        <th style="text-align:center">Goed</th>
        <th>Score</th>
        <th>Laatste poging</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}
