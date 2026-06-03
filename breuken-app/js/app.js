/* ── App State ───────────────────────────────────────────────────────── */
const APP = {
  student: null,
  huidigLeerdoel: null,
  huidigVraag: null,
  hintIdx: 0,
  pogingen: 0,
  opgaveNr: 1,
  recenteDots: [],  // last 5: 'goed'|'fout'
  nlMarkerPos: null,   // for drag answer (0..1 float)
  mcKeuze: null,       // for multiple choice
};

/* ── Render dispatcher ───────────────────────────────────────────────── */
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
    case 'login':     app.innerHTML = renderLogin(); break;
    case 'dashboard': app.innerHTML = renderDashboard(); break;
    case 'oefenen':   app.innerHTML = renderOefenen(param); break;
    case 'resultaten':app.innerHTML = renderResultaten(); break;
    case 'docent':    app.innerHTML = renderDocent(); break;
    default:          app.innerHTML = renderLogin();
  }

  renderKatex(app);
  bindEvents(page, param);
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  initMathKeyboard();
  route();
});

/* ── Header helper ───────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════════════ */
function renderLogin() {
  const klassen = ['Klas 1 vmbo','Klas 1 havo/vwo','Klas 2 vmbo','Klas 2 havo/vwo','Klas 3 vmbo','Klas 3 havo/vwo'];
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
      <div class="form-group">
        <label class="form-label" for="inp-klas">Klas</label>
        <select class="form-input" id="inp-klas">
          ${klassen.map(k => `<option value="${k}">${k}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary btn-block btn-lg" id="btn-login">Inloggen</button>
      <div class="login-teacher-link mt-12">
        <a href="#docent">Docentenomgeving →</a>
      </div>
    </div>
  </div>`;
}

function bindLogin() {
  document.getElementById('btn-login').addEventListener('click', () => {
    const naam = document.getElementById('inp-naam').value.trim();
    const klas = document.getElementById('inp-klas').value;
    if (!naam) { document.getElementById('inp-naam').focus(); return; }
    APP.student = registreerStudent(naam, klas);
    window.location.hash = '#dashboard';
  });
  document.getElementById('inp-naam').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login').click();
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const resultaten = getResultatenVoorStudent(APP.student.id);

  function getStats(leerdoelId) {
    const r = resultaten.filter(x => x.leerdoel === leerdoelId);
    const goed = r.filter(x => x.goed).length;
    return { totaal: r.length, goed };
  }

  function statusClass(stats) {
    if (stats.totaal === 0) return '';
    const pct = stats.goed / stats.totaal;
    return pct >= 0.7 ? 'goed' : 'started';
  }

  const groepen = [...new Set(LEERDOELEN.map(l => l.groep))];
  let html = `${header('Oefenen met breuken', '', `<button class="btn-header" onclick="doUitloggen()">Uitloggen</button>`)}
  <div class="main-content">
    <div class="dashboard-welcome">
      <div>
        <div class="welcome-name">👋 Hallo, ${APP.student.naam}!</div>
        <div class="welcome-klas">${APP.student.klas}</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="window.location.hash='#resultaten'">📊 Mijn resultaten</button>
    </div>`;

  groepen.forEach(groep => {
    html += `<div class="groep-header">${groep}</div><div class="leerdoel-grid">`;
    LEERDOELEN.filter(l => l.groep === groep).forEach(ld => {
      const stats = getStats(ld.id);
      const sc = statusClass(stats);
      // Last 5 results
      const last5 = resultaten.filter(x => x.leerdoel === ld.id).slice(-5);
      const dots = last5.map(r => `<span class="voortgang-dot ${r.goed ? 'dot-goed' : 'dot-fout'}"></span>`).join('');
      const empty = Array(5 - last5.length).fill('<span class="voortgang-dot"></span>').join('');
      html += `<div class="leerdoel-card" onclick="window.location.hash='#oefenen/${ld.id}'">
        <div class="leerdoel-top">
          <span class="leerdoel-badge">${ld.id}</span>
          <span class="badge-status ${sc}"></span>
        </div>
        <div class="leerdoel-titel">${ld.titel}</div>
        <div class="leerdoel-voortgang">
          <div class="voortgang-dots">${dots}${empty}</div>
          <span class="voortgang-label">${stats.goed}/${stats.totaal}</span>
        </div>
      </div>`;
    });
    html += `</div>`;
  });

  html += `<div style="margin-top:24px">
    <button class="btn btn-secondary btn-block" onclick="openDeelModal()">📤 Resultaten delen met docent</button>
  </div>
  </div>
  <div id="deel-modal" style="display:none"></div>`;
  return html;
}

function openDeelModal() {
  const vollCode = volledigeDeelCode(APP.student.id);
  const kortCode = maakDeelCode(APP.student.id);
  const modal = document.getElementById('deel-modal');
  modal.style.display = 'flex';
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal fade-in">
    <h3>📤 Resultaten delen</h3>
    <p>Geef de code hieronder aan je docent. De docent kan deze invoeren in de docentenomgeving.</p>
    <div class="short-code">${kortCode}</div>
    <p style="font-size:.82rem;color:var(--text-soft);margin-bottom:8px">Volledige code (voor copy-paste):</p>
    <div class="code-display" id="vollCode">${vollCode}</div>
    <div class="modal-btns">
      <button class="btn btn-primary" id="btn-copy">📋 Kopieer code</button>
      <button class="btn btn-ghost" onclick="document.getElementById('deel-modal').style.display='none'">Sluiten</button>
    </div>
  </div>`;
  document.getElementById('btn-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(vollCode).then(() => {
      document.getElementById('btn-copy').textContent = '✓ Gekopieerd!';
    });
  });
}

function doUitloggen() {
  uitloggen();
  window.location.hash = '#login';
}

/* ═══════════════════════════════════════════════════════════════════════
   OEFENEN
═══════════════════════════════════════════════════════════════════════ */
function renderOefenen(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld) return renderDashboard();

  if (!APP.huidigLeerdoel || APP.huidigLeerdoel !== leerdoelId) {
    APP.huidigLeerdoel = leerdoelId;
    APP.huidigVraag = null;
    APP.hintIdx = 0;
    APP.pogingen = 0;
    APP.opgaveNr = 1;
    APP.recenteDots = [];
    APP.nlMarkerPos = null;
    APP.mcKeuze = null;
  }

  if (!APP.huidigVraag) {
    APP.huidigVraag = generateVraag(leerdoelId);
  }

  const resultaten = getResultatenVoorStudent(APP.student.id);
  const myLast5 = resultaten.filter(r => r.leerdoel === leerdoelId).slice(-5);
  const dots = myLast5.map(r =>
    `<span class="voortgang-dot ${r.goed ? 'dot-goed' : 'dot-fout'}" title="${r.goed ? 'Goed' : 'Fout'}"></span>`
  ).join('') + Array(Math.max(0, 5 - myLast5.length)).fill('<span class="voortgang-dot"></span>').join('');

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

/* ── Answer input widgets ────────────────────────────────────────────── */
function renderAntwoordInput(vraag) {
  const type = vraag.antwoordType;

  if (type === 'integer' || type === 'percentage') {
    const unit = type === 'percentage' ? '<span class="input-unit">%</span>' : '';
    return `<div class="single-input-wrap">
      <input class="math-input-single math-input" id="inp-single" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
      ${unit}
    </div>`;
  }

  if (type === 'decimal') {
    return `<div class="single-input-wrap">
      <input class="math-input-single math-input" id="inp-single" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off"/>
    </div>`;
  }

  if (type === 'fraction') {
    return fracInputHTML('inp-t', 'inp-n');
  }

  if (type === 'mixed') {
    return mixedInputHTML('inp-g', 'inp-t', 'inp-n');
  }

  if (type === 'two-fracs') {
    return `<div class="two-fracs-wrap">
      <div><div class="two-fracs-label">Eerste breuk:</div>${fracInputHTML('inp-t1','inp-n1')}</div>
      <div><div class="two-fracs-label">Tweede breuk:</div>${fracInputHTML('inp-t2','inp-n2')}</div>
    </div>`;
  }

  if (type === 'ratio') {
    return `<div class="ratio-wrap">
      <input class="math-input" id="inp-r1" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
      <span class="ratio-colon">:</span>
      <input class="math-input" id="inp-r2" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
    </div>`;
  }

  if (type === 'mc') {
    const opties = vraag.data.opties;
    return `<div class="mc-grid">${opties.map((o, i) =>
      `<button class="mc-btn" data-idx="${i}" id="mc-${i}">${o.label}</button>`
    ).join('')}</div>`;
  }

  if (type === 'drag') {
    return ''; // Rendered separately via renderDragArea
  }

  return '<p>Onbekend antwoordtype.</p>';
}

function fracInputHTML(tid, nid) {
  return `<div class="frac-input-wrap">
    <div class="frac-label">teller</div>
    <input class="math-input" id="${tid}" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
    <div class="frac-line"></div>
    <input class="math-input" id="${nid}" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
    <div class="frac-label">noemer</div>
  </div>`;
}

function mixedInputHTML(gid, tid, nid) {
  return `<div class="mixed-wrap">
    <div>
      <div class="frac-label" style="text-align:center">geheel</div>
      <input class="math-input-lg math-input" id="${gid}" type="text" inputmode="numeric" placeholder="0" autocomplete="off"/>
    </div>
    <div class="frac-input-wrap">
      <div class="frac-label">teller</div>
      <input class="math-input" id="${tid}" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
      <div class="frac-line"></div>
      <input class="math-input" id="${nid}" type="text" inputmode="numeric" placeholder="?" autocomplete="off"/>
      <div class="frac-label">noemer</div>
    </div>
  </div>`;
}

/* ── Drag area for B.01c ─────────────────────────────────────────────── */
function renderDragArea(vraag) {
  const t = vraag.antwoord.teller;
  const n = vraag.antwoord.noemer;
  const den = vraag.data.den;
  const svgStr = maakGetallenlijnSVG(0, den, false);
  return `<div class="nl-drag-area" id="nl-drag-area">
    <div class="nl-drag-tile" id="nl-tile">$\\dfrac{${t}}{${n}}$</div>
    <div id="nl-svg-wrap" style="position:relative">${svgStr}<div id="nl-marker" class="nl-marker" style="display:none"></div></div>
    <p style="font-size:.82rem;color:var(--text-soft);margin-top:6px;text-align:center">Sleep de breuk naar de juiste plek op de getallenlijn.</p>
  </div>`;
}

/* ── Answer reading ──────────────────────────────────────────────────── */
function leesAntwoord(vraag) {
  const type = vraag.antwoordType;
  const g = id => document.getElementById(id);

  if (type === 'integer')    return { waarde: parseInt(g('inp-single')?.value || '0') };
  if (type === 'percentage') return { waarde: parseInt(g('inp-single')?.value || '0') };
  if (type === 'decimal')    return { waarde: parseFloat((g('inp-single')?.value || '0').replace(',', '.')) };
  if (type === 'fraction')   return { teller: parseInt(g('inp-t')?.value||'0'), noemer: parseInt(g('inp-n')?.value||'1') };
  if (type === 'mixed')      return { geheel: parseInt(g('inp-g')?.value||'0'), teller: parseInt(g('inp-t')?.value||'0'), noemer: parseInt(g('inp-n')?.value||'1') };
  if (type === 'two-fracs')  return { teller1: parseInt(g('inp-t1')?.value||'0'), noemer1: parseInt(g('inp-n1')?.value||'1'), teller2: parseInt(g('inp-t2')?.value||'0'), noemer2: parseInt(g('inp-n2')?.value||'1') };
  if (type === 'ratio')      return { deel1: parseInt(g('inp-r1')?.value||'0'), deel2: parseInt(g('inp-r2')?.value||'1') };
  if (type === 'mc')         return { keuze: APP.mcKeuze };
  if (type === 'drag')       return { positie: APP.nlMarkerPos };
  return null;
}

function valideerAntwoord(type, gegeven) {
  if (!gegeven) return false;
  if (type === 'mc') return gegeven.keuze !== null && gegeven.keuze !== undefined;
  if (type === 'drag') return gegeven.positie !== null && gegeven.positie !== undefined;
  if (type === 'integer' || type === 'percentage') return !isNaN(gegeven.waarde);
  if (type === 'decimal') return !isNaN(gegeven.waarde);
  if (type === 'fraction') return gegeven.teller && gegeven.noemer && !isNaN(gegeven.teller) && !isNaN(gegeven.noemer) && gegeven.noemer !== 0;
  if (type === 'mixed') {
    if (!isNaN(gegeven.geheel) && (gegeven.teller === 0 || isNaN(gegeven.teller))) return true; // whole number answer
    return !isNaN(gegeven.geheel) && !isNaN(gegeven.teller) && !isNaN(gegeven.noemer) && gegeven.noemer !== 0;
  }
  if (type === 'two-fracs') return gegeven.noemer1 !== 0 && gegeven.noemer2 !== 0;
  if (type === 'ratio') return gegeven.deel2 !== 0;
  return true;
}

/* ── Answer checking ─────────────────────────────────────────────────── */
function checkAntwoord(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;

  if (type === 'integer')    return gegeven.waarde === correct.waarde;
  if (type === 'percentage') return gegeven.waarde === correct.waarde;
  if (type === 'decimal')    return Math.abs(gegeven.waarde - correct.waarde) < 0.001;

  if (type === 'fraction') {
    return fracEqual(gegeven.teller, gegeven.noemer, correct.teller, correct.noemer);
  }

  if (type === 'mixed') {
    // Accept both mixed and improper forms
    const gn = gegeven.geheel * (gegeven.noemer || 1) + (gegeven.teller || 0);
    const gd = gegeven.noemer || 1;
    const cn = correct.geheel * (correct.noemer || 1) + (correct.teller || 0);
    const cd = correct.noemer || 1;
    // Also accept if student answers just a whole number when teller=0
    if (correct.teller === 0 && !isNaN(gegeven.geheel) && gegeven.teller === 0) {
      return gegeven.geheel === correct.geheel;
    }
    return fracEqual(gn, gd, cn, cd);
  }

  if (type === 'two-fracs') {
    return fracEqual(gegeven.teller1, gegeven.noemer1, correct.teller1, correct.noemer1) &&
           fracEqual(gegeven.teller2, gegeven.noemer2, correct.teller2, correct.noemer2);
  }

  if (type === 'ratio') {
    const [ga, gb] = simplifyFrac(gegeven.deel1, gegeven.deel2);
    const [ca, cb] = simplifyFrac(correct.deel1, correct.deel2);
    return ga === ca && gb === cb;
  }

  if (type === 'mc') return gegeven.keuze === correct.correct;

  if (type === 'drag') {
    const pos = gegeven.positie;
    return Math.abs(pos - correct.positie) <= 0.08;
  }

  return false;
}

/* ── Specific feedback messages ──────────────────────────────────────── */
function feedbackBoodschap(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;
  const ld = vraag.leerdoel;

  if (type === 'fraction') {
    const [sGn, sGd] = simplifyFrac(gegeven.teller, gegeven.noemer);
    const isVereenvoudigd = sGn === gegeven.teller && sGd === gegeven.noemer;
    if (fracEqual(gegeven.teller, gegeven.noemer, correct.teller, correct.noemer) && !isVereenvoudigd) {
      return 'Bijna! Je breuk is correct maar nog niet vereenvoudigd. Wat is de GGD van teller en noemer?';
    }
    if (gegeven.noemer === correct.noemer && gegeven.teller !== correct.teller) {
      return `De noemer ${gegeven.noemer} klopt! Controleer je teller.`;
    }
    if (gegeven.teller === correct.teller && gegeven.noemer !== correct.noemer) {
      return `De teller ${gegeven.teller} klopt! Controleer je noemer.`;
    }
  }

  if (type === 'mixed') {
    if (gegeven.geheel === correct.geheel && (gegeven.teller !== correct.teller || gegeven.noemer !== correct.noemer)) {
      return `Het gehele deel (${gegeven.geheel}) klopt! Controleer de breuk.`;
    }
  }

  if (type === 'two-fracs') {
    const ok1 = fracEqual(gegeven.teller1, gegeven.noemer1, correct.teller1, correct.noemer1);
    const ok2 = fracEqual(gegeven.teller2, gegeven.noemer2, correct.teller2, correct.noemer2);
    if (ok1 && !ok2) return 'De eerste breuk klopt! Controleer de tweede breuk.';
    if (!ok1 && ok2) return 'De tweede breuk klopt! Controleer de eerste breuk.';
    if (gegeven.noemer1 !== gegeven.noemer2) return 'De twee breuken zijn nog niet gelijknamig (noemers zijn niet gelijk).';
  }

  if (type === 'decimal') {
    return `Controleer je berekening. Deel de teller door de noemer.`;
  }

  if (type === 'drag') {
    return 'Niet helemaal goed. Probeer de breuk nauwkeuriger te plaatsen.';
  }

  const tips = {
    'B.1':  'Zoek de GGD van teller en noemer en deel daardoor.',
    'B.3':  'Zoek het KGV van de noemers en verleng beide breuken.',
    'B.5':  'Zorg dat de noemers gelijk zijn (KGV) en tel de tellers op.',
    'B.6':  'Zet de gemengde getallen om naar onechte breuken, maak gelijknamig, tel op.',
    'B.7':  'Zorg dat de noemers gelijk zijn (KGV) en trek de tellers van elkaar af.',
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
  return tips[ld] || 'Controleer je berekening stap voor stap.';
}

/* ── Oplossing HTML ──────────────────────────────────────────────────── */
function renderOplossing(vraag) {
  const stappen = vraag.oplossing.split('\n').filter(s => s.trim());
  const items = stappen.map((s, i) =>
    `<div class="oplossing-stap"><span class="stap-nr">Stap ${i+1}</span><span>${s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></div>`
  ).join('');
  return `<div class="oplossing-box fade-in"><h4>📖 Uitgewerkte oplossing</h4>${items}</div>`;
}

/* ── Nieuwe vraag ────────────────────────────────────────────────────── */
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

/* ── Event binding ───────────────────────────────────────────────────── */
function bindEvents(page, param) {
  switch (page) {
    case 'login':     bindLogin(); break;
    case 'dashboard': /* onclick inline */ break;
    case 'oefenen':   bindOefenen(param); break;
    case 'resultaten':bindResultaten(); break;
    case 'docent':    bindDocent(); break;
  }
}

function bindOefenen(leerdoelId) {
  const vraag = APP.huidigVraag;
  if (!vraag) return;

  // Multiple choice
  if (vraag.antwoordType === 'mc') {
    document.querySelectorAll('.mc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mc-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        APP.mcKeuze = parseInt(btn.dataset.idx);
      });
    });
  }

  // Drag (B.01c)
  if (vraag.antwoordType === 'drag') {
    initDrag(vraag);
  }

  // Hint
  document.getElementById('btn-hint')?.addEventListener('click', () => {
    const hints = vraag.hints;
    if (APP.hintIdx >= hints.length) { APP.hintIdx = 0; }
    const hint = hints[APP.hintIdx++];
    const zone = document.getElementById('hint-zone');
    zone.innerHTML = `<div class="hint-box fade-in"><strong>💡 Hint ${APP.hintIdx} van ${hints.length}</strong>${hint}</div>`;
    renderKatex(zone);
  });

  // Toon oplossing
  document.getElementById('btn-oplossing')?.addEventListener('click', () => {
    const zone = document.getElementById('oplossing-zone');
    zone.innerHTML = renderOplossing(vraag);
    renderKatex(zone);
    document.getElementById('btn-oplossing').disabled = true;
    // Also show Nieuwe vraag if not yet shown
    toonNieuweVraagKnop();
  });

  // Controleer
  document.getElementById('btn-controleer')?.addEventListener('click', () => controleer(vraag));
}

function controleer(vraag) {
  const gegeven = leesAntwoord(vraag);
  if (!valideerAntwoord(vraag.antwoordType, gegeven)) {
    toonFeedback(false, 'Vul eerst je antwoord in!');
    return;
  }

  APP.pogingen++;
  const goed = checkAntwoord(vraag, gegeven);
  slaResultaatOp(APP.student.id, vraag.leerdoel, { prompt: vraag.vraag }, gegeven, goed, APP.pogingen);

  if (goed) {
    toonFeedback(true, 'Goed zo! Je antwoord is correct. 🎉');
    if (vraag.antwoordType === 'mc') kleurMcKnop(vraag);
    toonNieuweVraagKnop();
  } else {
    const uitleg = feedbackBoodschap(vraag, gegeven);
    toonFeedback(false, uitleg);
    if (vraag.antwoordType === 'mc') kleurMcKnop(vraag);
    if (APP.pogingen >= 3) {
      const oplZone = document.getElementById('oplossing-zone');
      if (!oplZone.innerHTML) {
        oplZone.innerHTML = renderOplossing(vraag);
        renderKatex(oplZone);
        toonNieuweVraagKnop();
      }
    }
  }
}

function toonFeedback(goed, boodschap) {
  const zone = document.getElementById('feedback-zone');
  const cls = goed ? 'correct' : 'wrong';
  const icon = goed ? '✓' : '✗';
  zone.innerHTML = `<div class="feedback-box ${cls} fade-in">
    <span class="feedback-icon">${icon}</span>
    <div class="feedback-text">${boodschap}</div>
  </div>`;
  renderKatex(zone);
}

function toonNieuweVraagKnop() {
  const bar = document.getElementById('actie-bar');
  if (!bar) return;
  if (bar.querySelector('#btn-nieuw')) return;
  const btn = document.createElement('button');
  btn.id = 'btn-nieuw';
  btn.className = 'btn btn-green';
  btn.textContent = 'Nieuwe vraag →';
  btn.addEventListener('click', nieuweVraag);
  bar.appendChild(btn);
  const contrBtn = document.getElementById('btn-controleer');
  if (contrBtn) contrBtn.disabled = true;
}

function kleurMcKnop(vraag) {
  document.querySelectorAll('.mc-btn').forEach((btn, i) => {
    if (i === vraag.antwoord.correct) btn.classList.add('correct');
    else if (i === APP.mcKeuze && i !== vraag.antwoord.correct) btn.classList.add('wrong');
    btn.disabled = true;
  });
}

/* ── Drag & Drop for number line (B.01c) ────────────────────────────── */
function initDrag(vraag) {
  const tile = document.getElementById('nl-tile');
  const svgWrap = document.getElementById('nl-svg-wrap');
  const marker = document.getElementById('nl-marker');
  if (!tile || !svgWrap) return;

  renderKatex(tile);

  const X0 = 24, X1 = 316, SVG_W = 340;

  function posFromEvent(e) {
    const rect = svgWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = clientX - rect.left;
    const svgScale = rect.width / SVG_W;
    const lineX0 = X0 * svgScale, lineX1 = X1 * svgScale;
    let pos = (relX - lineX0) / (lineX1 - lineX0);
    return Math.max(0, Math.min(1, pos));
  }

  function snapPos(pos, den) {
    // Snap to nearest tick (1/den)
    const snapped = Math.round(pos * den) / den;
    return Math.max(0, Math.min(1, snapped));
  }

  function placeMarker(pos) {
    const rect = svgWrap.getBoundingClientRect();
    const svgScale = rect.width / SVG_W;
    const lineX0 = X0 * svgScale, lineX1 = X1 * svgScale;
    const pixelX = lineX0 + pos * (lineX1 - lineX0);
    marker.style.left = pixelX + 'px';
    marker.style.top = (44 * svgScale) + 'px';
    marker.style.display = 'block';
  }

  let dragging = false;

  tile.addEventListener('mousedown', startDrag);
  tile.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    tile.style.opacity = '0.5';
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const den = vraag.data.den;
    const raw = posFromEvent(e);
    const snapped = snapPos(raw, den);
    APP.nlMarkerPos = snapped;
    placeMarker(snapped);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    tile.style.opacity = '1';
    if (APP.nlMarkerPos !== null) {
      tile.style.visibility = 'hidden';
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onUp);
}

/* ═══════════════════════════════════════════════════════════════════════
   RESULTATEN
═══════════════════════════════════════════════════════════════════════ */
function renderResultaten() {
  const resultaten = getResultatenVoorStudent(APP.student.id);

  if (resultaten.length === 0) {
    return `${header('Mijn resultaten', '#dashboard')}
    <div class="main-content">
      <div class="empty-state"><div class="icon">📊</div><p>Je hebt nog geen opgaven gemaakt.</p></div>
    </div>`;
  }

  const groepen = [...new Set(LEERDOELEN.map(l => l.groep))];
  let tableRows = '';

  LEERDOELEN.forEach(ld => {
    const r = resultaten.filter(x => x.leerdoel === ld.id);
    if (r.length === 0) return;
    const goed = r.filter(x => x.goed).length;
    const pct = Math.round((goed / r.length) * 100);
    const fillClass = pct >= 70 ? '' : pct >= 40 ? 'amber' : 'red';
    tableRows += `<tr>
      <td><strong>${ld.id}</strong><br/><span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span></td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goed}</td>
      <td>
        <div class="pct-bar">
          <div class="pct-track"><div class="pct-fill ${fillClass}" style="width:${pct}%"></div></div>
          <span style="font-size:.82rem;min-width:30px">${pct}%</span>
        </div>
      </td>
    </tr>`;
  });

  return `${header('Mijn resultaten', '#dashboard')}
  <div class="main-content">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div>
          <strong>${APP.student.naam}</strong> &nbsp;·&nbsp; ${APP.student.klas}<br/>
          <span style="font-size:.85rem;color:var(--text-soft)">${resultaten.length} opgaven gemaakt</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="openDeelModal()">📤 Delen</button>
      </div>
      <table class="resultaten-tabel">
        <thead><tr>
          <th>Leerdoel</th><th style="text-align:center">Gemaakt</th>
          <th style="text-align:center">Goed</th><th>Score</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>
  <div id="deel-modal" style="display:none"></div>`;
}

function bindResultaten() {
  // openDeelModal is globally available
}

/* ═══════════════════════════════════════════════════════════════════════
   DOCENT
═══════════════════════════════════════════════════════════════════════ */
function renderDocent() {
  return `${header('Docentenomgeving', APP.student ? '#dashboard' : '#login')}
  <div class="main-content">
    <div class="card">
      <h2 style="color:var(--secondary);margin-bottom:8px">👩‍🏫 Docentenomgeving</h2>
      <p class="docent-intro">Plak hieronder de code die een leerling met je heeft gedeeld.</p>
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
    const code = document.getElementById('code-invoer').value.trim();
    const data = decodeerDeelCode(code);
    const zone = document.getElementById('docent-resultaten');
    if (!data || !data.student) {
      zone.innerHTML = `<div class="feedback-box wrong"><span class="feedback-icon">✗</span><div>Ongeldige code. Controleer of je de volledige code hebt ingeplakt (begint met XPLORE:).</div></div>`;
      return;
    }
    toonDocentResultaten(data, zone);
  });
}

