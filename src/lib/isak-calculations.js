// ISAK Level 1 Calculations

export function calcSum6(ev) {
  return (ev.pliegue_triceps || 0) + (ev.pliegue_subescapular || 0) +
    (ev.pliegue_supraespinal || 0) + (ev.pliegue_abdominal || 0) +
    (ev.pliegue_muslo || 0) + (ev.pliegue_pantorrilla || 0);
}

export function calcSum8(ev) {
  return calcSum6(ev) + (ev.pliegue_biceps || 0) + (ev.pliegue_cresta_iliaca || 0);
}

// Durnin-Womersley body fat %
export function calcBodyFat(ev) {
  const sum4 = (ev.pliegue_biceps || 0) + (ev.pliegue_triceps || 0) +
    (ev.pliegue_subescapular || 0) + (ev.pliegue_cresta_iliaca || 0);
  if (sum4 === 0) return 0;
  const logSum = Math.log10(sum4);
  const age = ev.edad || 25;
  let density;
  if (ev.sexo === 'masculino') {
    if (age < 20) density = 1.1620 - 0.0630 * logSum;
    else if (age < 30) density = 1.1631 - 0.0632 * logSum;
    else if (age < 40) density = 1.1422 - 0.0544 * logSum;
    else if (age < 50) density = 1.1620 - 0.0700 * logSum;
    else density = 1.1715 - 0.0779 * logSum;
  } else {
    if (age < 20) density = 1.1549 - 0.0678 * logSum;
    else if (age < 30) density = 1.1599 - 0.0717 * logSum;
    else if (age < 40) density = 1.1423 - 0.0632 * logSum;
    else if (age < 50) density = 1.1333 - 0.0612 * logSum;
    else density = 1.1339 - 0.0645 * logSum;
  }
  return (4.95 / density - 4.5) * 100;
}

// IMC
export function calcIMC(peso, talla) {
  if (!peso || !talla) return 0;
  const tallaMt = talla / 100;
  return peso / (tallaMt * tallaMt);
}

// Heath-Carter Somatotype
export function calcEndomorfia(ev) {
  const sumPL = ((ev.pliegue_triceps || 0) + (ev.pliegue_subescapular || 0) +
    (ev.pliegue_supraespinal || 0)) * (170.18 / (ev.talla || 170));
  return -0.7182 + 0.1451 * sumPL - 0.00068 * sumPL * sumPL + 0.0000014 * sumPL * sumPL * sumPL;
}

export function calcMesomorfia(ev) {
  const dHumero = ev.diametro_humero || 0;
  const dFemur = ev.diametro_femur || 0;
  const pBrazoFlex = ev.perimetro_brazo_flexionado || 0;
  const pPantorrilla = ev.perimetro_pantorrilla || 0;
  const plTriceps = ev.pliegue_triceps || 0;
  const plPantorrilla = ev.pliegue_pantorrilla || 0;
  const talla = ev.talla || 170;
  return 0.858 * dHumero + 0.601 * dFemur +
    0.188 * (pBrazoFlex - plTriceps / 10) +
    0.161 * (pPantorrilla - plPantorrilla / 10) -
    0.131 * talla + 4.5;
}

export function calcEctomorfia(ev) {
  const peso = ev.peso || 70;
  const talla = ev.talla || 170;
  const ipp = talla / Math.pow(peso, 0.333);
  if (ipp >= 40.75) return 0.732 * ipp - 28.58;
  if (ipp >= 38.25) return 0.463 * ipp - 17.63;
  return 0.1;
}

export function getSomatotipoText(endo, meso, ecto) {
  const max = Math.max(endo, meso, ecto);
  if (max === meso) {
    if (endo > ecto) return 'Endo-Mesomorfo';
    if (ecto > endo) return 'Ecto-Mesomorfo';
    return 'Mesomorfo Balanceado';
  }
  if (max === endo) {
    if (meso > ecto) return 'Meso-Endomorfo';
    return 'Endo-Ectomorfo';
  }
  if (meso > endo) return 'Meso-Ectomorfo';
  return 'Endo-Ectomorfo';
}

// TMB Mifflin-St Jeor
export function calcTMB(peso, talla, edad, sexo) {
  const base = 10 * peso + 6.25 * talla - 5 * edad;
  return sexo === 'masculino' ? base + 5 : base - 161;
}

// TDEE
const activityFactors = {
  sedentario: 1.2, ligero: 1.375, moderado: 1.55, intenso: 1.725, muy_intenso: 1.9
};

export function calcTDEE(tmb, activityLevel) {
  return tmb * (activityFactors[activityLevel] || 1.55);
}

// Macros
export function calcMacros(tdee, goal) {
  const targets = {
    deficit: { kcal: tdee - 500, carbs: 0.40, protein: 0.35, fat: 0.25 },
    mantenimiento: { kcal: tdee, carbs: 0.45, protein: 0.30, fat: 0.25 },
    superavit: { kcal: tdee + 300, carbs: 0.50, protein: 0.30, fat: 0.20 },
  };
  const t = targets[goal] || targets.mantenimiento;
  return {
    kcal: Math.round(t.kcal),
    carbs_g: Math.round((t.kcal * t.carbs) / 4),
    protein_g: Math.round((t.kcal * t.protein) / 4),
    fat_g: Math.round((t.kcal * t.fat) / 9),
    carbs_pct: Math.round(t.carbs * 100),
    protein_pct: Math.round(t.protein * 100),
    fat_pct: Math.round(t.fat * 100),
  };
}

// 1RM Epley
export function calc1RM(peso, reps) {
  if (reps <= 0 || peso <= 0) return 0;
  if (reps === 1) return peso;
  return Math.round(peso * (1 + reps / 30));
}

// Process evaluation - compute all derived fields
export function processEvaluation(ev, student) {
  const sum6 = calcSum6(ev);
  const sum8 = calcSum8(ev);
  const grasa_pct = calcBodyFat(ev);
  const imc = calcIMC(ev.peso, ev.talla);
  const masa_grasa = (ev.peso || 0) * grasa_pct / 100;
  const masa_libre_grasa = (ev.peso || 0) - masa_grasa;
  const endomorfia = calcEndomorfia(ev);
  const mesomorfia = calcMesomorfia(ev);
  const ectomorfia = calcEctomorfia(ev);
  const somatotipo_text = getSomatotipoText(endomorfia, mesomorfia, ectomorfia);
  const tmb = calcTMB(ev.peso || 70, ev.talla || 170, ev.edad || 25, ev.sexo || 'masculino');
  const tdee = calcTDEE(tmb, student?.activity_level || 'moderado');

  return {
    ...ev,
    sum_6_pliegues: Math.round(sum6 * 10) / 10,
    sum_8_pliegues: Math.round(sum8 * 10) / 10,
    grasa_pct: Math.round(grasa_pct * 10) / 10,
    imc: Math.round(imc * 10) / 10,
    masa_grasa: Math.round(masa_grasa * 10) / 10,
    masa_libre_grasa: Math.round(masa_libre_grasa * 10) / 10,
    endomorfia: Math.round(endomorfia * 10) / 10,
    mesomorfia: Math.round(mesomorfia * 10) / 10,
    ectomorfia: Math.round(ectomorfia * 10) / 10,
    somatotipo_text,
    tmb: Math.round(tmb),
    tdee: Math.round(tdee),
  };
}