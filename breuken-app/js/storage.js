/* ── Storage ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'bf_v1';

function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { studenten: [], resultaten: [] };
    data.resultaten = data.resultaten.map(r =>
      r.staat ? r : { ...r, staat: r.goed ? 'goed' : 'fout' }
    );
    return data;
  } catch {
    return { studenten: [], resultaten: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getHuidigeStudent() {
  try {
    return JSON.parse(sessionStorage.getItem('bf_current'))
        || JSON.parse(localStorage.getItem('bf_current'))
        || null;
  } catch {
    return null;
  }
}

function setHuidigeStudent(s) {
  const v = JSON.stringify(s);
  sessionStorage.setItem('bf_current', v);
  localStorage.setItem('bf_current', v);
}

function uitloggen() {
  sessionStorage.removeItem('bf_current');
  localStorage.removeItem('bf_current');
}

function registreerStudent(naam) {
  const data = loadData();
  let student = data.studenten.find(s => s.naam === naam);
  if (!student) {
    student = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      naam,
      aangemeldOp: new Date().toISOString()
    };
    data.studenten.push(student);
    saveData(data);
  }
  setHuidigeStudent(student);
  return student;
}

function slaResultaatOp(studentId, leerdoel, staat) {
  const staatStr = typeof staat === 'boolean' ? (staat ? 'goed' : 'fout') : staat;
  const goed = staatStr === 'goed' || staatStr === 'goed_na_fouten';
  const data = loadData();
  data.resultaten.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    studentId,
    leerdoel,
    goed,
    staat: staatStr,
    tijdstip: new Date().toISOString()
  });
  saveData(data);
}

function getResultatenVoorStudent(studentId) {
  return loadData().resultaten.filter(r => r.studentId === studentId);
}

function volledigeDeelCode(studentId) {
  const data = loadData();
  const student = data.studenten.find(s => s.id === studentId);
  const resultaten = data.resultaten.filter(r => r.studentId === studentId);
  const payload = { student, resultaten };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return 'XPLORE:' + btoa(binary);
}

function decodeerDeelCode(code) {
  try {
    const b64 = code.trim().replace(/^XPLORE:/, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
