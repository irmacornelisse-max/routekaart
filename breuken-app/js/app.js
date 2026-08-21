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
  timerInterval: null,
  tabelGecontroleerd: false,
  grafiekPunten: null,
  mqFormule: null,
};
window.APP = APP;

/* ── TOC structuur & state ────────────────────────────────────────────── */
const TOC_STATE = {
  _manuallyOpened: new Set(),
  _manuallyClosed: new Set(),
};

const TOC_HOOFDSTUKKEN = [
  {
    id: 'breuken', label: 'Breuken',
    secties: [
      {
        id: 'basis', label: 'Breuken basis',
        items: [
          { label: 'Teller en noemer herkennen', knoppen: [{l:'a',id:'B.0'}] },
          { label: 'Breuk op een getallenlijn',  knoppen: [{l:'a',id:'B.01a'},{l:'b',id:'B.01b'},{l:'c',id:'B.01c'}] },
          { label: 'Breuken vereenvoudigen',     knoppen: [{l:'a',id:'B.1'}] },
          { label: 'Breuken gelijknamig maken',  knoppen: [{l:'a',id:'B.3'}] },
        ]
      },
      {
        id: 'bewerkingen', label: 'Breuken bewerkingen',
        items: [
          { label: 'Optellen',                  knoppen: [{l:'a',id:'B.5'},{l:'b',id:'B.6'}] },
          { label: 'Aftrekken',                 knoppen: [{l:'a',id:'B.7'},{l:'b',id:'B.8'}] },
          { label: 'Optellen en aftrekken',     knoppen: [{l:'a',id:'H.B5678'}] },
          { label: 'Vermenigvuldigen',          knoppen: [{l:'a',id:'B.9'},{l:'b',id:'B.10'}] },
          { label: 'Delen',                     knoppen: [{l:'a',id:'B.11'},{l:'b',id:'B.12'}] },
          { label: 'Vermenigvuldigen en delen', knoppen: [{l:'a',id:'H.B9to12'}] },
          { label: 'Alle bewerkingen',          knoppen: [{l:'a',id:'C.allBreuk'}] },
        ]
      },
      {
        id: 'omrekenen', label: 'Breuken omrekenen',
        items: [
          { label: 'Van en naar percentages',  knoppen: [{l:'a',id:'BP.1'},{l:'b',id:'BP.2'}] },
          { label: 'Van en naar decimalen',    knoppen: [{l:'a',id:'BD.1'},{l:'b',id:'BD.2'}] },
          { label: 'Van en naar verhoudingen', knoppen: [{l:'a',id:'BV.1'},{l:'b',id:'BV.2'}] },
        ]
      },
    ]
  },
  {
    id: 'getallen', label: 'Gehele getallen',
    secties: [
      {
        id: 'nat', label: 'Natuurlijke getallen',
        items: [
          { label: 'Optellen',          knoppen: [{l:'a',id:'G.1'}] },
          { label: 'Aftrekken',         knoppen: [{l:'a',id:'G.2'}] },
          { label: 'Vermenigvuldigen',  knoppen: [{l:'a',id:'G.3'}] },
          { label: 'Delen',             knoppen: [{l:'a',id:'G.4'}] },
          { label: 'Kwadrateren',       knoppen: [{l:'a',id:'G.5'}] },
          { label: 'Worteltrekken',     knoppen: [{l:'a',id:'G.6'}] },
          { label: 'Machtsverheffen',   knoppen: [{l:'a',id:'G.14'}] },
          { label: 'Alle bewerkingen',  knoppen: [{l:'a',id:'C.natGetallen'},{l:'b',id:'C.natGetallen.b'},{l:'c',id:'C.natGetallen.c'}] },
        ]
      },
      {
        id: 'neg', label: 'Negatieve getallen',
        items: [
          { label: 'Vergelijken',       knoppen: [{l:'a',id:'G.7'}] },
          { label: 'Optellen',          knoppen: [{l:'a',id:'G.8'}] },
          { label: 'Aftrekken',         knoppen: [{l:'a',id:'G.9'}] },
          { label: 'Vermenigvuldigen',  knoppen: [{l:'a',id:'G.10'}] },
          { label: 'Delen',             knoppen: [{l:'a',id:'G.11'}] },
          { label: 'Kwadrateren',       knoppen: [{l:'a',id:'G.12'}] },
          { label: 'Machtsverheffen',   knoppen: [{l:'a',id:'G.15'}] },
          { label: 'Alle bewerkingen',  knoppen: [{l:'a',id:'C.negGetallen'},{l:'b',id:'C.negGetallen.b'},{l:'c',id:'C.negGetallen.c'}] },
        ]
      },
      {
        id: 'eigen', label: 'Eigenschappen',
        items: [
          { label: 'Deelbaar, priem, kwadraat', knoppen: [{l:'a',id:'G.16'}] },
        ]
      },
    ]
  },
  {
    id: 'procenten', label: 'Procenten',
    secties: [
      {
        id: 'pct-berekenen', label: 'Procenten berekenen',
        items: [
          { label: 'Hoeveel % is X van Y',           knoppen: [{l:'a',id:'P.1a'},{l:'b',id:'P.1b'}] },
          { label: 'Geheel bij deel en %',            knoppen: [{l:'a',id:'P.2a'},{l:'b',id:'P.2b'}] },
          { label: 'Procentuele verandering',         knoppen: [{l:'a',id:'P.3a'},{l:'b',id:'P.3b'}] },
          { label: 'Nieuwe waarde na toename',        knoppen: [{l:'a',id:'P.4a'},{l:'b',id:'P.4b'}] },
          { label: 'Nieuwe waarde na afname',         knoppen: [{l:'a',id:'P.5a'},{l:'b',id:'P.5b'}] },
          { label: 'Oorspronkelijk bij toename',      knoppen: [{l:'a',id:'P.6a'},{l:'b',id:'P.6b'}] },
          { label: 'Oorspronkelijk bij afname',       knoppen: [{l:'a',id:'P.7a'},{l:'b',id:'P.7b'}] },
          { label: 'Opeenvolgende toe-/afnames',      knoppen: [{l:'a',id:'P.8a'},{l:'b',id:'P.8b'}] },
          { label: 'Procenten – afwisselend',         knoppen: [{l:'a',id:'H.P1tot7'}] },
        ]
      },
      {
        id: 'pct-omrekenen', label: 'Procenten omrekenen',
        items: [
          { label: 'Percentage ↔ decimaal', knoppen: [{l:'→d',id:'DP.1'},{l:'d→',id:'DP.2'}] },
          { label: 'Percentage ↔ verhouding', knoppen: [{l:'→v',id:'PV.1'},{l:'v→',id:'PV.2'}] },
        ]
      },
    ]
  },
  {
    id: 'algebra', label: 'Herleiden',
    secties: [
      {
        id: 'alg-optellen', label: 'Optellen en aftrekken',
        items: [
          { label: 'Optellen en aftrekken', knoppen: [{l:'a',id:'A.O1a'},{l:'b',id:'A.O1b'},{l:'c',id:'A.O1c'}] },
        ]
      },
      {
        id: 'alg-vermenigvuldigen', label: 'Vermenigvuldigen',
        items: [
          { label: 'Vermenigvuldigen', knoppen: [{l:'a',id:'A.V1a'},{l:'b',id:'A.V1b'},{l:'c',id:'A.V1c'}] },
        ]
      },
      {
        id: 'alg-gemengd', label: 'Gemengd',
        items: [
          { label: 'Optellen, aftrekken en vermenigvuldigen', knoppen: [{l:'a',id:'A.M1a'},{l:'b',id:'A.M1b'}] },
        ]
      },
      {
        id: 'alg-delen', label: 'Delen',
        items: [
          { label: 'Delen', knoppen: [{l:'a',id:'A.D1a'},{l:'b',id:'A.D1b'}] },
        ]
      },
      {
        id: 'alg-haakjes', label: 'Haakjes uitwerken',
        items: [
          { label: 'Haakjes uitwerken', knoppen: [{l:'a',id:'A.H1a'},{l:'b',id:'A.H1b'},{l:'c',id:'A.H1c'},{l:'d',id:'A.H1d'}] },
        ]
      },
      {
        id: 'alg-factoren', label: 'Ontbinden in factoren',
        items: [
          { label: 'Ontbinden in factoren', knoppen: [{l:'a',id:'A.F1a'},{l:'b',id:'A.F1b'},{l:'c',id:'A.F1c'}] },
        ]
      },
      {
        id: 'alg-machten', label: 'Machtsverheffen',
        items: [
          { label: 'Machtsverheffen', knoppen: [{l:'a',id:'A.MV1a'},{l:'b',id:'A.MV1b'},{l:'c',id:'A.MV1c'},{l:'d',id:'A.MV1d'}] },
        ]
      },
      {
        id: 'alg-wortels', label: 'Breuken met wortels',
        items: [
          { label: 'Breuken met wortels', knoppen: [{l:'a',id:'W.R1a'},{l:'b',id:'W.R1b'},{l:'c',id:'W.R1c'}] },
        ]
      },
    ]
  },
  {
    id: 'lineair', label: 'Lineaire verbanden',
    secties: [
      {
        id: 'lin-grafiek', label: 'Grafiek tekenen',
        items: [
          { label: 'Lineaire grafiek tekenen', knoppen: [{l:'a',id:'L.G1a'},{l:'b',id:'L.G1b'},{l:'c',id:'L.G1c'}] },
          { label: 'Grafiek bij tabel tekenen', knoppen: [{l:'a',id:'L.G2a'},{l:'b',id:'L.G2b'},{l:'c',id:'L.G2c'}] },
        ]
      },
      {
        id: 'lin-formule', label: 'Formule opstellen',
        items: [
          { label: 'Formule bij grafiek',  knoppen: [{l:'a',id:'L.F1a'},{l:'b',id:'L.F1b'},{l:'c',id:'L.F1c'}] },
          { label: 'Formule bij tabel',    knoppen: [{l:'a',id:'L.F2a'},{l:'b',id:'L.F2b'},{l:'c',id:'L.F2c'}] },
        ]
      },
      {
        id: 'lin-vergelijking', label: 'Lineaire vergelijkingen',
        items: [
          { label: 'Lineaire vergelijkingen', knoppen: [{l:'a',id:'L.V1a'},{l:'b',id:'L.V1b'},{l:'c',id:'L.V1c'},{l:'d',id:'L.V1d'},{l:'e',id:'L.V1e'}] },
        ]
      },
      {
        id: 'lin-ongelijkheid', label: 'Lineaire ongelijkheden',
        items: [
          { label: 'Lineaire ongelijkheden', knoppen: [{l:'a',id:'L.O1a'},{l:'b',id:'L.O1b'},{l:'c',id:'L.O1c'}] },
        ]
      },
      {
        id: 'lin-stelsel', label: 'Stelsels vergelijkingen',
        items: [
          { label: 'Stelsels vergelijkingen', knoppen: [{l:'a',id:'S.1a'},{l:'b',id:'S.1b'},{l:'c',id:'S.1c'}] },
        ]
      },
    ]
  },
  {
    id: 'kwadratisch', label: 'Kwadratische verbanden',
    secties: [
      {
        id: 'kw-vergelijking', label: 'Kwadratische vergelijkingen',
        items: [
          { label: 'Kwadratische vergelijkingen', knoppen: [{l:'a',id:'K.A1a'},{l:'b',id:'K.B1a'},{l:'c',id:'K.C1a'},{l:'d',id:'K.D1a'},{l:'e',id:'K.E1a'}] },
        ]
      },
    ]
  },
  {
    id: 'machtsverbanden', label: 'Machtsverbanden',
    secties: [
      {
        id: 'machts-vergelijking', label: 'Machtsvergelijkingen',
        items: [
          { label: 'Machtsvergelijkingen', knoppen: [{l:'a',id:'M.V1a'},{l:'b',id:'M.V1b'},{l:'c',id:'M.V1c'},{l:'d',id:'M.V1d'}] },
          { label: 'Specifieke vormen',   knoppen: [{l:'a',id:'M.V2a'},{l:'b',id:'M.V2b'}] },
          { label: 'Algemene vormen',    knoppen: [{l:'a',id:'M.V3a'},{l:'b',id:'M.V3b'},{l:'c',id:'M.V3c'},{l:'d',id:'M.V3d'},{l:'e',id:'M.V3e'}] },
        ]
      },
    ]
  },
  {
    id: 'eenheden', label: 'Eenheden',
    secties: [
      {
        id: 'eenheden-omrekenen', label: 'Eenheden omrekenen',
        items: [
          { label: 'Tijdseenheden',       knoppen: [{l:'a',id:'E.T1a'},{l:'b',id:'E.T1b'},{l:'c',id:'E.T1c'}] },
          { label: 'Lengtematen',         knoppen: [{l:'a',id:'E.L1a'},{l:'b',id:'E.L1b'},{l:'c',id:'E.L1c'}] },
          { label: 'Oppervlaktematen',    knoppen: [{l:'a',id:'E.O1a'},{l:'b',id:'E.O1b'},{l:'c',id:'E.O1c'}] },
          { label: 'Inhoudsmaten',        knoppen: [{l:'a',id:'E.I1'}] },
          { label: 'Snelheden',           knoppen: [{l:'a',id:'E.S1'}] },
          { label: 'Eenheden – afwisselend', knoppen: [{l:'a',id:'H.Eenheden'}] },
        ]
      },
    ]
  },
];

