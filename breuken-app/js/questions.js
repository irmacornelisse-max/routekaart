/* ── Question Generators ────────────────────────────────────────────── */
/* Each generator returns a question object:
   { id, leerdoel, vraag, antwoordType, antwoord, hints[], oplossing, data }
*/

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── B.0 – Teller en noemer ─────────────────────────────────────────── */
function genB0() {
  const den = rand(2, 12);
  const num = rand(1, den - 1);
  const vraagTeller = Math.random() > 0.5;
  const breuk = `$\\dfrac{${num}}{${den}}$`;
  const woord = vraagTeller ? 'teller' : 'noemer';
  const antw = vraagTeller ? num : den;
  return {
    id: uid(), leerdoel: 'B.0',
    vraag: `Welk getal is de <strong>${woord}</strong> van de breuk ${breuk}?`,
    antwoordType: 'integer',
    antwoord: { waarde: antw },
    data: { num, den, vraagTeller },
    hints: [
      'De <strong>teller</strong> staat boven de breukstreep. De <strong>noemer</strong> staat eronder.',
      vraagTeller
        ? `In ${breuk} staat <strong>${num}</strong> boven de streep – dat is de teller.`
        : `In ${breuk} staat <strong>${den}</strong> onder de streep – dat is de noemer.`
    ],
    oplossing: `In de breuk ${breuk}:\n- **teller** (boven de streep): $${num}$\n- **noemer** (onder de streep): $${den}$\n\nHet antwoord is $${antw}$.`
  };
}

/* ── B.01a – Getallenlijn invullen ───────────────────────────────────── */
function genB01a() {
  const dens = [2, 3, 4, 5, 6, 8, 10];
  const den = pick(dens);
  const num = rand(1, den - 1);
  const [sn, sd] = simplifyFrac(num, den);
  const svg = maakGetallenlijnSVG(num, den, true);
  return {
    id: uid(), leerdoel: 'B.01a',
    vraag: `Er staat een pijl op de getallenlijn. Welke breuk hoort bij de pijl?\n${svg}`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { num, den, positie: num / den },
    hints: [
      `De getallenlijn gaat van 0 tot 1 en is verdeeld in <strong>${den}</strong> gelijke delen.`,
      `Elke streep stelt $\\dfrac{1}{${den}}$ voor. De pijl staat bij streep <strong>${num}</strong>.`
    ],
    oplossing: `De lijn is verdeeld in ${den} gelijke delen. De pijl staat bij deel ${num}.\nDat is $\\dfrac{${num}}{${den}}$${sn !== num ? ` $= \\dfrac{${sn}}{${sd}}$` : ''}.`
  };
}

/* ── B.01b – Getallenlijn meerkeuze ─────────────────────────────────── */
function genB01b() {
  const dens = [2, 3, 4, 5, 6, 8, 10];
  const den = pick(dens);
  const num = rand(1, den - 1);
  const [sn, sd] = simplifyFrac(num, den);
  const svg = maakGetallenlijnSVG(num, den, true);

  // Distractors: nearby fractions with same or different denominator
  const distractors = new Set();
  const correct_key = `${sn}/${sd}`;
  while (distractors.size < 3) {
    let dn, dd;
    if (Math.random() > 0.5) {
      dd = den;
      dn = rand(1, den - 1);
    } else {
      dd = pick(dens);
      dn = rand(1, dd - 1);
    }
    const [dsn, dsd] = simplifyFrac(dn, dd);
    const key = `${dsn}/${dsd}`;
    if (key !== correct_key) distractors.add(key);
  }

  const opties = shuffle([
    { teller: sn, noemer: sd, label: `$\\dfrac{${sn}}{${sd}}$`, correct: true },
    ...[...distractors].map(k => {
      const [t, n] = k.split('/').map(Number);
      return { teller: t, noemer: n, label: `$\\dfrac{${t}}{${n}}$`, correct: false };
    })
  ]);
  const correctIdx = opties.findIndex(o => o.correct);

  return {
    id: uid(), leerdoel: 'B.01b',
    vraag: `Welke breuk hoort bij de pijl op de getallenlijn?\n${svg}`,
    antwoordType: 'mc',
    antwoord: { correct: correctIdx },
    data: { num, den, opties },
    hints: [
      `Tel hoeveel gelijke delen de lijn heeft. Dat is de noemer.`,
      `De lijn is verdeeld in ${den} gelijke delen. De pijl staat bij deel ${num}.`
    ],
    oplossing: `De getallenlijn is verdeeld in ${den} gelijke delen.\nDe pijl staat bij deel ${num} → $\\dfrac{${num}}{${den}}$${sn !== num ? ` $= \\dfrac{${sn}}{${sd}}$` : ''}.`
  };
}

/* ── B.01c – Getallenlijn slepen ─────────────────────────────────────── */
function genB01c() {
  const dens = [2, 3, 4, 5, 6, 8, 10];
  const den = pick(dens);
  const num = rand(1, den - 1);
  const [sn, sd] = simplifyFrac(num, den);
  return {
    id: uid(), leerdoel: 'B.01c',
    vraag: `Sleep de breuk $\\dfrac{${sn}}{${sd}}$ naar de juiste plek op de getallenlijn.`,
    antwoordType: 'drag',
    antwoord: { teller: sn, noemer: sd, positie: num / den },
    data: { num, den, positie: num / den },
    hints: [
      `Verdeel de lijn in ${den} gelijke stukken. Elk stuk is $\\dfrac{1}{${den}}$.`,
      `$\\dfrac{${sn}}{${sd}}$ ligt op positie ${num}/${den} van links.`
    ],
    oplossing: `$\\dfrac{${sn}}{${sd}} = \\dfrac{${num}}{${den}}$ → dit is stuk ${num} van de ${den} gelijke delen.`
  };
}

/* ── B.1 – Enkelvoudige breuken vereenvoudigen ───────────────────────── */
function genB1() {
  const simpelOpties = [
    [1,2],[1,3],[1,4],[1,5],[1,6],[2,3],[3,4],[2,5],[3,5],
    [4,5],[1,7],[2,7],[1,8],[3,8],[5,8],[1,9],[2,9],[4,9]
  ];
  const [sn, sd] = pick(simpelOpties);
  const factor = rand(2, 5);
  const num = sn * factor, den = sd * factor;
  const g = gcd(num, den);
  return {
    id: uid(), leerdoel: 'B.1',
    vraag: `Vereenvoudig de breuk: $\\dfrac{${num}}{${den}}$`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { num, den, factor, sn, sd },
    hints: [
      `Zoek de grootste gemene deler (GGD) van ${num} en ${den}.`,
      `GGD(${num}, ${den}) = ${g}. Deel teller én noemer door ${g}.`
    ],
    oplossing: `GGD(${num}, ${den}) = ${g}\n$\\dfrac{${num}}{${den}} = \\dfrac{${num} \\div ${g}}{${den} \\div ${g}} = \\dfrac{${sn}}{${sd}}$`
  };
}

/* ── B.3 – Breuken gelijknamig maken ────────────────────────────────── */
function genB3() {
  const dens1 = [2, 3, 4, 5, 6];
  let d1, d2, L;
  do {
    d1 = pick(dens1);
    d2 = pick([2, 3, 4, 5, 6, 7, 8]);
    L = lcm(d1, d2);
  } while (d2 === d1 || L > 30);
  const n1 = rand(1, d1 - 1);
  const n2 = rand(1, d2 - 1);
  const nn1 = n1 * (L / d1);
  const nn2 = n2 * (L / d2);
  return {
    id: uid(), leerdoel: 'B.3',
    vraag: `Schrijf $\\dfrac{${n1}}{${d1}}$ en $\\dfrac{${n2}}{${d2}}$ als <strong>gelijknamige breuken</strong>.`,
    antwoordType: 'two-fracs',
    antwoord: { teller1: nn1, noemer1: L, teller2: nn2, noemer2: L },
    data: { n1, d1, n2, d2, L, nn1, nn2 },
    hints: [
      `Zoek het kleinste gemene veelvoud (KGV) van ${d1} en ${d2}.`,
      `KGV(${d1}, ${d2}) = ${L}. De nieuwe noemer is ${L} voor beide breuken.`
    ],
    oplossing: `KGV(${d1}, ${d2}) = ${L}\n$\\dfrac{${n1}}{${d1}} = \\dfrac{${n1} \\times ${L/d1}}{${d1} \\times ${L/d1}} = \\dfrac{${nn1}}{${L}}$\n$\\dfrac{${n2}}{${d2}} = \\dfrac{${n2} \\times ${L/d2}}{${d2} \\times ${L/d2}} = \\dfrac{${nn2}}{${L}}$`
  };
}

/* ── Hulpfunctie: maak optelsom/aftreksom ────────────────────────────── */
function maakFracSom(min) {
  let d1, d2, L;
  do {
    d1 = pick([2, 3, 4, 5, 6, 8]);
    d2 = pick([2, 3, 4, 5, 6, 8]);
    L = lcm(d1, d2);
  } while (L > 24);
  const n1 = rand(min ? 2 : 1, d1 - 1);
  const n2 = rand(1, d2 - 1);
  return { n1, d1, n2, d2, L };
}

/* ── B.5 – Enkelvoudige breuken optellen ────────────────────────────── */
function genB5() {
  const { n1, d1, n2, d2, L } = maakFracSom(false);
  const sumN = n1 * (L / d1) + n2 * (L / d2);
  const [sn, sd] = simplifyFrac(sumN, L);
  const isImproper = sn >= sd;
  const [w, rn, rd] = improperToMixed(sn, sd);
  return {
    id: uid(), leerdoel: 'B.5',
    vraag: `Bereken en vereenvoudig: $\\dfrac{${n1}}{${d1}} + \\dfrac{${n2}}{${d2}}$`,
    antwoordType: isImproper ? 'mixed' : 'fraction',
    antwoord: isImproper ? { geheel: w, teller: rn, noemer: rd } : { teller: sn, noemer: sd },
    data: { n1, d1, n2, d2, L, sumN, sn, sd },
    hints: [
      `Maak de breuken gelijknamig. KGV(${d1}, ${d2}) = ${L}.`,
      `$\\dfrac{${n1}}{${d1}} = \\dfrac{${n1*(L/d1)}}{${L}}$ en $\\dfrac{${n2}}{${d2}} = \\dfrac{${n2*(L/d2)}}{${L}}$.`
    ],
    oplossing: `KGV(${d1}, ${d2}) = ${L}\n$\\dfrac{${n1}}{${d1}} + \\dfrac{${n2}}{${d2}} = \\dfrac{${n1*(L/d1)}}{${L}} + \\dfrac{${n2*(L/d2)}}{${L}} = \\dfrac{${sumN}}{${L}}$${sn !== sumN || sd !== L ? `\n$= \\dfrac{${sn}}{${sd}}$` : ''}${isImproper ? `\n$= ${fmtMixed(w, rn, rd)}$` : ''}`
  };
}

/* ── B.6 – Gemengde breuken optellen ────────────────────────────────── */
function genB6() {
  const w1 = rand(1, 4), w2 = rand(1, 4);
  let d1, d2, L;
  do {
    d1 = pick([2, 3, 4, 5, 6, 8]);
    d2 = pick([2, 3, 4, 5, 6, 8]);
    L = lcm(d1, d2);
  } while (L > 24);
  const n1 = rand(1, d1 - 1), n2 = rand(1, d2 - 1);
  const [in1, id1] = mixedToImproper(w1, n1, d1);
  const [in2, id2] = mixedToImproper(w2, n2, d2);
  const sumN = in1 * (L / d1) + in2 * (L / d2);
  const [sn, sd] = simplifyFrac(sumN, L);
  const [w, rn, rd] = improperToMixed(sn, sd);
  return {
    id: uid(), leerdoel: 'B.6',
    vraag: `Bereken: $${fmtMixed(w1,n1,d1)} + ${fmtMixed(w2,n2,d2)}$`,
    antwoordType: 'mixed',
    antwoord: { geheel: w, teller: rn, noemer: rd },
    data: { w1, n1, d1, w2, n2, d2, L },
    hints: [
      `Zet de gemengde getallen om naar onechte breuken.`,
      `$${fmtMixed(w1,n1,d1)} = \\dfrac{${in1}}{${d1}}$ en $${fmtMixed(w2,n2,d2)} = \\dfrac{${in2}}{${d2}}$.`
    ],
    oplossing: `$${fmtMixed(w1,n1,d1)} = \\dfrac{${in1}}{${d1}}$, $${fmtMixed(w2,n2,d2)} = \\dfrac{${in2}}{${d2}}$\nKGV(${d1},${d2}) = ${L}\n$\\dfrac{${in1*(L/d1)}}{${L}} + \\dfrac{${in2*(L/d2)}}{${L}} = \\dfrac{${sumN}}{${L}}$${sn!==sumN||sd!==L?` $= \\dfrac{${sn}}{${sd}}$`:''}\n$= ${fmtMixed(w, rn, rd)}$`
  };
}

/* ── B.7 – Enkelvoudige breuken aftrekken ───────────────────────────── */
function genB7() {
  let n1, d1, n2, d2, L, diff;
  do {
    ({ n1, d1, n2, d2, L } = maakFracSom(false));
    diff = n1 * (L / d1) - n2 * (L / d2);
  } while (diff <= 0);
  const [sn, sd] = simplifyFrac(diff, L);
  return {
    id: uid(), leerdoel: 'B.7',
    vraag: `Bereken en vereenvoudig: $\\dfrac{${n1}}{${d1}} - \\dfrac{${n2}}{${d2}}$`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { n1, d1, n2, d2, L, diff, sn, sd },
    hints: [
      `Maak de breuken gelijknamig. KGV(${d1}, ${d2}) = ${L}.`,
      `$\\dfrac{${n1}}{${d1}} = \\dfrac{${n1*(L/d1)}}{${L}}$ en $\\dfrac{${n2}}{${d2}} = \\dfrac{${n2*(L/d2)}}{${L}}$.`
    ],
    oplossing: `KGV(${d1}, ${d2}) = ${L}\n$\\dfrac{${n1*(L/d1)}}{${L}} - \\dfrac{${n2*(L/d2)}}{${L}} = \\dfrac{${diff}}{${L}}$${sn!==diff||sd!==L?`\n$= \\dfrac{${sn}}{${sd}}$`:''}`
  };
}

/* ── B.8 – Gemengde breuken aftrekken ───────────────────────────────── */
function genB8() {
  let w1, w2, n1, d1, n2, d2, L, diff;
  do {
    w1 = rand(2, 5); w2 = rand(1, w1 - 1);
    d1 = pick([2, 3, 4, 5, 6, 8]);
    d2 = pick([2, 3, 4, 5, 6, 8]);
    L = lcm(d1, d2);
    n1 = rand(1, d1 - 1); n2 = rand(1, d2 - 1);
    const [in1] = mixedToImproper(w1, n1, d1);
    const [in2] = mixedToImproper(w2, n2, d2);
    diff = in1 * (L / d1) - in2 * (L / d2);
  } while (diff <= 0 || L > 24);
  const [in1] = mixedToImproper(w1, n1, d1);
  const [in2] = mixedToImproper(w2, n2, d2);
  const [sn, sd] = simplifyFrac(diff, L);
  const [w, rn, rd] = improperToMixed(sn, sd);
  return {
    id: uid(), leerdoel: 'B.8',
    vraag: `Bereken: $${fmtMixed(w1,n1,d1)} - ${fmtMixed(w2,n2,d2)}$`,
    antwoordType: rn === 0 ? 'integer' : 'mixed',
    antwoord: rn === 0 ? { waarde: w } : { geheel: w, teller: rn, noemer: rd },
    data: { w1, n1, d1, w2, n2, d2, L },
    hints: [
      `Zet de gemengde getallen om naar onechte breuken.`,
      `$${fmtMixed(w1,n1,d1)} = \\dfrac{${in1}}{${d1}}$ en $${fmtMixed(w2,n2,d2)} = \\dfrac{${in2}}{${d2}}$.`
    ],
    oplossing: `$\\dfrac{${in1*(L/d1)}}{${L}} - \\dfrac{${in2*(L/d2)}}{${L}} = \\dfrac{${diff}}{${L}}$${sn!==diff||sd!==L?` $= \\dfrac{${sn}}{${sd}}$`:''}\n$= ${fmtMixed(w, rn, rd)}$`
  };
}

/* ── B.9 – Enkelvoudige breuken vermenigvuldigen ────────────────────── */
function genB9() {
  const d1 = pick([2,3,4,5,6,7,8]), d2 = pick([2,3,4,5,6,7,8]);
  const n1 = rand(1, d1-1), n2 = rand(1, d2-1);
  const prodN = n1 * n2, prodD = d1 * d2;
  const [sn, sd] = simplifyFrac(prodN, prodD);
  return {
    id: uid(), leerdoel: 'B.9',
    vraag: `Bereken en vereenvoudig: $\\dfrac{${n1}}{${d1}} \\times \\dfrac{${n2}}{${d2}}$`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { n1, d1, n2, d2, prodN, prodD, sn, sd },
    hints: [
      `Vermenigvuldig de tellers met elkaar en de noemers met elkaar.`,
      `$${n1} \\times ${n2} = ${prodN}$ en $${d1} \\times ${d2} = ${prodD}$. Vereenvoudig daarna.`
    ],
    oplossing: `$\\dfrac{${n1}}{${d1}} \\times \\dfrac{${n2}}{${d2}} = \\dfrac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\dfrac{${prodN}}{${prodD}}$${sn!==prodN||sd!==prodD?`\nGGD(${prodN},${prodD}) = ${gcd(prodN,prodD)}: $= \\dfrac{${sn}}{${sd}}$`:''}`
  };
}

/* ── B.10 – Gemengde breuken vermenigvuldigen ───────────────────────── */
function genB10() {
  const w1 = rand(1,3), w2 = rand(1,3);
  const d1 = pick([2,3,4,5]), d2 = pick([2,3,4,5]);
  const n1 = rand(1,d1-1), n2 = rand(1,d2-1);
  const [im1] = mixedToImproper(w1,n1,d1);
  const [im2] = mixedToImproper(w2,n2,d2);
  const prodN = im1*im2, prodD = d1*d2;
  const [sn,sd] = simplifyFrac(prodN,prodD);
  const [w,rn,rd] = improperToMixed(sn,sd);
  return {
    id: uid(), leerdoel: 'B.10',
    vraag: `Bereken: $${fmtMixed(w1,n1,d1)} \\times ${fmtMixed(w2,n2,d2)}$`,
    antwoordType: rn===0 ? 'integer' : 'mixed',
    antwoord: rn===0 ? {waarde:w} : {geheel:w,teller:rn,noemer:rd},
    data: { w1,n1,d1,w2,n2,d2 },
    hints: [
      `Zet beide gemengde getallen eerst om naar onechte breuken.`,
      `$${fmtMixed(w1,n1,d1)} = \\dfrac{${im1}}{${d1}}$ en $${fmtMixed(w2,n2,d2)} = \\dfrac{${im2}}{${d2}}$.`
    ],
    oplossing: `$\\dfrac{${im1}}{${d1}} \\times \\dfrac{${im2}}{${d2}} = \\dfrac{${prodN}}{${prodD}}$${sn!==prodN||sd!==prodD?` $= \\dfrac{${sn}}{${sd}}$`:''}\n$= ${fmtMixed(w,rn,rd)}$`
  };
}

/* ── B.11 – Enkelvoudige breuken delen ──────────────────────────────── */
function genB11() {
  const d1 = pick([2,3,4,5,6,7,8]), d2 = pick([2,3,4,5,6,7,8]);
  const n1 = rand(1,d1-1), n2 = rand(1,d2-1);
  // a/b ÷ c/d = a*d / b*c
  const rn = n1*d2, rd = d1*n2;
  const [sn,sd] = simplifyFrac(rn,rd);
  const isImproper = sn > sd;
  const [w,rmn,rmd] = improperToMixed(sn,sd);
  return {
    id: uid(), leerdoel: 'B.11',
    vraag: `Bereken en vereenvoudig: $\\dfrac{${n1}}{${d1}} \\div \\dfrac{${n2}}{${d2}}$`,
    antwoordType: isImproper ? 'mixed' : 'fraction',
    antwoord: isImproper ? {geheel:w,teller:rmn,noemer:rmd} : {teller:sn,noemer:sd},
    data: { n1,d1,n2,d2,rn,rd,sn,sd },
    hints: [
      `Delen door een breuk is hetzelfde als vermenigvuldigen met de omgekeerde breuk.`,
      `$\\dfrac{${n1}}{${d1}} \\div \\dfrac{${n2}}{${d2}} = \\dfrac{${n1}}{${d1}} \\times \\dfrac{${d2}}{${n2}}$`
    ],
    oplossing: `$\\dfrac{${n1}}{${d1}} \\div \\dfrac{${n2}}{${d2}} = \\dfrac{${n1}}{${d1}} \\times \\dfrac{${d2}}{${n2}} = \\dfrac{${rn}}{${rd}}$${sn!==rn||sd!==rd?` $= \\dfrac{${sn}}{${sd}}$`:''}${isImproper?`\n$= ${fmtMixed(w,rmn,rmd)}$`:''}`
  };
}

/* ── B.12 – Gemengde breuken delen ─────────────────────────────────── */
function genB12() {
  const w1 = rand(1,4), w2 = rand(1,3);
  const d1 = pick([2,3,4,5]), d2 = pick([2,3,4,5]);
  const n1 = rand(1,d1-1), n2 = rand(1,d2-1);
  const [im1] = mixedToImproper(w1,n1,d1);
  const [im2] = mixedToImproper(w2,n2,d2);
  const rn = im1*d2, rd = d1*im2;
  const [sn,sd] = simplifyFrac(rn,rd);
  const [w,rmn,rmd] = improperToMixed(sn,sd);
  return {
    id: uid(), leerdoel: 'B.12',
    vraag: `Bereken: $${fmtMixed(w1,n1,d1)} \\div ${fmtMixed(w2,n2,d2)}$`,
    antwoordType: rmn===0 ? 'integer' : 'mixed',
    antwoord: rmn===0 ? {waarde:w} : {geheel:w,teller:rmn,noemer:rmd},
    data: { w1,n1,d1,w2,n2,d2 },
    hints: [
      `Zet beide gemengde getallen om naar onechte breuken.`,
      `$${fmtMixed(w1,n1,d1)} = \\dfrac{${im1}}{${d1}}$. Omgekeerde van $\\dfrac{${im2}}{${d2}}$ is $\\dfrac{${d2}}{${im2}}$.`
    ],
    oplossing: `$\\dfrac{${im1}}{${d1}} \\div \\dfrac{${im2}}{${d2}} = \\dfrac{${im1}}{${d1}} \\times \\dfrac{${d2}}{${im2}} = \\dfrac{${rn}}{${rd}}$${sn!==rn||sd!==rd?` $= \\dfrac{${sn}}{${sd}}$`:''}\n$= ${fmtMixed(w,rmn,rmd)}$`
  };
}

/* ── BP.1 – Breuk naar percentage ───────────────────────────────────── */
function genBP1() {
  const opties = [
    [1,2,50],[1,4,25],[3,4,75],[1,5,20],[2,5,40],[3,5,60],[4,5,80],
    [1,10,10],[3,10,30],[7,10,70],[9,10,90],[1,20,5],[1,25,4],[1,100,1]
  ];
  const [n, d, pct] = pick(opties);
  return {
    id: uid(), leerdoel: 'BP.1',
    vraag: `Schrijf $\\dfrac{${n}}{${d}}$ als percentage.`,
    antwoordType: 'percentage',
    antwoord: { waarde: pct },
    data: { n, d, pct },
    hints: [
      `Bereken $${n} \\div ${d}$ en vermenigvuldig met 100.`,
      `$\\dfrac{${n}}{${d}} = ${n} \\div ${d} = ${(n/d).toFixed(4)} \\rightarrow \\times 100 = ${pct}\\%$`
    ],
    oplossing: `$\\dfrac{${n}}{${d}} \\times 100 = \\dfrac{${n*100}}{${d}} = ${pct}\\%$`
  };
}

/* ── BP.2 – Percentage naar breuk ───────────────────────────────────── */
function genBP2() {
  const pcts = [10,20,25,30,40,50,60,70,75,80,90];
  const pct = pick(pcts);
  const [sn, sd] = simplifyFrac(pct, 100);
  return {
    id: uid(), leerdoel: 'BP.2',
    vraag: `Schrijf $${pct}\\%$ als vereenvoudigde breuk.`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { pct, sn, sd },
    hints: [
      `Procent betekent 'per honderd': $${pct}\\% = \\dfrac{${pct}}{100}$.`,
      `GGD(${pct}, 100) = ${gcd(pct,100)}. Deel teller en noemer door ${gcd(pct,100)}.`
    ],
    oplossing: `$${pct}\\% = \\dfrac{${pct}}{100}$\nGGD(${pct}, 100) = ${gcd(pct,100)}\n$= \\dfrac{${sn}}{${sd}}$`
  };
}

/* ── BD.1 – Breuk naar decimaal ─────────────────────────────────────── */
function genBD1() {
  const opties = [
    [1,2,0.5],[1,4,0.25],[3,4,0.75],[1,5,0.2],[2,5,0.4],[3,5,0.6],[4,5,0.8],
    [1,10,0.1],[3,10,0.3],[7,10,0.7],[9,10,0.9],[1,8,0.125],[3,8,0.375],[5,8,0.625]
  ];
  const [n, d, dec] = pick(opties);
  return {
    id: uid(), leerdoel: 'BD.1',
    vraag: `Schrijf $\\dfrac{${n}}{${d}}$ als decimaal getal.`,
    antwoordType: 'decimal',
    antwoord: { waarde: dec },
    data: { n, d, dec },
    hints: [
      `Deel de teller door de noemer: $${n} \\div ${d}$.`,
      `$${n} \\div ${d} = ${dec}$`
    ],
    oplossing: `$\\dfrac{${n}}{${d}} = ${n} \\div ${d} = ${dec}$`
  };
}

/* ── BD.2 – Decimaal naar breuk ─────────────────────────────────────── */
function genBD2() {
  const decimalen = [0.1,0.2,0.25,0.3,0.4,0.5,0.6,0.75,0.8,0.9,1.5,2.5,0.125,0.375];
  const dec = pick(decimalen);
  const [sn, sd] = decimalToFrac(dec);
  const decStr = dec.toString().replace('.', ',');
  const decDigits = (dec.toString().split('.')[1] || '').length;
  const rawDen = Math.pow(10, decDigits);
  const rawNum = Math.round(dec * rawDen);
  const g = gcd(rawNum, rawDen);
  const isMixed = dec >= 1;
  const antwoord = isMixed
    ? (() => { const [w,n,d] = improperToMixed(sn,sd); return {geheel:w,teller:n,noemer:d}; })()
    : {teller:sn, noemer:sd};
  return {
    id: uid(), leerdoel: 'BD.2',
    vraag: `Schrijf $${decStr}$ als vereenvoudigde breuk.`,
    antwoordType: isMixed ? 'mixed' : 'fraction',
    antwoord,
    data: { dec, sn, sd },
    hints: [
      `Tel het aantal decimalen: dat bepaalt de noemer ($10$, $100$, enz.).`,
      `$${decStr}$ heeft ${decDigits} decimaal/decimalen → noemer is $${rawDen}$. Schrijf als $\\dfrac{${rawNum}}{${rawDen}}$ en vereenvoudig.`
    ],
    oplossing: `$${decStr} = \\dfrac{${rawNum}}{${rawDen}}$\nGGD(${rawNum}, ${rawDen}) = ${g}\n$= \\dfrac{${sn}}{${sd}}$`
  };
}

/* ── BV.1 – Verhouding naar breuk ───────────────────────────────────── */
function genBV1() {
  // a:b → leerling moet specifiek deel als breuk schrijven van totaal
  const a = rand(1, 5), b = rand(2, 8);
  const totaal = a + b;
  const vraagEerste = Math.random() > 0.5;
  const deel = vraagEerste ? a : b;
  const [sn, sd] = simplifyFrac(deel, totaal);
  const welkDeel = vraagEerste ? 'eerste' : 'tweede';
  return {
    id: uid(), leerdoel: 'BV.1',
    vraag: `De verhouding is $${a} : ${b}$. Schrijf het <strong>${welkDeel} deel</strong> als breuk van het totaal.`,
    antwoordType: 'fraction',
    antwoord: { teller: sn, noemer: sd },
    data: { a, b, totaal, deel, vraagEerste, sn, sd },
    hints: [
      `Het totaal is $${a} + ${b} = ${totaal}$. Het gevraagde deel is $${deel}$.`,
      `De breuk is $\\dfrac{${deel}}{${totaal}}$. Vereenvoudig daarna.`
    ],
    oplossing: `Totaal: $${a} + ${b} = ${totaal}$\nGevraagd deel: $${deel}$\n$\\dfrac{${deel}}{${totaal}}$${sn!==deel||sd!==totaal?` $= \\dfrac{${sn}}{${sd}}$`:''}`
  };
}