function toonDocentResultaten(data, zone) {
  const { student, resultaten } = data;
  if (!resultaten || resultaten.length === 0) {
    zone.innerHTML = `<div class="card"><p>Geen resultaten gevonden voor ${student.naam}.</p></div>`;
    return;
  }

  let tableRows = '';
  LEERDOELEN.forEach(ld => {
    const r = resultaten.filter(x => x.leerdoel === ld.id);
    if (r.length === 0) return;
    const goed = r.filter(x => x.goed).length;
    const pct = Math.round((goed / r.length) * 100);
    const last = new Date(r[r.length - 1].tijdstip).toLocaleDateString('nl-NL');
    const fillClass = pct >= 70 ? '' : pct >= 40 ? 'amber' : 'red';
    tableRows += `<tr>
      <td><strong>${ld.id}</strong><br/><span style="font-size:.82rem;color:var(--text-soft)">${ld.titel}</span></td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goed}</td>
      <td>
        <div class="pct-bar">
          <div class="pct-track"><div class="pct-fill ${fillClass}" style="width:${pct}%"></div></div>
          <span style="font-size:.82rem;min-width:30px">${pct}%</span>
        </div>
      </td>
      <td style="font-size:.82rem;color:var(--text-soft)">${last}</td>
    </tr>`;
  });

  zone.innerHTML = `<div class="card fade-in">
    <div class="student-header">
      <h3>${student.naam}</h3>
      <p>${student.klas} &nbsp;·&nbsp; ${resultaten.length} opgaven</p>
    </div>
    <table class="resultaten-tabel">
      <thead><tr>
        <th>Leerdoel</th><th style="text-align:center">Gemaakt</th>
        <th style="text-align:center">Goed</th><th>Score</th><th>Laatste poging</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>`;
}
