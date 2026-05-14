// Datos de ejercicios enriquecidos para importación masiva
// Organizados por grupo muscular con variantes por equipamiento

export const MUSCLE_GROUPS = {
  pecho: { label: 'Pecho', color: '#FF4D00', muscles_3d: ['pectoral_mayor', 'pectoral_menor'] },
  espalda: { label: 'Espalda', color: '#FFB800', muscles_3d: ['dorsal_ancho', 'trapecio', 'romboides', 'redondo_mayor'] },
  hombros: { label: 'Hombros', color: '#00C896', muscles_3d: ['deltoides_anterior', 'deltoides_lateral', 'deltoides_posterior'] },
  biceps: { label: 'Bíceps', color: '#4D79FF', muscles_3d: ['biceps_brachii', 'braquial', 'braquioradial'] },
  triceps: { label: 'Tríceps', color: '#FF4DFF', muscles_3d: ['triceps_lateral', 'triceps_medial', 'triceps_largo'] },
  cuadriceps: { label: 'Cuádriceps', color: '#FF8C00', muscles_3d: ['recto_femoral', 'vasto_lateral', 'vasto_medial', 'vasto_intermedio'] },
  gluteos_isquios: { label: 'Glúteos/Isquios', color: '#FF1493', muscles_3d: ['gluteo_mayor', 'gluteo_medio', 'biceps_femoral', 'semitendinoso'] },
  pantorrillas: { label: 'Pantorrillas', color: '#00BFFF', muscles_3d: ['gastrocnemio', 'soleo'] },
  core: { label: 'Core/Abdomen', color: '#7FFF00', muscles_3d: ['recto_abdominal', 'oblicuo_externo', 'transverso'] },
  antebrazos: { label: 'Antebrazos', color: '#DEB887', muscles_3d: ['flexores_antebrazo', 'extensores_antebrazo'] },
  full_body: { label: 'Full Body', color: '#FFFFFF', muscles_3d: [] },
};

export const EQUIPMENT_TYPES = [
  { value: 'barra', label: '🏋️ Barra olímpica' },
  { value: 'mancuernas', label: '💪 Mancuernas' },
  { value: 'maquina', label: '⚙️ Máquina' },
  { value: 'cable', label: '🔗 Cable/Polea' },
  { value: 'bandas', label: '🟡 Bandas elásticas' },
  { value: 'peso_corporal', label: '🤸 Peso corporal' },
  { value: 'kettlebell', label: '🔔 Kettlebell' },
  { value: 'trx', label: '🪢 TRX' },
  { value: 'smith', label: '🏗️ Smith Machine' },
  { value: 'disco', label: '⭕ Disco de peso' },
];

export const INTENSITY_TECHNIQUES = [
  { value: 'normal', label: 'Normal', description: 'Entrenamiento estándar con series y repeticiones convencionales.' },
  { value: 'drop_set', label: 'Drop Set', description: 'Al fallo, reduce el peso 20-30% y continúa sin descanso. Aumenta el reclutamiento de fibras musculares.' },
  { value: 'super_set', label: 'Super Set / Tri-set', description: 'Dos o tres ejercicios consecutivos sin descanso entre ellos. Maximiza el tiempo bajo tensión.' },
  { value: 'rest_pause', label: 'Rest-Pause', description: 'Al fallo, descansa 15-20 seg y continúa con más reps. Aumenta el volumen total por serie.' },
  { value: 'negativas', label: 'Negativas / Excéntricas', description: 'Énfasis en la fase excéntrica (4-6 seg bajando). Mayor daño muscular y estímulo de hipertrofia.' },
  { value: 'isometrico', label: 'Isométrico', description: 'Mantén la contracción en el punto de mayor tensión 3-5 seg. Aumenta la activación neural.' },
  { value: '21_reps', label: '21 Repeticiones (7+7+7)', description: '7 reps en rango inferior, 7 en rango superior, 7 completas. Máxima congestión muscular.' },
  { value: 'parciales', label: 'Repeticiones Parciales', description: 'Reps en el rango de mayor tensión mecánica. Útil para superar puntos de estancamiento.' },
  { value: 'pre_exhaustion', label: 'Pre-Exhaustión', description: 'Ejercicio de aislamiento antes del compuesto. Fuerza al músculo objetivo a trabajar más.' },
  { value: 'cluster_sets', label: 'Cluster Sets', description: 'Mini-descansos de 10-15 seg dentro de la serie. Permite más reps con cargas más pesadas.' },
  { value: 'myo_reps', label: 'Myo-Reps', description: 'Serie de activación al fallo + series de 3-5 reps con 3-5 seg descanso. Alta eficiencia de estímulo.' },
  { value: '1_5_reps', label: '1.5 Reps', description: 'Rep completa + media rep extra en el punto de mayor tensión. Duplica el tiempo bajo tensión.' },
  { value: 'occlusion', label: 'Occlusion Training', description: 'Restricción de flujo sanguíneo con bandas. Alto estímulo con cargas bajas (30-40% 1RM).' },
];