function _tocHoofdstukBevatActief(hoofdstukId, actiefId) {
  if (!actiefId) return false;
  const hfst = TOC_HOOFDSTUKKEN.find(h => h.id === hoofdstukId);
  return hfst?.secties.some(s => s.items.some(item => item.knoppen.some(k => k.id === actiefId))) ?? false;
}

function _isTocHoofdstukOpen(hoofdstukId, actiefId) {
  if (TOC_STATE._manuallyClosed.has('h:' + hoofdstukId)) return false;
  if (TOC_STATE._manuallyOpened.has('h:' + hoofdstukId)) return true;
  if (actiefId) return _tocHoofdstukBevatActief(hoofdstukId, actiefId);
  return false;
}

function _isTocSectieOpen(sectieId, actiefId) {
  if (TOC_STATE._manuallyClosed.has(sectieId)) return false;
  if (TOC_STATE._manuallyOpened.has(sectieId)) return true;
  if (actiefId) {
    for (const hfst of TOC_HOOFDSTUKKEN) {
      const s = hfst.secties.find(s => s.id === sectieId);
      if (s) return s.items.some(item => item.knoppen.some(k => k.id === actiefId));
    }
    return false;
  }
  return false;
}

function dotKlasse(r) {
  if (r.staat === 'goed') return 'dot-goed';
  if (r.staat === 'goed_na_fouten') return 'dot-geel';
  if (r.goed) return 'dot-goed';
  return 'dot-fout';
}

function maakVoortgangDots(resultaten, leerdoelId) {
  const last5 = resultaten.filter(r => r.leerdoel === leerdoelId).slice(-5);
  return last5.map(r => `<span class="voortgang-dot ${dotKlasse(r)}">${r.metTijdlimiet ? 'T' : ''}</span>`).join('')
    + Array(Math.max(0, 5 - last5.length)).fill('<span class="voortgang-dot"></span>').join('');
}

/* ── Leerdoel-filter via URL (?leerdoelen=B.1,B.3,B.5) ────────────────────────
   De docent kan een link delen waarin alleen bepaalde leerdoelen zichtbaar
   zijn. Het filter wordt voor de hele sessie bewaard zodat het ook na
   hash-navigatie of herladen actief blijft. Het filtert puur op id, dus
   nieuwe leerdoelen in LEERDOELEN werken automatisch mee. */
const LEERDOEL_FILTER_KEY = 'bf_leerdoel_filter';

function leesLeerdoelFilterUitURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('leerdoelen');
  if (raw === null) return;
  const bekende = new Set(LEERDOELEN.map(l => l.id));
  const ids = raw.split(',').map(s => s.trim()).filter(s => bekende.has(s));
  if (ids.length) {
    sessionStorage.setItem(LEERDOEL_FILTER_KEY, JSON.stringify(ids));
  } else {
    sessionStorage.removeItem(LEERDOEL_FILTER_KEY);
  }
}

function getLeerdoelFilter() {
  try {
    const v = JSON.parse(sessionStorage.getItem(LEERDOEL_FILTER_KEY));
    return Array.isArray(v) && v.length ? v : null;
  } catch {
    return null;
  }
}

function getZichtbareLeerdoelen() {
  const filter = getLeerdoelFilter();
  if (!filter) return LEERDOELEN;
  const set = new Set(filter);
  const zichtbaar = LEERDOELEN.filter(l => set.has(l.id));
  return zichtbaar.length ? zichtbaar : LEERDOELEN;
}

function leerdoelZichtbaar(id) {
  return getZichtbareLeerdoelen().some(l => l.id === id);
}

function renderToc(actiefId) {
  let html = '<nav class="toc-sidebar" aria-label="Inhoudsopgave">';

  TOC_HOOFDSTUKKEN.forEach(hfst => {
    const hfstHeeftItems = hfst.secties.some(s =>
      s.items.some(item => item.knoppen.some(k => leerdoelZichtbaar(k.id)))
    );
    if (!hfstHeeftItems) return;

    const hOpen = _isTocHoofdstukOpen(hfst.id, actiefId);
    html += `<div class="toc-hoofdstuk" data-hid="${hfst.id}">
      <button class="toc-hoofd" onclick="toggleTocHoofdstuk('${hfst.id}')" aria-expanded="${hOpen}">
        <span>${hfst.label}</span>
        <span class="toc-arrow">${hOpen ? '▾' : '▸'}</span>
      </button>
      <div class="toc-hoofd-body${hOpen ? '' : ' toc-gesloten'}">`;

    hfst.secties.forEach(sectie => {
      const sectieHeeftItems = sectie.items.some(item =>
        item.knoppen.some(k => leerdoelZichtbaar(k.id))
      );
      if (!sectieHeeftItems) return;

      const sOpen = hOpen && _isTocSectieOpen(sectie.id, actiefId);
      html += `<div class="toc-sectie" data-id="${sectie.id}">
        <button class="toc-sectie-header" onclick="toggleTocSectie('${sectie.id}')" aria-expanded="${sOpen}">
          <span>${sectie.label}</span>
          <span class="toc-arrow">${sOpen ? '▾' : '▸'}</span>
        </button>
        <div class="toc-sectie-body${sOpen ? '' : ' toc-gesloten'}">`;

      sectie.items.forEach(item => {
        const zichtbareKnoppen = item.knoppen.filter(k => leerdoelZichtbaar(k.id));
        if (!zichtbareKnoppen.length) return;
        html += `<div class="toc-item-row">
          <span class="toc-item-label">${item.label}</span>
          <span class="toc-item-badges">`;
        zichtbareKnoppen.forEach(k => {
          const isActief = k.id === actiefId;
          html += `<a class="toc-badge${isActief ? ' actief' : ''}" href="#oefenen/${k.id}" aria-label="${item.label} (${k.l})" title="${k.id}">${k.l}</a>`;
        });
        html += '</span></div>';
      });

      html += '</div></div>';
    });

    html += '</div></div>';
  });

  html += '</nav>';
  return html;
}

function toggleTocHoofdstuk(hoofdstukId) {
  const hfst = document.querySelector(`.toc-hoofdstuk[data-hid="${hoofdstukId}"]`);
  if (!hfst) return;
  const body = hfst.querySelector(':scope > .toc-hoofd-body');
  if (!body) return;
  const willOpen = body.classList.contains('toc-gesloten');
  if (willOpen) {
    TOC_STATE._manuallyClosed.delete('h:' + hoofdstukId);
    TOC_STATE._manuallyOpened.add('h:' + hoofdstukId);
  } else {
    TOC_STATE._manuallyOpened.delete('h:' + hoofdstukId);
    TOC_STATE._manuallyClosed.add('h:' + hoofdstukId);
  }
  body.classList.toggle('toc-gesloten', !willOpen);
  const arrow = hfst.querySelector(':scope > .toc-hoofd .toc-arrow');
  if (arrow) arrow.textContent = willOpen ? '▾' : '▸';
}

function toggleTocSectie(sectieId) {
  const sectie = document.querySelector(`.toc-sectie[data-id="${sectieId}"]`);
  if (!sectie) return;
  const body = sectie.querySelector('.toc-sectie-body');
  if (!body) return;
  const willOpen = body.classList.contains('toc-gesloten');
  if (willOpen) {
    TOC_STATE._manuallyClosed.delete(sectieId);
    TOC_STATE._manuallyOpened.add(sectieId);
  } else {
    TOC_STATE._manuallyOpened.delete(sectieId);
    TOC_STATE._manuallyClosed.add(sectieId);
  }
  body.classList.toggle('toc-gesloten', !willOpen);
  const arrow = sectie.querySelector('.toc-sectie-header .toc-arrow');
  if (arrow) arrow.textContent = willOpen ? '▾' : '▸';
}

/* ── Tijd-limiet via URL (?tijd=30) ──────────────────────────────────────────
   De docent kan een tijdslimiet per vraag meegeven in de link.
   tijd=30 geeft de leerling 30 seconden per vraag. */
const TIJD_KEY = 'bf_tijd_limiet';

function leesTijdFilterUitURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('tijd');
  if (raw === null) return;
  const secs = parseInt(raw, 10);
  if (secs >= 5 && secs <= 300) {
    sessionStorage.setItem(TIJD_KEY, secs.toString());
  } else {
    sessionStorage.removeItem(TIJD_KEY);
  }
}

function getTijdLimiet() {
  const v = sessionStorage.getItem(TIJD_KEY);
  const n = v ? parseInt(v, 10) : 0;
  return n >= 5 ? n : null;
}

/* ── Routing ─────────────────────────────────────────────────────────────── */
function route() {
  stopTimer();
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

  const focusTarget = app.querySelector('.main-content, .login-card, .oefenen-grid');
  if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus(); }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => { leesLeerdoelFilterUitURL(); leesTijdFilterUitURL(); initMathKeyboard(); route(); });

/* ── Header ──────────────────────────────────────────────────────────────── */
function header(title, backHash, rightHTML = '') {
  const back = backHash
    ? `<button class="btn-header btn-header-back" aria-label="Terug" onclick="window.location.hash='${backHash}'">&#8592;</button>`
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
    if (!naam || naam.length > 60) { inp.focus(); return; }
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

  const zichtbareLeerdoelen = getZichtbareLeerdoelen();
  const groepen = [...new Set(zichtbareLeerdoelen.map(l => l.groep))];
  let html = `${header('Oefenen met breuken', '',
    `<button class="btn-header" onclick="doUitloggen()">Uitloggen</button>`)}
  <div class="page-with-toc">
    ${renderToc()}
    <div class="toc-content"><div class="main-content">
    <div class="dashboard-welcome">
      <div>
        <div class="welcome-name">👋 Hallo, ${escHtml(APP.student.naam)}!</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="window.location.hash='#resultaten'">📊 Mijn resultaten</button>
    </div>`;

  groepen.forEach(groep => {
    html += `<div class="groep-header">${groep}</div><div class="leerdoel-grid">`;
    zichtbareLeerdoelen.filter(l => l.groep === groep).forEach(ld => {
      const s = getStats(ld.id);
      const sc = statusClass(s);
      const dots = maakDots(ld.id);
      html += `<button class="leerdoel-card" aria-label="${escHtml(ld.titel)} oefenen" onclick="window.location.hash='#oefenen/${ld.id}'">
        <div class="leerdoel-top">
          <div class="leerdoel-titel">${escHtml(ld.titel)}</div>
          <span class="badge-status ${sc}" aria-hidden="true" style="margin-left:auto"></span>
        </div>
        <div class="leerdoel-voortgang" aria-label="${s.goed} van ${s.totaal} goed">
          <div class="voortgang-dots" aria-hidden="true">${dots}</div>
          <span class="voortgang-label">${s.goed}/${s.totaal}</span>
        </div>
      </button>`;
    });
    html += `</div>`;
  });

  html += `</div></div></div><div id="deel-modal" style="display:none"></div>`;
  return html;
}

function doUitloggen() { uitloggen(); window.location.hash = '#login'; }

