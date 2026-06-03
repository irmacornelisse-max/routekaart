/* ── Storage ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'bf_v1';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { studenten: [], resultaten: [] };
  } catch {
    return { studenten: [], resultaten: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getHuidigeStudent() {
  try {
    return JSON.parse(sessionStorage.getItem('bf_current')) || null;
  } catch {
    return null;
  }
}

function setHuidigeStudent(s) {
  sessionStorage.setItem('bf_current', JSON.stringify(s));
}

function uitloggen() {
  sessionStorage.removeItem('bf_current');
}

function registreerStudent(naam, klas) {
  const data = loadData();
  let student = data.studenten.find(s => s.naam === naam && s.klas === klas);
  if (!student) {
    student = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      naam,
      klas,
      aangemeldOp: new Date().toISOString()
    };
    data.studenten.push(student);
    saveData(data);
  }
  setHuidigeStudent(student);
  return student;
}

function slaResultaatOp(studentId, leerdoel, opgaveData, antwoord, goed, poging) {
  const data = loadData();
  data.resultaten.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    studentId,
    leerdoel,
    opgaveData,
    antwoord,
    goed,
    poging,
    tijdstip: new Date().toISOString()
  });
  saveData(data);
}

function getResultatenVoorStudent(studentId) {
  return loadData().resultaten.filter(r => r.studentId === studentId);
}

function maakDeelCode(studentId) {
  const data = loadData();
  const student = data.studenten.find(s => s.id === studentId);
  const resultaten = data.resultaten.filter(r => r.studentId === studentId);
  const payload = { student, resultaten };
  return 'XPL-' + btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).slice(0, 20).replace(/[+/=]/g, c => ({ '+': 'A', '/': 'B', '=': '' }[c]));
}

function volledigeDeelCode(studentId) {
  const data = loadData();
  const student = data.studenten.find(s => s.id === studentId);
  const resultaten = data.resultaten.filter(r => r.studentId === studentId);
  const payload = { student, resultaten };
  return 'XPLORE:' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeerDeelCode(code) {
  try {
    const b64 = code.replace('XPLORE:', '');
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}
