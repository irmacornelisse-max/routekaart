// ── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_KEY = 'xplore_routekaart_v1';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { leerlingen: {} };
  } catch {
    return { leerlingen: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Index lookups ──────────────────────────────────────────────────────────
function getAllLeerdoelen() {
  const map = {};
  CURRICULUM.secties.forEach(s => s.leerdoelen.forEach(l => { map[l.id] = { ...l, sectieId: s.id }; }));
  return map;
}

function getActiviteitenVoorLeerdoel(leerdoelId) {
  return CURRICULUM.activiteiten.filter(a => a.leerdoelen.includes(leerdoelId));
}

function getSectie(sectieId) {
  return CURRICULUM.secties.find(s => s.id === sectieId);
}

function getLeerdoel(leerdoelId) {
  const all = getAllLeerdoelen();
  return all[leerdoelId];
}

function getActiviteit(activiteitId) {
  return CURRICULUM.activiteiten.find(a => a.id === activiteitId);
}

// ── Progress calculation ────────────────────────────────────────────────────
function getLeerdoelStatus(leerlingData, leerdoelId) {
  if (!leerlingData) return null;
  return leerlingData.voortgang?.[leerdoelId] || null;
}

function getLeerdoelBestScore(leerlingData, leerdoelId) {
  const status = getLeerdoelStatus(leerlingData, leerdoelId);
  return status?.scoreLabel || null;
}

function isLeerdoelBehaald(leerlingData, leerdoelId) {
  return getLeerdoelBestScore(leerlingData, leerdoelId) === '80-100';
}

function getSectieStats(leerlingData, sectieId) {
  const sectie = getSectie(sectieId);
  if (!sectie) return { behaald: 0, bezig: 0, totaal: 0 };
  const totaal = sectie.leerdoelen.length;
  let behaald = 0, bezig = 0;
  sectie.leerdoelen.forEach(l => {
    const score = getLeerdoelBestScore(leerlingData, l.id);
    if (score === '80-100') behaald++;
    else if (score) bezig++;
  });
  return { behaald, bezig, totaal };
}

// ── Prerequisite auto-propagation ──────────────────────────────────────────
function propageerVoorkennis(leerlingData, leerdoelId, scoreLabel) {
  const allLeerdoelen = getAllLeerdoelen();
  const leerdoel = allLeerdoelen[leerdoelId];
  if (!leerdoel) return;

  leerdoel.voorkennis.forEach(vkId => {
    const existing = leerlingData.voortgang?.[vkId];
    const alBehaald = existing?.scoreLabel === '80-100';
    if (!alBehaald) {
      if (!leerlingData.voortgang) leerlingData.voortgang = {};
      leerlingData.voortgang[vkId] = {
        scoreLabel: scoreLabel,
        auto: true,
        datum: new Date().toISOString(),
        bewijs: null
      };
      propageerVoorkennis(leerlingData, vkId, scoreLabel);
    }
  });
}

// ── Score an activity for a student ────────────────────────────────────────
function slaActiviteitOp(leerlingId, activiteitId, scoreLabel, bewijsBase64) {
  const data = loadData();
  if (!data.leerlingen[leerlingId]) return;
  const leerling = data.leerlingen[leerlingId];

  if (!leerling.activiteiten) leerling.activiteiten = {};
  leerling.activiteiten[activiteitId] = {
    scoreLabel,
    datum: new Date().toISOString(),
    bewijs: bewijsBase64 || null
  };

  const activiteit = getActiviteit(activiteitId);
  if (activiteit && activiteit.leerdoelen.length > 0) {
    if (!leerling.voortgang) leerling.voortgang = {};
    activiteit.leerdoelen.forEach(ldId => {
      const existing = leerling.voortgang[ldId];
      const scorePriority = { '80-100': 3, '60-80': 2, '0-60': 1 };
      const newPriority = scorePriority[scoreLabel] || 0;
      const oldPriority = scorePriority[existing?.scoreLabel] || 0;
      if (newPriority > oldPriority) {
        leerling.voortgang[ldId] = {
          scoreLabel,
          auto: false,
          datum: new Date().toISOString(),
          bewijs: bewijsBase64 || existing?.bewijs || null
        };
      }
      if (scoreLabel === '80-100') {
        propageerVoorkennis(leerling, ldId, '80-100');
      }
    });
  }
  saveData(data);
}

// ── Image resize helper ─────────────────────────────────────────────────────
function resizeImageBase64(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth; }
      if (h > maxHeight) { w = w * maxHeight / h; h = maxHeight; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  view: 'login',
  params: {},
  pendingBewijs: null,
  pendingBewijsNaam: null
};

function navigate(view, params = {}) {
  state.view = view;
  state.params = params;
  render();
  window.scrollTo(0, 0);
}

// ── Render dispatcher ──────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  const data = loadData();
  const leerlingId = data.huidigeLeerling;
  const leerling = leerlingId ? data.leerlingen[leerlingId] : null;

  switch (state.view) {
    case 'login':    app.innerHTML = renderLogin(data); break;
    case 'home':     app.innerHTML = renderHome(leerling); break;
    case 'sectie':   app.innerHTML = renderSectie(leerling, state.params.sectieId); break;
    case 'leerdoel': app.innerHTML = renderLeerdoel(leerling, state.params.leerdoelId); break;
    case 'afronden': app.innerHTML = renderAfronden(leerling, state.params.activiteitId, state.params.leerdoelId); break;
  }
  bindEvents();
}

// ── SVG Progress circle ────────────────────────────────────────────────────
function progressCircle(behaald, totaal, kleur, size = 80) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct = totaal > 0 ? behaald / totaal : 0;
  const dash = pct * circ;
  const cx = size / 2, cy = size / 2;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="progress-circle">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E8E8E8" stroke-width="7"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${kleur}" stroke-width="7"
        stroke-dasharray="${dash} ${circ}"
        stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="14" font-weight="700" fill="${kleur}">${behaald}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10" fill="#888">/ ${totaal}</text>
    </svg>`;
}

// ── Score badge ────────────────────────────────────────────────────────────
function scoreBadge(scoreLabel, auto) {
  if (!scoreLabel) return '';
  const cfg = {
    '80-100': { cls: 'badge-groen', tekst: '80–100%' },
    '60-80':  { cls: 'badge-amber', tekst: '60–80%' },
    '0-60':   { cls: 'badge-oranje', tekst: '0–60%' },
  };
  const c = cfg[scoreLabel] || {};
  const autoLabel = auto ? ' <span class="badge-auto" title="Automatisch behaald via hoger leerdoel">★</span>' : '';
  return `<span class="badge ${c.cls}">${c.tekst}${autoLabel}</span>`;
}

// ── Soort badge ────────────────────────────────────────────────────────────
function soortBadge(soort) {
  const map = {
    'uitleg': 'badge-blauw',
    'verwerken': 'badge-paars',
    'uitleg/verwerken': 'badge-paars',
    'holistisch': 'badge-teal',
    'oriënteren': 'badge-grijs',
    'samenvatting': 'badge-grijs',
  };
  return `<span class="badge ${map[soort] || 'badge-grijs'}">${soort}</span>`;
}

// ── Views ──────────────────────────────────────────────────────────────────

function renderLogin(data) {
  const leerlingen = Object.values(data.leerlingen);
  const bestaandeOpties = leerlingen.length > 0
    ? `<div class="login-existing">
        <p class="login-existing-label">Of kies een bestaand account:</p>
        <div class="login-existing-list">
          ${leerlingen.map(l => `
            <button class="btn-existing" data-id="${l.id}">
              <span class="existing-naam">${escHtml(l.naam)}</span>
              <span class="existing-klas">${escHtml(l.klas || '')}</span>
            </button>`).join('')}
        </div>
      </div>` : '';

  return `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-xplore">xplore</div>
          <div class="logo-sub">Mijn Leerroute</div>
        </div>
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="naam">Jouw naam</label>
            <input type="text" id="naam" placeholder="Voornaam Achternaam" required autocomplete="name"/>
          </div>
          <div class="form-group">
            <label for="klas">Klas / groep</label>
            <input type="text" id="klas" placeholder="bijv. 1A" autocomplete="off"/>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Inloggen →</button>
        </form>
        ${bestaandeOpties}
      </div>
    </div>`;
}

function renderHome(leerling) {
  const naam = leerling?.naam || 'Leerling';
  const cards = CURRICULUM.secties.map(s => {
    const stats = getSectieStats(leerling, s.id);
    const pct = stats.totaal > 0 ? Math.round(stats.behaald / stats.totaal * 100) : 0;
    return `
      <button class="sectie-card" data-sectie="${s.id}" style="--sectie-kleur:${s.kleur}">
        <div class="sectie-card-top">
          <div class="sectie-id-badge" style="background:${s.kleur}">${s.id}</div>
          ${progressCircle(stats.behaald, stats.totaal, s.kleur, 72)}
        </div>
        <div class="sectie-card-naam">${escHtml(s.naam)}</div>
        <div class="sectie-card-sub">${stats.behaald} van ${stats.totaal} leerdoelen behaald</div>
        ${stats.bezig > 0 ? `<div class="sectie-card-bezig">${stats.bezig} bezig</div>` : ''}
      </button>`;
  }).join('');

  return `
    <div class="page">
      ${renderHeader(naam, null, null)}
      <main class="main-content">
        <div class="home-intro">
          <h1 class="home-title">Hoi ${escHtml(naam.split(' ')[0])}!</h1>
          <p class="home-sub">Klik op een sectie om je leerdoelen te bekijken.</p>
        </div>
        <div class="secties-grid">${cards}</div>
      </main>
    </div>`;
}

function renderSectie(leerling, sectieId) {
  const sectie = getSectie(sectieId);
  if (!sectie) return '<p>Sectie niet gevonden.</p>';

  const items = sectie.leerdoelen.map(l => {
    const scoreLabel = getLeerdoelBestScore(leerling, l.id);
    const status = getLeerdoelStatus(leerling, l.id);
    const auto = status?.auto || false;
    let rowCls = 'leerdoel-item';
    if (scoreLabel === '80-100') rowCls += ' ld-behaald';
    else if (scoreLabel === '60-80') rowCls += ' ld-amber';
    else if (scoreLabel === '0-60') rowCls += ' ld-bezig';

    const vkLabels = l.voorkennis.length > 0
      ? `<span class="ld-voorkennis">Vereist: ${l.voorkennis.join(', ')}</span>` : '';

    return `
      <button class="${rowCls}" data-leerdoel="${l.id}">
        <div class="ld-left">
          <span class="ld-nummer" style="background:${sectie.kleur}">${l.id}</span>
          <div class="ld-tekst">
            <span class="ld-naam">${escHtml(l.naam)}</span>
            ${vkLabels}
          </div>
        </div>
        <div class="ld-right">
          ${scoreBadge(scoreLabel, auto)}
          <span class="ld-arrow">›</span>
        </div>
      </button>`;
  }).join('');

  const stats = getSectieStats(leerling, sectieId);

  return `
    <div class="page">
      ${renderHeader(leerling?.naam || '', sectie.naam, 'home')}
      <main class="main-content">
        <div class="sectie-header" style="border-left: 4px solid ${sectie.kleur}">
          <div class="sectie-header-id" style="background:${sectie.kleur}">${sectie.id}</div>
          <div>
            <h2 class="sectie-title">${escHtml(sectie.naam)}</h2>
            <p class="sectie-progress-tekst">${stats.behaald} van ${stats.totaal} leerdoelen behaald</p>
          </div>
          <div class="sectie-circle">${progressCircle(stats.behaald, stats.totaal, sectie.kleur, 64)}</div>
        </div>
        <div class="leerdoelen-list">${items}</div>
      </main>
    </div>`;
}

function renderLeerdoel(leerling, leerdoelId) {
  const ld = getLeerdoel(leerdoelId);
  if (!ld) return '<p>Leerdoel niet gevonden.</p>';
  const sectie = getSectie(ld.sectieId);
  const activiteiten = getActiviteitenVoorLeerdoel(leerdoelId);
  const scoreLabel = getLeerdoelBestScore(leerling, leerdoelId);
  const status = getLeerdoelStatus(leerling, leerdoelId);

  const actCards = activiteiten.length > 0
    ? activiteiten.map(a => {
        const actStatus = leerling?.activiteiten?.[a.id];
        const gedaan = !!actStatus;
        return `
          <div class="activiteit-card ${gedaan ? 'act-gedaan' : ''}">
            <div class="act-top">
              <div class="act-info">
                <span class="act-naam">${escHtml(a.naam)}</span>
                <div class="act-meta">
                  <span class="act-bron">${escHtml(a.bron)}</span>
                  ${soortBadge(a.soort)}
                  <span class="act-niveau">${escHtml(a.niveau)}</span>
                  ${a.inloggen ? '<span class="badge badge-grijs">Inloggen vereist</span>' : ''}
                </div>
                ${a.bijzonderheden ? `<p class="act-bijzonderheden">${escHtml(a.bijzonderheden)}</p>` : ''}
              </div>
              ${gedaan ? scoreBadge(actStatus.scoreLabel, false) : ''}
            </div>
            <div class="act-acties">
              <a href="${a.url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
                Ga naar activiteit ↗
              </a>
              <button class="btn btn-primary btn-sm" data-afronden="${a.id}" data-leerdoel="${leerdoelId}">
                ${gedaan ? 'Opnieuw registreren' : 'Ik ben klaar →'}
              </button>
            </div>
            ${gedaan && actStatus.bewijs ? `<div class="act-bewijs-preview"><img src="${actStatus.bewijs}" alt="Bewijs"/></div>` : ''}
          </div>`;
      }).join('')
    : `<div class="geen-activiteiten">
        <p>Er zijn nog geen activiteiten beschikbaar voor dit leerdoel.</p>
        <p>Vraag je docent om activiteiten toe te voegen.</p>
      </div>`;

  const vkInfo = ld.voorkennis.length > 0 ? `
    <div class="ld-vk-info">
      <strong>Voorkennis:</strong>
      ${ld.voorkennis.map(vkId => {
        const vk = getLeerdoel(vkId);
        const vkScore = getLeerdoelBestScore(leerling, vkId);
        const vkBehaald = vkScore === '80-100';
        return `<span class="vk-chip ${vkBehaald ? 'vk-behaald' : 'vk-open'}">${vkId}: ${vk?.naam || vkId}</span>`;
      }).join('')}
    </div>` : '';

  return `
    <div class="page">
      ${renderHeader(leerling?.naam || '', `${ld.id}`, 'sectie', { sectieId: ld.sectieId })}
      <main class="main-content">
        <div class="leerdoel-header" style="border-left: 4px solid ${sectie?.kleur || '#ccc'}">
          <span class="ld-nummer-lg" style="background:${sectie?.kleur || '#ccc'}">${ld.id}</span>
          <div>
            <h2 class="leerdoel-title">${escHtml(ld.naam)}</h2>
            ${scoreLabel ? `<div class="ld-huidig-score">Beste score: ${scoreBadge(scoreLabel, status?.auto)}</div>` : '<p class="ld-nog-niet">Nog niet geoefend</p>'}
          </div>
        </div>
        ${vkInfo}
        <h3 class="activiteiten-titel">Activiteiten</h3>
        <div class="activiteiten-list">${actCards}</div>
      </main>
    </div>`;
}

function renderAfronden(leerling, activiteitId, leerdoelId) {
  const activiteit = getActiviteit(activiteitId);
  if (!activiteit) return '<p>Activiteit niet gevonden.</p>';
  const ld = getLeerdoel(leerdoelId);

  return `
    <div class="page">
      ${renderHeader(leerling?.naam || '', 'Activiteit afronden', 'leerdoel', { leerdoelId })}
      <main class="main-content">
        <div class="afronden-card">
          <h2 class="afronden-title">Activiteit afronden</h2>
          <p class="afronden-act-naam">${escHtml(activiteit.naam)}</p>
          ${ld ? `<p class="afronden-ld-naam">Leerdoel: <strong>${ld.id} – ${escHtml(ld.naam)}</strong></p>` : ''}

          <div class="score-vraag">
            <p class="score-label-titel">Hoe goed ging het?</p>
            <div class="score-knoppen">
              <label class="score-optie score-rood">
                <input type="radio" name="score" value="0-60" class="score-radio"/>
                <span class="score-pct">0–60%</span>
                <span class="score-desc">Nog veel te leren</span>
              </label>
              <label class="score-optie score-amber">
                <input type="radio" name="score" value="60-80" class="score-radio"/>
                <span class="score-pct">60–80%</span>
                <span class="score-desc">Grotendeels begrepen</span>
              </label>
              <label class="score-optie score-groen">
                <input type="radio" name="score" value="80-100" class="score-radio"/>
                <span class="score-pct">80–100%</span>
                <span class="score-desc">Goed begrepen!</span>
              </label>
            </div>
          </div>

          <div class="bewijs-sectie">
            <p class="bewijs-label">Bewijsmateriaal uploaden <span class="optioneel">(foto, printscreen of bestand)</span></p>
            <label class="upload-zone" id="uploadZone">
              <input type="file" id="bewijsInput" accept="image/*,.pdf" class="upload-input"/>
              <div class="upload-content" id="uploadContent">
                <span class="upload-icon">📎</span>
                <span class="upload-tekst">Klik om te uploaden of sleep een bestand hierheen</span>
              </div>
            </label>
            <div id="bewijsPreview" class="bewijs-preview" style="display:none"></div>
          </div>

          <div class="afronden-acties">
            <button class="btn btn-outline" data-terug="leerdoel" data-ld-terug="${leerdoelId}">Annuleren</button>
            <button class="btn btn-primary" id="opslaanBtn" data-act="${activiteitId}" data-ld="${leerdoelId}" disabled>
              Opslaan ✓
            </button>
          </div>
        </div>
      </main>
    </div>`;
}

function renderHeader(naam, paginaNaam, terugView, terugParams) {
  const terugBtn = terugView ? `
    <button class="header-terug" data-nav="${terugView}" ${terugParams ? `data-params='${JSON.stringify(terugParams)}'` : ''}>
      ← Terug
    </button>` : '';

  const afmeldenBtn = terugView !== null ? `
    <button class="header-afmelden" id="afmeldenBtn" title="Afmelden">
      ${escHtml(naam)} ×
    </button>` : '';

  return `
    <header class="app-header">
      <div class="header-left">
        <div class="header-logo" data-nav="home" style="cursor:pointer">
          <span class="logo-x">x</span><span class="logo-plore">plore</span>
        </div>
        ${terugBtn}
      </div>
      <div class="header-mid">
        ${paginaNaam ? `<span class="header-paginanaam">${escHtml(paginaNaam)}</span>` : ''}
      </div>
      <div class="header-right">
        ${afmeldenBtn}
      </div>
    </header>`;
}

// ── Event binding ──────────────────────────────────────────────────────────
function bindEvents() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const naam = document.getElementById('naam').value.trim();
      const klas = document.getElementById('klas').value.trim();
      if (!naam) return;
      loginLeerling(naam, klas);
    });
  }

  // Bestaande leerling knoppen
  document.querySelectorAll('.btn-existing').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const data = loadData();
      data.huidigeLeerling = id;
      saveData(data);
      navigate('home');
    });
  });

  // Sectie kaarten
  document.querySelectorAll('[data-sectie]').forEach(btn => {
    btn.addEventListener('click', () => navigate('sectie', { sectieId: btn.dataset.sectie }));
  });

  // Leerdoel knoppen
  document.querySelectorAll('[data-leerdoel]').forEach(btn => {
    btn.addEventListener('click', () => navigate('leerdoel', { leerdoelId: btn.dataset.leerdoel }));
  });

  // Activiteit afronden knoppen
  document.querySelectorAll('[data-afronden]').forEach(btn => {
    btn.addEventListener('click', () => navigate('afronden', {
      activiteitId: btn.dataset.afronden,
      leerdoelId: btn.dataset.leerdoel
    }));
  });

  // Terug navigatie
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const params = btn.dataset.params ? JSON.parse(btn.dataset.params) : {};
      navigate(btn.dataset.nav, params);
    });
  });

  document.querySelectorAll('[data-terug]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.terug;
      const params = {};
      if (btn.dataset.ldTerug) params.leerdoelId = btn.dataset.ldTerug;
      if (btn.dataset.leerdoel) params.leerdoelId = btn.dataset.leerdoel;
      if (btn.dataset.sectie) params.sectieId = btn.dataset.sectie;
      navigate(view, params);
    });
  });

  // Afmelden
  const afmeldenBtn = document.getElementById('afmeldenBtn');
  if (afmeldenBtn) {
    afmeldenBtn.addEventListener('click', () => {
      const data = loadData();
      delete data.huidigeLeerling;
      saveData(data);
      navigate('login');
    });
  }

  // Score knoppen – enable opslaan wanneer geselecteerd
  document.querySelectorAll('.score-radio').forEach(radio => {
    radio.addEventListener('change', () => {
      const btn = document.getElementById('opslaanBtn');
      if (btn) btn.disabled = false;
      document.querySelectorAll('.score-optie').forEach(opt => opt.classList.remove('selected'));
      if (radio.checked) radio.closest('.score-optie').classList.add('selected');
    });
  });

  // Bestand upload
  const bewijsInput = document.getElementById('bewijsInput');
  if (bewijsInput) {
    bewijsInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      state.pendingBewijsNaam = file.name;
      if (file.type.startsWith('image/')) {
        resizeImageBase64(file, 800, 600, b64 => {
          state.pendingBewijs = b64;
          const preview = document.getElementById('bewijsPreview');
          const content = document.getElementById('uploadContent');
          if (preview) {
            preview.innerHTML = `<img src="${b64}" alt="Bewijs preview"/><span class="bewijs-naam">${escHtml(file.name)}</span>`;
            preview.style.display = 'flex';
          }
          if (content) content.style.display = 'none';
        });
      } else {
        state.pendingBewijs = null;
        const content = document.getElementById('uploadContent');
        if (content) content.innerHTML = `<span class="upload-icon">📄</span><span class="upload-tekst">${escHtml(file.name)}</span>`;
      }
    });
  }

  // Upload zone drag-and-drop
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && bewijsInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        bewijsInput.files = dt.files;
        bewijsInput.dispatchEvent(new Event('change'));
      }
    });
  }

  // Opslaan knop
  const opslaanBtn = document.getElementById('opslaanBtn');
  if (opslaanBtn) {
    opslaanBtn.addEventListener('click', () => {
      const scoreInput = document.querySelector('.score-radio:checked');
      if (!scoreInput) return;
      const activiteitId = opslaanBtn.dataset.act;
      const leerdoelId = opslaanBtn.dataset.ld;
      const data = loadData();
      const leerlingId = data.huidigeLeerling;
      if (!leerlingId) return;

      slaActiviteitOp(leerlingId, activiteitId, scoreInput.value, state.pendingBewijs);
      state.pendingBewijs = null;
      state.pendingBewijsNaam = null;

      // Feedback tonen dan terug
      opslaanBtn.textContent = 'Opgeslagen! ✓';
      opslaanBtn.disabled = true;
      opslaanBtn.style.background = '#2E7D32';
      setTimeout(() => navigate('leerdoel', { leerdoelId }), 900);
    });
  }
}

// ── Login ──────────────────────────────────────────────────────────────────
function loginLeerling(naam, klas) {
  const data = loadData();
  const id = 'LL_' + naam.toLowerCase().replace(/\s+/g, '_') + '_' + (klas || '').toLowerCase();
  if (!data.leerlingen[id]) {
    data.leerlingen[id] = { id, naam, klas, voortgang: {}, activiteiten: {} };
  }
  data.huidigeLeerling = id;
  saveData(data);
  navigate('home');
}

// ── HTML escape ────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const data = loadData();
  if (data.huidigeLeerling && data.leerlingen[data.huidigeLeerling]) {
    navigate('home');
  } else {
    navigate('login');
  }
});