/* ── BV.2 – Breuk naar verhouding ───────────────────────────────────── */
function genBV2() {
  const dens = [3,4,5,6,8,10];
  const den = pick(dens);
  const num = rand(1, den-1);
  const [sn, sd] = simplifyFrac(num, den);
  // Verhouding: n : (d-n)
  const [vn, vd] = simplifyFrac(sn, sd - sn);
  return {
    id: uid(), leerdoel: 'BV.2',
    vraag: `Schrijf de breuk $\\dfrac{${sn}}{${sd}}$ als verhouding (deel : rest).`,
    antwoordType: 'ratio',
    antwoord: { deel1: vn, deel2: vd },
    data: { num: sn, den: sd, vn, vd },
    hints: [
      `De breuk $\\dfrac{${sn}}{${sd}}$ betekent ${sn} van de ${sd} gelijke delen.`,
      `Deel : rest = $${sn} : ${sd-sn}$. Vereenvoudig daarna.`
    ],
    oplossing: `$\\dfrac{${sn}}{${sd}}$ → deel = $${sn}$, rest = $${sd}-${sn} = ${sd-sn}$\nVerhouding: $${sn} : ${sd-sn}$${vn!==sn||vd!==(sd-sn)?` $= ${vn} : ${vd}$`:''}`
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   GEHELE GETALLEN
══════════════════════════════════════════════════════════════════════════ */

/* ── G.1 – Natuurlijke getallen optellen ────────────────────────────── */
function genG1() {
  const a = rand(1, 60), b = rand(1, 60);
  return {
    id: uid(), leerdoel: 'G.1',
    vraag: `Bereken: $${a} + ${b}$`,
    antwoordType: 'integer', antwoord: { waarde: a + b }, data: { a, b },
    hints: [
      'Begin bij het grootste getal en tel het andere getal erbij op.',
      `$${a} + ${b} = ${a + b}$`
    ],
    oplossing: `$${a} + ${b} = ${a + b}$`
  };
}

/* ── G.2 – Natuurlijke getallen aftrekken ───────────────────────────── */
function genG2() {
  const b = rand(1, 50), a = rand(b, 99);
  return {
    id: uid(), leerdoel: 'G.2',
    vraag: `Bereken: $${a} - ${b}$`,
    antwoordType: 'integer', antwoord: { waarde: a - b }, data: { a, b },
    hints: [
      'Trek het kleinste getal af van het grootste.',
      `$${a} - ${b} = ${a - b}$`
    ],
    oplossing: `$${a} - ${b} = ${a - b}$`
  };
}

/* ── G.3 – Natuurlijke getallen vermenigvuldigen ────────────────────── */
function genG3() {
  const a = rand(2, 10), b = rand(2, 10);
  return {
    id: uid(), leerdoel: 'G.3',
    vraag: `Bereken: $${a} \\times ${b}$`,
    antwoordType: 'integer', antwoord: { waarde: a * b }, data: { a, b },
    hints: [
      `$${a} \\times ${b}$ betekent ${a} keer het getal ${b} optellen.`,
      `$${a} \\times ${b} = ${a * b}$`
    ],
    oplossing: `$${a} \\times ${b} = ${a * b}$`
  };
}

/* ── G.4 – Natuurlijke getallen delen ──────────────────────────────── */
function genG4() {
  const d = rand(2, 10), q = rand(2, 10);
  const a = d * q;
  return {
    id: uid(), leerdoel: 'G.4',
    vraag: `Bereken: $${a} \\div ${d}$`,
    antwoordType: 'integer', antwoord: { waarde: q }, data: { a, d, q },
    hints: [
      `Vraag: ${d} keer welk getal is ${a}?`,
      `$${d} \\times ${q} = ${a}$, dus $${a} \\div ${d} = ${q}$`
    ],
    oplossing: `$${a} \\div ${d} = ${q}$ (want $${d} \\times ${q} = ${a}$)`
  };
}

/* ── G.5 – Positieve getallen kwadrateren ───────────────────────────── */
function genG5() {
  const n = rand(2, 12);
  return {
    id: uid(), leerdoel: 'G.5',
    vraag: `Bereken: $${n}^2$`,
    antwoordType: 'integer', antwoord: { waarde: n * n }, data: { n },
    hints: [
      `$${n}^2$ betekent $${n} \\times ${n}$.`,
      `$${n} \\times ${n} = ${n * n}$`
    ],
    oplossing: `$${n}^2 = ${n} \\times ${n} = ${n * n}$`
  };
}

/* ── G.6 – Worteltrekken van positieve getallen ─────────────────────── */
function genG6() {
  const n = rand(1, 12);
  return {
    id: uid(), leerdoel: 'G.6',
    vraag: `Bereken: $\\sqrt{${n * n}}$`,
    antwoordType: 'integer', antwoord: { waarde: n }, data: { n },
    hints: [
      `Vraag: welk getal × zichzelf geeft ${n * n}?`,
      `$${n} \\times ${n} = ${n * n}$, dus $\\sqrt{${n * n}} = ${n}$`
    ],
    oplossing: `$\\sqrt{${n * n}} = ${n}$ (want $${n}^2 = ${n * n}$)`
  };
}

/* ── G.7 – Negatieve getallen vergelijken ───────────────────────────── */
function genG7() {
  const nums = new Set();
  while (nums.size < 4) nums.add(-rand(1, 20));
  const arr = [...nums];
  const vraagGrootst = Math.random() > 0.5;
  const correctVal = vraagGrootst ? Math.max(...arr) : Math.min(...arr);
  const correctIdx = arr.indexOf(correctVal);
  const gesorteerd = [...arr].sort((a, b) => a - b);
  return {
    id: uid(), leerdoel: 'G.7',
    vraag: `Welk getal is het <strong>${vraagGrootst ? 'grootst' : 'kleinst'}</strong>?`,
    antwoordType: 'mc',
    antwoord: { correct: correctIdx },
    data: { arr, opties: arr.map(n => ({ label: `$${n}$` })) },
    hints: [
      'Op de getallenlijn staat een groter getal altijd rechts van een kleiner getal.',
      `Bij negatieve getallen: hoe dichter bij nul, hoe groter. Van klein naar groot: $${gesorteerd.join(' < ')}$.`
    ],
    oplossing: `Van klein naar groot: $${gesorteerd.join(' < ')}$\nHet ${vraagGrootst ? 'grootst' : 'kleinst'}e getal is $${correctVal}$.`
  };
}

/* ── G.8 – Negatieve gehele getallen optellen ──────────────────────── */
function genG8() {
  const type = rand(0, 2);
  let a, b;
  if (type === 0) { a = -rand(1, 15); b = rand(1, 15); }
  else if (type === 1) { a = rand(1, 15); b = -rand(1, 15); }
  else { a = -rand(1, 15); b = -rand(1, 15); }
  const res = a + b;
  const bStr = b < 0 ? `(${b})` : `${b}`;
  return {
    id: uid(), leerdoel: 'G.8',
    vraag: `Bereken: $${a} + ${bStr}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { a, b },
    hints: [
      b < 0 ? 'Een positief getal optellen bij een negatief getal: bepaal het verschil en kijk welk getal het "zwaarst" weegt.'
            : 'Begin bij het eerste getal en ga op de getallenlijn naar rechts.',
      `$${a} + ${bStr} = ${res}$`
    ],
    oplossing: `$${a} + ${bStr} = ${res}$`
  };
}

/* ── G.9 – Negatieve gehele getallen aftrekken ─────────────────────── */
function genG9() {
  const type = rand(0, 2);
  let a, b;
  if (type === 0) { a = rand(1, 15); b = rand(a + 1, a + 15); }   // pos - pos → neg
  else if (type === 1) { a = -rand(1, 10); b = rand(1, 15); }      // neg - pos
  else { a = -rand(1, 10); b = -rand(1, 15); }                      // neg - neg
  const res = a - b;
  const bStr = b < 0 ? `(${b})` : `${b}`;
  return {
    id: uid(), leerdoel: 'G.9',
    vraag: `Bereken: $${a} - ${bStr}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { a, b },
    hints: [
      'Aftrekken van een negatief getal is hetzelfde als optellen van het positieve getal.',
      `$${a} - ${bStr} = ${a} + ${b < 0 ? Math.abs(b) : `(${-b})`} = ${res}$`
    ],
    oplossing: `$${a} - ${bStr} = ${res}$`
  };
}

/* ── G.10 – Negatieve gehele getallen vermenigvuldigen ─────────────── */
function genG10() {
  const type = rand(0, 1);
  let a, b;
  if (type === 0) { a = -rand(2, 10); b = rand(2, 10); }   // neg × pos
  else { a = -rand(2, 10); b = -rand(2, 10); }              // neg × neg
  const res = a * b;
  const bStr = b < 0 ? `(${b})` : `${b}`;
  const aStr = a < 0 ? `(${a})` : `${a}`;
  return {
    id: uid(), leerdoel: 'G.10',
    vraag: `Bereken: $${aStr} \\times ${bStr}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { a, b },
    hints: [
      'Vermenigvuldig eerst de absolute waarden (zonder minteken).',
      type === 0 ? 'Negatief × positief = negatief.' : 'Negatief × negatief = positief.',
      `$${aStr} \\times ${bStr} = ${res}$`
    ],
    oplossing: `$${aStr} \\times ${bStr} = ${res}$ (${type === 0 ? '− × + = −' : '− × − = +'})`
  };
}

/* ── G.11 – Negatieve gehele getallen delen ─────────────────────────── */
function genG11() {
  const type = rand(0, 1);
  const d = rand(2, 10), q = rand(2, 10);
  let a, b;
  if (type === 0) { a = -(d * q); b = d; }    // neg ÷ pos
  else { a = -(d * q); b = -d; }               // neg ÷ neg
  const res = a / b;
  const bStr = b < 0 ? `(${b})` : `${b}`;
  return {
    id: uid(), leerdoel: 'G.11',
    vraag: `Bereken: $${a} \\div ${bStr}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { a, b },
    hints: [
      'Deel eerst de absolute waarden.',
      type === 0 ? 'Negatief ÷ positief = negatief.' : 'Negatief ÷ negatief = positief.',
      `$${a} \\div ${bStr} = ${res}$`
    ],
    oplossing: `$${a} \\div ${bStr} = ${res}$ (${type === 0 ? '− ÷ + = −' : '− ÷ − = +'})`
  };
}

/* ── G.12 – Gehele getallen kwadrateren ─────────────────────────────── */
function genG12() {
  const n = rand(2, 10);
  const neg = Math.random() > 0.4;
  const base = neg ? -n : n;
  const baseStr = neg ? `(-${n})` : `${n}`;
  return {
    id: uid(), leerdoel: 'G.12',
    vraag: `Bereken: $${baseStr}^2$`,
    antwoordType: 'integer', antwoord: { waarde: n * n }, data: { n, neg },
    hints: [
      neg ? `$(-${n})^2 = (-${n}) \\times (-${n})$.`
          : `$${n}^2 = ${n} \\times ${n}$.`,
      neg ? `Negatief × negatief = positief: $(-${n}) \\times (-${n}) = ${n * n}$`
          : `$${n} \\times ${n} = ${n * n}$`
    ],
    oplossing: `$${baseStr}^2 = ${baseStr} \\times ${baseStr} = ${n * n}$`
  };
}


/* ── G.14 – Machtsverheffen van positieve getallen ─────────────────── */
function genG14() {
  const bases = [2, 3, 4, 5];
  const base = pick(bases);
  const exp = rand(2, base <= 3 ? 5 : 3);
  const res = Math.pow(base, exp);
  return {
    id: uid(), leerdoel: 'G.14',
    vraag: `Bereken: $${base}^${exp}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { base, exp },
    hints: [
      `$${base}^${exp}$ betekent ${base} tot de macht ${exp}: ${base} × ${base} … (${exp} keer).`,
      `$${Array(exp).fill(base).join(' \\times ')} = ${res}$`
    ],
    oplossing: `$${base}^${exp} = ${Array(exp).fill(base).join(' \\times ')} = ${res}$`
  };
}

/* ── G.15 – Machtsverheffen van gehele getallen ─────────────────────── */
function genG15() {
  const base = -rand(2, 5);
  const exp = rand(2, 4);
  const res = Math.pow(base, exp);
  const baseStr = `(${base})`;
  return {
    id: uid(), leerdoel: 'G.15',
    vraag: `Bereken: $${baseStr}^${exp}$`,
    antwoordType: 'integer', antwoord: { waarde: res }, data: { base, exp },
    hints: [
      `$${baseStr}^${exp}$ betekent $${baseStr}$ tot de macht ${exp}.`,
      exp % 2 === 0
        ? `Een negatief getal tot een **even** macht is altijd positief.`
        : `Een negatief getal tot een **oneven** macht is altijd negatief.`
    ],
    oplossing: `$${baseStr}^${exp} = ${Array(exp).fill(baseStr).join(' \\times ')} = ${res}$`
  };
}

/* ── G.16 – Eigenschappen van natuurlijke getallen ──────────────────── */
const PRIEMGETALLEN = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
const KWADRATEN = [1,4,9,16,25,36,49,64,81,100,121,144];

function genG16() {
  const type = rand(0, 2); // 0=deelbaar, 1=priem, 2=kwadraat
  if (type === 0) {
    // Deelbaarheid: Is X deelbaar door Y?
    const d = pick([2,3,4,5,6,7,8,9,10]);
    const isDeelbaar = Math.random() > 0.4;
    let n;
    if (isDeelbaar) { n = d * rand(2, 15); }
    else {
      do { n = rand(d * 2, d * 15); } while (n % d === 0);
    }
    const opties = [{ label: 'Ja' }, { label: 'Nee' }];
    const correctIdx = isDeelbaar ? 0 : 1;
    return {
      id: uid(), leerdoel: 'G.16',
      vraag: `Is $${n}$ deelbaar door $${d}$?`,
      antwoordType: 'mc', antwoord: { correct: correctIdx }, data: { n, d, opties },
      hints: [
        `Bereken $${n} \\div ${d}$ en kijk of de uitkomst een geheel getal is.`,
        `$${n} \\div ${d} = ${(n/d).toFixed(2)}$ → ${isDeelbaar ? 'geheel getal, dus deelbaar.' : 'geen geheel getal, dus niet deelbaar.'}`
      ],
      oplossing: `$${n} \\div ${d} = ${isDeelbaar ? n/d : (n/d).toFixed(2)}$ → $${n}$ is ${isDeelbaar ? '' : 'niet '}deelbaar door $${d}$.`
    };
  } else if (type === 1) {
    // Priemgetal: welk is een priemgetal? (mc 4 keuzes)
    const priem = pick(PRIEMGETALLEN.filter(p => p < 50));
    const kandidaten = new Set([priem]);
    while (kandidaten.size < 4) {
      const c = rand(2, 50);
      if (!PRIEMGETALLEN.includes(c)) kandidaten.add(c);
    }
    const arr = shuffle([...kandidaten]);
    const correctIdx = arr.indexOf(priem);
    return {
      id: uid(), leerdoel: 'G.16',
      vraag: 'Welk getal is een <strong>priemgetal</strong>?',
      antwoordType: 'mc', antwoord: { correct: correctIdx },
      data: { opties: arr.map(n => ({ label: `$${n}$` })) },
      hints: [
        'Een priemgetal is alleen deelbaar door 1 en zichzelf.',
        `${priem} is alleen deelbaar door 1 en ${priem}.`
      ],
      oplossing: `$${priem}$ is een priemgetal: de enige delers zijn 1 en ${priem}.\n${arr.filter(n=>n!==priem).map(n=>`$${n}$ is geen priemgetal (deelbaar door ${[2,3,4,5,6,7,8,9].find(d=>d<n&&n%d===0)||'...'})`).join(', ')}.`
    };
  } else {
    // Kwadraat: welk is een kwadraat?
    const kw = pick(KWADRATEN.filter(k => k <= 100 && k > 1));
    const kandidaten = new Set([kw]);
    while (kandidaten.size < 4) {
      const c = rand(2, 100);
      if (!KWADRATEN.includes(c)) kandidaten.add(c);
    }
    const arr = shuffle([...kandidaten]);
    const correctIdx = arr.indexOf(kw);
    const wortel = Math.round(Math.sqrt(kw));
    return {
      id: uid(), leerdoel: 'G.16',
      vraag: 'Welk getal is een <strong>kwadraat</strong> (vierkantsgetal)?',
      antwoordType: 'mc', antwoord: { correct: correctIdx },
      data: { opties: arr.map(n => ({ label: `$${n}$` })) },
      hints: [
        'Een kwadraat is het product van een geheel getal met zichzelf: $1, 4, 9, 16, 25, 36, ...$',
        `$${wortel}^2 = ${kw}$, dus $${kw}$ is een kwadraat.`
      ],
      oplossing: `$${kw} = ${wortel}^2$, dus $${kw}$ is een kwadraat (vierkantsgetal).`
    };
  }
}

/* ── Hulpfuncties voor combinatiedoelen getallen ─────────────────────── */

/* Enkelvoudige bewerking – geen volgorde-van-bewerkingen */
function _applySimple(a, op, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') { const r = a * b; return Math.abs(r) <= 1000 ? r : null; }
  if (op === '÷') { if (!b || a % b !== 0) return null; return a / b; }
  return null;
}

/* Evalueer expressie met negatieve getallen toegestaan in resultaat */
function _evalExprFull(vals, ops) {
  vals = [...vals]; ops = [...ops];
  for (let i = 0; i < ops.length; ) {
    if (ops[i] === '×' || ops[i] === '÷') {
      if (ops[i] === '÷' && (!vals[i+1] || vals[i] % vals[i+1] !== 0)) return null;
      const r = ops[i] === '×' ? vals[i] * vals[i+1] : vals[i] / vals[i+1];
      if (!Number.isInteger(r) || Math.abs(r) > 1000) return null;
      vals.splice(i, 2, r); ops.splice(i, 1);
    } else i++;
  }
  let r = vals[0];
  for (let i = 0; i < ops.length; i++) {
    r = ops[i] === '+' ? r + vals[i+1] : r - vals[i+1];
  }
  return Number.isInteger(r) && Math.abs(r) <= 200 ? r : null;
}

/* Genereer één term voor negatieve getallen: geheel getal, kwadraat, of macht */
function _genNegTerm(inclSqrt, inclPow) {
  const types = ['neg','neg','pos','pos'];
  if (inclSqrt) types.push('sq', 'sq', 'rt'); // (-n)^2 en √(n²) = positief
  if (inclPow)  types.push('pow');      // (-n)^k
  const type = pick(types);
  if (type === 'neg') {
    const n = rand(1, 12);
    return { val: -n, tex: `(-${n})` };
  }
  if (type === 'pos') {
    const n = rand(2, 12);
    return { val: n, tex: `${n}` };
  }
  if (type === 'sq') {
    const n = rand(2, 8);
    return { val: n * n, tex: `(-${n})^2` };
  }
  if (type === 'rt') {
    const n = rand(2, 10);
    return { val: n, tex: `\\sqrt{${n * n}}` };
  }
  // pow
  const opts = [[-2,3],[-2,4],[-3,3],[-4,3]];
  const [b, e] = pick(opts);
  return { val: Math.pow(b, e), tex: `(-${Math.abs(b)})^{${e}}` };
}

/* Genereer één term: gewoon getal, kwadraat, wortel, of macht */
function _genNatTerm(inclSqrt, inclPow) {
  const types = ['num','num','num','num']; // plain getal weegt zwaarder
  if (inclSqrt) { types.push('sq','rt'); }
  if (inclPow)  { types.push('pow'); }
  const type = pick(types);
  if (type === 'sq')  { const n = rand(2,9);  return { val: n*n,          tex: `${n}^2` }; }
  if (type === 'rt')  { const n = rand(2,10); return { val: n,            tex: `\\sqrt{${n*n}}` }; }
  if (type === 'pow') {
    const opts = [[2,3],[2,4],[2,5],[3,3],[3,4],[4,3],[5,3]];
    const [b,e] = pick(opts);
    return { val: Math.pow(b,e), tex: `${b}^{${e}}` };
  }
  const n = rand(2,15); return { val: n, tex: `${n}` };
}

/* Evalueer [v0, v1, ...] met operators [op1, op2, ...], respecteer volgorde */
function _evalNatExpr(vals, ops) {
  vals = [...vals]; ops = [...ops];
  for (let i = 0; i < ops.length; ) {
    if (ops[i] === '×' || ops[i] === '÷') {
      if (ops[i] === '÷' && (!vals[i+1] || vals[i] % vals[i+1] !== 0)) return null;
      const r = ops[i] === '×' ? vals[i]*vals[i+1] : vals[i]/vals[i+1];
      if (!Number.isInteger(r) || r < 0 || r > 1000) return null;
      vals.splice(i,2,r); ops.splice(i,1);
    } else i++;
  }
  let r = vals[0];
  for (let i = 0; i < ops.length; i++) {
    r = ops[i] === '+' ? r+vals[i+1] : r-vals[i+1];
    if (r < 0) return null;
  }
  return Number.isInteger(r) && r > 0 && r <= 500 ? r : null;
}

function _buildNatCombi(leerdoelId, inclSqrt, inclPow) {
  const low = ['+','-'], high = ['×','÷'];
  const opTeX = op => op==='×'?'\\times':op==='÷'?'\\div':op;
  /* applyOp voor enkelvoudige stap (nat. getallen: resultaat moet > 0) */
  const applyOp = (a, op, b) => {
    const r = _applySimple(a, op, b);
    return (r !== null && r > 0) ? r : null;
  };

  for (let p = 0; p < 400; p++) {
    const terms = [0,1,2,3].map(() => _genNatTerm(inclSqrt, inclPow));
    const ops   = [0,1,2].map(() => pick([...low,...high]));
    const [t0,t1,t2,t3] = terms;
    const [op0,op1,op2] = ops;

    /* struct: 0 = standaard OOO, 1 = (t0○t1)○t2○t3,
               2 = t0○t1○(t2○t3),  3 = (t0○t1)○(t2○t3) */
    const struct = rand(0, 3);
    let result, tex;

    if (struct === 0) {
      result = _evalNatExpr([t0.val,t1.val,t2.val,t3.val], [op0,op1,op2]);
      if (result === null) continue;
      tex = `${t0.tex} ${opTeX(op0)} ${t1.tex} ${opTeX(op1)} ${t2.tex} ${opTeX(op2)} ${t3.tex}`;
    } else if (struct === 1) {
      const inner = applyOp(t0.val, op0, t1.val);
      if (inner === null) continue;
      result = _evalNatExpr([inner, t2.val, t3.val], [op1, op2]);
      if (result === null) continue;
      tex = `(${t0.tex} ${opTeX(op0)} ${t1.tex}) ${opTeX(op1)} ${t2.tex} ${opTeX(op2)} ${t3.tex}`;
    } else if (struct === 2) {
      const inner = applyOp(t2.val, op2, t3.val);
      if (inner === null) continue;
      result = _evalNatExpr([t0.val, t1.val, inner], [op0, op1]);
      if (result === null) continue;
      tex = `${t0.tex} ${opTeX(op0)} ${t1.tex} ${opTeX(op1)} (${t2.tex} ${opTeX(op2)} ${t3.tex})`;
    } else {
      const inner1 = applyOp(t0.val, op0, t1.val);
      const inner2 = applyOp(t2.val, op2, t3.val);
      if (inner1 === null || inner2 === null) continue;
      result = applyOp(inner1, op1, inner2);
      if (result === null || result > 500) continue;
      tex = `(${t0.tex} ${opTeX(op0)} ${t1.tex}) ${opTeX(op1)} (${t2.tex} ${opTeX(op2)} ${t3.tex})`;
    }

    const spec = terms.filter(t => t.tex.includes('^') || t.tex.includes('\\sqrt'));
    const hasParens = struct > 0;
    const hintMain = hasParens
      ? 'Volgorde: haakjes eerst, dan machten/wortels, dan × en ÷, dan + en −.'
      : 'Volgorde: machten/wortels eerst, dan × en ÷, dan + en −.';
    const stap1 = spec.length
      ? `Bereken machten/wortels: ${spec.map(t=>`$${t.tex} = ${t.val}$`).join(', ')}`
      : hasParens ? 'Begin met de haakjes.' : 'Let op de volgorde: × en ÷ vóór + en −.';

    return {
      id: uid(), leerdoel: leerdoelId,
      vraag: `Bereken: $${tex}$`,
      antwoordType: 'integer', antwoord: { waarde: result }, data: {},
      hints: [hintMain, stap1],
      oplossing: spec.length
        ? `**Stap 1** (machten/wortels): ${spec.map(t=>`$${t.tex} = ${t.val}$`).join(', ')}\n**Stap 2**: $${tex} = ${result}$`
        : `$${tex} = ${result}$`
    };
  }
  const q = genG1(); q.leerdoel = leerdoelId; return q;
}

/* ── C.natGetallen – Combinatiedoel natuurlijke getallen (3 termen) ─── */
function genC_natGetallen() {
  const low = ['+', '-'], high = ['×', '÷'];
  const opTeX = op => op === '×' ? '\\times' : op === '÷' ? '\\div' : op;
  const applyOp = (a, op, b) => {
    const r = _applySimple(a, op, b);
    return (r !== null && r > 0) ? r : null;
  };

  for (let p = 0; p < 150; p++) {
    const op1 = pick([...low,...high]);
    const op2 = pick([...low,...high]);
    const a = rand(2, 20), b = rand(2, 12), c = rand(2, 12);

    /* struct: 0 = standaard OOO, 1 = (a○b)○c, 2 = a○(b○c) */
    const struct = rand(0, 2);

    if (struct === 0) {
      /* Standaard: respecteer volgorde van bewerkingen */
      const isOOO = low.includes(op1) && high.includes(op2);
      let stap1, result;
      if (isOOO) {
        if (op2 === '÷' && b % c !== 0) continue;
        stap1 = op2 === '×' ? b * c : b / c;
        result = op1 === '+' ? a + stap1 : a - stap1;
      } else {
        stap1 = applyOp(a, op1, b);
        if (stap1 === null) continue;
        result = applyOp(stap1, op2, c);
      }
      if (!result || result > 1000) continue;
      const s1 = isOOO
        ? `Eerst $${b} ${opTeX(op2)} ${c} = ${stap1}$ (× en ÷ gaan vóór + en −)`
        : `Stap 1: $${a} ${opTeX(op1)} ${b} = ${stap1}$`;
      const s2 = isOOO
        ? `Dan $${a} ${opTeX(op1)} ${stap1} = ${result}$`
        : `Stap 2: $${stap1} ${opTeX(op2)} ${c} = ${result}$`;
      return {
        id: uid(), leerdoel: 'C.natGetallen',
        vraag: `Bereken: $${a} ${opTeX(op1)} ${b} ${opTeX(op2)} ${c}$`,
        antwoordType: 'integer', antwoord: { waarde: result }, data: { a, b, c, op1, op2 },
        hints: [isOOO ? 'Let op de volgorde: × en ÷ gaan vóór + en −.' : 'Werk van links naar rechts.', s1],
        oplossing: `${s1}\n${s2}`
      };
    } else if (struct === 1) {
      /* (a ○ b) ○ c  – haakjes gaan altijd eerst */
      const stap1 = applyOp(a, op1, b);
      if (stap1 === null) continue;
      const result = applyOp(stap1, op2, c);
      if (result === null || result > 1000) continue;
      return {
        id: uid(), leerdoel: 'C.natGetallen',
        vraag: `Bereken: $(${a} ${opTeX(op1)} ${b}) ${opTeX(op2)} ${c}$`,
        antwoordType: 'integer', antwoord: { waarde: result }, data: { a, b, c, op1, op2 },
        hints: ['Haakjes gaan altijd vóór alles.', `Stap 1: $${a} ${opTeX(op1)} ${b} = ${stap1}$`],
        oplossing: `Stap 1: $${a} ${opTeX(op1)} ${b} = ${stap1}$\nStap 2: $${stap1} ${opTeX(op2)} ${c} = ${result}$`
      };
    } else {
      /* a ○ (b ○ c)  – haakjes gaan altijd eerst */
      const stap1 = applyOp(b, op2, c);
      if (stap1 === null) continue;
      const result = applyOp(a, op1, stap1);
      if (result === null || result > 1000) continue;
      return {
        id: uid(), leerdoel: 'C.natGetallen',
        vraag: `Bereken: $${a} ${opTeX(op1)} (${b} ${opTeX(op2)} ${c})$`,
        antwoordType: 'integer', antwoord: { waarde: result }, data: { a, b, c, op1, op2 },
        hints: ['Haakjes gaan altijd vóór alles.', `Stap 1: $${b} ${opTeX(op2)} ${c} = ${stap1}$`],
        oplossing: `Stap 1: $${b} ${opTeX(op2)} ${c} = ${stap1}$\nStap 2: $${a} ${opTeX(op1)} ${stap1} = ${result}$`
      };
    }
  }
  const q = genG1(); q.leerdoel = 'C.natGetallen'; return q;
}

/* ── C.natGetallen.b – langer, met kwadraten en wortels ─────────────── */
function genC_natGetallen_b() { return _buildNatCombi('C.natGetallen.b', true, false); }

/* ── C.natGetallen.c – langer, met kwadraten, wortels én machten ────── */
function genC_natGetallen_c() { return _buildNatCombi('C.natGetallen.c', true, true); }

/* ── C.negGetallen – Combinatiedoel negatieve getallen ──────────────── */
function genC_negGetallen() {
  for (let p = 0; p < 150; p++) {
    const gens = [genG8, genG9, genG10, genG11];
    const g1 = pick(gens)(), g2 = pick(gens)();
    const v1 = g1.antwoord.waarde, v2 = g2.antwoord.waarde;
    if (v1 === null || v2 === null) continue;
    const ops = ['+', '-'];
    const op = pick(ops);
    const result = op === '+' ? v1 + v2 : v1 - v2;
    if (Math.abs(result) > 100) continue;
    const v2Str = v2 < 0 ? `(${v2})` : `${v2}`;
    return {
      id: uid(), leerdoel: 'C.negGetallen',
      vraag: `Bereken stap voor stap:\n$\\bigl(${g1.vraag.replace('Bereken: $','').replace('$','')}\\bigr) ${op === '+' ? '+' : '-'} ${v2Str}$`,
      antwoordType: 'integer', antwoord: { waarde: result }, data: {},
      hints: ['Bereken eerst de haakjes, dan de rest.', `Tussenstap 1: $${v1}$, dan $${v1} ${op} ${v2Str} = ${result}$`],
      oplossing: `Stap 1: ${g1.oplossing} $= ${v1}$\nStap 2: $${v1} ${op} ${v2Str} = ${result}$`
    };
  }
  const q = genG8(); q.leerdoel = 'C.negGetallen'; return q;
}

/* ── C.negGetallen b/c – langere expressies met negatieve getallen ───── */
function _buildNegCombi(leerdoelId, inclSqrt, inclPow) {
  const ops_pool = ['+', '-', '×', '÷'];
  const opTeX = op => op === '×' ? '\\times' : op === '÷' ? '\\div' : op;
  const isOk = v => v !== null && Number.isInteger(v) && Math.abs(v) <= 200;

  for (let p = 0; p < 400; p++) {
    const terms = [0,1,2,3].map(() => _genNegTerm(inclSqrt, inclPow));
    const ops   = [0,1,2].map(() => pick(ops_pool));
    const [t0,t1,t2,t3] = terms;
    const [op0,op1,op2] = ops;

    /* struct: 0 = standaard OOO, 1 = (t0○t1)○t2○t3,
               2 = t0○t1○(t2○t3),  3 = (t0○t1)○(t2○t3) */
    const struct = rand(0, 3);
    let result, tex;

    if (struct === 0) {
      result = _evalExprFull([t0.val,t1.val,t2.val,t3.val], [op0,op1,op2]);
      if (!isOk(result)) continue;
      tex = `${t0.tex} ${opTeX(op0)} ${t1.tex} ${opTeX(op1)} ${t2.tex} ${opTeX(op2)} ${t3.tex}`;
    } else if (struct === 1) {
      const inner = _applySimple(t0.val, op0, t1.val);
      if (!isOk(inner)) continue;
      result = _evalExprFull([inner, t2.val, t3.val], [op1, op2]);
      if (!isOk(result)) continue;
      tex = `(${t0.tex} ${opTeX(op0)} ${t1.tex}) ${opTeX(op1)} ${t2.tex} ${opTeX(op2)} ${t3.tex}`;
    } else if (struct === 2) {
      const inner = _applySimple(t2.val, op2, t3.val);
      if (!isOk(inner)) continue;
      result = _evalExprFull([t0.val, t1.val, inner], [op0, op1]);
      if (!isOk(result)) continue;
      tex = `${t0.tex} ${opTeX(op0)} ${t1.tex} ${opTeX(op1)} (${t2.tex} ${opTeX(op2)} ${t3.tex})`;
    } else {
      const inner1 = _applySimple(t0.val, op0, t1.val);
      const inner2 = _applySimple(t2.val, op2, t3.val);
      if (!isOk(inner1) || !isOk(inner2)) continue;
      result = _applySimple(inner1, op1, inner2);
      if (!isOk(result)) continue;
      tex = `(${t0.tex} ${opTeX(op0)} ${t1.tex}) ${opTeX(op1)} (${t2.tex} ${opTeX(op2)} ${t3.tex})`;
    }

    const spec = terms.filter(t => t.tex.includes('^') || t.tex.includes('\\sqrt'));
    const hintMain = struct > 0
      ? 'Volgorde: haakjes eerst, dan machten, dan × en ÷, dan + en −.'
      : 'Volgorde: machten eerst, dan × en ÷, dan + en −. Let op de tekens!';
    const hint2 = spec.length
      ? `Bereken machten: ${spec.map(t => `$${t.tex} = ${t.val}$`).join(', ')}`
      : struct > 0 ? 'Bereken eerst de haakjes, dan de rest.' : 'Let op de tekens bij negatieve getallen.';

    return {
      id: uid(), leerdoel: leerdoelId,
      vraag: `Bereken: $${tex}$`,
      antwoordType: 'integer', antwoord: { waarde: result }, data: {},
      hints: [hintMain, hint2],
      oplossing: spec.length
        ? `**Stap 1** (machten): ${spec.map(t => `$${t.tex} = ${t.val}$`).join(', ')}\n**Stap 2**: $${tex} = ${result}$`
        : `$${tex} = ${result}$`
    };
  }
  const q = genG8(); q.leerdoel = leerdoelId; return q;
}

/* b: 4 termen met negatieve getallen en kwadraten */
function genC_negGetallen_b() { return _buildNegCombi('C.negGetallen.b', true, false); }

/* c: 4 termen met negatieve getallen, kwadraten én machten */
function genC_negGetallen_c() { return _buildNegCombi('C.negGetallen.c', true, true); }

/* ── H/C-doel helpers ────────────────────────────────────────────────── */

/* Fraction arithmetic on [n, d] pairs. Returns simplified [n, d] or null. */
function _applyOp([n1, d1], op, [n2, d2]) {
  let rn, rd;
  if (op === '+') {
    const L = lcm(d1, d2);
    rn = n1 * (L / d1) + n2 * (L / d2); rd = L;
  } else if (op === '-') {
    const L = lcm(d1, d2);
    rn = n1 * (L / d1) - n2 * (L / d2); rd = L;
  } else if (op === '×') {
    rn = n1 * n2; rd = d1 * d2;
  } else {
    if (n2 === 0) return null;
    rn = n1 * d2; rd = d1 * n2;
  }
  if (rn <= 0 || rd <= 0) return null;
  const [sn, sd] = simplifyFrac(rn, rd);
  if (sd > 60) return null;
  return [sn, sd];
}

/* Format [n, d] as LaTeX string (auto-detects whole / mixed / proper, always simplified) */
function _fracTeX([n, d]) {
  const [sn, sd] = simplifyFrac(n, d);
  if (sd === 1) return `${sn}`;
  if (sn > sd) {
    const [w, rn, rd] = improperToMixed(sn, sd);
    return rn === 0 ? `${w}` : fmtMixed(w, rn, rd);
  }
  return fmtFrac(sn, sd);
}

/* Build antwoord object + type from [n, d] */
function _fracAntwoord([n, d]) {
  if (n % d === 0) return { antwoordType: 'integer', antwoord: { waarde: n / d } };
  if (n > d) {
    const [w, rn, rd] = improperToMixed(n, d);
    return rn === 0
      ? { antwoordType: 'integer', antwoord: { waarde: w } }
      : { antwoordType: 'mixed',   antwoord: { geheel: w, teller: rn, noemer: rd } };
  }
  return { antwoordType: 'fraction', antwoord: { teller: n, noemer: d } };
}

/* Random simplified proper fraction, optionally as a mixed number */
function _randFrac(allowMixed) {
  const DENS = [2, 3, 4, 5, 6, 8];
  const d = pick(DENS);
  const n = rand(1, d - 1);
  const [sn, sd] = simplifyFrac(n, d); // ensure always reduced
  if (allowMixed && Math.random() > 0.55) {
    const w = rand(1, 3);
    return [w * sd + sn, sd];
  }
  return [sn, sd];
}

/* LaTeX symbol for an operator */
function _opTeX(op) {
  if (op === '×') return '\\times';
  if (op === '÷') return '\\div';
  return op;
}

/* ── C.allBreuk – alle 8 breukbewerkingen gecombineerd ──────────────── */
function genC_allBreuk() {
  const lowPrec  = ['+', '-'];
  const highPrec = ['×', '÷'];

  for (let poging = 0; poging < 150; poging++) {
    /* Kies 2 bewerkingen – bij voorkeur uit verschillende prioriteitsgroepen */
    const mixPrec = Math.random() > 0.35;
    let op1, op2;
    if (mixPrec) {
      if (Math.random() > 0.5) { op1 = pick(lowPrec);  op2 = pick(highPrec); }
      else                      { op1 = pick(highPrec); op2 = pick(lowPrec);  }
    } else {
      if (Math.random() > 0.5) { op1 = pick(lowPrec);  op2 = pick(lowPrec);  }
      else                      { op1 = pick(highPrec); op2 = pick(highPrec); }
    }

    const needsMixed = lowPrec.includes(op1) || lowPrec.includes(op2);
    const a = _randFrac(needsMixed);
    const b = _randFrac(needsMixed);
    const c = _randFrac(needsMixed);

    /* Bereken uitkomst met correcte volgorde van bewerkingen */
    const orderOfOps = (lowPrec.includes(op1) && highPrec.includes(op2));
    let stap1val, result;

    if (orderOfOps) {
      /* a + b × c  →  b × c eerst */
      stap1val = _applyOp(b, op2, c);
      if (!stap1val) continue;
      result = _applyOp(a, op1, stap1val);
    } else {
      /* links naar rechts: (a op1 b) op2 c */
      stap1val = _applyOp(a, op1, b);
      if (!stap1val) continue;
      result = _applyOp(stap1val, op2, c);
    }

    if (!result) continue;
    const [rn, rd] = result;
    if (rn > 60 || rd > 24) continue;

    const { antwoordType, antwoord } = _fracAntwoord(result);

    /* Beschrijving van de stappen */
    let s1, s2;
    if (orderOfOps) {
      s1 = `Eerst $${_fracTeX(b)} ${_opTeX(op2)} ${_fracTeX(c)} = ${_fracTeX(stap1val)}$ ($${_opTeX(op2)}$ gaat vóór $${_opTeX(op1)}$)`;
      s2 = `Dan $${_fracTeX(a)} ${_opTeX(op1)} ${_fracTeX(stap1val)} = ${_fracTeX(result)}$`;
    } else {
      s1 = `**Stap 1:** $${_fracTeX(a)} ${_opTeX(op1)} ${_fracTeX(b)} = ${_fracTeX(stap1val)}$`;
      s2 = `**Stap 2:** $${_fracTeX(stap1val)} ${_opTeX(op2)} ${_fracTeX(c)} = ${_fracTeX(result)}$`;
    }

    const vraagStr = `$${_fracTeX(a)} ${_opTeX(op1)} ${_fracTeX(b)} ${_opTeX(op2)} ${_fracTeX(c)}$`;
    const hints = orderOfOps
      ? [`Let op de volgorde van bewerkingen: vermenigvuldigen en delen gaan vóór optellen en aftrekken.`, s1]
      : [`Werk de berekening stap voor stap van links naar rechts uit.`, s1];

    return {
      id: uid(), leerdoel: 'C.allBreuk',
      vraag: `Bereken: ${vraagStr}`,
      antwoordType, antwoord,
      data: { a, b, c, op1, op2 },
      hints, oplossing: `${s1}\n${s2}`
    };
  }

  /* Noodgeval: gebruik een eenvoudige optelling als fallback */
  const q = genB5(); q.leerdoel = 'C.allBreuk'; return q;
}

/* ── Leerdoel registry ───────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════
   PERCENTAGES – helpers en generators
   ══════════════════════════════════════════════════════════════════════ */

/** Bouw een kruistabel-vraag object.
 *  cellen: { tl, tr, bl, br } – elk { val, type:'input'|'vraag'|'prefilled', hint }
 *  type 'input'    → leeg invoervak, wordt gecontroleerd
 *  type 'vraag'    → toont '?', geen invoer, antwoord gaat in apart vak
 *  type 'prefilled'→ toont waarde in grijs, niet bewerkbaar
 */
function _mkKT(leerdoelId, vraagTxt, cellen, antwoord, eenheid, tolerantie, hints, oplossing) {
  return {
    id: uid(), leerdoel: leerdoelId,
    vraag: vraagTxt,
    antwoordType: 'kruistabel',
    tabel: { cellen },
    antwoord: { waarde: antwoord, tolerantie: tolerantie ?? 0.005 },
    eenheid: eenheid ?? '',
    hints, oplossing
  };
}

/* Nette verhouding deel/geheel waarbij pct een geheel getal is */
function _niceDeelGeheel() {
  const opties = [
    [1,2,50],[1,4,25],[3,4,75],[1,5,20],[2,5,40],[3,5,60],[4,5,80],
    [1,10,10],[3,10,30],[7,10,70],[9,10,90],
    [1,20,5],[3,20,15],[7,20,35],[9,20,45],[11,20,55],[13,20,65],[17,20,85],
  ];
  const [n, d, p] = pick(opties);
  const scale = pick([1,1,2,3,4,5,10]);
  return { deel: n*scale, geheel: d*scale, pct: p };
}

/* Nette toename/afname: oud × factor/100 is geheel getal */
function _niceToename(isAfname) {
  for (let i = 0; i < 120; i++) {
    const pct  = pick([10,20,25,50]);
    const oud  = rand(2, 24) * 4;          // veelvouden van 4 werken goed met 25%
    const fac  = isAfname ? (100-pct) : (100+pct);
    const nieuw = oud * fac / 100;
    if (Number.isInteger(nieuw) && nieuw > 0 && nieuw <= 500) return { oud, pct, nieuw };
  }
  return isAfname ? { oud:80, pct:25, nieuw:60 } : { oud:80, pct:25, nieuw:100 };
}

/* Moeilijkere toename/afname: resultaat kan decimaal zijn */
function _hardToename(isAfname) {
  const pct  = pick([15,18,30,35,12,22,45]);
  const oud  = rand(20, 200);
  const fac  = isAfname ? (100-pct) : (100+pct);
  const nieuw = Math.round(oud * fac / 10) / 10;
  const afgerond = Math.abs(nieuw - oud*fac/100) > 0.001;
  return { oud, pct, nieuw, afgerond };
}

/* ── P.1 – hoeveel % is X van Y ──────────────────────────────────── */
function genP1a() {
  const { deel, geheel, pct } = _niceDeelGeheel();
  return _mkKT('P.1a',
    `Hoeveel procent is $${deel}$ van $${geheel}$?`,
    { tl:{val:geheel,type:'input',hint:null}, tr:{val:deel,  type:'input',hint:null},
      bl:{val:100,   type:'input',hint:null}, br:{val:null,  type:'vraag',hint:null} },
    pct, '%', 0.005,
    ['Zet het <em>geheel</em> links boven 100%, het <em>deel</em> rechts.',
     `Berekening via het kruis: $${deel} \\times 100 \\div ${geheel} = ${pct}$`],
    `$\\dfrac{${deel} \\times 100}{${geheel}} = ${pct}\\%$`
  );
}

function genP1b() {
  for (let i = 0; i < 80; i++) {
    const geheel = rand(12, 80);
    const deel   = rand(1, geheel-1);
    const pctEx  = deel/geheel*100;
    const pct    = Math.round(pctEx*10)/10;
    if (pct <= 0 || pct >= 100) continue;
    const afr  = Math.abs(pct-pctEx) > 0.001;
    const vTxt = afr ? `Hoeveel procent is $${deel}$ van $${geheel}$? Rond af op 1 decimaal.`
                     : `Hoeveel procent is $${deel}$ van $${geheel}$?`;
    return _mkKT('P.1b', vTxt,
      { tl:{val:geheel,type:'input',hint:null}, tr:{val:deel,type:'input',hint:null},
        bl:{val:100,   type:'input',hint:null}, br:{val:null,type:'vraag',hint:null} },
      pct, '%', afr ? 0.005 : 0.05,
      ['Zet het geheel links boven 100%, het deel rechts.',
       afr ? `Kruis: $${deel} \\times 100 \\div ${geheel} \\approx ${pct}\\%$`
           : `Kruis: $${deel} \\times 100 \\div ${geheel} = ${pct}\\%$`],
      `$\\dfrac{${deel} \\times 100}{${geheel}} \\approx ${pct}\\%$`
    );
  }
  return genP1a();
}

/* ── P.2 – geheel bij deel in % ──────────────────────────────────── */
function genP2a() {
  for (let i = 0; i < 100; i++) {
    const pct    = pick([10,20,25,40,50,75,80]);
    const geheel = rand(2,20)*10;
    const deel   = geheel*pct/100;
    if (!Number.isInteger(deel) || deel < 1) continue;
    return _mkKT('P.2a',
      `$${deel}$ is $${pct}\\%$ van welk getal?`,
      { tl:{val:null, type:'vraag',hint:null}, tr:{val:deel, type:'input',hint:null},
        bl:{val:100,  type:'input',hint:null}, br:{val:pct,  type:'input',hint:null} },
      geheel, '', 0.005,
      ['Zet het <em>bekende deel</em> rechts. Links staat het geheel (onbekend).',
       `Kruis: $${deel} \\times 100 \\div ${pct} = ${geheel}$`],
      `$\\dfrac{${deel} \\times 100}{${pct}} = ${geheel}$`
    );
  }
  return _mkKT('P.2a','$30$ is $50\\%$ van welk getal?',
    {tl:{val:null,type:'vraag',hint:null},tr:{val:30,type:'input',hint:null},
     bl:{val:100,type:'input',hint:null},br:{val:50,type:'input',hint:null}},
    60,'',0.005,['Kruis: deel × 100 ÷ %','$30 \\times 100 \\div 50 = 60$'],
    '$30 \\times 100 \\div 50 = 60$');
}

function genP2b() {
  for (let i = 0; i < 100; i++) {
    const pct    = pick([12,15,18,30,35,45,60,70]);
    const geheel = rand(10,200);
    const deelEx = geheel*pct/100;
    const deel   = Math.round(deelEx*10)/10;
    if (deel < 1) continue;
    const antw   = Math.round(deel*100/pct*10)/10;
    const afr    = Math.abs(antw - geheel) > 0.11;
    return _mkKT('P.2b',
      `$${deel}$ is $${pct}\\%$ van welk getal?${afr?' Rond af op 1 decimaal.':''}`,
      { tl:{val:null,type:'vraag',hint:null}, tr:{val:deel,type:'input',hint:null},
        bl:{val:100, type:'input',hint:null}, br:{val:pct, type:'input',hint:null} },
      antw, '', 0.05,
      ['Zet het bekende deel rechts. Links staat het onbekende geheel.',
       `Kruis: $${deel} \\times 100 \\div ${pct} \\approx ${antw}$`],
      `$\\dfrac{${deel} \\times 100}{${pct}} \\approx ${antw}$`
    );
  }
  return genP2a();
}

/* ── P.3 – procentuele verandering ───────────────────────────────── */
function _genP3(leerdoelId, metHints) {
  for (let i = 0; i < 100; i++) {
    const pct      = pick([10,20,25,50]);
    const isToename = Math.random() > 0.5;
    const oud      = rand(2,20)*10;
    const verander = oud*pct/100;
    if (!Number.isInteger(verander)) continue;
    const nieuw    = isToename ? oud+verander : oud-verander;
    const ver      = isToename ? 'gestegen' : 'gedaald';
    const ctx      = pick([
      `Een prijs was €$${oud}$ en is ${ver} naar €$${nieuw}$.`,
      `Een klas had $${oud}$ leerlingen en heeft er nu $${nieuw}$.`,
      `Een getal was $${oud}$ en is nu $${nieuw}$.`,
    ]);
    const cellen = metHints
      ? { tl:{val:oud,     type:'prefilled',hint:null},
          tr:{val:verander,type:'prefilled',hint:null},
          bl:{val:100,     type:'prefilled',hint:null},
          br:{val:null,    type:'vraag',   hint:null} }
      : { tl:{val:oud,     type:'input',   hint:null},
          tr:{val:verander,type:'input',   hint:null},
          bl:{val:100,     type:'input',   hint:null},
          br:{val:null,    type:'vraag',   hint:null} };
    return _mkKT(leerdoelId,
      `${ctx} Met hoeveel procent is de waarde ${ver}?`,
      cellen, pct, '%', 0.05,
      [ metHints
          ? 'Zet de beginwaarde links, de absolute verandering rechts. Links onderaan altijd 100.'
          : 'Zet de beginwaarde links boven 100%, de absolute verandering rechts.',
        `Kruis: $${verander} \\times 100 \\div ${oud} = ${pct}\\%$` ],
      `$\\dfrac{${verander} \\times 100}{${oud}} = ${pct}\\%$`
    );
  }
  return genP1a();
}
function genP3a() { return _genP3('P.3a', true);  }
function genP3b() { return _genP3('P.3b', false); }

/* ── P.4 – nieuwe waarde na toename ─────────────────────────────── */
function _genP4(leerdoelId, hard) {
  const { oud, pct, nieuw, afgerond } = hard ? _hardToename(false) : _niceToename(false);
  const ctx = pick([
    `Een prijs van €$${oud}$ wordt verhoogd met $${pct}\\%$.`,
    `Een salaris van €$${oud}$ stijgt met $${pct}\\%$.`,
    `Een getal $${oud}$ neemt toe met $${pct}\\%$.`,
  ]);
  const afrTxt = (hard && afgerond) ? ' Rond af op 1 decimaal.' : '';
  return _mkKT(leerdoelId,
    `${ctx} Wat is de nieuwe waarde?${afrTxt}`,
    { tl:{val:oud,    type:'input',hint:null}, tr:{val:null,    type:'vraag',hint:null},
      bl:{val:100,    type:'input',hint:null}, br:{val:100+pct, type:'input',hint:null} },
    nieuw, '', (hard && !afgerond)?0.05:0.005,
    ['Zet de beginwaarde links. Rechtsonder: 100% + het stijgingspercentage.',
     `$(100+${pct})\\% = ${100+pct}\\%$. Kruis: $${oud} \\times ${100+pct} \\div 100$`],
    `$\\dfrac{${oud} \\times ${100+pct}}{100} = ${nieuw}$`
  );
}
function genP4a() { return _genP4('P.4a', false); }
function genP4b() { return _genP4('P.4b', true);  }

/* ── P.5 – nieuwe waarde na afname ──────────────────────────────── */
function _genP5(leerdoelId, hard) {
  const { oud, pct, nieuw, afgerond } = hard ? _hardToename(true) : _niceToename(true);
  const ctx = pick([
    `Een prijs van €$${oud}$ wordt verlaagd met $${pct}\\%$.`,
    `Een product kost €$${oud}$ en er is $${pct}\\%$ korting.`,
    `Een getal $${oud}$ neemt af met $${pct}\\%$.`,
  ]);
  const afrTxt = (hard && afgerond) ? ' Rond af op 1 decimaal.' : '';
  return _mkKT(leerdoelId,
    `${ctx} Wat is de nieuwe waarde?${afrTxt}`,
    { tl:{val:oud,    type:'input',hint:null}, tr:{val:null,    type:'vraag',hint:null},
      bl:{val:100,    type:'input',hint:null}, br:{val:100-pct, type:'input',hint:null} },
    nieuw, '', (hard && !afgerond)?0.05:0.005,
    ['Zet de beginwaarde links. Rechtsonder: 100% − het kortingspercentage.',
     `$(100-${pct})\\% = ${100-pct}\\%$. Kruis: $${oud} \\times ${100-pct} \\div 100$`],
    `$\\dfrac{${oud} \\times ${100-pct}}{100} = ${nieuw}$`
  );
}
function genP5a() { return _genP5('P.5a', false); }
function genP5b() { return _genP5('P.5b', true);  }

/* ── P.6 – oud bij procentuele toename ──────────────────────────── */
function _genP6(leerdoelId, hard) {
  if (hard) {
    for (let i = 0; i < 200; i++) {
      const pct  = pick([12, 15, 18, 22, 30, 35]);
      const nieuw = rand(50, 300);
      const antw  = Math.round(nieuw * 100 / (100+pct) * 10) / 10;
      if (antw <= 0 || Math.abs(antw - Math.round(antw)) < 0.05) continue;
      const ctx = pick([
        `Na een stijging van $${pct}\\%$ is de prijs nu €$${nieuw}$.`,
        `Na $${pct}\\%$ toename is een getal nu $${nieuw}$.`,
        `Een artikel is $${pct}\\%$ duurder geworden en kost nu €$${nieuw}$.`,
      ]);
      return _mkKT(leerdoelId,
        `${ctx} Wat was de oorspronkelijke waarde? Rond af op 1 decimaal.`,
        { tl:{val:null,   type:'vraag',hint:null}, tr:{val:nieuw,   type:'input',hint:null},
          bl:{val:100,    type:'input',hint:null}, br:{val:100+pct, type:'input',hint:null} },
        antw, '', 0.005,
        ['Zet de bekende nieuwe waarde rechts. Rechtsonder: 100% + het stijgingspercentage.',
         `Kruis: $${nieuw} \\times 100 \\div ${100+pct} \\approx ${antw}$`],
        `$\\dfrac{${nieuw} \\times 100}{${100+pct}} \\approx ${antw}$`
      );
    }
  }
  const { oud, pct, nieuw } = _niceToename(false);
  const ctx = pick([
    `Na een stijging van $${pct}\\%$ is de prijs nu €$${nieuw}$.`,
    `Na $${pct}\\%$ toename is een getal nu $${nieuw}$.`,
    `Een artikel is $${pct}\\%$ duurder geworden en kost nu €$${nieuw}$.`,
  ]);
  return _mkKT(leerdoelId,
    `${ctx} Wat was de oorspronkelijke waarde?`,
    { tl:{val:null,   type:'vraag',hint:null}, tr:{val:nieuw,   type:'input',hint:null},
      bl:{val:100,    type:'input',hint:null}, br:{val:100+pct, type:'input',hint:null} },
    oud, '', 0.005,
    ['Zet de bekende nieuwe waarde rechts. Rechtsonder: 100% + het stijgingspercentage.',
     `Kruis: $${nieuw} \\times 100 \\div ${100+pct} = ${oud}$`],
    `$\\dfrac{${nieuw} \\times 100}{${100+pct}} = ${oud}$`
  );
}
function genP6a() { return _genP6('P.6a', false); }
function genP6b() { return _genP6('P.6b', true);  }

/* ── P.7 – oud bij procentuele afname ───────────────────────────── */
function _genP7(leerdoelId, hard) {
  if (hard) {
    for (let i = 0; i < 200; i++) {
      const pct  = pick([12, 15, 18, 22, 30, 35]);
      if (pct >= 100) continue;
      const nieuw = rand(30, 250);
      const antw  = Math.round(nieuw * 100 / (100-pct) * 10) / 10;
      if (antw <= 0 || Math.abs(antw - Math.round(antw)) < 0.05) continue;
      const ctx = pick([
        `Na een daling van $${pct}\\%$ is de prijs nu €$${nieuw}$.`,
        `Na $${pct}\\%$ afname is een getal nu $${nieuw}$.`,
        `Een product heeft $${pct}\\%$ korting en kost nu €$${nieuw}$.`,
      ]);
      return _mkKT(leerdoelId,
        `${ctx} Wat was de oorspronkelijke prijs? Rond af op 1 decimaal.`,
        { tl:{val:null,   type:'vraag',hint:null}, tr:{val:nieuw,   type:'input',hint:null},
          bl:{val:100,    type:'input',hint:null}, br:{val:100-pct, type:'input',hint:null} },
        antw, '', 0.005,
        ['Zet de bekende nieuwe waarde rechts. Rechtsonder: 100% − het kortingspercentage.',
         `Kruis: $${nieuw} \\times 100 \\div ${100-pct} \\approx ${antw}$`],
        `$\\dfrac{${nieuw} \\times 100}{${100-pct}} \\approx ${antw}$`
      );
    }
  }
  const { oud, pct, nieuw } = _niceToename(true);
  const ctx = pick([
    `Na een daling van $${pct}\\%$ is de prijs nu €$${nieuw}$.`,
    `Na $${pct}\\%$ afname is een getal nu $${nieuw}$.`,
    `Een product heeft $${pct}\\%$ korting en kost nu €$${nieuw}$.`,
  ]);
  return _mkKT(leerdoelId,
    `${ctx} Wat was de oorspronkelijke prijs?`,
    { tl:{val:null,   type:'vraag',hint:null}, tr:{val:nieuw,   type:'input',hint:null},
      bl:{val:100,    type:'input',hint:null}, br:{val:100-pct, type:'input',hint:null} },
    oud, '', 0.005,
    ['Zet de bekende nieuwe waarde rechts. Rechtsonder: 100% − het kortingspercentage.',
     `Kruis: $${nieuw} \\times 100 \\div ${100-pct} = ${oud}$`],
    `$\\dfrac{${nieuw} \\times 100}{${100-pct}} = ${oud}$`
  );
}
function genP7a() { return _genP7('P.7a', false); }
function genP7b() { return _genP7('P.7b', true);  }

/* ── P.8 – opeenvolgende toe- en afnames ────────────────────────── */
function genP8a() {
  for (let i = 0; i < 100; i++) {
    const start   = rand(5,20)*10;
    const p1      = pick([10,20,25,50]);
    const up1     = Math.random()>0.5;
    const f1      = up1 ? (100+p1)/100 : (100-p1)/100;
    const na1     = start*f1;
    if (!Number.isInteger(na1)) continue;
    const p2      = pick([10,20,25,50]);
    const up2     = Math.random()>0.5;
    const f2      = up2 ? (100+p2)/100 : (100-p2)/100;
    const na2     = na1*f2;
    if (!Number.isInteger(na2) || na2<=0) continue;
    const v1 = up1?'verhoogd':'verlaagd', v2 = up2?'verhoogd':'verlaagd';
    return {
      id: uid(), leerdoel:'P.8a',
      vraag:`Een product kost €$${start}$. De prijs wordt eerst met $${p1}\\%$ ${v1} en daarna met $${p2}\\%$ ${v2}. Wat is de eindprijs?`,
      antwoordType:'integer', antwoord:{waarde:na2}, data:{},
      hints:[`Stap 1: $${start} \\times \\frac{${Math.round(f1*100)}}{100} = ${na1}$`,
             `Stap 2: $${na1} \\times \\frac{${Math.round(f2*100)}}{100} = ${na2}$`],
      oplossing:`$${start} \\times \\frac{${Math.round(f1*100)}}{100} \\times \\frac{${Math.round(f2*100)}}{100} = ${na2}$`
    };
  }
  return {id:uid(),leerdoel:'P.8a',vraag:'Een prijs van €$100$ wordt met $20\\%$ verhoogd en daarna met $10\\%$ verlaagd. Wat is de eindprijs?',
    antwoordType:'integer',antwoord:{waarde:108},data:{},
    hints:['Stap 1: $100 \\times 1{,}20 = 120$','Stap 2: $120 \\times 0{,}90 = 108$'],
    oplossing:'$100 \\times 1{,}20 \\times 0{,}90 = 108$'};
}

function genP8b() {
  for (let i = 0; i < 100; i++) {
    const start = rand(100,500);
    const p1    = pick([15,18,30,35,12,22]);
    const p2    = pick([5,8,15,22,12]);
    const up1   = Math.random()>0.5, up2 = Math.random()>0.5;
    const f1    = up1?(100+p1)/100:(100-p1)/100;
    const f2    = up2?(100+p2)/100:(100-p2)/100;
    const na2   = Math.round(start*f1*f2*100)/100;
    if (na2<=0) continue;
    const v1 = up1?'verhoogd':'verlaagd', v2 = up2?'verhoogd':'verlaagd';
    return {
      id:uid(), leerdoel:'P.8b',
      vraag:`Een prijs van €$${start}$ wordt met $${p1}\\%$ ${v1} en daarna met $${p2}\\%$ ${v2}. Wat is de eindprijs? Rond af op centen.`,
      antwoordType:'decimal', antwoord:{waarde:na2, tolerantie:0.005}, data:{},
      hints:[`Stap 1: $${start} \\times \\frac{${Math.round(f1*100)}}{100}$`,
             `Daarna de tussenuitkomst nogmaals aanpassen met $\\frac{${Math.round(f2*100)}}{100}$`],
      oplossing:`$${start} \\times \\frac{${Math.round(f1*100)}}{100} \\times \\frac{${Math.round(f2*100)}}{100} \\approx ${na2}$`
    };
  }
  return genP8a();
}

/* ── DP / PV – omrekenen ─────────────────────────────────────────── */
function genDP1() {
  const pct = pick([5,10,12.5,15,20,25,30,37.5,40,50,60,62.5,75,80,90]);
  const dec = Math.round(pct/100*10000)/10000;
  return {
    id:uid(), leerdoel:'DP.1',
    vraag:`Schrijf $${pct}\\%$ als decimaal getal.`,
    antwoordType:'decimal', antwoord:{waarde:dec,tolerantie:0.00005}, data:{},
    hints:['Deel het percentage door 100.',`$${pct} \\div 100 = ${dec}$`],
    oplossing:`$${pct}\\% = ${pct} \\div 100 = ${dec}$`
  };
}

function genDP2() {
  const decs = [0.1,0.15,0.2,0.25,0.3,0.375,0.4,0.5,0.6,0.625,0.75,0.8,0.9,0.05,0.125];
  const dec  = pick(decs);
  const pct  = Math.round(dec*100*10)/10;
  return {
    id:uid(), leerdoel:'DP.2',
    vraag:`Schrijf $${dec}$ als percentage.`,
    antwoordType:'percentage', antwoord:{waarde:pct}, data:{},
    hints:['Vermenigvuldig het decimaal getal met 100.',`$${dec} \\times 100 = ${pct}$`],
    oplossing:`$${dec} \\times 100 = ${pct}\\%$`
  };
}

function genPV1() {
  const vs = [[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,8],[3,8],[7,8],[1,10],[3,10],[7,10]];
  const [n, d] = pick(vs);
  const pct = Math.round(n/d*100*10)/10;
  return {
    id:uid(), leerdoel:'PV.1',
    vraag:`Schrijf de verhouding $${n}:${d}$ als percentage.`,
    antwoordType:'percentage', antwoord:{waarde:pct, tolerantie:0.05}, data:{},
    hints:['Deel het eerste getal door het tweede en vermenigvuldig met 100.',
           `$${n} \\div ${d} \\times 100 = ${pct}\\%$`],
    oplossing:`$\\dfrac{${n}}{${d}} \\times 100 = ${pct}\\%$`
  };
}

function genPV2() {
  const pcts = [10,20,25,40,50,60,75,80,90];
  const pct  = pick(pcts);
  const g    = gcd(pct,100);
  const n    = pct/g, d = 100/g;
  return {
    id:uid(), leerdoel:'PV.2',
    vraag:`Schrijf $${pct}\\%$ als verhouding (in laagste termen).`,
    antwoordType:'ratio', antwoord:{deel1:n, deel2:d}, data:{},
    hints:['Schrijf het percentage als breuk met noemer 100 en vereenvoudig.',
           `$${pct}\\% = \\dfrac{${pct}}{100} = ${n}:${d}$`],
    oplossing:`$${pct}\\% = \\dfrac{${pct}}{100} = ${n}:${d}$`
  };
}

/* ── H.P1tot7 – husselen alle percentageberekeningen ────────────── */
function genH_P1tot7() {
  const gens = [genP1a,genP1b,genP2a,genP2b,genP3a,genP3b,
                genP4a,genP4b,genP5a,genP5b,genP6a,genP6b,genP7a,genP7b];
  const q = pick(gens)();
  q.leerdoel = 'H.P1tot7';
  return q;
}

/* ── Eenheden omrekenen ──────────────────────────────────────────── */
function _eu(s) { return s.replace(/²/g,'<sup>2</sup>').replace(/³/g,'<sup>3</sup>'); }
function _ef(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 10000) / 10000).replace('.', '{,}');
}

function _maatladder(stappen, noot) {
  const cs = 'padding:3px 12px;border:1px solid #aac;background:#f0f4ff;font-weight:bold;text-align:center;';
  const cf = 'font-size:.78em;color:#555;text-align:center;padding:1px 0;';
  let h = '<div style="text-align:center;margin:.3em 0;">'
        + '<table style="display:inline-table;border-collapse:collapse;">';
  for (const [naam, factor] of stappen) {
    h += `<tr><td style="${cs}">${_eu(naam)}</td></tr>`;
    if (factor) h += `<tr><td style="${cf}">&times; ${factor}</td></tr>`;
  }
  h += '</table>';
  if (noot) h += `<div style="font-size:.8em;color:#555;margin:.2em 0;">${noot}</div>`;
  h += '</div>';
  return h;
}

const _LG  = 'Groter → kleiner: &times; factor &nbsp;|&nbsp; Kleiner → groter: &divide; factor';
const _LG2 = 'Elke stap &times;&nbsp;100. &nbsp; Groter → kleiner: &times; &nbsp;|&nbsp; Kleiner → groter: &divide;';

const EENHEDEN_TABEL = {
  'E.T1a': _maatladder([['uur',60],['min',60],['sec']], _LG),
  'E.T1b': _maatladder([['week',7],['dag',24],['uur']], _LG),
  'E.T1c': _maatladder([['week',7],['dag',24],['uur',60],['min',60],['sec']], _LG),
  'E.L1a': _maatladder([['m',10],['dm',10],['cm',10],['mm']], _LG),
  'E.L1b': _maatladder([['km',10],['hm',10],['dam',10],['m']], _LG),
  'E.L1c': _maatladder([['km',10],['hm',10],['dam',10],['m',10],['dm',10],['cm',10],['mm']], _LG),
  'E.O1a': _maatladder([['m²',100],['dm²',100],['cm²',100],['mm²']], _LG2),
  'E.O1b': _maatladder([['km²',100],['ha',100],['are']], _LG2),
  'E.O1c': _maatladder([['km²',100],['ha',100],['are',100],['m²',100],['dm²',100],['cm²',100],['mm²']], _LG2),
  'E.I1':  _maatladder([['m³ (= kL)',1000],['dm³ (= L)',10],['dL',10],['cL',10],['mL (= cm³)']],
             'Let op: m³ → dm³: &times;&nbsp;1000, overige stappen: &times;&nbsp;10'),
  'E.S1':  '<div style="text-align:center;margin:.3em 0;font-size:.9em;">'
         + '<table style="display:inline-table;border-collapse:collapse;">'
         + '<tr><th style="padding:3px 10px;border:1px solid #aac;background:#f0f4ff;">Omrekening</th>'
         +     '<th style="padding:3px 10px;border:1px solid #aac;background:#f0f4ff;">Factor</th></tr>'
         + '<tr><td style="padding:3px 10px;border:1px solid #aac;">m/s &rarr; km/h</td>'
         +     '<td style="padding:3px 10px;border:1px solid #aac;">&times; 3,6</td></tr>'
         + '<tr><td style="padding:3px 10px;border:1px solid #aac;">km/h &rarr; m/s</td>'
         +     '<td style="padding:3px 10px;border:1px solid #aac;">&divide; 3,6</td></tr>'
         + '</table>'
         + '<div style="font-size:.8em;color:#555;margin:.2em 0;">'
         + '3,6 = 3600 &divide; 1000 &nbsp;(seconden per uur &divide; meters per km)'
         + '</div></div>',
};

function _eQ(id, fv, fu, tu, tv) {
  const isInt = Number.isInteger(tv);
  const fac = tv / fv;
  const invFac = fv / tv;
  let hint1, hint2;
  if (fac >= 1) {
    hint1 = `$1$ ${_eu(fu)} $= ${_ef(fac)}$ ${_eu(tu)}`;
    hint2 = `$${_ef(fv)} \\times ${_ef(fac)} = ${_ef(tv)}$`;
  } else {
    hint1 = `$1$ ${_eu(tu)} $= ${_ef(invFac)}$ ${_eu(fu)}`;
    hint2 = `$${_ef(fv)} \\div ${_ef(invFac)} = ${_ef(tv)}$`;
  }
  const tabel = EENHEDEN_TABEL[id];
  return {
    id: uid(), leerdoel: id,
    vraag: `$${_ef(fv)}$ ${_eu(fu)} $= \\ldots$ ${_eu(tu)}`,
    antwoordType: isInt ? 'integer' : 'decimal',
    antwoord: { waarde: tv, ...(isInt ? {} : { tolerantie: 0.0005 }) },
    data: {},
    hints: tabel ? [tabel, hint1, hint2] : [hint1, hint2],
    oplossing: `$${_ef(fv)}$ ${_eu(fu)} $= ${_ef(tv)}$ ${_eu(tu)}`
  };
}

// ── Tijdseenheden ────────────────────────────────────────────────────
const ET1a_POOL = [
  ...[1,2,3,4,5,6,8,10,12,24].map(v => [v,'uur','minuten',v*60]),
  ...[1,2,3,4,6,8,10,12].map(v => [v*60,'minuten','uur',v]),
  ...[1,2,3,5,9,10,15,20,30,45].map(v => [v,'minuten','seconden',v*60]),
  ...[1,2,3,4,5,6,7,8,9,10].map(v => [v*60,'seconden','minuten',v]),
];
function genET1a() { return _eQ('E.T1a', ...pick(ET1a_POOL)); }

const ET1b_POOL = [
  ...[1,2,3,5,6,7,10,14].map(v => [v,'dag','uur',v*24]),
  ...[1,2,3,4,5,6,7,10].map(v => [v*24,'uur','dag',v]),
  ...[1,2,3,4,5,6,8,10].map(v => [v,'week','dagen',v*7]),
  ...[1,2,3,4,5,6,8,10].map(v => [v*7,'dagen','week',v]),
];
function genET1b() { return _eQ('E.T1b', ...pick(ET1b_POOL)); }

const ET1c_POOL = [
  // week ↔ uur
  ...[1,2,3,4].map(v => [v,'week','uur',v*168]),
  ...[1,2,3,4].map(v => [v*168,'uur','week',v]),
  // dag ↔ minuten
  ...[1,2,3].map(v => [v,'dag','minuten',v*1440]),
  ...[1,2,3].map(v => [v*1440,'minuten','dag',v]),
  // uur ↔ seconden
  ...[1,2,3,6,12].map(v => [v,'uur','seconden',v*3600]),
  ...[1,2,3,6].map(v => [v*3600,'seconden','uur',v]),
  // dag ↔ seconden
  [1,'dag','seconden',86400], [86400,'seconden','dag',1],
  [2,'dag','seconden',172800], [172800,'seconden','dag',2],
  // week ↔ minuten
  [1,'week','minuten',10080], [10080,'minuten','week',1],
];
function genET1c() { return _eQ('E.T1c', ...pick(ET1c_POOL)); }

// ── Lengtematen ──────────────────────────────────────────────────────
const EL1a_POOL = [
  // mm ↔ cm
  [10,'mm','cm',1], [20,'mm','cm',2], [27,'mm','cm',2.7], [30,'mm','cm',3],
  [45,'mm','cm',4.5], [50,'mm','cm',5], [75,'mm','cm',7.5], [100,'mm','cm',10],
  [1,'cm','mm',10], [2.7,'cm','mm',27], [4.5,'cm','mm',45], [8,'cm','mm',80],
  [10,'cm','mm',100], [0.8,'cm','mm',8],
  // cm ↔ dm
  [10,'cm','dm',1], [25,'cm','dm',2.5], [30,'cm','dm',3], [80,'cm','dm',8],
  [100,'cm','dm',10], [85,'cm','dm',8.5], [120,'cm','dm',12],
  [1,'dm','cm',10], [3,'dm','cm',30], [8,'dm','cm',80], [0.5,'dm','cm',5],
  [2.5,'dm','cm',25], [12,'dm','cm',120],
  // dm ↔ m
  [10,'dm','m',1], [25,'dm','m',2.5], [30,'dm','m',3], [35,'dm','m',3.5],
  [100,'dm','m',10], [825,'dm','m',82.5],
  [1,'m','dm',10], [3,'m','dm',30], [6,'m','dm',60], [0.4,'m','dm',4],
  [2.5,'m','dm',25], [8.25,'m','dm',82.5],
  // m ↔ cm
  [1,'m','cm',100], [3,'m','cm',300], [0.4,'m','cm',40], [2.5,'m','cm',250],
  [100,'cm','m',1], [400,'cm','m',4], [1000,'cm','m',10], [40,'cm','m',0.4],
];
function genEL1a() { return _eQ('E.L1a', ...pick(EL1a_POOL)); }

const EL1b_POOL = [
  // m ↔ km
  [1000,'m','km',1], [2000,'m','km',2], [5000,'m','km',5], [42000,'m','km',42],
  [500,'m','km',0.5], [2500,'m','km',2.5], [195,'m','km',0.195], [750,'m','km',0.75],
  [1,'km','m',1000], [2,'km','m',2000], [5,'km','m',5000], [42,'km','m',42000],
  [0.5,'km','m',500], [1.5,'km','m',1500], [3.5,'km','m',3500],
  // m ↔ dam
  [10,'m','dam',1], [50,'m','dam',5], [120,'m','dam',12], [310,'m','dam',31],
  [1,'dam','m',10], [5,'dam','m',50], [12,'dam','m',120], [31,'dam','m',310],
  // dam ↔ hm
  [10,'dam','hm',1], [40,'dam','hm',4], [310,'dam','hm',31],
  [1,'hm','dam',10], [4,'hm','dam',40], [31,'hm','dam',310],
  // hm ↔ m
  [1,'hm','m',100], [5,'hm','m',500],
  [100,'m','hm',1], [400,'m','hm',4], [500,'m','hm',5],
];
function genEL1b() { return _eQ('E.L1b', ...pick(EL1b_POOL)); }

const EL1c_POOL = [
  // mm ↔ m (3 stappen)
  [1000,'mm','m',1], [2000,'mm','m',2], [5000,'mm','m',5], [6000,'mm','m',6],
  [1,'m','mm',1000], [2,'m','mm',2000], [6,'m','mm',6000],
  // mm ↔ dm (2 stappen)
  [100,'mm','dm',1], [200,'mm','dm',2], [500,'mm','dm',5],
  [1,'dm','mm',100], [2,'dm','mm',200], [5,'dm','mm',500],
  // cm ↔ dam (3 stappen)
  [1000,'cm','dam',1], [2000,'cm','dam',2],
  [1,'dam','cm',1000], [2,'dam','cm',2000],
  // dm ↔ dam (2 stappen)
  [100,'dm','dam',1], [200,'dm','dam',2],
  [1,'dam','dm',100], [2,'dam','dm',200],
  // cm ↔ km (5 stappen)
  [100000,'cm','km',1], [200000,'cm','km',2], [400000,'cm','km',4],
  [1,'km','cm',100000], [4,'km','cm',400000],
  // dm ↔ km (4 stappen)
  [10000,'dm','km',1], [20000,'dm','km',2],
  [1,'km','dm',10000], [2,'km','dm',20000],
  // cm ↔ hm (4 stappen)
  [10000,'cm','hm',1], [20000,'cm','hm',2],
  [1,'hm','cm',10000], [2,'hm','cm',20000],
];
function genEL1c() { return _eQ('E.L1c', ...pick(EL1c_POOL)); }

// ── Oppervlaktematen ──────────────────────────────────────────────────
const EO1a_POOL = [
  // mm² ↔ cm²
  [100,'mm²','cm²',1], [200,'mm²','cm²',2], [250,'mm²','cm²',2.5],
  [400,'mm²','cm²',4], [500,'mm²','cm²',5],
  [1,'cm²','mm²',100], [2,'cm²','mm²',200], [5,'cm²','mm²',500],
  [1.5,'cm²','mm²',150], [0.5,'cm²','mm²',50], [4.5,'cm²','mm²',450],
  // cm² ↔ dm²
  [100,'cm²','dm²',1], [200,'cm²','dm²',2], [350,'cm²','dm²',3.5],
  [500,'cm²','dm²',5], [1000,'cm²','dm²',10],
  [1,'dm²','cm²',100], [2,'dm²','cm²',200], [5,'dm²','cm²',500],
  [0.5,'dm²','cm²',50], [3.5,'dm²','cm²',350], [1.5,'dm²','cm²',150],
  // dm² ↔ m²
  [100,'dm²','m²',1], [200,'dm²','m²',2], [150,'dm²','m²',1.5],
  [250,'dm²','m²',2.5], [500,'dm²','m²',5],
  [1,'m²','dm²',100], [2,'m²','dm²',200], [5,'m²','dm²',500],
  [1.5,'m²','dm²',150], [0.5,'m²','dm²',50],
];
function genEO1a() { return _eQ('E.O1a', ...pick(EO1a_POOL)); }

const EO1b_POOL = [
  // ha ↔ are
  [1,'ha','are',100], [2,'ha','are',200], [5,'ha','are',500],
  [0.5,'ha','are',50], [1.5,'ha','are',150], [3.5,'ha','are',350], [0.25,'ha','are',25],
  [100,'are','ha',1], [200,'are','ha',2], [500,'are','ha',5],
  [50,'are','ha',0.5], [150,'are','ha',1.5], [25,'are','ha',0.25],
  // km² ↔ ha
  [1,'km²','ha',100], [2,'km²','ha',200], [5,'km²','ha',500],
  [0.5,'km²','ha',50], [0.25,'km²','ha',25], [1.5,'km²','ha',150],
  [100,'ha','km²',1], [200,'ha','km²',2], [500,'ha','km²',5],
  [50,'ha','km²',0.5], [25,'ha','km²',0.25],
  // km² ↔ are
  [1,'km²','are',10000], [0.5,'km²','are',5000], [2,'km²','are',20000],
  [10000,'are','km²',1], [5000,'are','km²',0.5], [20000,'are','km²',2],
];
function genEO1b() { return _eQ('E.O1b', ...pick(EO1b_POOL)); }

const EO1c_POOL = [
  // m² ↔ are (1 are = 100 m²)
  [1,'m²','are',100], [2,'m²','are',200], [5,'m²','are',500],
  [0.5,'m²','are',50], [1.5,'m²','are',150], [3,'m²','are',300],
  [100,'are','m²',1], [200,'are','m²',2], [50,'are','m²',0.5], [150,'are','m²',1.5],
  // m² ↔ ha (1 ha = 10 000 m²)
  [10000,'m²','ha',1], [20000,'m²','ha',2], [5000,'m²','ha',0.5], [25000,'m²','ha',2.5],
  [1,'ha','m²',10000], [2,'ha','m²',20000], [0.5,'ha','m²',5000],
  // cm² ↔ m² (1 m² = 10 000 cm²)
  [10000,'cm²','m²',1], [1,'m²','cm²',10000],
  [5000,'cm²','m²',0.5], [20000,'cm²','m²',2], [2,'m²','cm²',20000],
  // mm² ↔ m² (1 m² = 1 000 000 mm², kleine getallen)
  [10000,'mm²','m²',1], [5000,'mm²','m²',0.5], [1,'m²','mm²',10000],
];
function genEO1c() { return _eQ('E.O1c', ...pick(EO1c_POOL)); }

const EI1_POOL = [
  // mL ↔ cL
  [10,'mL','cL',1], [50,'mL','cL',5], [100,'mL','cL',10], [250,'mL','cL',25],
  [1,'cL','mL',10], [5,'cL','mL',50], [25,'cL','mL',250], [0.5,'cL','mL',5],
  // cL ↔ dL
  [10,'cL','dL',1], [30,'cL','dL',3], [50,'cL','dL',5], [100,'cL','dL',10],
  [1,'dL','cL',10], [5,'dL','cL',50], [2.5,'dL','cL',25], [0.5,'dL','cL',5],
  // dL ↔ L
  [10,'dL','L',1], [20,'dL','L',2], [5,'dL','L',0.5], [25,'dL','L',2.5],
  [1,'L','dL',10], [2,'L','dL',20], [5,'L','dL',50], [0.5,'L','dL',5],
  // mL ↔ L
  [1000,'mL','L',1], [500,'mL','L',0.5], [2000,'mL','L',2], [250,'mL','L',0.25],
  [1,'L','mL',1000], [2,'L','mL',2000], [0.5,'L','mL',500],
  // cL ↔ L
  [100,'cL','L',1], [50,'cL','L',0.5], [200,'cL','L',2],
  [1,'L','cL',100], [2.5,'L','cL',250], [0.5,'L','cL',50],
  // dm³ ↔ L
  [1,'dm³','L',1], [5,'dm³','L',5], [10,'dm³','L',10],
  [0.5,'dm³','L',0.5], [2.5,'dm³','L',2.5],
  [1,'L','dm³',1], [5,'L','dm³',5], [10,'L','dm³',10],
  // dm³ ↔ m³
  [1000,'dm³','m³',1], [500,'dm³','m³',0.5], [2500,'dm³','m³',2.5],
  [1,'m³','dm³',1000], [2,'m³','dm³',2000], [0.5,'m³','dm³',500],
  // L ↔ m³
  [1000,'L','m³',1], [500,'L','m³',0.5], [2000,'L','m³',2], [5000,'L','m³',5],
  [1,'m³','L',1000], [2,'m³','L',2000], [0.5,'m³','L',500],
];
function genEI1() { return _eQ('E.I1', ...pick(EI1_POOL)); }

// ── Snelheden ────────────────────────────────────────────────────────
const ES1_POOL = [
  // m/s → km/h (×3.6)
  [1,'m/s','km/h',3.6],
  [2,'m/s','km/h',7.2],
  [4,'m/s','km/h',14.4],
  [5,'m/s','km/h',18],
  [10,'m/s','km/h',36],
  [15,'m/s','km/h',54],
  [20,'m/s','km/h',72],
  [25,'m/s','km/h',90],
  [30,'m/s','km/h',108],
  // km/h → m/s (÷3.6)
  [3.6,'km/h','m/s',1],
  [7.2,'km/h','m/s',2],
  [14.4,'km/h','m/s',4],
  [18,'km/h','m/s',5],
  [36,'km/h','m/s',10],
  [54,'km/h','m/s',15],
  [72,'km/h','m/s',20],
  [90,'km/h','m/s',25],
  [108,'km/h','m/s',30],
  [144,'km/h','m/s',40],
];
function genES1() { return _eQ('E.S1', ...pick(ES1_POOL)); }

function genH_Eenheden() {
  const gens = [genET1a, genET1b, genET1c, genEL1a, genEL1b, genEL1c, genEO1a, genEO1b, genEO1c, genEI1, genES1];
  const q = pick(gens)();
  q.leerdoel = 'H.Eenheden';
  return q;
}

/* ══════════════════════════════════════════════════════════════════════
   ALGEBRA
══════════════════════════════════════════════════════════════════════ */

/* Formatteer een monooom voor LaTeX: _alM(3,'x',2) → '3x^{2}', _alM(-1,'x',1) → '-x' */
function _alM(c, v, p) {
  if (c === 0) return '0';
  const neg = c < 0, a = Math.abs(c);
  const cs = (a === 1 && v) ? '' : String(a);
  const vs = v ? (p && p > 1 ? `${v}^{${p}}` : v) : '';
  return (neg ? '-' : '') + cs + vs;
}

/* Formatteer een som van termen [{c,v,p}] */
function _alS(termen) {
  let r = '';
  for (let i = 0; i < termen.length; i++) {
    const { c, v, p } = termen[i];
    if (c === 0) continue;
    if (i === 0 || r === '') r += _alM(c, v, p);
    else if (c > 0) r += ` + ${_alM(c, v, p)}`;
    else r += ` - ${_alM(-c, v, p)}`;
  }
  return r || '0';
}

/* Helper: maak een algebra-vraag object */
function _aQ(id, vraag, antwoord, vars, hints, oplossing) {
  return {
    id: uid(), leerdoel: id, vraag,
    antwoordType: 'algebra',
    antwoord: { expr: antwoord, vars },
    data: {}, hints, oplossing
  };
}

/* ── A.O1a – optellen/aftrekken, 2 gelijksoortige termen ────────── */
function genAO1a() {
  const letters = ['x','y','a','b','n','m'];
  const v = pick(letters);
  let c1, c2, res;
  do {
    c1 = rand(-9, 9); c2 = rand(-9, 9);
    res = c1 + c2;
  } while (!c1 || !c2 || !res || res === c1 || res === c2);
  const q = _alS([{c:c1,v,p:1}, {c:c2,v,p:1}]);
  const a = _alM(res, v, 1);
  return _aQ('A.O1a', `Vereenvoudig: $${q}$`, a, [v],
    [`Dit zijn gelijksoortige termen: beide hebben de letter $${v}$.`,
     `Tel de getallen bij $${v}$ op: $(${c1}) + (${c2}) = ${res}$, dus: $${a}$`],
    `$${q}$\n$= ${a}$`);
}

/* ── A.O1b – 3-4 termen, verschillende letters ──────────────────── */
const AO1b_POOL = [
  { q:'3x - 6y + 2y', a:'3x - 4y', vars:['x','y'], h:'Combineer de $y$-termen: $-6y + 2y = -4y$' },
  { q:'-2n + 6 - 5n - 7', a:'-7n - 1', vars:['n'], h:'$n$-termen: $-2n-5n=-7n$; constanten: $6-7=-1$' },
  { q:'5a + 3b - 2a + b', a:'3a + 4b', vars:['a','b'], h:'$5a-2a=3a$ en $3b+b=4b$' },
  { q:'4x + 3y - x - 5y', a:'3x - 2y', vars:['x','y'], h:'$4x-x=3x$ en $3y-5y=-2y$' },
  { q:'-3m + 8 + 7m - 5', a:'4m + 3', vars:['m'], h:'$-3m+7m=4m$ en $8-5=3$' },
  { q:'2a - 4b + 3a + 2b', a:'5a - 2b', vars:['a','b'], h:'$2a+3a=5a$ en $-4b+2b=-2b$' },
  { q:'6x - 3 - 2x + 7', a:'4x + 4', vars:['x'], h:'$6x-2x=4x$ en $-3+7=4$' },
  { q:'-5y + 4x - 3y + x', a:'5x - 8y', vars:['x','y'], h:'$4x+x=5x$ en $-5y-3y=-8y$' },
  { q:'8n - 3 - n + 5', a:'7n + 2', vars:['n'], h:'$8n-n=7n$ en $-3+5=2$' },
  { q:'3p - 2q + 5p + 4q', a:'8p + 2q', vars:['p','q'], h:'$3p+5p=8p$ en $-2q+4q=2q$' },
  { q:'7x - 4 + 3y - 2x + 6 - y', a:'5x + 2y + 2', vars:['x','y'], h:'$x$-termen: $7x-2x=5x$; $y$-termen: $3y-y=2y$; constanten: $-4+6=2$' },
  { q:'-4a + 2b - 3 + a - 5b + 7', a:'-3a - 3b + 4', vars:['a','b'], h:'$-4a+a=-3a$; $2b-5b=-3b$; $-3+7=4$' },
];
function genAO1b() {
  const e = pick(AO1b_POOL);
  return _aQ('A.O1b', `Vereenvoudig: $${e.q}$`, e.a, e.vars,
    ['Zoek gelijksoortige termen bij elkaar (zelfde letter).', e.h],
    `$${e.q}$\n$= ${e.a}$`);
}

/* ── A.O1c – 4-5 termen met machten ─────────────────────────────── */
const AO1c_POOL = [
  { q:'t^{3} + 2t^{2} - 3t^{3} + t^{2}', a:'-2t^{3} + 3t^{2}', vars:['t'],
    h:'$t^3$-termen: $1-3=-2$; $t^2$-termen: $2+1=3$' },
  { q:'2x^{2} - 5x + 3x^{2} + 2x', a:'5x^{2} - 3x', vars:['x'],
    h:'$2x^2+3x^2=5x^2$ en $-5x+2x=-3x$' },
  { q:'-4a^{3} + 2a - a^{3} - 5a', a:'-5a^{3} - 3a', vars:['a'],
    h:'$-4a^3-a^3=-5a^3$ en $2a-5a=-3a$' },
  { q:'3n^{2} + 4n - n^{2} - 7n + 2', a:'2n^{2} - 3n + 2', vars:['n'],
    h:'$3n^2-n^2=2n^2$; $4n-7n=-3n$; constante: $2$' },
  { q:'x^{3} - 2x^{2} + 4x^{3} - 3x^{2} + x', a:'5x^{3} - 5x^{2} + x', vars:['x'],
    h:'$x^3+4x^3=5x^3$; $-2x^2-3x^2=-5x^2$; $+x$' },
  { q:'-3m^{2} + 5 + 2m^{2} - m - 8 + 3m', a:'-m^{2} + 2m - 3', vars:['m'],
    h:'$-3m^2+2m^2=-m^2$; $-m+3m=2m$; $5-8=-3$' },
  { q:'4b^{2} - 2b^{3} + b^{2} - b^{3}', a:'-3b^{3} + 5b^{2}', vars:['b'],
    h:'$-2b^3-b^3=-3b^3$ en $4b^2+b^2=5b^2$' },
  { q:'2y^{4} - 3y^{2} + y^{4} + 5y^{2} - y^{4}', a:'2y^{4} + 2y^{2}', vars:['y'],
    h:'$2y^4+y^4-y^4=2y^4$ en $-3y^2+5y^2=2y^2$' },
  { q:'5x^{2} - 3x + 2x^{3} - x^{2} + 4x - x^{3}', a:'x^{3} + 4x^{2} + x', vars:['x'],
    h:'$2x^3-x^3=x^3$; $5x^2-x^2=4x^2$; $-3x+4x=x$' },
];
function genAO1c() {
  const e = pick(AO1c_POOL);
  return _aQ('A.O1c', `Vereenvoudig: $${e.q}$`, e.a, e.vars,
    ['Let op de macht: alleen termen met dezelfde letter én dezelfde macht zijn gelijksoortig.', e.h],
    `$${e.q}$\n$= ${e.a}$`);
}

/* ── A.V1a – getal × letterterm ─────────────────────────────────── */
function genAV1a() {
  const letters = ['x','y','a','b','n','m','w','p'];
  const v = pick(letters);
  let f1, f2, res;
  do {
    f1 = rand(-9, 9); f2 = rand(2, 9);
    res = f1 * f2;
  } while (Math.abs(f1) <= 1 || Math.abs(res) > 72);
  const term = `${f2}${v}`;
  const a = _alM(res, v, 1);
  return _aQ('A.V1a', `Vereenvoudig: $${f1} \\cdot ${term}$`, a, [v],
    [`Vermenigvuldig de getallen: $${f1} \\times ${f2} = ${res}$.`,
     `$${f1} \\cdot ${term} = ${a}$`],
    `$${f1} \\cdot ${term}$\n$= ${a}$`);
}

/* ── A.V1b – vermenigvuldigen van 2 monomials ───────────────────── */
function genAV1b() {
  const letters = ['x','y','a','b','n','m'];
  const v1 = pick(letters);
  const zelfde = Math.random() < 0.5;
  const v2 = zelfde ? v1 : pick(letters.filter(l => l !== v1));
  let c1, c2;
  do { c1 = rand(-9, 9); c2 = rand(-9, 9); }
  while (Math.abs(c1) <= 1 || Math.abs(c2) <= 1 || Math.abs(c1*c2) > 72);
  const resC = c1 * c2;
  const t1 = _alM(c1, v1, 1), t2 = _alM(c2, v2, 1);
  const d1 = c1 < 0 ? `(${t1})` : t1, d2 = c2 < 0 ? `(${t2})` : t2;
  let a;
  if (zelfde) {
    a = _alM(resC, v1, 2);
  } else {
    const [va, vb] = [v1, v2].sort();
    const s = resC < 0 ? '-' : '';
    a = `${s}${Math.abs(resC)}${va}${vb}`;
  }
  return _aQ('A.V1b', `Vereenvoudig: $${d1} \\cdot ${d2}$`, a, [...new Set([v1,v2])],
    [`Vermenigvuldig de getallen: $${c1} \\times ${c2} = ${resC}$.`,
     zelfde ? `$${v1} \\times ${v1} = ${v1}^2$ → antwoord: $${a}$`
            : `$${v1} \\times ${v2} = ${[v1,v2].sort().join('')}$ → antwoord: $${a}$`],
    `$${d1} \\cdot ${d2}$\n$= ${a}$`);
}

/* ── A.V1c – vermenigvuldigen van 3 monomials ───────────────────── */
const AV1c_POOL = [
  { q:'2x \\cdot 3x \\cdot 4x', a:'24x^{3}', vars:['x'], h:'$2\\times3\\times4=24$; $x\\cdot x\\cdot x=x^3$' },
  { q:'(-2x) \\cdot 3x \\cdot (-x)', a:'6x^{3}', vars:['x'], h:'$(-2)\\times3\\times(-1)=6$; $x^3$' },
  { q:'2x \\cdot (-3y) \\cdot 4x', a:'-24x^{2}y', vars:['x','y'], h:'$2\\times(-3)\\times4=-24$; $x^2y$' },
  { q:'(-3a) \\cdot 2b \\cdot a', a:'-6a^{2}b', vars:['a','b'], h:'$(-3)\\times2=-6$; $a\\cdot a=a^2$' },
  { q:'5x \\cdot (-2x) \\cdot 3y', a:'-30x^{2}y', vars:['x','y'], h:'$5\\times(-2)\\times3=-30$; $x^2y$' },
  { q:'(-2n) \\cdot (-3n) \\cdot 4', a:'24n^{2}', vars:['n'], h:'$(-2)\\times(-3)\\times4=24$; $n^2$' },
  { q:'4a \\cdot (-b) \\cdot 2a', a:'-8a^{2}b', vars:['a','b'], h:'$4\\times(-1)\\times2=-8$; $a^2b$' },
  { q:'(-x) \\cdot (-2x) \\cdot (-3x)', a:'-6x^{3}', vars:['x'], h:'Drie factoren, drie minnetjes: negatief. $1\\times2\\times3=6$' },
  { q:'(-2m) \\cdot 4m \\cdot (-m)', a:'8m^{3}', vars:['m'], h:'$(-2)\\times4\\times(-1)=8$; $m^3$' },
  { q:'3x \\cdot 2y \\cdot (-5x)', a:'-30x^{2}y', vars:['x','y'], h:'$3\\times2\\times(-5)=-30$; $x^2y$' },
];
function genAV1c() {
  const e = pick(AV1c_POOL);
  return _aQ('A.V1c', `Vereenvoudig: $${e.q}$`, e.a, e.vars,
    ['Vermenigvuldig alle getallen; tel de machten per letter op.', e.h],
    `$${e.q}$\n$= ${e.a}$`);
}

/* ── A.M1a – gemengd, 3 factoren/termen ────────────────────────── */
const AM1a_POOL = [
  { q:'3 \\cdot 2x + 4x', a:'10x', vars:['x'], h:'Eerst: $3\\cdot2x=6x$; dan: $6x+4x=10x$' },
  { q:'5x - 2 \\cdot 3x', a:'-x', vars:['x'], h:'Eerst: $2\\cdot3x=6x$; dan: $5x-6x=-x$' },
  { q:'4 \\cdot 3y + 2y', a:'14y', vars:['y'], h:'Eerst: $4\\cdot3y=12y$; dan: $12y+2y=14y$' },
  { q:'-2 \\cdot 5n - 3n', a:'-13n', vars:['n'], h:'Eerst: $-2\\cdot5n=-10n$; dan: $-10n-3n=-13n$' },
  { q:'6x + 3 \\cdot (-4x)', a:'-6x', vars:['x'], h:'Eerst: $3\\cdot(-4x)=-12x$; dan: $6x-12x=-6x$' },
  { q:'2a \\cdot 4 - 3a', a:'5a', vars:['a'], h:'Eerst: $2a\\cdot4=8a$; dan: $8a-3a=5a$' },
  { q:'7b - 3b \\cdot 2', a:'b', vars:['b'], h:'Eerst: $3b\\cdot2=6b$; dan: $7b-6b=b$' },
  { q:'-4x \\cdot 3 + 20x', a:'8x', vars:['x'], h:'Eerst: $-4x\\cdot3=-12x$; dan: $-12x+20x=8x$' },
  { q:'3m + (-2) \\cdot 4m', a:'-5m', vars:['m'], h:'Eerst: $(-2)\\cdot4m=-8m$; dan: $3m-8m=-5m$' },
  { q:'(-3) \\cdot 2a + 10a', a:'4a', vars:['a'], h:'Eerst: $(-3)\\cdot2a=-6a$; dan: $-6a+10a=4a$' },
];
function genAM1a() {
  const e = pick(AM1a_POOL);
  return _aQ('A.M1a', `Vereenvoudig: $${e.q}$`, e.a, e.vars,
    ['Bereken eerst de vermenigvuldiging, daarna pas de optelling of aftrekking.', e.h],
    `$${e.q}$\n$= ${e.a}$`);
}

/* ── A.M1b – gemengd, 4 factoren/termen ────────────────────────── */
const AM1b_POOL = [
  { q:'2x \\cdot 3 + 4x \\cdot 2', a:'14x', vars:['x'],
    h:'$2x\\cdot3=6x$ en $4x\\cdot2=8x$; dan: $6x+8x=14x$' },
  { q:'5a \\cdot 2 - 3a \\cdot 4', a:'-2a', vars:['a'],
    h:'$5a\\cdot2=10a$ en $3a\\cdot4=12a$; dan: $10a-12a=-2a$' },
  { q:'3 \\cdot 2n + 4 \\cdot 5n', a:'26n', vars:['n'],
    h:'$3\\cdot2n=6n$ en $4\\cdot5n=20n$; dan: $6n+20n=26n$' },
  { q:'2x \\cdot 3y + 4x \\cdot y', a:'10xy', vars:['x','y'],
    h:'$2x\\cdot3y=6xy$ en $4x\\cdot y=4xy$; dan: $6xy+4xy=10xy$' },
  { q:'6x^{2} - 2x \\cdot 3x + x^{2}', a:'x^{2}', vars:['x'],
    h:'$2x\\cdot3x=6x^2$; dan: $6x^2-6x^2+x^2=x^2$' },
  { q:'3x \\cdot 2x + 5x \\cdot (-x)', a:'x^{2}', vars:['x'],
    h:'$3x\\cdot2x=6x^2$ en $5x\\cdot(-x)=-5x^2$; dan: $6x^2-5x^2=x^2$' },
  { q:'(-2a) \\cdot 3b + 5a \\cdot b', a:'-ab', vars:['a','b'],
    h:'$-2a\\cdot3b=-6ab$ en $5a\\cdot b=5ab$; dan: $-6ab+5ab=-ab$' },
  { q:'4m \\cdot 2 - 3m + m \\cdot 5', a:'10m', vars:['m'],
    h:'$4m\\cdot2=8m$ en $m\\cdot5=5m$; dan: $8m-3m+5m=10m$' },
  { q:'2x^{2} \\cdot 3 - x \\cdot 4x + x^{2}', a:'3x^{2}', vars:['x'],
    h:'$2x^2\\cdot3=6x^2$ en $x\\cdot4x=4x^2$; dan: $6x^2-4x^2+x^2=3x^2$' },
];
function genAM1b() {
  const e = pick(AM1b_POOL);
  return _aQ('A.M1b', `Vereenvoudig: $${e.q}$`, e.a, e.vars,
    ['Bereken eerst alle vermenigvuldigingen, combineer daarna gelijksoortige termen.', e.h],
    `$${e.q}$\n$= ${e.a}$`);
}

/* ── A.D1a – delen, één letter ──────────────────────────────────── */
const AD1a_POOL = [
  { t:'9a^{4}', n:'3a', a:'3a^{3}', vars:['a'] },
  { t:'8x^{3}', n:'4x', a:'2x^{2}', vars:['x'] },
  { t:'12y^{5}', n:'4y^{2}', a:'3y^{3}', vars:['y'] },
  { t:'15n^{4}', n:'5n', a:'3n^{3}', vars:['n'] },
  { t:'6x^{2}', n:'2x', a:'3x', vars:['x'] },
  { t:'-10a^{3}', n:'5a', a:'-2a^{2}', vars:['a'] },
  { t:'20m^{4}', n:'4m^{2}', a:'5m^{2}', vars:['m'] },
  { t:'-15b^{3}', n:'3b', a:'-5b^{2}', vars:['b'] },
  { t:'18x^{6}', n:'6x^{3}', a:'3x^{3}', vars:['x'] },
  { t:'16y^{3}', n:'8y', a:'2y^{2}', vars:['y'] },
  { t:'-12a^{4}', n:'4a^{2}', a:'-3a^{2}', vars:['a'] },
  { t:'24n^{5}', n:'6n^{2}', a:'4n^{3}', vars:['n'] },
];
function genAD1a() {
  const e = pick(AD1a_POOL);
  return _aQ('A.D1a',
    `Vereenvoudig: $\\dfrac{${e.t}}{${e.n}}$`, e.a, e.vars,
    ['Deel de getallen; trek de macht van de noemer af van de macht van de teller.',
     `$\\dfrac{${e.t}}{${e.n}} = ${e.a}$`],
    `$\\dfrac{${e.t}}{${e.n}}$\n$= ${e.a}$`);
}

/* ── A.D1b – delen, meerdere letters ────────────────────────────── */
const AD1b_POOL = [
  { t:'8a^{3}b^{2}', n:'4a^{2}', a:'2ab^{2}', vars:['a','b'] },
  { t:'12x^{2}y^{3}', n:'3xy', a:'4xy^{2}', vars:['x','y'] },
  { t:'15a^{2}b', n:'5ab', a:'3a', vars:['a','b'] },
  { t:'-6x^{2}y', n:'2xy', a:'-3x', vars:['x','y'] },
  { t:'20m^{3}n^{2}', n:'4mn', a:'5m^{2}n', vars:['m','n'] },
  { t:'9a^{2}b^{3}', n:'3ab', a:'3ab^{2}', vars:['a','b'] },
  { t:'-10x^{3}y^{2}', n:'5xy^{2}', a:'-2x^{2}', vars:['x','y'] },
  { t:'16a^{2}b^{2}', n:'4ab', a:'4ab', vars:['a','b'] },
  { t:'-18m^{2}n^{3}', n:'6mn^{2}', a:'-3mn', vars:['m','n'] },
  { t:'24x^{3}y^{2}', n:'8x^{2}y', a:'3xy', vars:['x','y'] },
];
function genAD1b() {
  const e = pick(AD1b_POOL);
  return _aQ('A.D1b',
    `Vereenvoudig: $\\dfrac{${e.t}}{${e.n}}$`, e.a, e.vars,
    ['Deel de getallen; trek per letter de macht van de noemer af van die van de teller.',
     `$\\dfrac{${e.t}}{${e.n}} = ${e.a}$`],
    `$\\dfrac{${e.t}}{${e.n}}$\n$= ${e.a}$`);
}

/* Helper: maak een algebra-vraag object met gefactoriseerd antwoord */
function _aQF(id, vraag, antwoord, vars, hints, oplossing) {
  return {
    id: uid(), leerdoel: id, vraag,
    antwoordType: 'algebra',
    antwoord: { expr: antwoord, vars, vorm: 'factored' },
    data: {}, hints, oplossing
  };
}

/* Helper: algebra-vraag met merkwaardig-product antwoord (vereist ^2 notatie voor kwadraatfactoren) */
function _aQM(id, vraag, antwoord, vars, hints, oplossing) {
  return {
    id: uid(), leerdoel: id, vraag,
    antwoordType: 'algebra',
    antwoord: { expr: antwoord, vars, vorm: 'merkwaardig' },
    data: {}, hints, oplossing
  };
}

/* ── A.H1a – enkele haakjes, natuurlijke getallen ───────────────── */
function genAH1a() {
  const letters = ['x','y','a','b','n'];
  const v = pick(letters);
  const a = rand(2, 6);
  const b = rand(2, 8);
  const c = rand(1, 10);
  const plus = Math.random() > 0.5;
  const q = `${a}(${b}${v} ${plus ? '+' : '-'} ${c})`;
  const rc = a * b, rk = a * c;
  const ans = `${_alM(rc, v, 1)} ${plus ? '+' : '-'} ${rk}`;
  return _aQ('A.H1a', `Werk de haakjes uit: $${q}$`, ans, [v],
    [`Vermenigvuldig elk getal tussen de haakjes met $${a}$.`,
     `$${a} \\cdot ${b}${v} = ${rc}${v}$ en $${a} \\cdot ${c} = ${rk}$`],
    `$${q}$\n$= ${a} \\cdot ${b}${v} ${plus ? '+' : '-'} ${a} \\cdot ${c}$\n$= ${ans}$`);
}

/* ── A.H1b – enkele haakjes, gehele getallen (negatieve factor) ── */
function genAH1b() {
  const letters = ['x','y','a','b','n'];
  const v = pick(letters);
  const a = rand(2, 6);
  const b = rand(2, 8);
  const c = rand(1, 8);
  const plus = Math.random() > 0.5;
  const q = `-${a}(${b}${v} ${plus ? '+' : '-'} ${c})`;
  const rc = -(a * b);
  const rk = plus ? -(a * c) : (a * c);
  const t1 = _alM(rc, v, 1);
  const ans = rk > 0 ? `${t1} + ${rk}` : `${t1} - ${Math.abs(rk)}`;
  return _aQ('A.H1b', `Werk de haakjes uit: $${q}$`, ans, [v],
    [`Let op het minteken: $-${a}$ wordt vermenigvuldigd met elk getal tussen de haakjes.`,
     `$-${a} \\cdot ${b}${v} = ${rc}${v}$ en $-${a} \\cdot (${plus ? '+' : '-'}${c}) = ${rk}$`],
    `$${q}$\n$= ${ans}$`);
}

/* ── A.H1c – dubbele haakjes (FOIL) ──────────────────────────────── */
const AH1c_POOL = [
  { q:'(x+2)(x+3)', vars:['x'], c2:5, c1:6,  h:'$2+3=5$ en $2\\cdot3=6$' },
  { q:'(x+1)(x+4)', vars:['x'], c2:5, c1:4,  h:'$1+4=5$ en $1\\cdot4=4$' },
  { q:'(x+2)(x+5)', vars:['x'], c2:7, c1:10, h:'$2+5=7$ en $2\\cdot5=10$' },
  { q:'(x+3)(x+4)', vars:['x'], c2:7, c1:12, h:'$3+4=7$ en $3\\cdot4=12$' },
  { q:'(x-1)(x+4)', vars:['x'], c2:3, c1:-4, h:'$-1+4=3$ en $-1\\cdot4=-4$' },
  { q:'(x+3)(x-2)', vars:['x'], c2:1, c1:-6, h:'$3-2=1$ en $3\\cdot(-2)=-6$' },
  { q:'(x-2)(x-3)', vars:['x'], c2:-5, c1:6, h:'$-2-3=-5$ en $(-2)\\cdot(-3)=6$' },
  { q:'(x-1)(x-5)', vars:['x'], c2:-6, c1:5, h:'$-1-5=-6$ en $(-1)\\cdot(-5)=5$' },
  { q:'(x+4)(x-1)', vars:['x'], c2:3, c1:-4, h:'$4-1=3$ en $4\\cdot(-1)=-4$' },
  { q:'(x-3)(x+5)', vars:['x'], c2:2, c1:-15,h:'$-3+5=2$ en $-3\\cdot5=-15$' },
  { q:'(a+2)(a+6)', vars:['a'], c2:8, c1:12, h:'$2+6=8$ en $2\\cdot6=12$' },
  { q:'(n-2)(n-4)', vars:['n'], c2:-6,c1:8,  h:'$-2-4=-6$ en $(-2)\\cdot(-4)=8$' },
];

function genAH1c() {
  const e = pick(AH1c_POOL);
  const v = e.vars[0];
  const termen = [{c:1,v,p:2}];
  if (e.c2 !== 0) termen.push({c:e.c2,v,p:1});
  if (e.c1 !== 0) termen.push({c:e.c1,v:'',p:0});
  const ans = _alS(termen);
  return _aQ('A.H1c', `Werk de haakjes uit: $${e.q}$`, ans, e.vars,
    ['Vermenigvuldig elk getal uit de eerste haakjes met elk getal uit de tweede (FOIL).', e.h],
    `$${e.q}$\n$= ${ans}$`);
}

/* ── A.H1d – merkwaardige producten uitwerken ─────────────────────── */
const AH1d_POOL = [
  { q:'(x+2)^{2}',   ans:'x^{2} + 4x + 4',   vars:['x'], type:'kw+', a:'x', b:'2',
    opl:'$(x+2)^2 = x^2 + 2\\cdot x\\cdot 2 + 2^2$\n$= x^{2} + 4x + 4$' },
  { q:'(x+3)^{2}',   ans:'x^{2} + 6x + 9',   vars:['x'], type:'kw+', a:'x', b:'3',
    opl:'$(x+3)^2 = x^2 + 2\\cdot x\\cdot 3 + 3^2$\n$= x^{2} + 6x + 9$' },
  { q:'(x+5)^{2}',   ans:'x^{2} + 10x + 25', vars:['x'], type:'kw+', a:'x', b:'5',
    opl:'$(x+5)^2 = x^2 + 2\\cdot x\\cdot 5 + 5^2$\n$= x^{2} + 10x + 25$' },
  { q:'(x-2)^{2}',   ans:'x^{2} - 4x + 4',   vars:['x'], type:'kw-', a:'x', b:'2',
    opl:'$(x-2)^2 = x^2 - 2\\cdot x\\cdot 2 + 2^2$\n$= x^{2} - 4x + 4$' },
  { q:'(x-3)^{2}',   ans:'x^{2} - 6x + 9',   vars:['x'], type:'kw-', a:'x', b:'3',
    opl:'$(x-3)^2 = x^2 - 2\\cdot x\\cdot 3 + 3^2$\n$= x^{2} - 6x + 9$' },
  { q:'(x-4)^{2}',   ans:'x^{2} - 8x + 16',  vars:['x'], type:'kw-', a:'x', b:'4',
    opl:'$(x-4)^2 = x^2 - 2\\cdot x\\cdot 4 + 4^2$\n$= x^{2} - 8x + 16$' },
  { q:'(x+2)(x-2)',  ans:'x^{2} - 4',         vars:['x'], type:'vk',  a:'x', b:'2',
    opl:'$(x+2)(x-2) = x^2 - 2^2$\n$= x^{2} - 4$' },
  { q:'(x+3)(x-3)',  ans:'x^{2} - 9',         vars:['x'], type:'vk',  a:'x', b:'3',
    opl:'$(x+3)(x-3) = x^2 - 3^2$\n$= x^{2} - 9$' },
  { q:'(x+5)(x-5)',  ans:'x^{2} - 25',        vars:['x'], type:'vk',  a:'x', b:'5',
    opl:'$(x+5)(x-5) = x^2 - 5^2$\n$= x^{2} - 25$' },
  { q:'(a+4)^{2}',   ans:'a^{2} + 8a + 16',  vars:['a'], type:'kw+', a:'a', b:'4',
    opl:'$(a+4)^2 = a^2 + 2\\cdot a\\cdot 4 + 4^2$\n$= a^{2} + 8a + 16$' },
  { q:'(n-5)^{2}',   ans:'n^{2} - 10n + 25', vars:['n'], type:'kw-', a:'n', b:'5',
    opl:'$(n-5)^2 = n^2 - 2\\cdot n\\cdot 5 + 5^2$\n$= n^{2} - 10n + 25$' },
  { q:'(y+6)(y-6)',  ans:'y^{2} - 36',        vars:['y'], type:'vk',  a:'y', b:'6',
    opl:'$(y+6)(y-6) = y^2 - 6^2$\n$= y^{2} - 36$' },
];

function genAH1d() {
  const e = pick(AH1d_POOL);
  const regel = e.type === 'kw+' ? `$(a+b)^2 = a^2 + 2ab + b^2$ met $a=${e.a}$, $b=${e.b}$`
    : e.type === 'kw-' ? `$(a-b)^2 = a^2 - 2ab + b^2$ met $a=${e.a}$, $b=${e.b}$`
    : `$(a+b)(a-b) = a^2 - b^2$ met $a=${e.a}$, $b=${e.b}$`;
  return _aQ('A.H1d', `Werk de haakjes uit: $${e.q}$`, e.ans, e.vars,
    ['Gebruik een merkwaardig product.', regel],
    e.opl);
}

/* ── A.F1a – ontbinden: 1 term buiten haakjes (ggd) ──────────────── */
const AF1a_POOL = [
  { q:'6x^{2} + 4x',   ans:'2x(3x + 2)',  vars:['x'], h:'Ggd van $6$ en $4$ is $2$; laagste macht van $x$ is $x^1$.', opl:'$6x^{2} + 4x$\n$= 2x \\cdot 3x + 2x \\cdot 2$\n$= 2x(3x + 2)$' },
  { q:'9x^{2} + 3x',   ans:'3x(3x + 1)',  vars:['x'], h:'Ggd van $9$ en $3$ is $3$; laagste macht van $x$ is $x^1$.', opl:'$9x^{2} + 3x$\n$= 3x \\cdot 3x + 3x \\cdot 1$\n$= 3x(3x + 1)$' },
  { q:'12x^{2} - 8x',  ans:'4x(3x - 2)',  vars:['x'], h:'Ggd van $12$ en $8$ is $4$; laagste macht van $x$ is $x^1$.', opl:'$12x^{2} - 8x$\n$= 4x \\cdot 3x - 4x \\cdot 2$\n$= 4x(3x - 2)$' },
  { q:'15a^{2} - 5a',  ans:'5a(3a - 1)',  vars:['a'], h:'Ggd van $15$ en $5$ is $5$; laagste macht van $a$ is $a^1$.', opl:'$15a^{2} - 5a$\n$= 5a \\cdot 3a - 5a \\cdot 1$\n$= 5a(3a - 1)$' },
  { q:'10x^{2} + 6x',  ans:'2x(5x + 3)',  vars:['x'], h:'Ggd van $10$ en $6$ is $2$; laagste macht van $x$ is $x^1$.', opl:'$10x^{2} + 6x$\n$= 2x \\cdot 5x + 2x \\cdot 3$\n$= 2x(5x + 3)$' },
  { q:'8y^{2} - 12y',  ans:'4y(2y - 3)',  vars:['y'], h:'Ggd van $8$ en $12$ is $4$; laagste macht van $y$ is $y^1$.', opl:'$8y^{2} - 12y$\n$= 4y \\cdot 2y - 4y \\cdot 3$\n$= 4y(2y - 3)$' },
  { q:'4n^{2} + 6n',   ans:'2n(2n + 3)',  vars:['n'], h:'Ggd van $4$ en $6$ is $2$; laagste macht van $n$ is $n^1$.', opl:'$4n^{2} + 6n$\n$= 2n \\cdot 2n + 2n \\cdot 3$\n$= 2n(2n + 3)$' },
  { q:'6x + 9',        ans:'3(2x + 3)',   vars:['x'], h:'Ggd van $6$ en $9$ is $3$; geen gemeenschappelijke variabele.', opl:'$6x + 9$\n$= 3 \\cdot 2x + 3 \\cdot 3$\n$= 3(2x + 3)$' },
  { q:'10x + 15',      ans:'5(2x + 3)',   vars:['x'], h:'Ggd van $10$ en $15$ is $5$; geen gemeenschappelijke variabele.', opl:'$10x + 15$\n$= 5 \\cdot 2x + 5 \\cdot 3$\n$= 5(2x + 3)$' },
  { q:'6a - 9',        ans:'3(2a - 3)',   vars:['a'], h:'Ggd van $6$ en $9$ is $3$; geen gemeenschappelijke variabele.', opl:'$6a - 9$\n$= 3 \\cdot 2a - 3 \\cdot 3$\n$= 3(2a - 3)$' },
];

function genAF1a() {
  const e = pick(AF1a_POOL);
  return _aQF('A.F1a', `Ontbind in factoren: $${e.q}$`, e.ans, e.vars,
    ['Zoek de grootste gemene deler (ggd) van de coëfficiënten en de laagste macht van de variabele.', e.h],
    e.opl);
}

/* ── A.F1b – ontbinden: som-product methode ──────────────────────── */
const AF1b_POOL = [
  { q:'x^{2} + 5x + 6',  ans:'(x+2)(x+3)', vars:['x'], p:2,q_:3,  h:'$2+3=5$ en $2\\cdot3=6$' },
  { q:'x^{2} + 7x + 12', ans:'(x+3)(x+4)', vars:['x'], p:3,q_:4,  h:'$3+4=7$ en $3\\cdot4=12$' },
  { q:'x^{2} + 8x + 15', ans:'(x+3)(x+5)', vars:['x'], p:3,q_:5,  h:'$3+5=8$ en $3\\cdot5=15$' },
  { q:'x^{2} + 6x + 8',  ans:'(x+2)(x+4)', vars:['x'], p:2,q_:4,  h:'$2+4=6$ en $2\\cdot4=8$' },
  { q:'x^{2} - 5x + 6',  ans:'(x-2)(x-3)', vars:['x'], p:-2,q_:-3,h:'$-2+(-3)=-5$ en $(-2)\\cdot(-3)=6$' },
  { q:'x^{2} - 7x + 12', ans:'(x-3)(x-4)', vars:['x'], p:-3,q_:-4,h:'$-3+(-4)=-7$ en $(-3)\\cdot(-4)=12$' },
  { q:'x^{2} + x - 6',   ans:'(x+3)(x-2)', vars:['x'], p:3,q_:-2, h:'$3+(-2)=1$ en $3\\cdot(-2)=-6$' },
  { q:'x^{2} + 2x - 8',  ans:'(x+4)(x-2)', vars:['x'], p:4,q_:-2, h:'$4+(-2)=2$ en $4\\cdot(-2)=-8$' },
  { q:'x^{2} - 2x - 8',  ans:'(x-4)(x+2)', vars:['x'], p:-4,q_:2, h:'$-4+2=-2$ en $(-4)\\cdot2=-8$' },
  { q:'x^{2} - x - 6',   ans:'(x-3)(x+2)', vars:['x'], p:-3,q_:2, h:'$-3+2=-1$ en $(-3)\\cdot2=-6$' },
  { q:'a^{2} + 7a + 10', ans:'(a+2)(a+5)', vars:['a'], p:2,q_:5,  h:'$2+5=7$ en $2\\cdot5=10$' },
  { q:'n^{2} - 6n + 8',  ans:'(n-2)(n-4)', vars:['n'], p:-2,q_:-4,h:'$-2+(-4)=-6$ en $(-2)\\cdot(-4)=8$' },
];

function genAF1b() {
  const e = pick(AF1b_POOL);
  const v = e.vars[0];
  const pStr = e.p >= 0 ? `+${e.p}` : `${e.p}`;
  const qStr = e.q_ >= 0 ? `+${e.q_}` : `${e.q_}`;
  return _aQF('A.F1b', `Ontbind in factoren: $${e.q}$`, e.ans, e.vars,
    [`Zoek $p$ en $q$ zodat $p+q=${e.p+e.q_}$ en $p\\cdot q=${e.p*e.q_}$.`, e.h],
    `$${e.q}$\n$p=${e.p},\\; q=${e.q_}$\n$= (${v}${pStr})(${v}${qStr})$`);
}

/* ── A.F1c – ontbinden: merkwaardige producten ───────────────────── */
const AF1c_POOL = [
  { q:'x^{2} + 6x + 9',  ans:'(x+3)^{2}',  vars:['x'], type:'kw+', a:'x',b:'3',
    opl:'$x^2+6x+9 = x^2 + 2\\cdot x\\cdot 3 + 3^2$\n$= (x+3)^{2}$' },
  { q:'x^{2} + 4x + 4',  ans:'(x+2)^{2}',  vars:['x'], type:'kw+', a:'x',b:'2',
    opl:'$x^2+4x+4 = x^2 + 2\\cdot x\\cdot 2 + 2^2$\n$= (x+2)^{2}$' },
  { q:'x^{2} + 10x + 25',ans:'(x+5)^{2}',  vars:['x'], type:'kw+', a:'x',b:'5',
    opl:'$x^2+10x+25 = x^2 + 2\\cdot x\\cdot 5 + 5^2$\n$= (x+5)^{2}$' },
  { q:'x^{2} - 6x + 9',  ans:'(x-3)^{2}',  vars:['x'], type:'kw-', a:'x',b:'3',
    opl:'$x^2-6x+9 = x^2 - 2\\cdot x\\cdot 3 + 3^2$\n$= (x-3)^{2}$' },
  { q:'x^{2} - 8x + 16', ans:'(x-4)^{2}',  vars:['x'], type:'kw-', a:'x',b:'4',
    opl:'$x^2-8x+16 = x^2 - 2\\cdot x\\cdot 4 + 4^2$\n$= (x-4)^{2}$' },
  { q:'x^{2} - 4x + 4',  ans:'(x-2)^{2}',  vars:['x'], type:'kw-', a:'x',b:'2',
    opl:'$x^2-4x+4 = x^2 - 2\\cdot x\\cdot 2 + 2^2$\n$= (x-2)^{2}$' },
  { q:'x^{2} - 9',       ans:'(x+3)(x-3)', vars:['x'], type:'vk',  a:'x',b:'3',
    opl:'$x^2-9 = x^2 - 3^2$\n$= (x+3)(x-3)$' },
  { q:'x^{2} - 4',       ans:'(x+2)(x-2)', vars:['x'], type:'vk',  a:'x',b:'2',
    opl:'$x^2-4 = x^2 - 2^2$\n$= (x+2)(x-2)$' },
  { q:'x^{2} - 25',      ans:'(x+5)(x-5)', vars:['x'], type:'vk',  a:'x',b:'5',
    opl:'$x^2-25 = x^2 - 5^2$\n$= (x+5)(x-5)$' },
  { q:'x^{2} - 16',      ans:'(x+4)(x-4)', vars:['x'], type:'vk',  a:'x',b:'4',
    opl:'$x^2-16 = x^2 - 4^2$\n$= (x+4)(x-4)$' },
  { q:'a^{2} + 8a + 16', ans:'(a+4)^{2}',  vars:['a'], type:'kw+', a:'a',b:'4',
    opl:'$a^2+8a+16 = a^2 + 2\\cdot a\\cdot 4 + 4^2$\n$= (a+4)^{2}$' },
  { q:'n^{2} - 1',       ans:'(n+1)(n-1)', vars:['n'], type:'vk',  a:'n',b:'1',
    opl:'$n^2-1 = n^2 - 1^2$\n$= (n+1)(n-1)$' },
];

function genAF1c() {
  const e = pick(AF1c_POOL);
  const tip = e.type === 'kw+' ? `Herken $(${e.a}+${e.b})^2 = ${e.a}^2 + 2\\cdot${e.a}\\cdot${e.b} + ${e.b}^2`
    : e.type === 'kw-' ? `Herken $(${e.a}-${e.b})^2 = ${e.a}^2 - 2\\cdot${e.a}\\cdot${e.b} + ${e.b}^2`
    : `Herken $(${e.a}+${e.b})(${e.a}-${e.b}) = ${e.a}^2 - ${e.b}^2`;
  const hint2 = e.type === 'vk'
    ? `$${tip}$`
    : `$${tip}$ — schrijf het antwoord als $(\\ldots)^2$`;
  return _aQM('A.F1c', `Ontbind in factoren: $${e.q}$`, e.ans, e.vars,
    ['Zoek een merkwaardig product.', hint2],
    e.opl);
}

/* ── A.MV1a – machtsverheffen: productregel (willekeurig) ────────── */
function genAMV1a() {
  const vLetters = ['x','y','a','b','n'];
  const v  = pick(vLetters);
  const tw = Math.random() > 0.5;
  const w  = tw ? pick(vLetters.filter(l => l !== v)) : null;

  const c1 = rand(2,7), p1 = rand(1,4);
  const c2 = rand(2,7), p2 = rand(1,4);
  const r1 = tw ? rand(1,3) : 0;
  const r2 = tw ? rand(1,3) : 0;

  function mon(c, vp, wp) {
    let s = c === 1 ? '' : String(c);
    s += vp === 1 ? v : `${v}^{${vp}}`;
    if (w && wp > 0) s += wp === 1 ? w : `${w}^{${wp}}`;
    return s;
  }

  const f1 = mon(c1, p1, r1), f2 = mon(c2, p2, r2);
  const ac = c1 * c2, ap = p1 + p2, ar = r1 + r2;
  const ans = mon(ac, ap, ar);
  const vars = tw ? [v, w] : [v];

  let h2 = `Coëfficiënten: $${c1} \\cdot ${c2} = ${ac}$; $${v}^{${p1}+${p2}} = ${v}^{${ap}}$`;
  if (tw) h2 += `; $${w}^{${r1}+${r2}} = ${w}^{${ar}}$`;
  h2 += '.';

  let opl = `$${f1} \\cdot ${f2}$\n$= (${c1} \\cdot ${c2}) \\cdot ${v}^{${p1}+${p2}}`;
  if (tw) opl += ` \\cdot ${w}^{${r1}+${r2}}`;
  opl += `$\n$= ${ans}$`;

  return _aQ('A.MV1a', `Vereenvoudig: $${f1} \\cdot ${f2}$`, ans, vars,
    ['Gebruik de productregel: $a^p \\cdot a^q = a^{p+q}$. Vermenigvuldig de coëfficiënten apart.', h2],
    opl);
}

/* ── A.MV1b – machtsverheffen: machtsverheffing van een macht (willekeurig) */
function genAMV1b() {
  const vLetters = ['x','y','a','b','n'];
  const v  = pick(vLetters);
  const tw = Math.random() > 0.5;
  const w  = tw ? pick(vLetters.filter(l => l !== v)) : null;

  const c = rand(2,4);             // binnenste coëfficiënt
  const p = rand(1,3);             // macht van v binnen haakjes
  const r = tw ? rand(1,3) : 0;   // macht van w binnen haakjes
  const q = rand(2,3);             // buitenste macht

  function inner() {
    let s = c === 1 ? '' : String(c);
    s += p === 1 ? v : `${v}^{${p}}`;
    if (w && r > 0) s += r === 1 ? w : `${w}^{${r}}`;
    return s;
  }

  const inn = inner();
  const ac  = Math.pow(c, q);
  const ap  = p * q;
  const ar  = r * q;

  function outer() {
    let s = String(ac);
    s += ap === 1 ? v : `${v}^{${ap}}`;
    if (w && ar > 0) s += ar === 1 ? w : `${w}^{${ar}}`;
    return s;
  }

  const ans  = outer();
  const vars = tw ? [v, w] : [v];

  let h2 = `$${c}^{${q}} = ${ac}$; $(${v}^{${p}})^{${q}} = ${v}^{${ap}}$`;
  if (tw) h2 += `; $(${w}^{${r}})^{${q}} = ${w}^{${ar}}$`;
  h2 += '.';

  let opl = `$(${inn})^{${q}}$\n$= ${c}^{${q}} \\cdot (${v}^{${p}})^{${q}}`;
  if (tw) opl += ` \\cdot (${w}^{${r}})^{${q}}`;
  opl += `$\n$= ${ans}$`;

  return _aQ('A.MV1b', `Vereenvoudig: $(${inn})^{${q}}$`, ans, vars,
    ['Gebruik de machtsregels: $(a^p)^q = a^{p \\cdot q}$ en $(ab)^p = a^p \\cdot b^p$.', h2],
    opl);
}

/* ── A.MV1c – machtsverheffen: quotiëntregel (willekeurig) ──────── */
function genAMV1c() {
  const vLetters = ['x','y','a','b','n'];
  const v = pick(vLetters);

  if (Math.random() > 0.4) {
    // Basis: dfrac{c1 v^p}{c2 v^q}, c1/c2 integer, p > q
    const c2 = rand(2,4), k = rand(2,5);
    const c1 = k * c2;
    const q  = rand(1,3), dp = rand(1,3);
    const p  = q + dp;

    const numV = p  === 1 ? v : `${v}^{${p}}`;
    const denV = q  === 1 ? v : `${v}^{${q}}`;
    const qStr = `\\dfrac{${c1}${numV}}{${c2}${denV}}`;
    const ans  = _alM(k, v, dp);

    const h2  = `Coëfficiënten: $${c1}/${c2} = ${k}$; $${v}^{${p}-${q}} = ${v}^{${dp}}$.`;
    const opl = `$${qStr}$\n$= \\dfrac{${c1}}{${c2}} \\cdot ${v}^{${p}-${q}}$\n$= ${ans}$`;

    return _aQ('A.MV1c', `Vereenvoudig: $${qStr}$`, ans, [v],
      ['Gebruik de deelregel: $\\dfrac{a^p}{a^q} = a^{p-q}$. Deel ook de coëfficiënten.', h2],
      opl);

  } else {
    // Gecombineerd: dfrac{(c v^p)^q}{v^r}, p*q > r
    const c = rand(2,3), p = rand(1,3), q = rand(2,3);
    const pq = p * q;
    const r  = rand(1, pq - 1);

    const ac  = Math.pow(c, q);
    const ap  = pq - r;
    const inn = _alM(c, v, p);
    const den = r === 1 ? v : `${v}^{${r}}`;
    const exp = _alM(ac, v, pq);
    const ans = _alM(ac, v, ap);
    const apS = ap === 1 ? v : `${v}^{${ap}}`;

    const h2  = `$(${inn})^{${q}} = ${exp}$; $${v}^{${pq}-${r}} = ${apS}$.`;
    const opl = `$\\dfrac{(${inn})^{${q}}}{${den}}$\n$= \\dfrac{${exp}}{${den}}$\n$= ${ans}$`;

    return _aQ('A.MV1c', `Vereenvoudig: $\\dfrac{(${inn})^{${q}}}{${den}}$`, ans, [v],
      ['Werk eerst de macht tussen de haakjes uit, gebruik dan de deelregel.', h2],
      opl);
  }
}

/* ── A.MV1d – machtsverheffen: gecombineerde sommen ─────────────── */
const AMV1d_POOL = [
  { q:'3a^{2} \\cdot 2a + 4a^{3}',                   ans:'10a^{3}', vars:['a'],
    h:'Productregel: $3a^{2} \\cdot 2a = 6a^{3}$; optellen: $6a^{3} + 4a^{3} = 10a^{3}$.',
    opl:'$3a^{2} \\cdot 2a + 4a^{3}$\n$= 6a^{3} + 4a^{3}$\n$= 10a^{3}$' },
  { q:'(2x)^{2} - 3x^{2}',                           ans:'x^{2}',   vars:['x'],
    h:'$(2x)^{2} = 4x^{2}$; aftrekken: $4x^{2} - 3x^{2} = x^{2}$.',
    opl:'$(2x)^{2} - 3x^{2}$\n$= 4x^{2} - 3x^{2}$\n$= x^{2}$' },
  { q:'5(x^{2})^{3} - 2x^{6}',                       ans:'3x^{6}',  vars:['x'],
    h:'$(x^{2})^{3} = x^{6}$; aftrekken: $5x^{6} - 2x^{6} = 3x^{6}$.',
    opl:'$5(x^{2})^{3} - 2x^{6}$\n$= 5x^{6} - 2x^{6}$\n$= 3x^{6}$' },
  { q:'(3a)^{2} + 2a \\cdot a',                       ans:'11a^{2}', vars:['a'],
    h:'$(3a)^{2} = 9a^{2}$ en $2a \\cdot a = 2a^{2}$; optellen: $9a^{2} + 2a^{2} = 11a^{2}$.',
    opl:'$(3a)^{2} + 2a \\cdot a$\n$= 9a^{2} + 2a^{2}$\n$= 11a^{2}$' },
  { q:'4x^{3} \\cdot 2x - 3x^{4}',                   ans:'5x^{4}',  vars:['x'],
    h:'Productregel: $4x^{3} \\cdot 2x = 8x^{4}$; aftrekken: $8x^{4} - 3x^{4} = 5x^{4}$.',
    opl:'$4x^{3} \\cdot 2x - 3x^{4}$\n$= 8x^{4} - 3x^{4}$\n$= 5x^{4}$' },
  { q:'\\dfrac{x^{8}}{x^{2}} + 3x^{6}',               ans:'4x^{6}',  vars:['x'],
    h:'Deelregel: $x^{8}/x^{2} = x^{6}$; optellen: $x^{6} + 3x^{6} = 4x^{6}$.',
    opl:'$\\dfrac{x^{8}}{x^{2}} + 3x^{6}$\n$= x^{6} + 3x^{6}$\n$= 4x^{6}$' },
  { q:'3a^{2} \\cdot 4a^{3} - 2a^{5}',               ans:'10a^{5}', vars:['a'],
    h:'Productregel: $3a^{2} \\cdot 4a^{3} = 12a^{5}$; aftrekken: $12a^{5} - 2a^{5} = 10a^{5}$.',
    opl:'$3a^{2} \\cdot 4a^{3} - 2a^{5}$\n$= 12a^{5} - 2a^{5}$\n$= 10a^{5}$' },
  { q:'\\dfrac{(2x^{2})^{3}}{x^{2}} - 5x^{4}',        ans:'3x^{4}',  vars:['x'],
    h:'$(2x^{2})^{3} = 8x^{6}$; deelregel: $8x^{6}/x^{2} = 8x^{4}$; aftrekken: $8x^{4} - 5x^{4} = 3x^{4}$.',
    opl:'$\\dfrac{(2x^{2})^{3}}{x^{2}} - 5x^{4}$\n$= \\dfrac{8x^{6}}{x^{2}} - 5x^{4}$\n$= 8x^{4} - 5x^{4}$\n$= 3x^{4}$' },
  { q:'(2a)^{3} + 3a \\cdot a^{2}',                   ans:'11a^{3}', vars:['a'],
    h:'$(2a)^{3} = 8a^{3}$ en $3a \\cdot a^{2} = 3a^{3}$; optellen: $8a^{3} + 3a^{3} = 11a^{3}$.',
    opl:'$(2a)^{3} + 3a \\cdot a^{2}$\n$= 8a^{3} + 3a^{3}$\n$= 11a^{3}$' },
  { q:'5x^{2} \\cdot x^{3} - \\dfrac{x^{7}}{x^{2}}', ans:'4x^{5}',  vars:['x'],
    h:'Productregel: $5x^{2} \\cdot x^{3} = 5x^{5}$; deelregel: $x^{7}/x^{2} = x^{5}$; aftrekken: $5x^{5} - x^{5} = 4x^{5}$.',
    opl:'$5x^{2} \\cdot x^{3} - \\dfrac{x^{7}}{x^{2}}$\n$= 5x^{5} - x^{5}$\n$= 4x^{5}$' },
];

function genAMV1d() {
  const e = pick(AMV1d_POOL);
  return _aQ('A.MV1d', `Vereenvoudig: $${e.q}$`, e.ans, e.vars,
    ['Pas eerst de machtsregels toe, combineer daarna de gelijksoortige termen.', e.h],
    e.opl);
}

/* ── L.G1a/b – helpers voor lineaire grafieken ───────────────────── */
function _lgFormule(m, b, mDisplay) {
  const mS = mDisplay || (m === 1 ? '' : m === -1 ? '-' : String(m));
  const bS = b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
  return `y = ${mS}x${bS}`;
}

function _lgStap(m, b, x, mDisplay) {
  if (x === 0) return `y = ${b}`;
  const mS = mDisplay ? `${mDisplay} \\cdot ` : m === 1 ? '' : m === -1 ? '-' : `${m} \\cdot `;
  const xS = x < 0 ? `(${x})` : String(x);
  const bS = b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
  return `y = ${mS}${xS}${bS} = ${Math.round((m * x + b) * 1e9) / 1e9}`;
}

function _lgOplPunten(m, b, p1, p2, formule, mDisplay, stapGrootte) {
  const stapNote = stapGrootte && stapGrootte > 1
    ? `\nLet op: de assen hebben stapgrootte ${stapGrootte}.` : '';
  return `Kies twee x-waarden en bereken $y$ via $${formule}$:
$x = ${p1.x}$: $${_lgStap(m, b, p1.x, mDisplay)}$ → punt $A(${p1.x},\\ ${p1.y})$
$x = ${p2.x}$: $${_lgStap(m, b, p2.x, mDisplay)}$ → punt $B(${p2.x},\\ ${p2.y})$${stapNote}
Sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`;
}

/* ── L.G1a – lineaire grafiek: eenvoudig ─────────────────────────── */
function genLG1a() {
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = rand(-6, 6);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(m, b, null);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);
  const h2 = `Bij $x = ${p1.x}$: $${_lgStap(m, b, p1.x, null)}$, dus punt $(${p1.x},\\ ${p1.y})$.`;

  return {
    id: uid(), leerdoel: 'L.G1a',
    vraag: `Teken de grafiek van $${formule}$.`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: -5, y: yMin + 2}, initB: {x: 4, y: yMin + 2} },
    hints: [
      'Vul twee x-waarden in de formule in om twee punten te berekenen. Sleep de punten daarna naar die plekken.',
      h2,
    ],
    oplossing: _lgOplPunten(m, b, p1, p2, formule, null, null),
  };
}

/* ── L.G1b helpers ────────────────────────────────────────────────── */
function _lgbFractional() {
  const fracs = [
    {mVal: 0.5,         mDisplay: '\\dfrac{1}{2}',  d: 2},
    {mVal: -0.5,        mDisplay: '-\\dfrac{1}{2}', d: 2},
    {mVal: 2 / 3,       mDisplay: '\\dfrac{2}{3}',  d: 3},
    {mVal: -(2 / 3),    mDisplay: '-\\dfrac{2}{3}', d: 3},
    {mVal: 1.5,         mDisplay: '\\dfrac{3}{2}',  d: 2},
    {mVal: -1.5,        mDisplay: '-\\dfrac{3}{2}', d: 2},
  ];
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let fr, b, vis;
  do {
    fr = pick(fracs);
    b = rand(-4, 4);
    vis = [];
    for (let k = Math.ceil(xMin / fr.d); k <= Math.floor(xMax / fr.d); k++) {
      const x = k * fr.d;
      const y = fr.mVal * x + b;
      if (Math.abs(y - Math.round(y)) < 1e-9 && Math.round(y) >= yMin && Math.round(y) <= yMax)
        vis.push({x, y: Math.round(y)});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(fr.mVal, b, fr.mDisplay);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);
  const h2 = `Bij $x = ${p1.x}$: $${_lgStap(fr.mVal, b, p1.x, fr.mDisplay)}$, dus punt $(${p1.x},\\ ${p1.y})$.`;

  return {
    id: uid(), leerdoel: 'L.G1b',
    vraag: `Teken de grafiek van $${formule}$.`,
    antwoordType: 'grafiek',
    antwoord: { m: fr.mVal, b },
    data: { m: fr.mVal, b, mDisplay: fr.mDisplay, xMin, xMax, yMin, yMax, stap,
            initA: {x: -4, y: yMin + 2}, initB: {x: 4, y: yMin + 2} },
    hints: [
      `Kies x-waarden die een veelvoud zijn van ${fr.d}, zodat $y$ een geheel getal wordt.`,
      h2,
    ],
    oplossing: _lgOplPunten(fr.mVal, b, p1, p2, formule, fr.mDisplay, null),
  };
}

function _lgbBigStep() {
  const stap = 2, xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  let m, b, vis;
  do {
    m = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    b = rand(-4, 4) * stap;
    vis = [];
    for (let x = xMin; x <= xMax; x += stap) {
      const y = m * x + b;
      if (y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(m, b, null);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);
  const h2 = `Bij $x = ${p1.x}$: $${_lgStap(m, b, p1.x, null)}$, dus punt $(${p1.x},\\ ${p1.y})$.`;

  return {
    id: uid(), leerdoel: 'L.G1b',
    vraag: `Teken de grafiek van $${formule}$.`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: xMin + stap * 2, y: yMin + stap * 2},
            initB: {x: xMax - stap * 2, y: yMin + stap * 2} },
    hints: [
      `Let op: elke stap op de assen staat voor ${stap} eenheden.`,
      h2,
    ],
    oplossing: _lgOplPunten(m, b, p1, p2, formule, null, stap),
  };
}

function _lgbOffScreen() {
  const stap = 1, xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = Math.random() > 0.5 ? rand(yMax + 1, yMax + 5) : rand(yMin - 5, yMin - 1);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 2);

  const formule = _lgFormule(m, b, null);
  const p1 = vis[0];
  const p2 = vis.length > 1 ? vis[1] : vis[0];
  const bStr = b > 0 ? `+${b}` : String(b);
  const h2 = `Bij $x = ${p1.x}$: $${_lgStap(m, b, p1.x, null)}$, dus punt $(${p1.x},\\ ${p1.y})$ ligt wél in beeld.`;

  return {
    id: uid(), leerdoel: 'L.G1b',
    vraag: `Teken de grafiek van $${formule}$.`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: -4, y: yMin + 1}, initB: {x: 4, y: yMin + 1} },
    hints: [
      `Het snijpunt met de y-as ($y = ${bStr}$) ligt buiten beeld. Bereken twee punten met $y \\in [${yMin},\\ ${yMax}]$.`,
      h2,
    ],
    oplossing: _lgOplPunten(m, b, p1, p2, formule, null, null),
  };
}

function genLG1b() {
  const v = pick(['fractional', 'bigStep', 'offScreen']);
  if (v === 'fractional') return _lgbFractional();
  if (v === 'bigStep')    return _lgbBigStep();
  return _lgbOffScreen();
}

/* ── L.F1/F2 – formule opstellen helpers ─────────────────────────────── */
function _lfOpl(m, b, p1, p2, mDisplay) {
  const formule = _lgFormule(m, b, mDisplay);
  const dy = p2.y - p1.y, dx = p2.x - p1.x;
  const mStr = mDisplay || String(m);
  return `Kies twee punten op de lijn: $(${p1.x},\\ ${p1.y})$ en $(${p2.x},\\ ${p2.y})$.
$m = \\dfrac{${p2.y} - (${p1.y})}{${p2.x} - (${p1.x})} = \\dfrac{${dy}}{${dx}} = ${mStr}$
$b = ${p1.y} - ${mStr} \\cdot ${p1.x} = ${b}$
De formule is $${formule}$.`;
}

function _lfOplTabel(m, b, p1, p2, mDisplay) {
  const formule = _lgFormule(m, b, mDisplay);
  const dy = p2.y - p1.y, dx = p2.x - p1.x;
  const mStr = mDisplay || String(m);
  return `Bereken $m$ uit de tabel:
$m = \\dfrac{${p2.y} - (${p1.y})}{${p2.x} - (${p1.x})} = \\dfrac{${dy}}{${dx}} = ${mStr}$
Vul in met $(${p1.x},\\ ${p1.y})$: $\\ ${p1.y} = ${mStr} \\cdot ${p1.x} + b \\Rightarrow b = ${b}$
De formule is $${formule}$.`;
}

/* ── L.F1a – formule bij grafiek: eenvoudig ─────────────────────────── */
function genLF1a() {
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = rand(-6, 6);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(m, b, null);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);
  const mSign = m > 0 ? 'omhoog' : 'omlaag';

  return {
    id: uid(), leerdoel: 'L.F1a',
    vraag: 'Welke formule hoort bij de grafiek?',
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            toon: 'grafiek', initA: {x: 0, y: b}, initB: {x: 1, y: m + b} },
    hints: [
      `Kijk waar de lijn de $y$-as kruist: dat is $b$. Ga daarna 1 stap naar rechts — gaat $y$ dan ${mSign}? Dat geeft $m$.`,
      `Kijk op de lijn bij $x = ${p1.x}$ en $x = ${p2.x}$. Lees de $y$-waarden af en bereken zelf $m = \\dfrac{\\Delta y}{\\Delta x}$, daarna $b$.`,
    ],
    oplossing: _lfOpl(m, b, p1, p2, null),
  };
}

/* ── L.F1b helpers ────────────────────────────────────────────────────── */
function _lfb1Fractional() {
  const fracs = [
    {mVal: 0.5,         mDisplay: '\\dfrac{1}{2}',  d: 2},
    {mVal: -0.5,        mDisplay: '-\\dfrac{1}{2}', d: 2},
    {mVal: 2 / 3,       mDisplay: '\\dfrac{2}{3}',  d: 3},
    {mVal: -(2 / 3),    mDisplay: '-\\dfrac{2}{3}', d: 3},
    {mVal: 1.5,         mDisplay: '\\dfrac{3}{2}',  d: 2},
    {mVal: -1.5,        mDisplay: '-\\dfrac{3}{2}', d: 2},
  ];
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let fr, b, vis;
  do {
    fr = pick(fracs);
    b = rand(-4, 4);
    vis = [];
    for (let k = Math.ceil(xMin / fr.d); k <= Math.floor(xMax / fr.d); k++) {
      const x = k * fr.d;
      const y = fr.mVal * x + b;
      if (Math.abs(y - Math.round(y)) < 1e-9 && Math.round(y) >= yMin && Math.round(y) <= yMax)
        vis.push({x, y: Math.round(y)});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(fr.mVal, b, fr.mDisplay);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);

  return {
    id: uid(), leerdoel: 'L.F1b',
    vraag: 'Welke formule hoort bij de grafiek?',
    antwoordType: 'formule-lijn',
    antwoord: { m: fr.mVal, b },
    data: { m: fr.mVal, b, mDisplay: fr.mDisplay, xMin, xMax, yMin, yMax, stap,
            toon: 'grafiek', initA: {x: 0, y: b}, initB: {x: fr.d, y: Math.round(fr.mVal * fr.d + b)} },
    hints: [
      `Kies twee punten die een veelvoud van ${fr.d} uit elkaar liggen op de $x$-as, zodat $y$ een geheel getal is.`,
      `Kijk op de lijn bij $x = ${p1.x}$ en $x = ${p2.x}$. Lees de $y$-waarden af en bereken $m = \\dfrac{\\Delta y}{\\Delta x}$, daarna $b$.`,
    ],
    oplossing: _lfOpl(fr.mVal, b, p1, p2, fr.mDisplay),
  };
}

function _lfb1BigStep() {
  const stap = 2, xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  let m, b, vis;
  do {
    m = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    b = rand(-4, 4) * stap;
    vis = [];
    for (let x = xMin; x <= xMax; x += stap) {
      const y = m * x + b;
      if (y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const formule = _lgFormule(m, b, null);
  const p1 = vis.find(p => p.x === 0) || vis[0];
  const p2 = vis.find(p => p.x !== p1.x && p.x > p1.x) || vis.find(p => p.x !== p1.x);

  return {
    id: uid(), leerdoel: 'L.F1b',
    vraag: 'Welke formule hoort bij de grafiek?',
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            toon: 'grafiek', initA: {x: 0, y: b}, initB: {x: stap, y: m * stap + b} },
    hints: [
      `Let op: de assen tellen per ${stap}. Lees de coördinaten af in eenheden.`,
      `Kijk op de lijn bij $x = ${p1.x}$ en $x = ${p2.x}$. Let op de schaalverdeling en bereken zelf $m$ en $b$.`,
    ],
    oplossing: _lfOpl(m, b, p1, p2, null) + `\nLet op: de assen tellen per ${stap}.`,
  };
}

function _lfb1OffScreen() {
  const stap = 1, xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = Math.random() > 0.5 ? rand(yMax + 1, yMax + 5) : rand(yMin - 5, yMin - 1);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 2);

  const formule = _lgFormule(m, b, null);
  const p1 = vis[0], p2 = vis[vis.length - 1];

  return {
    id: uid(), leerdoel: 'L.F1b',
    vraag: 'Welke formule hoort bij de grafiek?',
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            toon: 'grafiek', initA: {x: p1.x, y: p1.y}, initB: {x: p2.x, y: p2.y} },
    hints: [
      'Het snijpunt met de y-as ligt buiten beeld. Kies twee zichtbare roosterpunten op de lijn en bereken $m$ en daarna $b$.',
      `Kijk op de lijn bij $x = ${p1.x}$ en $x = ${p2.x}$. Lees de $y$-waarden af en bereken $m = \\dfrac{\\Delta y}{\\Delta x}$, daarna $b = y - m \\cdot x$.`,
    ],
    oplossing: _lfOpl(m, b, p1, p2, null),
  };
}

function genLF1b() {
  const v = pick(['fractional', 'bigStep', 'offScreen']);
  if (v === 'fractional') return _lfb1Fractional();
  if (v === 'bigStep')    return _lfb1BigStep();
  return _lfb1OffScreen();
}

/* ── L.F1c – formule bij grafiek: variabele assen ───────────────────── */
function genLF1c() {
  const { stapX, stapY, xMin, xMax, yMin, yMax, m, b, vis } = _lgcParams();
  const formule = _lgFormule(m, b, null);
  const rows = _lgPickRows(vis, 3);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const stapNote = _lgcStapNote(stapX, stapY);

  return {
    id: uid(), leerdoel: 'L.F1c',
    vraag: 'Welke formule hoort bij de grafiek?',
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stapX, stapY,
            toon: 'grafiek', initA: {x: p1.x, y: p1.y}, initB: {x: p2.x, y: p2.y} },
    hints: [
      stapNote + ' Lees twee punten af in coördinaten (niet in vakjes!) en bereken $m = \\dfrac{\\Delta y}{\\Delta x}$.',
      `Kijk op de lijn bij $x = ${p1.x}$ en $x = ${p2.x}$. Lees de $y$-waarden af in eenheden en bereken $m$ en $b$.`,
    ],
    oplossing: _lfOpl(m, b, p1, p2, null) + `\n${stapNote}`,
  };
}

/* ── L.F2a – formule bij tabel: eenvoudig ───────────────────────────── */
function genLF2a() {
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = rand(-6, 6);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const formule = _lgFormule(m, b, null);

  return {
    id: uid(), leerdoel: 'L.F2a',
    vraag: `Welke formule hoort bij de tabel?${_lgTabelHtml(rows)}`,
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null },
    hints: [
      'Bereken $m$: hoeveel verandert $y$ als $x$ met 1 toeneemt? Zoek daarna $b$ bij $x = 0$.',
      `Gebruik de rijen met $x = ${p1.x}$ en $x = ${p2.x}$ uit de tabel. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ en daarna $b$.`,
    ],
    oplossing: _lfOplTabel(m, b, p1, p2, null),
  };
}

/* ── L.F2b helpers ────────────────────────────────────────────────────── */
function _lfb2Fractional() {
  const fracs = [
    {mVal: 0.5,         mDisplay: '\\dfrac{1}{2}',  d: 2},
    {mVal: -0.5,        mDisplay: '-\\dfrac{1}{2}', d: 2},
    {mVal: 2 / 3,       mDisplay: '\\dfrac{2}{3}',  d: 3},
    {mVal: -(2 / 3),    mDisplay: '-\\dfrac{2}{3}', d: 3},
    {mVal: 1.5,         mDisplay: '\\dfrac{3}{2}',  d: 2},
    {mVal: -1.5,        mDisplay: '-\\dfrac{3}{2}', d: 2},
  ];
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  let fr, b, vis;
  do {
    fr = pick(fracs);
    b = rand(-4, 4);
    vis = [];
    for (let k = Math.ceil(xMin / fr.d); k <= Math.floor(xMax / fr.d); k++) {
      const x = k * fr.d;
      const y = fr.mVal * x + b;
      if (Math.abs(y - Math.round(y)) < 1e-9 && Math.round(y) >= yMin && Math.round(y) <= yMax)
        vis.push({x, y: Math.round(y)});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];

  return {
    id: uid(), leerdoel: 'L.F2b',
    vraag: `Welke formule hoort bij de tabel?${_lgTabelHtml(rows)}`,
    antwoordType: 'formule-lijn',
    antwoord: { m: fr.mVal, b },
    data: { m: fr.mVal, b, mDisplay: fr.mDisplay },
    hints: [
      `De $x$-waarden in de tabel zijn veelvouden van ${fr.d}. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ precies.`,
      `Gebruik de rijen met $x = ${p1.x}$ en $x = ${p2.x}$. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ precies en daarna $b$. Typ een breuk via de breukknop.`,
    ],
    oplossing: _lfOplTabel(fr.mVal, b, p1, p2, fr.mDisplay),
  };
}

function _lfb2BigStep() {
  const stap = 2, xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  let m, b, vis;
  do {
    m = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    b = rand(-4, 4) * stap;
    vis = [];
    for (let x = xMin; x <= xMax; x += stap) {
      const y = m * x + b;
      if (y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];

  return {
    id: uid(), leerdoel: 'L.F2b',
    vraag: `Welke formule hoort bij de tabel?${_lgTabelHtml(rows)}`,
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null },
    hints: [
      `Let op: de $x$-waarden lopen met stap ${stap}. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ met de werkelijke waarden.`,
      `Gebruik de rijen met $x = ${p1.x}$ en $x = ${p2.x}$. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ en daarna $b$.`,
    ],
    oplossing: _lfOplTabel(m, b, p1, p2, null),
  };
}

function _lfb2OffScreen() {
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = Math.random() > 0.5 ? rand(yMax + 1, yMax + 5) : rand(yMin - 5, yMin - 1);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 2);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const bStr = b > 0 ? `+${b}` : String(b);

  return {
    id: uid(), leerdoel: 'L.F2b',
    vraag: `Welke formule hoort bij de tabel?${_lgTabelHtml(rows)}`,
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null },
    hints: [
      'Het snijpunt met de $y$-as staat niet in de tabel. Bereken $m$ uit twee rijen en daarna $b = y - m \\cdot x$.',
      `Gebruik de rijen met $x = ${p1.x}$ en $x = ${p2.x}$. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ en daarna $b = y - m \\cdot x$.`,
    ],
    oplossing: _lfOplTabel(m, b, p1, p2, null),
  };
}

function genLF2b() {
  const v = pick(['fractional', 'bigStep', 'offScreen']);
  if (v === 'fractional') return _lfb2Fractional();
  if (v === 'bigStep')    return _lfb2BigStep();
  return _lfb2OffScreen();
}

/* ── L.F2c – formule bij tabel: variabele assen ─────────────────────── */
function genLF2c() {
  const { stapX, stapY, m, b, vis } = _lgcParams();
  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const stapNote = _lgcStapNote(stapX, stapY);

  return {
    id: uid(), leerdoel: 'L.F2c',
    vraag: `Welke formule hoort bij de tabel?${_lgTabelHtml(rows)}`,
    antwoordType: 'formule-lijn',
    antwoord: { m, b },
    data: { m, b, mDisplay: null },
    hints: [
      stapNote + ' Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ met de echte waarden uit de tabel.',
      `Gebruik de rijen met $x = ${p1.x}$ en $x = ${p2.x}$. Bereken $m = \\dfrac{\\Delta y}{\\Delta x}$ en daarna $b$.`,
    ],
    oplossing: _lfOplTabel(m, b, p1, p2, null) + `\n${stapNote}`,
  };
}

/* ── L.G2a/b – grafiek bij tabel ─────────────────────────────────────── */
function _lgTabelHtml(rows) {
  const xCells = rows.map(({x}) => `<td>${x}</td>`).join('');
  const yCells = rows.map(({y}) => `<td>${y}</td>`).join('');
  return `<table class="lg-tabel"><tbody><tr><th>x</th>${xCells}</tr><tr><th>y</th>${yCells}</tr></tbody></table>`;
}

function _lgPickRows(vis, n) {
  if (vis.length <= n) return vis;
  const step = (vis.length - 1) / (n - 1);
  return Array.from({length: n}, (_, i) => vis[Math.round(i * step)]);
}

function _lgOplTabel(p1, p2, stapGrootte) {
  const stapNote = stapGrootte && stapGrootte > 1
    ? `\nLet op: de assen hebben stapgrootte ${stapGrootte}.` : '';
  return `In de tabel staan de coördinaten van punten op de lijn.
Sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.${stapNote}`;
}

/* ── L.G2a – grafiek bij tabel: eenvoudig ──────────────────────────── */
function genLG2a() {
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = rand(-6, 6);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0];
  const p2 = rows[rows.length - 1];

  return {
    id: uid(), leerdoel: 'L.G2a',
    vraag: `Teken de grafiek bij de tabel.${_lgTabelHtml(rows)}`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: -5, y: yMin + 2}, initB: {x: 4, y: yMin + 2} },
    hints: [
      'De tabel geeft meerdere punten op de lijn. Kies er twee en sleep punt A en punt B naar die coördinaten.',
      `Bijvoorbeeld: sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`,
    ],
    oplossing: _lgOplTabel(p1, p2, null),
  };
}

/* ── L.G2b helpers ─────────────────────────────────────────────────── */
function _lgb2Fractional() {
  const fracs = [
    {mVal: 0.5,         mDisplay: '\\dfrac{1}{2}',  d: 2},
    {mVal: -0.5,        mDisplay: '-\\dfrac{1}{2}', d: 2},
    {mVal: 2 / 3,       mDisplay: '\\dfrac{2}{3}',  d: 3},
    {mVal: -(2 / 3),    mDisplay: '-\\dfrac{2}{3}', d: 3},
    {mVal: 1.5,         mDisplay: '\\dfrac{3}{2}',  d: 2},
    {mVal: -1.5,        mDisplay: '-\\dfrac{3}{2}', d: 2},
  ];
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8, stap = 1;
  let fr, b, vis;
  do {
    fr = pick(fracs);
    b = rand(-4, 4);
    vis = [];
    for (let k = Math.ceil(xMin / fr.d); k <= Math.floor(xMax / fr.d); k++) {
      const x = k * fr.d;
      const y = fr.mVal * x + b;
      if (Math.abs(y - Math.round(y)) < 1e-9 && Math.round(y) >= yMin && Math.round(y) <= yMax)
        vis.push({x, y: Math.round(y)});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0];
  const p2 = rows[rows.length - 1];

  return {
    id: uid(), leerdoel: 'L.G2b',
    vraag: `Teken de grafiek bij de tabel.${_lgTabelHtml(rows)}`,
    antwoordType: 'grafiek',
    antwoord: { m: fr.mVal, b },
    data: { m: fr.mVal, b, mDisplay: fr.mDisplay, xMin, xMax, yMin, yMax, stap,
            initA: {x: -4, y: yMin + 2}, initB: {x: 4, y: yMin + 2} },
    hints: [
      `De tabel laat punten zien met een veelvoud van ${fr.d} voor $x$. Sleep punt A en punt B naar twee van die punten.`,
      `Bijvoorbeeld: sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`,
    ],
    oplossing: _lgOplTabel(p1, p2, null),
  };
}

function _lgb2BigStep() {
  const stap = 2, xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  let m, b, vis;
  do {
    m = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    b = rand(-4, 4) * stap;
    vis = [];
    for (let x = xMin; x <= xMax; x += stap) {
      const y = m * x + b;
      if (y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0];
  const p2 = rows[rows.length - 1];

  return {
    id: uid(), leerdoel: 'L.G2b',
    vraag: `Teken de grafiek bij de tabel.${_lgTabelHtml(rows)}`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: xMin + stap * 2, y: yMin + stap * 2},
            initB: {x: xMax - stap * 2, y: yMin + stap * 2} },
    hints: [
      `Let op: de assen tellen per ${stap}. Sleep punt A en punt B naar twee punten uit de tabel.`,
      `Bijvoorbeeld: sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`,
    ],
    oplossing: _lgOplTabel(p1, p2, stap),
  };
}

function _lgb2OffScreen() {
  const stap = 1, xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  let m, b, vis;
  do {
    m = pick([-3, -2, -1, 1, 2, 3]);
    b = Math.random() > 0.5 ? rand(yMax + 1, yMax + 5) : rand(yMin - 5, yMin - 1);
    vis = [];
    for (let x = xMin; x <= xMax; x++) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= yMin && y <= yMax) vis.push({x, y});
    }
  } while (vis.length < 2);

  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0];
  const p2 = rows[rows.length - 1];
  const bStr = b > 0 ? `+${b}` : String(b);

  return {
    id: uid(), leerdoel: 'L.G2b',
    vraag: `Teken de grafiek bij de tabel.${_lgTabelHtml(rows)}`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stap,
            initA: {x: -4, y: yMin + 1}, initB: {x: 4, y: yMin + 1} },
    hints: [
      `De tabel laat de punten zien die in beeld zijn. Het snijpunt met de y-as ($y = ${bStr}$) ligt buiten het rooster.`,
      `Gebruik twee punten uit de tabel: sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`,
    ],
    oplossing: _lgOplTabel(p1, p2, null),
  };
}

function genLG2b() {
  const v = pick(['fractional', 'bigStep', 'offScreen']);
  if (v === 'fractional') return _lgb2Fractional();
  if (v === 'bigStep')    return _lgb2BigStep();
  return _lgb2OffScreen();
}

/* ── L.G1c/G2c – assen met verschillende stapgroottes ───────────────── */
function _lgcParams() {
  const configs = [
    { stapX:  5, stapY: 10, xMin: -20, xMax: 20, yMin: -40, yMax: 40, mPool: [-4, -2, 2, 4] },
    { stapX: 10, stapY: 20, xMin: -30, xMax: 30, yMin: -60, yMax: 60, mPool: [-4, -2, 2, 4] },
    { stapX: 20, stapY: 10, xMin: -60, xMax: 60, yMin: -40, yMax: 40, mPool: [-2, -1, 1, 2] },
  ];
  let cfg, m, b, vis;
  do {
    cfg = pick(configs);
    m   = pick(cfg.mPool);
    b   = pick([-3, -2, -1, 0, 1, 2, 3]) * cfg.stapY;
    vis = [];
    for (let x = cfg.xMin; x <= cfg.xMax; x += cfg.stapX) {
      const y = m * x + b;
      if (Number.isInteger(y) && y >= cfg.yMin && y <= cfg.yMax) vis.push({x, y});
    }
  } while (vis.length < 3);

  const { stapX, stapY, xMin, xMax, yMin, yMax } = cfg;
  const initA = { x: -2 * stapX, y: yMin + stapY };
  const initB = { x:  2 * stapX, y: yMin + stapY };
  return { stapX, stapY, xMin, xMax, yMin, yMax, m, b, vis, initA, initB };
}

function _lgcStapNote(stapX, stapY) {
  return `Let op: de x-as heeft stapgrootte ${stapX}, de y-as heeft stapgrootte ${stapY}.`;
}

/* ── L.G1c – grafiek bij formule, variabele assen ──────────────────── */
function genLG1c() {
  const { stapX, stapY, xMin, xMax, yMin, yMax, m, b, vis, initA, initB } = _lgcParams();
  const formule = _lgFormule(m, b, null);
  const rows = _lgPickRows(vis, 3);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const stapNote = _lgcStapNote(stapX, stapY);

  return {
    id: uid(), leerdoel: 'L.G1c',
    vraag: `Teken de grafiek van $${formule}$.`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stapX, stapY, initA, initB },
    hints: [
      stapNote + ' Bereken twee punten via de formule en sleep de punten daarheen.',
      `Bij $x = ${p1.x}$: $${_lgStap(m, b, p1.x, null)}$, dus punt $(${p1.x},\\ ${p1.y})$.`,
    ],
    oplossing: _lgOplPunten(m, b, p1, p2, formule, null, null) + `\n${stapNote}`,
  };
}

/* ── L.G2c – grafiek bij tabel, variabele assen ────────────────────── */
function genLG2c() {
  const { stapX, stapY, xMin, xMax, yMin, yMax, m, b, vis, initA, initB } = _lgcParams();
  const rows = _lgPickRows(vis, 4);
  const p1 = rows[0], p2 = rows[rows.length - 1];
  const stapNote = _lgcStapNote(stapX, stapY);

  return {
    id: uid(), leerdoel: 'L.G2c',
    vraag: `Teken de grafiek bij de tabel.${_lgTabelHtml(rows)}`,
    antwoordType: 'grafiek',
    antwoord: { m, b },
    data: { m, b, mDisplay: null, xMin, xMax, yMin, yMax, stapX, stapY, initA, initB },
    hints: [
      stapNote + ' Kies twee punten uit de tabel en sleep punt A en punt B daarheen.',
      `Bijvoorbeeld: sleep punt A naar $(${p1.x},\\ ${p1.y})$ en punt B naar $(${p2.x},\\ ${p2.y})$.`,
    ],
    oplossing: _lgOplTabel(p1, p2, null) + `\n${stapNote}`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   L.V – Lineaire vergelijkingen
   ═══════════════════════════════════════════════════════════════════════════ */

function _lvGcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b === 0 ? a : _lvGcd(b, a % b); }
function _lvFrac(t, n) {
  if (n < 0) { t = -t; n = -n; }
  const g = _lvGcd(Math.abs(t), n) || 1;
  return { t: t / g, n: n / g };
}
function _lvXTeX(t, n) {
  if (n === 1) return `${t}`;
  return t < 0 ? `-\\dfrac{${-t}}{${n}}` : `\\dfrac{${t}}{${n}}`;
}
function _lvSideTeX(a, b) {
  let s = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b === 0) return s;
  return b > 0 ? `${s} + ${b}` : `${s} - ${Math.abs(b)}`;
}

/* ── L.V1a – 1-staps vergelijkingen ──────────────────────────────────────── */
function genLV1a() {
  const subtype = pick(['ax=b', 'ax=b', 'xpb=c', 'xmb=c']);
  let eqTeX, teller, noemer, hints, opl;

  if (subtype === 'ax=b') {
    const a = pick([2, 3, 4, 5]);
    let b; do { b = rand(-9, 9); } while (b === 0);
    const fr = _lvFrac(b, a);
    teller = fr.t; noemer = fr.n;
    eqTeX = `${a}x = ${b}`;
    const xTex = _lvXTeX(fr.t, fr.n);
    hints = [`Deel beide kanten door $${a}$: dan staat $x$ alleen.`];
    opl = fr.n === 1
      ? `$${a}x = ${b}$\nDeel door $${a}$: $x = ${b} \\div ${a} = ${fr.t}$`
      : `$${a}x = ${b}$\nDeel door $${a}$: $x = \\dfrac{${b}}{${a}} = ${xTex}$`;
  } else if (subtype === 'xpb=c') {
    const b = rand(2, 9);
    const c = rand(-8, 8);
    teller = c - b; noemer = 1;
    eqTeX = `x + ${b} = ${c}`;
    hints = [`Trek $${b}$ af van beide kanten.`];
    opl = `$x + ${b} = ${c}$\n$x = ${c} - ${b} = ${teller}$`;
  } else {
    const b = rand(2, 9);
    const c = rand(-8, 8);
    teller = c + b; noemer = 1;
    eqTeX = `x - ${b} = ${c}`;
    hints = [`Tel $${b}$ op bij beide kanten.`];
    opl = `$x - ${b} = ${c}$\n$x = ${c} + ${b} = ${teller}$`;
  }

  return {
    id: uid(), leerdoel: 'L.V1a',
    vraag: `Los op: $${eqTeX}$`,
    antwoordType: 'vergelijking',
    antwoord: { teller, noemer },
    hints,
    oplossing: opl,
  };
}

/* ── L.V1b – 2-staps vergelijkingen ──────────────────────────────────────── */
function genLV1b() {
  let a, b, c, d, coefX, rhs;
  do {
    a = pick([2, 3, 4, 5]);
    c = pick([-4, -3, -2, -1, 1, 2, 3]);
    b = rand(-8, 8);
    d = rand(-8, 8);
    coefX = a - c;
    rhs = d - b;
  } while (coefX === 0);

  const fr = _lvFrac(rhs, coefX);
  const xTex = _lvXTeX(fr.t, fr.n);
  const lhsTeX = _lvSideTeX(a, b);
  const rhsTeX = _lvSideTeX(c, d);
  const midTeX = `${coefX}x = ${rhs}`;

  return {
    id: uid(), leerdoel: 'L.V1b',
    vraag: `Los op: $${lhsTeX} = ${rhsTeX}$`,
    antwoordType: 'vergelijking',
    antwoord: { teller: fr.t, noemer: fr.n },
    hints: [
      'Zet alle termen met $x$ naar links en alle getallen naar rechts.',
      'Je hebt nu de vorm $ax = b$. Deel beide kanten door de coëfficiënt van $x$.',
    ],
    oplossing: [
      `$${lhsTeX} = ${rhsTeX}$`,
      `Herschik: $${midTeX}$`,
      `$x = ${xTex}$`,
    ].join('\n'),
  };
}

/* ── L.V1c – vergelijkingen met haakjes ──────────────────────────────────── */
function genLV1c() {
  let a, bi, c, d, e, coefX, rhs;
  do {
    a  = pick([2, 3, 4]);
    bi = pick([1, 2, 3]);
    c  = rand(-5, 5); if (c === 0) c = pick([-2, -1, 1, 2]);
    d  = pick([1, 2, 3, 4]);
    e  = rand(-8, 8);
    coefX = a * bi - d;
    rhs   = e - a * c;
  } while (coefX === 0);

  const fr = _lvFrac(rhs, coefX);
  const xTex = _lvXTeX(fr.t, fr.n);
  const expA = a * bi, expC = a * c;

  let innerTeX = bi === 1 ? 'x' : `${bi}x`;
  innerTeX += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  const lhsTeX    = `${a}(${innerTeX})`;
  const rhsTeX    = _lvSideTeX(d, e);
  const expandedTeX = _lvSideTeX(expA, expC);
  const midTeX    = `${coefX}x = ${rhs}`;

  return {
    id: uid(), leerdoel: 'L.V1c',
    vraag: `Los op: $${lhsTeX} = ${rhsTeX}$`,
    antwoordType: 'vergelijking',
    antwoord: { teller: fr.t, noemer: fr.n },
    hints: [
      `Werk eerst de haakjes uit: vermenigvuldig $${a}$ met elk getal tussen de haakjes.`,
      'Na uitwerken staan er geen haakjes meer. Zet nu de $x$-termen links en de getallen rechts.',
    ],
    oplossing: [
      `$${lhsTeX} = ${rhsTeX}$`,
      `Haakjes uitwerken: $${expandedTeX} = ${rhsTeX}$`,
      `Herschik: $${midTeX}$`,
      `$x = ${xTex}$`,
    ].join('\n'),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   L.O – Lineaire ongelijkheden
   ═══════════════════════════════════════════════════════════════════════════ */

function _loFlip(op) {
  if (op === '<')    return '>';
  if (op === '>')    return '<';
  if (op === '\\le') return '\\ge';
  if (op === '\\ge') return '\\le';
  return op;
}

/* ── L.O1a – 1-staps ongelijkheden ───────────────────────────────────────── */
function genLO1a() {
  const a  = pick([-5, -4, -3, -2, 2, 3, 4, 5]);
  const op = pick(['<', '>', '\\le', '\\ge']);
  let b; do { b = rand(-9, 9); } while (b === 0);

  const fr     = _lvFrac(b, a);
  const finalOp = a < 0 ? _loFlip(op) : op;
  const xTex   = _lvXTeX(fr.t, fr.n);
  const s      = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  const eqTeX  = `${s} ${op} ${b}`;

  const hint = a < 0
    ? `Deel beide kanten door $${a}$. Let op: het ongelijkheidsteken draait om bij delen door een negatief getal!`
    : `Deel beide kanten door $${a}$.`;
  const opl  = fr.n === 1
    ? `$${eqTeX}$\n${a < 0 ? `Deel door $${a}$ (teken draait om)` : `Deel door $${a}$`}: $x ${finalOp} ${fr.t}$`
    : `$${eqTeX}$\n${a < 0 ? `Deel door $${a}$ (teken draait om)` : `Deel door $${a}$`}: $x ${finalOp} ${xTex}$`;

  return {
    id: uid(), leerdoel: 'L.O1a',
    vraag: `Los op: $${eqTeX}$`,
    antwoordType: 'ongelijkheid',
    antwoord: { teller: fr.t, noemer: fr.n, operator: finalOp },
    hints: [hint],
    oplossing: opl,
  };
}

/* ── L.O1b – 2-staps ongelijkheden ───────────────────────────────────────── */
function genLO1b() {
  let a, b, c, d, coefX, rhs;
  do {
    a = pick([2, 3, 4, 5]);
    c = pick([-4, -3, -2, -1, 1, 2, 3]);
    b = rand(-8, 8);
    d = rand(-8, 8);
    coefX = a - c;
    rhs   = d - b;
  } while (coefX === 0);

  const op      = pick(['<', '>', '\\le', '\\ge']);
  const fr      = _lvFrac(rhs, coefX);
  const finalOp = coefX < 0 ? _loFlip(op) : op;
  const xTex    = _lvXTeX(fr.t, fr.n);
  const lhsTeX  = _lvSideTeX(a, b);
  const rhsTeX  = _lvSideTeX(c, d);
  const coefXs  = _lvSideTeX(coefX, 0);
  const midTeX  = `${coefXs} ${op} ${rhs}`;

  const divLine = coefX < 0
    ? `Deel door $${coefX}$ (teken draait om): $x ${finalOp} ${xTex}$`
    : `$x ${finalOp} ${xTex}$`;

  return {
    id: uid(), leerdoel: 'L.O1b',
    vraag: `Los op: $${lhsTeX} ${op} ${rhsTeX}$`,
    antwoordType: 'ongelijkheid',
    antwoord: { teller: fr.t, noemer: fr.n, operator: finalOp },
    hints: [
      'Zet alle termen met $x$ naar links en alle getallen naar rechts.',
      coefX < 0
        ? 'Je hebt nu de coëfficiënt van $x$ links. Deel door die coëfficiënt — hij is negatief, dus het ongelijkheidsteken draait om!'
        : 'Je hebt nu de coëfficiënt van $x$ links. Deel beide kanten daardoor.',
    ],
    oplossing: [`$${lhsTeX} ${op} ${rhsTeX}$`, `Herschik: $${midTeX}$`, divLine].join('\n'),
  };
}

/* ── L.O1c – ongelijkheden met haakjes ───────────────────────────────────── */
function genLO1c() {
  let a, bi, c, d, e, coefX, rhs;
  do {
    a  = pick([2, 3, 4]);
    bi = pick([1, 2, 3]);
    c  = rand(-5, 5); if (c === 0) c = pick([-2, -1, 1, 2]);
    d  = pick([1, 2, 3, 4]);
    e  = rand(-8, 8);
    coefX = a * bi - d;
    rhs   = e - a * c;
  } while (coefX === 0);

  const op      = pick(['<', '>', '\\le', '\\ge']);
  const fr      = _lvFrac(rhs, coefX);
  const finalOp = coefX < 0 ? _loFlip(op) : op;
  const xTex    = _lvXTeX(fr.t, fr.n);
  const expA    = a * bi, expC = a * c;

  let innerTeX = bi === 1 ? 'x' : `${bi}x`;
  innerTeX += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  const lhsTeX      = `${a}(${innerTeX})`;
  const rhsTeX      = _lvSideTeX(d, e);
  const expandedTeX = _lvSideTeX(expA, expC);
  const coefXs      = _lvSideTeX(coefX, 0);
  const midTeX      = `${coefXs} ${op} ${rhs}`;

  const divLine = coefX < 0
    ? `Deel door $${coefX}$ (teken draait om): $x ${finalOp} ${xTex}$`
    : `$x ${finalOp} ${xTex}$`;

  return {
    id: uid(), leerdoel: 'L.O1c',
    vraag: `Los op: $${lhsTeX} ${op} ${rhsTeX}$`,
    antwoordType: 'ongelijkheid',
    antwoord: { teller: fr.t, noemer: fr.n, operator: finalOp },
    hints: [
      `Werk eerst de haakjes uit: vermenigvuldig $${a}$ met elk getal tussen de haakjes.`,
      coefX < 0
        ? 'Na uitwerken staan er geen haakjes meer. Zet de $x$-termen links en de getallen rechts. Let op: de coëfficiënt van $x$ is negatief — het teken draait om bij het delen!'
        : 'Na uitwerken staan er geen haakjes meer. Zet nu de $x$-termen links en de getallen rechts.',
    ],
    oplossing: [
      `$${lhsTeX} ${op} ${rhsTeX}$`,
      `Haakjes uitwerken: $${expandedTeX} ${op} ${rhsTeX}$`,
      `Herschik: $${midTeX}$`,
      divLine,
    ].join('\n'),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   M.V – Machtsvergelijkingen
   ═══════════════════════════════════════════════════════════════════════════ */

function _mvIsPerfect(val, n) {
  if (val <= 0) return false;
  const r = Math.round(Math.pow(val, 1 / n));
  return r >= 2 && Math.abs(Math.pow(r, n) - val) < 0.5;
}

/* ── M.V1a – directe machtsvergelijking x^n = c ─────────────────────────── */
function genMV1a() {
  const n = pick([2, 3, 4, 5, 6]);
  const hasNeg = n % 2 === 0;
  const maxK = n >= 5 ? 3 : n === 4 ? 4 : n === 3 ? 5 : 9;
  const k = rand(2, maxK);
  const useNegBase = !hasNeg && Math.random() < 0.4;
  const inner = useNegBase ? -Math.pow(k, n) : Math.pow(k, n);
  const solVal = useNegBase ? -k : k;

  const rootTeX = n === 2 ? `\\sqrt{${Math.abs(inner)}}` : `\\sqrt[${n}]{${Math.abs(inner)}}`;
  const rootDisp = inner < 0 && !hasNeg ? `-${rootTeX}` : rootTeX;
  const solTeX = hasNeg ? `\\pm ${k}` : `${solVal}`;

  const hints = [`Neem de ${n === 2 ? 'vierkantswortel' : `$${n}$e-machtswortel`} van beide kanten.`];
  if (hasNeg) hints.push('Er zijn twee oplossingen bij een even macht. Gebruik de v knop op het toetsenbord en typ de twee oplossingen met een v ertussen: x = [getal] v x = -[getal].');

  return {
    id: uid(), leerdoel: 'M.V1a',
    vraag: `Los op: $x^{${n}} = ${inner}$`,
    antwoordType: 'machtsvergelijking',
    antwoord: { inner, n, hasNeg, p: 0 },
    hints,
    oplossing: `$x^{${n}} = ${inner}$\n$x = ${rootDisp} = ${solTeX}$`,
  };
}

/* ── M.V1b – ax^n = c (antwoord vereist wortel) ─────────────────────────── */
function genMV1b() {
  const n = pick([2, 3, 4, 5, 6]);
  const hasNeg = n % 2 === 0;
  const a = pick([2, 3, 4, 5]);
  let inner;
  do { inner = rand(2, 15); } while (_mvIsPerfect(inner, n));
  if (!hasNeg && Math.random() < 0.3) inner = -inner;
  const c = a * inner;

  const rootTeX = n === 2 ? `\\sqrt{${Math.abs(inner)}}` : `\\sqrt[${n}]{${Math.abs(inner)}}`;
  const rootDisp = inner < 0 && !hasNeg ? `-${rootTeX}` : rootTeX;
  const solTeX = hasNeg ? `\\pm ${rootTeX}` : rootDisp;

  return {
    id: uid(), leerdoel: 'M.V1b',
    vraag: `Los op: $${a}x^{${n}} = ${c}$`,
    antwoordType: 'machtsvergelijking',
    antwoord: { inner, n, hasNeg, p: 0 },
    hints: [
      `Deel beide kanten door $${a}$.`,
      `Neem daarna de ${n === 2 ? 'vierkantswortel' : `$${n}$e-machtswortel`} van beide kanten.` +
      (hasNeg ? ' Er zijn twee oplossingen bij een even macht. Gebruik de v knop op het toetsenbord en typ de twee oplossingen met een v ertussen.' : ''),
    ],
    oplossing: [`$${a}x^{${n}} = ${c}$`, `$x^{${n}} = ${inner}$`, `$x = ${solTeX}$`].join('\n'),
  };
}

/* ── M.V1c – ax^n + b = c (gemengd: nette en niet-nette antwoorden) ─────── */
function genMV1c() {
  const n = pick([2, 3, 4, 5, 6]);
  const hasNeg = n % 2 === 0;
  const a = pick([2, 3, 4, 5]);
  let b; do { b = rand(-10, 10); } while (b === 0);

  const niceAns = Math.random() < 0.5;
  let inner;
  if (niceAns) {
    const maxK = n >= 5 ? 3 : n === 4 ? 4 : n === 3 ? 4 : 6;
    const k0 = rand(2, maxK);
    const useNeg = !hasNeg && Math.random() < 0.4;
    inner = useNeg ? -Math.pow(k0, n) : Math.pow(k0, n);
  } else {
    do { inner = rand(2, 12); } while (_mvIsPerfect(inner, n));
    if (!hasNeg && Math.random() < 0.3) inner = -inner;
  }
  if (hasNeg && inner < 0) inner = -inner;
  const c = a * inner + b;

  const bStr = b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
  const lhsTeX = `${a}x^{${n}}${bStr}`;
  const rootTeX = n === 2 ? `\\sqrt{${Math.abs(inner)}}` : `\\sqrt[${n}]{${Math.abs(inner)}}`;
  const rootDisp = inner < 0 && !hasNeg ? `-${rootTeX}` : rootTeX;
  const k = niceAns ? Math.round(_mvNthRoot(Math.abs(inner), n)) : 0;
  const solTeX = hasNeg
    ? (niceAns ? `\\pm ${k}` : `\\pm ${rootTeX}`)
    : (niceAns ? `${inner < 0 ? -k : k}` : rootDisp);

  return {
    id: uid(), leerdoel: 'M.V1c',
    vraag: `Los op: $${lhsTeX} = ${c}$`,
    antwoordType: 'machtsvergelijking',
    antwoord: { inner, n, hasNeg, p: 0 },
    hints: [
      `Isoleer $x^{${n}}$: breng $${b > 0 ? b : `(${b})`}$ naar de rechterkant.`,
      `Neem dan de ${n === 2 ? 'vierkantswortel' : `$${n}$e-machtswortel`} van beide kanten.` +
      (hasNeg ? ' Er zijn twee oplossingen bij een even macht. Gebruik de v knop op het toetsenbord en typ de twee oplossingen met een v ertussen.' : ''),
    ],
    oplossing: [
      `$${lhsTeX} = ${c}$`,
      `$${a}x^{${n}} = ${c - b}$`,
      `$x^{${n}} = ${inner}$`,
      `$x = ${solTeX}$`,
    ].join('\n'),
  };
}

/* ── M.V1d – a(x+p)^n + b = c (met haakjes) ────────────────────────────── */
function genMV1d() {
  const n = pick([2, 3, 4, 5, 6]);
  const hasNeg = n % 2 === 0;
  const a = pick([2, 3, 4, 5]);
  const b = rand(-8, 8);
  let p; do { p = rand(-3, 3); } while (p === 0);

  const niceAns = Math.random() < 0.5;
  let inner;
  if (niceAns) {
    const maxK = n >= 5 ? 3 : n === 4 ? 4 : n === 3 ? 4 : 5;
    const k0 = rand(2, maxK);
    const useNeg = !hasNeg && Math.random() < 0.4;
    inner = useNeg ? -Math.pow(k0, n) : Math.pow(k0, n);
  } else {
    do { inner = rand(2, 12); } while (_mvIsPerfect(inner, n));
    if (!hasNeg && Math.random() < 0.3) inner = -inner;
  }
  if (hasNeg && inner < 0) inner = -inner;
  const c = a * inner + b;

  const pStr  = p > 0 ? `+ ${p}` : `- ${-p}`;
  const bStr  = b > 0 ? ` + ${b}` : b < 0 ? ` - ${-b}` : '';
  const lhsTeX = `${a}(x ${pStr})^{${n}}${bStr}`;
  const xpTeX  = p > 0 ? `x + ${p}` : `x - ${-p}`;
  const offsetStr = p > 0 ? ` - ${p}` : ` + ${-p}`;

  const rootTeX  = n === 2 ? `\\sqrt{${Math.abs(inner)}}` : `\\sqrt[${n}]{${Math.abs(inner)}}`;
  const rootDisp = inner < 0 && !hasNeg ? `-${rootTeX}` : rootTeX;
  const k = niceAns ? Math.round(_mvNthRoot(Math.abs(inner), n)) : 0;

  let xpStap, solTeX;
  if (hasNeg) {
    xpStap = niceAns ? `${xpTeX} = \\pm ${k}` : `${xpTeX} = \\pm ${rootTeX}`;
    solTeX = niceAns
      ? `x = ${k - p}$ of $x = ${-k - p}`
      : `x = ${rootTeX}${offsetStr}$ of $x = -${rootTeX}${offsetStr}`;
  } else {
    const niceVal = niceAns ? (inner < 0 ? -k : k) - p : null;
    xpStap = niceAns ? `${xpTeX} = ${inner < 0 ? -k : k}` : `${xpTeX} = ${rootDisp}`;
    solTeX = niceAns ? `x = ${niceVal}` : `x = ${rootDisp}${offsetStr}`;
  }

  const hint1 = b === 0
    ? `Deel beide kanten door $${a}$.`
    : b > 0
      ? `Trek $${b}$ af van beide kanten en deel daarna door $${a}$.`
      : `Tel $${-b}$ op bij beide kanten en deel daarna door $${a}$.`;

  return {
    id: uid(), leerdoel: 'M.V1d',
    vraag: `Los op: $${lhsTeX} = ${c}$`,
    antwoordType: 'machtsvergelijking',
    antwoord: { inner, n, hasNeg, p },
    hints: [
      hint1,
      `Neem dan de ${n === 2 ? 'vierkantswortel' : `$${n}$e-machtswortel`} van beide kanten en breng $x$ vrij.` +
      (hasNeg ? ' Er zijn twee oplossingen bij een even macht. Typ ze met een v ertussen: x = [eerste] v x = [tweede].' : ''),
    ],
    oplossing: [
      `$${lhsTeX} = ${c}$`,
      b !== 0 ? `$${a}(x ${pStr})^{${n}} = ${c - b}$` : null,
      `$(x ${pStr})^{${n}} = ${inner}$`,
      `$${xpStap}$`,
      `$${solTeX}$`,
    ].filter(Boolean).join('\n'),
  };
}

/* ── M.V2 – hulpfuncties ─────────────────────────────────────────────────── */
function _mvcTerm(coeff, varTeX, first) {
  if (coeff === 0) return '';
  const a = Math.abs(coeff);
  const term = varTeX ? (a === 1 ? varTeX : `${a}${varTeX}`) : `${a}`;
  if (first) return coeff < 0 ? `-${term}` : term;
  return coeff < 0 ? ` - ${term}` : ` + ${term}`;
}

function _mvcFactor(root) {
  return root > 0 ? `(x - ${root})` : `(x + ${Math.abs(root)})`;
}

function _mvcSqrtTeX(n) {
  const k = Math.round(Math.sqrt(n));
  return k * k === n ? `${k}` : `\\sqrt{${n}}`;
}

/* ── M.V2a – x³-vergelijking (herschikking → x eruit factoriseren) ──────── */
function genMV2a() {
  let p, q, tries = 0;
  do {
    p = rand(-5, 5);
    q = rand(-5, 5);
    tries++;
  } while ((p === 0 || q === 0 || p === q || p + q === 0) && tries < 100);

  const β = -(p + q);  // x²-coëfficiënt in standaardvorm
  const γ = p * q;     // x-coëfficiënt in standaardvorm

  const stdForm   = `x^3${_mvcTerm(β, 'x^{2}', false)}${_mvcTerm(γ, 'x', false)} = 0`;
  const quadTeX   = `x^{2}${_mvcTerm(β, 'x', false)}${_mvcTerm(γ, '', false)}`;
  const factored  = `x${_mvcFactor(p)}${_mvcFactor(q)} = 0`;

  // Vraagvorm: herschikking (γx naar rechts, of βx²+γx naar rechts)
  let vraagTeX;
  if (Math.random() < 0.5) {
    // Optie A: x³ + βx² = −γx
    const lhs = `x^3${_mvcTerm(β, 'x^{2}', false)}`;
    const rhs = _mvcTerm(-γ, 'x', true);
    vraagTeX = `${lhs} = ${rhs}`;
  } else {
    // Optie B: x³ = −βx² − γx
    const rhs = `${_mvcTerm(-β, 'x^{2}', true)}${_mvcTerm(-γ, 'x', false)}`;
    vraagTeX = `x^3 = ${rhs}`;
  }

  return {
    id: uid(), leerdoel: 'M.V2a',
    vraag: `Los op: $${vraagTeX}$`,
    antwoordType: 'vergelijking-mv',
    antwoord: { sols: [0, p, q] },
    hints: [
      `Breng alles naar één kant: $${stdForm}$ Daarna kun je $x$ buiten haakjes brengen.`,
      `Na uitfactoriseren: $x(${quadTeX}) = 0$. Ontbind de kwadratische factor verder en pas de nulpuntsregel toe.`,
    ],
    oplossing: [
      `$${stdForm}$`,
      `$x(${quadTeX}) = 0$`,
      `$${factored}$`,
      `$x = 0 \\vee x = ${p} \\vee x = ${q}$`,
    ].join('\n'),
  };
}

/* ── M.V2b – biquadratische vergelijking (substitutie u = x²) ────────────── */
function genMV2b() {
  const sqCandidates = [1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 25];
  let u1, u2, b, tries = 0;
  do {
    if (Math.random() < 0.4) {
      u1 = pick([1, 4, 9, 16, 25]);
      u2 = pick([-1, -2, -3, -4, -5]);
    } else {
      u1 = pick(sqCandidates);
      u2 = pick(sqCandidates);
    }
    b = -(u1 + u2);
    tries++;
  } while ((b === 0 || u1 === u2) && tries < 50);

  // Zorg dat u1 ≥ u2 voor consistente weergave
  if (u2 > 0 && u2 > u1) { const t = u1; u1 = u2; u2 = t; b = -(u1 + u2); }

  const c         = u1 * u2;
  const stdForm   = `x^4${_mvcTerm(b, 'x^{2}', false)}${_mvcTerm(c, '', false)} = 0`;
  const uQuadTeX  = `u^2${_mvcTerm(b, 'u', false)}${_mvcTerm(c, '', false)}`;
  const uFactor1  = u1 > 0 ? `(u - ${u1})` : `(u + ${Math.abs(u1)})`;
  const uFactor2  = u2 > 0 ? `(u - ${u2})` : `(u + ${Math.abs(u2)})`;
  const sol1Tex   = _mvcSqrtTeX(u1);

  // x-oplossingen
  const sols = [Math.sqrt(u1), -Math.sqrt(u1)];
  let oplU2Line, oplSolLine;
  if (u2 > 0) {
    const sol2Tex = _mvcSqrtTeX(u2);
    sols.push(Math.sqrt(u2), -Math.sqrt(u2));
    oplU2Line  = `$x^2 = ${u1} \\Rightarrow x = \\pm ${sol1Tex}$\\quad en\\quad $x^2 = ${u2} \\Rightarrow x = \\pm ${sol2Tex}$`;
    oplSolLine = `$x = ${sol1Tex} \\vee x = -${sol1Tex} \\vee x = ${sol2Tex} \\vee x = -${sol2Tex}$`;
  } else {
    oplU2Line  = `$x^2 = ${u1} \\Rightarrow x = \\pm ${sol1Tex}$\\quad en\\quad $x^2 = ${u2}$ heeft geen reële oplossing`;
    oplSolLine = `$x = ${sol1Tex} \\vee x = -${sol1Tex}$`;
  }

  // Vraagvorm: 3 varianten
  let vraagTeX;
  const form = Math.floor(Math.random() * 3);
  if (form === 0) {
    vraagTeX = stdForm;
  } else if (form === 1) {
    // x⁴ + c = −bx² (x²-term naar rechts)
    const lhs = `x^4${_mvcTerm(c, '', false)}`;
    const rhs = _mvcTerm(-b, 'x^{2}', true);
    vraagTeX = `${lhs} = ${rhs}`;
  } else {
    // x⁴ = −bx² − c
    const rhs = `${_mvcTerm(-b, 'x^{2}', true)}${_mvcTerm(-c, '', false)}`;
    vraagTeX = `x^4 = ${rhs}`;
  }

  return {
    id: uid(), leerdoel: 'M.V2b',
    vraag: `Los exact op: $${vraagTeX}$`,
    antwoordType: 'vergelijking-mv',
    antwoord: { sols },
    hints: [
      `Breng alles naar één kant en stel $u = x^2$. De vergelijking wordt $${uQuadTeX} = 0$.`,
      `Los de kwadratische vergelijking in $u$ op. Neem dan de vierkantswortel van elke positieve $u$-waarde. Vergeet $\\pm$ niet!`,
    ],
    oplossing: [
      `$${stdForm}$`,
      `Stel $u = x^2\\!$: $${uQuadTeX} = 0$`,
      `$${uFactor1}${uFactor2} = 0$`,
      `$u = ${u1} \\vee u = ${u2}$`,
      oplU2Line,
      oplSolLine,
    ].join('\n'),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   K – Kwadratische verbanden
   ══════════════════════════════════════════════════════════════════════════ */

function _kwIsPerfectSqRatio(c, a) {
  const r = c / a;
  if (r <= 0 || !Number.isFinite(r)) return false;
  const sq = Math.round(Math.sqrt(r));
  return Math.abs(sq * sq - r) < 1e-9;
}

function _kwIsPerfectSq(n) {
  if (n <= 0) return false;
  const sq = Math.round(Math.sqrt(n));
  return sq * sq === n;
}

function _kwSimplifyRadical(n) {
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (n % (k * k) === 0) return { coeff: k, inner: n / (k * k) };
  }
  return { coeff: 1, inner: n };
}

function _kwPolyTeX(a, b, c, v) {
  const aTeX = a === 1 ? '' : `${a}`;
  let s = `${aTeX}${v}^{2}`;
  if (b !== 0) {
    const absB = Math.abs(b);
    const bCoefTeX = absB === 1 ? '' : `${absB}`;
    s += b > 0 ? ` + ${bCoefTeX}${v}` : ` - ${bCoefTeX}${v}`;
  }
  if (c !== 0) s += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  return s;
}

/* ── K.A1a – ax² = c ─────────────────────────────────────────────────────── */
function genKWA() {
  const letters = ['x', 'y', 't', 'n', 'm'];
  const v = pick(letters);
  const a = rand(1, 5);
  const integerAns = Math.random() < 0.55;
  let c, sol;
  if (integerAns) {
    const r = rand(1, 9);
    c = a * r * r;
    sol = r;
  } else {
    do { c = rand(2, 60); } while (_kwIsPerfectSqRatio(c, a));
    sol = Math.sqrt(c / a);
  }
  const aTeX = a === 1 ? '' : `${a}`;
  const forms = [
    `${aTeX}${v}^{2} = ${c}`,
    `${c} = ${aTeX}${v}^{2}`,
    `${aTeX}${v}^{2} - ${c} = 0`,
  ];
  const eqTeX = pick(forms);
  const [cn, cd] = simplifyFrac(c, a);
  const innerStr = cd === 1 ? `${cn}` : `\\frac{${cn}}{${cd}}`;
  const rootTeX = a === 1 ? `\\sqrt{${c}}` : `\\sqrt{${innerStr}}`;
  const decApprox = integerAns ? null : Math.round(sol * 100) / 100;
  const oplSteps = [
    `$${aTeX}${v}^{2} = ${c}$`,
    a !== 1 ? `$${v}^{2} = ${innerStr}$` : null,
    integerAns
      ? `$${v} = ${sol}$ of $${v} = -${sol}$`
      : `$${v} = ${rootTeX}$ of $${v} = -${rootTeX}$ ($\\approx ${decApprox}$ of $\\approx -${decApprox}$)`,
  ].filter(Boolean);
  return {
    id: uid(), leerdoel: 'K.A1a',
    vraag: `Los op: $${eqTeX}$`,
    antwoordType: 'kwadratisch',
    antwoord: { sols: [sol, -sol], v, decimaal: true },
    hints: [
      `Isoleer $${v}^{2}$ en neem daarna de vierkantswortel van beide kanten.`,
      `Er zijn twee oplossingen. Gebruik de <strong>v</strong>-knop: ${v} = [waarde] v ${v} = −[waarde].`,
    ],
    oplossing: oplSteps.join('\n'),
  };
}

/* ── K.B1a – ax² = bx ───────────────────────────────────────────────────── */
function genKWB() {
  const letters = ['x', 'y', 't', 'n', 'm'];
  const v = pick(letters);
  const a = rand(1, 5);
  const b = rand(2, 15);
  const sol2 = b / a;
  const [sn, sd] = simplifyFrac(b, a);
  const sol2TeX = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`;
  const aTeX = a === 1 ? '' : `${a}`;
  const bVTeX = b === 1 ? v : `${b}${v}`;
  const forms = [
    `${aTeX}${v}^{2} = ${bVTeX}`,
    `${bVTeX} = ${aTeX}${v}^{2}`,
    `${aTeX}${v}^{2} - ${bVTeX} = 0`,
  ];
  const eqTeX = pick(forms);
  const factorTeX = `${v}(${aTeX}${v} - ${b})`;
  const stapsB = [`$${aTeX}${v}^{2} - ${bVTeX} = 0$`, `$${factorTeX} = 0$`];
  if (a === 1) {
    stapsB.push(`$${v} = 0$ of $${v} = ${sol2TeX}$`);
  } else {
    stapsB.push(`$${v} = 0$ of $${aTeX}${v} = ${b}$`);
    stapsB.push(`$${v} = 0$ of $${v} = ${sol2TeX}$`);
  }
  return {
    id: uid(), leerdoel: 'K.B1a',
    vraag: `Los op: $${eqTeX}$`,
    antwoordType: 'kwadratisch',
    antwoord: { sols: [0, sol2], v, decimaal: true },
    hints: [
      `Breng alles naar één kant zodat de vergelijking gelijk is aan nul.`,
      `Ontbind in factoren: $${v}$ is een gemeenschappelijke factor. Gebruik daarna de nulpuntsregel.`,
    ],
    oplossing: stapsB.join('\n'),
  };
}

/* ── K.C1a – ax² + bx + c = 0, product-som methode ─────────────────────── */
function genKWC() {
  const letters = ['x', 'y', 't', 'n', 'm'];
  const v = pick(letters);
  let r1, r2;
  do { r1 = rand(-6, 6); r2 = rand(-6, 6); }
  while (r1 === r2 || r1 === 0 || r2 === 0);
  const a = pick([1, 1, 2]);
  const bCoef = -a * (r1 + r2);
  const cCoef = a * r1 * r2;
  const lhsTeX = _kwPolyTeX(a, bCoef, cCoef, v);
  const f1 = r1 > 0 ? `(${v} - ${r1})` : `(${v} + ${-r1})`;
  const f2 = r2 > 0 ? `(${v} - ${r2})` : `(${v} + ${-r2})`;
  const monicFactored = `${f1}${f2}`;
  const stapsC = [`$${lhsTeX} = 0$`];
  if (a > 1) stapsC.push(`$${_kwPolyTeX(1, bCoef / a, cCoef / a, v)} = 0$`);
  stapsC.push(`$${monicFactored} = 0$`);
  stapsC.push(`$${v} = ${r1}$ of $${v} = ${r2}$`);
  return {
    id: uid(), leerdoel: 'K.C1a',
    vraag: `Los op: $${lhsTeX} = 0$`,
    antwoordType: 'kwadratisch',
    antwoord: { sols: [r1, r2], v, decimaal: true },
    hints: [
      a > 1
        ? `Deel beide kanten door $${a}$ om een monicse vergelijking te krijgen.`
        : `Zoek twee getallen waarvan het product gelijk is aan het constante getal en de som gelijk is aan de coëfficiënt van $${v}$.`,
      `Schrijf de linker kant als een product van twee factoren en gebruik daarna de nulpuntsregel.`,
    ],
    oplossing: stapsC.join('\n'),
  };
}

/* ── K.D1a – abc-formule, afronden op 2 decimalen ───────────────────────── */
function genKWD() {
  const letters = ['x', 'y', 't', 'n', 'm'];
  const v = pick(letters);
  let a, b, c, D, tries = 0;
  do {
    a = rand(1, 4);
    b = rand(-8, 8); if (b === 0) b = pick([-3, -2, 2, 3]);
    c = rand(-6, 6); if (c === 0) c = pick([-2, -1, 1, 2]);
    D = b * b - 4 * a * c;
    if (++tries > 500) { a = 1; b = -3; c = 1; D = 5; break; }
  } while (D <= 0 || _kwIsPerfectSq(D));
  const sqrtD = Math.sqrt(D);
  const twoA = 2 * a;
  const sol1 = (-b + sqrtD) / twoA;
  const sol2 = (-b - sqrtD) / twoA;
  const dec1 = Math.round(sol1 * 100) / 100;
  const dec2 = Math.round(sol2 * 100) / 100;
  const lhsTeX = _kwPolyTeX(a, b, c, v);
  const negB = -b;
  const cDisp = c < 0 ? `(${c})` : `${c}`;
  return {
    id: uid(), leerdoel: 'K.D1a',
    vraag: `Los op: $${lhsTeX} = 0$`,
    antwoordType: 'kwadratisch',
    antwoord: { sols: [sol1, sol2], v, decimaal: true },
    hints: [
      `Gebruik de abc-formule: $${v} = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.`,
      `Identificeer $a = ${a}$, $b = ${b}$, $c = ${c}$ en vul in. Rond af op 2 decimalen.`,
    ],
    oplossing: [
      `$a = ${a},\\; b = ${b},\\; c = ${c}$`,
      `$D = (${b})^2 - 4 \\cdot ${a} \\cdot ${cDisp} = ${D}$`,
      `$${v} = \\dfrac{${negB} \\pm \\sqrt{${D}}}{${twoA}}$`,
      `$${v} \\approx ${dec1}$ of $${v} \\approx ${dec2}$`,
    ].join('\n'),
  };
}

/* ── K.E1a – abc-formule, exact antwoord ────────────────────────────────── */
function genKWE() {
  const letters = ['x', 'y', 't', 'n', 'm'];
  const v = pick(letters);
  let a, b, c, D, tries = 0;
  do {
    a = rand(1, 3);
    b = rand(-6, 6); if (b === 0) b = pick([-2, 2]);
    c = rand(-5, 5); if (c === 0) c = pick([-1, 1]);
    D = b * b - 4 * a * c;
    if (++tries > 500) { a = 1; b = -2; c = -1; D = 8; break; }
  } while (D <= 0 || _kwIsPerfectSq(D));
  const sqrtD = Math.sqrt(D);
  const twoA = 2 * a;
  const sol1 = (-b + sqrtD) / twoA;
  const sol2 = (-b - sqrtD) / twoA;
  const { coeff: sqC, inner: sqIn } = _kwSimplifyRadical(D);
  const rootTeX = sqC === 1 ? `\\sqrt{${D}}` : `${sqC}\\sqrt{${sqIn}}`;
  const negB = -b;
  let sol1TeX, sol2TeX;
  if (negB === 0) {
    const g = gcd(sqC, twoA);
    const cc = sqC / g, ta = twoA / g;
    const rt = cc === 1 ? `\\sqrt{${sqIn}}` : `${cc}\\sqrt{${sqIn}}`;
    sol1TeX = ta === 1 ? rt : `\\frac{${rt}}{${ta}}`;
    sol2TeX = ta === 1 ? `-${rt}` : `\\frac{-${rt}}{${ta}}`;
  } else {
    const g = gcd(gcd(Math.abs(negB), sqC), twoA);
    if (g > 1) {
      const n = negB / g, cc = sqC / g, ta = twoA / g;
      const rt = cc === 1 ? `\\sqrt{${sqIn}}` : `${cc}\\sqrt{${sqIn}}`;
      sol1TeX = ta === 1 ? `${n} + ${rt}` : `\\frac{${n} + ${rt}}{${ta}}`;
      sol2TeX = ta === 1 ? `${n} - ${rt}` : `\\frac{${n} - ${rt}}{${ta}}`;
    } else {
      sol1TeX = `\\frac{${negB} + ${rootTeX}}{${twoA}}`;
      sol2TeX = `\\frac{${negB} - ${rootTeX}}{${twoA}}`;
    }
  }
  const lhsTeX = _kwPolyTeX(a, b, c, v);
  const cDisp = c < 0 ? `(${c})` : `${c}`;
  const stapsE = [
    `$a = ${a},\\; b = ${b},\\; c = ${c}$`,
    `$D = (${b})^2 - 4 \\cdot ${a} \\cdot ${cDisp} = ${D}$`,
  ];
  if (sqC > 1) stapsE.push(`$\\sqrt{${D}} = ${rootTeX}$`);
  stapsE.push(`$${v} = ${sol1TeX}$ of $${v} = ${sol2TeX}$`);
  return {
    id: uid(), leerdoel: 'K.E1a',
    vraag: `Los op: $${lhsTeX} = 0$`,
    antwoordType: 'kwadratisch',
    antwoord: { sols: [sol1, sol2], v, decimaal: false },
    hints: [
      `Gebruik de abc-formule: $${v} = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.`,
      `Vereenvoudig de wortel en de breuk zo ver mogelijk. Geef het exacte antwoord (geen decimalen).`,
    ],
    oplossing: stapsE.join('\n'),
  };
}

/* ── Stelsels – hulpfuncties ─────────────────────────────────────────────── */
function _stelselEqTeX(a, b, c) {
  let s = '';
  if (a !== 0) {
    const aA = Math.abs(a);
    s = (a < 0 ? '-' : '') + (aA === 1 ? 'x' : `${aA}x`);
  }
  if (b !== 0) {
    const bA = Math.abs(b);
    const bTeX = bA === 1 ? 'y' : `${bA}y`;
    s += a !== 0 ? (b > 0 ? ` + ${bTeX}` : ` - ${bTeX}`) : ((b < 0 ? '-' : '') + bTeX);
  }
  s += ` = ${c}`;
  return s;
}

function _stelselIsoTex(b1, c1) {
  if (b1 === 0) return `${c1}`;
  const bA = Math.abs(b1);
  const bTeX = bA === 1 ? 'y' : `${bA}y`;
  return b1 > 0 ? `${c1} - ${bTeX}` : `${c1} + ${bTeX}`;
}

/* ── S.E1a – eliminatiemethode ───────────────────────────────────────────── */
function genStelselE() {
  const xSol = rand(-6, 6);
  const ySol = rand(-6, 6);
  const a1 = rand(1, 4);
  const b1 = pick([-3, -2, -1, 1, 2, 3]);
  const c1 = a1 * xSol + b1 * ySol;

  const elimX = Math.random() < 0.5;
  let a2, b2, det = 0, tries = 0;
  do {
    if (elimX) {
      a2 = Math.random() < 0.5 ? a1 : -a1;
      b2 = rand(-4, 4); if (b2 === 0) b2 = pick([-3, -2, 2, 3]);
    } else {
      b2 = Math.random() < 0.5 ? b1 : -b1;
      a2 = rand(-4, 4); if (a2 === 0) a2 = pick([-3, -2, 2, 3]);
    }
    det = a1 * b2 - a2 * b1;
  } while (det === 0 && ++tries < 20);
  const c2 = a2 * xSol + b2 * ySol;

  const eq1 = _stelselEqTeX(a1, b1, c1);
  const eq2 = _stelselEqTeX(a2, b2, c2);

  let elimCoeff, elimRhs, foundVar, foundVal, backSubEq, otherVar, otherVal;
  if (elimX) {
    const add = a2 === -a1;
    elimCoeff = add ? b1 + b2 : b1 - b2;
    elimRhs   = add ? c1 + c2 : c1 - c2;
    foundVar = 'y'; foundVal = ySol; otherVar = 'x'; otherVal = xSol;
    backSubEq = _stelselEqTeX(a1, 0, c1 - b1 * ySol);
  } else {
    const add = b2 === -b1;
    elimCoeff = add ? a1 + a2 : a1 - a2;
    elimRhs   = add ? c1 + c2 : c1 - c2;
    foundVar = 'x'; foundVal = xSol; otherVar = 'y'; otherVal = ySol;
    backSubEq = _stelselEqTeX(0, b1, c1 - a1 * xSol);
  }

  const elimEqTeX = elimX
    ? _stelselEqTeX(0, elimCoeff, elimRhs)
    : _stelselEqTeX(elimCoeff, 0, elimRhs);
  const opStr = (elimX ? a2 === -a1 : b2 === -b1) ? 'optellen' : 'aftrekken';

  return {
    id: uid(), leerdoel: 'S.1a',
    vraag: `Los op: $\\begin{cases}${eq1}\\\\${eq2}\\end{cases}$`,
    antwoordType: 'stelsel',
    antwoord: { x: xSol, y: ySol },
    hints: [
      `Kies een methode: eliminatie (vergelijkingen optellen of aftrekken) of substitutie (variabele vrijmaken en invullen).`,
      `Tip: de coëfficiënten van $${elimX ? 'x' : 'y'}$ zijn ${(elimX ? a2 === a1 : b2 === b1) ? 'gelijk' : 'tegengesteld'} — dat maakt eliminatie handig hier.`,
    ],
    oplossing: [
      `$(1)\\;${eq1}$`,
      `$(2)\\;${eq2}$`,
      `Na ${opStr}: $${elimEqTeX}$`,
      `$${foundVar} = ${foundVal}$`,
      `Invullen in $(1)$: $${backSubEq}$`,
      `$${otherVar} = ${otherVal}$`,
      `De oplossing is $(x,\\;y) = (${xSol},\\;${ySol})$.`,
    ].join('\n'),
  };
}

/* ── S.S1a – substitutiemethode ─────────────────────────────────────────── */
function genStelselS() {
  const xSol = rand(-6, 6);
  const ySol = rand(-6, 6);
  const b1 = pick([-3, -2, -1, 1, 2, 3]);
  const c1 = xSol + b1 * ySol;
  let a2, b2, det = 0, tries = 0;
  do {
    a2 = rand(-4, 4); if (a2 === 0) a2 = pick([-3, -2, 2, 3]);
    b2 = rand(-4, 4); if (b2 === 0) b2 = pick([-3, -2, 2, 3]);
    det = b2 - a2 * b1;
  } while (det === 0 && ++tries < 20);
  const c2 = a2 * xSol + b2 * ySol;

  const eq1 = _stelselEqTeX(1, b1, c1);
  const eq2 = _stelselEqTeX(a2, b2, c2);
  const isoTex = _stelselIsoTex(b1, c1);
  const newCoeff = b2 - a2 * b1;
  const newRhs   = c2 - a2 * c1;

  return {
    id: uid(), leerdoel: 'S.1a',
    vraag: `Los op: $\\begin{cases}${eq1}\\\\${eq2}\\end{cases}$`,
    antwoordType: 'stelsel',
    antwoord: { x: xSol, y: ySol },
    hints: [
      `Kies een methode: eliminatie (vergelijkingen optellen of aftrekken) of substitutie (variabele vrijmaken en invullen).`,
      `Tip: vergelijking $(1)$ heeft coëfficiënt 1 voor $x$ — dat maakt substitutie handig hier.`,
    ],
    oplossing: [
      `$(1)\\;${eq1}$`,
      `$(2)\\;${eq2}$`,
      `Uit $(1)$: $x = ${isoTex}$`,
      `Invullen in $(2)$ en vereenvoudigen: $${_stelselEqTeX(0, newCoeff, newRhs)}$`,
      `$y = ${ySol}$`,
      `Invullen in $(1)$: $x = ${xSol}$`,
      `De oplossing is $(x,\\;y) = (${xSol},\\;${ySol})$.`,
    ].join('\n'),
  };
}

/* ── S.1b – eliminatie na vermenigvuldiging ──────────────────────────────── */
function genStelselB() {
  const xSol = rand(-5, 5);
  const ySol = rand(-5, 5);
  let a1, b1, a2, b2, det = 0, tries = 0;
  do {
    a1 = rand(2, 5); b1 = pick([-3, -2, -1, 1, 2, 3]);
    a2 = rand(2, 5); b2 = pick([-3, -2, -1, 1, 2, 3]);
    det = a1 * b2 - a2 * b1;
    tries++;
  } while ((det === 0 || a1 === a2 || a1 === -a2 || b1 === b2 || b1 === -b2) && tries < 50);
  const c1 = a1 * xSol + b1 * ySol;
  const c2 = a2 * xSol + b2 * ySol;
  const eq1 = _stelselEqTeX(a1, b1, c1);
  const eq2 = _stelselEqTeX(a2, b2, c2);
  // Elimineer x: (1)×a2 − (2)×a1
  const newB = b1 * a2 - b2 * a1;
  const newC = c1 * a2 - c2 * a1;
  const elimEq = _stelselEqTeX(0, newB, newC);
  const backSubEq = _stelselEqTeX(a1, 0, c1 - b1 * ySol);
  return {
    id: uid(), leerdoel: 'S.1b',
    vraag: `Los op: $\\begin{cases}${eq1}\\\\${eq2}\\end{cases}$`,
    antwoordType: 'stelsel',
    antwoord: { x: xSol, y: ySol },
    hints: [
      `De coëfficiënten zijn niet gelijk en niet tegengesteld. Vermenigvuldig de vergelijkingen zodat een variabele wegvalt.`,
      `Vermenigvuldig vergelijking $(1)$ met $${a2}$ en vergelijking $(2)$ met $${a1}$. Trek dan de vergelijkingen van elkaar af om $x$ weg te werken.`,
    ],
    oplossing: [
      `$(1)\\;${eq1}$`,
      `$(2)\\;${eq2}$`,
      `$(1) \\times ${a2} - (2) \\times ${a1}\\!$: $${elimEq}$`,
      `$y = ${ySol}$`,
      `Invullen in $(1)$: $${backSubEq}$`,
      `$x = ${xSol}$`,
      `De oplossing is $(x,\\;y) = (${xSol},\\;${ySol})$.`,
    ].join('\n'),
  };
}

/* ── hulp: y=ax+b of x=ay+b als LaTeX-string ────────────────────────────── */
function _stelselSlopeForm(varL, a, varR, b) {
  const aA = Math.abs(a);
  const term = (a < 0 ? '-' : '') + (aA === 1 ? varR : `${aA}${varR}`);
  if (b === 0) return `${varL} = ${term}`;
  return b > 0 ? `${varL} = ${term} + ${b}` : `${varL} = ${term} - ${Math.abs(b)}`;
}

/* ── S.1c – één vergelijking in y=ax+b of x=ay+b vorm ───────────────────── */
function genStelselC() {
  const xSol = rand(-5, 5);
  const ySol = rand(-5, 5);
  const useYform = Math.random() < 0.5;

  if (useYform) {
    // Vergelijking (1): y = a*x + b
    const a = pick([-3, -2, -1, 1, 2, 3]);
    const b = ySol - a * xSol;
    const eq1 = _stelselSlopeForm('y', a, 'x', b);
    // Vergelijking (2): c*x + d*y = e
    let c, d, tries = 0;
    do {
      c = rand(-4, 4); if (c === 0) c = pick([-2, -1, 1, 2]);
      d = rand(-4, 4); if (d === 0) d = pick([-2, -1, 1, 2]);
      tries++;
    } while (c + d * a === 0 && tries < 20);
    const e = c * xSol + d * ySol;
    const eq2 = _stelselEqTeX(c, d, e);
    const newCoeff = c + d * a;
    const newRhs = e - d * b;
    const substEq = _stelselEqTeX(newCoeff, 0, newRhs);
    return {
      id: uid(), leerdoel: 'S.1c',
      vraag: `Los op: $\\begin{cases}${eq1}\\\\${eq2}\\end{cases}$`,
      antwoordType: 'stelsel',
      antwoord: { x: xSol, y: ySol },
      hints: [
        `Vergelijking $(1)$ geeft $y$ al vrij. Vul die uitdrukking voor $y$ direct in vergelijking $(2)$ in.`,
        `Na invullen krijg je een vergelijking met alleen $x$. Los die op en vul dan terug in voor $y$.`,
      ],
      oplossing: [
        `$(1)\\;${eq1}$`,
        `$(2)\\;${eq2}$`,
        `Invullen van $(1)$ in $(2)$: $${substEq}$`,
        `$x = ${xSol}$`,
        `Invullen in $(1)$: $y = ${ySol}$`,
        `De oplossing is $(x,\\;y) = (${xSol},\\;${ySol})$.`,
      ].join('\n'),
    };
  } else {
    // Vergelijking (1): x = a*y + b
    const a = pick([-3, -2, -1, 1, 2, 3]);
    const b = xSol - a * ySol;
    const eq1 = _stelselSlopeForm('x', a, 'y', b);
    // Vergelijking (2): c*x + d*y = e
    let c, d, tries = 0;
    do {
      c = rand(-4, 4); if (c === 0) c = pick([-2, -1, 1, 2]);
      d = rand(-4, 4); if (d === 0) d = pick([-2, -1, 1, 2]);
      tries++;
    } while (c * a + d === 0 && tries < 20);
    const e = c * xSol + d * ySol;
    const eq2 = _stelselEqTeX(c, d, e);
    const newCoeff = c * a + d;
    const newRhs = e - c * b;
    const substEq = _stelselEqTeX(0, newCoeff, newRhs);
    return {
      id: uid(), leerdoel: 'S.1c',
      vraag: `Los op: $\\begin{cases}${eq1}\\\\${eq2}\\end{cases}$`,
      antwoordType: 'stelsel',
      antwoord: { x: xSol, y: ySol },
      hints: [
        `Vergelijking $(1)$ geeft $x$ al vrij. Vul die uitdrukking voor $x$ direct in vergelijking $(2)$ in.`,
        `Na invullen krijg je een vergelijking met alleen $y$. Los die op en vul dan terug in voor $x$.`,
      ],
      oplossing: [
        `$(1)\\;${eq1}$`,
        `$(2)\\;${eq2}$`,
        `Invullen van $(1)$ in $(2)$: $${substEq}$`,
        `$y = ${ySol}$`,
        `Invullen in $(1)$: $x = ${xSol}$`,
        `De oplossing is $(x,\\;y) = (${xSol},\\;${ySol})$.`,
      ].join('\n'),
    };
  }
}

const LEERDOELEN = [
  { id: 'B.0',   titel: 'Teller en noemer herkennen',            groep: 'Basis',        gen: genB0   },
  { id: 'B.01a', titel: 'Breuk op getallenlijn – invullen',      groep: 'Basis',        gen: genB01a },
  { id: 'B.01b', titel: 'Breuk op getallenlijn – meerkeuze',     groep: 'Basis',        gen: genB01b },
  { id: 'B.01c', titel: 'Breuk op getallenlijn – slepen',        groep: 'Basis',        gen: genB01c },
  { id: 'B.1',   titel: 'Breuken vereenvoudigen',                groep: 'Rekenen',      gen: genB1   },
  { id: 'B.3',   titel: 'Breuken gelijknamig maken',             groep: 'Rekenen',      gen: genB3   },
  { id: 'B.5',   titel: 'Enkelvoudige breuken optellen',         groep: 'Rekenen',      gen: genB5   },
  { id: 'B.6',   titel: 'Gemengde breuken optellen',             groep: 'Rekenen',      gen: genB6   },
  { id: 'B.7',   titel: 'Enkelvoudige breuken aftrekken',        groep: 'Rekenen',      gen: genB7   },
  { id: 'B.8',   titel: 'Gemengde breuken aftrekken',            groep: 'Rekenen',      gen: genB8   },
  { id: 'B.9',   titel: 'Enkelvoudige breuken vermenigvuldigen', groep: 'Rekenen',      gen: genB9   },
  { id: 'B.10',  titel: 'Gemengde breuken vermenigvuldigen',     groep: 'Rekenen',      gen: genB10  },
  { id: 'B.11',  titel: 'Enkelvoudige breuken delen',            groep: 'Rekenen',      gen: genB11  },
  { id: 'B.12',  titel: 'Gemengde breuken delen',                groep: 'Rekenen',      gen: genB12  },
  { id: 'BP.1',  titel: 'Breuk → percentage',                    groep: 'Omrekenen',    gen: genBP1  },
  { id: 'BP.2',  titel: 'Percentage → breuk',                    groep: 'Omrekenen',    gen: genBP2  },
  { id: 'BD.1',  titel: 'Breuk → decimaal getal',                groep: 'Omrekenen',    gen: genBD1  },
  { id: 'BD.2',  titel: 'Decimaal getal → breuk',                groep: 'Omrekenen',    gen: genBD2  },
  { id: 'BV.1',  titel: 'Verhouding → breuk',                    groep: 'Verhoudingen', gen: genBV1  },
  { id: 'BV.2',  titel: 'Breuk → verhouding',                    groep: 'Verhoudingen', gen: genBV2  },

  /* ── G-doelen (Gehele getallen) ──────────────────────────────────── */
  { id: 'G.1',  titel: 'Natuurlijke getallen optellen',               groep: 'Getallen', gen: genG1  },
  { id: 'G.2',  titel: 'Natuurlijke getallen aftrekken',              groep: 'Getallen', gen: genG2  },
  { id: 'G.3',  titel: 'Natuurlijke getallen vermenigvuldigen',       groep: 'Getallen', gen: genG3  },
  { id: 'G.4',  titel: 'Natuurlijke getallen delen',                  groep: 'Getallen', gen: genG4  },
  { id: 'G.5',  titel: 'Positieve getallen kwadrateren',              groep: 'Getallen', gen: genG5  },
  { id: 'G.6',  titel: 'Worteltrekken van positieve getallen',        groep: 'Getallen', gen: genG6  },
  { id: 'G.14', titel: 'Machtsverheffen van positieve getallen',      groep: 'Getallen', gen: genG14 },
  { id: 'G.7',  titel: 'Negatieve getallen vergelijken',              groep: 'Getallen', gen: genG7  },
  { id: 'G.8',  titel: 'Negatieve gehele getallen optellen',          groep: 'Getallen', gen: genG8  },
  { id: 'G.9',  titel: 'Negatieve gehele getallen aftrekken',         groep: 'Getallen', gen: genG9  },
  { id: 'G.10', titel: 'Negatieve gehele getallen vermenigvuldigen',  groep: 'Getallen', gen: genG10 },
  { id: 'G.11', titel: 'Negatieve gehele getallen delen',             groep: 'Getallen', gen: genG11 },
  { id: 'G.12', titel: 'Gehele getallen kwadrateren',                 groep: 'Getallen', gen: genG12 },
  { id: 'G.15', titel: 'Machtsverheffen van gehele getallen',         groep: 'Getallen', gen: genG15 },
  { id: 'G.16', titel: 'Eigenschappen van natuurlijke getallen',      groep: 'Getallen', gen: genG16 },
  {
    id: 'H.G1tot6', titel: 'Natuurlijke getallen – afwisselend', groep: 'Getallen',
    gen: () => { const q = pick([genG1,genG2,genG3,genG4,genG5,genG6])(); q.leerdoel='H.G1tot6'; return q; }
  },
  {
    id: 'H.G8tot13', titel: 'Negatieve getallen – afwisselend', groep: 'Getallen',
    gen: () => { const q = pick([genG6,genG8,genG9,genG10,genG11,genG12])(); q.leerdoel='H.G8tot13'; return q; }
  },
  { id: 'C.natGetallen',   titel: 'Nat. getallen – gecombineerd (basis)',          groep: 'Getallen', gen: genC_natGetallen   },
  { id: 'C.natGetallen.b', titel: 'Nat. getallen – gecombineerd (kwadraten/wortels)', groep: 'Getallen', gen: genC_natGetallen_b },
  { id: 'C.natGetallen.c', titel: 'Nat. getallen – gecombineerd (+ machten)',         groep: 'Getallen', gen: genC_natGetallen_c },
  { id: 'C.negGetallen',   titel: 'Negatieve getallen – gecombineerd (basis)',          groep: 'Getallen', gen: genC_negGetallen   },
  { id: 'C.negGetallen.b', titel: 'Neg. getallen – gecombineerd (kwadraten)',          groep: 'Getallen', gen: genC_negGetallen_b },
  { id: 'C.negGetallen.c', titel: 'Neg. getallen – gecombineerd (+ machten)',          groep: 'Getallen', gen: genC_negGetallen_c },

  /* ── H-doelen (husseldoelen) ──────────────────────────────────────── */
  {
    id: 'H.B5678', titel: 'Optellen en aftrekken – afwisselend', groep: 'Gemengd',
    gen: () => { const q = pick([genB5,genB6,genB7,genB8])(); q.leerdoel='H.B5678'; return q; }
  },
  {
    id: 'H.B9to12', titel: 'Vermenigvuldigen en delen – afwisselend', groep: 'Gemengd',
    gen: () => { const q = pick([genB9,genB10,genB11,genB12])(); q.leerdoel='H.B9to12'; return q; }
  },
  {
    id: 'H.allBreuk', titel: 'Alle breukbewerkingen – afwisselend', groep: 'Gemengd',
    gen: () => { const q = pick([genB5,genB6,genB7,genB8,genB9,genB10,genB11,genB12])(); q.leerdoel='H.allBreuk'; return q; }
  },
  {
    id: 'H.omrekenen', titel: 'Omrekenen – afwisselend', groep: 'Gemengd',
    gen: () => { const q = pick([genBP1,genBP2,genBD1,genBD2,genBV1,genBV2])(); q.leerdoel='H.omrekenen'; return q; }
  },

  /* ── C-doelen (combinatiedoelen) ──────────────────────────────────── */
  {
    id: 'C.allBreuk', titel: 'Alle breukbewerkingen – gecombineerd', groep: 'Gemengd',
    gen: genC_allBreuk
  },

  /* ── Procenten berekenen ─────────────────────────────────────────── */
  { id: 'P.1a', titel: 'Hoeveel % is X van Y (netjes)',         groep: 'Procenten', gen: genP1a },
  { id: 'P.1b', titel: 'Hoeveel % is X van Y (decimalen)',      groep: 'Procenten', gen: genP1b },
  { id: 'P.2a', titel: 'Geheel bij deel en % (netjes)',          groep: 'Procenten', gen: genP2a },
  { id: 'P.2b', titel: 'Geheel bij deel en % (decimalen)',       groep: 'Procenten', gen: genP2b },
  { id: 'P.3a', titel: 'Procentuele verandering (met hints)',    groep: 'Procenten', gen: genP3a },
  { id: 'P.3b', titel: 'Procentuele verandering (leeg)',         groep: 'Procenten', gen: genP3b },
  { id: 'P.4a', titel: 'Nieuwe waarde na toename (netjes)',      groep: 'Procenten', gen: genP4a },
  { id: 'P.4b', titel: 'Nieuwe waarde na toename (decimalen)',   groep: 'Procenten', gen: genP4b },
  { id: 'P.5a', titel: 'Nieuwe waarde na afname (netjes)',       groep: 'Procenten', gen: genP5a },
  { id: 'P.5b', titel: 'Nieuwe waarde na afname (decimalen)',    groep: 'Procenten', gen: genP5b },
  { id: 'P.6a', titel: 'Oorspronkelijk bij toename (netjes)',    groep: 'Procenten', gen: genP6a },
  { id: 'P.6b', titel: 'Oorspronkelijk bij toename (decimalen)', groep: 'Procenten', gen: genP6b },
  { id: 'P.7a', titel: 'Oorspronkelijk bij afname (netjes)',     groep: 'Procenten', gen: genP7a },
  { id: 'P.7b', titel: 'Oorspronkelijk bij afname (decimalen)',  groep: 'Procenten', gen: genP7b },
  { id: 'P.8a', titel: 'Opeenvolgende toe-/afnames (netjes)',    groep: 'Procenten', gen: genP8a },
  { id: 'P.8b', titel: 'Opeenvolgende toe-/afnames (decimalen)', groep: 'Procenten', gen: genP8b },
  {
    id: 'H.P1tot7', titel: 'Procenten – afwisselend (P.1–P.7)', groep: 'Procenten',
    gen: genH_P1tot7
  },

  /* ── Procenten omrekenen ─────────────────────────────────────────── */
  { id: 'DP.1', titel: 'Percentage → decimaal',   groep: 'Procenten omrekenen', gen: genDP1 },
  { id: 'DP.2', titel: 'Decimaal → percentage',   groep: 'Procenten omrekenen', gen: genDP2 },
  { id: 'PV.1', titel: 'Verhouding → percentage', groep: 'Procenten omrekenen', gen: genPV1 },
  { id: 'PV.2', titel: 'Percentage → verhouding', groep: 'Procenten omrekenen', gen: genPV2 },

  /* ── Eenheden omrekenen ──────────────────────────────────────────── */
  { id: 'E.T1a',      titel: 'Tijdseenheden – uur, min, sec',            groep: 'Eenheden', gen: genET1a },
  { id: 'E.T1b',      titel: 'Tijdseenheden – dag en week',              groep: 'Eenheden', gen: genET1b },
  { id: 'E.T1c',      titel: 'Tijdseenheden – gecombineerd',             groep: 'Eenheden', gen: genET1c },
  { id: 'E.L1a',      titel: 'Lengtematen – mm, cm, dm, m',              groep: 'Eenheden', gen: genEL1a },
  { id: 'E.L1b',      titel: 'Lengtematen – m, dam, hm, km',             groep: 'Eenheden', gen: genEL1b },
  { id: 'E.L1c',      titel: 'Lengtematen – gecombineerd mm – km',       groep: 'Eenheden', gen: genEL1c },
  { id: 'E.O1a',      titel: 'Oppervlaktematen – mm², cm², dm², m²',     groep: 'Eenheden', gen: genEO1a },
  { id: 'E.O1b',      titel: 'Oppervlaktematen – ha, are, km²',          groep: 'Eenheden', gen: genEO1b },
  { id: 'E.O1c',      titel: 'Oppervlaktematen – gecombineerd m² – km²', groep: 'Eenheden', gen: genEO1c },
  { id: 'E.I1',       titel: 'Inhoudsmaten – mL, cL, dL, L, dm³',       groep: 'Eenheden', gen: genEI1 },
  { id: 'E.S1',       titel: 'Snelheden – m/s en km/h',                groep: 'Eenheden', gen: genES1 },
  { id: 'H.Eenheden', titel: 'Eenheden – afwisselend',                 groep: 'Eenheden', gen: genH_Eenheden },

  /* ── Algebra ─────────────────────────────────────────────────────── */
  { id: 'A.O1a', titel: 'Algebra – optellen/aftrekken (a)',            groep: 'Algebra', gen: genAO1a },
  { id: 'A.O1b', titel: 'Algebra – optellen/aftrekken (b)',            groep: 'Algebra', gen: genAO1b },
  { id: 'A.O1c', titel: 'Algebra – optellen/aftrekken (c)',            groep: 'Algebra', gen: genAO1c },
  { id: 'A.V1a', titel: 'Algebra – vermenigvuldigen (a)',              groep: 'Algebra', gen: genAV1a },
  { id: 'A.V1b', titel: 'Algebra – vermenigvuldigen (b)',              groep: 'Algebra', gen: genAV1b },
  { id: 'A.V1c', titel: 'Algebra – vermenigvuldigen (c)',              groep: 'Algebra', gen: genAV1c },
  { id: 'A.M1a', titel: 'Algebra – gemengd (a)',                       groep: 'Algebra', gen: genAM1a },
  { id: 'A.M1b', titel: 'Algebra – gemengd (b)',                       groep: 'Algebra', gen: genAM1b },
  { id: 'A.D1a', titel: 'Algebra – delen (a)',                         groep: 'Algebra', gen: genAD1a },
  { id: 'A.D1b', titel: 'Algebra – delen (b)',                         groep: 'Algebra', gen: genAD1b },
  { id: 'A.H1a', titel: 'Algebra – haakjes uitwerken (a)',             groep: 'Algebra', gen: genAH1a },
  { id: 'A.H1b', titel: 'Algebra – haakjes uitwerken (b)',             groep: 'Algebra', gen: genAH1b },
  { id: 'A.H1c', titel: 'Algebra – haakjes uitwerken (c)',             groep: 'Algebra', gen: genAH1c },
  { id: 'A.H1d', titel: 'Algebra – merkwaardige producten uitwerken',  groep: 'Algebra', gen: genAH1d },
  { id: 'A.F1a', titel: 'Algebra – ontbinden: ggd factoring',          groep: 'Algebra', gen: genAF1a },
  { id: 'A.F1b', titel: 'Algebra – ontbinden: som-product',            groep: 'Algebra', gen: genAF1b },
  { id: 'A.F1c', titel: 'Algebra – ontbinden: merkwaardige producten', groep: 'Algebra', gen: genAF1c },
  { id: 'A.MV1a', titel: 'Algebra – machtsverheffen: productregel',    groep: 'Algebra', gen: genAMV1a },
  { id: 'A.MV1b', titel: 'Algebra – machtsverheffen: machtsverheffing',groep: 'Algebra', gen: genAMV1b },
  { id: 'A.MV1c', titel: 'Algebra – machtsverheffen: quotiëntregel',   groep: 'Algebra', gen: genAMV1c },
  { id: 'A.MV1d', titel: 'Algebra – machtsverheffen: gecombineerd',    groep: 'Algebra', gen: genAMV1d },
  { id: 'L.G1a',  titel: 'Lineair – grafiek tekenen: eenvoudig',      groep: 'Lineair', gen: genLG1a  },
  { id: 'L.G1b',  titel: 'Lineair – grafiek tekenen: gevorderd',      groep: 'Lineair', gen: genLG1b  },
  { id: 'L.G2a',  titel: 'Lineair – grafiek bij tabel: eenvoudig',    groep: 'Lineair', gen: genLG2a  },
  { id: 'L.G2b',  titel: 'Lineair – grafiek bij tabel: gevorderd',    groep: 'Lineair', gen: genLG2b  },
  { id: 'L.G1c',  titel: 'Lineair – grafiek bij formule: var. assen', groep: 'Lineair', gen: genLG1c  },
  { id: 'L.G2c',  titel: 'Lineair – grafiek bij tabel: var. assen',   groep: 'Lineair', gen: genLG2c  },
  { id: 'L.F1a',  titel: 'Lineair – formule bij grafiek: eenvoudig',  groep: 'Lineair', gen: genLF1a  },
  { id: 'L.F1b',  titel: 'Lineair – formule bij grafiek: gevorderd',  groep: 'Lineair', gen: genLF1b  },
  { id: 'L.F1c',  titel: 'Lineair – formule bij grafiek: var. assen', groep: 'Lineair', gen: genLF1c  },
  { id: 'L.F2a',  titel: 'Lineair – formule bij tabel: eenvoudig',    groep: 'Lineair', gen: genLF2a  },
  { id: 'L.F2b',  titel: 'Lineair – formule bij tabel: gevorderd',    groep: 'Lineair', gen: genLF2b  },
  { id: 'L.F2c',  titel: 'Lineair – formule bij tabel: var. assen',   groep: 'Lineair', gen: genLF2c  },
  { id: 'L.V1a',  titel: 'Lineair – vergelijking: 1-stap',            groep: 'Lineair', gen: genLV1a  },
  { id: 'L.V1b',  titel: 'Lineair – vergelijking: 2-stap',            groep: 'Lineair', gen: genLV1b  },
  { id: 'L.V1c',  titel: 'Lineair – vergelijking: met haakjes',       groep: 'Lineair', gen: genLV1c  },
  { id: 'L.O1a',  titel: 'Lineair – ongelijkheid: 1-stap',            groep: 'Lineair', gen: genLO1a  },
  { id: 'L.O1b',  titel: 'Lineair – ongelijkheid: 2-stap',            groep: 'Lineair', gen: genLO1b  },
  { id: 'L.O1c',  titel: 'Lineair – ongelijkheid: met haakjes',       groep: 'Lineair', gen: genLO1c  },

  /* ── M.V-doelen (Machtsvergelijkingen) ─────────────────────────────── */
  { id: 'M.V1a', titel: 'Machtsvergelijking: directe wortel (x^n = c)',          groep: 'Machtsverbanden', gen: genMV1a },
  { id: 'M.V1b', titel: 'Machtsvergelijking: met vermenigvuldiging (ax^n = c)',  groep: 'Machtsverbanden', gen: genMV1b },
  { id: 'M.V1c', titel: 'Machtsvergelijking: met optellen/aftrekken',            groep: 'Machtsverbanden', gen: genMV1c },
  { id: 'M.V1d', titel: 'Machtsvergelijking: met haakjes',                       groep: 'Machtsverbanden', gen: genMV1d },
  { id: 'M.V2a', titel: 'Machtsvergelijking: x³-vorm (factoriseren)',            groep: 'Machtsverbanden', gen: genMV2a },
  { id: 'M.V2b', titel: 'Machtsvergelijking: x⁴-vorm (substitutie u = x²)',     groep: 'Machtsverbanden', gen: genMV2b },

  /* ── K-doelen (Kwadratische verbanden) ───────────────────────────────────── */
  { id: 'K.A1a', titel: 'Kwadratisch – ax² = c',                                   groep: 'Kwadratisch', gen: genKWA },
  { id: 'K.B1a', titel: 'Kwadratisch – ax² = bx (gemeenschappelijke factor)',       groep: 'Kwadratisch', gen: genKWB },
  { id: 'K.C1a', titel: 'Kwadratisch – ax² + bx + c = 0 (product-som)',            groep: 'Kwadratisch', gen: genKWC },
  { id: 'K.D1a', titel: 'Kwadratisch – abc-formule (decimaal afronden)',            groep: 'Kwadratisch', gen: genKWD },
  { id: 'K.E1a', titel: 'Kwadratisch – abc-formule (exact antwoord)',               groep: 'Kwadratisch', gen: genKWE },

  /* ── S-doelen (Stelsels vergelijkingen) ─────────────────────────────── */
  { id: 'S.1a', titel: 'Stelsel – direct optellen of aftrekken',    groep: 'Lineair', gen: genStelselE },
  { id: 'S.1b', titel: 'Stelsel – eerst vermenigvuldigen',          groep: 'Lineair', gen: genStelselB },
  { id: 'S.1c', titel: 'Stelsel – één vergelijking in y=ax+b-vorm', groep: 'Lineair', gen: genStelselC },
];

function generateVraag(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld) throw new Error('Onbekend leerdoel: ' + leerdoelId);
  return ld.gen();
}