/* ═══════════════════════════════════════════════════════════════════════════
   OEFENEN
═══════════════════════════════════════════════════════════════════════════ */
function renderOefenen(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld || !leerdoelZichtbaar(leerdoelId)) return renderDashboard();

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
    APP.tabelGecontroleerd = false;
    APP.grafiekPunten = null;
  }
  if (!APP.huidigVraag) APP.huidigVraag = generateVraag(leerdoelId);

  const resultaten = getResultatenVoorStudent(APP.student.id);
  const dots = maakVoortgangDots(resultaten, leerdoelId);

  const vraag = APP.huidigVraag;
  const type = vraag.antwoordType;
  const useStepList = type !== 'mc' && type !== 'drag' && type !== 'two-fracs' && type !== 'kruistabel' && type !== 'grafiek' && type !== 'formule-lijn';
  const needsKbd = useStepList || type === 'two-fracs' || type === 'kruistabel' || type === 'formule-lijn';

  let antwoordInhoud = '';
  if (type === 'formule-lijn') {
    antwoordInhoud = `<div style="padding:10px 14px 4px">
      <div class="mq-field-box" id="mq-formule"></div>
    </div>`;
  } else if (type === 'two-fracs') {
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
  } else if (type === 'kruistabel') {
    antwoordInhoud = renderKruistabelUI(vraag);
  } else if (useStepList) {
    const extraTip = ((type === 'machtsvergelijking' && vraag.antwoord?.hasNeg) || type === 'kwadratisch' || type === 'vergelijking-mv')
      ? ' &nbsp;·&nbsp; <strong>v</strong> knop voor meerdere oplossingen: getal <strong>v</strong> getal'
      : type === 'stelsel'
      ? ' &nbsp;·&nbsp; Eindantwoord als coördinaat: <em>(x, y)</em>'
      : '';
    antwoordInhoud = `<div class="stap-lijst" id="stap-lijst"></div>
    <div class="stap-hint">Typ <kbd>3</kbd><kbd>/</kbd><kbd>4</kbd> voor een breuk &nbsp;·&nbsp; <kbd>→</kbd> om verder &nbsp;·&nbsp; <kbd>↑</kbd> om vorige te kopiëren${extraTip}</div>`;
  }

  const tijdLimiet = getTijdLimiet();
  const timerHTML = tijdLimiet ? `<span class="timer-display" id="timer-display">⏱ ${tijdLimiet}</span>` : '';

  return `${header(ld.titel, '#dashboard')}
  <div class="page-with-toc">
    ${renderToc(leerdoelId)}
    <div class="toc-content"><div class="main-content">
    <div class="oefenen-grid">
      <div class="oefenen-main">
        <div class="card fade-in">
          <div class="opgave-meta">
            <span class="opgave-nr">Opgave ${APP.opgaveNr}</span>
            ${timerHTML}
            <div class="opgave-dots">${dots}</div>
          </div>
          <div class="vraag-tekst" id="vraag-tekst">${vraag.vraag}</div>
          ${type === 'drag' ? renderDragArea(vraag) : ''}
          ${type === 'grafiek' ? renderGrafiekArea(vraag) : ''}
          ${type === 'formule-lijn' && vraag.data?.toon === 'grafiek' ? renderGrafiekLijn(vraag) : ''}
          ${type === 'mc' ? `<div class="mc-sectie">${renderMcOpties(vraag)}</div>` : ''}
        </div>
        <div class="oefenen-antwoord">
          ${antwoordInhoud}
          <div id="feedback-zone"></div>
          ${needsKbd ? getKeyboardHTML() : ''}
          <div class="actie-bar" id="actie-bar">
            <button class="btn btn-outline btn-sm" id="btn-hint" aria-label="Toon hint">💡 Hint</button>
            <button class="btn btn-ghost btn-sm" id="btn-oplossing" aria-label="Toon uitgewerkte oplossing">📖 Oplossing</button>
            <button class="btn btn-primary" id="btn-controleer" aria-label="Controleer antwoord"${type === 'kruistabel' ? ' style="display:none"' : ''}>✓ Controleer</button>
          </div>
        </div>
      </div>
      <aside class="oefenen-zij">
        <div id="hint-zone"></div>
        <div id="oplossing-zone"></div>
      </aside>
    </div>
  </div></div></div>`;
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