export const ENVIRONMENTS = [
  { value: 'gym', label: '🏋️ Gym' },
  { value: 'casa', label: '🏠 Casa' },
  { value: 'ambos', label: '🔄 Ambos' },
];

export const MUSCLE_SVG_MAP = {
  // Anterior
  pectoral_mayor: { view: 'anterior', cx: 160, cy: 180, rx: 55, ry: 35, label: 'Pectoral Mayor' },
  pectoral_menor: { view: 'anterior', cx: 160, cy: 165, rx: 30, ry: 20, label: 'Pectoral Menor' },
  deltoides_anterior: { view: 'anterior', cx: 95, cy: 175, rx: 20, ry: 25, label: 'Deltoides Anterior', right: { cx: 225, cy: 175 } },
  deltoides_lateral: { view: 'anterior', cx: 82, cy: 185, rx: 15, ry: 20, label: 'Deltoides Lateral', right: { cx: 238, cy: 185 } },
  biceps_brachii: { view: 'anterior', cx: 85, cy: 235, rx: 18, ry: 35, label: 'Bíceps', right: { cx: 235, cy: 235 } },
  braquial: { view: 'anterior', cx: 85, cy: 258, rx: 14, ry: 20, label: 'Braquial', right: { cx: 235, cy: 258 } },
  braquioradial: { view: 'anterior', cx: 83, cy: 295, rx: 12, ry: 28, label: 'Braquioradial', right: { cx: 237, cy: 295 } },
  recto_abdominal: { view: 'anterior', cx: 160, cy: 255, rx: 28, ry: 55, label: 'Recto Abdominal' },
  oblicuo_externo: { view: 'anterior', cx: 120, cy: 265, rx: 22, ry: 40, label: 'Oblicuo Ext', right: { cx: 200, cy: 265 } },
  transverso: { view: 'anterior', cx: 160, cy: 285, rx: 35, ry: 20, label: 'Transverso' },
  recto_femoral: { view: 'anterior', cx: 135, cy: 380, rx: 22, ry: 55, label: 'Recto Femoral', right: { cx: 185, cy: 380 } },
  vasto_lateral: { view: 'anterior', cx: 120, cy: 390, rx: 18, ry: 50, label: 'Vasto Lateral', right: { cx: 200, cy: 390 } },
  vasto_medial: { view: 'anterior', cx: 148, cy: 400, rx: 16, ry: 40, label: 'Vasto Medial', right: { cx: 172, cy: 400 } },
  vasto_intermedio: { view: 'anterior', cx: 135, cy: 395, rx: 14, ry: 45, label: 'Vasto Intermedio', right: { cx: 185, cy: 395 } },
  gastrocnemio: { view: 'anterior', cx: 130, cy: 510, rx: 15, ry: 35, label: 'Gastrocnemio', right: { cx: 190, cy: 510 } },
  soleo: { view: 'anterior', cx: 130, cy: 530, rx: 12, ry: 25, label: 'Sóleo', right: { cx: 190, cy: 530 } },
  flexores_antebrazo: { view: 'anterior', cx: 80, cy: 315, rx: 11, ry: 30, label: 'Flex. Antebrazo', right: { cx: 240, cy: 315 } },
  // Posterior
  trapecio: { view: 'posterior', cx: 160, cy: 155, rx: 55, ry: 30, label: 'Trapecio' },
  dorsal_ancho: { view: 'posterior', cx: 120, cy: 220, rx: 38, ry: 50, label: 'Dorsal Ancho', right: { cx: 200, cy: 220 } },
  romboides: { view: 'posterior', cx: 160, cy: 185, rx: 28, ry: 28, label: 'Romboides' },
  redondo_mayor: { view: 'posterior', cx: 105, cy: 215, rx: 20, ry: 18, label: 'Redondo Mayor', right: { cx: 215, cy: 215 } },
  deltoides_posterior: { view: 'posterior', cx: 95, cy: 175, rx: 20, ry: 22, label: 'Deltoides Post', right: { cx: 225, cy: 175 } },
  triceps_lateral: { view: 'posterior', cx: 85, cy: 235, rx: 16, ry: 32, label: 'Tríceps Lateral', right: { cx: 235, cy: 235 } },
  triceps_medial: { view: 'posterior', cx: 88, cy: 252, rx: 13, ry: 25, label: 'Tríceps Medial', right: { cx: 232, cy: 252 } },
  triceps_largo: { view: 'posterior', cx: 90, cy: 240, rx: 14, ry: 38, label: 'Tríceps Largo', right: { cx: 230, cy: 240 } },
  gluteo_mayor: { view: 'posterior', cx: 148, cy: 325, rx: 35, ry: 38, label: 'Glúteo Mayor', right: { cx: 172, cy: 325 } },
  gluteo_medio: { view: 'posterior', cx: 135, cy: 305, rx: 22, ry: 22, label: 'Glúteo Medio', right: { cx: 185, cy: 305 } },
  biceps_femoral: { view: 'posterior', cx: 135, cy: 390, rx: 18, ry: 48, label: 'Bíceps Femoral', right: { cx: 185, cy: 390 } },
  semitendinoso: { view: 'posterior', cx: 148, cy: 395, rx: 15, ry: 45, label: 'Semitendinoso', right: { cx: 172, cy: 395 } },
  extensores_antebrazo: { view: 'posterior', cx: 82, cy: 310, rx: 11, ry: 30, label: 'Ext. Antebrazo', right: { cx: 238, cy: 310 } },
};

