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

/* ── G.13 – Worteltrekken van gehele getallen ───────────────────────── */
function genG13() {
  const n = rand(2, 15);
  const sq = n * n;
  return {
    id: uid(), leerdoel: 'G.13',
    vraag: `Bereken: $\\sqrt{${sq}}$`,
    antwoordType: 'integer', antwoord: { waarde: n }, data: { n, sq },
    hints: [
      `Vraag: welk geheel getal × zichzelf geeft ${sq}?`,
      `$${n} \\times ${n} = ${sq}$, dus $\\sqrt{${sq}} = ${n}$`
    ],
    oplossing: `$\\sqrt{${sq}} = ${n}$ (want $${n}^2 = ${sq}$)`
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
  if (inclSqrt) types.push('sq', 'sq'); // (-n)^2 = positief
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
  { id: 'G.13', titel: 'Worteltrekken van gehele getallen',           groep: 'Getallen', gen: genG13 },
  { id: 'G.15', titel: 'Machtsverheffen van gehele getallen',         groep: 'Getallen', gen: genG15 },
  { id: 'G.16', titel: 'Eigenschappen van natuurlijke getallen',      groep: 'Getallen', gen: genG16 },
  {
    id: 'H.G1tot6', titel: 'Natuurlijke getallen – afwisselend', groep: 'Getallen',
    gen: () => { const q = pick([genG1,genG2,genG3,genG4,genG5,genG6])(); q.leerdoel='H.G1tot6'; return q; }
  },
  {
    id: 'H.G8tot13', titel: 'Negatieve getallen – afwisselend', groep: 'Getallen',
    gen: () => { const q = pick([genG8,genG9,genG10,genG11,genG12,genG13])(); q.leerdoel='H.G8tot13'; return q; }
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
];

function generateVraag(leerdoelId) {
  const ld = LEERDOELEN.find(l => l.id === leerdoelId);
  if (!ld) throw new Error('Onbekend leerdoel: ' + leerdoelId);
  return ld.gen();
}