/* ── Grafiek area for L.G1a/b ────────────────────────────────────────────── */
function _extendLineToBounds(A, B, xMin, xMax, yMin, yMax) {
  const dx = B.x - A.x, dy = B.y - A.y;
  if (dx === 0 && dy === 0) return null;
  let tMin = -Infinity, tMax = Infinity;
  if (dx !== 0) {
    const t1 = (xMin - A.x) / dx, t2 = (xMax - A.x) / dx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (A.x < xMin || A.x > xMax) return null;
  if (dy !== 0) {
    const t1 = (yMin - A.y) / dy, t2 = (yMax - A.y) / dy;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (A.y < yMin || A.y > yMax) return null;
  if (tMin > tMax + 1e-9) return null;
  return { x1: A.x + tMin * dx, y1: A.y + tMin * dy, x2: A.x + tMax * dx, y2: A.y + tMax * dy };
}

function renderGrafiekArea(vraag) {
  const d = vraag.data;
  const { xMin, xMax, yMin, yMax, initA, initB } = d;
  const stapX = d.stapX ?? d.stap, stapY = d.stapY ?? d.stap;
  const CELL = 24, PL = 40, PR = 28, PT = 24, PB = 28;
  const gW = (xMax - xMin) / stapX, gH = (yMax - yMin) / stapY;
  const W = PL + gW * CELL + PR, H = PT + gH * CELL + PB;
  function sx(gx) { return PL + (gx - xMin) / stapX * CELL; }
  function sy(gy) { return PT + (yMax - gy) / stapY * CELL; }
  const ax = sx(0), ay = sy(0);
  const parts = [];

  for (let x = xMin; x <= xMax; x += stapX) {
    if (x !== 0) parts.push(`<line x1="${sx(x)}" y1="${PT}" x2="${sx(x)}" y2="${PT + gH * CELL}" stroke="#ddd" stroke-width="0.8"/>`);
  }
  for (let y = yMin; y <= yMax; y += stapY) {
    if (y !== 0) parts.push(`<line x1="${PL}" y1="${sy(y)}" x2="${PL + gW * CELL}" y2="${sy(y)}" stroke="#ddd" stroke-width="0.8"/>`);
  }

  const axEnd = PL + gW * CELL + 8, ayEnd = PT - 8;
  parts.push(`<line x1="${PL}" y1="${ay}" x2="${axEnd}" y2="${ay}" stroke="#999" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${axEnd + 6},${ay} ${axEnd},${ay - 4} ${axEnd},${ay + 4}" fill="#999"/>`);
  parts.push(`<line x1="${ax}" y1="${PT + gH * CELL}" x2="${ax}" y2="${ayEnd}" stroke="#999" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${ax},${ayEnd - 6} ${ax - 4},${ayEnd} ${ax + 4},${ayEnd}" fill="#999"/>`);
  parts.push(`<text x="${axEnd + 10}" y="${ay + 4}" font-size="12" fill="#666" font-style="italic">x</text>`);
  parts.push(`<text x="${ax + 5}" y="${ayEnd - 2}" font-size="12" fill="#666" font-style="italic">y</text>`);

  parts.push(`<text x="${ax - 3}" y="${ay + 13}" font-size="10" fill="#888" text-anchor="end">0</text>`);
  for (let x = xMin; x <= xMax; x += stapX) {
    if (x !== 0) parts.push(`<text x="${sx(x)}" y="${ay + 14}" font-size="10" fill="#888" text-anchor="middle">${x}</text>`);
  }
  for (let y = yMin; y <= yMax; y += stapY) {
    if (y !== 0) parts.push(`<text x="${ax - 4}" y="${sy(y) + 4}" font-size="10" fill="#888" text-anchor="end">${y}</text>`);
  }

  const ext = _extendLineToBounds(initA, initB, xMin, xMax, yMin, yMax);
  const lx1 = ext ? sx(ext.x1) : sx(initA.x), ly1 = ext ? sy(ext.y1) : sy(initA.y);
  const lx2 = ext ? sx(ext.x2) : sx(initB.x), ly2 = ext ? sy(ext.y2) : sy(initB.y);
  parts.push(`<line id="grafiek-lijn" x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#e84141" stroke-width="2.5"/>`);

  const [cax, cay] = [sx(initA.x), sy(initA.y)];
  const [cbx, cby] = [sx(initB.x), sy(initB.y)];
  parts.push(`<circle id="grafiek-pt-A" cx="${cax}" cy="${cay}" r="8" fill="#1976d2" stroke="white" stroke-width="2" style="cursor:grab"/>`);
  parts.push(`<text id="grafiek-lbl-A" x="${cax + 10}" y="${cay - 6}" font-size="12" fill="#1976d2" font-weight="bold">A</text>`);
  parts.push(`<circle id="grafiek-pt-B" cx="${cbx}" cy="${cby}" r="8" fill="white" stroke="#1976d2" stroke-width="2" style="cursor:grab"/>`);
  parts.push(`<text id="grafiek-lbl-B" x="${cbx + 10}" y="${cby - 6}" font-size="12" fill="#1976d2" font-weight="bold">B</text>`);

  return `<div style="overflow-x:auto;margin:12px 0;text-align:center">
    <svg id="grafiek-svg" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"
      style="background:white;border:1px solid #e0e0e0;border-radius:6px;user-select:none;touch-action:none;max-width:100%">
      ${parts.join('\n      ')}
    </svg>
    <p style="font-size:.82rem;color:var(--text-soft);text-align:center;margin-top:4px">Sleep de punten naar de juiste plek op de lijn.</p>
  </div>`;
}

function initGrafiek(vraag) {
  const d = vraag.data;
  const { xMin, xMax, yMin, yMax, initA, initB } = d;
  const stapX = d.stapX ?? d.stap, stapY = d.stapY ?? d.stap;
  APP.grafiekPunten = { A: { ...initA }, B: { ...initB } };
  const CELL = 24, PL = 40, PT = 24;

  function toSX(gx) { return PL + (gx - xMin) / stapX * CELL; }
  function toSY(gy) { return PT + (yMax - gy) / stapY * CELL; }
  function snapX(v) { return Math.max(xMin, Math.min(xMax, Math.round(v / stapX) * stapX)); }
  function snapY(v) { return Math.max(yMin, Math.min(yMax, Math.round(v / stapY) * stapY)); }

  function updateDisplay() {
    const A = APP.grafiekPunten.A, B = APP.grafiekPunten.B;
    const ptA = document.getElementById('grafiek-pt-A');
    const ptB = document.getElementById('grafiek-pt-B');
    if (!ptA || !ptB) return;
    ptA.setAttribute('cx', toSX(A.x)); ptA.setAttribute('cy', toSY(A.y));
    ptB.setAttribute('cx', toSX(B.x)); ptB.setAttribute('cy', toSY(B.y));
    const la = document.getElementById('grafiek-lbl-A');
    const lb = document.getElementById('grafiek-lbl-B');
    if (la) { la.setAttribute('x', toSX(A.x) + 10); la.setAttribute('y', toSY(A.y) - 6); }
    if (lb) { lb.setAttribute('x', toSX(B.x) + 10); lb.setAttribute('y', toSY(B.y) - 6); }
    const lijn = document.getElementById('grafiek-lijn');
    if (lijn) {
      const ext = (A.x !== B.x || A.y !== B.y)
        ? _extendLineToBounds(A, B, xMin, xMax, yMin, yMax) : null;
      if (ext) {
        lijn.setAttribute('x1', toSX(ext.x1)); lijn.setAttribute('y1', toSY(ext.y1));
        lijn.setAttribute('x2', toSX(ext.x2)); lijn.setAttribute('y2', toSY(ext.y2));
        lijn.style.display = '';
      } else {
        lijn.style.display = 'none';
      }
    }
  }

  const svg = document.getElementById('grafiek-svg');
  if (!svg) return;
  let dragging = null;

  function getSVGCoords(e) {
    const pt = svg.createSVGPoint();
    const src = e.touches ? e.touches[0] : e;
    pt.x = src.clientX; pt.y = src.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return {
      x: snapX((p.x - PL) / CELL * stapX + xMin),
      y: snapY(yMax - (p.y - PT) / CELL * stapY),
    };
  }

  document.getElementById('grafiek-pt-A')?.addEventListener('mousedown', e => { dragging = 'A'; e.preventDefault(); });
  document.getElementById('grafiek-pt-B')?.addEventListener('mousedown', e => { dragging = 'B'; e.preventDefault(); });
  svg.addEventListener('mousemove', e => { if (!dragging) return; APP.grafiekPunten[dragging] = getSVGCoords(e); updateDisplay(); });
  svg.addEventListener('mouseup', () => { dragging = null; });
  svg.addEventListener('mouseleave', () => { dragging = null; });
  document.getElementById('grafiek-pt-A')?.addEventListener('touchstart', e => { dragging = 'A'; e.preventDefault(); }, { passive: false });
  document.getElementById('grafiek-pt-B')?.addEventListener('touchstart', e => { dragging = 'B'; e.preventDefault(); }, { passive: false });
  svg.addEventListener('touchmove', e => { if (!dragging) return; e.preventDefault(); APP.grafiekPunten[dragging] = getSVGCoords(e); updateDisplay(); }, { passive: false });
  svg.addEventListener('touchend', () => { dragging = null; });

  updateDisplay();
}

/* ── Grafiek met getekende lijn (formule-lijn vragen) ───────────────────── */
function renderGrafiekLijn(vraag) {
  const d = vraag.data;
  const { xMin, xMax, yMin, yMax, m, b } = d;
  const stapX = d.stapX ?? d.stap, stapY = d.stapY ?? d.stap;
  const CELL = 24, PL = 40, PR = 28, PT = 24, PB = 28;
  const gW = (xMax - xMin) / stapX, gH = (yMax - yMin) / stapY;
  const W = PL + gW * CELL + PR, H = PT + gH * CELL + PB;
  function sx(gx) { return PL + (gx - xMin) / stapX * CELL; }
  function sy(gy) { return PT + (yMax - gy) / stapY * CELL; }
  const ax = sx(0), ay = sy(0);
  const parts = [];

  for (let x = xMin; x <= xMax; x += stapX) {
    if (x !== 0) parts.push(`<line x1="${sx(x)}" y1="${PT}" x2="${sx(x)}" y2="${PT + gH * CELL}" stroke="#ddd" stroke-width="0.8"/>`);
  }
  for (let y = yMin; y <= yMax; y += stapY) {
    if (y !== 0) parts.push(`<line x1="${PL}" y1="${sy(y)}" x2="${PL + gW * CELL}" y2="${sy(y)}" stroke="#ddd" stroke-width="0.8"/>`);
  }
  const axEnd = PL + gW * CELL + 8, ayEnd = PT - 8;
  parts.push(`<line x1="${PL}" y1="${ay}" x2="${axEnd}" y2="${ay}" stroke="#999" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${axEnd + 6},${ay} ${axEnd},${ay - 4} ${axEnd},${ay + 4}" fill="#999"/>`);
  parts.push(`<line x1="${ax}" y1="${PT + gH * CELL}" x2="${ax}" y2="${ayEnd}" stroke="#999" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${ax},${ayEnd - 6} ${ax - 4},${ayEnd} ${ax + 4},${ayEnd}" fill="#999"/>`);
  parts.push(`<text x="${axEnd + 10}" y="${ay + 4}" font-size="12" fill="#666" font-style="italic">x</text>`);
  parts.push(`<text x="${ax + 5}" y="${ayEnd - 2}" font-size="12" fill="#666" font-style="italic">y</text>`);
  parts.push(`<text x="${ax - 3}" y="${ay + 13}" font-size="10" fill="#888" text-anchor="end">0</text>`);
  for (let x = xMin; x <= xMax; x += stapX) {
    if (x !== 0) parts.push(`<text x="${sx(x)}" y="${ay + 14}" font-size="10" fill="#888" text-anchor="middle">${x}</text>`);
  }
  for (let y = yMin; y <= yMax; y += stapY) {
    if (y !== 0) parts.push(`<text x="${ax - 4}" y="${sy(y) + 4}" font-size="10" fill="#888" text-anchor="end">${y}</text>`);
  }

  const ext = _extendLineToBounds({x: 0, y: b}, {x: 1, y: m + b}, xMin, xMax, yMin, yMax);
  if (ext) {
    parts.push(`<line x1="${sx(ext.x1)}" y1="${sy(ext.y1)}" x2="${sx(ext.x2)}" y2="${sy(ext.y2)}" stroke="#1976d2" stroke-width="2.5"/>`);
  }

  return `<div style="overflow-x:auto;margin:12px 0;text-align:center">
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"
      style="background:white;border:1px solid #e0e0e0;border-radius:6px;user-select:none;max-width:100%">
      ${parts.join('\n      ')}
    </svg>
  </div>`;
}

/* ── Kruistabel UI ───────────────────────────────────────────────────────── */
function renderKruistabelUI(vraag) {
  const { tl, tr, bl, br } = vraag.tabel.cellen;

  function celHtml(key, cel, isBottom) {
    const pct = isBottom ? ' <span class="kt-pct">%</span>' : '';
    if (cel.type === 'vraag') {
      return `<div class="kt-cel kt-cel-vraag"><span class="kt-vraagteken">?</span>${pct}</div>`;
    }
    if (cel.type === 'prefilled') {
      return `<div class="kt-cel kt-cel-prefilled">${cel.val}${pct}</div>`;
    }
    const ph = cel.hint ? ` placeholder="${cel.hint}"` : '';
    return `<div class="kt-cel kt-cel-input"><input type="text" class="kt-input" id="kt-input-${key}" inputmode="decimal" autocomplete="off"${ph}>${pct}</div>`;
  }

  return `<div class="kruistabel">
    <div class="kt-grid">
      ${celHtml('tl', tl, false)}${celHtml('tr', tr, false)}
      ${celHtml('bl', bl, true)}${celHtml('br', br, true)}
    </div>
    <div class="kt-check-bar">
      <button class="btn btn-primary btn-sm" id="btn-kt-check">✓ Controleer tabel</button>
      <span id="kt-feedback"></span>
    </div>
  </div>
  <div class="kt-antwoord-wrap" id="kt-antwoord-wrap" style="display:none">
    <div class="kt-antwoord-label">Bereken het antwoord:</div>
    <div class="stap-lijst" id="stap-lijst"></div>
    <div class="stap-hint">Typ bijv. <kbd>4*100/5</kbd> &nbsp;·&nbsp; <kbd>→</kbd> om verder &nbsp;·&nbsp; <kbd>↑</kbd> om vorige te kopiëren</div>
  </div>`;
}

function controleerTabel(vraag) {
  const cellen = vraag.tabel.cellen;
  let allGood = true;

  for (const key of ['tl', 'tr', 'bl', 'br']) {
    const cel = cellen[key];
    if (cel.type !== 'input') continue;
    const input = document.getElementById(`kt-input-${key}`);
    if (!input) continue;
    const val = parseFloat(input.value.replace(',', '.'));
    const correct = !isNaN(val) && Math.abs(val - cel.val) <= 0.005;
    input.classList.toggle('kt-input-goed', correct);
    input.classList.toggle('kt-input-fout', !correct);
    if (!correct) allGood = false;
  }

  const fb = document.getElementById('kt-feedback');
  if (allGood) {
    if (fb) fb.innerHTML = '<span class="kt-fb-goed">✓ Tabel klopt!</span>';
    document.getElementById('btn-kt-check').style.display = 'none';
    const wrap = document.getElementById('kt-antwoord-wrap');
    if (wrap) wrap.style.display = '';
    document.getElementById('btn-controleer').style.display = '';
    APP.tabelGecontroleerd = true;
    addNewActiveRow();
  } else {
    if (fb) fb.innerHTML = '<span class="kt-fb-fout">✗ Controleer de ingevulde waarden.</span>';
  }
}
window.controleerTabel = controleerTabel;

/* ── Wortel-in-noemer check ──────────────────────────────────────────────── */
function _hasRootInDenom(latex) {
  // Returns true if any \frac{...}{denom} has \sqrt in the denominator
  let s = latex, i = 0;
  while (i < s.length) {
    const fi = s.indexOf('\\frac{', i);
    if (fi < 0) break;
    let j = fi + 6, depth = 1;
    while (j < s.length && depth > 0) {
      if (s[j] === '{') depth++; else if (s[j] === '}') depth--;
      j++;
    }
    if (j >= s.length || s[j] !== '{') { i = fi + 1; continue; }
    j++;
    const ds = j; depth = 1;
    while (j < s.length && depth > 0) {
      if (s[j] === '{') depth++; else if (s[j] === '}') depth--;
      j++;
    }
    if (s.slice(ds, j - 1).includes('\\sqrt')) return true;
    i = fi + 1;
  }
  return false;
}

function _hasParens(latex) {
  return latex.includes('(') || latex.includes(')');
}

function _hasArithInDenom(latex) {
  let s = latex, i = 0;
  while (i < s.length) {
    const fi = s.indexOf('\\frac{', i);
    if (fi < 0) break;
    let j = fi + 6, depth = 1;
    while (j < s.length && depth > 0) {
      if (s[j] === '{') depth++; else if (s[j] === '}') depth--;
      j++;
    }
    if (j >= s.length || s[j] !== '{') { i = fi + 1; continue; }
    j++;
    depth = 1;
    let hasOp = false;
    while (j < s.length && depth > 0) {
      const c = s[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 1 && (c === '+' || c === '-')) hasOp = true;
      j++;
    }
    if (hasOp) return true;
    i = fi + 1;
  }
  return false;
}

/* ── Read student answer ─────────────────────────────────────────────────── */
function leesAntwoord(vraag) {
  const type = vraag.antwoordType;
  if (type === 'mc')      return { keuze: APP.mcKeuze };
  if (type === 'drag')    return { positie: APP.nlMarkerPos };
  if (type === 'grafiek') return { puntA: APP.grafiekPunten?.A, puntB: APP.grafiekPunten?.B };
  if (type === 'formule-lijn') return { latex: APP.mqFormule?.latex() || '' };
  if (type === 'two-fracs') {
    return { latex1: APP.mqField1?.latex() || '', latex2: APP.mqField2?.latex() || '' };
  }
  return { latex: APP.mqField1?.latex() || '' };
}

function valideerAntwoord(type, gegeven) {
  if (type === 'mc')         return gegeven.keuze !== null && gegeven.keuze !== undefined;
  if (type === 'drag')       return gegeven.positie !== null && gegeven.positie !== undefined;
  if (type === 'grafiek')      return !!(gegeven.puntA && gegeven.puntB);
  if (type === 'formule-lijn') return !!(gegeven.latex?.trim());
  if (type === 'two-fracs')  return !!(gegeven.latex1?.trim()) && !!(gegeven.latex2?.trim());
  if (type === 'kruistabel') return APP.tabelGecontroleerd && !!(gegeven.latex?.trim());
  return !!(gegeven.latex?.trim());
}

/* ── Check answer ────────────────────────────────────────────────────────── */
function checkAntwoord(vraag, gegeven) {
  const type = vraag.antwoordType;
  const correct = vraag.antwoord;

  if (type === 'mc')   return gegeven.keuze === correct.correct ? 'goed' : 'fout';
  if (type === 'drag') return Math.abs(gegeven.positie - correct.positie) <= 0.08 ? 'goed' : 'fout';

  if (type === 'grafiek') {
    const { puntA, puntB } = gegeven;
    const { m, b } = correct;
    if (!puntA || !puntB) return 'fout';
    if (puntA.x === puntB.x && puntA.y === puntB.y) return 'fout';
    const onA = Math.abs(puntA.y - (m * puntA.x + b)) < 1e-9;
    const onB = Math.abs(puntB.y - (m * puntB.x + b)) < 1e-9;
    return onA && onB ? 'goed' : 'fout';
  }

  if (type === 'ongelijkheid') {
    const { teller, noemer, operator } = correct;
    const expected = teller / noemer;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';

    const norm = s => s.replace(/\\leq\b/g, '\\le').replace(/\\geq\b/g, '\\ge');
    const normalized = norm(raw);
    const expectedOp = norm(operator);
    const applyOp = (op, a, b) =>
      op === '<' ? a < b : op === '>' ? a > b : op === '\\le' ? a <= b : a >= b;

    // Eindvorm: x [op] [waarde]
    const finalM = normalized.match(/^x\s*(\\le|\\ge|<|>)\s*(.+)$/);
    if (finalM) {
      if (finalM[1] !== expectedOp) return 'fout';
      try {
        const val = _algEval(finalM[2].trim(), {});
        if (typeof val === 'number' && isFinite(val) && Math.abs(val - expected) < 1e-9) return 'goed';
      } catch {}
      return 'fout';
    }

    // Tussenstap: lhs [op] rhs die equivalent is aan de verwachte ongelijkheid
    const ineqM = normalized.match(/^(.+?)(\\le|\\ge|<|>)(.+)$/);
    if (ineqM) {
      const above = expected + 0.001, below = expected - 0.001;
      const expAbove = applyOp(expectedOp, above, expected);
      const expBelow = applyOp(expectedOp, below, expected);
      try {
        const lhsA = _algEval(ineqM[1].trim(), { x: above });
        const rhsA = _algEval(ineqM[3].trim(), { x: above });
        const lhsB = _algEval(ineqM[1].trim(), { x: below });
        const rhsB = _algEval(ineqM[3].trim(), { x: below });
        if (applyOp(ineqM[2], lhsA, rhsA) === expAbove &&
            applyOp(ineqM[2], lhsB, rhsB) === expBelow) return 'tussenstap';
      } catch {}
    }
    return 'fout';
  }

  if (type === 'vergelijking') {
    const { teller, noemer } = correct;
    const expected = teller / noemer;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';

    // Eindvorm: x = [waarde]
    const stripped = raw.replace(/^x\s*=\s*/, '');
    if (stripped !== raw) {
      try {
        const val = _algEval(stripped, {});
        if (typeof val === 'number' && isFinite(val) && Math.abs(val - expected) < 1e-9) return 'goed';
      } catch {}
      return 'fout';
    }

    // Tussenstap: lhs = rhs die geldig is voor x = expected
    const parts = raw.split('=');
    if (parts.length === 2) {
      try {
        const lhs = _algEval(parts[0].trim(), { x: expected });
        const rhs = _algEval(parts[1].trim(), { x: expected });
        if (typeof lhs === 'number' && isFinite(lhs) && Math.abs(lhs - rhs) < 1e-9) return 'tussenstap';
      } catch {}
    }

    return 'fout';
  }

  if (type === 'machtsvergelijking') {
    const { inner, n, hasNeg, p = 0 } = correct;
    const rootVal = _mvNthRoot(inner, n);
    const expected_pos = rootVal - p;
    const expected_neg = hasNeg ? -rootVal - p : null;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';

    // "x = val1 v x = val2" (beide oplossingen via v-notatie; \; is MathQuill-spatie van v-knop)
    const rawV = raw.replace(/\\quad/g, '').replace(/\\;/g, '').replace(/\\text\s*\{[^}]*v[^}]*\}/g, 'v');
    const vMatch = rawV.match(/^x\s*=\s*(.+?)\s*v\s*x\s*=\s*(.+)$/);
    if (vMatch && hasNeg) {
      try {
        const v1 = _algEval(vMatch[1].trim(), {});
        const v2 = _algEval(vMatch[2].trim(), {});
        if (isFinite(v1) && isFinite(v2) &&
            ((Math.abs(v1 - expected_pos) < 1e-6 && Math.abs(v2 - expected_neg) < 1e-6) ||
             (Math.abs(v1 - expected_neg) < 1e-6 && Math.abs(v2 - expected_pos) < 1e-6)))
          return 'goed';
      } catch {}
      return 'fout';
    }

    // "x = \pm expr" (beide oplossingen via ±)
    const pmMatch = raw.match(/^x\s*=\s*\\pm\s*(.+)$/);
    if (pmMatch && hasNeg) {
      try {
        const val = _algEval(pmMatch[1].trim(), {});
        if (isFinite(val) && Math.abs(val - expected_pos) < 1e-6) return 'goed';
      } catch {}
      return 'fout';
    }

    // "x = expr" (enkelvoudige waarde)
    const eqMatch = raw.match(/^x\s*=\s*(.+)$/);
    if (eqMatch) {
      // Bij even macht zijn altijd twee oplossingen vereist
      if (hasNeg) return 'fout';
      try {
        const val = _algEval(eqMatch[1].trim(), {});
        if (isFinite(val) && Math.abs(val - expected_pos) < 1e-6) return 'goed';
      } catch {}
      return 'fout';
    }

    // Tussenstap: lhs = rhs geldig voor x = oplossing
    const parts = raw.split('=');
    if (parts.length === 2) {
      const testVals = [expected_pos, ...(hasNeg ? [expected_neg] : [])];
      for (const xv of testVals) {
        try {
          const lhs = _algEval(parts[0].trim(), { x: xv });
          const rhs = _algEval(parts[1].trim(), { x: xv });
          if (isFinite(lhs) && isFinite(rhs) && Math.abs(lhs - rhs) < 1e-6) return 'tussenstap';
        } catch {}
      }
    }
    return 'fout';
  }

  if (type === 'vergelijking-mv') {
    const { sols } = correct;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';
    const rawV = raw.replace(/\\quad/g, ' ').replace(/\\;/g, ' ').trim();

    // Eindantwoord: "x = val1 v x = val2 v ..."
    const xParts = rawV.split(/\s*v\s*(?=x\s*=)/);
    if (xParts.length === sols.length) {
      const parsed = [];
      let ok = true;
      for (const part of xParts) {
        const m = part.trim().match(/^x\s*=\s*(.+)$/);
        if (!m) { ok = false; break; }
        try {
          const v = _algEval(m[1].trim(), {});
          if (!isFinite(v)) { ok = false; break; }
          parsed.push(v);
        } catch { ok = false; break; }
      }
      if (ok && parsed.length === sols.length) {
        const sp = [...parsed].sort((a, b) => a - b);
        const ss = [...sols].sort((a, b) => a - b);
        if (sp.every((v, i) => Math.abs(v - ss[i]) < 1e-6)) return 'goed';
      }
    }

    // Tussenstap: alle oplossingen moeten door minstens één v-segment gedekt worden
    const segments = rawV.split(/\s*v\s*/);
    const covered = sols.map(() => false);
    for (const seg of segments) {
      const eqParts = seg.split('=');
      if (eqParts.length === 2) {
        for (let si = 0; si < sols.length; si++) {
          try {
            const lhs = _algEval(eqParts[0].trim(), { x: sols[si] });
            const rhs = _algEval(eqParts[1].trim(), { x: sols[si] });
            if (isFinite(lhs) && isFinite(rhs) && Math.abs(lhs - rhs) < 1e-6) covered[si] = true;
          } catch {}
        }
      }
    }
    if (covered.every(c => c)) return 'tussenstap';
    return 'fout';
  }

  if (type === 'kwadratisch') {
    const { sols, v, decimaal } = correct;
    const tol = decimaal ? 0.005 : 1e-6;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';

    // Normaliseer \quad (v-knop) naar spatie
    const rawV = raw.replace(/\\quad/g, ' ').replace(/\\;/g, ' ').trim();
    const vEsc = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // "v = val1 v v = val2" (v-notatie met variabelenaam v en separator 'v')
    const vMatch = rawV.match(new RegExp(`^${vEsc}\\s*=\\s*(.+?)\\s*v\\s*${vEsc}\\s*=\\s*(.+)$`));
    if (vMatch) {
      try {
        const n1 = _algEval(vMatch[1].trim(), {});
        const n2 = _algEval(vMatch[2].trim(), {});
        if (isFinite(n1) && isFinite(n2)) {
          const [s1, s2] = sols;
          if ((Math.abs(n1 - s1) <= tol && Math.abs(n2 - s2) <= tol) ||
              (Math.abs(n1 - s2) <= tol && Math.abs(n2 - s1) <= tol))
            return 'goed';
        }
      } catch {}
      return 'fout';
    }

    // Enkelvoudig "v = expr" is altijd fout (altijd twee oplossingen vereist)
    const simpleEq = rawV.match(new RegExp(`^${vEsc}\\s*=\\s*(.+)$`));
    if (simpleEq) return 'fout';

    // Tussenstap: geldige vergelijking (bijv. x² = 9) die klopt voor een van de oplossingen
    const parts = rawV.split('=');
    if (parts.length === 2) {
      for (const sol of sols) {
        try {
          const lhsV = _algEval(parts[0].trim(), { [v]: sol });
          const rhsV = _algEval(parts[1].trim(), { [v]: sol });
          if (isFinite(lhsV) && isFinite(rhsV) && Math.abs(lhsV - rhsV) < 1e-6)
            return 'tussenstap';
        } catch {}
      }
    }
    return 'fout';
  }

  if (type === 'stelsel') {
    const { x: xSol, y: ySol } = correct;
    const tol = 0.005;
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';

    // Normaliseer: verwijder \left, \right, \quad
    const rawV = raw
      .replace(/\\left/g, '').replace(/\\right/g, '')
      .replace(/\\quad/g, ' ').replace(/\\;/g, ' ')
      .trim();

    // Eindvorm: (val1, val2) — geordend paar (x,y) of (y,x) allebei goed
    const pairMatch = rawV.match(/^\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
    if (pairMatch) {
      try {
        const v1 = _algEval(pairMatch[1].trim(), {});
        const v2 = _algEval(pairMatch[2].trim(), {});
        if (isFinite(v1) && isFinite(v2)) {
          if (Math.abs(v1 - xSol) <= tol && Math.abs(v2 - ySol) <= tol)
            return 'goed';
        }
      } catch {}
      return 'fout';
    }

    // Tussenstap: geldige vergelijking die klopt voor de oplossing (x, y)
    const parts = rawV.split('=');
    if (parts.length === 2) {
      try {
        const lhs = _algEval(parts[0].trim(), { x: xSol, y: ySol });
        const rhs = _algEval(parts[1].trim(), { x: xSol, y: ySol });
        if (isFinite(lhs) && isFinite(rhs) && Math.abs(lhs - rhs) < 1e-6) return 'tussenstap';
      } catch {}
    }
    return 'fout';
  }

  if (type === 'formule-lijn') {
    const { m, b } = correct;
    const raw = (gegeven.latex || '').replace(/^y\s*=\s*/, '').trim();
    if (!raw) return 'fout';
    const formule = _lgFormule(m, b, vraag.data?.mDisplay);
    const expectedRhs = formule.replace('y = ', '');
    try {
      const res = checkAlgebraAntwoord(raw, expectedRhs, ['x']);
      return (res === 'goed' || res === 'tussenstap') ? 'goed' : 'fout';
    } catch { return 'fout'; }
  }

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

  if (type === 'wortelbreuk') {
    const raw = (gegeven.latex || '').replace(/\\left/g, '').replace(/\\right/g, '').trim();
    if (!raw) return 'fout';
    try {
      const given = _algEval(raw, {});
      if (typeof given === 'number' && isFinite(given) && Math.abs(given - correct.value) < 1e-9) {
        if (_hasRootInDenom(raw)) return 'tussenstap';
        if (_hasParens(raw)) return 'tussenstap';
        if (_hasArithInDenom(raw)) return 'tussenstap';
        return 'goed';
      }
    } catch {}
    return 'fout';
  }

  if (type === 'algebra') {
    const raw = (gegeven.latex || '').trim();
    if (!raw) return 'fout';
    if (correct.vorm === 'merkwaardig') {
      return checkAlgebraAntwoordMerkwaardig(raw, correct.expr, correct.vars);
    }
    if (correct.vorm === 'factored') {
      return checkAlgebraAntwoordGefactoriseerd(raw, correct.expr, correct.vars);
    }
    return checkAlgebraAntwoord(raw, correct.expr, correct.vars);
  }

  const rawLatex = gegeven.latex.replace(/\\%/g, '');
  const sv = evaluateLatex(rawLatex);
  if (sv === null || !isFinite(sv)) return 'fout';
  const cv = correcteWaarde(vraag);
  if (cv === null) return 'fout';

  const tol = vraag.antwoord.tolerantie;
  if (type === 'kruistabel' || type === 'percentage' || tol !== undefined) {
    const useTol = tol ?? (type === 'percentage' ? 0.05 : 0.005);
    if (Math.abs(sv - cv) > useTol) return 'fout';
    if (type === 'kruistabel') return isEindvorm(rawLatex) ? 'goed' : 'tussenstap';
    return 'goed';
  }

  if (Math.abs(sv - cv) > 1e-9) return 'fout';
  return isEindvorm(gegeven.latex) ? 'goed' : 'tussenstap';
}

/* ── Specific feedback ───────────────────────────────────────────────────── */
function feedbackBoodschap(vraag, gegeven) {
  if (vraag.antwoordType === 'grafiek') {
    const { puntA, puntB } = gegeven;
    const { m, b } = vraag.antwoord;
    if (!puntA || !puntB) return 'Sleep de punten naar de juiste plek op de lijn.';
    const onA = Math.abs(puntA.y - (m * puntA.x + b)) < 1e-9;
    const onB = Math.abs(puntB.y - (m * puntB.x + b)) < 1e-9;
    if (!onA && !onB) return 'Geen van beide punten ligt op de lijn. Bereken $y$ opnieuw via de formule.';
    if (!onA) {
      const ey = Math.round((m * puntA.x + b) * 1e9) / 1e9;
      return Number.isInteger(ey)
        ? `Punt A (${puntA.x}, ${puntA.y}) ligt niet op de lijn. Bij $x = ${puntA.x}$ hoort $y = ${ey}$.`
        : `Punt A (${puntA.x}, ${puntA.y}) ligt niet op de lijn. Kies een andere $x$-waarde voor A.`;
    }
    const ey = Math.round((m * puntB.x + b) * 1e9) / 1e9;
    return Number.isInteger(ey)
      ? `Punt B (${puntB.x}, ${puntB.y}) ligt niet op de lijn. Bij $x = ${puntB.x}$ hoort $y = ${ey}$.`
      : `Punt B (${puntB.x}, ${puntB.y}) ligt niet op de lijn. Kies een andere $x$-waarde voor B.`;
  }
  if (vraag.antwoordType === 'ongelijkheid') {
    const { teller, noemer, operator } = vraag.antwoord;
    const xStr = noemer === 1 ? `${teller}` : (teller < 0 ? `-\\dfrac{${-teller}}{${noemer}}` : `\\dfrac{${teller}}{${noemer}}`);
    return `Niet helemaal. Het antwoord is $x ${operator} ${xStr}$.`;
  }
  if (vraag.antwoordType === 'wortelbreuk') {
    const raw = (gegeven.latex || '').replace(/\\left/g, '').replace(/\\right/g, '').trim();
    if (_hasRootInDenom(raw)) {
      return 'Er staat nog een wortel in de noemer. Zorg dat het eindantwoord <strong>geen wortel in de noemer</strong> bevat.';
    }
    return 'Niet helemaal. Controleer je vereenvoudiging.';
  }
  if (vraag.antwoordType === 'vergelijking') {
    const { teller, noemer } = vraag.antwoord;
    const xStr = noemer === 1 ? `${teller}` : (teller < 0 ? `-\\dfrac{${-teller}}{${noemer}}` : `\\dfrac{${teller}}{${noemer}}`);
    return `Niet helemaal. Het antwoord is $x = ${xStr}$.`;
  }
  if (vraag.antwoordType === 'machtsvergelijking') {
    const { n, hasNeg } = vraag.antwoord;
    if (hasNeg) {
      return 'Er zijn twee oplossingen bij een even macht. Gebruik de <strong>v</strong> knop op het toetsenbord en typ de twee waarden met een v ertussen.';
    }
    const rootName = n === 2 ? 'vierkantswortel' : `$${n}$e-machtswortel`;
    return `Niet helemaal. Neem de ${rootName} van beide kanten en let op het teken.`;
  }
  if (vraag.antwoordType === 'kwadratisch') {
    const ld = vraag.leerdoel;
    if (ld === 'K.A1a') return 'Vergeet niet de vierkantswortel te nemen. Er zijn <strong>twee</strong> oplossingen — gebruik de <strong>v</strong>-knop.';
    if (ld === 'K.B1a') return 'Breng alles naar één kant, ontbind in factoren en gebruik de nulpuntsregel. Er zijn <strong>twee</strong> oplossingen.';
    if (ld === 'K.C1a') return 'Zoek de juiste factoren met de product-som methode. Vergeet niet: er zijn <strong>twee</strong> oplossingen.';
    if (ld === 'K.D1a') return 'Gebruik de abc-formule en rond af op <strong>2 decimalen</strong>. Geef twee oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'K.E1a') return 'Gebruik de abc-formule en geef het <strong>exacte</strong> antwoord met de wortel. Geen decimalen.';
    return 'Geef twee oplossingen met de <strong>v</strong>-knop.';
  }
  if (vraag.antwoordType === 'stelsel') {
    const ld = vraag.leerdoel;
    if (ld === 'S.1b') return 'Vermenigvuldig eerst één of beide vergelijkingen zodat coëfficiënten gelijk of tegengesteld worden. Geef het eindantwoord als coördinaat: <em>(x, y)</em>.';
    if (ld === 'S.1c') return 'Vul de uitdrukking voor $y$ (of $x$) uit vergelijking (1) direct in vergelijking (2) in. Geef het eindantwoord als coördinaat: <em>(x, y)</em>.';
    return 'Kijk naar de coëfficiënten: zijn ze gelijk? Dan aftrekken. Tegengesteld? Dan optellen. Geef het eindantwoord als coördinaat: <em>(x, y)</em>.';
  }
  if (vraag.antwoordType === 'vergelijking-mv') {
    const ld = vraag.leerdoel;
    if (ld === 'M.V2a') return 'Breng alles naar één kant, haal $x$ eruit en ontbind de kwadratische factor. Geef alle oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'M.V2b') return 'Substitueer $u = x^2$, los de kwadratische vergelijking in $u$ op en neem dan de vierkantswortel. Geef alle oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'M.V3a') return 'Nulpuntsregel: stel elke factor gelijk aan nul. Haal bij de eerste factor $x$ eruit; bij de tweede neem je de wortel. Geef alle oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'M.V3b') return 'Als $A^2 = B^2$, dan $A = B$ of $A = -B$. Werk beide gevallen uit en geef alle oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'M.V3c') return 'Haal de gemeenschappelijke factor eruit (niet wegdelen!) en gebruik de nulpuntsregel. Geef alle oplossingen met de <strong>v</strong>-knop.';
    if (ld === 'M.V3d') return 'Stel $u$ gelijk aan de herhaalde uitdrukking, breng naar links, haal $u$ eruit en gebruik de nulpuntsregel. Geef alle oplossingen met de <strong>v</strong>-knop.';
    return 'Geef alle oplossingen met de <strong>v</strong>-knop.';
  }
  if (vraag.antwoordType === 'formule-lijn') {
    const { m, b } = vraag.antwoord;
    const formule = _lgFormule(m, b, vraag.data?.mDisplay);
    return `Niet helemaal. De formule is $${formule}$.`;
  }
  if (vraag.antwoordType === 'two-fracs') {
    const f1 = parseSingleFracFromLatex(gegeven.latex1 || '');
    const f2 = parseSingleFracFromLatex(gegeven.latex2 || '');
    if (!f1 || !f2) return 'Voer twee breuken in, bijv. <em>4/12</em>.';
    if (f1 && f2 && f1.d !== f2.d) return 'De noemers zijn niet gelijk. Zorg dat beide breuken dezelfde noemer hebben.';
  }
  const tips = {
    'G.1':  'Tel de getallen op. Begin bij het grootste getal.',
    'G.2':  'Trek het kleinste getal af van het grootste.',
    'G.3':  'Gebruik de tafels. Controleer: a × b = b × a.',
    'G.4':  'Vraag: deeltal = deler × uitkomst. Welk getal past er?',
    'G.5':  'Kwadrateren = getal × zichzelf: $n^2 = n \\times n$.',
    'G.6':  'Vraag: welk getal × zichzelf geeft dit getal?',
    'G.7':  'Op de getallenlijn: groter getal = verder naar rechts. Bij negatieve getallen: dichter bij nul = groter.',
    'G.8':  'Gebruik de getallenlijn: negatief + positief → bepaal het verschil.',
    'G.9':  'Aftrekken van een negatief getal = optellen van het positieve getal.',
    'G.10': 'Vermenigvuldig de absolute waarden. Bepaal daarna het teken: − × + = −, − × − = +.',
    'G.11': 'Deel de absolute waarden. Bepaal het teken: − ÷ + = −, − ÷ − = +.',
    'G.12': 'Kwadraat van een negatief getal is altijd positief: $(−n)^2 = n^2$.',
    'G.14': 'Machtsverheffen: $a^n$ = $a$ keer zichzelf vermenigvuldigd $n$ keer.',
    'G.15': 'Let op het teken: een negatief getal tot een even macht is positief, tot een oneven macht negatief.',
    'G.16': 'Priemgetal: alleen deelbaar door 1 en zichzelf. Kwadraat: $1, 4, 9, 16, 25, ...$',
    'H.G1tot6':  'Kijk goed naar de bewerking en pas de juiste strategie toe.',
    'H.G8tot13': 'Bepaal eerst het teken van het antwoord, reken dan de absolute waarde uit.',
    'C.natGetallen':   'Let op de volgorde van bewerkingen: × en ÷ gaan vóór + en −.',
    'C.natGetallen.b': 'Volgorde: kwadraten en wortels eerst, dan × en ÷, dan + en −.',
    'C.natGetallen.c': 'Volgorde: machten eerst, dan × en ÷, dan + en −.',
    'C.negGetallen':   'Bereken stap voor stap en let op de tekens.',
    'C.negGetallen.b': 'Volgorde: haakjes eerst, dan kwadraten, dan × en ÷, dan + en −. Let op de tekens!',
    'C.negGetallen.c': 'Volgorde: haakjes eerst, dan machten, dan × en ÷, dan + en −. Let op de tekens!',
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
    'H.B5678':    'Bepaal of het een optelling of aftrekking is en werk stap voor stap.',
    'H.B9to12':   'Bepaal of het een vermenigvuldiging of deling is en werk stap voor stap.',
    'H.allBreuk': 'Herken de bewerking en pas de juiste strategie toe.',
    'H.omrekenen':'Herken de gevraagde omrekening en pas de juiste stappen toe.',
    'C.allBreuk': 'Let op de volgorde van bewerkingen: × en ÷ gaan vóór + en −.',
    'P.1a': 'Kruistabel: vul het geheel links in boven 100. Bereken dan via het kruis: deel × 100 ÷ geheel.',
    'P.1b': 'Kruistabel: vul het geheel links in boven 100. Rond het antwoord af op 1 decimaal als gevraagd.',
    'P.2a': 'Kruistabel: vul het bekende deel rechts in. Bereken dan via het kruis: deel × 100 ÷ %.',
    'P.2b': 'Kruistabel: vul het bekende deel rechts in. Bereken dan via het kruis: deel × 100 ÷ %.',
    'P.3a': 'Vul de beginwaarde en de absolute verandering in. Kruis: verandering × 100 ÷ beginwaarde.',
    'P.3b': 'Vul de beginwaarde links in, de absolute verandering rechts. Bereken het percentage via het kruis.',
    'P.4a': 'Kruistabel: vul de beginwaarde links in. Rechtsonder is 100% + het stijgingspercentage.',
    'P.4b': 'Kruistabel: vul de beginwaarde links in. Rechtsonder is 100% + het stijgingspercentage.',
    'P.5a': 'Kruistabel: vul de beginwaarde links in. Rechtsonder is 100% − het kortingspercentage.',
    'P.5b': 'Kruistabel: vul de beginwaarde links in. Rechtsonder is 100% − het kortingspercentage.',
    'P.6a': 'Kruistabel: vul de bekende nieuwe waarde rechts in. Rechtsonder: 100% + stijging.',
    'P.6b': 'Kruistabel: vul de bekende nieuwe waarde rechts in. Rechtsonder: 100% + stijging.',
    'P.7a': 'Kruistabel: vul de bekende nieuwe waarde rechts in. Rechtsonder: 100% − daling.',
    'P.7b': 'Kruistabel: vul de bekende nieuwe waarde rechts in. Rechtsonder: 100% − daling.',
    'P.8a': 'Werk in twee stappen: pas het eerste percentage toe, dan het tweede op de tussenuitkomst.',
    'P.8b': 'Werk in twee stappen. Gebruik factor × factor voor het eindresultaat.',
    'H.P1tot7': 'Lees de vraag goed: zoek het geheel, het deel of het percentage? Gebruik het kruistabel.',
    'DP.1': 'Deel het percentage door 100 om het decimaal getal te krijgen.',
    'DP.2': 'Vermenigvuldig het decimaal getal met 100 om het percentage te krijgen.',
    'PV.1': 'Deel het eerste getal door het tweede en vermenigvuldig met 100.',
    'PV.2': 'Schrijf het percentage als breuk met noemer 100 en vereenvoudig.',
    'E.T1a': 'Onthoud: 1 uur = 60 min, 1 min = 60 sec. Grotere eenheid → kleinere: vermenigvuldigen.',
    'E.T1b': 'Onthoud: 1 dag = 24 uur, 1 week = 7 dagen. Grotere eenheid → kleinere: vermenigvuldigen.',
    'E.T1c': 'Combineer de stappen: 1 uur = 3 600 sec, 1 dag = 1 440 min, 1 week = 168 uur = 10 080 min.',
    'E.L1a': 'Elke stap in de lengtematen is factor 10: mm → cm → dm → m. Kleiner worden: vermenigvuldigen.',
    'E.L1b': 'Van m naar km: deel door 1000. Van km naar m: vermenigvuldig met 1000. dam en hm: elke stap ×10.',
    'E.L1c': 'Tel de stappen: mm→cm→dm→m→dam→hm→km. Elke stap ×10 of ÷10. Combineer de factoren.',
    'E.O1a': 'Elke stap in oppervlaktematen is factor 100 (want 10² = 100): mm² → cm² → dm² → m².',
    'E.O1b': '1 km² = 100 ha, 1 ha = 100 are, dus 1 km² = 10 000 are.',
    'E.O1c': '1 are = 100 m², 1 ha = 10 000 m². Gebruik dit om van m² naar ha of are om te rekenen.',
    'E.I1': 'L ↔ dL ↔ cL ↔ mL: elke stap ×10 of ÷10. Onthoud: 1 dm³ = 1 L en 1 m³ = 1000 L.',
    'E.S1': '1 m/s = 3,6 km/h. Van m/s naar km/h: ×3,6. Van km/h naar m/s: ÷3,6.',
    'H.Eenheden': 'Kijk naar de eenheden: worden ze kleiner? Dan vermenigvuldig je. Groter? Dan deel je.',
    'A.O1a': 'Zoek gelijksoortige termen (dezelfde letter) en tel de coëfficiënten op.',
    'A.O1b': 'Combineer alle gelijksoortige termen: zelfde letter én zelfde macht bij elkaar.',
    'A.O1c': 'Let op de macht: $x^2$ en $x^3$ zijn verschillende termen en mogen niet worden gecombineerd.',
    'A.V1a': 'Vermenigvuldig de getallen met elkaar; de letter blijft staan.',
    'A.V1b': 'Vermenigvuldig de coëfficiënten; zijn de letters gelijk, tel dan de machten op.',
    'A.V1c': 'Vermenigvuldig alle coëfficiënten; tel de machten per letter bij elkaar op.',
    'A.M1a': 'Bereken eerst de vermenigvuldiging (vóór + en −), combineer dan gelijksoortige termen.',
    'A.M1b': 'Bereken eerst alle vermenigvuldigingen, combineer daarna gelijksoortige termen.',
    'A.D1a': 'Deel de coëfficiënten; trek de macht van de deler af van de macht van het deeltal.',
    'A.D1b': 'Deel de coëfficiënten; trek per letter de macht van de deler af van die van het deeltal.',
    'A.H1a': 'Vermenigvuldig elk getal tussen de haakjes met het getal ervoor (distributieve eigenschap).',
    'A.H1b': 'Let op het minteken: $-a(b + c) = -ab - ac$ en $-a(b - c) = -ab + ac$.',
    'A.H1c': 'Gebruik FOIL: eerste × eerste, buitenste, binnenste, laatste. Combineer daarna gelijksoortige termen.',
    'A.H1d': 'Gebruik de merkwaardige producten: $(a+b)^2$, $(a-b)^2$ of $(a+b)(a-b)$.',
    'A.F1a': 'Zoek de grootste gemene deler van de coëfficiënten en de laagste macht van de variabele.',
    'A.F1b': 'Zoek twee getallen $p$ en $q$ zodat $p + q = b$ en $p \\times q = c$ (bij $x^2 + bx + c$).',
    'A.F1c': 'Herken het patroon: $(a+b)^2$, $(a-b)^2$ of $(a+b)(a-b)$.',
    'A.MV1a': 'Vermenigvuldig de coëfficiënten; gebruik de productregel: $a^p \\cdot a^q = a^{p+q}$.',
    'A.MV1b': 'Gebruik: $(a^p)^q = a^{p \\cdot q}$ en $(ab)^p = a^p \\cdot b^p$.',
    'A.MV1c': 'Gebruik de deelregel: $\\dfrac{a^p}{a^q} = a^{p-q}$. Werk haakjes eerst uit.',
    'A.MV1d': 'Pas eerst de machtsregels toe op elk onderdeel, en tel daarna gelijksoortige termen op of trek ze af.',
    'L.G1a': 'Vul een x-waarde in de formule in om $y$ te berekenen. Beide punten moeten op de lijn liggen.',
    'L.G1b': 'Kies geschikte x-waarden zodat $y$ een geheel getal wordt. Beide punten moeten exact op de lijn liggen.',
    'L.G2a': 'Zoek twee rijen in de tabel en sleep punt A en punt B naar die coördinaten op het rooster.',
    'L.G2b': 'Gebruik twee punten uit de tabel. Let op de stapgrootte van de assen en de exacte rasterpositie.',
    'L.G1c': 'De x-as en y-as hebben verschillende stapgroottes. Lees de assen goed af voordat je de punten sleept.',
    'L.G2c': 'De x-as en y-as hebben verschillende stapgroottes. Lees de assen goed af en gebruik twee rijen uit de tabel.',
    'L.F1a': 'Zoek twee roosterpunten op de lijn en bereken $m$ en $b$. Typ de formule als rechterkant: bijv. $2x + 3$.',
    'L.F1b': 'Kies twee duidelijke roosterpunten op de lijn. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ en bepaal $b$.',
    'L.F1c': 'Let op de stapgroottes van de assen. Lees de coördinaten van twee punten af in eenheden, niet in vakjes.',
    'L.F2a': 'Bereken $m$ uit twee rijen in de tabel. Zoek daarna $b$ door een punt in de formule in te vullen.',
    'L.F2b': 'Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ precies. Bij een gebroken helling: typ bijv. $\\frac{1}{2}x + 3$.',
    'L.F2c': 'Let op de stapgroottes van de assen. Gebruik de werkelijke waarden uit de tabel, niet de positie in het rooster.',
    'L.V1a': 'Pas één bewerking toe op beide kanten tegelijk, zodat $x$ alleen komt te staan.',
    'L.V1b': 'Zet eerst alle $x$-termen naar links en alle getallen naar rechts. Deel daarna door de coëfficiënt van $x$.',
    'L.V1c': 'Werk eerst de haakjes uit. Dan heb je een vergelijking zonder haakjes en kun je verder oplossen.',
    'W.R1a': 'Schrijf de wortel in de noemer eenvoudiger (haal kwadraten eruit). Vermenigvuldig daarna teller én noemer met die wortel.',
    'W.R1b': 'Vermenigvuldig teller én noemer met de wortel in de noemer. Gebruik $\\sqrt{A}\\cdot\\sqrt{B} = \\sqrt{AB}$ en vereenvoudig de wortels.',
    'W.R1c': 'Gebruik het conjugaat: als de noemer $a + \\sqrt{b}$ is, vermenigvuldig met $\\dfrac{a - \\sqrt{b}}{a - \\sqrt{b}}$. Dan gebruik je $(a+\\sqrt{b})(a-\\sqrt{b}) = a^2 - b$.',
    'L.V1d': 'Vermenigvuldig beide kanten met $10$ om de kommagetallen te verwijderen. Dan los je de gewone vergelijking op.',
    'L.V1e': 'Vermenigvuldig beide kanten met de kgv van de noemers om de breuken weg te werken. Schrijf gemengde getallen eerst om naar gewone breuken.',
    'L.O1a': 'Pas dezelfde bewerking toe op beide kanten. Let op: het ongelijkheidsteken draait om bij delen door een negatief getal.',
    'L.O1b': 'Zet $x$-termen links en getallen rechts. Controleer het teken van de coëfficiënt vóór je deelt.',
    'L.O1c': 'Werk eerst de haakjes uit. Herschik daarna en let op het teken bij het delen.',
    'M.V2a': 'Breng alles naar één kant zodat de vergelijking $= 0$ is. Haal $x$ eruit → kwadratische vergelijking. Nulpuntsregel: elke factor $= 0$. Geef alle oplossingen met de v-knop.',
    'M.V2b': 'Stel $u = x^2$: dan wordt $x^4 = u^2$. Los de kwadratische in $u$ op, neem dan de vierkantswortel voor $x$ ($\\pm$). Geef alle oplossingen met de v-knop.',
    'M.V3a': 'Nulpuntsregel: $A \\cdot B = 0 \\Rightarrow A = 0$ of $B = 0$. Stel elke factor apart gelijk aan nul en los op. Geef alle oplossingen met de v-knop.',
    'M.V3b': 'Als $A^2 = B^2$, dan $A = B$ of $A = -B$. Werk beide gevallen uit en geef alle oplossingen met de v-knop.',
    'M.V3c': 'Zoek de gemeenschappelijke factor in beide termen. Breng alles naar één kant en haal de factor eruit. Niet wegdelen — gebruik de nulpuntsregel. Geef alle oplossingen met de v-knop.',
    'M.V3d': 'Stel $u$ gelijk aan de herhaalde uitdrukking. Dan wordt het $u^n = u$. Breng naar links, haal $u$ eruit en gebruik de nulpuntsregel. Geef alle oplossingen met de v-knop.',
    'M.V3e': 'Herken de vorm: is het $AB = 0$, $A^2 = B^2$, $AB = AC$ of $AB = A$? Gebruik dan de bijbehorende aanpak en geef alle oplossingen met de v-knop.',
    'M.V1a': 'Neem de nde-machtswortel van beide kanten. Bij een even macht zijn er twee oplossingen: gebruik $\\pm$.',
    'M.V1b': 'Deel eerst door de coëfficiënt, neem dan de nde-machtswortel. Bij een even macht: $\\pm$.',
    'M.V1c': 'Isoleer eerst $x^n$ door het losse getal naar rechts te brengen. Neem dan de wortel.',
    'M.V1d': 'Isoleer de haakjesterm, deel door de coëfficiënt, neem de wortel en breng $x$ vrij. Bij even macht: $\\pm$.',
    'K.A1a': 'Isoleer de kwadraatterm, neem de vierkantswortel van beide kanten en geef beide oplossingen met de v-knop.',
    'K.B1a': 'Breng alles naar één kant en ontbind in factoren. Pas de nulpuntsregel toe: elke factor gelijkstellen aan nul.',
    'K.C1a': 'Product-som methode: zoek twee getallen met het juiste product en de juiste som. Gebruik daarna de nulpuntsregel.',
    'K.D1a': 'Vul $a$, $b$ en $c$ in de abc-formule in: $v = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$. Rond af op 2 decimalen.',
    'K.E1a': 'Vul $a$, $b$ en $c$ in de abc-formule in. Vereenvoudig de wortel en de breuk volledig. Geef het exacte antwoord.',
    'S.1a': 'Vergelijk de coëfficiënten van $x$ en van $y$. Zijn ze gelijk? Dan aftrekken. Tegengesteld? Dan optellen. Geef het eindantwoord als $(x, y)$.',
    'S.1b': 'Vermenigvuldig één of beide vergelijkingen met een getal zodat een coëfficiënt gelijk of tegengesteld wordt. Dan optellen of aftrekken. Geef het eindantwoord als $(x, y)$.',
    'S.1c': 'Vergelijking $(1)$ geeft $y$ of $x$ al vrij. Vul die uitdrukking direct in vergelijking $(2)$ in. Geef het eindantwoord als $(x, y)$.',
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
  stopTimer();
  APP.huidigVraag = generateVraag(APP.huidigLeerdoel);
  APP.hintIdx = 0;
  APP.pogingen = 0;
  APP.opgaveNr++;
  APP.nlMarkerPos = null;
  APP.mcKeuze = null;
  APP.grafiekPunten = null;
  APP.mqFormule = null;
  APP.mqField1 = null;
  APP.mqField2 = null;
  APP.activeMQField = null;
  APP.stappen = [];
  APP.resultaatOpgeslagen = false;
  APP.tabelGecontroleerd = false;
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

  if (typeof MathQuill !== 'undefined' && type !== 'mc' && type !== 'drag' && type !== 'grafiek') {
    const MQ = MathQuill.getInterface(2);

    if (type === 'formule-lijn') {
      const el = document.getElementById('mq-formule');
      if (el) {
        APP.mqFormule = MQ.MathField(el, {
          spaceBehavesLikeTab: false,
          handlers: { enter: () => document.getElementById('btn-controleer')?.click() },
        });
        const ta = el.querySelector('textarea');
        if (ta) ta.addEventListener('focus', () => { APP.activeMQField = APP.mqFormule; });
        APP.activeMQField = APP.mqFormule;
        APP.mqFormule.focus();
      }
    } else if (type === 'two-fracs') {
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
    } else if (type !== 'kruistabel') {
      addNewActiveRow();
    }
  }

  if (type === 'kruistabel') {
    const hasInputCellen = ['tl','tr','bl','br'].some(k => vraag.tabel.cellen[k].type === 'input');
    if (!hasInputCellen) {
      setTimeout(() => controleerTabel(vraag), 0);
    } else {
      document.getElementById('btn-kt-check')?.addEventListener('click', () => controleerTabel(vraag));
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

  if (type === 'drag')    initDrag(vraag);
  if (type === 'grafiek') initGrafiek(vraag);

  document.getElementById('btn-hint')?.addEventListener('click', () => {
    if (APP.hintIdx >= vraag.hints.length) APP.hintIdx = 0;
    const hint = vraag.hints[APP.hintIdx++];
    const zone = document.getElementById('hint-zone');
    zone.innerHTML = `<div class="hint-box fade-in">
      <strong>💡 Hint ${APP.hintIdx} van ${vraag.hints.length}</strong>${hint}
    </div>`;
    renderKatex(zone);
    zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('btn-oplossing')?.addEventListener('click', () => {
    stopTimer();
    const zone = document.getElementById('oplossing-zone');
    if (zone.innerHTML) return;
    if (!APP.resultaatOpgeslagen) {
      slaResultaatOp(APP.student.id, vraag.leerdoel, 'fout', !!getTijdLimiet());
      APP.resultaatOpgeslagen = true;
    }
    zone.innerHTML = renderOplossing(vraag);
    renderKatex(zone);
    document.getElementById('btn-oplossing').disabled = true;
    zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toonNieuweVraagKnop();
  });

  document.getElementById('btn-controleer')?.addEventListener('click', () => controleer(vraag));

  const tijdLimiet = getTijdLimiet();
  if (tijdLimiet) startTimer(tijdLimiet);
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
    let sqrtPending = false;
    ta.addEventListener('keydown', e => {
      const _kq = APP.huidigVraag;
      const _needsV = (_kq?.antwoordType === 'machtsvergelijking' && _kq?.antwoord?.hasNeg)
                    || _kq?.antwoordType === 'kwadratisch'
                    || _kq?.antwoordType === 'vergelijking-mv';
      if (e.key === 'v' && _needsV) {
        e.preventDefault();
        mq.write('\\quad v\\quad');
        return;
      }
      if (e.key === '(' && /(?:^|[^a-zA-Z])sqrt$/.test(mq.latex())) {
        e.preventDefault();
        mq.keystroke('Backspace'); // t
        mq.keystroke('Backspace'); // r
        mq.keystroke('Backspace'); // q
        mq.keystroke('Backspace'); // s
        mq.cmd('\\sqrt');
        sqrtPending = true;
        return;
      }
      if (e.key === ')' && sqrtPending) {
        e.preventDefault();
        mq.keystroke('Right');
        sqrtPending = false;
        return;
      }
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
  const useStepList = type !== 'mc' && type !== 'drag' && type !== 'two-fracs' && type !== 'grafiek' && type !== 'formule-lijn';

  if (staat === 'goed') {
    stopTimer();
    if (!APP.resultaatOpgeslagen) {
      slaResultaatOp(APP.student.id, vraag.leerdoel, APP.pogingen > 0 ? 'goed_na_fouten' : 'goed', !!getTijdLimiet());
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
      stopTimer();
      const zone = document.getElementById('oplossing-zone');
      if (!zone.innerHTML) {
        if (!APP.resultaatOpgeslagen) {
          slaResultaatOp(APP.student.id, vraag.leerdoel, 'fout', !!getTijdLimiet());
          APP.resultaatOpgeslagen = true;
        }
        zone.innerHTML = renderOplossing(vraag);
        renderKatex(zone);
        zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toonNieuweVraagKnop();
      }
    }
  }
}

/* ── Timer ───────────────────────────────────────────────────────────────── */
function startTimer(secs) {
  stopTimer();
  let remaining = secs;
  _updateTimerEl(remaining);
  APP.timerInterval = setInterval(() => {
    remaining--;
    _updateTimerEl(remaining);
    if (remaining <= 0) { stopTimer(); _timerVervallen(); }
  }, 1000);
}

function stopTimer() {
  if (APP.timerInterval) { clearInterval(APP.timerInterval); APP.timerInterval = null; }
}

function _updateTimerEl(secs) {
  const el = document.getElementById('timer-display');
  if (!el) return;
  el.textContent = `⏱ ${secs}`;
  el.className = 'timer-display' + (secs <= 5 ? ' timer-urgent' : '');
}

function _timerVervallen() {
  if (!document.getElementById('timer-display')) return;
  const vraag = APP.huidigVraag;
  if (!vraag || APP.resultaatOpgeslagen) return;
  slaResultaatOp(APP.student.id, vraag.leerdoel, 'fout', !!getTijdLimiet());
  APP.resultaatOpgeslagen = true;
  toonFeedback('fout', '⏰ De tijd is om!');
  if (vraag.antwoordType === 'mc') kleurMcKnoppen(vraag);
  const zone = document.getElementById('oplossing-zone');
  if (zone && !zone.innerHTML) {
    zone.innerHTML = renderOplossing(vraag);
    renderKatex(zone);
  }
  ['btn-oplossing', 'btn-hint', 'btn-controleer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });
  toonNieuweVraagKnop();
  document.getElementById('oplossing-zone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const goedAantal = r.filter(x => x.goed).length;
    tableRows += `<tr>
      <td>${ld.titel}</td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goedAantal}</td>
      <td><div class="voortgang-dots">${dots}</div></td>
    </tr>`;
  });

  const totaalGoed = resultaten.filter(x => x.goed).length;

  return `${header('Mijn resultaten', '#dashboard')}
  <div class="main-content">
    <div class="card">
      <div class="resultaten-kop">
        <div>
          <strong>${escHtml(APP.student.naam)}</strong><br/>
          <span style="font-size:.85rem;color:var(--text-soft)">${resultaten.length} opgaven gemaakt · ${totaalGoed} goed</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="openDeelModal()">📤 Delen</button>
      </div>
      <table class="resultaten-tabel">
        <thead><tr>
          <th>Leerdoel</th>
          <th style="text-align:center">Gemaakt</th>
          <th style="text-align:center">Goed</th>
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
      document.getElementById('btn-copy').textContent = 'Selecteer en kopieer handmatig';
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOCENT
═══════════════════════════════════════════════════════════════════════════ */
function renderDocent() {
  const groepen = [...new Set(LEERDOELEN.map(l => l.groep))];
  let keuzelijst = '';
  groepen.forEach(groep => {
    keuzelijst += `<div class="ldsel-groep">${groep}</div><div class="ldsel-grid">`;
    LEERDOELEN.filter(l => l.groep === groep).forEach(ld => {
      keuzelijst += `<label class="ldsel-item">
        <input type="checkbox" class="ldsel-check" value="${ld.id}"/>
        <span>${ld.titel}</span>
      </label>`;
    });
    keuzelijst += `</div>`;
  });

  return `${header('Docentenomgeving', APP.student ? '#dashboard' : '#login')}
  <div class="main-content">
    <div class="card">
      <h2 style="color:var(--secondary);margin-bottom:8px">🔗 Oefenlink maken</h2>
      <p class="docent-intro">Kies de leerdoelen die je leerling te zien moet krijgen. Vink je niets aan, dan krijgt de leerling alle leerdoelen.</p>
      <div class="ldsel-acties">
        <button class="btn btn-ghost btn-sm" id="btn-ld-alle">Alles aanvinken</button>
        <button class="btn btn-ghost btn-sm" id="btn-ld-geen">Alles uitvinken</button>
      </div>
      ${keuzelijst}
      <div class="ldsel-tijdlimiet" style="margin-top:14px">
        <div class="ldsel-groep" style="margin-top:0">Tijdslimiet per vraag (optioneel)</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <input type="number" id="inp-tijd" min="5" max="300" placeholder="bijv. 30"
            style="width:90px;padding:6px 10px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.9rem;font-family:inherit"/>
          <span style="font-size:.85rem;color:var(--text-mid)">seconden (leeg = geen tijdslimiet)</span>
        </div>
        <button class="btn btn-primary" id="btn-genereer-link">Genereer link</button>
      </div>
      <div id="link-resultaat"></div>
    </div>
    <div class="card">
      <h2 style="color:var(--secondary);margin-bottom:8px">📊 Resultaten bekijken</h2>
      <p class="docent-intro">Plak hieronder de code die een leerling met je heeft gedeeld (begint met XPLORE:).</p>
      <textarea class="code-input-area" id="code-invoer" placeholder="XPLORE:..."></textarea>
      <div style="margin-top:12px">
        <button class="btn btn-primary" id="btn-decodeer">Bekijk resultaten</button>
      </div>
    </div>
    <div id="docent-resultaten"></div>
  </div>`;
}

function genereerOefenLink() {
  const gekozen = [...document.querySelectorAll('.ldsel-check:checked')].map(c => c.value);
  const basis = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  if (gekozen.length) params.set('leerdoelen', gekozen.join(','));
  const tijd = parseInt(document.getElementById('inp-tijd')?.value || '', 10);
  if (tijd >= 5 && tijd <= 300) params.set('tijd', tijd.toString());
  const qs = params.toString();
  return basis + (qs ? '?' + qs : '');
}

function bindDocent() {
  document.getElementById('btn-ld-alle')?.addEventListener('click', () => {
    document.querySelectorAll('.ldsel-check').forEach(c => c.checked = true);
  });
  document.getElementById('btn-ld-geen')?.addEventListener('click', () => {
    document.querySelectorAll('.ldsel-check').forEach(c => c.checked = false);
  });

  document.getElementById('btn-genereer-link')?.addEventListener('click', () => {
    const link = genereerOefenLink();
    const zone = document.getElementById('link-resultaat');
    zone.innerHTML = `<div class="link-box fade-in">
      <textarea id="link-area" class="code-display" readonly
        style="min-height:60px;resize:none;cursor:text;font-size:.8rem">${link}</textarea>
      <button class="btn btn-primary btn-sm" id="btn-copy-link" style="margin-top:8px">📋 Kopieer link</button>
    </div>`;
    const area = document.getElementById('link-area');
    area.addEventListener('focus', () => area.select());
    document.getElementById('btn-copy-link').addEventListener('click', () => {
      area.select();
      navigator.clipboard.writeText(link).then(() => {
        document.getElementById('btn-copy-link').textContent = '✓ Gekopieerd!';
      }).catch(() => {
        document.getElementById('btn-copy-link').textContent = 'Selecteer en kopieer handmatig';
      });
    });
  });

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
    zone.innerHTML = `<div class="card"><p>Geen resultaten voor ${escHtml(student.naam)}.</p></div>`;
    return;
  }

  let rows = '';
  LEERDOELEN.forEach(ld => {
    const r = resultaten.filter(x => x.leerdoel === ld.id);
    if (r.length === 0) return;
    const last = new Date(r[r.length - 1].tijdstip).toLocaleDateString('nl-NL');
    const dots = maakVoortgangDots(resultaten, ld.id);
    const goedAantal = r.filter(x => x.goed).length;
    rows += `<tr>
      <td>${ld.titel}</td>
      <td style="text-align:center">${r.length}</td>
      <td style="text-align:center">${goedAantal}</td>
      <td><div class="voortgang-dots">${dots}</div></td>
      <td style="font-size:.82rem;color:var(--text-soft)">${last}</td>
    </tr>`;
  });

  const totaalGoed = resultaten.filter(x => x.goed).length;

  zone.innerHTML = `<div class="card fade-in">
    <div class="student-header">
      <h3>${escHtml(student.naam)}</h3>
      <p>${resultaten.length} opgaven gemaakt · ${totaalGoed} goed</p>
    </div>
    <table class="resultaten-tabel">
      <thead><tr>
        <th>Leerdoel</th>
        <th style="text-align:center">Gemaakt</th>
        <th style="text-align:center">Goed</th>
        <th>Laatste 5</th>
        <th>Laatste poging</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}