// 50 ejercicios de muestra bien completos (los coaches pueden agregar más desde la UI)
export const SAMPLE_EXERCISES = [
  // PECHO
  { name: 'Press de Banca con Barra', muscle_group: 'pecho', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Pectoral Mayor'], secondary_muscles: ['Deltoides Anterior', 'Tríceps'], muscle_3d_map: ['pectoral_mayor'], secondary_muscles_3d: ['deltoides_anterior', 'triceps_largo'], movement_pattern: 'empuje_horizontal', intensity_technique: 'normal', calories_per_minute: 9, tips: 'Retrae los omóplatos y mantén los pies planos en el suelo.', common_mistakes_list: ['Arquear excesivamente la espalda', 'Rebotar el peso en el pecho', 'Codos en 90°'], instructions_steps: ['Acostado en banco, agarra la barra a ancho de hombros', 'Baja controladamente 3 segundos hasta rozar el pecho', 'Pausa 1 segundo en el pecho', 'Empuja explosivamente hacia arriba'] },
  { name: 'Press de Banca con Mancuernas', muscle_group: 'pecho', equipment_type: 'mancuernas', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Pectoral Mayor'], secondary_muscles: ['Deltoides Anterior', 'Tríceps'], muscle_3d_map: ['pectoral_mayor', 'pectoral_menor'], secondary_muscles_3d: ['deltoides_anterior', 'triceps_lateral'] },
  { name: 'Press Inclinado con Barra', muscle_group: 'pecho', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Pectoral Mayor (zona alta)'], secondary_muscles: ['Deltoides Anterior', 'Tríceps'], muscle_3d_map: ['pectoral_mayor', 'pectoral_menor'], secondary_muscles_3d: ['deltoides_anterior'] },
  { name: 'Press Inclinado con Mancuernas', muscle_group: 'pecho', equipment_type: 'mancuernas', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Pectoral Mayor (alta)'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Press Declinado con Barra', muscle_group: 'pecho', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Pectoral Mayor (baja)'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Apertura con Mancuernas (Flyes)', muscle_group: 'pecho', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor', 'pectoral_menor'], instructions_steps: ['Acostado, brazos extendidos con mancuernas', 'Abre los brazos en arco controladamente', 'Siente el estiramiento en el pecho', 'Cierra los brazos en arco contrayendo el pecho'] },
  { name: 'Apertura en Cable (Crossover)', muscle_group: 'pecho', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Fondos en Paralelas (Pecho)', muscle_group: 'pecho', equipment_type: 'peso_corporal', environment: 'ambos', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-15', primary_muscles: ['Pectoral Mayor', 'Tríceps'], muscle_3d_map: ['pectoral_mayor', 'pectoral_menor'], secondary_muscles_3d: ['triceps_largo'] },
  { name: 'Flexiones de Brazos (Push-ups)', muscle_group: 'pecho', equipment_type: 'peso_corporal', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '15-25', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'], secondary_muscles_3d: ['deltoides_anterior', 'triceps_largo'] },
  { name: 'Flexiones Inclinadas', muscle_group: 'pecho', equipment_type: 'peso_corporal', environment: 'casa', level: 'principiante', metric_type: 'weight_reps', tempo: '2-0-2-0', sets_range: '3', reps_range: '15-20', primary_muscles: ['Pectoral Mayor (alta)'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Press en Máquina de Pecho', muscle_group: 'pecho', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Pec Deck (Máquina de Aperturas)', muscle_group: 'pecho', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3', reps_range: '12-15', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor', 'pectoral_menor'] },
  { name: 'Press con Bandas Elásticas', muscle_group: 'pecho', equipment_type: 'bandas', environment: 'casa', level: 'principiante', metric_type: 'weight_reps', tempo: '2-0-2-0', sets_range: '3', reps_range: '15-20', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Press con Kettlebell', muscle_group: 'pecho', equipment_type: 'kettlebell', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3', reps_range: '10-12', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'] },
  { name: 'Press en Smith Machine Plano', muscle_group: 'pecho', equipment_type: 'smith', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '10-12', primary_muscles: ['Pectoral Mayor'], muscle_3d_map: ['pectoral_mayor'] },
  // ESPALDA
  { name: 'Dominadas (Pull-ups)', muscle_group: 'espalda', equipment_type: 'peso_corporal', environment: 'ambos', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '6-12', primary_muscles: ['Dorsal Ancho'], secondary_muscles: ['Bíceps', 'Romboides'], muscle_3d_map: ['dorsal_ancho'], secondary_muscles_3d: ['biceps_brachii', 'romboides'], tips: 'Retrae las escápulas al inicio del movimiento.' },
  { name: 'Remo con Barra', muscle_group: 'espalda', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Dorsal Ancho', 'Trapecio'], secondary_muscles: ['Bíceps', 'Romboides'], muscle_3d_map: ['dorsal_ancho', 'trapecio', 'romboides'] },
  { name: 'Remo con Mancuerna (1 brazo)', muscle_group: 'espalda', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Dorsal Ancho'], secondary_muscles: ['Bíceps'], muscle_3d_map: ['dorsal_ancho', 'redondo_mayor'] },
  { name: 'Jalón al Pecho en Polea', muscle_group: 'espalda', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Dorsal Ancho'], secondary_muscles: ['Bíceps'], muscle_3d_map: ['dorsal_ancho'], secondary_muscles_3d: ['biceps_brachii'] },
  { name: 'Remo en Cable', muscle_group: 'espalda', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Dorsal Ancho', 'Romboides'], muscle_3d_map: ['dorsal_ancho', 'romboides'] },
  { name: 'Peso Muerto con Barra', muscle_group: 'espalda', equipment_type: 'barra', environment: 'gym', level: 'avanzado', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3-5', reps_range: '4-8', primary_muscles: ['Erector Espinal', 'Dorsal'], secondary_muscles: ['Glúteos', 'Isquiotibiales'], muscle_3d_map: ['dorsal_ancho', 'trapecio'], secondary_muscles_3d: ['gluteo_mayor', 'biceps_femoral'], tips: 'Mantén la espalda neutral durante todo el movimiento.' },
  { name: 'Remo en Máquina', muscle_group: 'espalda', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Dorsal Ancho'], muscle_3d_map: ['dorsal_ancho'] },
  { name: 'Pull-over con Mancuerna', muscle_group: 'espalda', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Dorsal Ancho', 'Pectoral'], muscle_3d_map: ['dorsal_ancho', 'pectoral_mayor'] },
  { name: 'Face Pull en Cable', muscle_group: 'espalda', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '15-20', primary_muscles: ['Deltoides Posterior', 'Trapecio'], muscle_3d_map: ['trapecio', 'romboides'], secondary_muscles_3d: ['deltoides_posterior'] },
  { name: 'Remo TRX', muscle_group: 'espalda', equipment_type: 'trx', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Dorsal Ancho'], muscle_3d_map: ['dorsal_ancho', 'romboides'] },
  // HOMBROS
  { name: 'Press Militar con Barra', muscle_group: 'hombros', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '6-10', primary_muscles: ['Deltoides Anterior'], secondary_muscles: ['Deltoides Lateral', 'Tríceps'], muscle_3d_map: ['deltoides_anterior', 'deltoides_lateral'], secondary_muscles_3d: ['triceps_largo'] },
  { name: 'Press Arnold con Mancuernas', muscle_group: 'hombros', equipment_type: 'mancuernas', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3-4', reps_range: '10-12', primary_muscles: ['Deltoides (completo)'], muscle_3d_map: ['deltoides_anterior', 'deltoides_lateral', 'deltoides_posterior'] },
  { name: 'Elevaciones Laterales con Mancuernas', muscle_group: 'hombros', equipment_type: 'mancuernas', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '12-20', primary_muscles: ['Deltoides Lateral'], muscle_3d_map: ['deltoides_lateral'], tips: 'Eleva hasta la altura del hombro, no más arriba.' },
  { name: 'Elevaciones Laterales en Cable', muscle_group: 'hombros', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Deltoides Lateral'], muscle_3d_map: ['deltoides_lateral'] },
  { name: 'Vuelos Posteriores con Mancuernas', muscle_group: 'hombros', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3', reps_range: '15-20', primary_muscles: ['Deltoides Posterior'], muscle_3d_map: ['deltoides_posterior'] },
  { name: 'Press con Mancuernas Sentado', muscle_group: 'hombros', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '3-0-2-0', sets_range: '3-4', reps_range: '10-12', primary_muscles: ['Deltoides Anterior'], muscle_3d_map: ['deltoides_anterior', 'deltoides_lateral'] },
  // BÍCEPS
  { name: 'Curl con Barra', muscle_group: 'biceps', equipment_type: 'barra', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-3-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Bíceps Brachii'], muscle_3d_map: ['biceps_brachii'], instructions_steps: ['De pie, agarra la barra con supinación', 'Flexiona el codo llevando la barra hacia los hombros', 'Aprieta el bíceps en la cima', 'Baja controladamente en 3 segundos'] },
  { name: 'Curl con Mancuernas Alterno', muscle_group: 'biceps', equipment_type: 'mancuernas', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-3-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Bíceps Brachii', 'Braquial'], muscle_3d_map: ['biceps_brachii', 'braquial'] },
  { name: 'Curl Martillo', muscle_group: 'biceps', equipment_type: 'mancuernas', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '10-15', primary_muscles: ['Braquioradial', 'Bíceps'], muscle_3d_map: ['braquioradial', 'biceps_brachii'] },
  { name: 'Curl en Cable Polea Baja', muscle_group: 'biceps', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Bíceps Brachii'], muscle_3d_map: ['biceps_brachii'] },
  { name: 'Curl en Banco Scott', muscle_group: 'biceps', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3', reps_range: '10-12', primary_muscles: ['Bíceps Brachii (cabeza corta)'], muscle_3d_map: ['biceps_brachii'] },
  { name: 'Curl Concentrado', muscle_group: 'biceps', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-3-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Bíceps Brachii'], muscle_3d_map: ['biceps_brachii'] },
  // TRÍCEPS
  { name: 'Press Francés con Barra', muscle_group: 'triceps', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Tríceps (cabeza larga)'], muscle_3d_map: ['triceps_largo', 'triceps_lateral'], tips: 'Mantén los codos apuntando al techo durante todo el movimiento.' },
  { name: 'Extensión en Polea Alta', muscle_group: 'triceps', equipment_type: 'cable', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Tríceps Lateral'], muscle_3d_map: ['triceps_lateral', 'triceps_medial'] },
  { name: 'Fondos en Paralelas (Tríceps)', muscle_group: 'triceps', equipment_type: 'peso_corporal', environment: 'ambos', level: 'intermedio', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Tríceps'], muscle_3d_map: ['triceps_largo', 'triceps_lateral'] },
  { name: 'Patada de Tríceps con Mancuerna', muscle_group: 'triceps', equipment_type: 'mancuernas', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3', reps_range: '12-15', primary_muscles: ['Tríceps Lateral'], muscle_3d_map: ['triceps_lateral', 'triceps_medial'] },
  // CUÁDRICEPS
  { name: 'Sentadilla con Barra', muscle_group: 'cuadriceps', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-5', reps_range: '5-12', primary_muscles: ['Cuádriceps', 'Glúteos'], secondary_muscles: ['Isquiotibiales', 'Core'], muscle_3d_map: ['recto_femoral', 'vasto_lateral', 'vasto_medial'], secondary_muscles_3d: ['gluteo_mayor'], tips: 'Mantén el pecho arriba y las rodillas en línea con los pies.' },
  { name: 'Prensa de Piernas', muscle_group: 'cuadriceps', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Cuádriceps'], muscle_3d_map: ['recto_femoral', 'vasto_lateral', 'vasto_medial'] },
  { name: 'Extensión de Piernas en Máquina', muscle_group: 'cuadriceps', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Cuádriceps'], muscle_3d_map: ['recto_femoral', 'vasto_lateral'] },
  { name: 'Zancada con Mancuernas', muscle_group: 'cuadriceps', equipment_type: 'mancuernas', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '12-15', primary_muscles: ['Cuádriceps', 'Glúteos'], muscle_3d_map: ['recto_femoral', 'gluteo_mayor'] },
  // GLÚTEOS/ISQUIOS
  { name: 'Hip Thrust con Barra', muscle_group: 'gluteos_isquios', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '2-2-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Glúteo Mayor'], muscle_3d_map: ['gluteo_mayor', 'gluteo_medio'], tips: 'Aprieta el glúteo al máximo en la posición superior.' },
  { name: 'Curl Femoral en Máquina', muscle_group: 'gluteos_isquios', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '12-15', primary_muscles: ['Isquiotibiales'], muscle_3d_map: ['biceps_femoral', 'semitendinoso'] },
  { name: 'Peso Muerto Rumano', muscle_group: 'gluteos_isquios', equipment_type: 'barra', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3-4', reps_range: '8-12', primary_muscles: ['Isquiotibiales', 'Glúteos'], muscle_3d_map: ['biceps_femoral', 'gluteo_mayor'], tips: 'Empuja las caderas hacia atrás, no la espalda hacia abajo.' },
  // PANTORRILLAS
  { name: 'Elevación de Talones de Pie', muscle_group: 'pantorrillas', equipment_type: 'peso_corporal', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '20-30', primary_muscles: ['Gastrocnemio', 'Sóleo'], muscle_3d_map: ['gastrocnemio', 'soleo'] },
  { name: 'Elevación de Talones Sentado', muscle_group: 'pantorrillas', equipment_type: 'maquina', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-1', sets_range: '3-4', reps_range: '15-25', primary_muscles: ['Sóleo'], muscle_3d_map: ['soleo'] },
  // CORE
  { name: 'Plancha Frontal', muscle_group: 'core', equipment_type: 'peso_corporal', environment: 'ambos', level: 'principiante', metric_type: 'hold_time', tempo: '0-0-0-0', sets_range: '3-4', reps_range: '30-60 seg', primary_muscles: ['Recto Abdominal', 'Transverso'], muscle_3d_map: ['recto_abdominal', 'transverso'] },
  { name: 'Crunch Abdominal', muscle_group: 'core', equipment_type: 'peso_corporal', environment: 'ambos', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '15-25', primary_muscles: ['Recto Abdominal'], muscle_3d_map: ['recto_abdominal'] },
  { name: 'Rueda Abdominal', muscle_group: 'core', equipment_type: 'peso_corporal', environment: 'ambos', level: 'avanzado', metric_type: 'weight_reps', tempo: '3-1-2-0', sets_range: '3', reps_range: '8-15', primary_muscles: ['Recto Abdominal', 'Transverso'], muscle_3d_map: ['recto_abdominal', 'transverso', 'oblicuo_externo'] },
  { name: 'Elevación de Piernas Colgado', muscle_group: 'core', equipment_type: 'peso_corporal', environment: 'gym', level: 'intermedio', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3-4', reps_range: '10-15', primary_muscles: ['Recto Abdominal (bajo)'], muscle_3d_map: ['recto_abdominal'] },
  // ANTEBRAZOS
  { name: 'Curl de Muñeca con Barra', muscle_group: 'antebrazos', equipment_type: 'barra', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '15-20', primary_muscles: ['Flexores del Antebrazo'], muscle_3d_map: ['flexores_antebrazo'] },
  { name: 'Extensión de Muñeca con Barra', muscle_group: 'antebrazos', equipment_type: 'barra', environment: 'gym', level: 'principiante', metric_type: 'weight_reps', tempo: '2-1-2-0', sets_range: '3', reps_range: '15-20', primary_muscles: ['Extensores del Antebrazo'], muscle_3d_map: ['extensores_antebrazo'] },
];