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

/* ── Leerdoel registry ───────────────────────────────────────────────── */
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
];

function generateVraag(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld) throw new Error('Onbekend leerdoel: ' + leerdoelId);
  return ld.gen();
}
